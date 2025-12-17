# JobInsight Pro 📊

> 全方位職缺智能分析助手 - 運用 AI 技術深度分析目標職缺，提供公司策略、薪資行情、面試準備等全方位資訊

[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff.svg)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.14-orange.svg)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8.svg)](https://tailwindcss.com/)

## 簡介 ✨

JobInsight Pro 是一款智能職缺分析工具，透過 Google Gemini AI 技術自動蒐集與分析網路公開資訊，為求職者提供：

- 🏢 **公司全貌分析** - 產業定位、輿論好感度、成長趨勢
- 💡 **營運策略洞察** - 核心策略、獲利來源、未來佈局
- 💰 **薪資行情評估** - 基於當地市場的薪資範圍建議
- 📰 **新聞輿情追蹤** - 最新新聞報導與社群討論整理
- 🎯 **技能需求拆解** - 硬實力與軟實力清單
- 📝 **面試準備指南** - 白板題推薦、求職建議

## 主要功能 🚀

### 🔐 安全的 API 金鑰管理
- **客戶端加密**：使用者自訂保險箱密碼（Master Password）
- **AES-GCM 加密**：透過 Web Crypto API 加密 Gemini API 金鑰
- **雲端存儲**：加密後的金鑰安全儲存於 Firebase Realtime Database
- **會話保護**：Master Password 僅存於瀏覽器 sessionStorage，關閉分頁即清除

### 🎨 Firebase 身份驗證
- 支援 **Google** 與 **GitHub** 第三方登入

### ⚡ 背景分析處理
- **Web Worker 架構**：分析任務在背景執行，不阻塞 UI
- **任務管理系統**：支援多任務並行、進度追蹤
- **持久化儲存**：任務狀態保存於 localStorage，支援頁面切換
- **即時通知**：分析完成時彈出 Toast 提示

### 📊 詳盡的分析報告
分析報告包含以下八大模組：

1. **公司基本資料** - 名稱、產業、輿論好感度、成長趨勢、官網連結
2. **營運策略** - 核心策略、獲利來源、未來發展方向
3. **主要產品** - 產品名稱、描述與相關連結
4. **職缺詳情** - 遠端選項、加班狀況、主要職責
5. **白板題推薦** - 技術職缺適用的面試題目與難度
6. **市場數據** - 薪資範圍、相關新聞、社群討論
7. **技能需求** - 硬實力（技術）與軟實力（特質）
8. **求職建議** - 分步驟的準備指南

### 📱 響應式設計 (RWD)
- **桌面版**：主內容置中，右側浮動任務列表
- **行動版**：堆疊式布局，流暢的手機瀏覽體驗
- **PWA 支援**：可安裝為桌面/手機應用程式

### 📋 報告管理
- **歷史記錄**：查看所有已建立的分析報告
- **快速檢索**：依時間排序，支援分頁瀏覽
- **一鍵重新生成**：可針對任何報告重新執行分析

## 使用技術 🛠️

### 前端框架與工具
- **[React 18](https://reactjs.org/)** - 使用函式組件與 Hooks
- **[TypeScript](https://www.typescriptlang.org/)** - 型別安全開發
- **[Vite](https://vitejs.dev/)** - 高效能建置工具
- **[React Router](https://reactrouter.com/)** - 客戶端路由管理
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-First CSS 框架
- **[Lucide React](https://lucide.dev/)** - 現代化 Icon 元件庫

### 後端服務
- **[Firebase Authentication](https://firebase.google.com/products/auth)** - 第三方登入（Google / GitHub）
- **[Firebase Realtime Database](https://firebase.google.com/products/realtime-database)** - 即時資料庫，儲存加密金鑰與分析報告
- **[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)** - 瀏覽器端本地資料庫（透過 [idb](https://github.com/jakearchibald/idb)）

### AI 技術
- **[Google Gemini API](https://ai.google.dev/)** - 使用 `@google/genai` SDK
- **支援模型**：
  - Gemini 3 Flash（平衡效能）
  - Gemini 2.5 Flash Lite（快速回應）
  - Gemini 2.5 Flash（高品質）
  - Gemini Robotics ER 1.5 Preview（實驗性）
- **Google Search Grounding** - 提升回應準確性與即時性

### 加密與安全
- **[Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)** - 瀏覽器原生加密
- **PBKDF2** - 密碼衍生金鑰函數（100,000 次迭代）
- **AES-GCM** - 認證加密模式

### 效能優化
- **Web Workers** - 背景執行 AI 分析任務
- **Service Worker** - 離線快取與 PWA 支援
- **Code Splitting** - 動態載入模組

## 安裝與部署 📦

### 本地開發

1. **Clone 專案**
```bash
git clone https://github.com/zeroLR/job-insight.git
cd job-insight
```

2. **安裝依賴**
```bash
npm install
```

3. **設定環境變數**

建立 `.env` 檔案並填入 Firebase 設定：
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=your_database_url
```

4. **啟動開發伺服器**
```bash
npm run dev
```

5. **建置生產版本**
```bash
npm run build
```

6. **預覽生產版本**
```bash
npm run preview
```

### Firebase 部署

```bash
npm run firebase:deploy
```

### Cloudflare Pages 部署

```bash
npm run deploy
```

## 專案結構 📁

```
job-insight/
├── src/
│   ├── components/         # 可重用 UI 元件
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Navbar.tsx
│   │   ├── TaskList.tsx
│   │   ├── Toast.tsx
│   │   └── ...
│   ├── contexts/          # React Context 提供者
│   │   ├── AnalysisTaskContext.tsx  # 任務管理
│   │   ├── AuthContext.tsx          # 身份驗證
│   │   ├── MasterPasswordContext.tsx # 密碼管理
│   │   └── ToastContext.tsx         # 通知系統
│   ├── hooks/             # 自訂 Hooks
│   │   └── useJobAnalysis.ts
│   ├── pages/             # 頁面元件
│   │   ├── Home.tsx       # 主頁（分析表單）
│   │   ├── Login.tsx      # 登入頁
│   │   ├── SetupKey.tsx   # API 金鑰設定
│   │   ├── Result.tsx     # 分析結果
│   │   └── ReportList.tsx # 報告列表
│   ├── services/          # API 與服務層
│   │   ├── firebase.ts    # Firebase 初始化
│   │   ├── genai.ts       # Gemini AI 整合
│   │   ├── db.ts          # IndexedDB 操作
│   │   └── reports.ts     # 報告管理
│   ├── utils/             # 工具函式
│   │   ├── crypto.ts      # 加密/解密
│   │   └── cn.ts          # CSS 類名合併
│   ├── workers/           # Web Workers
│   │   └── analysis.worker.ts  # 背景分析任務
│   ├── types/             # TypeScript 型別定義
│   │   └── index.ts
│   ├── App.tsx            # 應用程式根元件
│   └── main.tsx           # 應用程式進入點
├── public/                # 靜態資源
│   ├── sw.js             # Service Worker
│   └── manifest.json     # PWA Manifest
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── firebase.json
├── database.rules.json   # Firebase RTDB 安全規則
└── package.json
```

## 使用流程 📝

1. **註冊/登入**：使用 Google 或 GitHub 帳號登入
2. **設定 API 金鑰**：
   - 前往 [Google AI Studio](https://aistudio.google.com/apikey) 取得 Gemini API 金鑰
   - 在應用程式中輸入金鑰並設定保險箱密碼
3. **分析職缺**：
   - 輸入公司名稱、職缺名稱、國家/地區
   - 可選填職缺連結與 AI 模型
   - 點擊「開始分析」
4. **背景處理**：分析任務在背景執行，可自由切換頁面
5. **查看報告**：分析完成後收到通知，點擊查看詳細報告
6. **管理報告**：在「結果列表」頁面查看所有歷史報告

## 安全性說明 🔒

- **零後端金鑰存取**：API 金鑰僅在瀏覽器端解密與使用
- **端對端加密**：使用者密碼不會傳送至伺服器
- **會話隔離**：關閉分頁後 Master Password 自動清除
- **Firebase 規則保護**：資料庫規則確保使用者只能存取自己的資料

## 免責聲明 ⚠️

**重要提示**：本服務使用 AI 技術自動蒐集與分析網路公開資訊，所有內容僅供參考。

1. **資訊準確性**：分析結果可能包含不準確、過時或不完整的資訊，請使用者自行查證
2. **非官方資料**：薪資範圍、公司策略等資訊為 AI 基於公開資料推估，非官方數據
3. **求職結果**：本服務不對任何求職面試結果或職涯決策負責
4. **隱私權**：使用者應自行判斷輸入資訊的敏感性，避免洩漏個人隱私
5. **API 費用**：使用 Gemini API 可能產生費用，請參考 [Google AI Studio 定價](https://ai.google.dev/pricing)
6. **第三方服務**：本服務依賴 Google Gemini API 與 Firebase，可用性受第三方服務狀態影響

**使用本服務即表示您同意以上條款。**

## 授權條款 📄

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

---

**開發者**：[zeroLR](https://github.com/zeroLR)  
**專案連結**：[https://github.com/zeroLR/job-insight](https://github.com/zeroLR/job-insight)

如有任何問題或建議，歡迎提交 Issue 或 Pull Request！
