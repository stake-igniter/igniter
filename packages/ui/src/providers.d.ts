import {Provider} from "./context/WalletConnection";

declare global {
    interface Window {
        pocketShannon: Provider;
    }
}
