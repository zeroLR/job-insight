import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  Link as LinkIcon,
  TrendingUp,
  Newspaper,
  Target,
  Award,
  Globe,
  Cpu,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../components/Card';
import { TaskList } from '../components/TaskList';
import { UnlockPrompt } from '../components/UnlockPrompt';
import { useMasterPassword } from '../contexts/MasterPasswordContext';
import { useAuth } from '../contexts/AuthContext';
import { useAnalysisTask } from '../contexts/AnalysisTaskContext';
import { useToast } from '../contexts/ToastContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { hasMasterPassword } = useMasterPassword();
  const { hasApiKey } = useAuth();
  const { startAnalysis, tasks } = useAnalysisTask();
  const { showToast } = useToast();
  const [showUnlock, setShowUnlock] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    title: '',
    link: '',
    country: '台灣',
    model: 'gemini-3-flash',
  });

  // Check if there are any tasks to show
  const hasTasks = tasks.length > 0;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.title) return;

    if (!hasMasterPassword) {
      setShowUnlock(true);
      return;
    }

    const taskId = await startAnalysis(
      formData.company,
      formData.title,
      formData.country,
      formData.link,
      formData.model,
    );

    if (taskId) {
      showToast('分析已啟動，您可以繼續瀏覽其他頁面', 'success');
      // Clear form
      setFormData({
        company: '',
        title: '',
        link: '',
        country: '台灣',
        model: 'gemini-3-flash',
      });
    }
  };

  const handleUnlockSuccess = () => {
    setShowUnlock(false);
  };

  useEffect(() => {
    console.log('hasApiKey', hasApiKey);
    console.log('hasMasterPassword', hasMasterPassword);
  }, []);

  return (
    <>
      {showUnlock && <UnlockPrompt onUnlock={handleUnlockSuccess} />}
      {/* Main content container - shifts left when tasks exist on large screens */}
      <div
        className={`mt-10 px-4 transition-all duration-300 ${
          hasTasks ? '' : ''
        }`}
      >
        <div className="max-w-2xl mx-auto">
          {!hasMasterPassword && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">
                    請解鎖保險箱密碼
                  </h3>
                  <p className="text-sm text-amber-800 mb-3">
                    您的瀏覽器會話已過期。請重新輸入保險箱密碼以繼續使用分析功能。
                  </p>
                  <button
                    onClick={() => navigate('/setup-key')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    前往解鎖
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
              全方位職缺智能分析
            </h1>
            <p className="text-lg text-slate-600">
              輸入目標職缺，AI 將為您分析公司策略、薪資行情與面試必勝關鍵。
            </p>
          </div>

          <Card className="p-8 shadow-lg border-blue-100/50">
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  公司名稱
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    placeholder="例如：Google, 台積電, 星巴克"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  職缺名稱
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    placeholder="例如：資深前端工程師, 行銷經理"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  國家/地區
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                  <select
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  >
                    <option value="台灣">台灣</option>
                    <option value="美國">美國</option>
                    <option value="日本">日本</option>
                    <option value="新加坡">新加坡</option>
                    <option value="中國">中國</option>
                    <option value="香港">香港</option>
                    <option value="英國">英國</option>
                    <option value="澳洲">澳洲</option>
                    <option value="加拿大">加拿大</option>
                    <option value="德國">德國</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  職缺連結 (選填)
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                  <input
                    type="url"
                    placeholder="https://104.com.tw/job/..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  AI 模型
                </label>
                <div className="relative">
                  <Cpu className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                  <select
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                  >
                    <option value="gemini-3-flash">
                      Gemini 3 Flash (平衡)
                    </option>
                    <option value="gemini-2.5-flash-lite">
                      Gemini 2.5 Flash Lite (快速)
                    </option>
                    <option value="gemini-2.5-flash">
                      Gemini 2.5 Flash (平衡)
                    </option>
                    <option value="gemini-robotics-er-1.5-preview">
                      Gemini Robotics ER 1.5 Preview (實驗性)
                    </option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
              >
                <TrendingUp className="w-5 h-5" />
                開始分析
              </button>
            </form>
          </Card>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center text-slate-500 text-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <Newspaper className="w-5 h-5 text-indigo-500" />
              </div>
              <span>輿情新聞分析</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <Target className="w-5 h-5 text-rose-500" />
              </div>
              <span>營運策略洞察</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <Award className="w-5 h-5 text-emerald-500" />
              </div>
              <span>關鍵技能預測</span>
            </div>
          </div>

          <div className="mt-12 text-center text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            <p>
              免責聲明：本服務使用 AI
              技術自動蒐集與分析網路公開資訊，內容僅供參考。
            </p>
            <p>
              分析結果可能包含不準確或過時的資訊，請使用者自行查證，本服務不對求職結果負任何責任。
            </p>
          </div>
        </div>
      </div>
      {/* Floating Task List - only visible when tasks exist, positioned on the right on large screens */}
      {hasTasks && (
        <div className="fixed right-4 top-24 w-80 z-40 hidden lg:block">
          <TaskList />
        </div>
      )}
      {/* Mobile Task List - always show on mobile if tasks exist */}
      {hasTasks && (
        <div className="mt-6 px-4 lg:hidden">
          <TaskList />
        </div>
      )}{' '}
    </>
  );
};
