import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import { AnalysisResult } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useMasterPassword } from '../contexts/MasterPasswordContext';
import { getUserReportById } from '../services/reports';
import { rtdb } from '../services/firebase';
import { decryptText } from '../utils/crypto';
import { generateAnalysisWithGenAI } from '../services/genai';

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
  const { user } = useAuth();
  const { masterPassword } = useMasterPassword();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [meta, setMeta] = useState<AnalysisMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState('初始化分析引擎...');

  const fetchById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!user) {
        throw new Error('請先登入');
      }

      const record = await getUserReportById(user.uid, id);
      if (record) {
        setData(record.data);
        setMeta({
          company: record.company,
          title: record.title,
          country: record.country,
          link: record.link || undefined,
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

    if (!user) {
      setLoading(false);
      navigate('/login');
      return;
    }

    if (!masterPassword) {
      setLoading(false);
      showToast('請先解鎖保險箱', 'error');
      return;
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
      // 從 RTDB 讀取加密的 API Key
      const snapshot = await get(ref(rtdb, `users/${user.uid}/apiKey`));
      if (!snapshot.exists()) {
        throw new Error('找不到 API Key，請先設定');
      }

      const encryptedApiKey = snapshot.val() as string;

      // 解密 API Key
      let decryptedApiKey: string;
      try {
        decryptedApiKey = await decryptText(encryptedApiKey, masterPassword);
      } catch {
        throw new Error('保險箱密碼錯誤，請重新輸入');
      }

      if (!force) {
        // placeholder: server-side caching could be added later
      }

      // 使用前端 GenAI 生成分析報告
      const analysisResult = await generateAnalysisWithGenAI({
        company,
        jobTitle: title,
        apiKey: decryptedApiKey,
        country,
        link,
        model,
      });

      // 生成報告 ID 並存儲到 RTDB
      const reportId = crypto.randomUUID();
      const timestamp = Date.now();

      await set(ref(rtdb, `users/${user.uid}/reports/${reportId}`), {
        id: reportId,
        company,
        title,
        country,
        link: link || null,
        model,
        data: analysisResult,
        timestamp,
      });

      setMeta({ company, title, country, link, model });
      navigate(`/result/${reportId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : '發生未知錯誤';
      setError(message);
      showToast(message, 'error');
      if (message.includes('請先登入')) {
        navigate('/login');
      } else if (message.includes('保險箱密碼錯誤')) {
        // Clear incorrect password
        sessionStorage.removeItem('jobinsight_master_password');
      }
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };
  return { analyze, fetchById, data, meta, loading, error, loadingText };
};
