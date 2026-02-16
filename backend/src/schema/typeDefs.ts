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
    slug: String!
    description: String
    logoUrl: String
    websiteUrl: String
    volunteerUrl: String
    primaryAddress: String
    causeTags: [String!]!
    everyOrgSlug: String
    ein: String!
    foundedYear: Int
    everyOrgClaimed: Boolean!
    isActive: Boolean!
    locations: [CharityLocation!]!
    createdAt: String
    updatedAt: String
  }

  type CharityLocation {
    id: ID!
    label: String!
    description: String
    address: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type UserPreferences {
    location: String
    onboardingCompleted: Boolean!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    me: User
    myPreferences: UserPreferences

    charities(tags: [String], search: String): [Charity!]!
    charity(id: ID, slug: String): Charity
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    deleteUser(id: ID!): Boolean!

    requestMagicLink(email: String!): Boolean!
    verifyMagicLink(token: String!): AuthPayload!

    savePreferences(location: String!): UserPreferences!
  }
`;
