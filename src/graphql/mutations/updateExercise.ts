import { gql } from '@apollo/client';

export const UPDATE_EXERCISE_MUTATION = gql`
  mutation UpdateExercise($id: ID!, $input: UpdateExerciseInput!) {
    updateExercise(id: $id, input: $input) {
      id
      name
      targetMuscle
    }
  }
`;