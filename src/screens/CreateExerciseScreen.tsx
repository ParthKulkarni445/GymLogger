import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMutation, useQuery } from "@apollo/client/react";

import { RootStackParamList } from "../navigation/AppNavigator";

import { EXERCISES_QUERY } from "../graphql/queries/exercises";

import { CREATE_EXERCISE_MUTATION } from "../graphql/mutations/createExercise";

import { UPDATE_EXERCISE_MUTATION } from "../graphql/mutations/updateExercise";

type Props = NativeStackScreenProps<RootStackParamList, "CreateEditExercise">;

type Exercise = {
  id: string;
  name: string;
  targetMuscle: string | null;
};

const MUSCLE_OPTIONS = ["Chest", "Back", "Legs", "Shoulders"];

export function CreateExerciseScreen({ navigation, route }: Props) {
  const exerciseId = route.params?.exerciseId;

  const isEditMode = Boolean(exerciseId);

  const [name, setName] = useState("");
  const [targetMuscle, setTargetMuscle] = useState("Chest");

  const [showMuscleOptions, setShowMuscleOptions] = useState(false);

  const { data, loading: loadingExercises } = useQuery<{
    exercises: Exercise[];
  }>(EXERCISES_QUERY, {
    skip: !isEditMode,
  });

  const [createExercise, { loading: creating }] = useMutation(
    CREATE_EXERCISE_MUTATION,
    {
      refetchQueries: [{ query: EXERCISES_QUERY }],
      awaitRefetchQueries: true,
    },
  );

  const [updateExercise, { loading: updating }] = useMutation(
    UPDATE_EXERCISE_MUTATION,
    {
      refetchQueries: [{ query: EXERCISES_QUERY }],
      awaitRefetchQueries: true,
    },
  );

  const saving = creating || updating;

  /*
   * When editing, load the selected exercise
   * from the exercises query.
   */
  useEffect(() => {
    if (!exerciseId || !data?.exercises) {
      return;
    }

    const exercise = data.exercises.find((item) => item.id === exerciseId);

    if (!exercise) {
      return;
    }

    setName(exercise.name);
    setTargetMuscle(exercise.targetMuscle || "Chest");
  }, [exerciseId, data]);

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Missing name", "Please enter an exercise name.");
      return;
    }

    if (saving) {
      return;
    }

    try {
      if (isEditMode && exerciseId) {
        await updateExercise({
          variables: {
            id: exerciseId,
            input: {
              name: trimmedName,
              targetMuscle,
            },
          },
        });
      } else {
        await createExercise({
          variables: {
            input: {
              name: trimmedName,
              targetMuscle,
            },
          },
        });
      }

      navigation.goBack();
    } catch (error: any) {
      console.error(error);

      const message = error?.message || "Could not save the exercise.";

      Alert.alert("Error", message);
    }
  };

  if (isEditMode && loadingExercises) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#146EF5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
              disabled={saving}
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>

            <Text style={styles.title}>
              {isEditMode ? "Edit Exercise" : "Create Exercise"}
            </Text>

            <View style={styles.headerSpacer} />
          </View>

          {/* Name */}
          <Text style={styles.label}>Name *</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Bench Press"
            placeholderTextColor="#98A2B3"
            style={styles.input}
            editable={!saving}
          />

          {/* Target muscle */}
          <Text style={styles.label}>Target Muscle</Text>

          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowMuscleOptions((current) => !current)}
            disabled={saving}
          >
            <Text style={styles.dropdownText}>{targetMuscle}</Text>

            <Text style={styles.dropdownArrow}>
              {showMuscleOptions ? "⌃" : "⌄"}
            </Text>
          </TouchableOpacity>

          {/* Dropdown options */}
          {showMuscleOptions && (
            <View style={styles.optionsContainer}>
              {MUSCLE_OPTIONS.map((muscle) => {
                const selected = muscle === targetMuscle;

                return (
                  <TouchableOpacity
                    key={muscle}
                    style={[styles.option, selected && styles.selectedOption]}
                    onPress={() => {
                      setTargetMuscle(muscle);
                      setShowMuscleOptions(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.selectedOptionText,
                      ]}
                    >
                      {muscle}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledSaveButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
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

  keyboardContainer: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
  },

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  closeButton: {
    width: 35,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  closeIcon: {
    fontSize: 31,
    fontWeight: "300",
    color: "#101828",
    lineHeight: 34,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#102A68",
  },

  headerSpacer: {
    width: 35,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#102A68",
    marginTop: 22,
    marginBottom: 9,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 9,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#344054",
    backgroundColor: "#FFFFFF",
  },

  dropdown: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 9,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },

  dropdownText: {
    fontSize: 15,
    color: "#344054",
  },

  dropdownArrow: {
    fontSize: 19,
    color: "#344054",
  },

  optionsContainer: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 9,
    marginTop: 5,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  option: {
    height: 42,
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  selectedOption: {
    backgroundColor: "#EEF4FF",
  },

  optionText: {
    fontSize: 14,
    color: "#344054",
  },

  selectedOptionText: {
    color: "#146EF5",
    fontWeight: "600",
  },

  saveButton: {
    height: 49,
    borderRadius: 9,
    backgroundColor: "#146EF5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
  },

  disabledSaveButton: {
    opacity: 0.7,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
