# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

# 開発コンテクスト：ブラウザ対戦ゲームの個人開発

私は現在、Androidタブレット（StackBlitz環境）を使用して、友人同士で手軽に遊べるリアルタイム対戦型のブラウザゲームを開発しています。
このゲームの仕様、ルール、および技術選定の情報を共有します。これらを前提として、今後のコード生成や設計のアドバイスをお願いします。

## 1. ゲームコンセプトと特徴
- **コンセプト**: 格闘ゲームの「読み合い（人読み・心理戦）」だけを抽出したゲーム
- **プレイ時間**: 1試合3〜5分（スマホ・タブレット対応、テンポ重視）
- **特徴**: 自分の履歴は非表示、相手の直近5回の行動履歴のみが画面に常駐。相手の癖を読んで戦う。
- **入力方式**: 3〜5秒の制限時間による「同時入力制（同時選択）」
- **勝敗**: 初期HP 10程度のHP制

## 2. ゲームフローとルール詳細
ゲームは「立ち回りフェーズ」と「起き攻めフェーズ」をループします。

### 【立ち回りフェーズ】（攻め権の奪い合い）
同時に3つの選択肢から1つを選び、三すくみで判定。
- 牽制 ＞ 様子見
- 様子見 ＞ 差し返し
- 差し返し ＞ 牽制
- **結果**: 勝者は「相手に1ダメージ ＋ 起き攻め権（攻め側）を獲得」。
- **あいこ時**: 両者ノーダメージでゲージ蓄積、または相打ち1ダメージ（テンポ重視）。

### 【起き攻めフェーズ】（非対称の読み合い）
攻め側と守り側で選択肢が異なり、3×3の9マスの相性。
- **攻め側**: 打撃、投げ、様子見
- **守り側**: ガード、暴れ、無敵技

#### 【詳細な相性ロジック】
1. **打撃**
   - vs 暴れ ＝ 勝ち（ダメージ＋攻め継続）
   - vs ガード ＝ 防がれる（ダメージなし＋立ち回りフェーズへ戻る）
   - vs 無敵技 ＝ 負け（無敵技の成功：ダメージを受けて立ち回りへ戻る）
2. **投げ**
   - vs ガード ＝ 勝ち（ダメージ＋攻め継続）
   - vs 暴れ ＝ 勝ち（ダメージ＋攻め継続）
   - vs 無敵技 ＝ 負け（無敵技の成功：ダメージを受けて立ち回りへ戻る）
3. **様子見**
   - vs 無敵技 ＝ 大勝ち（無敵技の隙に大反撃：大ダメージ＋攻め継続）
   - vs ガード ＝ 失敗（守り側に確定反撃1〜2ダメージ＋立ち回りへ戻る）
   - vs 暴れ ＝ 失敗（守り側に確定反撃1〜2ダメージ＋立ち回りへ戻る）

---

## 3. 技術スタックとアーキテクチャ
- **フロントエンド**: React + Vite (TypeScript)
  - UIとゲームロジックは完全分離。MVP段階ではアニメーションなしのテキスト・ボタンベース。
- **バックエンド**: Firebase Realtime Database (RTDB)
  - 通信ラグを最小限に抑えるため、FirestoreではなくRTDBのリアルタイム同期を使用。

### 【想定するRTDBのデータ構造（json）】
```json
{
  "rooms": {
    "ROOM_ID": {
      "status": "waiting | round_start | showing_result",
      "turn": 1,
      "phase": "neutral | okizeme",
      "attacker": "p1 | p2 | null",
      "p1": { "hp": 10, "action": "strike | null", "history": ["strike", "guard"] },
      "p2": { "hp": 10, "action": "guard | null", "history": ["guard", "counter"] }
    }
  }
}
```

---

## 4. 今回依頼したいこと
上記の前提を元に、開発を進めます。
まずは、**ReactコンポーネントからFirebase Realtime Databaseへプレイヤーの行動（action）を書き込み、両者の入力が揃った瞬間に勝敗判定を行う「同時入力・判定ロジック」の実装コード例**を提示してください。

