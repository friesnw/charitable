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
    coverPhotoUrl: String
    coverPhotoFocalPoint: String
    contentPhotoUrl1: String
    contentPhotoUrl2: String
    websiteUrl: String
    volunteerUrl: String
    primaryAddress: String
    causeTags: [String!]!
    donateUrl: String
    ein: String!
    foundedYear: Int
    impact: String
    locationDescription: String
    programHighlights: String
    usageCredit: String
    ctaLabel: String
    ctaUrl: String
    everyOrgClaimed: Boolean!
    isActive: Boolean!
    isReviewed: Boolean!
    approvedByCharity: Boolean!
    featured: Boolean!
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
    isReviewed: Boolean!
    isSublocation: Boolean!
    displayOrder: Int!
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

  type EventCount {
    eventName: String!
    count: Int!
  }

  type DailyCount {
    date: String!
    count: Int!
  }

  type TopItem {
    label: String!
    count: Int!
  }

  type AnalyticsOverview {
    totalEvents: Int!
    uniqueVisitors: Int!
    eventCounts: [EventCount!]!
    dailyPageViews: [DailyCount!]!
    topCharities: [TopItem!]!
    topCauseTags: [TopItem!]!
    topNeighborhoods: [TopItem!]!
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

    analyticsOverview: AnalyticsOverview!
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
      featured: Boolean
      logoUrl: String
      coverPhotoUrl: String
      coverPhotoFocalPoint: String
      contentPhotoUrl1: String
      contentPhotoUrl2: String
      isReviewed: Boolean
      approvedByCharity: Boolean
      impact: String
      locationDescription: String
      programHighlights: String
      usageCredit: String
      ctaLabel: String
      ctaUrl: String
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
      isReviewed: Boolean
      isSublocation: Boolean
      displayOrder: Int
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

    saveStreetViewPhoto(
      locationId: ID!
      address: String!
      heading: Float!
      pitch: Float
    ): CharityLocation!

    updateCause(tag: String!, label: String!): Cause!
    deleteCause(tag: String!): Boolean!
  }
`;
