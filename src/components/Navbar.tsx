import React from 'react';
import { Search, Key } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSetApiKey = () => {
    if (!user) {
      showToast('請先登入', 'error');
      navigate('/login');
      return;
    }
    navigate('/setup-key');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('已登出', 'success');
      navigate('/login');
    } catch (error) {
      console.error(error);
      showToast('登出失敗', 'error');
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Search className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">
            JobInsight<span className="text-blue-600">.Pro</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={handleSetApiKey}
                className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                title="設定 API Key"
              >
                <Key className="w-4 h-4" />
                <span className="hidden sm:inline">API Key</span>
              </button>
              <Link
                to="/report-list"
                className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                分析報告
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="flex flex-col items-start hidden sm:block">
                  <span className="text-xs font-medium text-slate-700">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                title="登出"
              >
                登出
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              登入
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
