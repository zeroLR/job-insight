import React, { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { Card } from '../components/Card';
import { useMasterPassword } from '../contexts/MasterPasswordContext';

interface UnlockPromptProps {
  onUnlock: () => void;
}

export const UnlockPrompt: React.FC<UnlockPromptProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setMasterPassword } = useMasterPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('請輸入保險箱密碼');
      return;
    }
    // Save to session and trigger parent callback
    setMasterPassword(password);
    onUnlock();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4 p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">解鎖保險箱</h2>
          <p className="text-slate-600">請輸入您的保險箱密碼以繼續使用</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              保險箱密碼
            </label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="輸入密碼"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-all"
          >
            解鎖
          </button>

          <p className="text-xs text-slate-500 text-center">
            保險箱密碼僅存於此裝置，關閉瀏覽器後需重新輸入
          </p>
        </form>
      </Card>
    </div>
  );
};
