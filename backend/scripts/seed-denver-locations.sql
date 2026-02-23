-- Seed location data for Denver charities
-- Run once via: \i /Users/nickfries/Documents/Code/charitable/backend/scripts/seed-denver-locations.sql
-- NOTE: Not idempotent — running twice will create duplicate locations.
-- NOTE: Rows for denver-botanic-gardens and warren-village will be skipped
--       (those charities are not in the seed data yet).

-- Denver Rescue Mission
INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Lawrence Street Shelter',
  'Provides emergency care to the poor and homeless and is an entry point for many participants of long-term, life-changing Denver Rescue Mission programs.',
  '1130 Park Ave. West, Denver, CO 80205', 39.75495562, -104.9879618
FROM charities WHERE slug = 'denver-rescue-mission';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Lawrence Street Community Center',
  $$Offers those experiencing homelessness in Denver a safe place to go during the day, away from the dangers of the street.

Along with providing meals and access to clean drinking water and restrooms, the Community Center gives men, women and families experiencing homelessness an opportunity to learn how to participate in our life-changing programs.

The Community Center also serves as the central location where guests can sign up for a bed assignment as well as engage with staff to find other local providers for their unique needs.$$,
  '2222 Lawrence Street, Denver, CO 80205', 39.75447019, -104.9885378
FROM charities WHERE slug = 'denver-rescue-mission';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'The Crossing',
  $$Offers bible studies, case management, counseling, and meals to help participants save money and develop the life skills and relationships needed to maintain self-sufficiency after graduating.

The Crossing also serves as an after-hours donation drop-off site for donations.$$,
  '6090 Smith Road, Denver, CO 80216', 39.77349047, -104.9184627
FROM charities WHERE slug = 'denver-rescue-mission';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Administration & Education Building',
  'Includes special classrooms for programs, office space for the Mission''s administrative support staff and serves as the intake location for many of their programs.',
  '6100 Smith Road, Denver, CO 80216', 39.7735448, -104.9172323
FROM charities WHERE slug = 'denver-rescue-mission';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Harvest Farm',
  'Provides the opportunity for up to 72 men to achieve self-sufficiency through the New Life Program. For many men coming out of homelessness and addiction, the Farm''s fresh air, rural environment, unique work therapy opportunities, and location away from the city''s temptations provide an ideal place to refocus and begin anew.',
  '4240 E. County Road 66, Wellington, CO 80549', 40.72983825, -104.9969898
FROM charities WHERE slug = 'denver-rescue-mission';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, '48th Avenue Center',
  'Denver Rescue Mission operates this shelter in partnership with the City of Denver. Along with nightly beds for men, this location operates 24/7, offering three meals a day, restrooms, and access to various support services.',
  '4600 East 48th Avenue, Denver, CO 80216', 39.78297156, -104.9343334
FROM charities WHERE slug = 'denver-rescue-mission';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Ministry Outreach Center',
  'Central warehouse and distribution location for Denver Rescue Mission. People in need of food, clothing, furniture, and household items find assistance at this location.',
  '5725 East 39th Avenue, Denver, CO 80207', 39.77218828, -104.9212874
FROM charities WHERE slug = 'denver-rescue-mission';

-- Food Bank of the Rockies
INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Main Distribution Center',
  'Primary warehouse and distribution facility for Denver hunger relief.',
  '20600 E. 38th Avenue, Aurora, CO 80011', 39.76876456, -104.7471157
FROM charities WHERE slug = 'food-bank-of-the-rockies';

-- Humane Colorado
INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Leslie A. Malone Center',
  'A full-service shelter offering adoptions, pet admissions, lost-and-found services, euthanasia services, animal protection, and humane education opportunities for the public.',
  '2080 S. Quebec St., Denver, CO 80231', 39.67925609, -104.9023557
FROM charities WHERE slug = 'humane-colorado';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Buddy Center',
  'A full-service shelter offering pet admissions, lost-and-found services, euthanasia services, and humane education opportunities for the public.',
  '4556 Castleton Court, Castle Rock, CO 80104', 39.407601, -104.8661007
FROM charities WHERE slug = 'humane-colorado';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Harmony Equine Center',
  'A rehabilitation and adoption facility for abused and neglected horses, ponies, donkeys, and mules that have been removed from their owners by law enforcement authorities. Serves as a central hub where horses from humane societies and rescue groups can receive training and rehoming.',
  '5540 Colorado 86, Franktown, CO 80116', 39.39376667, -104.7838528
FROM charities WHERE slug = 'humane-colorado';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'San Luis Valley Center',
  'Shelter in Alamosa for adoptions and animal care services provided by Humane Colorado.',
  '701 Airport Road, Alamosa, CO 81101', 37.4684799, -105.863827
FROM charities WHERE slug = 'humane-colorado';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Veterinary Hospital at CSU Spur',
  $$Humane Colorado's Veterinary Hospital at CSU Spur offers donor-subsidized services for sick and injured pets whose owners need help with the cost of necessary medical care.$$,
  '4817 National Western Dr, Denver, CO 80216', 39.78443231, -104.9736253
FROM charities WHERE slug = 'humane-colorado';

-- Mile High United Way
INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'United Way Headquarters',
  'Main office and community resource center.',
  '711 Park Avenue West, Denver, CO 80205', 39.7528339, -104.9840659
FROM charities WHERE slug = 'mile-high-united-way';

-- Boys & Girls Clubs of Metro Denver
INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Boys & Girls Clubs of Metro Denver',
  'Administrative headquarters and training center.',
  '2017 West 9th Avenue, Denver, CO 80204', NULL, NULL
FROM charities WHERE slug = 'boys-girls-clubs-of-metro-denver';

-- Project Angel Heart
INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Office and Kitchen',
  'Main location for meal preparation and operations.',
  '4950 Washington St, Denver, CO 80216', 39.7869524, -104.9775992
FROM charities WHERE slug = 'project-angel-heart';

-- Urban Peak
INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'The Mothership',
  'A vibrant, thriving campus that offers comprehensive services to address the complex needs of youth experiencing homelessness. Includes integrated services and progressively independent levels of housing so that youth can find safety, learn, grow and prepare themselves for the transition from homelessness to self-determined, fulfilled lives.',
  '1630 S. Acoma St., Denver, CO 80223', 39.68687269, -104.9884957
FROM charities WHERE slug = 'urban-peak';

-- Colorado Coalition for the Homeless
INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Administrative Headquarters',
  'Main administrative offices.',
  '2111 Champa Street, Denver, CO 80205', 39.75177632, -104.9877763
FROM charities WHERE slug = 'colorado-coalition-for-the-homeless';

-- Denver Kids Inc
INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Main Office',
  'Administrative headquarters.',
  '780 Grant Street, Denver, CO 80203', NULL, NULL
FROM charities WHERE slug = 'denver-kids-inc';

-- Wellpower
INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Recovery Center',
  'Hub for adult mental health and behavioral services, offering a range of person-centered treatment options from outpatient therapy and psychiatric care to intensive case management and medication-assisted treatment to support recovery.',
  '4455 E 12th Ave, Denver, CO 80220', 39.73504343, -104.9355686
FROM charities WHERE slug = 'wellpower';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Dahlia Campus for Health & Well-Being',
  'Garden and farm space open to the entire Northeast Park Hill community. Features indoor classroom, play, community and therapy spaces and provides access to therapy and mental well-being programs for all ages.',
  '3401 Eudora St, Denver, CO 80207', 39.7647918, -104.9315977
FROM charities WHERE slug = 'wellpower';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Resource Center',
  'Collection site for donations of food, clothes and other household items.',
  '1075 Galapago St, Denver, CO 80204', 39.73350997, -104.9967562
FROM charities WHERE slug = 'wellpower';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'NextChapter',
  'Psychiatric rehabilitation center that helps adults with mental health conditions build skills and confidence through supported employment, education, wellness classes, creative arts, vocational training, and peer support.',
  '456 Bannock St, Denver, CO 80204', 39.723752, -104.9906618
FROM charities WHERE slug = 'wellpower';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Wellpower Administration',
  NULL,
  '4141 E Dickenson Pl, Denver, CO 80222', 39.6722614, -104.9392211
FROM charities WHERE slug = 'wellpower';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Wellshire Behavioral Services',
  'Outpatient clinic for adults with commercial insurance that provides personalized mental health therapy and psychiatric medication management with an on-site pharmacy and collaborative care team.',
  '4141 E Dickenson Pl, Denver, CO 80222', 39.6722614, -104.9392211
FROM charities WHERE slug = 'wellpower';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Emerson St. for Teens & Young Adults',
  'Mental health and psychiatric rehabilitation program center for teens and young adults ages 15–26, offering therapy, case management, supported employment and education, wellness groups, and community outings.',
  '4141 E Dickenson Pl, Denver, CO 80222', 39.6722614, -104.9392211
FROM charities WHERE slug = 'wellpower';

-- Denver Center for the Performing Arts
INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Denver Performing Arts Complex',
  'Large arts complex with 10 performance spaces for plays, musicals, and Broadway productions.',
  '1400 Curtis Street, Denver, CO 80204', 39.74464737, -104.9982076
FROM charities WHERE slug = 'denver-center-for-performing-arts';

-- Habitat for Humanity of Metro Denver
INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Habitat Denver ReStore',
  $$Home improvement store and donation center in Denver that sells new and gently used furniture, appliances, building materials, and other home goods at discounted prices, with all proceeds supporting Habitat for Humanity's affordable homeownership programs in the Metro Denver area.$$,
  '70 Rio Grande Blvd, Denver, CO 80223', 39.72159189, -105.0022132
FROM charities WHERE slug = 'habitat-for-humanity-metro-denver';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Administrative Office',
  NULL,
  '430 S Navajo St, Denver, CO 80223', 39.7112924, -105.0039299
FROM charities WHERE slug = 'habitat-for-humanity-metro-denver';

-- Denver Botanic Gardens
INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'York Street Gardens',
  'Denver Botanic Gardens at York Street, in cooperation with the City and County of Denver, presents a wide range of gardens and collections on 24 acres. The gardens reflect an ever-widening diversity of plants from all corners of the world.',
  '1007 York St, Denver, CO 80206', 39.73221865, -104.961163
FROM charities WHERE slug = 'denver-botanic-gardens';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Chatfield Farms',
  '700-acre native plant refuge and working farm located along the banks of Deer Creek in southern Jefferson County. Chatfield Farms is home to historical buildings dating back to the 1800s, 2.5 miles of nature trails and numerous wildflower gardens.',
  '8500 W Deer Creek Canyon Road, Littleton, CO 80128', 39.55189763, -105.0994246
FROM charities WHERE slug = 'denver-botanic-gardens';

-- Warren Village
INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Warren Village at Alameda',
  'Offers supportive housing for families who have experienced homelessness or are at risk of housing instability, with a preference for single-parent families. It additionally includes the Mile High United Way Early Learning Center, featuring classrooms and play spaces.',
  '1394 W. Alameda Avenue, Denver, CO 80223', 39.71120141, -105.00603
FROM charities WHERE slug = 'warren-village';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Warren Village at First Step',
  'Offers safe and affordable transitional, shared housing in Northwest Denver for single mothers or female heads of household aged 18-24, along with their children under the age of 12.',
  '5280 Federal Boulevard, Denver, CO 80221', 39.79263017, -105.0246813
FROM charities WHERE slug = 'warren-village';

INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
SELECT id, 'Warren Village at Gilpin',
  'Offers private apartments and supportive services in a 92-unit apartment building to single-parent families who are unstably housed or experiencing homelessness. Includes on-site economic mobility coaching and resource navigation, adult enrichment classes, career and postsecondary education support, community-building activities, and mental health support. An on-site early learning center is available for the children of residents ages 6 weeks to 12 years old.',
  '1323 Gilpin Street, Denver, CO 80218', 39.73746068, -104.9675847
FROM charities WHERE slug = 'warren-village';
