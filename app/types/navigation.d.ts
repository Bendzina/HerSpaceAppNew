import { NavigatorScreenParams } from '@react-navigation/native';

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      // Add your screen definitions here
      activity: {
        activity: string; // JSON string of the activity
      };
      // Add other screens as needed
    }
  }
}

// This makes the file a module
export {};
