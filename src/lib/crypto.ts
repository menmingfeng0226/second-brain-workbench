import { getSessionPassword, setSessionPasswordHint } from './auth';

const SALT = new Uint8Array([
  0x6a, 0x2b, 0x4c, 0x8d, 0x1f, 0x9e, 0x3a, 0x5b,
  0x7c, 0x2d, 0x4e, 0x8a, 0x1b, 0x6f, 0x3c, 0x9d,
]);

let cachedKey: CryptoKey | null = null;

function getWebCrypto(): Crypto {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) return globalThis.crypto;
  if (typeof window !== 'undefined' && window.crypto) return window.crypto;
  throw new Error('Web Crypto API is not available in this environment');
}

export async function deriveKey(password: string): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const encoder = new TextEncoder();
  const keyMaterial = await getWebCrypto().subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  cachedKey = await getWebCrypto().subtle.deriveKey(
    { name: 'PBKDF2', salt: SALT, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
  return cachedKey;
}

function b64(buf: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromB64(s: string): Uint8Array {
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function encryptData(data: unknown, password?: string): Promise<string> {
  const key = cachedKey ?? (await deriveKey(password ?? getSessionPassword() ?? 'default-workbench-key-v1'));
  const iv = getWebCrypto().getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const sealed = await getWebCrypto().subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const merged = new Uint8Array(iv.byteLength + sealed.byteLength);
  merged.set(iv, 0);
  merged.set(new Uint8Array(sealed), iv.byteLength);
  return `enc:v1:${b64(merged.buffer)}`;
}

export async function decryptData<T = unknown>(sealed: string, password?: string): Promise<T> {
  if (!sealed.startsWith('enc:v1:')) {
    return JSON.parse(sealed) as T;
  }
  const key = cachedKey ?? (await deriveKey(password ?? getSessionPassword() ?? 'default-workbench-key-v1'));
  const raw = fromB64(sealed.slice(7));
  const iv = raw.slice(0, 12);
  const payload = raw.slice(12);
  const opened = await getWebCrypto().subtle.decrypt({ name: 'AES-GCM', iv }, key, payload);
  const text = new TextDecoder().decode(opened);
  return JSON.parse(text) as T;
}

export function resetCryptoKey(): void {
  cachedKey = null;
}

export async function setCryptoPassword(password: string): Promise<void> {
  await deriveKey(password);
  setSessionPasswordHint(password);
}

export const cryptoUtil = {
  deriveKey,
  encryptData,
  decryptData,
  resetCryptoKey,
  setCryptoPassword,
};

export default cryptoUtil;
