import { NavigationContainer } from "@react-navigation/native";
import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { HomeScreen } from "../screens/HomeScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { ExercisesScreen } from "../screens/ExercisesScreen";

import { CreateWorkoutScreen } from "../screens/CreateWorkoutScreen";
import { AddExerciseScreen } from "../screens/AddExerciseScreen";
import { CreateExerciseScreen } from "../screens/CreateExerciseScreen";
import { WorkoutDetailsScreen } from "../screens/WorkoutDetailsScreen";
import { EditSetScreen } from "../screens/EditSetScreen";
import { WorkoutFinishedScreen } from "../screens/WorkoutFinishedScreen";

export type RootStackParamList = {
  Main: undefined;

  CreateWorkout: undefined;

  AddExercise: {
    workoutId: string;
  };

  CreateEditExercise:
    | {
        exerciseId?: string;
      }
    | undefined;

  WorkoutDetails: {
    workoutId: string;
  };

  EditSet: {
    setId: string;
    exerciseName: string;
    setNumber: number;
    weight: number;
    reps: number;
    completed: boolean;
  };

  WorkoutFinished: {
    workoutId: string;
    workoutName: string;
  };
};

export type RootTabParamList = {
  Home: undefined;
  History: undefined;
  Exercises: undefined;
};

const Stack =
  createNativeStackNavigator<RootStackParamList>();

const Tab =
  createBottomTabNavigator<RootTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: "#146EF5",
        tabBarInactiveTintColor: "#667085",

        tabBarIcon: ({
          color,
          size,
        }) => {
          let iconName:
            keyof typeof Ionicons.glyphMap;

          if (route.name === "Home") {
            iconName = "home";
          } else if (
            route.name === "History"
          ) {
            iconName = "time-outline";
          } else {
            iconName = "barbell-outline";
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
        }}
      />

      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: "History",
        }}
      />

      <Tab.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{
          title: "Exercises",
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
        />

        <Stack.Screen
          name="CreateWorkout"
          component={CreateWorkoutScreen}
        />

        <Stack.Screen
          name="AddExercise"
          component={AddExerciseScreen}
        />

        <Stack.Screen
          name="CreateEditExercise"
          component={CreateExerciseScreen}
        />

        <Stack.Screen
          name="WorkoutDetails"
          component={WorkoutDetailsScreen}
        />

        <Stack.Screen
          name="EditSet"
          component={EditSetScreen}
        />

        <Stack.Screen
          name="WorkoutFinished"
          component={WorkoutFinishedScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}