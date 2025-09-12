/**
 * DEPRECATED: Do not use.
 * Expo Router manages navigation using file-based routing and layout files.
 * This custom stack was kept temporarily for reference and should not be imported.
 * Replace usages with screens and layouts under `app/`.
 */
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import WelcomeScreen from '../../app/(tabs)/index';
import ProfileScreen from '../../app/(tabs)/ProfileScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  /**
   * DEPRECATED: Use Expo Router's file-based routing instead.
   * This component intentionally returns null.
   */
  return null;
}