import { gql } from '@apollo/client';

export const CREATE_WORKOUT_MUTATION = gql`
  mutation CreateWorkout($input: CreateWorkoutInput!) {
    createWorkout(input: $input) {
      id
      name
      startedAt
      completedAt
    }
  }
`;