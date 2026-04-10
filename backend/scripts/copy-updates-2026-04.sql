-- Copy improvements: charity descriptions and location labels/descriptions
-- Generated 2026-04-07 from docs/Tasks/Todo/Improve Copy Content.md
-- Run against local DB first; verify in app; then sync to prod via sync-content.ts
-- After sync, separately update Wellpower HQ on prod (not in local DB).

BEGIN;

-- ============================================================
-- CHARITY DESCRIPTIONS
-- ============================================================

UPDATE charities SET description =
$$Serves unhoused and unstably housed low-income single-parent families in the Denver area, providing the space and resources for families to achieve economic mobility and navigate systems of poverty.

Through a two-generation approach, Warren Village empowers both parents and their children through life-skills classes, early childhood education, career and education support, and resource navigation.$$
WHERE slug = 'warren-village';

UPDATE charities SET description =
$$Reaches young people ages 12–24 experiencing homelessness through street outreach, emergency shelter, transitional housing, and long-term case management across the Denver metro area.

Urban Peak provides a full continuum of services designed to move youth from crisis to self-sufficiency — including meals, medical care, mental health support, employment assistance, and life skills development. Services are available year-round through an integrated model that meets young people where they are, whether on the streets or at a drop-in campus.$$
WHERE slug = 'urban-peak';

UPDATE charities SET description =
$$Works to end homelessness in Colorado through an integrated model of housing, healthcare, and supportive services delivered across the Denver metro area and beyond.

Programs span federally qualified health centers, permanent supportive housing, street outreach, substance use recovery, employment services, and early childhood education — designed to address the full spectrum of needs that keep people in or return them to homelessness.$$
WHERE slug = 'colorado-coalition-for-the-homeless';

UPDATE charities SET description =
$$Hosts a network of community gardens and food forests across metro Denver, providing affordable garden plots, soil support, seeds and seedlings, and volunteer garden leadership to gardeners of diverse backgrounds and income levels.

Participants include many low-income households and residents of food deserts, with gardeners representing dozens of languages spoken across the city. Each season, gardeners donate a portion of their harvest for community food redistribution across the metro area.

Grown out of a grassroots movement that began in North Denver in the 80's, DUG is now one of the country's largest urban agriculture networks.$$
WHERE slug = 'denver-urban-gardens';

UPDATE charities SET description =
$$Delivers social services to individuals and families across Colorado regardless of faith background, with programs spanning food security, mental health counseling, refugee resettlement, aging care, disability services, and employment support.

A grocery-style food pantry at the Denver campus allows clients to shop with dignity for fresh produce, dairy, and household essentials. Additional programs include emergency housing assistance, school-based mental health counseling, comprehensive refugee resettlement services, and wraparound support for older adults and people with disabilities across the greater Denver metro area.

Jewish Family Service of Colorado has served Colorado since 1872, making it one of the state's longest-running social service organizations.$$
WHERE slug = 'jewish-family-service-of-colorado';

UPDATE charities SET description =
$$Provides essential support to low-income residents of the south Denver metro area through a philosophy of dignity and long-term self-sufficiency.

A grocery store-style food pantry lets qualifying individuals choose their own items from fresh produce, proteins, and shelf-stable goods. Additional programs provide financial assistance for rent and utilities, recreation center passes for low-income residents, and seasonal support including school supply drives, holiday grocery boxes, and gift programs for families.$$
WHERE slug = 'integrated-family-community-services';

UPDATE charities SET description =
$$Creates live theatrical experiences for audiences across Colorado through Broadway touring productions, an award-winning resident theatre company, and one of the country's most extensive nonprofit arts education programs.

Performances range from touring Broadway productions and original resident productions to experimental and community-focused work. Education programs bring theatre into schools and communities across the region.$$
WHERE slug = 'denver-center-for-performing-arts';

UPDATE charities SET description =
$$Provides safe, affordable after-school and summer programming for children and teens across the Denver metro area, operating neighborhood Clubs and a mountain summer camp.

Members receive daily homework help, STEM programming, career exploration, literacy support, and access to mental health professionals. Programs focus on academic success, character development, and healthy lifestyles for youth ages 6 to 18.

Clubs are located throughout Denver, Aurora, Westminster, Commerce City, Arvada, Brighton, and surrounding communities, with a focus on youth from low-income households.$$
WHERE slug = 'boys-girls-clubs-of-metro-denver';


-- ============================================================
-- LOCATION LABELS AND DESCRIPTIONS
-- ============================================================

-- Colorado Coalition for the Homeless HQ
UPDATE charity_locations SET
  label = 'Colorado Coalition for the Homeless HQ',
  description = 'Houses leadership and administrative operations for the Coalition''s statewide work. Staff coordinate housing programs, healthcare services, advocacy efforts, and community partnerships across the organization''s facilities in Colorado.'
WHERE charity_id = (SELECT id FROM charities WHERE slug = 'colorado-coalition-for-the-homeless')
  AND label = 'Administrative Headquarters';

-- Denver Kids Inc HQ (label only — existing description is already good)
UPDATE charity_locations SET
  label = 'Denver Kids Inc HQ'
WHERE charity_id = (SELECT id FROM charities WHERE slug = 'denver-kids-inc')
  AND label = 'Main Office';

-- Mile High United Way HQ
UPDATE charity_locations SET
  label = 'Mile High United Way HQ',
  description = 'Administrative and program hub for Mile High United Way''s community initiatives, including the 211 Help Center and Tax Help Colorado free tax preparation program.'
WHERE charity_id = (SELECT id FROM charities WHERE slug = 'mile-high-united-way')
  AND label = 'United Way Headquarters';

-- NOTE: Wellpower HQ ('Wellpower Administration') does not exist in local DB.
-- It exists on prod with a NULL description. After syncing other changes,
-- run this directly on prod (after backup):
--   UPDATE charity_locations SET
--     label = 'Wellpower HQ',
--     description = 'Houses WellPower''s organizational leadership and administrative staff, coordinating the network of behavioral health programs and clinical services across Denver.'
--   WHERE charity_id = (SELECT id FROM charities WHERE slug = 'wellpower')
--     AND label = 'Wellpower Administration';

-- Habitat for Humanity HQ
UPDATE charity_locations SET
  label = 'Habitat for Humanity HQ',
  description = 'Coordinates homeownership construction, home repair programs, and ReStore logistics across Adams, Arapahoe, Denver, Douglas, and Jefferson counties. Staff support partner family selection, volunteer coordination, and community partnerships.'
WHERE charity_id = (SELECT id FROM charities WHERE slug = 'habitat-for-humanity-metro-denver')
  AND label = 'Administrative Office';

-- Boys & Girls Clubs HQ
UPDATE charity_locations SET
  label = 'Boys & Girls Clubs HQ',
  description = 'Houses the organization''s administrative leadership and staff training operations, supporting the network of neighborhood Clubs across the metro area through program development, professional development, and community partnerships.'
WHERE charity_id = (SELECT id FROM charities WHERE slug = 'boys-girls-clubs-of-metro-denver')
  AND label = 'Boys & Girls Clubs of Metro Denver'
  AND description = 'Headquarters and training center.';


-- ============================================================
-- DENVER URBAN GARDENS LOCATION REWRITES (17 locations)
-- All matched by charity_id = 35 + exact label
-- ============================================================

UPDATE charity_locations SET description =
'A community garden set in parkland along Semper Farm, with gardeners from many different backgrounds coming together through the shared experience of growing food. Gardeners donate 10% of their harvest each season for community food redistribution.'
WHERE charity_id = 35 AND label = 'Allison Community Gardens at Semper Farm';

UPDATE charity_locations SET description =
'A community garden with a focus on wellness and mental health support, serving an onsite school and used by therapists with child and family clients and groups. Gardeners donate a portion of their harvest each season for community food redistribution.'
WHERE charity_id = 35 AND label = 'Aurora Mental Health Center Community Garden';

UPDATE charity_locations SET description =
'A school community garden tended by students, teachers, and community members together. Students participate in planting, caring for, and harvesting vegetables and flowers. Gardeners donate a portion of their harvest each season for community food redistribution.'
WHERE charity_id = 35 AND label = 'Bromwell School Community Garden';

UPDATE charity_locations SET description =
'A community garden serving the surrounding neighborhood, including residents of St. Martin Plaza, a nearby senior independent living community. Members of the community garden maintain individual plots and spend time outdoors together. Gardeners donate a portion of their harvest each season for community food redistribution.'
WHERE charity_id = 35 AND label = 'Bruce Randolph Community Garden';

UPDATE charity_locations SET description =
'A community garden in the Baker neighborhood with a diverse mix of gardeners including families, young gardeners, couples, and participants from a local mental health program. Gardeners donate a portion of their harvest each year for community food redistribution.'
WHERE charity_id = 35 AND label = 'Casa Verde Community Garden';

UPDATE charity_locations SET description =
'A school community garden that builds relationships between students, gardeners, and the surrounding neighborhood. Dedicated plots are set aside for community sharing and donating food to neighbors.'
WHERE charity_id = 35 AND label = 'Cheltenham School Community Garden';

UPDATE charity_locations SET description =
'A community garden for DU students, staff, and neighbors to grow fruits, vegetables, and build community together. The garden includes a permaculture area, tool shed, community compost system, and bee hives. Gardeners donate a portion of their harvest each season for community food redistribution.'
WHERE charity_id = 35 AND label = 'DU Bridge Community Garden';

UPDATE charity_locations SET description =
'A school community garden where students and neighborhood residents grow a range of vegetables together. Donations from the garden go to Project Angel Heart and to the school community.'
WHERE charity_id = 35 AND label = 'Edison School Community Garden';

UPDATE charity_locations SET description =
'A community garden on the grounds of the Martin Luther King, Jr. Library in Aurora. Many gardeners are immigrants and refugees from Nepal, Bhutan, Mexico, Africa, and Myanmar, alongside neighbors from the surrounding community. Gardeners donate a portion of their harvest each season for community food redistribution.'
WHERE charity_id = 35 AND label = 'Fletcher Community Garden';

UPDATE charity_locations SET description =
'A longstanding community garden that brings together a mix of younger and older gardeners from the surrounding neighborhood. The garden has been operating for over 25 years, and gardeners donate produce to organizations including Project Angel Heart.'
WHERE charity_id = 35 AND label = 'Gove Community Garden';

UPDATE charity_locations SET description =
'A community garden in Arvada drawing participants from large local Russian and Hmong immigrant communities. Members of the community garden gather throughout the season, sharing garden knowledge and cultural traditions while working their plots. Gardeners donate produce to neighbors and community food programs.'
WHERE charity_id = 35 AND label = 'Living Light of Peace Community Garden';

UPDATE charity_locations SET description =
'A community garden where experienced gardeners share knowledge with newer members. All food grown in shared beds, as well as surplus produce from individual plots, is donated to the Zuni Food Bank.'
WHERE charity_id = 35 AND label = 'Ruby Hill Park Community Garden';

UPDATE charity_locations SET description =
'A community garden open to surrounding neighbors and children alongside plot holders. Members of the community garden act as informal mentors, passing on gardening knowledge to newer and younger members.'
WHERE charity_id = 35 AND label = 'Shoshone Community Garden';

UPDATE charity_locations SET description =
'A community garden along a neighborhood sidewalk in the Park Hill neighborhood, maintained by church members, community neighbors, and families. A majority of harvested produce is donated to The Greater Park Hill Community Food Bank.'
WHERE charity_id = 35 AND label = 'St. Thomas Church Community Garden';

UPDATE charity_locations SET description =
'A partnership between DUG and the City of Lakewood, providing garden plots to local residents including dedicated plots for a nearby elementary school. The garden participates in the Plant a Row for the Hungry program, contributing produce to a local food bank.'
WHERE charity_id = 35 AND label = 'Ute Trail Community Garden';

UPDATE charity_locations SET description =
'Dating back to 1979, a community garden dedicated to sustainable organic gardening, education, and community. Experienced and novice gardeners grow side by side, sharing knowledge and mentoring newer members. Members of the community garden collectively run a food donation program.'
WHERE charity_id = 35 AND label = 'West Wash Park Community Garden';

UPDATE charity_locations SET description =
'A community garden that has been part of the Whittier neighborhood for over 40 years. In addition to personal plots, members maintain shared donation plots picked up by Fresh Food Connect and donated to a nearby senior center.'
WHERE charity_id = 35 AND label = 'Whittier School Community Garden';


-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT slug, LEFT(description, 100) AS description_start
FROM charities
WHERE slug IN (
  'warren-village', 'urban-peak', 'colorado-coalition-for-the-homeless',
  'denver-urban-gardens', 'jewish-family-service-of-colorado',
  'integrated-family-community-services', 'denver-center-for-performing-arts',
  'boys-girls-clubs-of-metro-denver'
)
ORDER BY slug;

SELECT cl.label, LEFT(cl.description, 80) AS description_start
FROM charity_locations cl
JOIN charities c ON c.id = cl.charity_id
WHERE (c.slug = 'colorado-coalition-for-the-homeless' AND cl.label ILIKE '%HQ%')
   OR (c.slug = 'denver-kids-inc' AND cl.label ILIKE '%HQ%')
   OR (c.slug = 'mile-high-united-way' AND cl.label ILIKE '%HQ%')
   OR (c.slug = 'habitat-for-humanity-metro-denver' AND cl.label ILIKE '%HQ%')
   OR (c.slug = 'boys-girls-clubs-of-metro-denver' AND cl.label = 'Boys & Girls Clubs HQ')
ORDER BY cl.label;

SELECT label, LEFT(description, 80) AS description_start
FROM charity_locations
WHERE charity_id = 35
  AND label IN (
    'Allison Community Gardens at Semper Farm',
    'Aurora Mental Health Center Community Garden',
    'Bromwell School Community Garden',
    'Bruce Randolph Community Garden',
    'Casa Verde Community Garden',
    'Cheltenham School Community Garden',
    'DU Bridge Community Garden',
    'Edison School Community Garden',
    'Fletcher Community Garden',
    'Gove Community Garden',
    'Living Light of Peace Community Garden',
    'Ruby Hill Park Community Garden',
    'Shoshone Community Garden',
    'St. Thomas Church Community Garden',
    'Ute Trail Community Garden',
    'West Wash Park Community Garden',
    'Whittier School Community Garden'
  )
ORDER BY label;

COMMIT;
