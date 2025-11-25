import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../styles/homeStyles';
import LogForm from '../components/LogForm';
import LogItem from '../components/LogItem';
import ExerciseGeneration from './ExerciseGeneration';


export default function CalendarScreen({ navigation }) {
    const [days] = useState([
        {id: '1', day: 'Monday'},
        {id: '2', day: 'Tuesday'},
        {id: '3', day: 'Wednesday'},
        {id: '4', day: 'Thursday'},
        {id: '5', day: 'Friday'},
        {id: '6', day: 'Saturday'},
        {id: '0', day: 'Sunday'},
    ]);

    const [placeholders, setPlaceholders] = useState({
        exercise: '',
        reps: '',
        weight: ''
    });

    const storeData = async (key, value) => {
      try {
        await AsyncStorage.setItem(key, value);
        console.log('Data stored successfully!');
      } catch (error) {
        console.error('Error storing data:', error);
      }
    };

    useFocusEffect(
      useCallback(() => {
        async function fetchLogs() {
          const stored = await AsyncStorage.getItem('logs');
          if (stored) {
            setLogs(JSON.parse(stored));
          }
        }
        fetchLogs();
      }, [])
    );

    const [logs, setLogs] = useState([]);
    // const [showForm, setShowForm] = useState(false);

    // default selected day = today (0 = Sunday ... 6 = Saturday)
    const todayId = new Date().getDay().toString();
    const [selectedDay, setSelectedDay] = useState(todayId);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeDay, setActiveDay] = useState(null); // used to show the add/edit form when equals selectedDay
    // picker moved into ExerciseGeneration; CalendarScreen will receive generated group via onGenerate

    const EXERCISES_BY_GROUP = {
        Chest: ['Bench Press', 'Push-up', 'Chest Fly', 'Incline Press', 'Dips', 'Lower To Upper', 'Upper To Lower'],
        Back: ['Pull-up', 'Bent-over Row', 'Lat Pulldown', 'Seated Cable Row', 'Deadlift', 'Dumbbell Row'],
        Legs: ['Squat', 'Lunge', 'Leg Press', 'Leg Extension', 'Leg Curl', 'Calf Raise', 'Sumo Squat', 'Bulgarian Split Squat'],
        Shoulders: ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Reverse Fly'],
        Arms: ['Bicep Curl', 'Tricep Dip', 'Hammer Curl', 'Preacher Curl', 'Forearm Curl', 'Tricep Pushdown', 'Diamond Push-up', 'Overhead Tricep Extension'],
        Core: ['Plank', 'Crunch', 'Russian Twist', 'Leg Raise', 'Bicycle Crunch'],
        'Full Body': ['Burpee', 'Thruster', 'Clean and Press']
    };
    
    function addLog(newLog) {
        setLogs(prev => {
            const updated = [newLog, ...prev];
            storeData("logs", JSON.stringify(updated));
            return updated;
        });
    }

    function editLog(editedLog) {
        const updatedLogs = logs.map(log => log.exercise === editedLog.exercise ? editedLog : log);
        setLogs(updatedLogs);
        storeData('logs', JSON.stringify(updatedLogs));
    }
    
    // Group logs by day id for quick lookup
    const logsByDay = days.reduce((acc, day) => {
        acc[day.id] = [];
        return acc;
    }, {});
    logs.forEach(log => {
        if (log.dayId && logsByDay[log.dayId]) {
            logsByDay[log.dayId].push(log);
        }
    });

    return (
        <View style={styles.container}>
            {/* Header row for selected day with Add button */}
            <View style={styles.logItemRow}>
                {/* Dropdown selector for day of week */}
                <View style={{position: 'relative', zIndex: 9999 }}>
                    <TouchableOpacity
                        onPress={() => setShowDropdown(!showDropdown)}
                        style={{
                            borderWidth: 1,
                            borderColor: '#ccc',
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            borderRadius: 8,
                            backgroundColor: '#fff',
                            minWidth: 150
                        }}
                    >
                        <Text style={{ fontSize: 16 }}>{days.find(d => d.id === selectedDay)?.day || 'Select day'}</Text>
                        <Text style={{ position: 'absolute', right: 10, top: 14, fontSize: 12 }}>{showDropdown ? '▲' : '▼'}</Text>
                    </TouchableOpacity>

                    {showDropdown ? (
                        <View
                            style={{
                                position: 'absolute',
                                top: 52,
                                left: 0,
                                right: 0,
                                borderWidth: 1,
                                borderColor: '#ddd',
                                borderRadius: 8,
                                backgroundColor: '#fff',
                                zIndex: 9999,
                                elevation: 6,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.15,
                                shadowRadius: 4,
                            }}
                        >
                            {days.map(d => (
                                <TouchableOpacity
                                    key={d.id}
                                    onPress={() => {
                                        setSelectedDay(d.id);
                                        setShowDropdown(false);
                                        // close any inline form from a previously selected day
                                        setActiveDay(null);
                                    }}
                                    style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#f2f2f2' }}
                                >
                                    <Text style={{ fontSize: 15 }}>{d.day}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : null}
                </View>

                {activeDay === selectedDay ? null : (
                    <TouchableOpacity
                        style={[styles.addButton, { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 }]}
                        onPress={() => {
                            setActiveDay(selectedDay);
                            setPlaceholders({
                                exercise: 'Exercise',
                                reps: 'Reps',
                                weight: 'Weight (lbs)'
                            });
                        }}
                    >
                        <Text style={styles.addButtonText}>+ Add</Text>
                    </TouchableOpacity>
                )}
            </View>

            {activeDay === selectedDay ? (
                <View>
                    <LogForm
                        onCancel={() => setActiveDay(null)}
                        onSave={(newLog) => {
                            const newExercise = newLog.exercise.trim().toLowerCase();
                            const alreadyExists = logs.some(
                                (log) => log.dayId === selectedDay && log.exercise.trim().toLowerCase() === newExercise
                            );

                            if (alreadyExists) {
                                editLog({ ...newLog, dayId: selectedDay, id: logs.find(log => log.dayId === selectedDay && log.exercise.trim().toLowerCase() === newExercise).id });
                                setActiveDay(null);
                                return;
                            }

                            addLog({ ...newLog, dayId: selectedDay, id: Date.now().toString() });
                            setActiveDay(null);
                        }}
                        placeholderExercise={placeholders.exercise}
                        placeholderReps={placeholders.reps}
                        placeholderWeight={placeholders.weight}
                    />
                </View>
            ) : null}

            <FlatList
                data={logsByDay[selectedDay]}
                keyExtractor={(log) => log.id}
                renderItem={({ item: log }) => (
                    <LogItem
                        item={log}
                        checkBox={false}
                        onDelete={(id) => {
                            const updatedLogs = logs.filter((l) => l.id !== id);
                            setLogs(updatedLogs);
                            storeData('logs', JSON.stringify(updatedLogs));
                        }}
                        setOnEdit={() => {
                            setActiveDay(selectedDay);
                            setPlaceholders({
                                exercise: log.exercise || 'Exercise',
                                reps: log.reps || 'Reps',
                                weight: log.weight || 'Weight (lbs)'
                            });
                        }}
                        onEdit={true}
                    />
                )}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.empty}>No logs yet — add your first workout for this day.</Text>}
            />
            <ExerciseGeneration onGenerate={(group) => {
                const choices = EXERCISES_BY_GROUP[group] || [`${group} Exercise`];
                const pool = [...choices];

                // shuffle pool (Fisher-Yates)
                for (let i = pool.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [pool[i], pool[j]] = [pool[j], pool[i]];
                }

                const count = Math.min(4, pool.length);
                for (let i = 0; i < count; i++) {
                    const name = pool[i];
                    const reps = `${8 + Math.floor(Math.random() * 6)}`; // 8-13 reps
                    const weight = "0";
                    addLog({ exercise: name, reps, weight, dayId: selectedDay, id: `${Date.now()}-${i}` });
                }
            }} />
        </View>
    );
}