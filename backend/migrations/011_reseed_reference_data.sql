-- Up Migration

-- Step 1: Clear existing reference data (FK-safe order) and reset sequences
DELETE FROM charity_locations;
DELETE FROM charities;
DELETE FROM causes;
ALTER SEQUENCE charities_id_seq RESTART WITH 1;
ALTER SEQUENCE charity_locations_id_seq RESTART WITH 1;

-- Step 2: Insert causes (19 total — adds christian + women to the original 17)
INSERT INTO causes (tag, label) VALUES
  ('adoption',     'Adoption'),
  ('animals',      'Animals'),
  ('arts',         'Arts'),
  ('christian',    'Christian'),
  ('community',    'Community'),
  ('education',    'Education'),
  ('environment',  'Environment'),
  ('families',     'Families'),
  ('food-security','Food Security'),
  ('health',       'Health'),
  ('homelessness', 'Homelessness'),
  ('housing',      'Housing'),
  ('hunger',       'Hunger'),
  ('mental-health','Mental Health'),
  ('mentorship',   'Mentorship'),
  ('pets',         'Pets'),
  ('seniors',      'Seniors'),
  ('women',        'Women'),
  ('youth',        'Youth');

-- Step 3: Insert 5 charities (will get IDs 1–5)
INSERT INTO charities (name, description, website_url, logo_url, cause_tags, every_org_slug, ein, slug, founded_year, volunteer_url, every_org_claimed, is_active, primary_address) VALUES
(
  'Denver Rescue Mission',
  'Helps restore the lives of people experiencing homelessness and addiction through emergency services, rehabilitation, transitional programs, and community outreach.',
  'https://www.denverrescuemission.org',
  NULL,
  ARRAY['homelessness', 'hunger', 'housing', 'christian'],
  'denver-rescue-mission',
  '846038762',
  'denver-rescue-mission',
  1892,
  'https://denverrescuemission.org/volunteer/',
  false,
  true,
  '6100 Smith Road, Denver, CO 80216'
),
(
  'Food Bank of the Rockies',
  'Serves as the backbone of hunger relief in Metro Denver and Northern Colorado, coordinating with hundreds of Hunger Relief Partners and acting as a distribution hub for food, essentials, and logistical resources.',
  'https://www.foodbankrockies.org',
  NULL,
  ARRAY['hunger', 'food-security', 'families'],
  'food-bank-of-the-rockies',
  '840772672',
  'food-bank-of-the-rockies',
  1978,
  'https://www.foodbankrockies.org/get-involved/volunteer/',
  true,
  true,
  '20600 E. 38th Avenue, Aurora, CO 80011'
),
(
  'Humane Colorado',
  'Provides shelter and veterinary care for homeless pets in the Denver metro area.',
  'https://humanecolorado.org/',
  NULL,
  ARRAY['animals', 'pets', 'adoption'],
  'denver-dumb-friends-league',
  '840405254',
  'humane-colorado',
  1910,
  'https://humanecolorado.org/volunteer/',
  true,
  true,
  '2080 S. Quebec St., Denver, CO 80231'
),
(
  'Denver Botanic Gardens',
  'Connects people with plants through education and conservation across Colorado, transforming the way people think about and engage with the environment.',
  'https://www.botanicgardens.org',
  NULL,
  ARRAY['environment', 'education'],
  'denver-botanic-gardens',
  '840440359',
  'denver-botanic-gardens',
  1951,
  'https://www.botanicgardens.org/join-give/volunteer',
  false,
  true,
  '1007 York St, Denver, CO 80206'
),
(
  'Warren Village',
  'Serves unhoused and unstably housed low-income single-parent families in the Denver area. We provide families with the space and resources to achieve economic mobility and navigate and disrupt systems of poverty.',
  'https://warrenvillage.org/',
  NULL,
  ARRAY['homelessness', 'housing', 'youth', 'families', 'women'],
  'warren-village',
  '840644270',
  'warren-village',
  1974,
  'https://warrenvillage.org/volunteer/',
  false,
  true,
  '1323 Gilpin St. Denver, CO 80218-2552'
);

-- Step 4: Insert 17 charity_locations (charity_id maps to new IDs 1–5)

-- Denver Rescue Mission (charity_id 1) — 7 locations
INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude) VALUES
(
  1,
  'Lawrence Street Shelter',
  'Lawrence Street Shelter is Denver Rescue Mission''s most well-known and most recognizable location. It provides emergency care to the poor and homeless and is an entry point for many long-term, life-changing program participants.',
  '1130 Park Ave. West, Denver, CO 80205',
  39.7549556,
  -104.9879618
),
(
  1,
  'Lawrence Street Community Center',
  'The Lawrence Street Community Center offers those experiencing homelessness in Denver a safe place to go during the day, away from the dangers of the street. Along with providing meals and access to clean drinking water and restrooms, the Community Center gives men, women and families experiencing homelessness an opportunity to learn how to participate in our life-changing programs. The Community Center also serves as the central location where guests can sign up for a bed assignment as well as engage with staff to find other local providers for their unique needs.',
  '2222 Lawrence Street, Denver, CO 80205',
  39.7544702,
  -104.9885378
),
(
  1,
  'The Crossing',
  'Offers bible studies, case management, counseling, and meals to help participants save money and develop the life skills and relationships needed to maintain self-sufficiency after graduating. The Crossing also serves as an after-hours donation drop-off site for donations.',
  '6090 Smith Road, Denver, CO 80216',
  39.7734905,
  -104.9184627
),
(
  1,
  'Administration & Education building',
  'Denver Rescue Mission''s Administration & Education building includes special classrooms for programs, office space for the Mission''s administrative support staff and serves as the intake location for many of their programs.',
  '6100 Smith Road, Denver, CO 80216',
  39.7735448,
  -104.9172323
),
(
  1,
  'Harvest Farm',
  'Harvest Farm, a 100-acre farm located in Wellington, Colorado, provides the opportunity for up to 72 men to achieve self-sufficiency through the New Life Program. For many men coming out of homelessness and addiction, the Farm''s fresh air, rural environment, unique work therapy opportunities, and location away from the city''s temptations provide an ideal place to refocus and begin anew.',
  '4240 E. County Road 66, Wellington, CO 80549',
  40.7298383,
  -104.9969898
),
(
  1,
  '48th Avenue Center',
  'Denver Rescue Mission operates this shelter in partnership with the City of Denver. Along with nightly beds for men, this location operates 24/7, offering three meals a day, restrooms, and access to various support services.',
  '4600 East 48th Avenue, Denver, CO 80216',
  39.7829716,
  -104.9343334
),
(
  1,
  'Ministry Outreach Center',
  'Central warehouse and distribution location for Denver Rescue Mission. People in need of food, clothing, furniture, and household items find assistance at this location.',
  '5725 East 39th Avenue, Denver, CO 80207',
  39.7721883,
  -104.9212874
),

-- Food Bank of the Rockies (charity_id 2) — 1 location
(
  2,
  'Main Distribution Center',
  'Primary warehouse and distribution facility for Denver hunger relief',
  '20600 E. 38th Avenue, Aurora, CO 80011',
  39.7687646,
  -104.7471157
),

-- Humane Colorado (charity_id 3) — 4 locations
(
  3,
  'Leslie A. Malone Center',
  'A full-service shelter offering adoptions, pet admissions, lost-and-found services, euthanasia services, animal protection, and humane education opportunities for the public.',
  '2080 S. Quebec St., Denver, CO 80231',
  39.6792561,
  -104.9023557
),
(
  3,
  'Buddy Center',
  'A full-service shelter offering pet admissions, lost-and-found services, euthanasia services, and humane education opportunities for the public.',
  '4556 Castleton Court, Castle Rock, CO 80104',
  39.4076010,
  -104.8661007
),
(
  3,
  'Harmony Equine Center',
  'A rehabilitation and adoption facility for abused and neglected horses, ponies, donkeys, and mules that have been removed from their owners by law enforcement authorities. Serves as a central hub where horses from humane societies and rescue groups can receive training and rehoming.',
  '5540 Colorado 86 Franktown, CO 80116',
  39.3937667,
  -104.7838528
),
(
  3,
  'Veterinary Hospital at CSU Spur',
  'Humane Colorado''s Veterinary Hospital at CSU Spur offers donor-subsidized services for sick and injured pets whose owners need help with the cost of necessary medical care.',
  '4817 National Western Dr, Denver, CO 80216',
  39.7844323,
  -104.9736253
),

-- Denver Botanic Gardens (charity_id 4) — 2 locations
(
  4,
  'York Street Gardens',
  'Denver Botanic Gardens at York Street, in cooperation with the City and County of Denver, presents a wide range of gardens and collections on 24 acres. The gardens reflect an ever-widening diversity of plants from all corners of the world.',
  '1007 York St, Denver, CO 80206',
  39.7322187,
  -104.9611630
),
(
  4,
  'Chatfield Farms',
  '700-acre native plant refuge and working farm located along the banks of Deer Creek in southern Jefferson County. Chatfield Farms is home to historical buildings dating back to the 1800s, 2.5 miles of nature trails and numerous wildflower gardens.',
  '8500 W Deer Creek Canyon Road, Littleton, CO 80128',
  39.5518976,
  -105.0994246
),

-- Warren Village (charity_id 5) — 3 locations
(
  5,
  'Warren Village at Alameda',
  'Offers supportive housing for families who have experienced homelessness or are at risk of housing instability, with a preference for single-parent families. It additionally includes the Mile High United Way Early Learning Center, featuring classrooms and play spaces.',
  '1394 W. Alameda Avenue, Denver, CO 80223',
  39.7112014,
  -105.0060300
),
(
  5,
  'Warren Village at First Step',
  'Offers safe and affordable transitional, shared housing in Northwest Denver for single mothers or female heads of household aged 18-24, along with their children under the age of 12.',
  '5280 Federal Boulevard, Denver, CO, 80221',
  39.7926302,
  -105.0246813
),
(
  5,
  'Warren Village at Gilpin',
  'Offers private apartments and supportive services in an 92-unit apartment building to single-parent families who are unstably housed or experiencing homelessness. Includes on-site economic mobility coaching and resource navigation, adult enrichment classes, career and postsecondary education support, community-building activities, and mental health support. An on-site early learning center is available for the children of residents ages 6 weeks to 12 years old.',
  '1323 Gilpin Street, Denver, CO 80218',
  39.7374607,
  -104.9675847
);

---- Down Migration
DELETE FROM charity_locations;
DELETE FROM charities;
DELETE FROM causes;
