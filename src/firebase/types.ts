// ゲームのフェーズ（立ち回り or 起き攻め）
export type Phase = "neutral" | "okizeme";

// 部屋の状態（入力待ち or 結果表示中 or ラウンド開始演出中）
export type RoomStatus = "waiting" | "showing_result" | "round_start";

// プレイヤーが選択できる全アクションの型
export type Action = 
  | "牽制" 
  | "様子見" 
  | "差し返し" 
  | "strike"      // 打撃
  | "throw"       // 投げ
  | "wait"        // 様子見（起き攻め側）
  | "guard"       // ガード
  | "abare"       // 暴れ
  | "invincible"  // 無敵技
  | null;         // 未選択状態

// プレイヤー個人のデータ構造
export interface Player {
  hp: number;
  action: Action;
  history: string[];
}

// 対戦部屋（ルーム）全体のデータ構造
export interface RoomState {
  status: RoomStatus;
  turn: number;
  phase: Phase;
  attacker: "p1" | "p2" | null;
  p1: Player;
  p2: Player;
  // 直近の判定結果（画面に「〇〇が勝った！」と表示するための一時データ）
  lastResult?: {
    p1Action: Action;
    p2Action: Action;
    message: string;
  };
}
