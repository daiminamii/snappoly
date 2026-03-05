# snappoly プロジェクト設定

## ★ 作業開始時の設定（要カスタム）
以下を現在の作業に合わせて編集してください：

### 現在のIssue設定
- **Issue番号**: （未設定）
- **Issue名**: （未設定）
- **今日の日付**: 26.03.05
- **前日の日付**: 26.03.04

### steeringパス（自動生成）
- **ベースパス**: C:\Users\南井大\Documents\ArusSystems\doc\snappoly\steering
- **requirements.md**: [ベースパス]\requirements.md
- **今日のdesign.md**: [ベースパス]\[今日の日付]\design.md
- **今日のdecisions.md**: [ベースパス]\[今日の日付]\decisions.md
- **前日のdecisions.md**: [ベースパス]\[前日の日付]\decisions.md

---

## 共通設定インポート
@C:\Users\南井大\Documents\claude-config\CLAUDE.md
@C:\Users\南井大\Documents\claude-config\common\development-principles.md
@C:\Users\南井大\Documents\claude-config\common\error-handling.md
@C:\Users\南井大\Documents\claude-config\common\git-workflow.md
@C:\Users\南井大\Documents\claude-config\common\project-management.md
@C:\Users\南井大\Documents\claude-config\common\work-log-guide.md
@C:\Users\南井大\Documents\claude-config\common\plan-workflow.md
@C:\Users\南井大\Documents\claude-config\languages\typescript\coding-standards.md
@C:\Users\南井大\Documents\claude-config\languages\react\hooks-patterns.md
@C:\Users\南井大\Documents\claude-config\languages\react-native\coding-standards.md

## Skills設定
@C:\Users\南井大\Documents\claude-config\skills\codex-guide.md

## プロジェクト概要
写真をローポリアートに変換する子供向けモバイルアプリ。
カメラで撮影した写真から顔やペットを検出し、三角形メッシュで
カラフルなローポリアートを生成する。

### 目的
1. 子供（10歳・6歳）が楽しめるクリエイティブアプリ
2. React Native / Expo の学習・ポートフォリオ充実
3. 将来的に 3D プリンタ向け STL 出力にも対応

### 対象ユーザー
- 10歳・6歳の娘さん
- Android メイン（iPhone も同コードで対応可能）

## 利用可能なエージェント
このプロジェクトは React Native + TypeScript のため、以下のエージェントが利用可能：
- **react-hooks**: React Hooks専門（カスタムフック設計、状態管理、パフォーマンス最適化）
- **ts-debugger**: TypeScriptデバッグ専門（型エラー、非同期問題、ランタイムエラー診断）
- **ts-reviewer**: TypeScriptコードレビュー専門（型安全性、コーディング規約確認）

## 利用可能なSkills
- `/codex <内容>`: Codexで調査・検証（読み取り専用）
- `/codex-write <内容>`: Codexで実装（書き込み可能）

## 技術スタック
- **フレームワーク**: React Native + Expo（最新安定 SDK）
- **言語**: TypeScript (strict mode)
- **ナビゲーション**: expo-router（ファイルベースルーティング）
- **スタイリング**: NativeWind v4（Tailwind CSS for RN）
- **カメラ**: expo-camera + expo-image-picker
- **顔検出**: @infinitered/react-native-mlkit-face-detection
- **三角形分割**: delaunator（純粋JS）
- **メッシュ描画**: @shopify/react-native-skia（`<Vertices>`）
- **ビルド**: EAS Build（クラウドビルド）
- **パッケージマネージャー**: npm

## 環境設定
- **TypeScript**: strict mode（tsconfig.json）
- **文字コード**: UTF-8
- **改行コード**: CRLF (Windows)
- **ビルド方式**: EAS Build クラウドビルド（ローカルに Android Studio / Java 不要）
- **開発実行**: dev client（Expo Go では ML Kit / Skia 非対応のため）

## プロジェクト構造
```
snappoly/
├── .claude/
│   └── CLAUDE.md              # このファイル
├── app/                        # expo-router ページ
│   ├── _layout.tsx             # ルートレイアウト
│   ├── index.tsx               # ホーム（撮影/ギャラリー選択）
│   └── result.tsx              # メッシュ結果表示 + 保存
├── components/
│   ├── camera/                 # カメラ関連UI
│   ├── detection/              # 検出結果オーバーレイ
│   ├── mesh/                   # メッシュ描画（Skia）
│   └── ui/                     # 共通UIコンポーネント
├── hooks/                      # useCamera, useFaceDetect, useTriangulate 等
├── services/                   # detection, triangulation, colorSampler
├── types/                      # Point, MeshData, DetectionResult 等
├── utils/                      # geometry, constants
├── assets/                     # フォント、アイコン、サウンド
├── app.json
├── eas.json
├── tsconfig.json
└── package.json
```

※ プロジェクト構造は開発進行に伴い更新すること

## 子供向け UX 要件
- **大きなタップターゲット**: ボタンは最低 48x48dp、メイン操作は 64dp 以上
- **カラフルで楽しいUI**: 丸みのあるボタン、明るい配色、アイコン付き
- **ポジティブなフィードバック**: エラー時も「もう一回やってみよう！」のような文言
- **簡単な操作フロー**: 最大2タップで撮影→結果表示
- **オフライン動作**: ML Kit はオンデバイスなので通信不要

## 実装フェーズ

### Phase 1: セットアップ + カメラ + 顔検出 + メッシュ表示（MVP）
- Expo プロジェクト初期化 + NativeWind + TypeScript 設定
- ホーム画面: 「撮影」「ギャラリーから選ぶ」の大きなカラフルボタン
- カメラ画面: expo-camera でフルスクリーン撮影
- ML Kit 顔検出: 静止画から顔輪郭133点を取得
- Delaunator で三角形分割 + Skia でメッシュ描画
- 元画像から色サンプリング → カラフルなローポリ表示
- 「保存」ボタンでギャラリーに保存
- EAS Build で開発用 APK → 実機テスト

### Phase 2: ペット対応 + 手動モード
- 手動ポイント配置（「点つなぎ遊び」）
- TFLite セグメンテーション（犬/ペット対応）検討

### Phase 3: カスタマイズ + 共有
- カラーパレット選択、メッシュ密度スライダー
- 共有ボタン（expo-sharing）

### Phase 4: 3D化 + STL出力
- WebView + Three.js で 3D プレビュー
- STLExporter で出力

### Phase 5: ポートフォリオ連携
- arussys.com の /portfolio にスクリーンショット・動画を掲載

## 設計上の注意点
- **Expo Go 非対応**: ML Kit / Skia は dev client + config plugin 必須
- **Skia Indexed 頂点非対応**: Triangle list に展開する変換関数が必要
- **メモリ管理**: 大きな写真は expo-image-manipulator でリサイズしてから処理
- **ポイント数制限**: 顔 ~200点、手動 ~50点（delaunator の GC 負荷対策）
- **expo-gl は使わない**: 壊れているため。2D は Skia、3D は WebView + Three.js

## プロジェクトパス
- **ソースコード**: C:\Users\南井大\Documents\ArusSystems\dev\snappoly
- **開発ドキュメント**: C:\Users\南井大\Documents\ArusSystems\doc\snappoly
- **実装プラン**: C:\Users\南井大\Documents\ArusSystems\doc\arussys-web\steering\26.03.02\lowpoly-kids-plan.md

## 既知の問題
（なし）

## 開発原則

### コード品質
- **必要十分な実装**: 過度な抽象化を避ける
- **単一責任の原則**: 各モジュールは一つの責任を持つ
- **早期リターン**: ネストを浅く保つ
- **型安全性**: strict mode で厳格な型チェック

### 命名規則
- **コンポーネント**: PascalCase (例: CameraView.tsx)
- **ページ**: camelCase (例: index.tsx, result.tsx) ※expo-router のファイルベースルーティング規約
- **サービス**: camelCase (例: faceDetection.ts)
- **フック**: camelCase、use プレフィックス (例: useFaceDetect.ts)
- **型定義**: PascalCase (例: MeshData, DetectionResult)
- **定数**: UPPER_SNAKE_CASE (例: MAX_POINT_COUNT)

## 会話開始時の指示
ユーザーの最初のメッセージが「作業開始」「続き」等の場合：
1. CLAUDE.mdの設定を確認済みであればOKと伝える
2. steering/の最新日付フォルダのdecisions.mdを確認
3. 「次のアクション」があれば提示する
