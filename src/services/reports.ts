import { ref, get, set, remove, query, orderByChild } from 'firebase/database';
import { rtdb } from './firebase';
import { AnalysisResult } from '../types';

export interface ReportRecord {
  id: string;
  company: string;
  title: string;
  country?: string;
  link?: string | null;
  model?: string;
  data: AnalysisResult;
  timestamp: number;
}

export const getUserReports = async (uid: string): Promise<ReportRecord[]> => {
  const q = query(ref(rtdb, `users/${uid}/reports`), orderByChild('timestamp'));
  const snapshot = await get(q);

  if (!snapshot.exists()) return [];

  const value = snapshot.val() as Record<string, ReportRecord>;
  const items = Object.values(value);
  return items.sort((a, b) => b.timestamp - a.timestamp);
};

export const getUserReportById = async (
  uid: string,
  reportId: string,
): Promise<ReportRecord | null> => {
  const snapshot = await get(ref(rtdb, `users/${uid}/reports/${reportId}`));
  if (!snapshot.exists()) return null;
  return snapshot.val() as ReportRecord;
};

export const deleteUserReportById = async (uid: string, reportId: string) => {
  await remove(ref(rtdb, `users/${uid}/reports/${reportId}`));
};

export const putUserReportById = async (uid: string, report: ReportRecord) => {
  await set(ref(rtdb, `users/${uid}/reports/${report.id}`), report);
};
