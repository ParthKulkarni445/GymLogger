import { gql } from '@apollo/client';

export const WORKOUTS_QUERY = gql`
  query Workouts {
    workouts {
      id
      name
      startedAt
      completedAt
    }
  }
`;