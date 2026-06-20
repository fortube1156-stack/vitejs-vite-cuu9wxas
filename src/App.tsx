import { useState } from "react";
import { ref, set } from "firebase/database";
import { db } from "./firebase/config";
import { GameRoom } from "./components/GameRoom";

export default function App() {
  const [roomCreated, setRoomCreated] = useState(false);
  const roomId = "test-room-123"; // テスト用の固定ルームID

  // データベースに空のゲームルーム（初期データ）を作成する関数
  const initializeTestRoom = async () => {
    try {
      const roomRef = ref(db, `rooms/${roomId}`);
      // 初期状態のJSONデータを書き込みます
      await set(roomRef, {
        status: "waiting",
        turn: 1,
        phase: "neutral",
        attacker: null,
        p1: { hp: 10, action: null, history: [] },
        p2: { hp: 10, action: null, history: [] }
      });
      setRoomCreated(true);
    } catch (error) {
      console.error("ルーム作成に失敗しました:", error);
      alert("Firebaseとの通信に失敗しました。config.tsの設定を確認してください。");
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Yomi Games - 読み合いバトル</h1>
      
      {!roomCreated ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <p>まずはデータベースにテスト用の対戦ルームを作成しましょう。</p>
          <button 
            onClick={initializeTestRoom}
            style={{
              padding: "15px 30px",
              fontSize: "18px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            対戦ルームを初期化してスタート！
          </button>
        </div>
      ) : (
        // ルームの作成が完了したら、ゲームルームコンポーネントを表示します
        <GameRoom roomId={roomId} />
      )}
    </div>
  );
}
