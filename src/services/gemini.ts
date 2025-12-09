import { GoogleGenAI } from '@google/genai';
import { AnalysisResult } from '../types';
import { getApiKey } from './db';

const ENV_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const getClient = async () => {
  const dbKey = await getApiKey();
  const key = dbKey || ENV_API_KEY;
  if (!key) {
    throw new Error(
      'API Key is missing. Please set VITE_GEMINI_API_KEY in .env or configure it in the app settings.',
    );
  }
  return new GoogleGenAI({ apiKey: key });
};

export const generateAnalysis = async (
  company: string,
  jobTitle: string,
  country: string = '台灣',
  link?: string,
): Promise<AnalysisResult> => {
  const genAI = await getClient();

  const searchPrompt = `
    請針對「${country}」地區的「${company}」公司之「${jobTitle}」職缺進行全方位分析。
    ${link ? `請務必參考此職缺連結內容：${link}` : ''}
    資料來源必須是網路上真實來源，包含新聞報導、財報、職缺描述與社群討論等。
    請善用搜尋工具查找最新資訊，並確保引用正確的來源連結。
    
    請蒐集以下資訊：
    1. 公司基本資料 (產業、輿論好感度、成長趨勢、官網連結)
    2. 營運策略 (核心策略、獲利來源、未來佈局)
    3. 主要產品 (名稱、描述、連結)
    4. 職缺詳細資訊 (是否遠端、加班狀況、主要職責)
    5. 白板題推薦 (若為技術職缺)
    6. 市場數據 (薪資範圍、相關新聞、社群討論)
    7. 技能需求 (硬實力、軟實力)
    8. 求職建議
  `;

  try {
    // 第一步：檢索資訊
    const searchResult = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [{ parts: [{ text: searchPrompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const searchContent = searchResult.text;
    if (!searchContent) {
      throw new Error('無法檢索相關資訊');
    }

    // 第二步：結構化輸出
    const structurePrompt = `
      請根據以下檢索到的資訊，整理成嚴格的 JSON 格式。
      JSON 結構必須符合以下 TypeScript 介面：

      interface AnalysisResult {
        companyProfile: {
          name: string; // 公司名稱
          industry: string; // 產業類別
          sentiment: number; // 輿論好感度 0-100
          growth: string; // 成長趨勢 (例如 "+15%")
          website?: string; // 公司官網連結
        };
        strategy: {
          core: string; // 核心策略簡述
          revenue: string[]; // 獲利來源 (陣列)
          future: string; // 未來佈局
        };
        products: {
          name: string; // 產品名稱
          description: string; // 產品描述
          link?: string; // 產品連結 (選填)
        }[];
        jobDetails: {
          remote: boolean; // 可否遠端
          overtime: boolean; // 是否常加班
          responsibilities: string[]; // 主要職責
        };
        whiteboard?: {
          title: string; // 題目名稱
          description: string; // 題目描述
          difficulty: 'Easy' | 'Medium' | 'Hard'; // 難度
        }[];
        marketData: {
          salaryRange: {
            min: number; // 最低年薪 (萬)
            max: number; // 最高年薪 (萬)
            avg: number; // 平均年薪 (萬)
            currency: string; // 幣別 (例如 "萬/年薪 (TWD)")
          };
          news: {
            title: string; // 新聞標題
            source: string; // 來源
            date: string; // 日期 (例如 "2天前")
            type: 'positive' | 'negative' | 'neutral'; // 正負面
            link?: string; // 新聞來源連結
          }[]; // 請提供至少 5 則新聞
          discussions: {
            topic: string; // 討論主題
            score: number; // 評分 1-5
            comment: string; // 評論內容
            link?: string; // 討論來源連結
          }[]; // 請提供至少 5 則討論
        };
        skills: {
          hard: string[]; // 硬實力
          soft: string[]; // 軟實力
        };
        advice: {
          step: number; // 步驟 1-4
          title: string; // 標題
          desc: string; // 說明
        }[];
      }
      
      檢索到的資訊如下：
      ${searchContent}
    `;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [{ parts: [{ text: structurePrompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            companyProfile: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                industry: { type: 'string' },
                sentiment: { type: 'number' },
                growth: { type: 'string' },
                website: { type: 'string' },
              },
              required: ['name', 'industry', 'sentiment', 'growth'],
            },
            strategy: {
              type: 'object',
              properties: {
                core: { type: 'string' },
                revenue: {
                  type: 'array',
                  items: { type: 'string' },
                },
                future: { type: 'string' },
              },
              required: ['core', 'revenue', 'future'],
            },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  link: { type: 'string' },
                },
                required: ['name', 'description'],
              },
            },
            jobDetails: {
              type: 'object',
              properties: {
                remote: { type: 'boolean' },
                overtime: { type: 'boolean' },
                responsibilities: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['remote', 'overtime', 'responsibilities'],
            },
            whiteboard: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  difficulty: {
                    type: 'string',
                    enum: ['Easy', 'Medium', 'Hard'],
                  },
                },
                required: ['title', 'description', 'difficulty'],
              },
            },
            marketData: {
              type: 'object',
              properties: {
                salaryRange: {
                  type: 'object',
                  properties: {
                    min: { type: 'number' },
                    max: { type: 'number' },
                    avg: { type: 'number' },
                    currency: { type: 'string' },
                  },
                  required: ['min', 'max', 'avg', 'currency'],
                },
                news: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      source: { type: 'string' },
                      date: { type: 'string' },
                      type: {
                        type: 'string',
                        enum: ['positive', 'negative', 'neutral'],
                      },
                      link: { type: 'string' },
                    },
                    required: ['title', 'source', 'date', 'type'],
                  },
                },
                discussions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      topic: { type: 'string' },
                      score: { type: 'number' },
                      comment: { type: 'string' },
                      link: { type: 'string' },
                    },
                    required: ['topic', 'score', 'comment'],
                  },
                },
              },
              required: ['salaryRange', 'news', 'discussions'],
            },
            skills: {
              type: 'object',
              properties: {
                hard: {
                  type: 'array',
                  items: { type: 'string' },
                },
                soft: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['hard', 'soft'],
            },
            advice: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  step: { type: 'number' },
                  title: { type: 'string' },
                  desc: { type: 'string' },
                },
                required: ['step', 'title', 'desc'],
              },
            },
          },
          required: [
            'companyProfile',
            'strategy',
            'products',
            'jobDetails',
            'marketData',
            'skills',
            'advice',
          ],
        },
      },
    });

    const text = result?.text;

    if (!text) {
      throw new Error('No content generated');
    }

    const parsedResult = JSON.parse(text) as AnalysisResult;
    return { ...parsedResult, jobTitle };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    if (error.message?.includes('429') || error.status === 429) {
      throw new Error('已達用量上限');
    }
    throw new Error('無法生成分析報告，請稍後再試。');
  }
};
