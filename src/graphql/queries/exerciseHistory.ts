import { gql } from '@apollo/client';

export const EXERCISE_HISTORY_QUERY = gql`
  query ExerciseHistory($exerciseId: ID!) {
    exerciseHistory(exerciseId: $exerciseId) {
      workoutId
      workoutName
      workoutStartedAt
      sets {
        id
        setNumber
        reps
        weight
        completed
      }
    }
  }
`;