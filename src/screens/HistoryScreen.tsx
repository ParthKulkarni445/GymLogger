import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
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

import { WORKOUTS_QUERY } from "../graphql/queries/workouts";

type Workout = {
  id: string;
  name: string;
  startedAt: string;
  completedAt: string | null;
};

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<
    RootTabParamList,
    "History"
  >,
  NativeStackNavigationProp<RootStackParamList>
>;

const FILTERS = [
  "All",
  "Completed",
  "In Progress",
];

export function HistoryScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const [selectedFilter, setSelectedFilter] =
    useState("All");

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery<{ workouts: Workout[] }>(
    WORKOUTS_QUERY
  );

  const workouts = data?.workouts ?? [];

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((workout) => {
      if (selectedFilter === "Completed") {
        return workout.completedAt !== null;
      }

      if (selectedFilter === "In Progress") {
        return workout.completedAt === null;
      }

      return true;
    });
  }, [workouts, selectedFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDuration = (
    startedAt: string,
    completedAt: string | null
  ) => {
    if (!completedAt) {
      return "In Progress";
    }

    const start =
      new Date(startedAt).getTime();

    const end =
      new Date(completedAt).getTime();

    const durationMinutes = Math.max(
      0,
      Math.round(
        (end - start) / 60000
      )
    );

    const hours = Math.floor(
      durationMinutes / 60
    );

    const minutes =
      durationMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  };

  const handleWorkoutPress = (
    workoutId: string
  ) => {
    navigation.navigate(
      "WorkoutDetails",
      {
        workoutId,
      }
    );
  };

  const renderWorkout = ({
    item,
  }: {
    item: Workout;
  }) => {
    const completed =
      item.completedAt !== null;

    return (
      <TouchableOpacity
        style={styles.workoutCard}
        onPress={() =>
          handleWorkoutPress(item.id)
        }
      >
        <View style={styles.statusDotContainer}>
          <View
            style={[
              styles.statusDot,
              completed
                ? styles.completedDot
                : styles.inProgressDot,
            ]}
          />
        </View>

        <View style={styles.workoutInfo}>
          <Text
            style={styles.workoutName}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text style={styles.workoutMeta}>
            {formatDate(item.startedAt)}
            {" · "}
            {formatDuration(
              item.startedAt,
              item.completedAt
            )}
          </Text>
        </View>

        <Text style={styles.arrow}>
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
          History
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersWrapper}>
        {FILTERS.map((filter) => {
          const selected =
            selectedFilter === filter;

          return (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selected &&
                  styles.selectedFilterButton,
              ]}
              onPress={() =>
                setSelectedFilter(filter)
              }
            >
              <Text
                style={[
                  styles.filterText,
                  selected &&
                    styles.selectedFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Workout list */}
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
          <Text style={styles.errorText}>
            Could not load workout history.
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
      ) : filteredWorkouts.length ===
        0 ? (
        <View
          style={
            styles.centerContainer
          }
        >
          <Text
            style={styles.emptyTitle}
          >
            No workouts found
          </Text>

          <Text
            style={
              styles.emptySubtitle
            }
          >
            Completed and past workouts
            will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredWorkouts}
          keyExtractor={(item) => item.id}
          renderItem={renderWorkout}
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.listContent
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
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#101828",
  },

  filtersWrapper: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  filterButton: {
    height: 34,
    paddingHorizontal: 17,
    borderRadius: 17,
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

  listContent: {
    paddingTop: 0,
    paddingBottom: 20,
  },

  workoutCard: {
    minHeight: 66,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  statusDotContainer: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  completedDot: {
    backgroundColor: "#12B76A",
  },

  inProgressDot: {
    backgroundColor: "#F79009",
  },

  workoutInfo: {
    flex: 1,
    marginLeft: 4,
  },

  workoutName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#102A68",
    marginBottom: 4,
  },

  workoutMeta: {
    fontSize: 12,
    color: "#6B8FC5",
  },

  arrow: {
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
    textAlign: "center",
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