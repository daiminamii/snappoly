import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const MAX_DIMENSION = 1024;

interface ResizeResult {
  uri: string;
  width: number;
  height: number;
}

export async function resizeImage(uri: string): Promise<ResizeResult> {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION } }],
    { compress: 1, format: SaveFormat.JPEG },
  );

  // manipulateAsync が width 基準でリサイズ → height は自動計算
  // 縦長画像の場合は height 基準にリサイズし直す
  if (result.height > MAX_DIMENSION) {
    const refit = await manipulateAsync(
      uri,
      [{ resize: { height: MAX_DIMENSION } }],
      { compress: 1, format: SaveFormat.JPEG },
    );
    return { uri: refit.uri, width: refit.width, height: refit.height };
  }

  return { uri: result.uri, width: result.width, height: result.height };
}
