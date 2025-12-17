import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { Navigate, useLocation } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { auth, rtdb } from '../services/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  hasApiKey: boolean | null;
  checkApiKey: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  const checkApiKey = async () => {
    if (!user) {
      setHasApiKey(null);
      return;
    }
    try {
      const snapshot = await get(ref(rtdb, `users/${user.uid}/apiKey`));
      setHasApiKey(snapshot.exists());
    } catch (error) {
      console.error('Failed to check API key:', error);
      setHasApiKey(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        await checkApiKey();
      } else {
        setHasApiKey(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(
    () => ({ user, loading, hasApiKey, checkApiKey }),
    [user, loading, hasApiKey],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

export const RequireAuth: React.FC<{
  children: React.ReactNode;
  requireApiKey?: boolean;
}> = ({ children, requireApiKey = false }) => {
  const { user, loading, hasApiKey } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireApiKey && hasApiKey === false) {
    return <Navigate to="/setup-key" replace />;
  }

  return <>{children}</>;
};
