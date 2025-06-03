'use server'
import { z } from 'zod'
import { isValidPrivateKey } from '@/app/admin/(internal)/addresses/import/utils'
import { getCurrentUserIdentity } from '@/lib/utils/actions'
import { CreateKey, KeyState } from '@/db/schema'
import { DirectSecp256k1Wallet } from '@cosmjs/proto-signing'
import { insertMany, listKeysWithPk, listPrivateKeysByAddressGroup } from '@/lib/dal/keys'
import { getApplicationSettings } from '@/actions/ApplicationSettings'

export async function ListKeys() {
  await validateUserSignedInIsTheOwner()

  return await listKeysWithPk()
}

const KeysSchema = z.array(z.string().refine(isValidPrivateKey))

export async function ImportKeys(keys: string[], addressGroupId: number) {
  await validateUserSignedInIsTheOwner()

  const validatedKeys = KeysSchema.parse(keys)

  const keysToInsert: Array<CreateKey> = await Promise.all(validatedKeys.map(key => {
    return DirectSecp256k1Wallet.fromKey(Buffer.from(key, 'hex'), 'pokt').then(
      (wallet) => wallet.getAccounts()
    ).then(([account]) => {
      if (!account) {
        throw new Error('Failed to get account from key')
      }

      return {
        publicKey: Buffer.from(account.pubkey).toString('hex'),
        privateKey: key,
        address: account.address,
        addressGroupId,
        // right now we are marking it as available, but we must make a provider workflow to
        // check the imported keys and then mark them as available, staked, etc.
        state: KeyState.Available,
        createdAt: new Date(),
      }
    })
  }))

  await insertMany(keysToInsert)
}

export async function ExportKeys(addressGroupId: number) {
  await validateUserSignedInIsTheOwner()

  return await listPrivateKeysByAddressGroup(addressGroupId)
}

export async function validateUserSignedInIsTheOwner() {
  const [identity,appSettings] = await Promise.all([
    getCurrentUserIdentity(),
    getApplicationSettings()
  ]);

  if (identity !== appSettings.ownerIdentity) {
    throw new Error('Unauthorized')
  }
}
