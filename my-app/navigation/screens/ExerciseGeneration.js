import { Text, TouchableOpacity, View, Modal } from 'react-native';
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
    'Full Body'
];

export default function ExerciseGeneration({ onGenerate }) {
    const [visible, setVisible] = useState(false);
    const [value, setValue] = useState(muscle_groups[0]);

    const open = () => setVisible(true);

    const handleChange = (itemValue) => {
        setValue(itemValue);
        try {
            if (typeof onGenerate === 'function') onGenerate(itemValue);
        } catch (e) {}
        setVisible(false);
    };

    return (
        <View>
            <TouchableOpacity
                style={[styles.hoverButton, { alignSelf: 'flex-start', paddingBottom: 10 }]}
                onPress={open}
            >
                <Text style={{ color: 'white', fontSize: 24, paddingTop: 5 }}>+</Text>
            </TouchableOpacity>

            <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPressOut={() => setVisible(false)}>
                    <View style={styles.popover}>
                        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 6 }}>Select Major Muscle Group</Text>
                        <Picker selectedValue={value} onValueChange={handleChange} style={{ height: 200 }}>
                            {muscle_groups.map((g) => (
                                <Picker.Item key={g} label={g} value={g} color="black" />
                            ))}
                        </Picker>

                        <TouchableOpacity onPress={() => setVisible(false)} style={[styles.addButton, { marginTop: 8 }]}> 
                            <Text style={styles.addButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
