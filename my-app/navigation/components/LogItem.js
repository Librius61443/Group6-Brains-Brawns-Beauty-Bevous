import React, { useState, useRef, useEffect } from 'react';

import Checkbox from 'expo-checkbox';
import { Text, TouchableOpacity, View, Animated, Easing } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { styles } from '../../styles/homeStyles';


export default function LogItem({ item, checkBox, onDelete, setOnEdit, onEdit}) {

    const [checked, setChecked] = useState(false);

    // Animated value for horizontal translation while dragging
    const translateX = useRef(new Animated.Value(0)).current;

    // persisted offset between gestures (number)
    const offsetRef = useRef(0);

    // track whether we've already triggered deletion to avoid double-calls
    const deletedRef = useRef(false);

    useEffect(() => {
        return () => {
            // stop any running animation when unmounting
            translateX.stopAnimation();
        };
    }, [translateX]);

    // Gesture event mapping: update translateX while dragging
    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = ({ nativeEvent }) => {
        const { translationX, velocityX, state } = nativeEvent;

    if (state === State.END || state === State.CANCELLED) {
      translateX.flattenOffset(); // ensures smooth start point

      // Swipe right → close
      if (translationX > 20) {
        deletedRef.current = false;
        Animated.timing(translateX, {
          toValue: 0,
          duration: 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
        return;
      }

      // Swipe far left → delete
      if (translationX < -150) {
        if (!deletedRef.current) {
          deletedRef.current = true;
          Animated.timing(translateX, {
            toValue: -300,
            duration: 150,
            useNativeDriver: true,
          }).start(() => onDelete(item.id));
        }
        return;
      }

      // Otherwise → snap to partial open
      Animated.timing(translateX, {
        toValue: -100,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
    };

    // Clamp translateX so it doesn't go too far left
    const translateXClamped = translateX.interpolate
        ? translateX.interpolate({ inputRange: [-300, 0], outputRange: [-300, 0], extrapolate: 'clamp' })
        : translateX;

    return (
        <View style={{ marginVertical: 6 }}>
            {/* Delete background button visible while swiping */}
            <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'flex-end', width: 150, paddingRight: 8 }}>
                    <TouchableOpacity style={styles.deleteBox} onPress={() => onDelete(item.id)}>
                        <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                </View>

            <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
                <Animated.View style={[styles.logItem, { transform: [{ translateX: translateXClamped }] }]}> 
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={styles.exercise}>{item.exercise}</Text>
                        <Text style={styles.meta}>{item.reps} reps · {item.weight} lbs</Text>
                    </View>

                    {checkBox ? (
                        <View style={{ marginRight: 10 }}>
                            <Checkbox value={checked} onValueChange={setChecked} />
                        </View>
                    ) : null}
                    {onEdit ? (
                        <TouchableOpacity
                            style={{ paddingVertical: 6, paddingHorizontal: 15 }}
                            onPress={() => setOnEdit(item.id)}>
                            <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>
                    ) : null}
                </Animated.View>
            </PanGestureHandler>
        </View>
    );
}