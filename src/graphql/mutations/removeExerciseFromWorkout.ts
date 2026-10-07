import { gql } from '@apollo/client';

export const REMOVE_EXERCISE_FROM_WORKOUT_MUTATION = gql`
  mutation RemoveExerciseFromWorkout($workoutExerciseId: ID!) {
    removeExerciseFromWorkout(
      workoutExerciseId: $workoutExerciseId
    )
  }
`;