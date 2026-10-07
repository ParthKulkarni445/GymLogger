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
import { useQuery } from "@apollo/client/react";

import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import type {
  BottomTabNavigationProp,
} from "@react-navigation/bottom-tabs";

import {
  RootStackParamList,
  RootTabParamList,
} from "../navigation/AppNavigator";

import { EXERCISES_QUERY } from "../graphql/queries/exercises";

type Exercise = {
  id: string;
  name: string;
  targetMuscle: string | null;
};

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<
    RootTabParamList,
    "Exercises"
  >,
  NativeStackNavigationProp<RootStackParamList>
>;

const FILTERS = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
];

export function ExercisesScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState("All");

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery<{ exercises: Exercise[] }>(
    EXERCISES_QUERY
  );

  const exercises = data?.exercises ?? [];

  const filteredExercises = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return exercises.filter((exercise) => {
      const matchesSearch =
        searchText.length === 0 ||
        exercise.name
          .toLowerCase()
          .includes(searchText);

      const matchesFilter =
        selectedFilter === "All" ||
        exercise.targetMuscle?.toLowerCase() ===
          selectedFilter.toLowerCase();

      return (
        matchesSearch && matchesFilter
      );
    });
  }, [
    exercises,
    search,
    selectedFilter,
  ]);

  const handleCreateExercise = () => {
    navigation.navigate(
      "CreateEditExercise"
    );
  };

  const handleEditExercise = (
    exerciseId: string
  ) => {
    navigation.navigate(
      "CreateEditExercise",
      {
        exerciseId,
      }
    );
  };

  const renderExercise = ({
    item,
  }: {
    item: Exercise;
  }) => {
    return (
      <TouchableOpacity
        style={styles.exerciseCard}
        onPress={() =>
          handleEditExercise(item.id)
        }
      >
        <View
          style={
            styles.exerciseIconCircle
          }
        >
          <Text
            style={styles.exerciseIcon}
          >
            🏋️
          </Text>
        </View>

        <View style={styles.exerciseInfo}>
          <Text
            style={styles.exerciseName}
          >
            {item.name}
          </Text>

          <Text
            style={styles.exerciseMuscle}
          >
            {item.targetMuscle ||
              "Other"}
          </Text>
        </View>

        <Text
          style={styles.exerciseArrow}
        >
          ›
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Exercises
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={
            handleCreateExercise
          }
        >
          <Text
            style={styles.addButtonText}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View
        style={
          styles.searchContainer
        }
      >
        <Text
          style={styles.searchIcon}
        >
          🔍
        </Text>

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
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filterContainer
          }
          renderItem={({ item }) => {
            const selected =
              selectedFilter === item;

            return (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selected &&
                    styles.selectedFilterButton,
                ]}
                onPress={() =>
                  setSelectedFilter(
                    item
                  )
                }
              >
                <Text
                  style={[
                    styles.filterText,
                    selected &&
                      styles.selectedFilterText,
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
        <View
          style={
            styles.centerContainer
          }
        >
          <ActivityIndicator
            size="large"
            color="#146EF5"
          />
        </View>
      ) : error ? (
        <View
          style={
            styles.centerContainer
          }
        >
          <Text
            style={styles.errorText}
          >
            Could not load exercises.
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text
              style={
                styles.retryButtonText
              }
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      ) : filteredExercises.length ===
        0 ? (
        <View
          style={
            styles.centerContainer
          }
        >
          <Text
            style={styles.emptyTitle}
          >
            No exercises found
          </Text>

          <Text
            style={
              styles.emptySubtitle
            }
          >
            Try another search or create
            a new exercise.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          renderItem={renderExercise}
          showsVerticalScrollIndicator={
            false
          }
          style={styles.exerciseList}
          contentContainerStyle={
            styles.exerciseListContent
          }
        />
      )}
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
    justifyContent: "space-between",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#101828",
  },

  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#146EF5",
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "400",
    lineHeight: 30,
  },

  searchContainer: {
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F2F6FC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  searchIcon: {
    fontSize: 13,
    marginRight: 7,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#344054",
    paddingVertical: 0,
  },

  filtersWrapper: {
    height: 56,
  },

  filterContainer: {
    alignItems: "center",
    gap: 8,
  },

  filterButton: {
    height: 32,
    paddingHorizontal: 15,
    borderRadius: 16,
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedFilterButton: {
    backgroundColor: "#146EF5",
  },

  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#667085",
  },

  selectedFilterText: {
    color: "#FFFFFF",
  },

  /*
   * The actual exercise list occupies only
   * the remaining space.
   */
  exerciseList: {
    flex: 1,
  },

  /*
   * IMPORTANT:
   * No flexGrow and no justifyContent here.
   * Therefore the first card starts at the
   * very top of the list.
   */
  exerciseListContent: {
    paddingTop: 0,
    paddingBottom: 20,
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
    fontSize: 14,
    fontWeight: "700",
    color: "#102A68",
    marginBottom: 4,
  },

  exerciseMuscle: {
    fontSize: 13,
    color: "#6B8FC5",
  },

  exerciseArrow: {
    fontSize: 28,
    color: "#7EAFFF",
    marginLeft: 8,
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  errorText: {
    color: "#D92D20",
    fontSize: 14,
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: "#146EF5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#344054",
  },

  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#98A2B3",
    textAlign: "center",
  },
});