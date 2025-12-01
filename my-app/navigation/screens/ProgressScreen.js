import * as React from 'react';
import { useCallback, useState } from 'react';
import { View, Text, FlatList, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';

export default function ProgressScreen({ navigation }) {
    const [progress, setProgress] = useState([]);
    const [countsByDay, setCountsByDay] = useState([]);
    const [generalProgress, setGeneralProgress] = useState([]);

    const loadProgress = async () => {
        try {
            const raw = await AsyncStorage.getItem('progress');
            const list = raw ? JSON.parse(raw) : [];
            setProgress(list);

            // ----------------------------
            // 1. Build daily progression map
            // ----------------------------
            const map = {}; // { "2025-01-09": 450, ... }

            list.forEach(log => {
                const date = (log.loggedAt || '').split("T")[0];
                const weight = Number(log.weight) || 0;
                const reps = Number(log.reps) || 0;

                // progression score = weight × reps
                const score = weight * reps;

                if (!map[date]) map[date] = 0;
                map[date] += score;
            });

            // ----------------------------
            // 2. Build last 7 days timeline
            // ----------------------------
            const now = new Date();
            const last7 = [];

            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                const key = d.toISOString().split("T")[0];

                last7.push({
                    date: key,
                    score: map[key] || 0
                });
            }

            setGeneralProgress(last7);

            // ----------------------------
            // 3. Keep your original count trend
            // ----------------------------
            const labels = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                labels.push(d.toISOString().split('T')[0]);
            }

            const counts = labels.map(lbl =>
                list.filter(p => (p.loggedAt || '').split('T')[0] === lbl).length
            );

            setCountsByDay(
                labels.map((lbl, idx) => ({ date: lbl, count: counts[idx] }))
            );

        } catch (e) {
            console.error('Failed loading progress', e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadProgress();
        }, [])
    );

    const renderItem = ({ item }) => (
        <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>{item.exercise}</Text>
            <Text style={{ color: '#666' }}>{item.reps} reps · {item.weight} lbs</Text>
            <Text style={{ color: '#999', marginTop: 6 }}>
                {new Date(item.loggedAt).toLocaleString()}
            </Text>
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            {/* HEADER */}
            <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#ddd' }}>
                <Text
                    onPress={() => navigation.navigate('Home')}
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                >
                    Progress
                </Text>
            </View>

            {/* -------------------------------------- */}
            {/* GENERAL PROGRESSION LINE GRAPH (NEW)   */}
            {/* -------------------------------------- */}
            <View style={{ paddingHorizontal: 12, paddingTop: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                    Overall Muscle Progression
                </Text>

                {generalProgress.length > 0 ? (
                    <LineChart
                        data={{
                            labels: generalProgress.map(p =>
                                new Date(p.date).toLocaleDateString(undefined, { weekday: "short" })
                            ),
                            datasets: [
                                {
                                    data: generalProgress.map(p => p.score),
                                    strokeWidth: 3,
                                }
                            ]
                        }}
                        width={Dimensions.get("window").width - 24}
                        height={230}
                        withInnerLines={false}
                        chartConfig={{
                            backgroundGradientFrom: "#fff",
                            backgroundGradientTo: "#fff",
                            color: (opacity = 1) => `rgba(76,175,80,${opacity})`,
                            labelColor: () => "#555",
                            propsForDots: {
                                r: "5",
                                strokeWidth: "2",
                                stroke: "#4caf50"
                            }
                        }}
                        bezier
                        style={{ borderRadius: 12, paddingRight: 36 }}
                    />
                ) : (
                    <Text style={{ color: "#777" }}>No progression data yet.</Text>
                )}
            </View>

            {/* LOG LIST */}
            <FlatList
                data={progress}
                keyExtractor={(it) => it.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={{ padding: 24 }}>
                        <Text style={{ color: '#666' }}>No progress logged yet.</Text>
                    </View>
                }
            />
        </View>
    );
}
