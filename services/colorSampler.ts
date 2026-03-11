import { Skia, ColorType, AlphaType } from '@shopify/react-native-skia';
import type { MeshData } from '../types/Mesh';
import type { TriangulationResult } from './triangulator';

/**
 * 画像 URI からピクセルバッファを読み取る
 */
async function loadPixels(
  uri: string,
): Promise<{ pixels: Uint8Array; width: number; height: number } | null> {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  const data = Skia.Data.fromBytes(new Uint8Array(arrayBuffer));
  const image = Skia.Image.MakeImageFromEncoded(data);
  if (!image) return null;

  const width = image.width();
  const height = image.height();
  const pixels = image.readPixels(0, 0, {
    width,
    height,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  });
  if (!pixels) return null;

  return { pixels: pixels as Uint8Array, width, height };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * ピクセルバッファから座標の色を取得し、Skia Color (Int32) として返す
 * RGBA バイト順 → Skia は ARGB packed int
 */
function sampleColor(
  pixels: Uint8Array,
  imgWidth: number,
  imgHeight: number,
  x: number,
  y: number,
): number {
  const px = clamp(Math.round(x), 0, imgWidth - 1);
  const py = clamp(Math.round(y), 0, imgHeight - 1);
  const offset = (py * imgWidth + px) * 4;

  const r = pixels[offset];
  const g = pixels[offset + 1];
  const b = pixels[offset + 2];
  // Skia Color packed as 0xAARRGGBB
  // eslint-disable-next-line no-bitwise
  return (0xff << 24) | (r << 16) | (g << 8) | b;
}

/**
 * 三角形分割結果 + 画像ピクセル → フラットシェーディングの MeshData
 *
 * indexed mesh を展開して各三角形が独立した3頂点を持つようにする。
 * 各三角形の重心で色をサンプリング（フラットシェーディング）。
 */
export async function buildMeshData(
  triangulation: TriangulationResult,
  imageUri: string,
  imageWidth: number,
  imageHeight: number,
): Promise<MeshData | null> {
  const pixelData = await loadPixels(imageUri);
  if (!pixelData) return null;

  const { points, triangles } = triangulation;
  const triCount = triangles.length / 3;

  // 展開後: 各三角形 × 3頂点
  const vertexCount = triCount * 3;
  const positions = new Float32Array(vertexCount * 2);
  const colors = new Int32Array(vertexCount);

  for (let t = 0; t < triCount; t++) {
    const i0 = triangles[t * 3];
    const i1 = triangles[t * 3 + 1];
    const i2 = triangles[t * 3 + 2];

    const p0 = points[i0];
    const p1 = points[i1];
    const p2 = points[i2];

    // 重心
    const cx = (p0.x + p1.x + p2.x) / 3;
    const cy = (p0.y + p1.y + p2.y) / 3;

    const color = sampleColor(
      pixelData.pixels,
      pixelData.width,
      pixelData.height,
      cx,
      cy,
    );

    // 展開: 3頂点に同じ色を割り当て（フラットシェーディング）
    const base = t * 3;
    positions[(base + 0) * 2] = p0.x;
    positions[(base + 0) * 2 + 1] = p0.y;
    positions[(base + 1) * 2] = p1.x;
    positions[(base + 1) * 2 + 1] = p1.y;
    positions[(base + 2) * 2] = p2.x;
    positions[(base + 2) * 2 + 1] = p2.y;

    colors[base + 0] = color;
    colors[base + 1] = color;
    colors[base + 2] = color;
  }

  return { positions, colors, width: imageWidth, height: imageHeight };
}
