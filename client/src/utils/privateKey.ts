import { v4 as uuidv4 } from 'uuid'
import { timestamp } from './logger'

const STORAGE_KEY = 'privateKey'

export function getPrivateKey(): string {
  let privateKey = localStorage.getItem(STORAGE_KEY)
  if (!privateKey) {
    console.log(timestamp(), 'Generating new private key')
    privateKey = uuidv4()
    localStorage.setItem(STORAGE_KEY, privateKey)
  }
  console.debug('Retrieving private key from local storage:', privateKey)
  return privateKey
}
