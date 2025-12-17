# 安全性更新說明

## 最新改進 (2025-12-18)

### 1. SessionStorage 加密保護
- **Master Password 加密存儲**：原本明文存於 sessionStorage 的 Master Password 現已使用混淆加密
- 使用 SHA-256 + Base64 編碼保護
- 每次 session 使用隨機 salt
- 防止瀏覽器開發者工具直接讀取密碼

### 2. API Key 後 4 碼提示
- **便於識別**：系統會保存 Gemini API Key 的後 4 碼作為識別提示
- 存儲於 Realtime Database 的 `apiKeyHint` 欄位
- 用戶可在設定頁面看到 `****XXXX` 格式的提示
- 方便確認是否使用了正確的 API Key

### 3. 重設 API Key 功能
- **SetupKey 頁面增強**：
  - 如果已設定 API Key，會顯示後 4 碼提示
  - 提供「重設」按鈕讓用戶更新密碼和 API Key
  - 重設時會清空所有欄位，要求重新輸入

## 資料庫結構

```
users/
  {uid}/
    apiKey: "encrypted_base64_string"      # 加密的 API Key
    apiKeyHint: "WXYZ"                      # API Key 的後 4 碼
    reports/
      {reportId}/
        ...
```

## 使用流程

### 首次設定
1. 登入後導向 `/setup-key`
2. 設定保險箱密碼（至少 8 字元）
3. 輸入 Gemini API Key
4. 系統自動：
   - 加密 API Key 並存到 RTDB
   - 保存後 4 碼到 RTDB
   - 混淆加密 Master Password 存到 sessionStorage

### 更新 API Key
1. 進入 `/setup-key` 頁面
2. 看到已設定的 API Key 提示（`****WXYZ`）
3. 點擊「重設」按鈕
4. 重新輸入新的保險箱密碼和 API Key

### 使用時解鎖
1. 關閉瀏覽器後重新開啟
2. sessionStorage 中的密碼已清除
3. 嘗試生成報告時顯示解鎖提示
4. 輸入保險箱密碼後繼續使用

## 安全性改進總結

| 項目 | 之前 | 現在 |
|-----|------|------|
| Master Password 存儲 | 明文 sessionStorage | SHA-256 混淆加密 |
| API Key 識別 | 無提示 | 後 4 碼明文提示 |
| 更新機制 | 需刪除後重設 | 提供重設按鈕 |
| Session 保護 | 基本 | 增強（加密 + salt）|

## 注意事項

⚠️ **重要提醒**：
- 保險箱密碼無法重置，請務必牢記
- 後 4 碼僅用於識別，不影響安全性
- 重設會覆蓋舊的 API Key
- sessionStorage 加密僅防止簡單窺探，關閉瀏覽器仍會清除
