import { gql } from '@apollo/client';

export const ADD_SET_MUTATION = gql`
  mutation AddSet($input: AddSetInput!) {
    addSet(input: $input) {
      id
      setNumber
      reps
      weight
      completed
    }
  }
`;