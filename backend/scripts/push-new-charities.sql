-- Production INSERT: 19 new charities
-- Generated from local app_db 2026-04-13

BEGIN;

-- Animal Rescue of the Rockies
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'Animal Rescue of the Rockies',
  'animal-rescue-of-the-rockies',
  '20-1055815',
  2003,
  'https://arrcolorado.org/',
  '13918 E Mississippi Ave, Suite 60188, Aurora, CO 80012',
  ARRAY['animals'],
  'https://arrcolorado.org/donate/',
  'https://arrcolorado.org/volunteer/',
  'animal-rescue-of-the-rockies',
  $escape$Rescues at-risk dogs and cats from overcrowded Colorado shelters and places them with foster families and permanent adoptive homes — providing full medical care including spay/neuter, vaccinations, and microchipping before adoption. 

Animal Rescue of the Rockies also runs a trap-neuter-return program for community cat populations and operates the Cat Casita, a cage-free adoptable cat space in Fairplay.

The organization was founded in 2003 by volunteers who wanted to prevent healthy animals from running out of time in overcrowded shelters, and has placed more than 10,000 dogs and cats in loving homes over more than two decades.$escape$,
  $escape$- 2,000 animals adopted annually
- 10,000+ dogs and cats successfully placed since founding
- 100% of animals receive full medical care — spay/neuter, vaccinations, and microchipping — before adoption$escape$,
  $escape$Based in Aurora with foster networks and adoption programs operating throughout the Denver metro area and statewide.$escape$,
  $escape$(heart)**Shelter Rescue**Pulls at-risk dogs and cats from overcrowded Colorado shelters before they run out of time, providing medical care and rehabilitation.
(home)**Foster Network**Volunteer foster homes provide rescued animals with care, socialization, and a safe environment before their permanent adoption.
(people)**Adoption Program**Full medical care and careful matching ensures every adopter finds the right companion, with support throughout the process.
(star)**TNR Program**Trap-neuter-return for community cat populations, humanely managing outdoor cat numbers and improving community animal welfare.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  true
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Animal Rescue of the Rockies HQ', $escape$13918 E Mississippi Ave, Suite 60188, Aurora, CO 80012$escape$, 39.6953365, -104.8257110, $escape$Administrative headquarters for shelter rescue operations, foster network coordination, and adoption matching in Aurora. Animals in the program are placed with volunteer foster families rather than housed at this office location.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776091842/charity-locations/location-580.jpg$escape$, 0, false
FROM charities WHERE slug = 'animal-rescue-of-the-rockies';

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Cat Casita — Fairplay', $escape$503 Hwy 285, Fairplay, CO 80440$escape$, 39.2233279, -105.9918508, $escape$A cage-free adoptable cat space inside High Paw Pet Supplies in Fairplay, giving ARR cats visibility and adoption opportunities in the mountain communities of Park County.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089362/charity-locations/location-581.jpg$escape$, 0, false
FROM charities WHERE slug = 'animal-rescue-of-the-rockies';

-- BGOLDN
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'BGOLDN',
  'bgoldn',
  '32-0447255',
  2020,
  'https://bgoldn.org/',
  '1301 Arapahoe St #105, Golden, CO 80401',
  ARRAY['hunger','families'],
  'https://bgoldn.org/donate',
  'https://bgoldn.org/volunteer',
  'bgoldn',
  $escape$Addresses food insecurity in the Golden community through a fresh food pantry, grocery home delivery program, and school snack distribution — built on partnerships with local food producers and schools.

Launched in 2020 as pandemic-driven hunger surged in Golden, BGOLDN grew directly out of The Golden Backpack Program — expanding from weekend food packs for kids into a full community food hub built on local farm partnerships and neighbor-to-neighbor care.$escape$,
  $escape$- 520 families served monthly through the fresh food pantry
- 31,500 snacks distributed to partner schools each school year
- 5,000–10,000 pounds of fresh food distributed weekly from local food partners
- 45 food boxes delivered weekly to seniors and residents with mobility barriers
- 8 Golden-area schools partnered for student snack distribution$escape$,
  $escape$Based in Golden, Colorado, serving families, seniors, and students in Golden and surrounding Jefferson County communities.$escape$,
  $escape$(home)**Fresh Food Pantry**Weekly distribution of locally sourced produce and food for Golden-area families, with a focus on fresh and nutritious options.
(heart)**Grocery Home Delivery**Food boxes delivered weekly to seniors and community members with mobility barriers who cannot easily access the pantry.
(people)**School Snack Program**Nutritious snacks distributed through Golden-area schools, ensuring students have fuel to focus and learn throughout the school day.
(star)**Local Food Partnerships**Direct sourcing from local farms and food producers keeps food fresh, supports local agriculture, and builds community food resilience.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  true
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'BGOLDN HQ', $escape$1301 Arapahoe St #105, Golden, CO 80401$escape$, 39.7539540, -105.2212397, $escape$Central hub in downtown Golden for the fresh food pantry, grocery home delivery coordination, and school partnership programs. Local food deliveries from farm partners arrive here before distribution to families, seniors, and partner schools throughout the Golden area.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776091935/charity-locations/location-577.jpg$escape$, 0, false
FROM charities WHERE slug = 'bgoldn';

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'BGOLDN Fresh Food Pantry', $escape$17455 W 16th Ave, Golden, CO 80401$escape$, 39.7424368, -105.1970147, $escape$A dedicated fresh food pantry distribution site serving Golden-area families and seniors, stocked with locally sourced produce and food from BGOLDN's farm partnerships.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089359/charity-locations/location-578.jpg$escape$, 0, false
FROM charities WHERE slug = 'bgoldn';

-- Backpack Society
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'Backpack Society',
  'backpack-society',
  '84-3290134',
  2019,
  'https://www.backpacksociety.org/',
  '213 W County Line Rd, Highlands Ranch, CO 80129',
  ARRAY['hunger','youth','education'],
  'https://www.backpacksociety.org/donate',
  'https://www.backpacksociety.org/volunteer',
  'backpack-society',
  $escape$Removes food insecurity as a barrier to learning by providing weekend food backpacks to students who rely on school meals during the week. Backpack Society partners with school counselors to identify the most at-risk students and delivers nourishing packages before weekends and holidays — so hunger never gets in the way of a child's ability to learn.

Founded in 2019 by a Highlands Ranch parent who noticed that students would arrive Monday mornings visibly hungry, Backpack Society grew from a single school to partnerships across 70+ schools in just a few years.$escape$,
  $escape$- 300 weekend backpacks distributed weekly during the school year
- 70+ school partnerships across Douglas County, Littleton, and Englewood School Districts
- 100% community-supported, volunteer-operated model$escape$,
  $escape$Based in Highlands Ranch, serving students across Douglas County, Littleton, and Englewood school districts in the south Denver metro area.$escape$,
  $escape$(people)**Weekend Backpack Program**Nourishing food packages sent home with at-risk students every Friday, so the school week's nutrition doesn't disappear over the weekend.
(star)**School Counselor Partnerships**Works directly with counselors to identify and confidentially support the students most vulnerable to food insecurity.
(heart)**Holiday & Break Distributions**Extra food support provided during school breaks and holidays when hunger risk is highest and school meals are unavailable.
(sun)**Student Ambassador Program**Engages students as leaders in the mission, building empathy and community ownership around the issue of childhood hunger.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  true
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Backpack Society HQ', $escape$213 W County Line Rd, Highlands Ranch, CO 80129$escape$, 39.5648577, -105.0091015, $escape$Administrative base in Highlands Ranch where food packages are assembled and distribution to partner schools across three school districts is coordinated. All volunteer packing and school logistics are managed from this location.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776091971/charity-locations/location-575.jpg$escape$, 0, false
FROM charities WHERE slug = 'backpack-society';

-- Bienvenidos Food Bank
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'Bienvenidos Food Bank',
  'bienvenidos-food-bank',
  '74-2543251',
  1976,
  'https://bienvenidosfoodbank.org/',
  '3810 Pecos Street, Denver, CO 80211',
  ARRAY['hunger','families'],
  'https://bienvenidosfoodbank.org/donate-money/',
  'https://bienvenidosfoodbank.org/volunteer-opportunities/',
  'bienvenidos-food-bank',
  $escape$Provides emergency and supplemental food assistance to families in need across northwest Denver, operating through storefront markets, mobile pantries, and partner sites at schools and community organizations. Bienvenidos serves guests with respect and dignity — offering up to 50 pounds of food per visit at no cost, with no eligibility requirements.

Bienvenidos was founded in 1976 by neighbors and church leaders in the Sunnyside neighborhood who saw hunger around them and organized to feed people — and has been a cornerstone of northwest Denver's food security network for nearly five decades.$escape$,
  $escape$- 60,000 Denver residents served annually
- 500,000+ pounds of food distributed per year (~600,000 meals)
- $1 donated provides over $9 in food value through grocery store partnerships
- 180,000 pounds of food salvaged annually from grocery stores that would otherwise be discarded
- 50 lbs of food provided per visit at no cost, valued at approximately $150 per family$escape$,
  $escape$Based in northwest Denver's Sunnyside neighborhood, serving families throughout the metro area through a storefront market, mobile pantries, and partner sites at schools and nonprofits.$escape$,
  $escape$(home)**Storefront Food Market**A welcoming walk-in pantry in northwest Denver where families receive up to 50 pounds of food at no cost, no questions asked.
(people)**Mobile Pantry**Brings food distribution directly to neighborhoods and communities with limited access to the main pantry location.
(heart)**School & Nonprofit Partner Sites**Emergency food access embedded at schools and community organizations, reaching families where they already are.
(star)**Grocery Salvage Program**Partnerships with grocery stores redirect hundreds of thousands of pounds of surplus food each year that would otherwise be wasted.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  true
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Bienvenidos Food Bank', $escape$3810 Pecos Street, Denver, CO 80211$escape$, 39.7696139, -105.0062394, $escape$The main storefront food market in northwest Denver's Sunnyside neighborhood, where families walk in and receive up to 50 pounds of food at no cost. Mobile pantry distribution and grocery salvage coordination are also based at this location.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776092022/charity-locations/location-572.jpg$escape$, 0, false
FROM charities WHERE slug = 'bienvenidos-food-bank';

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Bienvenidos Mobile Pantry — West Colfax', $escape$4747 W. Colfax Ave, Denver, CO 80204$escape$, 39.7408090, -105.0483488, $escape$A mobile pantry distribution site in the West Colfax neighborhood, bringing supplemental food directly to families with limited access to the main Sunnyside location.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776092039/charity-locations/location-573.jpg$escape$, 0, false
FROM charities WHERE slug = 'bienvenidos-food-bank';

-- Bluff Lake Nature Center
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'Bluff Lake Nature Center',
  'bluff-lake-nature-center',
  '84-1305302',
  1994,
  'https://www.blufflake.org/',
  '11255 E. MLK Jr Blvd, Denver, CO 80238',
  ARRAY['environment','education','youth'],
  'https://www.blufflake.org/donate',
  'https://www.blufflake.org/volunteer',
  'bluff-lake-nature-center',
  $escape$Manages Denver's largest open space as native habitat — a 123-acre urban wildlife refuge and outdoor classroom in the Stapleton neighborhood. Environmental education programs include field trips, summer camps, Forest School, and volunteer stewardship for students, families, and community members of all ages. Bluff Lake Nature Center advances equity in outdoor access and nurtures the health of communities and ecosystems across the city.

Established in 1994, Bluff Lake Nature Center grew from a restored urban wetland next to Denver's old Stapleton airport into the city's only nonprofit nature center.$escape$,
  $escape$- 90,000+ visitors welcomed annually
- 8,000 area elementary students participate in formal education programs each year
- 10,000+ individuals engaged in direct programming each year$escape$,
  $escape$Located in Denver's Stapleton/Central Park neighborhood, serving schools and community members from across the metro area.$escape$,
  $escape$(tree)**Native Habitat Stewardship** Owns and manages 123 acres of wetland, woodland, stream, and prairie as an urban wildlife refuge — the largest open space managed as native habitat in Denver.
(education)**School & Youth Programs** Field trips, summer camps, Forest School, and homeschool enrichment programs bring thousands of students into nature each year, with scholarships available.
(people)**Community Volunteer Programs** Habitat restoration, invasive species removal, and paid internship opportunities engage community members of all ages in hands-on environmental stewardship.
(heart)**Free Public Programming** Birdwatching walks, public events, and open access programs advance equity in outdoor access for all Denver residents.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  true
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Bluff Lake Nature Center', $escape$11255 E. MLK Jr Blvd, Denver, CO 80238$escape$, 39.7602580, -104.8896366, $escape$The 123-acre nature center campus is the hub for all of Bluff Lake's environmental education programs, field trips, summer camps, Forest School, and community events. Habitat restoration volunteer work, paid internships, and public programming are all based at this Central Park location.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776092059/charity-locations/location-566.jpg$escape$, 0, false
FROM charities WHERE slug = 'bluff-lake-nature-center';

-- Catholic Charities
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'Catholic Charities',
  'catholic-charities-archdiocese-denver',
  '84-0686679',
  1927,
  'https://ccdenver.org/',
  '6240 Smith Rd, Denver, CO 80216',
  ARRAY['hunger','housing','families','seniors'],
  'https://ccdenver.org/donate/',
  'https://ccdenver.org/volunteer/',
  'catholic-charities-of-the-archdiocese-of-denver',
  $escape$Extends the healing ministry of the Catholic Church to those in need across the Denver area through a broad network of services — including immigration legal aid, emergency food and clothing, affordable housing, counseling, shelter, and early childhood education. Catholic Charities of Denver operates as one of Colorado's largest and most comprehensive social service organizations, touching nearly every dimension of poverty and crisis.

Catholic Charities of  of the Archdiocese of Denver was established in 1927 — part of a nationwide movement to formalize centuries of Catholic charitable tradition — making it one of Colorado's oldest continuously operating social service organizations and a fixture of Denver's social safety net for nearly a century.$escape$,
  $escape$- 6 core service areas: immigration assistance, emergency food, affordable housing, counseling, shelter, and early childhood education
- 30+ service locations across the Archdiocese of Denver
- 2 dedicated counseling centers — St. Raphael Counseling and Marisol Counseling — serving individuals and families with licensed mental health care$escape$,
  $escape$Headquartered in Denver with programs and service locations spread across the Archdiocese, reaching communities throughout the metro area and beyond.$escape$,
  $escape$(people)**Immigration Legal Services**Affordable, professional immigration legal aid — helping individuals and families navigate citizenship, asylum, and immigration processes.
(home)**Housing Programs**Affordable housing development and support services that provide stability for low-income families and individuals across the region.
(heart)**Emergency Food & Clothing**The Little Flower Assistance Center provides emergency food and clothing to those in immediate need, with dignity and compassion.
(shield)**Counseling Services**St. Raphael Counseling and Marisol Counseling offer licensed mental health and family counseling services to individuals and families in the community.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  true
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Catholic Charities of Denver HQ', $escape$6240 Smith Rd, Denver, CO 80216$escape$, 39.7729842, -104.9152608, $escape$Administrative headquarters for Catholic Charities of the Archdiocese of Denver, coordinating programs and services across locations throughout the metro area. Immigration legal services and other direct service programs are also delivered from this Smith Road campus.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089366/charity-locations/location-588.jpg$escape$, 0, false
FROM charities WHERE slug = 'catholic-charities-archdiocese-denver';

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Little Flower Assistance Center', $escape$11149 E. 14th Ave, Aurora, CO 80010$escape$, 39.7385147, -104.8579270, $escape$Emergency food and clothing assistance center serving families in Aurora and the east Denver metro area with dignity and no eligibility requirements.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776092899/charity-locations/location-589.jpg$escape$, 0, false
FROM charities WHERE slug = 'catholic-charities-archdiocese-denver';

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Samaritan House', $escape$2301 Lawrence St, Denver, CO 80205$escape$, 39.7556512, -104.9872002, $escape$Emergency homeless shelter in Denver's Curtis Park neighborhood providing food, housing, and wraparound services to individuals and families in crisis.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089368/charity-locations/location-590.jpg$escape$, 0, false
FROM charities WHERE slug = 'catholic-charities-archdiocese-denver';

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'St. Raphael Counseling', $escape$2696 S Colorado Blvd #445, Denver, CO 80222$escape$, 39.6688363, -104.9396005, $escape$Licensed mental health counseling center offering individual, couples, and family therapy services on a sliding-scale fee basis.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776092923/charity-locations/location-591.jpg$escape$, 0, false
FROM charities WHERE slug = 'catholic-charities-archdiocese-denver';

-- Colorado Christian Services
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'Colorado Christian Services',
  'colorado-christian-services',
  '84-0597782',
  1963,
  'https://christianservices.org/',
  '3959 East Arapahoe Road, Suite 200, Centennial, CO 80122',
  ARRAY['families','education'],
  'https://christianservices.org/donate/',
  'https://christianservices.org/volunteer/',
  'colorado-christian-services',
  $escape$Provides licensed adoption and foster care placement services and professional counseling for women facing unplanned pregnancies — offering compassionate, Christ-centered support through some of life's most significant decisions. Colorado Christian Services maintains high ethical standards for birth parent care and adoptive family preparation, guiding families through the adoption process with integrity.

Colorado Christian Services was founded in 1963 by Denver faith community leaders who set out to create an ethical, relationship-centered alternative to institutional adoption at a time when few such options existed in Colorado.$escape$,
  $escape$- 1,200+ children placed in adoptive homes
- 6,500+ women facing unplanned pregnancies counseled and supported$escape$,
  $escape$Serves adoptive families and birth parents across Colorado from offices in Centennial, with national reach for adoptive family matching.$escape$,
  $escape$(heart)**Domestic Adoption**Ethical, relationship-based adoption placement connecting birth parents with carefully prepared adoptive families across Colorado and the nation.
(people)**Birth Parent Counseling**Professional, confidential support for women navigating unplanned pregnancies — whatever direction they choose.
(star)**Adoptive Family Preparation**Home studies, training, and ongoing support for adoptive parents through every stage of the process.
(shield)**Professional Counseling**Licensed counseling services for individuals, couples, and families navigating life's most challenging moments.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  true
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Colorado Christian Services HQ', $escape$3959 East Arapahoe Road, Suite 200, Centennial, CO 80122$escape$, 39.5952717, -104.9482275, $escape$Administrative offices and primary counseling location in Centennial for adoption placement services, birth parent counseling, and professional family counseling. Prospective adoptive families and birth parents meet with staff and receive ongoing support at this location.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089360/charity-locations/location-579.jpg$escape$, 0, false
FROM charities WHERE slug = 'colorado-christian-services';

-- Colorado Public Radio
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'Colorado Public Radio',
  'colorado-public-radio',
  '74-2324052',
  1991,
  'https://www.cpr.org/',
  '7409 South Alton Court, Centennial, CO 80112',
  ARRAY['news-media','arts'],
  'https://donate.cpr.org/give',
  'https://www.cpr.org/careers/volunteer/',
  'colorado-public-radio',
  $escape$Delivers independent news journalism, classical music, and alternative programming to Coloradans through a statewide network of radio stations and digital platforms. CPR News provides in-depth reporting on Colorado politics, the environment, and communities; CPR Classical and Indie 102.3 serve music listeners across the state.

Colorado Public Radio traces its roots to KCFR, which launched on the University of Denver campus in 1970 — Colorado's first public radio station, built by a small team committed to independent journalism at a time when public broadcasting was still finding its footing nationally.$escape$,
  $escape$- 760,000+ monthly radio listeners statewide
- 1 million+ digital consumers each month
- 90% of Colorado's population reached through the statewide broadcast network$escape$,
  $escape$Headquartered in Centennial with studios and newsrooms across Colorado, broadcasting to 90% of the state's population.$escape$,
  $escape$(star)**CPR News**Independent in-depth reporting on Colorado politics, environment, education, and communities — available on air and through digital platforms.
(people)**CPR Classical**Commercial-free classical music serving listeners statewide, from the symphony hall to the morning commute.
(sun)**Indie 102.3**Colorado's alternative and indie music station, showcasing emerging and established artists for Denver and beyond.
(heart)**Digital & Podcast Journalism**Expanded news coverage through podcasts, newsletters, and digital storytelling that reaches Coloradans wherever they are.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  true
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Colorado Public Radio HQ', $escape$7409 South Alton Court, Centennial, CO 80112$escape$, 39.5823506, -104.8825214, $escape$CPR's main broadcasting and administrative headquarters in Centennial, where CPR News, CPR Classical, and Indie 102.3 are produced. Newsroom staff, program production, and digital journalism operations for the statewide network are based here.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093180/charity-locations/location-592.jpg$escape$, 0, false
FROM charities WHERE slug = 'colorado-public-radio';

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'CPR News Denver Newsroom', $escape$303 East 17th Ave, Denver, CO 80203$escape$, 39.7437148, -104.9829645, $escape$CPR's downtown Denver newsroom, home to CPR News and Denverite journalists covering Denver and Colorado politics, environment, and communities. Reporters and editors based here produce daily news coverage for broadcast and digital platforms.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093197/charity-locations/location-593.jpg$escape$, 0, false
FROM charities WHERE slug = 'colorado-public-radio';

-- Denver Audubon
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'Denver Audubon',
  'denver-audubon',
  '23-7063701',
  1969,
  'https://www.denveraudubon.org/',
  '11280 Waterton Rd, Littleton, CO 80125',
  ARRAY['environment','animals','education'],
  'https://www.denveraudubon.org/become-a-friend',
  'https://www.denveraudubon.org/volunteer',
  'denver-audubon',
  $escape$Inspires people to protect birds, wildlife, and natural habitats through conservation education, research, and community programming across the Denver metro area. Programs range from guided bird walks and school field trips to the Colorado Bluebird Project, Community Birding initiative, and Audubon Master Birder certification.

Denver Audubon was established in 1969 and later built its own nature center and education campus at Chatfield — giving the region's birding and conservation community a permanent home and one of Colorado's most visited environmental education sites.$escape$,
  $escape$- 3,000+ students engaged through hands-on environmental education programs annually
- 105,000+ visitors and volunteers welcomed each year$escape$,
  $escape$Nature center campus located in Littleton near Chatfield State Park, with programs and conservation work reaching six counties across the greater Denver metro region.$escape$,
  $escape$(tree)**Conservation Programs**The Colorado Bluebird Project, bird monitoring, and active habitat protection efforts support wildlife populations across the region.
(education)**School & Youth Education**Field trips, homeschool programs, and summer camps at the Chatfield Nature Center bring thousands of students into hands-on nature experiences each year.
(people)**Community Birding**Public birdwatching walks, community naturalist programs, and accessible events that open the world of birds to all experience levels.
(star)**Master Birder Training**An advanced certification program for dedicated birders, building a community of skilled naturalists who contribute to conservation science.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  true
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Denver Audubon Nature Center', $escape$11280 Waterton Rd, Littleton, CO 80125$escape$, 39.4936787, -105.0919271, $escape$The Chatfield nature center campus near Chatfield State Park is Denver Audubon's primary hub for environmental education, conservation programming, and community events. Field trips, summer camps, public birdwatching walks, and Master Birder certification all take place at this Littleton campus.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093463/charity-locations/location-576.jpg$escape$, 0, false
FROM charities WHERE slug = 'denver-audubon';

-- Denver Food Rescue
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'Denver Food Rescue',
  'denver-food-rescue',
  '46-2096160',
  2012,
  'https://denverfoodrescue.org/',
  '3840 York St Ste 245, Denver, CO 80205',
  ARRAY['hunger','environment'],
  'https://denverfoodrescue.org/donate/',
  'https://denverfoodrescue.org/volunteer/',
  'denver-food-rescue',
  $escape$Rescues surplus fresh produce and perishable food from retailers and delivers it directly into neighborhoods using a carbon-neutral e-bike fleet, redistributing through community-led No Cost Grocery Programs that are free and barrier-free — no ID, income verification, or proof of need required. Denver Food Rescue treats food as a community asset, eliminating both food waste and food insecurity in one movement.

Founded in 2012, Denver Food Rescue pioneered the use of cargo e-bikes for food rescue — a model built around the idea that surplus food belongs in communities, not dumpsters, and one that has since inspired similar organizations across the country.$escape$,
  $escape$- 700,000+ pounds of surplus fresh food rescued annually
- 200,000+ neighbors served with free fresh food each year
- 21+ No Cost Grocery Program distribution sites across the Denver metro area
- 100% carbon-neutral delivery — every food rescue run powered by e-bike, zero emissions$escape$,
  $escape$Operates throughout the Denver metro area, with distribution sites concentrated in neighborhoods where fresh food access is most limited.$escape$,
  $escape$(tree)**Food Rescue**E-bike crews collect surplus fresh produce and perishables from retailers daily — preventing waste before it reaches a landfill.
(people)**No Cost Grocery Programs**Community-led distribution sites in neighborhoods with the greatest food access barriers, open to anyone with no questions asked.
(heart)**Nutrition Equity**Prioritizes fresh, perishable food — not just shelf-stable — getting nutrient-dense food to neighbors who need it most.
(sun)**Zero-Waste Model**Addresses food insecurity and food waste simultaneously, demonstrating that surplus food is a community resource, not a liability.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  true
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Denver Food Rescue HQ', $escape$3840 York St Ste 245, Denver, CO 80205$escape$, 39.7700882, -104.9596329, $escape$Headquarters and dispatch hub for the e-bike food rescue operation in the Cole neighborhood. Surplus food collected from retailers is organized and routed to No Cost Grocery Program distribution sites across the metro area from this location.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093507/charity-locations/location-571.jpg$escape$, 0, false
FROM charities WHERE slug = 'denver-food-rescue';

-- Family Promise of Greater Denver
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'Family Promise of Greater Denver',
  'family-promise-of-greater-denver',
  '84-1367869',
  1997,
  'https://www.fpgd.org/',
  '419 Lipan St, Denver, CO 80204',
  ARRAY['housing','families','youth'],
  'https://www.fpgd.org/donate',
  'https://www.fpgd.org/volunteer',
  'family-promise-of-greater-denver',
  $escape$Provides a comprehensive continuum of care — prevention, diversion, shelter, and stabilization — to help families with children move from homelessness into stable housing. Intensive case management is delivered at one-third the cost of traditional shelter, supporting families through the full journey from crisis to self-sufficiency.$escape$,
  $escape$- 24 families prevented from eviction
- 184 served in shelter program
- 90% of sheltered families move into secure housing
- 4–5 families per month supported with prevention rental assistance
- 1/3 the cost of traditional shelter — the efficiency that makes Family Promise's intensive case management model possible$escape$,
  $escape$Based in Denver's Lincoln Park neighborhood, serving families experiencing homelessness and housing instability across the greater Denver area.$escape$,
  $escape$(home)**Emergency Shelter**Family shelter with comprehensive case management, designed to move families from crisis to stable housing as quickly as possible.
(shield)**Homelessness Prevention**Rental assistance and intervention for families at imminent risk of losing their housing — helping them stay housed before a crisis begins.
(people)**Stabilization Support**Ongoing coaching, resource connections, and follow-up support after families secure housing to prevent a return to homelessness.
(star)**Diversion Services**Creative alternatives to shelter that help families find immediate housing solutions outside the traditional shelter system.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  false
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Family Promise of Greater Denver HQ', $escape$419 Lipan St, Denver, CO 80204$escape$, 39.7229234, -105.0016430, $escape$Administrative and program headquarters in Lincoln Park where family intake, case management, and stabilization services are coordinated. Shelter programming and prevention services for families experiencing homelessness are delivered from this location.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776094450/charity-locations/location-568.jpg$escape$, 0, false
FROM charities WHERE slug = 'family-promise-of-greater-denver';

-- Friends of Foothills Animal Shelter
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'Friends of Foothills Animal Shelter',
  'friends-of-foothills-animal-shelter',
  '46-2809962',
  2014,
  'https://foothillsanimalshelter.org/',
  '580 McIntyre St, Golden, CO 80401',
  ARRAY['animals'],
  'https://foothillsanimalshelter.org/donate-online/',
  'https://foothillsanimalshelter.org/volunteer/',
  'friends-of-foothills-animal-shelter',
  $escape$Raises funds to directly support Foothills Animal Shelter — Jefferson County's only open-admission, full-service animal shelter — enabling programs, equipment, and care that fall outside the county's operating budget. Friends of Foothills Animal Shelter amplifies the shelter's life-saving work and helps ensure that every healthy and safe animal finds a home.

Friends of Foothills Animal Shelter was established in 2014 when a group of Golden-area community members decided they wanted to do more than volunteer — creating a formal channel to fund the programs and equipment a county budget alone couldn't cover.$escape$,
  $escape$- 9,500 orphaned animals cared for by Foothills Animal Shelter each year
- 48 staff and 460 volunteers supporting daily shelter operations
- 6 core services: adoption, spay/neuter, microchipping, vaccinations, pet licensing, and emergency disaster boarding$escape$,
  $escape$Located at 580 McIntyre St in Golden, serving Jefferson County residents and animals throughout the county.$escape$,
  $escape$(heart)**Direct Shelter Funding**Grants and donations that enhance shelter programs, equipment, and animal care beyond what the county budget covers.
(people)**Community Engagement**Events, campaigns, and outreach that build community investment in animal welfare and support for the shelter's mission.
(star)**Special Needs Animal Support**Funding for animals requiring extended medical care or longer shelter stays — ensuring every animal gets a fair chance.
(home)**Adoption Support Programs**Initiatives that help more animals find loving homes, from adoption events to post-adoption resources for new pet owners.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  false
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Foothills Animal Shelter', $escape$580 McIntyre St, Golden, CO 80401$escape$, 39.7774985, -105.1748083, $escape$Jefferson County's open-admission, full-service animal shelter in Golden, where Friends of Foothills Animal Shelter directs fundraising and community support. Adoption, spay/neuter, microchipping, vaccinations, pet licensing, and emergency disaster boarding services are all provided at this location.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089365/charity-locations/location-586.jpg$escape$, 0, false
FROM charities WHERE slug = 'friends-of-foothills-animal-shelter';

-- Golden Retriever Rescue of the Rockies
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'Golden Retriever Rescue of the Rockies',
  'golden-retriever-rescue-of-the-rockies',
  '84-1430940',
  1996,
  'https://www.goldenrescue.com/',
  '15350 W 72nd Ave, Arvada, CO 80007',
  ARRAY['animals'],
  'https://www.goldenrescue.com/donate-golden-retriever-rescue/',
  'https://www.goldenrescue.com/volunteer-golden-retriever-rescue/',
  'golden-retriever-rescue-of-the-rockies',
  $escape$Rescues, rehabilitates, and rehomes Golden Retrievers and Golden mixes in need of new homes — providing medical care, foster placements, and specialized support through the Golden Angel Fund for dogs needing extra care. Run almost entirely by volunteers, Golden Retriever Rescue of the Rockies matches dogs with loving families and supports adopters through the full process.

Golden Retriever Rescue of the Rockies was founded in 1996 by a small group of Golden lovers who didn't want healthy, affectionate dogs to run out of time in overcrowded shelters — and built one of the region's largest breed-specific rescues from that conviction.$escape$,
  $escape$- 250–300 Golden Retrievers placed in forever homes annually
- 6,000+ Goldens rescued and rehomed since founding$escape$,
  $escape$Based in Arvada, serving the greater Rocky Mountain region through a network of volunteer foster families across Colorado and neighboring states.$escape$,
  $escape$(heart)**Dog Rescue & Rehabilitation**Pulls Golden Retrievers and mixes from shelters and owner surrenders, providing medical care and rehabilitation before adoption.
(home)**Foster Network**A statewide network of volunteer foster families provides dogs with loving temporary homes and crucial socialization before their forever placement.
(star)**Golden Angel Fund**Dedicated support for dogs with significant medical needs — ensuring cost never prevents a dog from receiving the care it needs.
(people)**Adoption Matching**Careful screening and matching process ensures the right dog finds the right home, with ongoing support for adopters.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  false
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Golden Retriever Rescue of the Rockies HQ', $escape$15350 W 72nd Ave, Arvada, CO 80007$escape$, 39.8269768, -105.1718691, $escape$Administrative offices and volunteer coordination hub for the foster-based rescue network. Dogs are not housed at this location — they live with volunteer foster families throughout Colorado and neighboring states while awaiting adoption.$escape$, NULL, 0, false
FROM charities WHERE slug = 'golden-retriever-rescue-of-the-rockies';

-- Groundwork Denver
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'Groundwork Denver',
  'groundwork-denver',
  '71-0909556',
  2003,
  'https://groundworkcolorado.org/',
  '3280 N. Downing St, Unit E, Denver, CO 80205',
  ARRAY['environment','education','youth'],
  'https://groundworkcolorado.org/donate/',
  'https://groundworkcolorado.org/get-involved/get-involved-volunteer/',
  'groundwork-denver',
  $escape$Partners with residents and youth in under-resourced Denver neighborhoods to improve the environment and advance health equity through community-led action. Programs include tree planting, park improvement, river and air quality work, home energy upgrades, and paid green job training for young people from the neighborhoods served.

Established in 2003 as part of the national Groundwork USA network, Groundwork Denver follows a model originally developed in post-industrial Britain to transform neglected land and mobilize underserved communities in environmental action, focusing on the city's most environmental-justice-burdened neighborhoods.$escape$,
  $escape$- 106 youth and young adults employed
- 81 rain barrels installed
- 322 trees planted
- 2,432 households, community members, and program participants reached$escape$,
  $escape$Serves youth and residents across northeast Denver and surrounding neighborhoods — including Cole, Elyria-Swansea, Globeville, Montbello, Commerce City, Sheridan, and Aurora — communities facing the greatest environmental justice challenges.$escape$,
  $escape$(sun)**Youth Green Teams**Paid summer jobs for local teens doing real environmental work — tree planting, park stewardship, and neighborhood improvement projects.
(star)**Green Infrastructure Training**Workforce development program preparing young adults for careers in green construction, stormwater management, and environmental services.
(home)**Energy Efficiency Programs**Home insulation, energy assessments, and efficiency upgrades for low-income residents, reducing utility costs and carbon footprints.
(tree)**Community Land Projects**Park creation, tree canopy expansion, river cleanup, and open space improvements co-designed with neighborhood residents.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  true
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Groundwork Denver HQ', $escape$3280 N. Downing St, Unit E, Denver, CO 80205$escape$, 39.7627712, -104.9730725, $escape$Headquarters and base of operations for youth employment programs and neighborhood environmental projects across northeast Denver. Green Team crews, Green Corps participants, and energy efficiency program staff operate out of this Cole neighborhood office.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093866/charity-locations/location-570.jpg$escape$, 0, false
FROM charities WHERE slug = 'groundwork-denver';

-- Heartbeat Denver Working Men's Program
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'Heartbeat Denver Working Men''s Program',
  'heartbeat-denver',
  '83-2403755',
  1986,
  'https://hbdenver.org/',
  '1680 N. Sherman St, Denver, CO 80203',
  ARRAY['housing','families'],
  'https://hbdenver.org/support-us/donate/',
  'https://hbdenver.org/support-us/volunteer/',
  'heartbeat-denver',
  $escape$Provides temporary housing in a safe, sober environment to help men transition out of homelessness toward self-sufficient, independent living. Residents receive two hot meals daily, financial and life skills training, job search support, and connections to more than 30 partner organizations offering wraparound services.

Heartbeat Denver was formed in 1986 to aid the city during an unusually cold winter, and has operated continuously out of Central Presbyterian Church.$escape$,
  $escape$- 18% of clients who arrive directly from the Justice System.
- 28% of the 501 men who came through our doors in 2025 found appropriate housing.
- 92% of men who arrived without a job are were employed within 2 weeks.$escape$,
  $escape$Operates from Central Presbyterian Church in Denver's Capitol Hill neighborhood, serving men from across the Denver metro area.$escape$,
  $escape$(home)**Transitional Housing** Safe, sober, low-cost housing for working men or those actively seeking employment — operating continuously at Central Presbyterian Church since 1986.
(star)**Life Skills Training** Financial literacy, budgeting, and independent living classes that prepare residents to sustain housing on their own.
(people)**Wraparound Services Network** Connections to 30+ partner organizations providing healthcare, mental health, legal aid, and additional social services.
(heart)**Night Workers Room** Dedicated housing for men working late-shift or early-morning jobs — recognizing that recovery from homelessness doesn't pause for odd hours.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  false
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Heartbeat Denver HQ', $escape$1680 N. Sherman St, Denver, CO 80203$escape$, 39.7312162, -104.9848719, $escape$Heartbeat Denver operates out of Central Presbyterian Church in Capitol Hill, providing transitional housing, meals, and wraparound services to residents on-site. The night workers room and all life skills programming are delivered at this location.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089341/charity-locations/location-567.jpg$escape$, 0, false
FROM charities WHERE slug = 'heartbeat-denver';

-- Hope House Colorado
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'Hope House Colorado',
  'hope-house-colorado',
  '84-1567838',
  2003,
  'https://www.hopehousecolorado.org/',
  '6475 Benton St, Arvada, CO 80003',
  ARRAY['families','youth','education'],
  'https://hopehousecolorado.org/donate-now/',
  'https://hopehousecolorado.org/volunteer-2/',
  'hope-house-colorado',
  $escape$Empowers parenting teen moms toward personal and economic self-sufficiency through a holistic continuum of support — from residential housing for homeless teen moms to GED programs, mental health counseling, legal advocacy, and college and career pathways. Hope House walks alongside both mothers and their children, helping entire families build stable futures.

Hope House Colorado was founded in 2003 by a woman who had been a teen mom herself — opening the first residential home in Arvada out of a conviction that parenting teen moms, given the right support, are among the most capable people to break cycles of poverty.$escape$,
  $escape$- 270+ teen moms and 400+ children served each year
- 100+ formerly homeless or at-risk teen moms housed through the residential program
- 6 program areas: GED, parenting classes, mental health counseling, legal advocacy, early learning, and career development$escape$,
  $escape$Based in Arvada, serving teen moms from across the Denver metro area through residential and community-based programming.$escape$,
  $escape$(home)**Residential Program**Safe housing for homeless or at-risk parenting teen moms — providing stability while they build skills and pursue education.
(education)**Education & Career Pathways**GED support, college navigation, and career development programming that opens doors for moms who might otherwise stay closed.
(heart)**Early Learning Center**Child development support for the babies and young children of residents, so both generations thrive together.
(people)**Legal & Housing Navigation**Advocacy and coaching that helps teen moms secure benefits, navigate legal challenges, and move toward lasting independence.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  true
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Hope House Colorado HQ', $escape$6475 Benton St, Arvada, CO 80003$escape$, 39.8138335, -105.0559464, $escape$The main residential and program campus in Arvada where parenting teen moms live and receive the full continuum of Hope House support. GED classes, early learning, mental health counseling, legal advocacy, and career development programs are all delivered on-site.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089364/charity-locations/location-585.jpg$escape$, 0, false
FROM charities WHERE slug = 'hope-house-colorado';

-- Rocky Mountain Public Media
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'Rocky Mountain Public Media',
  'rocky-mountain-public-media',
  '84-0510785',
  1956,
  'https://www.rmpbs.org/',
  '2101 Arapahoe St, Denver, CO 80205',
  ARRAY['news-media','arts'],
  'https://donate.rmpbs.org/rmpbs/donate',
  'https://www.rmpbs.org/support/volunteer',
  'rocky-mountain-public-media',
  $escape$Connects Coloradans to their communities and the world through public television, jazz radio, and urban music programming. Rocky Mountain Public Media produces and broadcasts independent journalism, cultural programming, and educational content with the mission that everyone in Colorado feels seen and heard.

Rocky Mountain Public Media's roots trace to 1956, when Colorado's first public television station launched in Denver — predating the national PBS network by fifteen years, and setting a tradition of public service media that has since grown.$escape$,
  $escape$- 1 million+ Coloradans reached annually across TV, radio, and digital platforms
- 3 distinct services: Rocky Mountain PBS (TV), KUVO JAZZ (89.3 FM), and THE DROP 104.7
- 5 states reached: Colorado, Wyoming, Montana, Nebraska, and New Mexico$escape$,
  $escape$Headquartered at the Buell Public Media Center in Denver's Five Points neighborhood, broadcasting statewide and across the Mountain West.$escape$,
  $escape$(star)**Rocky Mountain PBS**Public television delivering news, local documentaries, cultural programming, and national PBS content to Colorado audiences.
(people)**KUVO JAZZ (89.3 FM)**Denver's public jazz station, broadcasting traditional jazz, contemporary jazz, blues, and Latin music with deep roots in Five Points.
(sun)**THE DROP 104.7**Urban alternative, R&B, and hip-hop programming serving Denver's diverse music community.
(heart)**Local Journalism & Documentary**Original Colorado-focused reporting and documentary storytelling that gives voice to communities across the state.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  false
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'Rocky Mountain Public Media HQ', $escape$2101 Arapahoe St, Denver, CO 80205$escape$, 39.7530985, -104.9894350, $escape$The Buell Public Media Center in Denver's Five Points neighborhood serves as headquarters for Rocky Mountain PBS, KUVO JAZZ, and THE DROP. Television production, radio broadcasting, and digital journalism operations are all based at this location.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776094086/charity-locations/location-584.jpg$escape$, 0, false
FROM charities WHERE slug = 'rocky-mountain-public-media';

-- SAME Cafe
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'SAME Cafe',
  'same-cafe',
  '20-4765519',
  2006,
  'https://www.soallmayeat.org/',
  '2023 East Colfax Avenue, Denver, CO 80206',
  ARRAY['hunger','health'],
  'https://www.soallmayeat.org/denver/donate',
  'https://www.soallmayeat.org/denver/volunteer',
  'same-cafe',
  $escape$Operates a participation-based café on East Colfax where every guest contributes — through volunteering time, donating money, or giving produce — in exchange for a healthy, chef-prepared meal made with organic, locally sourced ingredients. SAME Cafe is built around values of belonging, wholeness, and participation, and extends its mission through the Cook to Work job training program and community outreach.

SAME Cafe opened on East Colfax in 2006 with the belief that sharing a meal is an act of community — and that no one should have to choose between a dignified meal and keeping the lights on.$escape$,
  $escape$- 25,000–28,000 meals served annually
- 1,000+ volunteers contributing thousands of hours each year
- 80 meals served inside the café daily, plus outreach deliveries around the city$escape$,
  $escape$Single location at 2023 East Colfax Avenue in Denver's Congress Park neighborhood, open Monday through Saturday.$escape$,
  $escape$(heart)**Pay-What-You-Can Café**A participation model where every guest contributes in their own way — time, money, or produce — in exchange for a nourishing meal, served with dignity.
(star)**Cook to Work**A job training program that builds culinary skills and work experience for community members seeking pathways into the food service industry.
(people)**Community Outreach**Meal deliveries and partnerships extending the café's reach beyond Colfax to serve neighbors throughout the city.
(sun)**Volunteer Leadership**Community members steward the café model through volunteering, creating a cycle of mutual support and belonging.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  true
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'SAME Cafe', $escape$2023 East Colfax Avenue, Denver, CO 80206$escape$, 39.7400750, -104.9631022, $escape$The sole café location on East Colfax in the Congress Park neighborhood, open Monday through Saturday. The participation-based dining model, Cook to Work job training, and community outreach operations all run from this storefront.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776094013/charity-locations/location-569.jpg$escape$, 0, false
FROM charities WHERE slug = 'same-cafe';

-- The Action Center
INSERT INTO charities (name, slug, ein, founded_year, website_url, primary_address, cause_tags, donate_url, volunteer_url, every_org_slug, description, impact, location_description, program_highlights, usage_credit, cover_photo_url, content_photo_url_1, content_photo_url_2, featured, is_reviewed)
VALUES (
  'The Action Center',
  'the-action-center',
  '23-7019679',
  1968,
  'https://www.theactioncenter.org/',
  '8755 W 14th Ave, Lakewood, CO 80215',
  ARRAY['hunger','families','housing'],
  'https://www.theactioncenter.org/donate/',
  'https://www.theactioncenter.org/volunteer/',
  'the-action-center',
  $escape$Provides immediate, judgment-free food, clothing, and financial assistance to families in Lakewood, West Denver, Wheat Ridge, Golden, and surrounding Jefferson County communities. One-on-one family coaching, utility assistance, and school supply programs go beyond emergency relief to help families build lasting stability.

The Action Center was founded in 1968 as Jeffco Action Center during the height of Lyndon Johnson's War on Poverty — part of a nationwide wave of community action agencies created to address systemic poverty at the neighborhood level — and has been serving Jefferson County families through every economic cycle since.$escape$,
  $escape$- 2 million pounds of food distributed to local families annually
- 375,000+ items of clothing provided annually to restore warmth and dignity
- $1 million in rent and utility assistance to keep families safely housed
- $348,000 in school materials so students can learn with confidence
- 200+ families served per day with food alone; 90¢ of every dollar goes directly to programs$escape$,
  $escape$Located in Lakewood, serving families throughout the west Denver metro area including Lakewood, West Denver, Wheat Ridge, Golden, and surrounding Jefferson County communities.$escape$,
  $escape$(people)**Food Market**A walk-in food pantry serving hundreds of families daily with fresh and shelf-stable food, operating with dignity and no judgment.
(heart)**Clothing Market**Free clothing available to community members in need — restoring warmth, dignity, and self-confidence.
(home)**Financial Assistance**Rent, utility, and Xcel Energy support that keeps families from losing their housing when unexpected crises hit.
(star)**Family Coaching**One-on-one coaching and support groups that help families strengthen their financial footing and navigate community resources for long-term stability.$escape$,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  true
);

INSERT INTO charity_locations (charity_id, label, address, latitude, longitude, description, photo_url, display_order, is_reviewed)
SELECT id, 'The Action Center HQ', $escape$8755 W 14th Ave, Lakewood, CO 80215$escape$, 39.7385134, -105.0949360, $escape$The main facility in Lakewood where the food market, clothing market, and client services all operate under one roof. Family coaching, utility assistance, and school supply programs are delivered from this location, which serves as the primary point of contact for families across the west Denver metro area.$escape$, $escape$https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093969/charity-locations/location-587.jpg$escape$, 0, false
FROM charities WHERE slug = 'the-action-center';

COMMIT;
