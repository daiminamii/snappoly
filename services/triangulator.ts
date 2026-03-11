import Delaunator from "delaunator";
import type { Point, Rect } from "../types/Mesh";

/** 共線性フィルタの sin(θ) 閾値 */
const COLLINEARITY_SIN_THRESHOLD = 0.02;

/** 重複点とみなす距離（px） */
const DEDUP_DISTANCE = 1.0;

/** 境界の辺ごとの分割数 */
const BOUNDARY_DIVISIONS = 8;

/** 背景スキャッター点のセルサイズ（px） — 大きいほど荒い三角 */
const SCATTER_CELL_SIZE = 40;

/** 顔領域の密なグリッドのセルサイズ（px） */
const FACE_CELL_SIZE = 35;

/**
 * 連続する3点が直線上にある場合、中間点を除去する
 * 退化三角形（面積≒0）を防止
 */
function removeCollinearPoints(points: Point[]): Point[] {
  if (points.length <= 3) return points;

  const result: Point[] = [];
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];

    const ax = curr.x - prev.x,
      ay = curr.y - prev.y;
    const bx = next.x - curr.x,
      by = next.y - curr.y;
    const lenA = Math.sqrt(ax * ax + ay * ay);
    const lenB = Math.sqrt(bx * bx + by * by);

    if (lenA === 0 || lenB === 0) continue;

    const cross = ax * by - ay * bx;
    if (Math.abs(cross) / (lenA * lenB) >= COLLINEARITY_SIN_THRESHOLD) {
      result.push(curr);
    }
  }

  return result.length >= 3 ? result : points;
}

/**
 * 距離が閾値未満の重複点を除去する
 */
function deduplicatePoints(points: Point[]): Point[] {
  const result: Point[] = [];
  const distSq = DEDUP_DISTANCE * DEDUP_DISTANCE;

  for (const pt of points) {
    const isDuplicate = result.some(
      (r) => (r.x - pt.x) ** 2 + (r.y - pt.y) ** 2 < distSq,
    );
    if (!isDuplicate) result.push(pt);
  }

  return result;
}

/**
 * 画像境界に沿って均等に点を配置する
 */
function generateBoundaryPoints(width: number, height: number): Point[] {
  const points: Point[] = [];
  const div = BOUNDARY_DIVISIONS;

  // 4隅
  points.push({ x: 0, y: 0 });
  points.push({ x: width, y: 0 });
  points.push({ x: width, y: height });
  points.push({ x: 0, y: height });

  // 辺に沿った分割点
  for (let i = 1; i < div; i++) {
    const t = i / div;
    points.push({ x: width * t, y: 0 }); // 上辺
    points.push({ x: width * t, y: height }); // 下辺
    points.push({ x: 0, y: height * t }); // 左辺
    points.push({ x: width, y: height * t }); // 右辺
  }

  return points;
}

/**
 * 画像全体にジッター付きグリッド点を生成（背景用）
 */
function generateScatterPoints(width: number, height: number): Point[] {
  const points: Point[] = [];
  const cols = Math.ceil(width / SCATTER_CELL_SIZE);
  const rows = Math.ceil(height / SCATTER_CELL_SIZE);

  // 簡易シード付き乱数（同じ画像サイズなら同じ結果）
  let seed = 42;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const jitter = SCATTER_CELL_SIZE * 0.4;

  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      const cx = c * SCATTER_CELL_SIZE;
      const cy = r * SCATTER_CELL_SIZE;
      const x = cx + (rand() - 0.5) * 2 * jitter;
      const y = cy + (rand() - 0.5) * 2 * jitter;
      if (x > 0 && x < width && y > 0 && y < height) {
        points.push({ x, y });
      }
    }
  }

  return points;
}

/**
 * 顔バウンディングボックス内に密なグリッド点を生成
 */
function generateFaceDensePoints(rects: Rect[]): Point[] {
  const points: Point[] = [];

  let seed = 123;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (const rect of rects) {
    const cols = Math.max(1, Math.ceil(rect.width / FACE_CELL_SIZE));
    const rows = Math.max(1, Math.ceil(rect.height / FACE_CELL_SIZE));
    const jitter = FACE_CELL_SIZE * 0.3;

    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const cx = rect.x + (c / cols) * rect.width;
        const cy = rect.y + (r / rows) * rect.height;
        const x = cx + (rand() - 0.5) * 2 * jitter;
        const y = cy + (rand() - 0.5) * 2 * jitter;
        points.push({ x, y });
      }
    }
  }

  return points;
}

export interface TriangulationResult {
  /** 全頂点 (face + scatter + boundary, deduplicated) */
  points: Point[];
  /** 三角形インデックス [i0, i1, i2, ...] */
  triangles: Uint32Array;
}

/**
 * 顔の輪郭点 + 顔バウンディングボックス密度 + 背景スキャッター + 画像境界 → Delaunay 三角形分割
 */
export function triangulate(
  facePoints: Point[],
  faceRects: Rect[],
  imageWidth: number,
  imageHeight: number,
): TriangulationResult {
  const filtered = removeCollinearPoints(facePoints);
  const faceDense = generateFaceDensePoints(faceRects);
  const scatter = generateScatterPoints(imageWidth, imageHeight);
  const boundary = generateBoundaryPoints(imageWidth, imageHeight);
  const combined = deduplicatePoints([
    ...filtered,
    ...faceDense,
    ...scatter,
    ...boundary,
  ]);

  // Delaunator の入力: flat Float64Array [x0, y0, x1, y1, ...]
  const coords = new Float64Array(combined.length * 2);
  for (let i = 0; i < combined.length; i++) {
    coords[i * 2] = combined[i].x;
    coords[i * 2 + 1] = combined[i].y;
  }

  const delaunay = new Delaunator(coords);

  return {
    points: combined,
    triangles: delaunay.triangles,
  };
}
