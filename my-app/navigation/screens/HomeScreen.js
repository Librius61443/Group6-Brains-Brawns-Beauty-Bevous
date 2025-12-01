import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import LocalNotificationsHandler from '../../notifications/LocalNotificationsHandler';
import { styles } from '../../styles/homeStyles';
import LogItem from '../components/LogItem';


export default function HomeScreen() {
    const [logs, setLogs] = useState([ ]);
    


    const fetchLogs = async (key) => {
      try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          // If you saved JSON data in CalendarScreen, parse it here
          const parsed = JSON.parse(value);
          console.log('Retrieved value:', parsed);
          return parsed;
        }
      } catch (error) {
        console.error('Error retrieving data:', error);
      }
    };

    const storeData = async (key, value) => {
      try {
        await AsyncStorage.setItem(key, value);
        console.log('Data stored successfully!');
      } catch (error) {
        console.error('Error storing data:', error);
      }
    };

    // When a checkbox is toggled in the Home list, record or remove a "progress" entry
    const handleCheckedChange = async (item, checked) => {
      try {
        const raw = await AsyncStorage.getItem('progress');
        const progress = raw ? JSON.parse(raw) : [];

        const todayIso = new Date().toISOString().split('T')[0];

        if (checked) {
          const entry = {
            id: `${item.id}-${Date.now()}`,
            itemId: item.id,
            exercise: item.exercise,
            reps: item.reps,
            weight: item.weight,
            loggedAt: new Date().toISOString(),
            dayId: item.dayId,
          };
          const updated = [entry, ...progress];
          await AsyncStorage.setItem('progress', JSON.stringify(updated));
          console.log('Progress entry added', entry);
        } else {
          // remove progress entries for this item logged today
          const filtered = progress.filter(p => {
            const pDate = (p.loggedAt || '').split('T')[0];
            return !(p.itemId === item.id && pDate === todayIso);
          });
          await AsyncStorage.setItem('progress', JSON.stringify(filtered));
          console.log('Progress entries removed for', item.id);
        }
      } catch (e) {
        console.error('Error updating progress', e);
      }
    };

    useFocusEffect(
      useCallback(() => {
        async function fetchLogs() {
          const stored = await AsyncStorage.getItem('logs');
          if (stored) {
            setLogs(JSON.parse(stored));
            console.log('Logs for today:', logsForToday);
          }
        }
        fetchLogs();
      }, [])
    );
    
    const myDate = new Date(); // Or a specific date like new Date("2025-09-22")
    const dayOfWeekIndex = myDate.getDay();

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[dayOfWeekIndex];
    
    function addLog(newLog) {
    setLogs([newLog, ...logs]);
    setShowForm(false);
    }

    // Read data from retrieveData and display logs
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{dayName}</Text>
            </View>
            
              <FlatList
                  data={logs.filter(log => Number(log.dayId) === dayOfWeekIndex)}
                  keyExtractor={(item, index) => item.id ?? index.toString()}
                  renderItem={({ item: log }) => (
                    <View>
                        <LogItem 
                          item={log} 
                          checkBox={true} 
                          onDelete={(id) => {
                          // Filter out deleted log
                          const updatedLogs = logs.filter((l) => l.id !== id);
                          setLogs(updatedLogs);

                          // Persist changes
                          storeData('logs', JSON.stringify(updatedLogs));
                          }}
                          onEdit={false}
                          setOnEdit={() => {}}
                          onCheckedChange={handleCheckedChange}
                        />
                    </View>
                )}
                  contentContainerStyle={styles.list}
                  ListEmptyComponent={<Text style={styles.empty}>No exercises yet — add your first workout.</Text>}
              />
          <LocalNotificationsHandler />

        </View>
    );
}