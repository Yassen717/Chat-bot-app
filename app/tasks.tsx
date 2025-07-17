import React from 'react';
import { Text, View } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';

export default function Tasks() {
  return (
    <View className="flex-1 bg-gray-50">
      <Text className="text-center mt-10 text-xl font-bold">Tasks Page</Text>
      <BottomNavBar />
    </View>
  );
} 