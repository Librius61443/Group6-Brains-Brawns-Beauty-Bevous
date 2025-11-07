import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/homeStyles';

// Configure how notifications behave when received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,   // show popup
    shouldPlaySound: true,   // play sound
    shouldSetBadge: false,   // no badge on app icon
  }),
});

export default function LocalNotificationsHandler() {
  useEffect(() => {
    // Ask for permission on mount
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission for notifications not granted!');
      }
    }
    requestPermissions();
  }, []);

  const [notiOn, setNoti] = useState(false);

  async function scheduleDailyNotification(hour, minute) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🏋️ Workout Reminder",
      body: `It's ${hour}:${minute < 10 ? "0" + minute : minute} — time to hit the gym!`,
    },
    trigger: {
      hour,
      minute,
      // second: 10, // For testing: trigger after 10 seconds
      repeats: true,
      // type: Notifications.TriggerType.DAILY,
    },
  });
}

  return (
    <View>
      {notiOn ? (
        <TouchableOpacity
          style={[styles.addButton, {backgroundColor: 'grey', alignSelf: 'flex-start', paddingBottom: 10, marginBottom: 20 }]}
          onPress={() => {
            Notifications.cancelAllScheduledNotificationsAsync();
            alert('Notifications cancelled!');
            setNoti(false);
          }}
        >
          <Text style={[styles.NotificationButton , {backgroundColor: 'grey'}]}>Noti On</Text>
        </TouchableOpacity>      
      ) : (
        <TouchableOpacity
          style={[styles.addButton, { alignSelf: 'flex-start', paddingBottom: 10, marginBottom: 20 }]}
          onPress={() => {
            // const hours = time.getHours();
            // const minutes = time.getMinutes();
          scheduleDailyNotification(15, 8);
          alert('Notification scheduled for 15:08 daily!');
          setNoti(true);
        }}
      >
        <Text style={styles.NotificationButton}>Notify me</Text>
      </TouchableOpacity>
      )}
    </View>
  );
}
