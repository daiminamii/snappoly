import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function ResultScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-6 px-8">
      <Text className="text-2xl font-bold text-gray-800">結果画面</Text>

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
