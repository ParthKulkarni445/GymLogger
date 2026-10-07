import { gql } from '@apollo/client';

export const COMPLETE_WORKOUT_MUTATION = gql`
  mutation CompleteWorkout($id: ID!) {
    completeWorkout(id: $id) {
      id
      name
      startedAt
      completedAt
    }
  }
`;