export const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    isAdmin: Boolean!
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
    donateUrl: String
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
    latitude: Float
    longitude: Float
    photoUrl: String
  }

  type AuthPayload {
    token: String!
    user: User!
    onboardingCompleted: Boolean!
  }

  type ZipInfo {
    zip: String!
    city: String!
    state: String!
    latitude: Float!
    longitude: Float!
    neighborhood: String
    zoom: Int
  }

  type UserPreferences {
    location: String
    zipCode: String
    neighborhood: String
    onboardingCompleted: Boolean!
  }

  type Cause {
    tag: String!
    label: String!
    charityCount: Int!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    me: User
    myPreferences: UserPreferences

    charities(tags: [String], search: String): [Charity!]!
    charity(id: ID, slug: String): Charity
    causes: [Cause!]!
    resolveZip(zip: String!): ZipInfo
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    deleteUser(id: ID!): Boolean!

    requestMagicLink(email: String!): Boolean!
    verifyMagicLink(token: String!): AuthPayload!

    savePreferences(zipCode: String, neighborhood: String): UserPreferences!

    updateCharity(
      id: ID!
      name: String
      description: String
      websiteUrl: String
      volunteerUrl: String
      primaryAddress: String
      causeTags: [String!]
      donateUrl: String
      foundedYear: Int
      isActive: Boolean
      logoUrl: String
    ): Charity!

    createCharity(
      name: String!
      ein: String!
      slug: String!
      description: String
      websiteUrl: String
      volunteerUrl: String
      primaryAddress: String
      causeTags: [String!]
      donateUrl: String
      foundedYear: Int
    ): Charity!

    updateCharityLocation(
      id: ID!
      label: String
      description: String
      address: String
      latitude: Float
      longitude: Float
      photoUrl: String
    ): CharityLocation!

    createCharityLocation(
      charityId: ID!
      label: String!
      description: String
      address: String
      latitude: Float
      longitude: Float
    ): CharityLocation!

    deleteCharityLocation(id: ID!): Boolean!

    updateCause(tag: String!, label: String!): Cause!
    deleteCause(tag: String!): Boolean!
  }
`;
