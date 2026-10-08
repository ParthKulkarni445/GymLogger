import { useState } from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useMutation } from "@apollo/client/react";

import { CREATE_WORKOUT_MUTATION } from "../graphql/mutations/createWorkout";

import type { RootStackParamList } from "../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type CreateWorkoutResult = {
  createWorkout: {
    id: string;
  };
};

type CreateWorkoutVariables = {
  input: {
    name: string;
  };
};

export function CreateWorkoutScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [name, setName] = useState("");

  const [createWorkout, { loading }] = useMutation<
    CreateWorkoutResult,
    CreateWorkoutVariables
  >(CREATE_WORKOUT_MUTATION);

  const handleCreateWorkout = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    try {
      const result = await createWorkout({
        variables: {
          input: {
            name: trimmedName,
          },
        },
      });

      const workoutId = result.data?.createWorkout?.id;

      if (!workoutId) {
        return;
      }

      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Main",
          },
        ],
      });
    } catch (error) {
      console.error("Failed to create workout:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#101828" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Create Workout</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Workout Name</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Push Day"
            placeholderTextColor="#98A2B3"
            style={styles.input}
          />

          <Text style={[styles.label, styles.startTimeLabel]}>Start Time</Text>

          <View style={styles.timeInput}>
            <Text style={styles.timeText}>Now</Text>

            <Ionicons name="chevron-down" size={18} color="#667085" />
          </View>
        </View>

        {/* Create */}
        <TouchableOpacity
          style={[
            styles.createButton,
            (!name.trim() || loading) && styles.disabledButton,
          ]}
          onPress={handleCreateWorkout}
          disabled={!name.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Create Workout</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },

  keyboardView: {
    flex: 1,
  },

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
  },

  closeButton: {
    width: 35,
    height: 40,
    justifyContent: "center",
  },

  closeText: {
    fontSize: 28,
    color: "#102A68",
    fontWeight: "300",
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#102A68",
  },

  headerSpacer: {
    flex: 1,
  },

  form: {
    marginTop: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#102A68",
    marginBottom: 7,
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 9,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#344054",
  },

  startTimeLabel: {
    marginTop: 22,
  },

  timeInput: {
    height: 46,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 9,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  timeText: {
    fontSize: 14,
    color: "#344054",
  },

  chevron: {
    fontSize: 18,
    color: "#667085",
  },

  createButton: {
    marginTop: "auto",
    marginBottom: 12,
    height: 46,
    borderRadius: 8,
    backgroundColor: "#146EF5",
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.5,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
