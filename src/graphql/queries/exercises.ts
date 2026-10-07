import { gql } from '@apollo/client';

export const EXERCISES_QUERY = gql`
  query Exercises {
    exercises {
      id
      name
      targetMuscle
    }
  }
`;