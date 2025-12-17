import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { Github } from 'lucide-react';
import { auth } from '../services/firebase';
import { Card } from '../components/Card';
import { useToast } from '../contexts/ToastContext';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
    />
  </svg>
);

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  const handleLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    try {
      let p;
      if (provider === 'google') {
        p = new GoogleAuthProvider();
        // 強制顯示帳號選擇畫面，允許切換 Google 帳號
        p.setCustomParameters({
          prompt: 'select_account',
        });
      } else {
        p = new GithubAuthProvider();
        p.setCustomParameters({
          allow_signup: 'true',
          prompt: 'select_account',
        });
      }

      const credential = await signInWithPopup(auth, p);
      if (!credential.user) {
        throw new Error('登入失敗');
      }

      showToast('登入成功', 'success');
      // AuthContext will handle redirect after checking API key status
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error(err);
      let message = err instanceof Error ? err.message : '登入失敗';

      // Handle account-exists-with-different-credential error
      if (err?.code === 'auth/account-exists-with-different-credential') {
        message =
          '此 Email 已使用其他登入方式註冊，請使用原本的登入方式（Google 或 GitHub）';
      } else if (err?.code === 'auth/popup-closed-by-user') {
        message = '登入視窗已關閉';
        setLoading(false);
        return; // Don't show error toast for user-cancelled action
      }

      showToast(message, 'error');
      try {
        await signOut(auth);
      } catch {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          登入 JobInsight
        </h1>
        <p className="text-slate-600 mb-4">
          使用 AI 技術全方位分析職缺，為您的求職之路提供深度洞察。
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">開始使用前：</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>選擇 Google 或 GitHub 登入</li>
            <li>登入後需設定 Gemini API Key(建議使用免費 key)</li>
            <li>API Key 將安全儲存於伺服端</li>
          </ul>
        </div>
      </div>

      <Card className="p-8 shadow-lg border-slate-200">
        <div className="space-y-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleLogin('google')}
            className="w-full bg-white hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 font-bold py-3 px-4 border border-slate-200 rounded-lg shadow-sm transition-all flex items-center justify-center gap-3"
          >
            <GoogleIcon />
            使用 Google 帳號登入
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleLogin('github')}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-3"
          >
            <Github className="w-5 h-5" />
            使用 GitHub 帳號登入
          </button>
        </div>
      </Card>
    </div>
  );
};
