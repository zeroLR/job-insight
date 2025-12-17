import { GoogleGenAI } from '@google/genai';
import { AnalysisResult } from '../types';

interface GenerateAnalysisParams {
  company: string;
  jobTitle: string;
  apiKey: string;
  country?: string;
  link?: string;
  model?: string;
}

const RESPONSE_SCHEMA = {
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
        revenue: { type: 'array', items: { type: 'string' } },
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
        responsibilities: { type: 'array', items: { type: 'string' } },
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
        hard: { type: 'array', items: { type: 'string' } },
        soft: { type: 'array', items: { type: 'string' } },
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
} as const;

/**
 * 使用 Google GenAI 生成職缺分析報告
 */
export async function generateAnalysisWithGenAI(
  params: GenerateAnalysisParams,
): Promise<AnalysisResult> {
  const {
    company,
    jobTitle,
    apiKey,
    country = '台灣',
    link,
    model = 'gemini-3-flash',
  } = params;

  const genAI = new GoogleGenAI({ apiKey });

  // Step 1: Search and gather information
  const searchPrompt = `
請針對「${country}」地區的「${company}」公司之「${jobTitle}」職缺進行全方位分析。
${link ? `請務必參考此職缺連結內容：${link}` : ''}
資料來源必須是網路上真實來源，包含新聞報導、財報、職缺描述與社群討論等。
請善用搜尋工具查找最新資訊，並確保引用正確的來源連結。
薪資的單位使用當地貨幣 (TWD、HKD、USD 等)，並標明貨幣種類，需符合當地市場行情。

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

  const searchResult = await genAI.models.generateContent({
    model,
    contents: [{ parts: [{ text: searchPrompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const searchContent = searchResult.text;
  if (!searchContent) {
    throw new Error('Failed to fetch search content');
  }

  // Step 2: Structure the information into JSON
  const structurePrompt = `
請根據以下檢索到的資訊，整理成嚴格的 JSON 格式。
JSON 結構必須符合以下 TypeScript 介面：

interface AnalysisResult {
  companyProfile: {
    name: string;
    industry: string;
    sentiment: number;
    growth: string;
    website?: string;
  };
  strategy: {
    core: string;
    revenue: string[];
    future: string;
  };
  products: {
    name: string;
    description: string;
    link?: string;
  }[];
  jobDetails: {
    remote: boolean;
    overtime: boolean;
    responsibilities: string[];
  };
  whiteboard?: {
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  }[];
  marketData: {
    salaryRange: {
      min: number;
      max: number;
      avg: number;
      currency: string;
    };
    news: {
      title: string;
      source: string;
      date: string;
      type: 'positive' | 'negative' | 'neutral';
      link?: string;
    }[];
    discussions: {
      topic: string;
      score: number;
      comment: string;
      link?: string;
    }[];
  };
  skills: {
    hard: string[];
    soft: string[];
  };
  advice: {
    step: number;
    title: string;
    desc: string;
  }[];
}

檢索到的資訊如下：
${searchContent}
`;

  const result = await genAI.models.generateContent({
    model,
    contents: [{ parts: [{ text: structurePrompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const text = result.text;
  if (!text) {
    throw new Error('No content generated');
  }

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error('Failed to parse generated JSON');
  }

  return { ...parsed, jobTitle } as AnalysisResult;
}
