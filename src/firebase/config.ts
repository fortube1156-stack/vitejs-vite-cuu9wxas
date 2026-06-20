// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebaseコンソールから取得する設定値
// ※個人開発・StackBlitz環境であれば、直接記述しても問題ありません
const firebaseConfig = {
  apiKey: "AIzaSyAoI6cAKtshRIG61t89J1uEHETg20yOEHM",
  authDomain: "yomi-games.firebaseapp.com",
  projectId: "yomi-games",
  storageBucket: "yomi-games.firebasestorage.app",
  messagingSenderId: "749618235787",
  appId: "1:749618235787:web:d50bd1b866a6ca177d878e",
  measurementId: "G-MJSRHCEHE3"
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// データベースインスタンスをエクスポート
export const db = getDatabase(app);
