/**
 * TaskList Component
 * Displays running and completed analysis tasks
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Loader2, X, Eye } from 'lucide-react';
import { useAnalysisTask, AnalysisTask } from '../contexts/AnalysisTaskContext';
import { Card } from './Card';

export const TaskList: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, removeTask } = useAnalysisTask();

  const handleViewResult = (task: AnalysisTask) => {
    if (task.status === 'completed') {
      navigate(`/result/${task.id}`);
    }
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">
        分析任務 ({tasks.length})
      </h3>
      {tasks.map((task) => (
        <Card
          key={task.id}
          className="p-4 shadow-sm border-slate-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Status Icon */}
              <div className="flex items-center gap-2 mb-2">
                {task.status === 'processing' && (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                )}
                {task.status === 'completed' && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
                {task.status === 'error' && (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                {task.status === 'pending' && (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
                <span
                  className={`text-xs font-medium ${
                    task.status === 'processing'
                      ? 'text-blue-600'
                      : task.status === 'completed'
                      ? 'text-green-600'
                      : task.status === 'error'
                      ? 'text-red-600'
                      : 'text-slate-500'
                  }`}
                >
                  {task.status === 'processing'
                    ? '處理中'
                    : task.status === 'completed'
                    ? '完成'
                    : task.status === 'error'
                    ? '失敗'
                    : '等待中'}
                </span>
              </div>

              {/* Task Info */}
              <h4 className="font-semibold text-slate-900 text-sm mb-1 truncate">
                {task.company} - {task.title}
              </h4>
              <p className="text-xs text-slate-500 mb-2">
                {task.country} · {task.model}
              </p>

              {/* Progress Bar */}
              {task.status === 'processing' && (
                <>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">{task.progressText}</p>
                </>
              )}

              {/* Error Message */}
              {task.status === 'error' && task.error && (
                <p className="text-xs text-red-600 mt-1">{task.error}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {task.status === 'completed' && (
                <button
                  onClick={() => handleViewResult(task)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="查看結果"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => removeTask(task.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="移除任務"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
