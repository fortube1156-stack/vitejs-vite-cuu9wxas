import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/config";
import { RoomState, Action } from "../firebase/types";
import { submitAction } from "../firebase/gameService"; // ★gameServiceから呼び出し関数をインポート

interface GameRoomProps {
  roomId: string;
}

export function GameRoom({ roomId }: GameRoomProps) {
  const [room, setRoom] = useState<RoomState | null>(null);
  
  // ★1人2役テスト用に、自分がP1かP2かを切り替えるState
  const [myId, setMyId] = useState<"p1" | "p2">("p1");

  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoom(data as RoomState);
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  // ★ボタンをクリックしたときのアクション送信処理
  const handleActionSelect = async (action: Action) => {
    try {
      await submitAction(roomId, myId, action);
    } catch (error) {
      console.error("送信エラー:", error);
    }
  };

  // ★フェーズ（立ち回り or 起き攻め）に応じて表示するボタンを変える
  const getAvailableActions = (): Action[] => {
    if (!room) return [];
    if (room.phase === "neutral") {
      return ["牽制", "様子見", "差し返し"];
    }
    // 起き攻めフェーズの場合、攻め側（attacker）と守り側で選択肢を変える
    const isAttacker = room.attacker === myId;
    return isAttacker 
      ? ["strike", "throw", "wait"]        // 攻め: 打撃、投げ、様子見
      : ["guard", "abare", "invincible"];  // 守り: ガード、暴れ、無敵技
  };

  if (!room) return <div>ルームのデータを読み込み中...</div>;

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px", maxWidth: "500px", margin: "auto" }}>
      <h2>対戦ルーム: {roomId}</h2>
      
      {/* 開発テスト用のP1 / P2 切り替えセレクトボックス */}
      <div style={{ marginBottom: "20px", backgroundColor: "#f0f0f0", padding: "10px", borderRadius: "4px" }}>
        <label>🧪 テスト用操作キャラ変更: </label>
        <select value={myId} onChange={(e) => setMyId(e.target.value as "p1" | "p2")}>
          <option value="p1">プレイヤー1 (P1) として操作</option>
          <option value="p2">プレイヤー2 (P2) として操作</option>
        </select>
      </div>

      <p>現在のフェーズ: <strong>{room.phase === "neutral" ? "立ち回り" : "起き攻め"}</strong></p>

      {/* アクションボタンの表示 */}
      {room.status === "waiting" && (
        <div style={{ margin: "20px 0" }}>
          <h3>行動を選択してください（あなたは {myId.toUpperCase()}）:</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {getAvailableActions().map((actionName) => (
              <button 
                key={actionName} 
                onClick={() => handleActionSelect(actionName)}
                disabled={room[myId].action !== null} // 既に選択済みの場合はボタンを無効化
                style={{ padding: "10px 15px", cursor: "pointer" }}
              >
                {actionName}
              </button>
            ))}
          </div>
          {room[myId].action && <p style={{ color: "green" }}>選択完了！相手の入力を待っています...</p>}
        </div>
      )}

      {/* ステータス表示 */}
      <div style={{ display: "flex", justifyContent: "space-around", marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
        <div>
          <h4>P1 (HP: {room.p1.hp})</h4>
          <p>状況: {room.p1.action ? "✅選択済" : "⏳選択中"}</p>
        </div>
        <div>
          <h4>P2 (HP: {room.p2.hp})</h4>
          <p>状況: {room.p2.action ? "✅選択済" : "⏳選択中"}</p>
        </div>
      </div>
    </div>
  );
}
