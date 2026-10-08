import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@apollo/client/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  RootStackParamList,
} from "../navigation/AppNavigator";

import { WORKOUT_QUERY } from "../graphql/queries/workout";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "WorkoutDetails"
>;

type Set = {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
};

type Exercise = {
  id: string;
  position: number;
  exercise: {
    id: string;
    name: string;
    targetMuscle: string | null;
  };
  sets: Set[];
};

type Workout = {
  id: string;
  name: string;
  startedAt: string;
  completedAt: string | null;
  exercises: Exercise[];
};

export function WorkoutDetailsScreen({
  navigation,
  route,
}: Props) {
  const [expandedExerciseId, setExpandedExerciseId] =
    useState<string | null>(null);

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery<{ workout: Workout | null }>(
    WORKOUT_QUERY,
    {
      variables: {
        id: route.params.workoutId,
      },
    }
  );

  const workout = data?.workout;

  const totalSets = useMemo(() => {
    if (!workout) {
      return 0;
    }

    return workout.exercises.reduce(
      (total, exercise) =>
        total + exercise.sets.length,
      0
    );
  }, [workout]);

  const totalVolume = useMemo(() => {
    if (!workout) {
      return 0;
    }

    return workout.exercises.reduce(
      (total, exercise) => {
        return (
          total +
          exercise.sets.reduce(
            (exerciseTotal, set) =>
              exerciseTotal +
              set.weight * set.reps,
            0
          )
        );
      },
      0
    );
  }, [workout]);

  const formatDate = (
    dateString: string
  ) => {
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

  const formatVolume = (
    volume: number
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    ).format(volume);
  };

  const toggleExercise = (
    workoutExerciseId: string
  ) => {
    setExpandedExerciseId(
      (current) =>
        current === workoutExerciseId
          ? null
          : workoutExerciseId
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.centerContainer}
        >
          <ActivityIndicator
            size="large"
            color="#146EF5"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !workout) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.errorContainer}
        >
          <Text
            style={styles.errorText}
          >
            {error
              ? "Could not load workout details."
              : "Workout not found."}
          </Text>

          {error && (
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
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color="#146EF5"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Workout Details
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* Workout title */}
        <Text style={styles.workoutName}>
          {workout.name}
        </Text>

        {/* Date + duration */}
        <View style={styles.metaRow}>
          <View style={styles.statusDot} />

          <Text style={styles.metaText}>
            {formatDate(workout.startedAt)}
            {" · "}
            {formatDuration(
              workout.startedAt,
              workout.completedAt
            )}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Exercises
            </Text>
            <Text style={styles.statValue}>
              {workout.exercises.length}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Sets
            </Text>
            <Text style={styles.statValue}>
              {totalSets}
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              styles.volumeCard,
            ]}
          >
            <Text
              style={styles.volumeLabel}
            >
              Total Volume
            </Text>

            <Text
              style={styles.volumeValue}
            >
              {formatVolume(totalVolume)}
              {" kg"}
            </Text>
          </View>
        </View>

        {/* Exercises */}
        <Text style={styles.sectionTitle}>
          Exercises
        </Text>

        {workout.exercises
          .slice()
          .sort(
            (a, b) =>
              a.position - b.position
          )
          .map((workoutExercise) => {
            const expanded =
              expandedExerciseId ===
              workoutExercise.id;

            return (
              <View
                key={workoutExercise.id}
                style={[
                  styles.exerciseContainer,
                  expanded &&
                    styles.expandedExerciseContainer,
                ]}
              >
                {/* Exercise header */}
                <TouchableOpacity
                  style={
                    styles.exerciseHeader
                  }
                  onPress={() =>
                    toggleExercise(
                      workoutExercise.id
                    )
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.exerciseIconCircle}>
                    <Ionicons
                      name="barbell"
                      size={20}
                      color="#146EF5"
                    />
                  </View>

                  <View
                    style={
                      styles.exerciseInfo
                    }
                  >
                    <Text
                      style={
                        styles.exerciseName
                      }
                    >
                      {
                        workoutExercise
                          .exercise.name
                      }
                    </Text>

                    <Text
                      style={
                        styles.exerciseSummary
                      }
                    >
                      {
                        workoutExercise.sets
                          .length
                      }{" "}
                      sets ·{" "}
                      {workoutExercise.sets
                        .map(
                          (set) =>
                            set.reps
                        )
                        .join("/")}
                      {" reps"}
                    </Text>
                  </View>

                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-forward"}
                    size={18}
                    color="#7EAFFF"
                  />
                </TouchableOpacity>

                {/* Expanded sets */}
                {expanded && (
                  <View
                    style={
                      styles.setsContainer
                    }
                  >
                    {workoutExercise.sets
                      .slice()
                      .sort(
                        (a, b) =>
                          a.setNumber -
                          b.setNumber
                      )
                      .length === 0 ? (
                        <Text style={styles.noSetsText}>
                          No sets recorded
                        </Text>
                      ) : (
                        workoutExercise.sets
                          .slice()
                          .sort(
                            (a, b) =>
                              a.setNumber -
                              b.setNumber
                          )
                          .map((set) => (
                            <View
                              key={set.id}
                              style={styles.setRow}
                            >
                              <View
                                style={[
                                  styles.completedCircle,
                                  set.completed &&
                                    styles.completedCircleActive,
                                ]}
                              >
                                {set.completed && (
                                  <Ionicons
                                    name="checkmark"
                                    size={13}
                                    color="#FFFFFF"
                                  />
                                )}
                              </View>

                              <Text style={styles.setNumber}>
                                Set {set.setNumber}
                              </Text>

                              <View style={styles.setValue}>
                                <Text style={styles.setValueText}>
                                  {set.reps} reps
                                </Text>
                              </View>

                              <View style={styles.setValue}>
                                <Text style={styles.setValueText}>
                                  {set.weight} kg
                                </Text>
                              </View>
                            </View>
                          ))
                      )}
                  </View>
                )}
              </View>
            );
          })}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    fontWeight: "300",
    color: "#146EF5",
    lineHeight: 38,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#102A68",
  },

  headerSpacer: {
    flex: 1,
  },

  content: {
    paddingTop: 8,
    paddingBottom: 20,
  },

  workoutName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#102A68",
    marginBottom: 6,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#12B76A",
    marginRight: 9,
  },

  metaText: {
    fontSize: 12,
    color: "#6B8FC5",
  },

  statsContainer: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    minHeight: 58,
    borderRadius: 10,
    backgroundColor: "#F3F7FD",
    alignItems: "center",
    justifyContent: "center",
  },

  volumeCard: {
    flex: 1.45,
  },

  statValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#102A68",
    marginBottom: 3,
  },

  statLabel: {
    fontSize: 10,
    color: "#6B8FC5",
  },

  volumeLabel: {
    fontSize: 9,
    color: "#6B8FC5",
    marginBottom: 3,
  },

  volumeValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#102A68",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#102A68",
    marginBottom: 8,
  },

  exerciseContainer: {
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    marginBottom: 7,
  },

  expandedExerciseContainer: {
    backgroundColor: "#FFFFFF",
  },

  exerciseHeader: {
    minHeight: 58,
    paddingHorizontal: 8,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  exerciseIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF4FC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  exerciseIcon: {
    fontSize: 18,
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

  exerciseSummary: {
    fontSize: 10,
    color: "#6B8FC5",
  },

  exerciseArrow: {
    fontSize: 22,
    color: "#7EAFFF",
    marginLeft: 8,
  },

  setsContainer: {
    backgroundColor: "#F4F8FD",
    paddingHorizontal: 9,
    paddingTop: 4,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#E4EAF2",
  },

  setRow: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 2,
  },

  completedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#D0D5DD",
    alignItems: "center",
    justifyContent: "center",
  },

  completedCircleActive: {
    backgroundColor: "#12B76A",
    borderColor: "#12B76A",
  },

  completedCheckmark: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "700",
    lineHeight: 14,
  },

  setNumber: {
    width: 46,
    fontSize: 11,
    color: "#667085",
    fontWeight: "500",
  },

  setValue: {
    flex: 1,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  setValueText: {
    fontSize: 11,
    color: "#146EF5",
    fontWeight: "600",
  },

  noSetsText: {
    fontSize: 11,
    color: "#9DAFCB",
    fontStyle: "italic",
    paddingVertical: 8,
    textAlign: "center",
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  errorContainer: {
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

  bottomSpacing: {
    height: 20,
  },
});