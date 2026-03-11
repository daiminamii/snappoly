import type { MeshData, Point, ProcessingStatus, Rect } from '../types/Mesh';
import { resizeImage } from './imageResizer';
import { detectFaces } from './faceDetector';
import { triangulate } from './triangulator';
import { buildMeshData } from './colorSampler';

export interface PipelineResult {
  mesh: MeshData | null;
  error?: string;
}

/**
 * 画像 → ローポリメッシュ生成パイプライン
 *
 * 顔検出はオプション強化。顔がなくても背景グリッドでメッシュ生成する。
 * 犬、風景、集合写真すべて対応。
 */
export async function runMeshPipeline(
  imageUri: string,
  onStatus: (status: ProcessingStatus) => void,
): Promise<PipelineResult> {
  // 1. リサイズ
  onStatus('resizing');
  const resized = await resizeImage(imageUri);

  // 2. 顔検出（失敗しても続行 — 背景グリッドだけでメッシュ生成）
  onStatus('detecting');
  let facePoints: Point[] = [];
  let faceRects: Rect[] = [];
  try {
    const faceData = await detectFaces(resized.uri);
    facePoints = faceData.points;
    faceRects = faceData.rects;
  } catch {
    // 顔検出失敗 — スキャッター点のみで続行
  }

  // 3. 三角形分割
  onStatus('triangulating');
  const triangulation = triangulate(
    facePoints,
    faceRects,
    resized.width,
    resized.height,
  );

  // 4. 色サンプリング + メッシュ構築
  onStatus('coloring');
  const mesh = await buildMeshData(
    triangulation,
    resized.uri,
    resized.width,
    resized.height,
  );

  if (!mesh) {
    return { mesh: null, error: 'color_sample_failed' };
  }

  onStatus('done');
  return { mesh };
}
