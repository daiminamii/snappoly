import { useRef } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import type { SkiaDomView } from '@shopify/react-native-skia';
import { useFaceMesh } from '../hooks/useFaceMesh';
import { useSaveToGallery } from '../hooks/useSaveToGallery';
import { FaceMeshCanvas } from '../components/mesh/FaceMeshCanvas';
import { ProcessingOverlay } from '../components/ui/ProcessingOverlay';

// メッシュ生成結果の表示 + ギャラリー保存
export default function ResultScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const { mesh, status, error } = useFaceMesh(imageUri);
  const canvasRef = useRef<SkiaDomView>(null);
  const { save, status: saveStatus } = useSaveToGallery(canvasRef);

  const isProcessing =
    status === 'resizing' ||
    status === 'detecting' ||
    status === 'triangulating' ||
    status === 'coloring';

  // 画像未選択
  if (!imageUri) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-2xl font-bold text-gray-800">
          しゃしんがないよ
        </Text>
      </View>
    );
  }

  // パイプライン処理中
  if (isProcessing) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <ProcessingOverlay status={status} />
      </View>
    );
  }

  // パイプラインエラー
  if (status === 'error') {
    return (
      <View className="flex-1 items-center justify-center gap-6 px-8">
        <Text className="text-center text-2xl font-bold text-gray-800">
          {error}
        </Text>
        <Image
          source={{ uri: imageUri }}
          className="aspect-square w-full rounded-2xl"
          resizeMode="cover"
        />
        <Pressable
          onPress={() => router.back()}
          android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
          className="min-h-[48px] items-center justify-center rounded-xl bg-gray-200 px-6 py-3 active:bg-gray-300"
        >
          <Text className="text-lg font-bold text-gray-700">← もどる</Text>
        </Pressable>
      </View>
    );
  }

  if (status !== 'done' || !mesh) return null;

  const isSaving = saveStatus === 'saving';

  // メッシュ完成 → 表示 + 保存/戻るボタン
  return (
    <View className="flex-1 items-center justify-center gap-6 px-8">
      <Text className="text-2xl font-bold text-gray-800">できたよ！</Text>
      <FaceMeshCanvas ref={canvasRef} mesh={mesh} />

      {/* 保存ステータス表示 */}
      {saveStatus === 'saved' && (
        <Text className="text-lg font-bold text-green-600">ほぞんしたよ！</Text>
      )}
      {saveStatus === 'error' && (
        <Text className="text-lg font-bold text-red-500">
          ほぞんできなかったよ…
        </Text>
      )}

      {/* アクションバー */}
      <View className="w-full flex-row gap-4">
        <Pressable
          onPress={save}
          disabled={isSaving}
          android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
          className="min-h-[64px] flex-1 items-center justify-center rounded-2xl bg-green-500 active:bg-green-600"
          style={isSaving ? { opacity: 0.6 } : undefined}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-xl font-bold text-white">ほぞん</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
          className="min-h-[64px] flex-1 items-center justify-center rounded-2xl bg-gray-200 active:bg-gray-300"
        >
          <Text className="text-xl font-bold text-gray-700">もどる</Text>
        </Pressable>
      </View>
    </View>
  );
}
