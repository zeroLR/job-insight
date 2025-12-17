/**
 * 前端加密工具
 * 使用 PBKDF2 從 Master Password 生成金鑰，並使用 AES-GCM 加密資料
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * 從 Master Password 生成加密金鑰
 */
async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey'],
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * 加密文字
 * @param plaintext 要加密的明文
 * @param masterPassword 用戶的 Master Password
 * @returns Base64 編碼的加密資料（包含 salt 和 iv）
 */
export async function encryptText(
  plaintext: string,
  masterPassword: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // 生成隨機 salt 和 iv
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // 從 Master Password 生成金鑰
  const key = await deriveKey(masterPassword, salt);

  // 加密資料
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data,
  );

  // 組合 salt + iv + encryptedData
  const combined = new Uint8Array(
    salt.length + iv.length + encryptedData.byteLength,
  );
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

  // 轉換為 Base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * 解密文字
 * @param encryptedBase64 Base64 編碼的加密資料
 * @param masterPassword 用戶的 Master Password
 * @returns 解密後的明文
 */
export async function decryptText(
  encryptedBase64: string,
  masterPassword: string,
): Promise<string> {
  // 從 Base64 解碼
  const combined = Uint8Array.from(atob(encryptedBase64), (c) =>
    c.charCodeAt(0),
  );

  // 提取 salt、iv 和加密資料
  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const encryptedData = combined.slice(SALT_LENGTH + IV_LENGTH);

  // 從 Master Password 生成金鑰
  const key = await deriveKey(masterPassword, salt);

  // 解密資料
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData,
  );

  // 轉換為文字
  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}

/**
 * 驗證 Master Password 是否正確
 * 嘗試解密一個已知的加密資料來驗證密碼
 */
export async function verifyMasterPassword(
  encryptedData: string,
  masterPassword: string,
): Promise<boolean> {
  try {
    await decryptText(encryptedData, masterPassword);
    return true;
  } catch {
    return false;
  }
}
