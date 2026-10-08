import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import type {
  RootStackParamList,
} from "../navigation/AppNavigator";

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

export function WorkoutFinishedScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const handleStartWorkout =
    () => {
      navigation.navigate(
        "CreateWorkout"
      );
    };

  const handleHome = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "Main",
        },
      ],
    });
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <Text style={styles.title}>
        Home
      </Text>

      <View
        style={styles.content}
      >
        <View
          style={styles.successCircle}
        >
          <Ionicons
            name="checkmark"
            size={42}
            color="#12B76A"
          />
        </View>

        <Text
          style={styles.finishedTitle}
        >
          Workout finished!
        </Text>

        <Text
          style={styles.subtitle}
        >
          Great job! Your workout has
          been saved successfully.
        </Text>

        <TouchableOpacity
          style={styles.startButton}
          onPress={
            handleStartWorkout
          }
        >
          <Text
            style={styles.startButtonText}
          >
            + Start Workout
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={handleHome}
      >
        <Text
          style={styles.homeButtonText}
        >
          Back to Home
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#101828",
    marginTop: 4,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 50,
  },

  successCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#E7F8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  checkmark: {
    fontSize: 38,
    color: "#12B76A",
    fontWeight: "500",
  },

  finishedTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#102A68",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 13,
    color: "#667085",
    textAlign: "center",
    maxWidth: 270,
    lineHeight: 20,
    marginBottom: 28,
  },

  startButton: {
    backgroundColor: "#146EF5",
    borderRadius: 9,
    height: 44,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  startButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  homeButton: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  homeButtonText: {
    color: "#344054",
    fontSize: 12,
    fontWeight: "600",
  },
});