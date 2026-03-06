import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen() {
  const navigateToResult = (uri: string) => {
    router.push({ pathname: '/result', params: { imageUri: uri } });
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      navigateToResult(result.assets[0].uri);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      navigateToResult(result.assets[0].uri);
    }
  };

  return (
    <View className="flex-1 items-center justify-center gap-8 px-8">
      <Text className="text-4xl font-bold text-gray-800">snappoly</Text>

      <View className="w-full gap-4">
        <Pressable
          onPress={handleTakePhoto}
          android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
          className="min-h-[64px] items-center justify-center rounded-2xl bg-pink-500 px-6 py-4 active:bg-pink-600"
        >
          <Text className="text-xl font-bold text-white">📷 しゃしんをとる</Text>
        </Pressable>

        <Pressable
          onPress={handlePickImage}
          android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
          className="min-h-[64px] items-center justify-center rounded-2xl bg-sky-500 px-6 py-4 active:bg-sky-600"
        >
          <Text className="text-xl font-bold text-white">🖼️ アルバムからえらぶ</Text>
        </Pressable>
      </View>
    </View>
  );
}
