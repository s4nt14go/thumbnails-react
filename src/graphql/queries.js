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
