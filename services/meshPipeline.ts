import type { MeshData, Point, ProcessingStatus, Rect } from '../types/Mesh';
import { resizeImage } from './imageResizer';
import { detectFaces } from './faceDetector';
import { triangulate } from './triangulator';
import { buildMeshData } from './colorSampler';

export interface PipelineResult {
  mesh: MeshData | null;
  resizedUri: string;
  error?: string;
}

// 画像 → リサイズ → 顔検出 → 三角形分割 → 色サンプリング
// 顔がなくても背景グリッドのみでメッシュ生成
export async function runMeshPipeline(
  imageUri: string,
  onStatus: (status: ProcessingStatus) => void,
): Promise<PipelineResult> {
  // リサイズ
  onStatus('resizing');
  const resized = await resizeImage(imageUri);

  // 顔検出（失敗時はスキャッター点のみで続行）
  onStatus('detecting');
  let facePoints: Point[] = [];
  let faceRects: Rect[] = [];
  try {
    const faceData = await detectFaces(resized.uri);
    facePoints = faceData.points;
    faceRects = faceData.rects;
  } catch {
    // 検出失敗時はスキャッター点のみ
  }

  // 三角形分割
  onStatus('triangulating');
  const triangulation = triangulate(
    facePoints,
    faceRects,
    resized.width,
    resized.height,
  );

  // 色サンプリング + メッシュ構築
  onStatus('coloring');
  const mesh = await buildMeshData(
    triangulation,
    resized.uri,
    resized.width,
    resized.height,
  );

  if (!mesh) {
    return { mesh: null, resizedUri: resized.uri, error: 'color_sample_failed' };
  }

  onStatus('done');
  return { mesh, resizedUri: resized.uri };
}
