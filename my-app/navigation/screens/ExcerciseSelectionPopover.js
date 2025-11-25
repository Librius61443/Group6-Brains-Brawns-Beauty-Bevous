import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useCallback, useState } from 'react';
import { styles } from '../../styles/homeStyles';
import { Picker } from '@react-native-picker/picker';

const muscle_groups = [
	'Chest',
	'Back',
	'Legs',
	'Shoulders',
	'Arms',
	'Core',
];


export default function ExcerciseSelectionPopover({ visible = true, onClose = () => {}, onSelect = () => {} }) {
    const [value, setValue] = useState(muscle_groups[2]);

    const handleChange = (itemValue) => {
        setValue(itemValue);
        // call parent handler with selected muscle group
        try { onSelect(itemValue); } catch (e) {}
        // close the popover after selection
        try { onClose(); } catch (e) {}
    };

    if (!visible) return null;

    return (
        <View style={styles.popover}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 6 }}>Select Major Muscle Group</Text>
            <Picker
                selectedValue={value}
                onValueChange={handleChange}
                style={{ height: 200 }}
            >
                {muscle_groups.map((group) => (
                    <Picker.Item key={group} label={group} value={group} color="black" />
                ))}
            </Picker>
            <TouchableOpacity onPress={onClose} style={[styles.addButton, { marginTop: 8 }]}>
                <Text style={styles.addButtonText}>Close</Text>
            </TouchableOpacity>
        </View>
    );
}

