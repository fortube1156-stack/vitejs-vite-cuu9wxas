// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebaseコンソールから取得する設定値
// ※個人開発・StackBlitz環境であれば、直接記述しても問題ありません
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "yomi-games.firebaseapp.com",
  projectId: "yomi-games",
  storageBucket: "yomi-games.firebasestorage.app",
  messagingSenderId: "749618235787",
  appId: "YOUR_APP_ID",
  databaseURL: "https://yomi-games-default-rtdb.firebaseio.com" // お使いのRTDBのURL
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// データベースインスタンスをエクスポート
export const db = getDatabase(app);
