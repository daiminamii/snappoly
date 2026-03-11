import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import type { SkiaDomView } from '@shopify/react-native-skia';
import * as MediaLibrary from 'expo-media-library';
import { File, Paths } from 'expo-file-system/next';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseSaveToGalleryResult {
  save: () => Promise<void>;
  status: SaveStatus;
}

// Canvas のスナップショットを PNG としてギャラリーに保存
export function useSaveToGallery(
  canvasRef: React.RefObject<SkiaDomView | null>,
): UseSaveToGalleryResult {
  const [status, setStatus] = useState<SaveStatus>('idle');

  const save = useCallback(async () => {
    setStatus('saving');

    try {
      // パーミッション要求
      const { status: permStatus } =
        await MediaLibrary.requestPermissionsAsync();

      if (permStatus !== 'granted') {
        Alert.alert(
          'ほぞんできないよ',
          'せっていからしゃしんへのアクセスをきょかしてね',
        );
        setStatus('error');
        return;
      }

      // スナップショット取得
      const image = canvasRef.current?.makeImageSnapshot();
      if (!image) {
        setStatus('error');
        return;
      }

      // 一時ファイルに書き出してギャラリーへ保存
      const tempFile = new File(Paths.cache, `snappoly_${Date.now()}.png`);
      tempFile.create();
      tempFile.write(image.encodeToBase64(), { encoding: 'base64' });
      await MediaLibrary.saveToLibraryAsync(tempFile.uri);
      tempFile.delete();

      setStatus('saved');
    } catch (e) {
      console.error('Save failed:', e);
      setStatus('error');
    }
  }, [canvasRef]);

  return { save, status };
}
