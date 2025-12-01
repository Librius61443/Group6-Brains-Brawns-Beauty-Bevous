import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

// Screens
import CalendarScreen from './screens/CalendarScreen';
import HomeScreen from './screens/HomeScreen';
import ProgressScreen from './screens/ProgressScreen';

//Screen names
const homeName = "Gym Log";
const calendarName = "Schedule";
const progressName = "Progress";

const Tab = createBottomTabNavigator();

function MainContainer() {
  return (
    <NavigationContainer>
    <Tab.Navigator
      initialRouteName={homeName}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let rn = route.name;

          if (rn === homeName) {
            iconName = focused ? 'home' : 'home-outline';

          } else if (rn === calendarName) {
            iconName = focused ? 'calendar' : 'calendar-outline';

          } else if (rn === progressName) {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0a84ff',
        tabBarInactiveTintColor: 'grey',
        tabBarLabelStyle: { paddingBottom: 5, fontSize: 10 },
        tabBarStyle: { padding: 3, height: 100 },
      })}
    >

        <Tab.Screen name={homeName} component={HomeScreen} />
        <Tab.Screen name={calendarName} component={CalendarScreen} />
        <Tab.Screen name={progressName} component={ProgressScreen} />

      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default MainContainer;