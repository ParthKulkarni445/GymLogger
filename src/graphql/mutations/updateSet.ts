import { gql } from '@apollo/client';

export const UPDATE_SET_MUTATION = gql`
  mutation UpdateSet($id: ID!, $input: UpdateSetInput!) {
    updateSet(id: $id, input: $input) {
      id
      setNumber
      reps
      weight
      completed
    }
  }
`;