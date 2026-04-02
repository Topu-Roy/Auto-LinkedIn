/**
 * AES-GCM encryption/decryption using Web Crypto API.
 * Works in both browser and Convex V8 runtime.
 */

const ALGORITHM = "AES-GCM"
const IV_LENGTH = 12
const SALT_LENGTH = 16

/**
 * Derives a CryptoKey from the ENCRYPTION_KEY environment variable using PBKDF2.
 *
 * @returns CryptoKey for AES-GCM encryption
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  const secret = process.env.ENCRYPTION_KEY
  if (!secret) {
    throw new Error("ENCRYPTION_KEY environment variable is not set")
  }

  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(secret), "PBKDF2", false, ["deriveKey"])

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("linkedin-token-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

/**
 * Encrypts a string using AES-256-GCM.
 * Returns a base64-encoded string containing: salt:iv:ciphertext
 *
 * @param text - The plaintext to encrypt
 * @returns Base64-encoded encrypted string
 */
export async function encrypt(text: string): Promise<string> {
  const key = await getEncryptionKey()
  const encoder = new TextEncoder()

  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

  const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoder.encode(text))

  const encryptedBytes = new Uint8Array(encrypted)
  const combined = new Uint8Array(salt.length + iv.length + encryptedBytes.length)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(encryptedBytes, salt.length + iv.length)

  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypts a string that was encrypted with the encrypt function.
 *
 * @param encryptedText - The base64-encoded encrypted string
 * @returns The decrypted plaintext
 */
export async function decrypt(encryptedText: string): Promise<string> {
  const key = await getEncryptionKey()

  const combined = new Uint8Array(
    atob(encryptedText)
      .split("")
      .map(c => c.charCodeAt(0))
  )

  const _salt = combined.subarray(0, SALT_LENGTH)
  void _salt
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const ciphertext = combined.subarray(SALT_LENGTH + IV_LENGTH)

  const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, ciphertext)

  return new TextDecoder().decode(decrypted)
}
