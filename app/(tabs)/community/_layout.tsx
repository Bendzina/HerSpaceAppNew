import { Stack } from 'expo-router';
import React from 'react';

export default function CommunityLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Community',
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Post Details',
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: 'New Post',
          headerLargeTitle: false,
        }}
      />
    </Stack>
  );
}
