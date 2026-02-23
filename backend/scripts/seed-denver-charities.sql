INSERT INTO charities
  (name, ein, slug, description, website_url, cause_tags, every_org_slug, every_org_claimed, volunteer_url, founded_year, is_active, primary_address)
VALUES
  (
    'Denver Rescue Mission', '84-6038762', 'denver-rescue-mission',
    'Helps restore the lives of people experiencing homelessness and addiction through emergency services, rehabilitation, transitional programs, and community outreach.',
    'https://www.denverrescuemission.org',
    '{homelessness,hunger,housing}',
    'denver-rescue-mission', FALSE,
    'https://denverrescuemission.org/volunteer/',
    1892, TRUE, '6100 Smith Road, Denver, CO 80216'
  ),
  (
    'Food Bank of the Rockies', '84-0772672', 'food-bank-of-the-rockies',
    'Serves as the backbone of hunger relief in Metro Denver and Northern Colorado, coordinating with hundreds of Hunger Relief Partners and acting as a distribution hub for food, essentials, and logistical resources.',
    'https://www.foodbankrockies.org',
    '{hunger,food-security,families}',
    'food-bank-of-the-rockies', TRUE,
    'https://www.foodbankrockies.org/get-involved/volunteer/',
    1978, TRUE, '20600 E. 38th Avenue, Aurora, CO 80011'
  ),
  (
    'Humane Colorado', '84-0405254', 'humane-colorado',
    'Provides shelter and veterinary care for homeless pets in the Denver metro area.',
    'https://humanecolorado.org/',
    '{animals,pets,adoption}',
    'denver-dumb-friends-league', TRUE,
    'https://humanecolorado.org/volunteer/',
    1910, TRUE, '2080 S. Quebec St., Denver, CO 80231'
  ),
  (
    'Mile High United Way', '84-0404235', 'mile-high-united-way',
    'Unites people and resources to solve critical issues facing the Metro Denver community including early childhood education, homelessness and food security.',
    'https://unitedwaydenver.org',
    '{education,health}',
    'unitedwaydenver', TRUE,
    'https://unitedwaydenver.org/get-involved/volunteer/',
    1887, TRUE, '711 Park Avenue West, Denver, CO 80205'
  ),
  (
    'Boys & Girls Clubs of Metro Denver', '84-0510404', 'boys-girls-clubs-of-metro-denver',
    'Enables young people in Denver to reach their full potential as productive citizens.',
    'https://www.bgcmd.org',
    '{youth,education,mentorship}',
    'bgcmd', FALSE,
    'https://www.bgcmd.org/get-involved/volunteer/',
    1961, TRUE, '2017 West 9th Avenue, Denver, CO 80204'
  ),
  (
    'Project Angel Heart', '84-1199481', 'project-angel-heart',
    'Prepares and delivers medically-tailored meals to Coloradans with life-threatening illnesses.',
    'https://www.projectangelheart.org',
    '{health,hunger,seniors}',
    'project-angel-heart', FALSE,
    'https://www.projectangelheart.org/volunteer/',
    1991, TRUE, '4950 Washington St, Denver, CO 80216'
  ),
  (
    'Urban Peak', '84-1212246', 'urban-peak',
    'Provides housing and integrated services to help homeless youth in Denver overcome challenges and find a path to self-sufficiency.',
    'https://www.urbanpeak.org',
    '{youth,homelessness,housing}',
    'urbanpeak', FALSE,
    'https://www.urbanpeak.org/volunteer',
    1988, TRUE, '1630 S. Acoma St., Denver, CO 80223'
  ),
  (
    'Colorado Coalition for the Homeless', '84-0951575', 'colorado-coalition-for-the-homeless',
    'Provides housing and health services for homeless across Colorado.',
    'https://www.coloradocoalition.org',
    '{homelessness,housing,health}',
    'coloradocoalition', FALSE,
    'https://www.coloradocoalition.org/volunteer',
    1984, TRUE, '2111 Champa Street, Denver, CO 80205'
  ),
  (
    'Denver Kids Inc', '84-1244211', 'denver-kids-inc',
    'Provides guidance and support to at-risk students in Denver Public Schools, empowering them to graduate high school and pursue postsecondary options.',
    'https://www.denverkids.org',
    '{youth,education,mentorship}',
    'denverkidsinc', FALSE,
    'https://www.denverkids.org/get-involved#volunteer',
    1993, TRUE, '780 Grant Street, Denver, CO 80203'
  ),
  (
    'Habitat for Humanity of Metro Denver', '74-2050021', 'habitat-for-humanity-metro-denver',
    'Building affordable homes and revitalizing neighborhoods with families in need.',
    'https://habitatmetrodenver.org',
    '{housing,families}',
    'habitatmetrodenver', FALSE,
    'https://habitatmetrodenver.org/volunteer/core-volunteers/',
    1979, TRUE, '430 S Navajo St, Denver, CO 80223'
  ),
  (
    'Denver Center for the Performing Arts', '84-0407760', 'denver-center-for-performing-arts',
    'Engaging and inspiring audiences through world-class theatre and education programs.',
    'https://www.denvercenter.org',
    '{arts,education}',
    'denvercenter', FALSE,
    'https://www.denvercenter.org/support-us/volunteer/',
    1972, TRUE, '1101 13th St, Denver, CO 80204'
  ),
  (
    'Wellpower', '74-2499946', 'wellpower',
    'Provides comprehensive mental health and wellness services in Denver.',
    'https://www.wellpower.org',
    '{health,mental-health}',
    'mhcd', FALSE,
    'https://www.wellpower.org/volunteer/',
    1989, TRUE, '4141 E Dickenson Pl, Denver, CO 80222'
  )
ON CONFLICT (ein) DO NOTHING;
