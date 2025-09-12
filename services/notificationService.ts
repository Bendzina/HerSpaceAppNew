import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  enabled: 'reminder_enabled',
  hour: 'reminder_hour',
  minute: 'reminder_minute',
  notificationId: 'reminder_notification_id',
};

// Configure how notifications behave when received in foreground
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type ReminderConfig = {
  enabled: boolean;
  hour: number; // 0-23
  minute: number; // 0-59
  notificationId?: string | null;
};

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    // On simulators permissions may always fail; allow code path to continue
    return true;
  }
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const req = await Notifications.requestPermissionsAsync();
  return req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL || false;
}

export async function scheduleDailyReminder(hour: number, minute: number, body?: string): Promise<string> {
  const hasPerm = await requestNotificationPermission();
  if (!hasPerm) throw new Error('Notification permission not granted');

  // Cancel previously scheduled one if stored
  const prevId = await AsyncStorage.getItem(STORAGE_KEYS.notificationId);
  if (prevId) {
    try { await Notifications.cancelScheduledNotificationAsync(prevId); } catch {}
  }

  // If user saves the exact current hour/minute, iOS may fire immediately.
  // Nudge schedule by +1 minute in that edge case to avoid an instant notification.
  const now = new Date();
  let scheduleHour = hour;
  let scheduleMinute = minute;
  if (now.getHours() === hour && now.getMinutes() === minute) {
    scheduleMinute = (minute + 1) % 60;
    if (scheduleMinute === 0) scheduleHour = (hour + 1) % 24;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Gentle check-in',
      body: body ?? 'How are you feeling today? Take a mindful moment to check in.',
    },
    trigger: {
      hour: scheduleHour,
      minute: scheduleMinute,
      repeats: true,
      channelId: 'daily-reminders',
    } as Notifications.CalendarTriggerInput,
  });

  await AsyncStorage.multiSet([
    [STORAGE_KEYS.enabled, 'true'],
    [STORAGE_KEYS.hour, String(hour)],
    [STORAGE_KEYS.minute, String(minute)],
    [STORAGE_KEYS.notificationId, id],
  ]);

  return id;
}

export async function cancelDailyReminder(): Promise<void> {
  const id = await AsyncStorage.getItem(STORAGE_KEYS.notificationId);
  if (id) {
    try { await Notifications.cancelScheduledNotificationAsync(id); } catch {}
  }
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.enabled,
    STORAGE_KEYS.hour,
    STORAGE_KEYS.minute,
    STORAGE_KEYS.notificationId,
  ]);
}

export async function getReminderConfig(): Promise<ReminderConfig> {
  const [enabled, hour, minute, notificationId] = await AsyncStorage.multiGet([
    STORAGE_KEYS.enabled,
    STORAGE_KEYS.hour,
    STORAGE_KEYS.minute,
    STORAGE_KEYS.notificationId,
  ]);
  return {
    enabled: enabled?.[1] === 'true',
    hour: Number(hour?.[1] ?? 20),
    minute: Number(minute?.[1] ?? 0),
    notificationId: notificationId?.[1] ?? null,
  };
}

// Android requires channels for scheduled notifications.
export async function ensureAndroidChannel(): Promise<void> {
  if (Device.platformApiLevel == null) return; // only on Android
  try {
    await Notifications.setNotificationChannelAsync('daily-reminders', {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: undefined,
      vibrationPattern: [200, 100, 200],
      lightColor: '#8b5fbf',
    });
  } catch {}
}

export async function enableReminder(hour: number, minute: number, body?: string): Promise<ReminderConfig> {
  await ensureAndroidChannel();
  const id = await scheduleDailyReminder(hour, minute, body);
  return { enabled: true, hour, minute, notificationId: id };
}

export async function disableReminder(): Promise<void> {
  await cancelDailyReminder();
}

export async function sendTestNotification(body?: string): Promise<void> {
  const hasPerm = await requestNotificationPermission();
  if (!hasPerm) throw new Error('Notification permission not granted');
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test notification',
      body: body ?? 'This is a test notification from HerSpace',
    },
    trigger: null, // fire immediately
  });
}
