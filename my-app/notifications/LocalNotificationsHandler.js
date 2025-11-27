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
  const [time, setTime] = useState(new Date());


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
          style={[styles.hoverButton, {backgroundColor: 'grey', alignSelf: 'flex-start', paddingBottom: 10, marginBottom: 20, paddingVertical: 10, paddingHorizontal: 5, minWidth: 110, height: 50, justifyContent: 'center' }]}
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
          style={[styles.hoverButton, { alignSelf: 'flex-start', paddingBottom: 10, marginBottom: 20, minWidth: 110, height: 50, justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 5 }]}
          onPress={() => {
          const hours = time.getHours();
          const minutes = time.getMinutes();
          scheduleDailyNotification(hours, minutes);
          alert(`Notification scheduled for ${hours}:${minutes < 10 ? "0" + minutes : minutes} daily!`);
          setNoti(true);
        }}
      >
        <Text style={styles.NotificationButton}>Notify me</Text>
      </TouchableOpacity>
      )}
    </View>
  );
}
