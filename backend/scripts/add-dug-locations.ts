/**
 * Add Denver Urban Gardens community garden locations.
 * Coordinates sourced from DUG's ArcGIS feature service — no geocoding needed.
 * Only includes public gardens (Open = Potential Plot Availability, Full = Full for the Season).
 *
 * Usage:
 *   npx tsx scripts/add-dug-locations.ts
 *
 * Against dev/prod:
 *   DATABASE_URL=<render-url> npx tsx scripts/add-dug-locations.ts
 *
 * Dry-run (no DB writes):
 *   DRY_RUN=1 npx tsx scripts/add-dug-locations.ts
 */

import { Pool } from 'pg';

const DRY_RUN = process.env.DRY_RUN === '1';

const DB_CONFIG = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME ?? 'app_db',
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD,
    };

const DUG_SLUG = 'denver-urban-gardens';

// Gardens confirmed to no longer exist — do not re-add even if present in ArcGIS.
// Add new entries here whenever a garden is removed. Format: exact label from GARDENS array.
// See docs/Operations/Charity-Data-Refresh.md for details on each removal.
const EXCLUDED_GARDENS = new Set([
  'El Oasis Community Garden',   // 1847 West 35th Avenue — now duplexes as of March 2026
  'Del Mar Academy Community Garden', // 12445 E 2nd Ave, Aurora — removed March 2026
]);

interface Garden {
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  availability: 'Open' | 'Full';
}

// Public gardens sourced from DUG ArcGIS Feature Service (March 2026)
// Open = Potential Plot Availability, Full = Full for the Season
// Excludes Private and Under Construction gardens
const GARDENS: Garden[] = [
  // Open (Potential Plot Availability)
  { label: 'Anythink Commerce City Library Community Garden', address: '7185 Monaco St., Commerce City, CO 80022', latitude: 39.826747, longitude: -104.913505, availability: 'Open' },
  { label: 'Living Light of Peace Community Garden', address: '5927 Miller St., Arvada, CO 80004', latitude: 39.804523, longitude: -105.114615, availability: 'Open' },
  { label: 'Barrett Elementary School Community Garden', address: '2900 Richard Allen Ct., Denver, CO 80205', latitude: 39.759374, longitude: -104.942814, availability: 'Open' },
  { label: 'Blue Spruce Community Garden', address: '7300 E Severn Pl, Denver, CO 80230', latitude: 39.727627, longitude: -104.903092, availability: 'Open' },
  { label: 'Cheltenham School Community Garden', address: '1580 Julian St., Denver, CO 80204', latitude: 39.742602, longitude: -105.030248, availability: 'Open' },
  { label: 'City Lights Community Garden at Benedict Park Place', address: '2260 Tremont Pl., Denver, CO 80205', latitude: 39.749115, longitude: -104.981499, availability: 'Open' },
  { label: 'Clayton School Community Garden', address: '475 W. Union Ave., Englewood, CO 80110', latitude: 39.632808, longitude: -104.992888, availability: 'Open' },
  { label: 'Denver Green School Community Garden', address: '6700 E. Virginia Ave., Denver, CO 80224', latitude: 39.706068, longitude: -104.909439, availability: 'Open' },
  { label: 'DU Bridge Community Garden', address: '2320 S Race Street, Denver, CO 80210', latitude: 39.674397, longitude: -104.963809, availability: 'Open' },
  { label: 'Wild Sage Community Garden', address: '8350 East Yale Avenue, Denver, CO 80231', latitude: 39.667989, longitude: -104.886094, availability: 'Open' },
  { label: 'Eddie Maestas Community Garden', address: '2300 Lawrence Street, Denver, CO 80205', latitude: 39.755024, longitude: -104.987661, availability: 'Open' },
  { label: 'Eiber School Community Garden', address: '1385 Independence Street, Lakewood, CO 80215', latitude: 39.737013, longitude: -105.106249, availability: 'Open' },
  { label: 'Ellis South School Community Garden', address: '1651 S. Dahlia St., Denver, CO 80222', latitude: 39.685991, longitude: -104.933333, availability: 'Open' },
  { label: 'Fairview Community Garden', address: '2715 W. 11th Ave., Denver, CO 80204', latitude: 39.73473, longitude: -105.021557, availability: 'Open' },
  { label: 'Foothills School Community Garden', address: '13165 W Ohio Ave, Lakewood, CO 80228', latitude: 39.703704, longitude: -105.146804, availability: 'Open' },
  { label: 'Fulton Academy Taste of Home Community Garden', address: '755 Fulton Street, Aurora, CO 80010', latitude: 39.727503, longitude: -104.871932, availability: 'Open' },
  { label: 'Gabriel Cam Memorial Community Garden', address: '560 Vaughn St, Aurora, CO 80011', latitude: 39.723832, longitude: -104.830946, availability: 'Open' },
  { label: 'Goldrick Elementary Community Garden', address: '1050 S Zuni Street, Denver, CO 80223', latitude: 39.697577, longitude: -105.015513, availability: 'Open' },
  { label: 'Gray Street Community Garden', address: '345 Gray Street, Lakewood, CO 80226', latitude: 39.721888, longitude: -105.062036, availability: 'Open' },
  { label: 'Gables School Community Garden', address: '8701 W Woodard Dr, Lakewood, CO 80227', latitude: 39.679263, longitude: -105.093765, availability: 'Open' },
  { label: 'Jardin de Esperanza Maxwell School Community Garden', address: '14390 Bolling Dr., Denver, CO 80239', latitude: 39.783099, longitude: -104.823194, availability: 'Open' },
  { label: 'Johnson School Community Garden', address: '1850 S. Irving St., Denver, CO 80204', latitude: 39.682648, longitude: -105.029557, availability: 'Open' },
  { label: 'KCAA Community Garden', address: '2250 S Quitman Way, Denver, CO 80219', latitude: 39.675684, longitude: -105.038794, availability: 'Open' },
  { label: 'Louisville Community Garden', address: 'Lincoln Ave and Griffith St, Louisville, CO 80027', latitude: 39.984253, longitude: -105.136596, availability: 'Open' },
  { label: 'McMeen School Community Garden', address: '1000 South Holly Street, Denver, CO 80246', latitude: 39.698329, longitude: -104.919471, availability: 'Open' },
  { label: 'Montbello "Five Loaves" Community Garden', address: '4879 Crown Blvd., Denver, CO 80239', latitude: 39.783684, longitude: -104.832506, availability: 'Open' },
  { label: 'Montview Park Community Garden', address: '9282 E Montview Blvd, Aurora, CO 80010', latitude: 39.746671, longitude: -104.880365, availability: 'Open' },
  { label: 'Moose Meadows Community Garden', address: '3755 S Magnolia Way, Denver, CO 80237', latitude: 39.647706, longitude: -104.911626, availability: 'Open' },
  { label: 'Mount St. Vincent Community Garden', address: '4159 Lowell Blvd., Denver, CO 80211', latitude: 39.775376, longitude: -105.034958, availability: 'Open' },
  { label: 'Park Hill School Community Garden', address: '5050 E. 19th Ave., Denver, CO 80220', latitude: 39.744544, longitude: -104.928879, availability: 'Open' },
  { label: 'RAMERC Community Garden', address: '2811 Harrison St., Denver, CO 80205', latitude: 39.756815, longitude: -104.942209, availability: 'Open' },
  { label: 'Rose Roots Community Garden', address: '8412 Alkire St., Arvada, CO 80005', latitude: 39.849079, longitude: -105.146574, availability: 'Open' },
  { label: 'Ruby Hill Park Community Garden', address: '1690 S Pecos St, Denver, CO 80223', latitude: 39.685358, longitude: -105.006015, availability: 'Open' },
  { label: 'Sabin School Community Garden', address: '3050 S Vrain St, Denver, CO 80236', latitude: 39.659741, longitude: -105.046265, availability: 'Open' },
  { label: 'Samuels Elementary Community Garden', address: '3985 S Vincennes Ct, Denver, CO 80237', latitude: 39.643504, longitude: -104.892509, availability: 'Open' },
  { label: 'Sanctuary Community Garden', address: '9840 E 17th Ave., Aurora, CO 80010', latitude: 39.743218, longitude: -104.873232, availability: 'Open' },
  { label: 'Shelton School Community Garden', address: '420 Crawford St, Golden, CO 80401', latitude: 39.722471, longitude: -105.214049, availability: 'Open' },
  { label: 'Swansea School Community Garden', address: '4650 Columbine St., Denver, CO 80216', latitude: 39.780938, longitude: -104.955788, availability: 'Open' },
  { label: 'Jan Marie Belle All Nations Community Garden', address: '999 S. Lowell Blvd., Denver, CO 80219', latitude: 39.698736, longitude: -105.034683, availability: 'Open' },
  { label: 'West Colfax Community Urban Garden', address: 'Vrain Street and West Wells Place, Denver, CO 80204', latitude: 39.735202, longitude: -105.045879, availability: 'Open' },
  { label: 'Aurora Quest Community Garden', address: '17315 E 2nd Ave, Aurora, CO 80011', latitude: 39.719589, longitude: -104.787758, availability: 'Open' },
  { label: 'Westminster Community Garden', address: '72nd Avenue & Raleigh St., Westminster, CO 80030', latitude: 39.828864, longitude: -105.042346, availability: 'Open' },
  { label: 'El Oasis de Lorraine at Focus Points Family Resource Center Community Garden', address: '2501 E. 48th Ave., Denver, CO 80216', latitude: 39.784329, longitude: -104.956432, availability: 'Open' },
  { label: 'Heather Regan Memorial Community Garden at Bradley International School', address: '3051 South Elm Street, Denver, CO 80222', latitude: 39.663349, longitude: -104.930949, availability: 'Open' },
  { label: 'Rose Stein Community Garden', address: '80 S Teller Street, Lakewood, CO 80226', latitude: 39.716056, longitude: -105.075146, availability: 'Open' },
  { label: 'Sunshine Community Garden', address: '5150 Allison St, Arvada, CO 80002', latitude: 39.790157, longitude: -105.084585, availability: 'Open' },
  { label: 'Gilpin Community Garden', address: '2949 California St, Denver, CO 80205', latitude: 39.757117, longitude: -104.977333, availability: 'Open' },
  { label: 'Spencer Garrett Park Community Garden', address: '17th Avenue & Joliet Street, Aurora, CO 80010', latitude: 39.743481, longitude: -104.860749, availability: 'Open' },
  { label: 'Asian Pacific Development Center Community Garden', address: '1537 Alton Street, Aurora, CO 80010', latitude: 39.741126, longitude: -104.883159, availability: 'Open' },
  { label: 'Slater Elementary Community Garden', address: '8605 W. 23rd Avenue, Lakewood, CO 80215', latitude: 39.752258, longitude: -105.092821, availability: 'Open' },
  { label: 'Stober Community Garden', address: '2300 Urban St, Lakewood, CO 80215', latitude: 39.752087, longitude: -105.133224, availability: 'Open' },
  { label: 'North Arvada Middle School Community Garden', address: '7285 Pierce St, Arvada, CO 80003', latitude: 39.829384, longitude: -105.073143, availability: 'Open' },
  { label: 'Nome Park Community Garden', address: '1200 Nome Street, Aurora, CO 80010', latitude: 39.734175, longitude: -104.851502, availability: 'Open' },
  { label: '17th Street Community Garden', address: '17th & Wewatta, Denver, CO 80202', latitude: 39.754354, longitude: -105.001652, availability: 'Open' },
  { label: 'Crumley Park Community Garden', address: '174 S Knox Ct, Denver, CO 80219', latitude: 39.713723, longitude: -105.031939, availability: 'Open' },
  { label: 'Denargo Market Community Garden', address: 'Denargo St & Arkins Ct, Denver, CO 80216', latitude: 39.765075, longitude: -104.991909, availability: 'Open' },
  { label: 'Martinez Park Community Garden', address: '4051 W 9th Ave., Denver, CO 80204', latitude: 39.730783, longitude: -105.040294, availability: 'Open' },
  { label: 'Angel Falls Community Garden', address: '4735 N Pecos St, Denver, CO 80211', latitude: 39.781585, longitude: -105.006778, availability: 'Open' },
  { label: 'Earl Lee Evans Community and Sensory Garden at Firefly Autism', address: '2001 Hoyt St, Lakewood, CO 80215', latitude: 39.748606, longitude: -105.104305, availability: 'Open' },

  // Full (Full for the Season)
  { label: '36th & Lafayette Community Garden', address: '3600 Lafayette Street, Denver, CO 80205', latitude: 39.767187, longitude: -104.970687, availability: 'Full' },
  { label: 'Sandoval School Community Garden', address: '2321 W 35th Ave, Denver, CO 80211', latitude: 39.765818, longitude: -105.015116, availability: 'Full' },
  { label: 'Allison Community Gardens at Semper Farm', address: 'NW corner of 92nd & Pierce, Westminster, CO 80021', latitude: 39.864787, longitude: -105.07092, availability: 'Full' },
  { label: 'Anythink Wright Farms Community Garden', address: '5877 E 120th Avenue, Thornton, CO 80602', latitude: 39.914509, longitude: -104.918568, availability: 'Full' },
  { label: 'Applewood Community Garden', address: '12930 W. 32nd Ave, Golden, CO 80401', latitude: 39.760696, longitude: -105.144622, availability: 'Full' },
  { label: 'Aurora Mental Health Center Community Garden', address: '14301 East Hampden Ave, Aurora, CO 80014', latitude: 39.653843, longitude: -104.822099, availability: 'Full' },
  { label: 'Baker Community Garden', address: '75 W. Bayaud, Denver, CO 80223', latitude: 39.714979, longitude: -104.989653, availability: 'Full' },
  { label: 'Beeler Street Community Garden', address: '1675 Beeler Street, Aurora, CO 80010', latitude: 39.743372, longitude: -104.881268, availability: 'Full' },
  { label: 'Belmar Community Garden', address: '455 S Pierce St., Lakewood, CO 80226', latitude: 39.708827, longitude: -105.072598, availability: 'Full' },
  { label: 'Bromwell School Community Garden', address: '2500 E. 4th Ave, Denver, CO 80206', latitude: 39.72231, longitude: -104.958015, availability: 'Full' },
  { label: 'Brown School Community Garden', address: '2550 Lowell Blvd, Denver, CO 80211', latitude: 39.754559, longitude: -105.03326, availability: 'Full' },
  { label: 'Bruce Randolph Community Garden', address: '1402 Bruce Randolph Ave, Denver, CO 80205', latitude: 39.764423, longitude: -104.970786, availability: 'Full' },
  { label: 'Bryant Webster Community Garden', address: '3635 North Quivas Street, Denver, CO 80211', latitude: 39.766973, longitude: -105.008619, availability: 'Full' },
  { label: 'Casa Verde Community Garden', address: '401 Galapago Street, Denver, CO 80204', latitude: 39.722628, longitude: -104.996669, availability: 'Full' },
  { label: 'Charles Hay School Community Garden', address: '1221 E Eastman Ave, Englewood, CO 80113', latitude: 39.658099, longitude: -104.971892, availability: 'Full' },
  { label: 'Cole Community Garden', address: '1350 E. 33rd Ave., Denver, CO 80205', latitude: 39.76218, longitude: -104.970992, availability: 'Full' },
  { label: 'Cook Park Community Garden', address: '5800 E Mexico Ave, Denver, CO 80222', latitude: 39.686, longitude: -104.920243, availability: 'Full' },
  { label: 'DCIS Baker Community Garden', address: '574 W 6th Ave, Denver, CO 80204', latitude: 39.724901, longitude: -104.993885, availability: 'Full' },
  { label: 'DeLaney Community Garden', address: '170 S. Chambers Rd., Aurora, CO 80011', latitude: 39.714948, longitude: -104.807998, availability: 'Full' },
  { label: 'Denver Language School at Whiteman Community Garden', address: '451 Newport Street, Denver, CO 80220', latitude: 39.72235, longitude: -104.91031, availability: 'Full' },
  { label: 'Edison School Community Garden', address: '3350 Quitman St, Denver, CO 80212', latitude: 39.765481, longitude: -105.039567, availability: 'Full' },
  { label: 'Ellis North School Community Garden', address: '1651 S. Dahlia St., Denver, CO 80222', latitude: 39.687362, longitude: -104.933571, availability: 'Full' },
  { label: 'Englewood Community Garden', address: '601 W. Dartmouth Ave., Englewood, CO 80110', latitude: 39.660759, longitude: -104.994952, availability: 'Full' },
  { label: 'Fairmont DCIS School Community Garden', address: '520 W. Third Ave., Denver, CO 80223', latitude: 39.719517, longitude: -104.99379, availability: 'Full' },
  { label: 'Fletcher Community Garden', address: '9898 E Colfax Avenue, Aurora, CO 80010', latitude: 39.738845, longitude: -104.873867, availability: 'Full' },
  { label: 'Globeville Community Garden', address: '5075 Lincoln, Denver, CO 80216', latitude: 39.788398, longitude: -104.986711, availability: 'Full' },
  { label: 'Golden Community Garden', address: '1506 8th Street, Golden, CO 80401', latitude: 39.754254, longitude: -105.233187, availability: 'Full' },
  { label: 'Golden Natural Grocers Community Garden', address: '2401 Ford St, Golden, CO 80401', latitude: 39.747263, longitude: -105.208924, availability: 'Full' },
  { label: 'Gove Community Garden', address: '1325 Colorado Blvd., Denver, CO 80206', latitude: 39.737373, longitude: -104.940951, availability: 'Full' },
  { label: 'Greenlee School Community Garden', address: '1150 Lipan St., Denver, CO 80204', latitude: 39.733874, longitude: -105.000898, availability: 'Full' },
  { label: 'GW School Community Garden', address: '655 S Monaco Pkwy, Denver, CO 80224', latitude: 39.704798, longitude: -104.914892, availability: 'Full' },
  { label: 'Highland Gardens Village Community Garden', address: 'W 36th Ave between Utica & Vrain, Denver, CO 80212', latitude: 39.767092, longitude: -105.04644, availability: 'Full' },
  { label: 'Hinkley High School Community Garden', address: '1250 Chambers Rd, Aurora, CO 80011', latitude: 39.732042, longitude: -104.808954, availability: 'Full' },
  { label: 'Honor Community Garden at Valdez School', address: '2525 W. 29th Ave., Denver, CO 80211', latitude: 39.759548, longitude: -105.019064, availability: 'Full' },
  { label: 'Horse Barn Demonstration Community Garden', address: '1118 33rd Street, Denver, CO 80205', latitude: 39.763835, longitude: -104.975544, availability: 'Full' },
  { label: 'Jefferson Park School Community Garden', address: '2700 W 27th Ave, Denver, CO 80211', latitude: 39.755889, longitude: -105.020736, availability: 'Full' },
  { label: 'Little Sprouts Community Garden', address: '8448 Otis Drive, Arvada, CO 80003', latitude: 39.852616, longitude: -105.068206, availability: 'Full' },
  { label: 'Lone Tree Community Garden', address: '9375 Heritage Hills Cir, Lone Tree, CO 80124', latitude: 39.538531, longitude: -104.879334, availability: 'Full' },
  { label: 'Lowell Street Community Garden', address: '140 Lowell Blvd, Denver, CO 80219', latitude: 39.71922, longitude: -105.0347, availability: 'Full' },
  { label: 'Lowry Family Community Garden', address: '550 Alton Way, Denver, CO 80230', latitude: 39.725056, longitude: -104.878356, availability: 'Full' },
  { label: 'Del Mar Academy Community Garden', address: '12445 E 2nd Ave, Aurora, CO 80011', latitude: 39.718715, longitude: -104.841932, availability: 'Full' },
  { label: 'Morey Middle School Community Garden', address: '840 East 14th Ave, Denver, CO 80218', latitude: 39.737874, longitude: -104.97744, availability: 'Full' },
  { label: 'Mountain View International Community Garden', address: '10700 E. Evans Ave., Aurora, CO 80014', latitude: 39.677953, longitude: -104.862293, availability: 'Full' },
  { label: 'New Freedom Community Garden', address: '8806 E 13th Ave, Denver, CO 80220', latitude: 39.736966, longitude: -104.886249, availability: 'Full' },
  { label: 'North Middle School Community Garden', address: '12095 East Montview Blvd, Aurora, CO 80010', latitude: 39.749143, longitude: -104.84908, availability: 'Full' },
  { label: 'Palmer School Community Garden', address: '995 Grape St., Denver, CO 80220', latitude: 39.731691, longitude: -104.924918, availability: 'Full' },
  { label: 'Parkview United Church Community Garden', address: '12444 E. Parkview Dr., Aurora, CO 80011', latitude: 39.721571, longitude: -104.841871, availability: 'Full' },
  { label: 'Troy Chavez Memorial Peace Community Garden', address: '3825 Shoshone St, Denver, CO 80211', latitude: 39.769884, longitude: -105.010392, availability: 'Full' },
  { label: 'Pecos Community Garden', address: '3230 Pecos St., Denver, CO 80221', latitude: 39.762547, longitude: -105.006207, availability: 'Full' },
  { label: 'Place Bridge Academy Community Garden', address: '7125 Cherry Creek North Dr., Denver, CO 80209', latitude: 39.688711, longitude: -104.907535, availability: 'Full' },
  { label: 'Regis University Community Garden', address: '5240 Lowell Blvd., Denver, CO 80221', latitude: 39.792173, longitude: -105.034504, availability: 'Full' },
  { label: 'Rosedale Community Garden', address: '2333 S Logan St, Denver, CO 80210', latitude: 39.67338, longitude: -104.983589, availability: 'Full' },
  { label: 'San Rafael Community Garden', address: '2245 Emerson Street, Denver, CO 80205', latitude: 39.750406, longitude: -104.976131, availability: 'Full' },
  { label: 'Shoshone Community Garden', address: '3250 Shoshone St., Denver, CO 80211', latitude: 39.762986, longitude: -105.009455, availability: 'Full' },
  { label: 'St. Peter & St. Mary Community Garden', address: '126 W. 2nd Ave., Denver, CO 80223', latitude: 39.719121, longitude: -104.989672, availability: 'Full' },
  { label: 'St. Thomas Church Community Garden', address: '2201 Dexter Street, Denver, CO 80207', latitude: 39.749205, longitude: -104.933181, availability: 'Full' },
  { label: 'Greenway Community Garden', address: '7790 E. 23rd Ave., Denver, CO 80238', latitude: 39.750788, longitude: -104.89702, availability: 'Full' },
  { label: 'Steck School Community Garden', address: '425 Ash St., Denver, CO 80220', latitude: 39.724177, longitude: -104.938243, availability: 'Full' },
  { label: 'Steele School Community Garden', address: '320 S. Marion Pkwy., Denver, CO 80209', latitude: 39.71096, longitude: -104.971416, availability: 'Full' },
  { label: 'Stevens School Community Garden', address: '7101 W 38th Ave, Wheat Ridge, CO 80033', latitude: 39.770364, longitude: -105.077772, availability: 'Full' },
  { label: 'Urquhardt Memorial Community Garden', address: '1350 E. Florida Ave., Denver, CO 80210', latitude: 39.68978, longitude: -104.971838, availability: 'Full' },
  { label: 'Ute Trail Community Garden', address: '13600 W. Jewell Ave., Lakewood, CO 80228', latitude: 39.678981, longitude: -105.145433, availability: 'Full' },
  { label: 'Vista Peak Prep Community Garden', address: '24500 E 6th Ave, Aurora, CO 80018', latitude: 39.723162, longitude: -104.700259, availability: 'Full' },
  { label: 'West Washington Park Community Garden', address: '201 Grant Street, Denver, CO 80203', latitude: 39.719731, longitude: -104.984226, availability: 'Full' },
  { label: 'Westwood Community Garden', address: '968 S. Newton St., Denver, CO 80219', latitude: 39.699044, longitude: -105.036466, availability: 'Full' },
  { label: 'Whittier School Community Garden', address: '2480 Downing St, Denver, CO 80205', latitude: 39.75236, longitude: -104.971141, availability: 'Full' },
  { label: 'Wyman at DC21 Community Garden', address: '1690 North Williams Street, Denver, CO 80218', latitude: 39.742236, longitude: -104.965335, availability: 'Full' },
  { label: 'Anythink Perl Mack Library Community Garden', address: '7611 Hilltop Cir, Sherrelwood, CO 80221', latitude: 39.834607, longitude: -105.003594, availability: 'Full' },
  { label: 'Connect Auraria Community Garden', address: '1150 12th St, Denver, CO 80204', latitude: 39.7435, longitude: -105.001677, availability: 'Full' },
  { label: 'Congress Park Community Garden at Denver Botanic Gardens', address: '1000 Elizabeth Street, Denver, CO 80206', latitude: 39.732787, longitude: -104.955754, availability: 'Full' },
  { label: 'El Oasis Community Garden', address: '1847 West 35th Avenue, Denver, CO 80211', latitude: 39.765979, longitude: -105.008841, availability: 'Full' },
  { label: 'Cheyenne Arapaho Park Community Garden', address: '9200 E Iowa Ave, Denver, CO 80247', latitude: 39.687059, longitude: -104.880848, availability: 'Full' },
  { label: 'East Middle School Community Garden', address: '1275 Fraser St, Aurora, CO 80011', latitude: 39.733628, longitude: -104.814496, availability: 'Full' },
  { label: 'Sister Pat Hayden Legacy Community Garden', address: '14300 Orchard Pkwy, Westminster, CO 80023', latitude: 39.954184, longitude: -104.99069, availability: 'Full' },
  { label: 'Commons Park Community Garden', address: '18th & Little Raven St., Denver, CO 80202', latitude: 39.758908, longitude: -105.003927, availability: 'Full' },
  { label: 'Cedar Hill Community Garden at Green Mountain United Methodist Church', address: '12755 W Cedar Dr., Lakewood, CO 80228', latitude: 39.713321, longitude: -105.141393, availability: 'Full' },
  { label: 'Jefferson Green Community Garden', address: '9000 W Floyd Ave, Lakewood, CO 80227', latitude: 39.657213, longitude: -105.098519, availability: 'Full' },
  { label: '39th Avenue Community Garden', address: '39th and Williams, Denver, CO 80205', latitude: 39.771122, longitude: -104.96554, availability: 'Full' },
  { label: '48th & Julian Community Garden', address: '48th and Julian, Denver, CO 80221', latitude: 39.784132, longitude: -105.030786, availability: 'Full' },
  { label: 'Wonder Garden at Wyatt Academy', address: '37th Avenue and Gilpin Street, Denver, CO 80205', latitude: 39.768013, longitude: -104.967373, availability: 'Full' },
  { label: 'South Lakewood Elementary Community Garden', address: '8425 W 1st Ave, Lakewood, CO 80226', latitude: 39.718595, longitude: -105.092205, availability: 'Full' },
];

const GARDEN_DESCRIPTION = 'A community garden in the DUG network with individual plots for growing fresh produce. Gardeners donate 10% of their harvest each season for community food redistribution.';

function descriptionFor(_g: Garden): string {
  return GARDEN_DESCRIPTION;
}

async function main() {
  const pool = new Pool(DB_CONFIG as any);

  try {
    const { rows } = await pool.query<{ id: number }>(
      'SELECT id FROM charities WHERE slug = $1',
      [DUG_SLUG]
    );
    if (!rows.length) {
      console.error(`Charity not found: ${DUG_SLUG}. Create it in Admin UI first.`);
      process.exit(1);
    }
    const charityId = rows[0].id;
    console.log(`Found charity id=${charityId}`);
    console.log(`Inserting ${GARDENS.length} public gardens (${GARDENS.filter(g => g.availability === 'Open').length} Open, ${GARDENS.filter(g => g.availability === 'Full').length} Full)...\n`);

    let inserted = 0;

    for (const garden of GARDENS) {
      if (EXCLUDED_GARDENS.has(garden.label)) {
        console.log(`SKIP (excluded) ${garden.label}`);
        continue;
      }

      if (DRY_RUN) {
        console.log(`[DRY RUN] ${garden.label} (${garden.availability}) @ ${garden.latitude.toFixed(5)}, ${garden.longitude.toFixed(5)}`);
        inserted++;
        continue;
      }

      await pool.query(
        `INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [charityId, garden.label, descriptionFor(garden), garden.address, garden.latitude, garden.longitude]
      );
      console.log(`✓ ${garden.label}`);
      inserted++;
    }

    console.log(`\n${DRY_RUN ? '[DRY RUN] Would insert' : 'Inserted'} ${inserted} garden locations.`);
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
