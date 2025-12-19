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
<task>
請針對指定地區的公司職缺進行全方位分析，蒐集網路上的真實資料來源。
</task>

<target>
  <country>${country}</country>
  <company>${company}</company>
  <job_title>${jobTitle}</job_title>
  ${link ? `<job_link>${link}</job_link>` : ''}
</target>

<requirements>
  <data_sources>
    <source>新聞報導</source>
    <source>財報資料</source>
    <source>職缺描述</source>
    <source>社群討論</source>
  </data_sources>
  
  <guidelines>
    <guideline>善用搜尋工具查找最新資訊</guideline>
    <guideline>確保引用正確的來源連結</guideline>
    ${link ? '<guideline>務必參考職缺連結內容</guideline>' : ''}
    <guideline>薪資單位使用當地貨幣（TWD、HKD、USD 等）並標明貨幣種類</guideline>
    <guideline>年薪需符合當地市場行情</guideline>
    <guideline>若無法取得相關資料，請在回應中說明</guideline>
  </guidelines>
</requirements>

<information_to_collect>
  <category name="公司基本資料">
    <item>產業</item>
    <item>輿論好感度</item>
    <item>成長趨勢</item>
    <item>官網連結</item>
  </category>
  
  <category name="營運策略">
    <item>核心策略</item>
    <item>獲利來源</item>
    <item>未來佈局</item>
  </category>
  
  <category name="主要產品">
    <item>名稱</item>
    <item>描述</item>
    <item>連結</item>
  </category>
  
  <category name="職缺詳細資訊">
    <item>是否遠端</item>
    <item>加班狀況</item>
    <item>主要職責</item>
  </category>
  
  <category name="白板題推薦" condition="技術職缺">
    <item>題目標題</item>
    <item>題目描述</item>
    <item>難度等級</item>
  </category>
  
  <category name="市場數據">
    <item>年薪資範圍</item>
    <item>相關新聞</item>
    <item>社群討論</item>
  </category>
  
  <category name="技能需求">
    <item>硬實力</item>
    <item>軟實力</item>
  </category>
  
  <category name="求職建議">
    <item>準備步驟</item>
    <item>建議重點</item>
  </category>
</information_to_collect>
`;

  const searchResult = await genAI.models.generateContent({
    model,
    contents: [{ parts: [{ text: searchPrompt }] }],
    config: {
      temperature: 0,
      tools: [
        {
          googleSearch: {},
        },
      ],
    },
  });

  const searchContent = searchResult.text;
  if (!searchContent) {
    throw new Error('Failed to fetch search content');
  }

  const metadata = searchResult.candidates?.[0]?.groundingMetadata;

  // 檢查是否有搜尋來源，若信任度低則中斷並提示資訊不足
  if (!metadata || !metadata.searchEntryPoint) {
    throw new Error(
      '搜尋結果不足，無法生成準確的分析報告。請嘗試提供更詳細的公司名稱或職缺連結。',
    );
  }

  // Step 2: Structure the information into JSON
  const structurePrompt = `
<task>
請根據檢索到的資訊，整理成嚴格的 JSON 格式。
</task>

<output_format>
  <format_type>JSON</format_type>
  <schema_language>TypeScript</schema_language>
</output_format>

<schema>
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
</schema>

<validation_rules>
  <rule field="marketData.salaryRange">
    <description>需根據實際提供的有效資料來評估</description>
    <constraints>
      <constraint field="min">約 300000 ～ 1000000</constraint>
      <constraint field="max">約 600000 ～ 3000000</constraint>
      <constraint field="avg">約 400000 ～ 2500000</constraint>
    </constraints>
  </rule>
</validation_rules>

<input_data>
${searchContent}
</input_data>
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
