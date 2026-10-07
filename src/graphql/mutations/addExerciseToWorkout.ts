import { gql } from '@apollo/client';

export const ADD_EXERCISE_TO_WORKOUT_MUTATION = gql`
  mutation AddExerciseToWorkout($input: AddExerciseToWorkoutInput!) {
    addExerciseToWorkout(input: $input) {
      id
      position
      exercise {
        id
        name
        targetMuscle
      }
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