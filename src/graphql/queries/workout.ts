import { gql } from '@apollo/client';

export const WORKOUT_QUERY = gql`
  query Workout($id: ID!) {
    workout(id: $id) {
      id
      name
      startedAt
      completedAt
      exercises {
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
  }
`;