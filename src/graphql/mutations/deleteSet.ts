import { gql } from '@apollo/client';

export const DELETE_SET_MUTATION = gql`
  mutation DeleteSet($id: ID!) {
    deleteSet(id: $id)
  }
`;