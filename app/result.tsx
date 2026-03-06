import { View, Text, Pressable, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function ResultScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  return (
    <View className="flex-1 items-center justify-center gap-6 px-8">
      {imageUri ? (
        <>
          <Text className="text-2xl font-bold text-gray-800">できたよ！</Text>
          <Image
            source={{ uri: imageUri }}
            className="aspect-square w-full rounded-2xl"
            resizeMode="cover"
          />
        </>
      ) : (
        <Text className="text-2xl font-bold text-gray-800">
          しゃしんがないよ
        </Text>
      )}

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
