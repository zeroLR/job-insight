import React from 'react';
import { Search, Key } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { saveApiKey } from '../services/db';
import { useToast } from '../contexts/ToastContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { showToast } = useToast();
  const isResultPage = location.pathname.startsWith('/result');

  const handleSetApiKey = async () => {
    const key = window.prompt(
      '請輸入您的 Gemini API Key (將儲存於瀏覽器本地端):',
    );
    if (key) {
      try {
        await saveApiKey(key);
        showToast('API Key 已儲存', 'success');
      } catch (error) {
        console.error(error);
        showToast('儲存失敗', 'error');
      }
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
            結果列表
          </Link>
        </div>
      </div>
    </nav>
  );
};
