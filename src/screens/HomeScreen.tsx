import {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import { useMutation, useQuery } from "@apollo/client/react";

import {
  WORKOUTS_QUERY,
} from "../graphql/queries/workouts";

import {
  WORKOUT_QUERY,
} from "../graphql/queries/workout";

import {
  COMPLETE_WORKOUT_MUTATION,
} from "../graphql/mutations/completeWorkout";

import type {
  RootStackParamList,
} from "../navigation/AppNavigator";

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

type WorkoutSummary = {
  id: string;
  name: string;
  startedAt: string;
  completedAt: string | null;
};

type Set = {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
};

type WorkoutExercise = {
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
  exercises: WorkoutExercise[];
};

export function HomeScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const [expandedExerciseId, setExpandedExerciseId] =
    useState<string | null>(null);

  const {
    data: workoutsData,
    loading: workoutsLoading,
    error: workoutsError,
    refetch: refetchWorkouts,
  } = useQuery<{
    workouts: WorkoutSummary[];
  }>(WORKOUTS_QUERY);

  const activeWorkout =
    workoutsData?.workouts.find(
      (workout) =>
        workout.completedAt === null
    );

  const activeWorkoutId =
    activeWorkout?.id ?? "";

  const {
    data: workoutData,
    loading: workoutLoading,
    refetch: refetchWorkout,
  } = useQuery<{
    workout: Workout | null;
  }>(WORKOUT_QUERY, {
    variables: {
      id: activeWorkoutId,
    },
    skip: !activeWorkoutId,
  });

  const [
    completeWorkout,
    {
      loading: completingWorkout,
    },
  ] = useMutation(
    COMPLETE_WORKOUT_MUTATION
  );

  useFocusEffect(
    useCallback(() => {
      refetchWorkouts();

      if (activeWorkoutId) {
        refetchWorkout();
      }
    }, [
      activeWorkoutId,
      refetchWorkout,
      refetchWorkouts,
    ])
  );

  const workout =
    workoutData?.workout;

  const totalSets =
    workout?.exercises.reduce(
      (total, exercise) =>
        total + exercise.sets.length,
      0
    ) ?? 0;

  const totalVolume =
    workout?.exercises.reduce(
      (total, exercise) =>
        total +
        exercise.sets.reduce(
          (exerciseTotal, set) =>
            exerciseTotal +
            set.weight * set.reps,
          0
        ),
      0
    ) ?? 0;

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

  const formatStartTime = (
    dateString: string
  ) => {
    const date =
      new Date(dateString);

    return date.toLocaleTimeString(
      [],
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const handleStartWorkout = () => {
    navigation.navigate(
      "CreateWorkout"
    );
  };

  const handleAddExercise = () => {
    if (!workout) {
      return;
    }

    navigation.navigate(
      "AddExercise",
      {
        workoutId: workout.id,
      }
    );
  };

  const handleEditSet = (
    set: Set,
    exerciseName: string
  ) => {
    navigation.navigate(
      "EditSet",
      {
        setId: set.id,
        exerciseName,
        setNumber: set.setNumber,
        weight: set.weight,
        reps: set.reps,
        completed: set.completed,
      }
    );
  };

  const handleFinishWorkout =
    async () => {
      if (!workout) {
        return;
      }

      try {
        await completeWorkout({
          variables: {
            id: workout.id,
          },
        });

        navigation.navigate(
          "WorkoutFinished",
          {
            workoutId: workout.id,
            workoutName: workout.name,
          }
        );
      } catch (error) {
        console.error(
          "Failed to finish workout:",
          error
        );
      }
    };

  if (
    workoutsLoading ||
    (activeWorkoutId &&
      workoutLoading)
  ) {
    return (
      <SafeAreaView
        style={styles.container}
      >
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
      </SafeAreaView>
    );
  }

  if (workoutsError) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.centerContainer
          }
        >
          <Text
            style={styles.errorText}
          >
            Could not load your workout.
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() =>
              refetchWorkouts()
            }
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
      </SafeAreaView>
    );
  }

  /*
   * STATE 1
   * No active workout
   */
  if (!activeWorkout) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <Text style={styles.title}>
          Home
        </Text>

        <View
          style={styles.emptyState}
        >
          <View
            style={styles.emptyIconCircle}
          >
            <Text
              style={styles.emptyIcon}
            >
              🏋️
            </Text>
          </View>

          <Text
            style={styles.emptyTitle}
          >
            No active workout
          </Text>

          <Text
            style={styles.emptySubtitle}
          >
            Start a new workout or resume
            your last one.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={
              handleStartWorkout
            }
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              + Start Workout
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * STATE 2
   * Active workout
   */
  if (!workout) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.centerContainer
          }
        >
          <Text>
            Loading workout...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <Text style={styles.title}>
          Home
        </Text>

        {/* Workout heading */}
        <View
          style={styles.workoutHeader}
        >
          <View
            style={styles.workoutHeaderTop}
          >
            <View
              style={styles.workoutHeaderInfo}
            >
              <Text
                style={styles.workoutName}
              >
                {workout.name}
              </Text>

              <View
                style={styles.metaRow}
              >
                <View
                  style={
                    styles.activeDot
                  }
                />

                <Text
                  style={styles.metaText}
                >
                  Started{" "}
                  {formatStartTime(
                    workout.startedAt
                  )}
                  {" · "}
                  Active
                </Text>
              </View>
            </View>

            <Text
              style={styles.headerArrow}
            >
              ›
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View
          style={styles.statsRow}
        >
          <View
            style={styles.statCard}
          >
            <Text
              style={styles.statValue}
            >
              {workout.exercises.length}
            </Text>

            <Text
              style={styles.statLabel}
            >
              Exercises
            </Text>
          </View>

          <View
            style={styles.statCard}
          >
            <Text
              style={styles.statValue}
            >
              {totalSets}
            </Text>

            <Text
              style={styles.statLabel}
            >
              Sets
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
              {formatVolume(
                totalVolume
              )}{" "}
              kg
            </Text>
          </View>
        </View>

        {/* Add Exercise */}
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={
            handleAddExercise
          }
        >
          <Text
            style={
              styles.addExerciseText
            }
          >
            + Add Exercise
          </Text>
        </TouchableOpacity>

        {/* Finish Workout */}
        <TouchableOpacity
          style={[
            styles.finishButton,
            completingWorkout &&
              styles.disabledButton,
          ]}
          onPress={
            handleFinishWorkout
          }
          disabled={
            completingWorkout
          }
        >
          {completingWorkout ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.finishButtonText
              }
            >
              Finish Workout
            </Text>
          )}
        </TouchableOpacity>

        {/* Exercises */}
        <Text
          style={styles.sectionTitle}
        >
          Exercises
        </Text>

        {workout.exercises
          .slice()
          .sort(
            (a, b) =>
              a.position - b.position
          )
          .map(
            (workoutExercise) => {
              const expanded =
                expandedExerciseId ===
                workoutExercise.id;

              return (
                <View
                  key={
                    workoutExercise.id
                  }
                  style={
                    styles.exerciseCard
                  }
                >
                  {/* Exercise header */}
                  <TouchableOpacity
                    style={
                      styles.exerciseHeader
                    }
                    onPress={() =>
                      setExpandedExerciseId(
                        expanded
                          ? null
                          : workoutExercise.id
                      )
                    }
                  >
                    <View
                      style={
                        styles.exerciseIconCircle
                      }
                    >
                      <Text
                        style={
                          styles.exerciseIcon
                        }
                      >
                        🏋️
                      </Text>
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
                            .exercise
                            .name
                        }
                      </Text>

                      <Text
                        style={
                          styles.exerciseSummary
                        }
                      >
                        {
                          workoutExercise
                            .sets.length
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

                    <Text
                      style={
                        styles.exerciseArrow
                      }
                    >
                      {expanded
                        ? "⌃"
                        : "›"}
                    </Text>
                  </TouchableOpacity>

                  {/* Set rows */}
                  {expanded &&
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
                          style={
                            styles.setRow
                          }
                        >
                          <Text
                            style={
                              styles.setLabel
                            }
                          >
                            Set{" "}
                            {
                              set.setNumber
                            }
                          </Text>

                          <View
                            style={
                              styles.setValue
                            }
                          >
                            <Text
                              style={
                                styles.setValueText
                              }
                            >
                              {set.weight} kg
                            </Text>
                          </View>

                          <View
                            style={
                              styles.setValue
                            }
                          >
                            <Text
                              style={
                                styles.setValueText
                              }
                            >
                              {set.reps} reps
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.completedDot,
                              set.completed &&
                                styles.completedDotActive,
                            ]}
                          />

                          {/* Pencil for EVERY set */}
                          <TouchableOpacity
                            style={
                              styles.editSetButton
                            }
                            onPress={() =>
                              handleEditSet(
                                set,
                                workoutExercise
                                  .exercise
                                  .name
                              )
                            }
                          >
                            <Text
                              style={
                                styles.editSetIcon
                              }
                            >
                              ✎
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                </View>
              );
            }
          )}

        <View
          style={styles.bottomSpacing}
        />
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

  scrollContent: {
    paddingBottom: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#101828",
    marginTop: 4,
    marginBottom: 10,
  },

  workoutHeader: {
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
  },

  workoutHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  workoutHeaderInfo: {
    flex: 1,
  },

  workoutName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#102A68",
    marginBottom: 5,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#12B76A",
    marginRight: 8,
  },

  metaText: {
    fontSize: 11,
    color: "#6B8FC5",
  },

  headerArrow: {
    fontSize: 25,
    color: "#7EAFFF",
  },

  statsRow: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 9,
  },

  statCard: {
    flex: 1,
    height: 62,
    borderRadius: 10,
    backgroundColor: "#F3F7FD",
    alignItems: "center",
    justifyContent: "center",
  },

  volumeCard: {
    flex: 1.45,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#102A68",
  },

  statLabel: {
    fontSize: 9,
    color: "#6B8FC5",
    marginTop: 2,
  },

  volumeLabel: {
    fontSize: 8,
    color: "#6B8FC5",
  },

  volumeValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#102A68",
    marginTop: 2,
  },

  addExerciseButton: {
    height: 34,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#B7D0F5",
    backgroundColor: "#F0F6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  addExerciseText: {
    color: "#146EF5",
    fontSize: 12,
    fontWeight: "600",
  },

  finishButton: {
    height: 35,
    borderRadius: 7,
    backgroundColor: "#146EF5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  disabledButton: {
    opacity: 0.7,
  },

  finishButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#102A68",
    marginBottom: 8,
  },

  exerciseCard: {
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    marginBottom: 7,
    overflow: "hidden",
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
  },

  setRow: {
    minHeight: 39,
    backgroundColor: "#F4F8FD",
    borderTopWidth: 1,
    borderTopColor: "#E4EAF2",
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  setLabel: {
    width: 37,
    fontSize: 9,
    color: "#667085",
  },

  setValue: {
    flex: 1,
    height: 27,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  setValueText: {
    fontSize: 9,
    color: "#344054",
  },

  completedDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#D0D5DD",
  },

  completedDotActive: {
    backgroundColor: "#12B76A",
  },

  editSetButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },

  editSetIcon: {
    fontSize: 14,
    color: "#146EF5",
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },

  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EEF4FC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  emptyIcon: {
    fontSize: 42,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#101828",
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 15,
    color: "#667085",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: 28,
  },

  primaryButton: {
    backgroundColor: "#146EF5",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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

  bottomSpacing: {
    height: 20,
  },
});