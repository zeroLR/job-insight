import React, { useState } from 'react';
import {
  Building2,
  Briefcase,
  Link as LinkIcon,
  TrendingUp,
  Newspaper,
  Target,
  Award,
  Search,
  Globe,
} from 'lucide-react';
import { Card } from '../components/Card';
import { useJobAnalysis } from '../hooks/useJobAnalysis';

export const Home: React.FC = () => {
  const { analyze, loading, loadingText } = useJobAnalysis();
  const [formData, setFormData] = useState({
    company: '',
    title: '',
    link: '',
    country: '台灣',
  });

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.title) return;

    analyze(formData.company, formData.title, formData.country, formData.link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <Search className="absolute inset-0 m-auto text-blue-600 w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          正在分析 {formData.company}
        </h2>
        <p className="text-slate-500 font-medium animate-pulse">
          {loadingText}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
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
          免責聲明：本服務使用 AI 技術自動蒐集與分析網路公開資訊，內容僅供參考。
        </p>
        <p>
          分析結果可能包含不準確或過時的資訊，請使用者自行查證，本服務不對求職結果負任何責任。
        </p>
      </div>
    </div>
  );
};
