import {EncodeObject, GeneratedType, OfflineSigner, Registry} from "@cosmjs/proto-signing";
import {TxRaw} from "../../proto/generated/cosmos/tx/v1beta1/tx";
import {MsgSend} from "../../proto/generated/cosmos/bank/v1beta1/tx";
import {MsgStakeSupplier, MsgUnstakeSupplier} from "../../proto/generated/pocket/supplier/tx";
import { WalletConnection, ProviderInfo, Provider} from "@igniter/ui/context/WalletConnection/index";
import {SigningStargateClient} from "@cosmjs/stargate";
import {SignedMemo, SignedTransaction, TransactionMessage} from "../../lib/models";
import {PubKey} from "../../proto/generated/cosmos/crypto/secp256k1/keys";
import {Coin} from "../../proto/generated/cosmos/base/v1beta1/coin";

export class KeplrWalletConnection implements WalletConnection {
    isConnected = false;
    connectedIdentity?: string;
    connectedIdentities?: string[];
    private _keplr?: any;
    private _chain: any | null = {
        chainId: 'pocket-beta',
        rpc: 'https://shannon-testnet-grove-rpc.beta.poktroll.com',
    };
    private _offlineSigner?: OfflineSigner;
    private _rpcClient?: SigningStargateClient;
    private _provider?: Provider;
    private _registry?: Registry;

    constructor() {
        this._registry = new Registry([
            ["/cosmos.bank.v1beta1.MsgSend", MsgSend as unknown as GeneratedType],
            ["/pocket.supplier.MsgStakeSupplier", MsgStakeSupplier as unknown as GeneratedType],
            ["/pocket.supplier.MsgUnstakeSupplier", MsgUnstakeSupplier as unknown as GeneratedType],
        ]);
    }

    private get keplr() {
        const k = this._keplr ?? (window as any).keplr;
        if (!k) throw new Error("Keplr provider not found. Please install/enable the Keplr extension.");
        this._keplr = k;
        return k;
    }

    private async ensureEnabled(chainId = this._chain.chainId): Promise<void> {
        if (!chainId) throw new Error("No chainId configured.");
        try {
            await this.keplr.enable(chainId); // prompts user if needed
        } catch (e) {
            // If chain not added to Keplr, you can suggest it first:
            // await this.keplr.experimentalSuggestChain(keplrChainInfoFrom(this._chain!));
            // await this.keplr.enable(chainId);
            throw e;
        }
    }

    private async getSigner() {
        if (!this._chain) throw new Error("No chain configured.");
        if (this._offlineSigner) return this._offlineSigner;
        await this.ensureEnabled(this._chain.chainId);
        console.log('getSigner: Retrieving offline signer for chainId: ', this._chain.chainId);
        this._offlineSigner = await this.keplr.getOfflineSignerAuto(this._chain.chainId);
        return this._offlineSigner;
    }

    private async getRpcClient(): Promise<SigningStargateClient> {
        if (this._rpcClient) return this._rpcClient;
        if (!this._chain?.rpc) throw new Error("RPC endpoint missing in chain config.");
        const signer = await this.getSigner();
        console.log('getRpcClient: Retrieving RPC client for chainId: ', this._chain?.chainId);
        this._rpcClient = await SigningStargateClient.connectWithSigner(this._chain.rpc, signer!, { registry: this._registry });
        return this._rpcClient;
    }

    // ---------- WalletConnection API ----------
    connect = async (provider?: Provider): Promise<string[]> => {
        console.log('connect execution started');
        await this.ensureEnabled();
        const key = await this.keplr.getKey(this._chain!.chainId);
        this.connectedIdentity = key.bech32Address;
        this.connectedIdentities = [key.bech32Address];
        this.isConnected = true;
        console.log('connect execution ended with connected identities:', this.connectedIdentities);
        return this.connectedIdentities;
    };

    reconnect = async (address: string): Promise<boolean> => {
        try {
            await this.ensureEnabled();
            const key = await this.keplr.getKey(this._chain!.chainId);
            const ok = key.bech32Address === address;
            if (ok) {
                this.connectedIdentity = address;
                this.connectedIdentities = [address];
                this.isConnected = true;
            }
            return ok;
        } catch {
            return false;
        }
    };

    connectIdentity(address: string) {
        if (this.connectedIdentities?.includes(address)) {
            this.connectedIdentity = address;
        } else {
            throw new Error("Identity not connected");
        }
    }

    clearConnectedIdentity() {
        this.connectedIdentity = undefined;
    }

    getChain = async (): Promise<string> => {
        if (!this._chain) throw new Error("No chain configured.");
        return this._chain.chainId;
    };

    getPublicKey = async (address: string): Promise<string> => {
        await this.ensureEnabled();
        const key = await this.keplr.getKey(this._chain!.chainId);
        if (key.bech32Address !== address) {
            throw new Error("Requested address is not the active Keplr account for this chain.");
        }
        return Buffer.from(key.pubKey).toString("base64");
    };

    getBalance = async (address: string): Promise<number> => {
        const client = await this.getRpcClient();
        const all = await client.getAllBalances(address);
        const stakeDenom = this._chain?.stakeCurrencyDenom;
        const coin = stakeDenom ? all.find(c => c.denom === stakeDenom) : all[0];
        return coin ? Number(coin.amount) : 0;
    };

    switchChain = async (chainId: string): Promise<void> => {
        try {
            await this.keplr.enable(chainId);
        } catch (e) {
            // If chain is unknown, call experimentalSuggestChain with full ChainInfo
            if (this._chain && this._chain.chainId === chainId) {
                // we have local config, try suggest
                // await this.keplr.experimentalSuggestChain(keplrChainInfoFrom(this._chain));
                // await this.keplr.enable(chainId);
            }
            throw e;
        }
        // Reset signer/client cache after switching
        this._rpcClient = undefined;
        // update current chainId in case you support multi-chain instances
        if (this._chain) this._chain.chainId = chainId;
        // refresh active account
        const key = await this.keplr.getKey(chainId);
        this.connectedIdentity = key.bech32Address;
        this.connectedIdentities = [key.bech32Address];
    };

    signMessage = async (message: string, address: string): Promise<string> => {
        await this.ensureEnabled();
        // ADR-36 compliant
        const sig = await this.keplr.signArbitrary(this._chain!.chainId, address, message);
        // Return raw signature base64 (align with your UI’s expectations)
        return sig.signature;
    };

    buildEncodeObjectFromMessage = (message: TransactionMessage): EncodeObject => {
        const { typeUrl, body } = message;
        switch (typeUrl) {
            case "/cosmos.bank.v1beta1.MsgSend":
                return {
                    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
                    value: {
                        ...MsgSend.fromJSON(body),
                        amount: [
                            Coin.fromJSON({
                                amount: body.amount,
                                denom: 'upokt',
                            })
                        ],
                    }
                };
            case "/pocket.supplier.MsgStakeSupplier":
                return {
                    typeUrl: "/pocket.supplier.MsgStakeSupplier",
                    value: {
                        ...MsgStakeSupplier.fromJSON(body),
                        // TODO: Update both the supplier and middleman to align to the correct attribute name for this message.
                        stake: Coin.fromJSON({
                            denom: "upokt",
                            amount: body.stakeAmount,
                        }),
                    }

                }
        }
    }

    /**
     * messages: you’ll pass pre-built Cosmos messages (typeUrl + value) elsewhere in your app.
     * fee: we default to "auto" behavior by estimating via signAndBroadcast's gasPrice if set on client; you can also craft StdFee.
     */
    signTransaction = async (
        messages: Array<TransactionMessage>,
        signer?: string,
        memoObj?: SignedMemo
    ): Promise<SignedTransaction> => {
        console.log('signTransaction: execution started');
        const address = signer ?? this.connectedIdentity ?? "";
        if (!address) throw new Error("No signer address is connected.");

        console.log('signTransaction: Ensuring Keplr is enabled for chainId: ', this._chain?.chainId);
        await this.ensureEnabled(this._chain!.chainId);


        const signerKeplr = await this.getSigner();

        console.log('signTransaction: Retrieving accounts for chainId: ', this._chain?.chainId);
        const [account] = await signerKeplr!.getAccounts();
        if (!account || account.address !== address) {
            throw new Error("Active Keplr account does not match requested signer.");
        }

        console.log('signTransaction: Mapping messages to EncodeObjects');
        const msgs = messages.map(this.buildEncodeObjectFromMessage);

        console.log('signTransaction: Estimating gas for messages');
        const client = await this.getRpcClient();
        const chainId = await client.getChainId();
        console.log('signTransaction: client chainID', chainId);
        console.log('signTransaction: retrieving address sequence', address);
        const { accountNumber, sequence } = await client.getSequence(address);
        console.log('signTransaction: address sequence', sequence);
        console.log('signTransaction: retrieving account pubkey');
        const { pubkey } = account;
        console.log('signTransaction: account pubkey', pubkey);

        const memo = memoObj ? JSON.stringify(memoObj) : "";
        console.log('signTransaction: memo', memo);
        console.log('signTransaction: gas estimation started', address, msgs, memo);
        const gasUsed = await client.simulate(address, msgs, memo);
        console.log('signTransaction: gas estimation ended', gasUsed);

        const gasAdjustment = 2;
        const gasPriceNum = 0.001;        // in micro-denom units (e.g., upokt)
        const feeDenom = "upokt";

        const gas = Math.ceil(gasUsed * gasAdjustment);
        const feeAmount = Math.ceil(gas * gasPriceNum);

        const [{ makeAuthInfoBytes, makeSignDoc }] =
            await Promise.all([
                import("@cosmjs/proto-signing"),
            ]);

        console.log('signTransaction: Creating a custom registry with supported transactions');
        // Register your custom types so the bodyBytes are encoded correctly

        console.log('Encoding transaction bytes');

        // Encode TxBody (messages + memo) → bodyBytes
        // (Registry in recent CosmJS exposes encodeTxBody)

        const bodyBytes = this._registry!.encodeTxBody({ messages: msgs, memo });

        console.log('signTransaction: bodyBytes', bodyBytes);

        const anyPubkey = {
            typeUrl: "/cosmos.crypto.secp256k1.PubKey",
            value: PubKey.encode({ key: account.pubkey }).finish(),
        };

        console.log('signTransaction: Amino Pub Key', anyPubkey);

        console.log('signTransaction: Creating AuthInfo bytes');
        const authInfoBytes = makeAuthInfoBytes(
            [{ pubkey: anyPubkey, sequence }],
            [{ denom: feeDenom, amount: String(feeAmount) }],
            gas,
            undefined,
            address,
        );

        console.log('signTransaction: AuthInfo bytes', authInfoBytes);

        console.log('signTransaction: creating sign doc');
        const signDoc = makeSignDoc(bodyBytes, authInfoBytes, chainId, accountNumber);

        console.log('signTransaction: Requesting signature form keplr');
        const { signed, signature } = await this.keplr.signDirect(this._chain!.chainId, address, signDoc);
        // signature.signature is base64 (r||s). signature.pub_key is included too.

        console.log('signTransaction: signature granted (signed?, signature?)', { signed, signature });

        console.log('signTransaction: Creating raw transaction object');
        // Assemble TxRaw from the returned signed doc + signature (NO broadcast)
        const txRaw: TxRaw = TxRaw.fromPartial({
            bodyBytes: signed.bodyBytes,
            authInfoBytes: signed.authInfoBytes,
            signatures: [Buffer.from(signature.signature, "base64")],
        });

        const txBytes = TxRaw.encode(txRaw).finish();
        const signedHex = Buffer.from(txBytes).toString("hex");
        const signatureHex = Buffer.from(signature.signature, "base64").toString("hex");

        console.log('signTransaction: Raw transaction bytes, hex and signature hex', txBytes, signedHex, signatureHex);

        // Build an "unsigned payload" representation (helpful for debugging/inspection)
        const unsignedPayload = JSON.stringify({
            bodyBytes: Buffer.from(signed.bodyBytes).toString("base64"),
            authInfoBytes: Buffer.from(signed.authInfoBytes).toString("base64"),
            chainId,
            accountNumber: accountNumber.toString(),
            sequence: sequence.toString(),
            fee: { amount: feeAmount, gas },
            memo,
        });

        console.log('signTransaction: unsignedPayload', unsignedPayload);

        // estimatedFee is numeric; we return the micro-denom amount you computed (e.g., upokt micros)
        return {
            address,
            signedPayload: signedHex,     // hex-encoded TxRaw bytes (ready to broadcast later)
            unsignedPayload,              // human-readable JSON with base64 body/authInfo
            estimatedFee: feeAmount,      // number (in micro-denom units)
            signature: signatureHex,      // hex of (r||s)
        };
    };

    getAvailableProviders = async (): Promise<ProviderInfo[]> => {
        const providers: ProviderInfo[] = [];
        const w = window as any;
        if (w.keplr) {
            providers.push({ name: "Keplr", provider: w.keplr });
        }
        if (w.owallet) {
            providers.push({ name: "OWallet (Keplr-compatible)", provider: w.owallet });
        }
        if (w.cosmostation) {
            providers.push({ name: "Cosmostation (Keplr API)", provider: w.cosmostation });
        }
        // Some wallets (Hana) also implement Keplr API surface
        if (w.hanaWallet) {
            providers.push({ name: "Hana (Keplr API)", provider: w.hanaWallet });
        }
        return providers;
    };

    get provider() {
        return this._provider ?? window.pocketShannon;
    }
}
