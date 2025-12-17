import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, set, get, remove } from 'firebase/database';
import { Key, Lock, Shield, RefreshCw } from 'lucide-react';
import { rtdb } from '../services/firebase';
import { Card } from '../components/Card';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useMasterPassword } from '../contexts/MasterPasswordContext';
import { encryptText } from '../utils/crypto';

export const SetupKey: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, checkApiKey } = useAuth();
  const {
    setMasterPassword: saveMasterPassword,
    hasMasterPassword,
    clearMasterPassword,
  } = useMasterPassword();

  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingKeyHint, setExistingKeyHint] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // 檢查是否已有設定的 API Key
  useEffect(() => {
    const checkExistingKey = async () => {
      if (!user) return;
      try {
        const snapshot = await get(ref(rtdb, `users/${user.uid}/apiKeyHint`));
        if (snapshot.exists()) {
          setExistingKeyHint(snapshot.val() as string);
        }
      } catch (error) {
        console.error('Failed to check existing key:', error);
      }
    };
    checkExistingKey();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!masterPassword.trim()) {
      showToast('請填寫保險箱密碼', 'error');
      return;
    }

    // 情況二：僅解鎖保險箱（已有 API Key）
    if (existingKeyHint && !hasMasterPassword && !isResetting) {
      if (masterPassword.length < 8) {
        showToast('保險箱密碼至少需要 8 個字元', 'error');
        return;
      }

      if (!user) {
        showToast('請先登入', 'error');
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        // 僅儲存 Master Password 到 sessionStorage
        await saveMasterPassword(masterPassword);
        showToast('保險箱已解鎖', 'success');
        navigate('/', { replace: true });
      } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : '解鎖失敗';
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 情況一：初次設定（需要密碼確認和 API Key）
    if (!apiKey.trim()) {
      showToast('請填寫所有欄位', 'error');
      return;
    }

    if (masterPassword !== confirmPassword) {
      showToast('保險箱密碼不一致', 'error');
      return;
    }

    if (masterPassword.length < 8) {
      showToast('保險箱密碼至少需要 8 個字元', 'error');
      return;
    }

    if (!user) {
      showToast('請先登入', 'error');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const trimmedKey = apiKey.trim();

      // 使用 Master Password 加密 API Key
      const encryptedApiKey = await encryptText(trimmedKey, masterPassword);

      // 取得後 4 碼
      const last4 = trimmedKey.slice(-4);

      // 儲存到 Realtime Database（加密的 key 和明文後 4 碼）
      await set(ref(rtdb, `users/${user.uid}/apiKey`), encryptedApiKey);
      await set(ref(rtdb, `users/${user.uid}/apiKeyHint`), last4);

      // 儲存 Master Password 到 sessionStorage（已加密）
      await saveMasterPassword(masterPassword);

      showToast('API Key 已安全儲存', 'success');
      await checkApiKey(); // Refresh API key status
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : '設定失敗';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    if (
      !window.confirm(
        '確定要重設保險箱密碼嗎？這將清除當前的加密資料，需要重新設定 API Key。',
      )
    ) {
      return;
    }
    handleReset();
  };

  const handleReset = async () => {
    if (!user) {
      showToast('請先登入', 'error');
      return;
    }

    setLoading(true);
    try {
      // 從 Realtime Database 刪除加密的 API Key 和後 4 碼
      await remove(ref(rtdb, `users/${user.uid}/apiKey`));
      await remove(ref(rtdb, `users/${user.uid}/apiKeyHint`));

      // 清空表單狀態
      setIsResetting(true);
      setExistingKeyHint(null);
      setMasterPassword('');
      setConfirmPassword('');
      setApiKey('');

      // 清除 Master Password
      clearMasterPassword();

      // 更新 API Key 狀態
      await checkApiKey();

      showToast('API Key 已清除，請重新設定', 'success');
    } catch (err) {
      console.error('Failed to reset API Key:', err);
      showToast('重設失敗，請稍後再試', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>

        {/* 情況三：有保險箱密碼且有 API Key */}
        {hasMasterPassword && existingKeyHint && !isResetting ? (
          <>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              保險箱已解鎖
            </h1>
            <p className="text-slate-600">您的 API Key 已安全設定並解密。</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <div className="text-left mb-3">
                <p className="text-sm font-semibold text-green-900 mb-1">
                  已設定的 API Key
                </p>
                <p className="text-green-700 font-mono">
                  ****{existingKeyHint}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-60 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  重設保險箱密碼
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-all"
            >
              返回首頁
            </button>
          </>
        ) : existingKeyHint && !hasMasterPassword && !isResetting ? (
          /* 情況二：無保險箱密碼但有 API Key (重開瀏覽器) */
          <>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              解鎖保險箱
            </h1>
            <p className="text-slate-600">
              請輸入您的保險箱密碼以解密 API Key。
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="text-left mb-3">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  已加密的 API Key
                </p>
                <p className="text-blue-700 font-mono">****{existingKeyHint}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-60 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  重設保險箱密碼
                </button>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4 text-left">
              <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                重要提醒
              </h3>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>保險箱密碼僅存於此裝置，不會上傳至伺服器</li>
                <li>關閉瀏覽器後需重新輸入</li>
                <li>若忘記密碼，請點擊「重設保險箱密碼」重新開始</li>
              </ul>
            </div>
          </>
        ) : (
          /* 情況一：無保險箱密碼且無 API Key (初次設定) */
          <>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              設定保險箱密碼
            </h1>
            <p className="text-slate-600">
              在開始使用前，請先設定一個專屬的保險箱密碼來保護您的 API Key。
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4 text-left">
              <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                重要提醒
              </h3>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>保險箱密碼用於加密您的 API Key</li>
                <li>密碼僅存於此裝置，不會上傳至伺服器</li>
                <li>請務必牢記密碼，無法重置</li>
                <li>關閉瀏覽器後需重新輸入</li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* 情況三：有保險箱且有 API Key，不顯示表單 */}
      {hasMasterPassword && existingKeyHint && !isResetting ? null : (
        <Card className="p-8 shadow-lg border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                保險箱密碼
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="至少 8 個字元"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>

            {/* 情況二：只需要密碼，不需要確認密碼和 API Key */}
            {existingKeyHint && !hasMasterPassword && !isResetting ? (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-md transition-all"
              >
                {loading ? '解鎖中...' : '解鎖保險箱'}
              </button>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    確認密碼
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                    <input
                      type="password"
                      autoComplete="new-password"
                      placeholder="再次輸入密碼"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Gemini API Key
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                    <input
                      type="password"
                      autoComplete="off"
                      placeholder="AIza..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    API Key 將使用保險箱密碼加密後儲存於伺服器，確保安全性。
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    您可以在{' '}
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Google AI Studio
                    </a>{' '}
                    取得免費的 API Key。
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-md transition-all"
                >
                  {loading ? '設定中...' : '完成設定'}
                </button>
              </>
            )}
          </form>
        </Card>
      )}
    </div>
  );
};
