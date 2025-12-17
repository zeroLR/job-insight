/**
 * Web Worker for handling GenAI analysis in background
 */

import { GoogleGenAI } from '@google/genai';
import { AnalysisResult } from '../types';

interface WorkerMessage {
  type: 'START_ANALYSIS';
  payload: {
    taskId: string;
    company: string;
    jobTitle: string;
    apiKey: string;
    country?: string;
    link?: string;
    model?: string;
  };
}

interface ProgressMessage {
  type: 'PROGRESS';
  taskId: string;
  step: string;
  progress: number;
}

interface ResultMessage {
  type: 'RESULT';
  taskId: string;
  result: AnalysisResult;
}

interface ErrorMessage {
  type: 'ERROR';
  taskId: string;
  error: string;
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

async function performAnalysis(
  taskId: string,
  company: string,
  jobTitle: string,
  apiKey: string,
  country: string = '台灣',
  link?: string,
  model: string = 'gemini-3-flash',
) {
  const genAI = new GoogleGenAI({ apiKey });

  // Progress updates
  const postProgress = (step: string, progress: number) => {
    const message: ProgressMessage = {
      type: 'PROGRESS',
      taskId,
      step,
      progress,
    };
    self.postMessage(message);
  };

  try {
    postProgress('初始化分析引擎...', 10);

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

    postProgress('搜尋近期新聞與財報...', 30);

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

    postProgress('分析職缺關鍵字權重...', 50);

    // Step 2: Structure the information into JSON
    const structurePrompt = `
以下是剛才蒐集到的資訊：

${searchContent}

請根據上述內容，產生結構化的職缺分析報告。請務必確保：
1. 薪資範圍必須符合「${country}」當地市場行情，使用正確的貨幣單位
2. 新聞、社群討論必須是真實存在的來源，附上正確的連結
3. 白板題推薦僅適用於技術類職缺 (例如工程師、資料科學家)，若為非技術職缺則可留空陣列
4. 每個欄位都要根據實際資訊填寫，不要編造

返回 JSON 格式：
- companyProfile: 公司基本資料 (name, industry, sentiment 0~100, growth, website)
- strategy: 營運策略 (core, revenue[], future)
- products: 主要產品 [{name, description, link?}]
- jobDetails: 職缺資訊 (remote, overtime, responsibilities[])
- whiteboard: 白板題推薦 [{title, description, difficulty}]
- marketData: 市場數據 (salaryRange {min, max, avg, currency}, news[], discussions[])
- skills: 技能需求 (hard[], soft[])
- advice: 求職建議 [{step, title, desc}]
`;

    postProgress('生成面試攻略報告...', 80);

    const structuredResult = await genAI.models.generateContent({
      model,
      contents: [{ parts: [{ text: structurePrompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const jsonText = structuredResult.text;
    if (!jsonText) {
      throw new Error('Failed to generate structured analysis');
    }

    postProgress('最後整理...', 95);

    const analysisResult: AnalysisResult = JSON.parse(jsonText);

    postProgress('完成！', 100);

    // Send result back to main thread
    const resultMessage: ResultMessage = {
      type: 'RESULT',
      taskId,
      result: analysisResult,
    };
    self.postMessage(resultMessage);
  } catch (error) {
    const errorMessage: ErrorMessage = {
      type: 'ERROR',
      taskId,
      error: error instanceof Error ? error.message : '分析失敗',
    };
    self.postMessage(errorMessage);
  }
}

// Listen for messages from main thread
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  if (type === 'START_ANALYSIS') {
    const { taskId, company, jobTitle, apiKey, country, link, model } = payload;
    performAnalysis(taskId, company, jobTitle, apiKey, country, link, model);
  }
});

// Export empty object to make TypeScript happy
export {};
