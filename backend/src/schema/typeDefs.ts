export const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String
  }

  type Charity {
    id: ID!
    name: String!
    description: String
    logoUrl: String
    websiteUrl: String
    causeTags: [String!]!
    everyOrgSlug: String
    ein: String!
    createdAt: String
    updatedAt: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    me: User

    charities(tags: [String], search: String): [Charity!]!
    charity(id: ID!): Charity
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    deleteUser(id: ID!): Boolean!

    requestMagicLink(email: String!): Boolean!
    verifyMagicLink(token: String!): AuthPayload!
  }
`;
