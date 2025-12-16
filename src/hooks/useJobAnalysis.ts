import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAnalysis } from '../services/gemini';
import {
  saveAnalysis,
  getAnalysis,
  getAnalysisRecordById,
} from '../services/db';
import { AnalysisResult } from '../types';
import { useToast } from '../contexts/ToastContext';

interface AnalysisMeta {
  company: string;
  title: string;
  country?: string;
  link?: string;
  model?: string;
}

interface UseJobAnalysisReturn {
  analyze: (
    company: string,
    title: string,
    country?: string,
    link?: string,
    force?: boolean,
    model?: string,
  ) => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  data: AnalysisResult | null;
  meta: AnalysisMeta | null;
  loading: boolean;
  error: string | null;
  loadingText: string;
}

export const useJobAnalysis = (): UseJobAnalysisReturn => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [meta, setMeta] = useState<AnalysisMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState('初始化分析引擎...');

  const fetchById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const record = await getAnalysisRecordById(id);
      if (record) {
        setData(record.data);
        setMeta({
          company: record.company,
          title: record.title,
          country: record.country,
          link: record.link,
          model: record.model,
        });
      } else {
        setError('找不到該分析報告');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '讀取報告失敗';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const analyze = async (
    company: string,
    title: string,
    country: string = '台灣',
    link?: string,
    force: boolean = false,
    model: string = 'gemini-2.5-flash-lite',
  ) => {
    setLoading(true);
    setError(null);
    setData(null);
    setMeta(null);

    // 嘗試從 IndexedDB 獲取快取資料
    if (!force) {
      try {
        const cachedResult = await getAnalysis(company, title, country);
        if (cachedResult && !link) {
          // Note: We don't strictly check model match for cache hit to avoid re-running too often,
          // but if user explicitly changes model, they might expect new result.
          // For now, let's assume cache is valid regardless of model unless force is true.
          setData(cachedResult.data);
          setLoading(false);
          navigate(`/result/${cachedResult.id}`);
          return;
        }
      } catch (err) {
        console.warn('Failed to retrieve from cache:', err);
      }
    }

    // 模擬進度條文字變化，增加使用者體驗
    const steps = [
      '搜尋近期新聞與財報...',
      '分析職缺關鍵字權重...',
      '抓取薪資市場行情...',
      '整合社群論壇評價...',
      '生成面試攻略報告...',
    ];

    let stepIndex = 0;
    setLoadingText(steps[0]);

    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setLoadingText(steps[stepIndex]);
    }, 1500);

    try {
      const result = await generateAnalysis(
        company,
        title,
        country,
        link,
        model,
      );
      setData(result);
      setMeta({ company, title, country, link, model });
      // 儲存結果到 IndexedDB
      const id = await saveAnalysis(
        company,
        title,
        result,
        country,
        link,
        model,
      );
      navigate(`/result/${id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : '發生未知錯誤';
      setError(message);
      showToast(message, 'error');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };
  return { analyze, fetchById, data, meta, loading, error, loadingText };
};
