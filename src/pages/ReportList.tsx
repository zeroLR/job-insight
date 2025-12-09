import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllAnalyses, deleteAnalysis } from '../services/db';
import {
  Calendar,
  ChevronRight,
  MapPin,
  Trash2,
  ChevronLeft,
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface ReportItem {
  id: string;
  company: string;
  title: string;
  country?: string;
  timestamp: number;
}

const ITEMS_PER_PAGE = 10;

export const ReportList: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();

  const fetchReports = async () => {
    try {
      const data = await getAllAnalyses();
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigation
    if (window.confirm('確定要刪除這份報告嗎？')) {
      try {
        await deleteAnalysis(id);
        showToast('報告已刪除', 'success');
        // Refresh list
        const data = await getAllAnalyses();
        setReports(data);
        // Adjust page if needed
        if (
          currentPage > 1 &&
          data.length <= (currentPage - 1) * ITEMS_PER_PAGE
        ) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error(error);
        showToast('刪除失敗', 'error');
      }
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(reports.length / ITEMS_PER_PAGE);
  const currentReports = reports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        已建立的分析報告
      </h1>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 mb-4">目前還沒有任何分析報告</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            建立第一份報告
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {currentReports.map((report) => (
            <Link
              key={report.id}
              to={`/result/${report.id}`}
              className="block bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group relative"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                      {report.company}
                    </h3>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-700 font-medium">
                      {report.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {report.country || '台灣'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.timestamp).toLocaleDateString()}{' '}
                      {new Date(report.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => handleDelete(e, report.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
                    title="刪除報告"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {reports.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-slate-600">
            第 {currentPage} 頁，共 {totalPages} 頁
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
