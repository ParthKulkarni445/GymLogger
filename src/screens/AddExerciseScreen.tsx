import { useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useMutation, useQuery } from "@apollo/client/react";

import { EXERCISES_QUERY } from "../graphql/queries/exercises";

import { ADD_EXERCISE_TO_WORKOUT_MUTATION } from "../graphql/mutations/addExerciseToWorkout";

import type { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "AddExercise">;

type Exercise = {
  id: string;
  name: string;
  targetMuscle: string | null;
};

const FILTERS = ["All", "Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps"];

export function AddExerciseScreen({ navigation, route }: Props) {
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const { data, loading, error } = useQuery<{
    exercises: Exercise[];
  }>(EXERCISES_QUERY);

  const [addExercise, { loading: addingExercise }] = useMutation(
    ADD_EXERCISE_TO_WORKOUT_MUTATION,
  );

  const exercises = data?.exercises ?? [];

  const filteredExercises = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return exercises.filter((exercise) => {
      const matchesSearch =
        !searchText || exercise.name.toLowerCase().includes(searchText);

      const matchesFilter =
        selectedFilter === "All" ||
        exercise.targetMuscle?.toLowerCase() ===
          selectedFilter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [exercises, search, selectedFilter]);

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises((current) => {
      if (current.includes(exerciseId)) {
        return current.filter((id) => id !== exerciseId);
      }

      return [...current, exerciseId];
    });
  };

  const handleAddToWorkout = async () => {
    if (selectedExercises.length === 0) {
      return;
    }

    try {
      for (const exerciseId of selectedExercises) {
        await addExercise({
          variables: {
            input: {
              workoutId: route.params.workoutId,
              exerciseId,
            },
          },
        });
      }

      navigation.goBack();
    } catch (error) {
      console.error("Failed to add exercise:", error);
    }
  };

  const renderExercise = ({ item }: { item: Exercise }) => {
    const selected = selectedExercises.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.exerciseCard,
          selected && styles.selectedExerciseCard,
        ]}
        onPress={() => toggleExercise(item.id)}
      >
        <View style={styles.exerciseIconCircle}>
          <Ionicons name="barbell" size={20} color="#146EF5" />
        </View>

        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{item.name}</Text>

          <Text style={styles.exerciseMuscle}>
            {item.targetMuscle ?? "Other"}
          </Text>
        </View>

        <View
          style={[
            styles.addCircle,
            selected && styles.addCircleSelected,
          ]}
        >
          <Ionicons
            name={selected ? "checkmark" : "add"}
            size={16}
            color={selected ? "#FFFFFF" : "#146EF5"}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#146EF5" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Add Exercises</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={18}
          color="#98A2B3"
          style={styles.searchIcon}
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search exercises..."
          placeholderTextColor="#98A2B3"
          style={styles.searchInput}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersWrapper}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
          renderItem={({ item }) => {
            const selected = selectedFilter === item;

            return (
              <TouchableOpacity
                style={[
                  styles.filter,
                  selected && styles.selectedFilter,
                ]}
                onPress={() => setSelectedFilter(item)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.selectedFilterText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Exercise list */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#146EF5" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            Could not load exercises.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          renderItem={renderExercise}
          showsVerticalScrollIndicator={false}
          style={styles.exerciseList}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Bottom action */}
      <TouchableOpacity
        style={[
          styles.bottomButton,
          selectedExercises.length === 0 &&
            styles.bottomButtonDisabled,
        ]}
        onPress={handleAddToWorkout}
        disabled={
          selectedExercises.length === 0 || addingExercise
        }
      >
        {addingExercise ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.bottomButtonText}>
            Add to Workout
          </Text>
        )}
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

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 35,
    height: 40,
    justifyContent: "center",
  },

  backIcon: {
    fontSize: 34,
    color: "#102A68",
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#102A68",
  },

  searchContainer: {
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F1F5FB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#344054",
  },

  /*
   * Keep the filter bar at a fixed height.
   * The exercise FlatList below gets the remaining space.
   */
  filtersWrapper: {
    height: 41,
  },

  filtersContainer: {
    gap: 8,
    alignItems: "center",
    paddingBottom: 8,
  },

  filter: {
    height: 31,
    paddingHorizontal: 15,
    borderRadius: 16,
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedFilter: {
    backgroundColor: "#146EF5",
  },

  filterText: {
    fontSize: 11,
    color: "#667085",
    fontWeight: "600",
  },

  selectedFilterText: {
    color: "#FFFFFF",
  },

  /*
   * IMPORTANT:
   *
   * Same approach as ExercisesScreen.
   * The list fills the remaining available space.
   */
  exerciseList: {
    flex: 1,
  },

  /*
   * IMPORTANT:
   * Do NOT use flexGrow or justifyContent here.
   *
   * This makes the first exercise card start
   * immediately below the filter bar instead
   * of being vertically centered.
   */
  listContent: {
    paddingTop: 0,
    paddingBottom: 80,
  },

  exerciseCard: {
    minHeight: 66,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 9,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  selectedExerciseCard: {
    borderColor: "#146EF5",
    backgroundColor: "#F7FAFF",
  },

  exerciseIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF4FC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  exerciseIcon: {
    fontSize: 20,
  },

  exerciseInfo: {
    flex: 1,
  },

  exerciseName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#102A68",
    marginBottom: 3,
  },

  exerciseMuscle: {
    fontSize: 10,
    color: "#6B8FC5",
  },

  addCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#146EF5",
    alignItems: "center",
    justifyContent: "center",
  },

  addCircleSelected: {
    backgroundColor: "#146EF5",
  },

  addCircleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#146EF5",
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 32,
  },

  errorText: {
    color: "#D92D20",
  },

  bottomButton: {
    height: 43,
    borderRadius: 8,
    backgroundColor: "#146EF5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  bottomButtonDisabled: {
    backgroundColor: "#C7D9F5",
  },

  bottomButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});