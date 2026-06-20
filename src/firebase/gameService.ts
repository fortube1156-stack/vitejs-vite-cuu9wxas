// src/firebase/gameService.ts
import { db } from "./config"; // 1で作成したdbをインポート
import { ref, update, runTransaction, set } from "firebase/database";
import type { RoomState, Action } from "./types";

/**
 * アクション書き込み関数
 */
export async function submitAction(roomId: string, playerId: "p1" | "p2", action: Action) {
  const roomRef = ref(db, `rooms/${roomId}`);

  // トランザクションを使って安全にデータを読み書きします
  await runTransaction(roomRef, (currentRoom: RoomState | null) => {
    if (!currentRoom) return null; // ルームが存在しない場合はスキップ

    // すでにアクションを選択済みの場合は二重送信を防ぐために何もしない
    if (currentRoom[playerId].action) {
      return; 
    }

    // 自分のアクションをセット
    currentRoom[playerId].action = action;

    // ★ P1 と P2 両方のアクションが揃ったかチェック！
    if (currentRoom.p1.action && currentRoom.p2.action) {
      // 双方のアクションが揃ったので、ここで判定処理を実行する
      // 例: evaluateRound(currentRoom) でHP減少やステータス変更を行い、双方のactionをnullに戻す
      const resolvedRoom = evaluateRound(currentRoom); 
      return resolvedRoom;
    }

    // まだ片方しか選択していない場合は、そのままデータを保存して待機
    return currentRoom;
  });
}

// 簡易的な判定処理（evaluateRound）のイメージ
function evaluateRound(room: RoomState): RoomState {
  const p1Act = room.p1.action;
  const p2Act = room.p2.action;

  if (!p1Act || !p2Act) return room;

  if (room.phase === "neutral") {
    // --- 立ち回りフェーズの判定 ---
    if (p1Act === p2Act) {
      // あいこ（お互いダメージなし、立ち回り継続）
    } else if (
      (p1Act === "牽制" && p2Act === "様子見") ||
      (p1Act === "様子見" && p2Act === "差し返し") ||
      (p1Act === "差し返し" && p2Act === "牽制")
    ) {
      // P1の勝ち
      room.p2.hp = Math.max(0, room.p2.hp - 10); // ダメージ
      room.phase = "okizeme";                     // 起き攻めフェーズへ
      room.attacker = "p1";                       // P1が攻め側
    } else {
      // P2の勝ち
      room.p1.hp = Math.max(0, room.p1.hp - 10);
      room.phase = "okizeme";
      room.attacker = "p2";
    }
  } else {
    // --- 起き攻めフェーズの判定 ---
    const attackerId = room.attacker;
    const defenderId = attackerId === "p1" ? "p2" : "p1";
    const attack = room[attackerId].action;
    const defense = room[defenderId].action;

    // 例: 攻め打撃 vs 守り暴れ ➔ 攻めの勝ち（ダメージ）
    if (attack === "strike" && defense === "abare") {
      room[defenderId].hp = Math.max(0, room[defenderId].hp - 15);
      room.phase = "neutral"; // 立ち回りに戻る
    }
    // ... その他の起き攻めのじゃんけん判定をここに書く
  }

   // ★ HPが0になったかどうかの判定（KO判定）
   if (room.p1.hp <= 0 || room.p2.hp <= 0) {
    room.status = "finished"; // ルームのステータスを「終了」にする
    
    // 勝者の判定
    if (room.p1.hp <= 0 && room.p2.hp <= 0) {
      room.winner = "draw"; // 同時KOなら引き分け
    } else if (room.p1.hp <= 0) {
      room.winner = "p2";   // P1が倒れたらP2の勝ち
    } else {
      room.winner = "p1";   // P2が倒れたらP1の勝ち
    }
  }

  // 最後にアクションをリセット（ゲーム終了時も念のためリセット）
  room.p1.action = null;
  room.p2.action = null;

  return room;

  // 最後にアクションをリセットして次のターンへ
  room.p1.action = null;
  room.p2.action = null;

  return room;
}

//勝敗決着後に初期状態に戻す処理
export async function resetRoom(roomId: string) {
  const roomRef = ref(db, `rooms/${roomId}`);
  
  // 初期状態を定義してアップデート
  const initialState = {
    status: "waiting",
    phase: "neutral",
    winner: null,
    attacker: null,
    p1: { hp: 100, action: null },
    p2: { hp: 100, action: null }
  };

  await set(roomRef, initialState);
}




// ... 同様に evaluateRound 等でも db を使用します
