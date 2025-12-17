/**
 * Analysis Task Manager Context
 * Manages background analysis tasks using Web Workers
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { ref, set, get } from 'firebase/database';
import { rtdb } from '../services/firebase';
import { useAuth } from './AuthContext';
import { useMasterPassword } from './MasterPasswordContext';
import { useToast } from './ToastContext';
import { decryptText } from '../utils/crypto';
import { AnalysisResult } from '../types';

export interface AnalysisTask {
  id: string;
  company: string;
  title: string;
  country: string;
  link?: string;
  model: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  progressText: string;
  result?: AnalysisResult;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

interface AnalysisTaskContextValue {
  tasks: AnalysisTask[];
  startAnalysis: (
    company: string,
    title: string,
    country: string,
    link?: string,
    model?: string,
  ) => Promise<string | null>;
  removeTask: (taskId: string) => void;
  getTask: (taskId: string) => AnalysisTask | undefined;
}

const AnalysisTaskContext = createContext<AnalysisTaskContextValue | undefined>(
  undefined,
);

// Store tasks in localStorage for persistence
const STORAGE_KEY = 'jobinsight_analysis_tasks';

const loadTasksFromStorage = (): AnalysisTask[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load tasks from storage:', error);
  }
  return [];
};

const saveTasksToStorage = (tasks: AnalysisTask[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to storage:', error);
  }
};

export const AnalysisTaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { masterPassword } = useMasterPassword();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<AnalysisTask[]>([]);
  const [worker, setWorker] = useState<Worker | null>(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const storedTasks = loadTasksFromStorage();
    setTasks(storedTasks);
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // Initialize worker
  useEffect(() => {
    const analysisWorker = new Worker(
      new URL('../workers/analysis.worker.ts', import.meta.url),
      { type: 'module' },
    );

    analysisWorker.onmessage = (
      event: MessageEvent<{
        type: string;
        taskId: string;
        step?: string;
        progress?: number;
        result?: AnalysisResult;
        error?: string;
      }>,
    ) => {
      const { type, taskId, step, progress, result, error } = event.data;

      if (type === 'PROGRESS') {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: 'processing',
                  progress: progress || 0,
                  progressText: step || '',
                }
              : task,
          ),
        );
      } else if (type === 'RESULT' && result) {
        setTasks((prev) => {
          const updatedTasks = prev.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: 'completed' as const,
                  progress: 100,
                  progressText: '完成！',
                  result,
                  completedAt: Date.now(),
                }
              : task,
          );

          // Find the completed task and save to Firebase
          const completedTask = updatedTasks.find((t) => t.id === taskId);
          if (completedTask && user) {
            const timestamp = Date.now();
            set(ref(rtdb, `users/${user.uid}/reports/${taskId}`), {
              id: taskId,
              company: completedTask.company,
              title: completedTask.title,
              country: completedTask.country,
              link: completedTask.link || '',
              model: completedTask.model,
              data: result,
              timestamp,
            }).catch((err) => {
              console.error('Failed to save report:', err);
            });

            // Show toast notification
            showToast(
              `分析完成：${completedTask.company} - ${completedTask.title}`,
              'success',
            );
          }

          return updatedTasks;
        });
      } else if (type === 'ERROR' && error) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: 'error',
                  error,
                  progressText: '分析失敗',
                }
              : task,
          ),
        );

        showToast(`分析失敗：${error}`, 'error');
      }
    };

    setWorker(analysisWorker);

    return () => {
      analysisWorker.terminate();
    };
  }, [user, showToast]); // Remove tasks from dependencies

  const startAnalysis = useCallback(
    async (
      company: string,
      title: string,
      country: string = '台灣',
      link?: string,
      model: string = 'gemini-3-flash',
    ): Promise<string | null> => {
      if (!user) {
        showToast('請先登入', 'error');
        return null;
      }

      if (!masterPassword) {
        showToast('請先解鎖保險箱', 'error');
        return null;
      }

      try {
        // Fetch and decrypt API key
        const snapshot = await get(ref(rtdb, `users/${user.uid}/apiKey`));
        if (!snapshot.exists()) {
          showToast('找不到 API Key，請先設定', 'error');
          return null;
        }

        const encryptedApiKey = snapshot.val() as string;
        let decryptedApiKey: string;

        try {
          decryptedApiKey = await decryptText(encryptedApiKey, masterPassword);
        } catch {
          showToast('保險箱密碼錯誤，請重新輸入', 'error');
          return null;
        }

        // Create new task
        const taskId = `task_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 9)}`;
        const newTask: AnalysisTask = {
          id: taskId,
          company,
          title,
          country,
          link,
          model,
          status: 'pending',
          progress: 0,
          progressText: '準備開始...',
          createdAt: Date.now(),
        };

        setTasks((prev) => [newTask, ...prev]);

        // Start worker
        if (worker) {
          worker.postMessage({
            type: 'START_ANALYSIS',
            payload: {
              taskId,
              company,
              jobTitle: title,
              apiKey: decryptedApiKey,
              country,
              link,
              model,
            },
          });
        }

        return taskId;
      } catch (error) {
        console.error('Failed to start analysis:', error);
        showToast('啟動分析失敗', 'error');
        return null;
      }
    },
    [user, masterPassword, worker, showToast],
  );

  const removeTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  const getTask = useCallback(
    (taskId: string) => {
      return tasks.find((task) => task.id === taskId);
    },
    [tasks],
  );

  const value = useMemo(
    () => ({
      tasks,
      startAnalysis,
      removeTask,
      getTask,
    }),
    [tasks, startAnalysis, removeTask, getTask],
  );

  return (
    <AnalysisTaskContext.Provider value={value}>
      {children}
    </AnalysisTaskContext.Provider>
  );
};

export const useAnalysisTask = () => {
  const ctx = useContext(AnalysisTaskContext);
  if (!ctx) {
    throw new Error('useAnalysisTask must be used within AnalysisTaskProvider');
  }
  return ctx;
};
