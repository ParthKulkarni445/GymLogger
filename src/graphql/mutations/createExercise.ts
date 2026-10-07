import { gql } from '@apollo/client';

export const CREATE_EXERCISE_MUTATION = gql`
  mutation CreateExercise($input: CreateExerciseInput!) {
    createExercise(input: $input) {
      id
      name
      targetMuscle
    }
  }
`;