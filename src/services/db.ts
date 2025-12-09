import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { AnalysisResult } from '../types';

interface JobInsightDB extends DBSchema {
  analysis: {
    key: string;
    value: {
      id: string;
      company: string;
      title: string;
      country?: string;
      link?: string;
      data: AnalysisResult;
      timestamp: number;
    };
    indexes: { 'by-company-title': [string, string] };
  };
  settings: {
    key: string;
    value: {
      key: string;
      value: string;
    };
  };
}

const DB_NAME = 'job-insight-db';
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase<JobInsightDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<JobInsightDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore('analysis', {
            keyPath: 'id',
          });
          store.createIndex('by-company-title', ['company', 'title']);
        }
        if (oldVersion < 3) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
};

export const saveApiKey = async (apiKey: string) => {
  const db = await initDB();
  await db.put('settings', { key: 'gemini_api_key', value: apiKey });
};

export const getApiKey = async () => {
  const db = await initDB();
  const result = await db.get('settings', 'gemini_api_key');
  return result?.value;
};

export const deleteAnalysis = async (id: string) => {
  const db = await initDB();
  await db.delete('analysis', id);
};

export const saveAnalysis = async (
  company: string,
  title: string,
  data: AnalysisResult,
  country: string = '台灣',
  link?: string,
) => {
  const db = await initDB();
  const id = crypto.randomUUID();
  await db.put('analysis', {
    id,
    company,
    title,
    country,
    link,
    data,
    timestamp: Date.now(),
  });
  return id;
};

export const getAllAnalyses = async () => {
  const db = await initDB();
  const all = await db.getAll('analysis');
  return all.sort((a, b) => b.timestamp - a.timestamp);
};

export const getAnalysisRecordById = async (id: string) => {
  const db = await initDB();
  return await db.get('analysis', id);
};

export const getAnalysis = async (
  company: string,
  title: string,
  country: string = '台灣',
): Promise<{ id: string; data: AnalysisResult } | null> => {
  const db = await initDB();
  // Note: We are still using the 'by-company-title' index for now.
  // Ideally, we should add 'country' to the index, but that requires a DB migration strategy.
  // For simplicity in this iteration, we'll filter in memory if needed,
  // or just accept that we might get a result from a different country if the company/title matches.
  // However, since 'company' usually implies location context or is global,
  // and 'title' is specific, the collision risk is low for the same user session.
  // To be more correct without complex migration right now:
  const index = db.transaction('analysis').store.index('by-company-title');
  const result = await index.get([company, title]);

  if (result && result.country === country) {
    return { id: result.id, data: result.data };
  }

  // If country doesn't match or no result, return null (force re-analysis)
  // Or if the old record didn't have a country (undefined), we might want to treat it as a miss or default.
  // Let's be strict: if we ask for a specific country, we want that country.
  if (result && !result.country && country === '台灣') {
    // Backward compatibility: assume old records are Taiwan
    return { id: result.id, data: result.data };
  }

  return null;
};

export const getAnalysisById = async (
  id: string,
): Promise<AnalysisResult | null> => {
  const db = await initDB();
  const result = await db.get('analysis', id);
  return result ? result.data : null;
};
