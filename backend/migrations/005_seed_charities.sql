-- Up Migration
INSERT INTO charities (name, description, logo_url, website_url, cause_tags, every_org_slug, ein) VALUES
(
  'Denver Rescue Mission',
  'Providing emergency services, rehabilitation, and transitional programs for people experiencing homelessness and poverty in Denver since 1892.',
  'https://www.denverrescuemission.org/wp-content/uploads/2021/06/DRM-Logo.png',
  'https://www.denverrescuemission.org',
  ARRAY['homelessness', 'hunger', 'housing'],
  'denver-rescue-mission',
  '840404517'
),
(
  'Food Bank of the Rockies',
  'Serving as the backbone of hunger relief in the Denver metro area and across Northern Colorado, distributing food to families in need.',
  'https://www.foodbankrockies.org/wp-content/uploads/FBR-Logo.png',
  'https://www.foodbankrockies.org',
  ARRAY['hunger', 'food-security', 'families'],
  'food-bank-of-the-rockies',
  '840772672'
),
(
  'Denver Dumb Friends League',
  'Providing a voice for homeless pets through shelter, veterinary care, and adoption services in the Denver metro area.',
  'https://www.ddfl.org/wp-content/uploads/DDFL-Logo.png',
  'https://www.ddfl.org',
  ARRAY['animals', 'pets', 'adoption'],
  'dumb-friends-league',
  '840402889'
),
(
  'Mile High United Way',
  'Uniting people, ideas, and resources to solve the most critical issues facing the Metro Denver community.',
  NULL,
  'https://unitedwaydenver.org',
  ARRAY['community', 'education', 'health'],
  'mile-high-united-way',
  '840404278'
),
(
  'Boys & Girls Clubs of Metro Denver',
  'Enabling young people in Denver to reach their full potential as productive, caring, and responsible citizens.',
  NULL,
  'https://www.bgcmd.org',
  ARRAY['youth', 'education', 'mentorship'],
  'boys-girls-clubs-of-metro-denver',
  '840409690'
),
(
  'Project Angel Heart',
  'Preparing and delivering medically tailored meals to Coloradans living with life-threatening illnesses.',
  NULL,
  'https://www.projectangelheart.org',
  ARRAY['health', 'hunger', 'seniors'],
  'project-angel-heart',
  '841104823'
),
(
  'Urban Peak',
  'Helping homeless youth in Denver overcome real-life challenges by meeting their immediate needs and providing a path to self-sufficiency.',
  NULL,
  'https://www.urbanpeak.org',
  ARRAY['youth', 'homelessness', 'housing'],
  'urban-peak',
  '840932498'
),
(
  'Colorado Coalition for the Homeless',
  'Working to end homelessness through housing, health services, and supportive services across Colorado.',
  NULL,
  'https://www.coloradocoalition.org',
  ARRAY['homelessness', 'housing', 'health'],
  'colorado-coalition-for-the-homeless',
  '840959033'
),
(
  'Denver Kids Inc',
  'Providing guidance, resources, and support to at-risk students in Denver Public Schools to help them graduate.',
  NULL,
  'https://www.denverkids.org',
  ARRAY['youth', 'education', 'mentorship'],
  'denver-kids',
  '841189734'
),
(
  'Habitat for Humanity of Metro Denver',
  'Building affordable homes and revitalizing neighborhoods in partnership with families in need.',
  NULL,
  'https://www.habitatmetrodenver.org',
  ARRAY['housing', 'community', 'families'],
  'habitat-for-humanity-of-metro-denver',
  '840758553'
),
(
  'Denver Center for the Performing Arts',
  'Engaging, entertaining, and inspiring audiences through world-class theatre, education, and community programs.',
  NULL,
  'https://www.denvercenter.org',
  ARRAY['arts', 'education', 'community'],
  'denver-center-for-the-performing-arts',
  '840530226'
),
(
  'Mental Health Center of Denver',
  'Providing comprehensive mental health and wellness services to those in need in the Denver community.',
  NULL,
  'https://www.mhcd.org',
  ARRAY['health', 'mental-health', 'community'],
  'mental-health-center-of-denver',
  '840402637'
),
(
  'Denver Botanic Gardens',
  'Connecting people with plants through education, conservation, and horticulture across Colorado.',
  NULL,
  'https://www.botanicgardens.org',
  ARRAY['environment', 'education', 'community'],
  'denver-botanic-gardens',
  '840531032'
);

---- Down Migration
DELETE FROM charities WHERE ein IN ('840404517', '840772672', '840402889', '840404278', '840409690', '841104823', '840932498', '840959033', '841189734', '840758553', '840530226', '840402637', '840531032');
