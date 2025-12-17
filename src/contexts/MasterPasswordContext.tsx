import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';

interface MasterPasswordContextValue {
  masterPassword: string | null;
  setMasterPassword: (password: string) => void;
  clearMasterPassword: () => void;
  hasMasterPassword: boolean;
}

const MasterPasswordContext = createContext<
  MasterPasswordContextValue | undefined
>(undefined);

const SESSION_KEY = 'jobinsight_master_password';
const SESSION_SALT = 'jobinsight_salt';

// 簡單的混淆加密（使用固定 salt + Base64）
const obfuscate = async (text: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return btoa(text + '::' + hashHex.slice(0, 16));
};

const deobfuscate = (obfuscated: string): string | null => {
  try {
    const decoded = atob(obfuscated);
    const parts = decoded.split('::');
    return parts[0] || null;
  } catch {
    return null;
  }
};

export const MasterPasswordProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [masterPassword, setMasterPasswordState] = useState<string | null>(
    null,
  );

  // 從 sessionStorage 載入並解密
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      const decrypted = deobfuscate(stored);
      if (decrypted) {
        setMasterPasswordState(decrypted);
      }
    }
  }, []);

  const setMasterPassword = async (password: string) => {
    // 生成或獲取 salt
    let salt = sessionStorage.getItem(SESSION_SALT);
    if (!salt) {
      salt = Math.random().toString(36).slice(2);
      sessionStorage.setItem(SESSION_SALT, salt);
    }

    const obfuscated = await obfuscate(password, salt);
    sessionStorage.setItem(SESSION_KEY, obfuscated);
    setMasterPasswordState(password);
  };

  const clearMasterPassword = () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_SALT);
    setMasterPasswordState(null);
  };

  const value = useMemo(
    () => ({
      masterPassword,
      setMasterPassword,
      clearMasterPassword,
      hasMasterPassword: !!masterPassword,
    }),
    [masterPassword],
  );

  return (
    <MasterPasswordContext.Provider value={value}>
      {children}
    </MasterPasswordContext.Provider>
  );
};

export const useMasterPassword = () => {
  const ctx = useContext(MasterPasswordContext);
  if (!ctx) {
    throw new Error(
      'useMasterPassword must be used within MasterPasswordProvider',
    );
  }
  return ctx;
};
