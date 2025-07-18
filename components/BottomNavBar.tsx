import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const navItems = [
  { name: 'Chats', route: '/chats', icon: '💬' },
  { name: 'Tasks', route: '/tasks', icon: '✅' },
  { name: 'New', route: '/new', icon: '+' }, // زر أوسط كبير
  { name: 'Profile', route: '/profile', icon: '👤' },
];

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="flex-row items-center justify-between bg-white px-2 pt-2 pb-6 border-t border-gray-200 absolute bottom-0 left-0 right-0">
      {/* Chats */}
      <TouchableOpacity
        className="flex-1 items-center"
        onPress={() => router.push('/chats')}
      >
        <Text className={`text-2xl ${pathname === '/chats' ? 'text-blue-600' : 'text-gray-400'}`}>💬</Text>
        <Text className={`text-xs mt-1 ${pathname === '/chats' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>Chats</Text>
      </TouchableOpacity>
      {/* Tasks */}
      <TouchableOpacity
        className="flex-1 items-center"
        onPress={() => router.push('/tasks')}
      >
        <Text className={`text-2xl ${pathname === '/tasks' ? 'text-blue-600' : 'text-gray-400'}`}>✅</Text>
        <Text className={`text-xs mt-1 ${pathname === '/tasks' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>Tasks</Text>
      </TouchableOpacity>
      {/* زر أوسط كبير */}
      <TouchableOpacity
        className="items-center justify-center bg-blue-600 rounded-full w-16 h-16 -mt-8 shadow-lg border-4 border-white"
        onPress={() => router.push('/new')}
        style={{ elevation: 8 }}
      >
        <Text className="text-white text-3xl font-bold">+</Text>
      </TouchableOpacity>
      {/* Profile */}
      <TouchableOpacity
        className="flex-1 items-center"
        onPress={() => router.push('/profile')}
      >
        <Text className={`text-2xl ${pathname === '/profile' ? 'text-blue-600' : 'text-gray-400'}`}>👤</Text>
        <Text className={`text-xs mt-1 ${pathname === '/profile' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
} 