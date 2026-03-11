import { RNMLKitFaceDetector } from '@infinitered/react-native-mlkit-face-detection';
import type { Point, Rect } from '../types/Mesh';

export interface FaceDetectionData {
  /** 全顔の輪郭 + ランドマーク点 */
  points: Point[];
  /** 全顔のバウンディングボックス */
  rects: Rect[];
}

let detector: RNMLKitFaceDetector | null = null;

async function getDetector(): Promise<RNMLKitFaceDetector> {
  if (detector && detector.status === 'ready') return detector;

  detector = new RNMLKitFaceDetector(
    {
      performanceMode: 'accurate',
      contourMode: true,
      landmarkMode: true,
      classificationMode: false,
    },
    true,
  );
  await detector.initialize();
  return detector;
}

/**
 * 画像 URI から顔の輪郭点とバウンディングボックスを検出する
 * 顔がなければ空データを返す（エラーではない）
 */
export async function detectFaces(imageUri: string): Promise<FaceDetectionData> {
  const det = await getDetector();
  const result = await det.detectFaces(imageUri);

  if (!result?.faces?.length) return { points: [], rects: [] };

  const points: Point[] = [];
  const rects: Rect[] = [];

  for (const face of result.faces) {
    // バウンディングボックス（全顔で取得可能）
    const frame = face.frame;
    rects.push({
      x: frame.origin.x,
      y: frame.origin.y,
      width: frame.size.x,
      height: frame.size.y,
    });

    // 輪郭点（最も大きい顔のみ ML Kit が返す）
    for (const contour of face.contours) {
      if (!contour.points) continue;
      for (const pt of contour.points) {
        points.push({ x: pt.x, y: pt.y });
      }
    }

    // ランドマーク点（全顔で取得可能）
    for (const landmark of face.landmarks) {
      if (!landmark.position) continue;
      points.push({ x: landmark.position.x, y: landmark.position.y });
    }
  }

  return { points, rects };
}
