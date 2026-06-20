// src/firebase/gameService.ts
import { db } from "./config"; // 1で作成したdbをインポート
import { ref, update, runTransaction } from "firebase/database";
import { RoomState, Action } from "./types"; // 必要に応じて型定義も別ファイルから読込

/**
 * アクション書き込み関数
 */
export async function submitAction(roomId: string, playerId: "p1" | "p2", action: Action) {
  // インポートした 'db' を使ってデータベース参照（パス）を作成します
  const playerActionRef = ref(db, `rooms/${roomId}/${playerId}`);
  await update(playerActionRef, { action });
}

// ... 同様に evaluateRound 等でも db を使用します
