/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getPost = /* GraphQL */ `
  query GetPost($id: ID!) {
    getPost(id: $id) {
      id
      title
      body
      createdAt
      updatedAt
    }
  }
`;
export const listResizedUrls = /* GraphQL */ `
  query ListResizedUrls(
    $filter: TableResizedUrlFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listResizedUrls(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        url
      }
      nextToken
    }
  }
`;
