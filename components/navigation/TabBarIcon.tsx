import { Ionicons } from '@expo/vector-icons';
import React from 'react';

type Props = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size?: number;
};

export function TabBarIcon({ name, color, size = 24 }: Props) {
  return <Ionicons name={name} size={size} color={color} />;
}
