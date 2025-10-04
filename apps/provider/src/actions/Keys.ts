'use server'
import { z } from 'zod'
import { isValidPrivateKey } from '@/app/admin/(internal)/keys/import/utils'
import { getCurrentUserIdentity } from '@/lib/utils/actions'
import type { InsertKey } from '@igniter/db/provider/schema'
import { KeyState } from '@igniter/db/provider/enums'
import { DirectSecp256k1Wallet } from '@cosmjs/proto-signing'
import {
  countPrivateKeysByAddressGroup,
  insertMany,
  listKeysWithPk,
  listPrivateKeysByAddressGroup,
} from '@/lib/dal/keys'
import { GetApplicationSettings } from '@/actions/ApplicationSettings'

export async function ListKeys() {
  await validateUserSignedInIsTheOwner()
  return listKeysWithPk()
}

const KeysSchema = z.array(z.string().refine(isValidPrivateKey))

export async function ImportKeys(keys: string[], addressGroupId: number) {
  await validateUserSignedInIsTheOwner()

  const validatedKeys = KeysSchema.parse(keys)

  const keysToInsert: Array<InsertKey> = await Promise.all(validatedKeys.map(key => {
    return DirectSecp256k1Wallet.fromKey(Buffer.from(key, 'hex'), 'pokt').then(
      (wallet) => wallet.getAccounts(),
    ).then(([account]) => {
      if (!account) {
        throw new Error('Failed to get account from key')
      }

      return {
        publicKey: Buffer.from(account.pubkey).toString('hex'),
        privateKey: key,
        address: account.address,
        addressGroupId,
        // once they
        state: KeyState.Imported,
        createdAt: new Date(),
      }
    })
  }))

  await insertMany(keysToInsert)
}

export async function GetKeysByAddressGroupAndState(addressGroupId: number, keyState?: KeyState) {
  await validateUserSignedInIsTheOwner()
  return listPrivateKeysByAddressGroup(addressGroupId, keyState)
}

export async function CountKeysByAddressGroupAndState(addressGroupId: number, keyState?: KeyState) {
  await validateUserSignedInIsTheOwner()
  return countPrivateKeysByAddressGroup(addressGroupId, keyState)
}

export async function validateUserSignedInIsTheOwner() {
  const [identity, appSettings] = await Promise.all([
    getCurrentUserIdentity(),
    GetApplicationSettings(),
  ])

  if (identity !== appSettings.ownerIdentity) {
    throw new Error('Unauthorized')
  }
}
