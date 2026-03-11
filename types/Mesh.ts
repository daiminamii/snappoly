export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MeshData {
  /** [x0, y0, x1, y1, ...] — triangle-list 展開済み（共有頂点なし） */
  positions: Float32Array;
  /** 頂点ごとの Skia カラー（Int32） */
  colors: Int32Array;
  /** 元画像の幅 */
  width: number;
  /** 元画像の高さ */
  height: number;
}

export type ProcessingStatus =
  | 'idle'
  | 'resizing'
  | 'detecting'
  | 'triangulating'
  | 'coloring'
  | 'done'
  | 'error';
