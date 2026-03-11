import { View, Text, ActivityIndicator } from 'react-native';
import type { ProcessingStatus } from '../../types/Mesh';

const STATUS_MESSAGES: Partial<Record<ProcessingStatus, string>> = {
  resizing: 'しゃしんをじゅんびしてるよ...',
  detecting: 'おかおをさがしてるよ...',
  triangulating: 'さんかくをつくってるよ...',
  coloring: 'いろをぬってるよ...',
};

interface ProcessingOverlayProps {
  status: ProcessingStatus;
}

export function ProcessingOverlay({ status }: ProcessingOverlayProps) {
  const message = STATUS_MESSAGES[status];
  if (!message) return null;

  return (
    <View className="flex-1 items-center justify-center gap-6">
      <ActivityIndicator size="large" color="#ec4899" />
      <Text className="text-2xl font-bold text-gray-700">{message}</Text>
    </View>
  );
}
