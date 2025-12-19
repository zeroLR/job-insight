import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Building2,
  Target,
  CheckCircle,
  Newspaper,
  DollarSign,
  BookOpen,
  MessageCircle,
  Box,
  Briefcase,
  Code,
  RefreshCw,
} from 'lucide-react';
import { useJobAnalysis } from '../hooks/useJobAnalysis';
import { useAnalysisTask } from '../contexts/AnalysisTaskContext';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
import { Badge } from '../components/Badge';

export const Result: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { fetchById, data, meta, loading, error, loadingText } =
    useJobAnalysis();
  const { getTask, startAnalysis } = useAnalysisTask();

  useEffect(() => {
    if (id) {
      // First check if this is an active task
      const task = getTask(id);
      if (task && task.status === 'completed' && task.result) {
        // Use result from task
        // We need to set this data somehow - for now fetch from DB
        fetchById(id);
      } else {
        // Fetch from database
        fetchById(id);
      }
    } else {
      navigate('/');
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRegenerate = async () => {
    if (meta) {
      if (window.confirm('確定要重新生成這份報告嗎？這將會消耗 API 用量。')) {
        await startAnalysis(
          meta.company,
          meta.title,
          meta.country || '台灣',
          meta.link,
          meta.model || 'gemini-3-flash',
        );
        navigate('/');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <Search className="absolute inset-0 m-auto text-blue-600 w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          正在讀取分析報告...
        </h2>
        <p className="text-slate-500 font-medium animate-pulse">
          {loadingText}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-red-500 text-xl font-bold mb-4">分析失敗</div>
        <p className="text-slate-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          返回首頁
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            {data.jobTitle}
          </h1>
          <div className="flex items-center gap-3 text-slate-500">
            <span className="flex items-center gap-1">
              <Building2 size={16} /> {data.companyProfile.name}
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>{data.companyProfile.industry}</span>
            {data.companyProfile.website && (
              <>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <a
                  href={data.companyProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  官方網站
                </a>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors"
            title="重新生成報告"
          >
            <RefreshCw size={18} />
            <span className="hidden sm:inline">重新生成</span>
          </button>
          <div className="px-4 py-2 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100 flex flex-col items-end">
            <span className="text-xs font-semibold uppercase tracking-wider">
              輿論好感度
            </span>
            <span className="text-xl font-bold">
              {data.companyProfile.sentiment}/100
            </span>
          </div>
          <div className="px-4 py-2 bg-blue-50 rounded-lg text-blue-700 border border-blue-100 flex flex-col items-end">
            <span className="text-xs font-semibold uppercase tracking-wider">
              成長趨勢
            </span>
            <span className="text-xl font-bold">
              {data.companyProfile.growth}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (Main Analysis) */}
        <div className="md:col-span-2 space-y-6">
          {/* 1. Strategy & Business Model */}
          <Card className="p-6">
            <SectionHeader
              icon={Target}
              title="公司營運與獲利模式分析"
              color="text-rose-600"
            />
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-700 mb-2">核心策略</h4>
                <p className="text-slate-600 leading-relaxed">
                  {data.strategy?.core}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-700 mb-2">
                    獲利來源
                  </h4>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {data.strategy?.revenue?.map((item, i) => (
                      <li key={i}>{item}</li>
                    )) || <li>暫無資料</li>}
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-700 mb-2">
                    未來佈局
                  </h4>
                  <p className="text-slate-600 text-sm">
                    {data.strategy?.future}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. Company Products */}
          <Card className="p-6">
            <SectionHeader
              icon={Box}
              title="公司主要產品詳細分析"
              color="text-indigo-600"
            />
            <div className="space-y-4">
              {data.products?.map((product, index) => (
                <div key={index} className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-700">
                      {product.name}
                    </h4>
                    {product.link && (
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        相關連結
                      </a>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )) || <p className="text-slate-500">暫無產品資料</p>}
            </div>
          </Card>

          {/* 3. Job Details */}
          <Card className="p-6">
            <SectionHeader
              icon={Briefcase}
              title="目標職缺額外資訊"
              color="text-cyan-600"
            />
            <div className="space-y-4">
              <div className="flex gap-4 mb-4">
                <Badge type={data.jobDetails?.remote ? 'success' : 'neutral'}>
                  {data.jobDetails?.remote ? '可遠端' : '不可遠端'}
                </Badge>
                <Badge type={data.jobDetails?.overtime ? 'warning' : 'success'}>
                  {data.jobDetails?.overtime ? '常加班' : '少加班'}
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">主要職責</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  {data.jobDetails?.responsibilities?.map((item, i) => (
                    <li key={i}>{item}</li>
                  )) || <li>暫無資料</li>}
                </ul>
              </div>
            </div>
          </Card>

          {/* 2. Preparation & Advice */}
          <Card className="p-6">
            <SectionHeader
              icon={CheckCircle}
              title="求職者準備指南"
              color="text-emerald-600"
            />
            <div className="space-y-4">
              {data.advice?.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                    <p className="text-slate-600 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              )) || <p className="text-slate-500">暫無建議資料</p>}
            </div>
          </Card>

          {/* 3. News */}
          <Card className="p-6">
            <SectionHeader
              icon={Newspaper}
              title="相關新聞與動態"
              color="text-blue-600"
            />
            <div className="divide-y divide-slate-100">
              {data.marketData?.news?.map((news, i) => (
                <div key={i} className="py-3 flex justify-between items-start">
                  <div>
                    {news.link ? (
                      <a
                        href={news.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-slate-800 hover:text-blue-600 cursor-pointer block"
                      >
                        {news.title}
                      </a>
                    ) : (
                      <p className="font-medium text-slate-800">{news.title}</p>
                    )}
                    <div className="flex gap-2 text-xs text-slate-400 mt-1">
                      <span>{news.source}</span>
                      <span>•</span>
                      <span>{news.date}</span>
                    </div>
                  </div>
                  <Badge
                    type={
                      news.type === 'positive'
                        ? 'success'
                        : news.type === 'negative'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {news.type === 'positive'
                      ? '正面'
                      : news.type === 'negative'
                      ? '負面'
                      : '中立'}
                  </Badge>
                </div>
              )) || <p className="text-slate-500">暫無新聞資料</p>}
            </div>
          </Card>
        </div>

        {/* Right Column (Data & Skills) */}
        <div className="space-y-6">
          {/* 1. Salary */}
          <Card className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none">
            <div className="flex items-center gap-2 mb-4 opacity-90">
              <DollarSign size={20} />
              <h3 className="font-bold">薪資估算</h3>
            </div>
            <div className="text-center py-2">
              <p className="text-indigo-200 text-sm mb-1">平均年薪</p>
              <div className="text-4xl font-extrabold tracking-tight">
                {data.marketData?.salaryRange?.avg}{' '}
                <span className="text-xl font-medium"></span>
              </div>
              <div className="w-full bg-indigo-800/50 h-2 rounded-full mt-4 mb-2 relative">
                <div
                  className="absolute top-0 bottom-0 bg-white/30 rounded-full"
                  style={{ left: '20%', right: '20%' }}
                ></div>
                <div className="absolute w-2 h-4 bg-white rounded-full top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 shadow-lg"></div>
              </div>
              <div className="flex justify-between text-xs text-indigo-200 px-2">
                <span>{data.marketData?.salaryRange?.min}</span>
                <span>{data.marketData?.salaryRange?.max}</span>
              </div>
              <p className="text-xs text-indigo-300 mt-4 text-right">
                {data.marketData?.salaryRange?.currency}
              </p>
            </div>
          </Card>

          {/* 2. Skills */}
          <Card className="p-6">
            <SectionHeader
              icon={BookOpen}
              title="重點技能分析"
              color="text-violet-600"
            />

            <div className="mb-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Hard Skills (硬實力)
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.skills?.hard?.map((skill, i) => (
                  <Badge key={i} type="primary">
                    {skill}
                  </Badge>
                )) || <p className="text-slate-500 text-sm">暫無資料</p>}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Soft Skills (軟實力)
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.skills?.soft?.map((skill, i) => (
                  <Badge key={i} type="neutral">
                    {skill}
                  </Badge>
                )) || <p className="text-slate-500 text-sm">暫無資料</p>}
              </div>
            </div>
          </Card>

          {/* 3. Whiteboard Challenge */}
          {data.whiteboard && data.whiteboard.length > 0 && (
            <Card className="p-6">
              <SectionHeader
                icon={Code}
                title="白板題推薦"
                color="text-pink-600"
              />
              <div className="space-y-4">
                {data.whiteboard.map((challenge, index) => (
                  <div key={index} className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-slate-700">
                        {challenge.title}
                      </h4>
                      <Badge
                        type={
                          challenge.difficulty === 'Easy'
                            ? 'success'
                            : challenge.difficulty === 'Medium'
                            ? 'warning'
                            : 'error'
                        }
                      >
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-sm">
                      {challenge.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 3. Discussions */}
          <Card className="p-6">
            <SectionHeader
              icon={MessageCircle}
              title="社群討論重點"
              color="text-amber-600"
            />
            <div className="space-y-4">
              {data.marketData?.discussions?.map((d, i) => (
                <div
                  key={i}
                  className="bg-amber-50/50 p-3 rounded-lg border border-amber-100/50"
                >
                  <div className="flex justify-between items-center mb-1">
                    {d.link ? (
                      <a
                        href={d.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-slate-700 text-sm hover:text-amber-600 hover:underline"
                      >
                        {d.topic}
                      </a>
                    ) : (
                      <span className="font-bold text-slate-700 text-sm">
                        {d.topic}
                      </span>
                    )}
                    <div className="flex items-center text-amber-500 text-xs font-bold">
                      ★ {d.score}
                    </div>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    "{d.comment}"
                  </p>
                </div>
              )) || <p className="text-slate-500">暫無討論資料</p>}
            </div>
          </Card>

          <div className="bg-slate-100 rounded-lg p-4 text-xs text-slate-400 leading-relaxed">
            <p>
              免責聲明：本報告由 AI
              模擬分析生成，數據僅供演示參考，不代表該公司真實即時狀況。真實求職請以官方公告為準。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
