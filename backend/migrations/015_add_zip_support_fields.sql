-- Up Migration
ALTER TABLE zip_codes
  ADD COLUMN neighborhood VARCHAR(100),
  ADD COLUMN zoom         SMALLINT;

-- Populate known neighborhood + zoom for Denver zips
UPDATE zip_codes SET neighborhood = 'Union Station',              zoom = 14 WHERE zip = '80202';
UPDATE zip_codes SET neighborhood = 'Cap Hill',        zoom = 14 WHERE zip = '80203';
UPDATE zip_codes SET neighborhood = 'West Colfax / Lincoln Park',   zoom = 14 WHERE zip = '80204';
UPDATE zip_codes SET neighborhood = 'Five Points / North Denver',           zoom = 14 WHERE zip = '80205';
UPDATE zip_codes SET neighborhood = 'Congress Park / Cherry Creek', zoom = 14 WHERE zip = '80206';
UPDATE zip_codes SET neighborhood = 'Park Hill',                    zoom = 14 WHERE zip = '80207';
UPDATE zip_codes SET neighborhood = 'Wash Park',      zoom = 14 WHERE zip = '80209';
UPDATE zip_codes SET neighborhood = 'Wash Park / University',  zoom = 14 WHERE zip = '80210';
UPDATE zip_codes SET neighborhood = 'Highland',         zoom = 14 WHERE zip = '80211';
UPDATE zip_codes SET neighborhood = 'West Highland',          zoom = 14 WHERE zip = '80212';
UPDATE zip_codes SET neighborhood = 'RiNo / Globeville',            zoom = 14 WHERE zip = '80216';
UPDATE zip_codes SET neighborhood = 'Cheesman Park',                zoom = 14 WHERE zip = '80218';
UPDATE zip_codes SET neighborhood = 'Barnum / Harvey Park',         zoom = 14 WHERE zip = '80219';
UPDATE zip_codes SET neighborhood = 'Montclair / Hale',             zoom = 14 WHERE zip = '80220';
UPDATE zip_codes SET neighborhood = 'Virginia Village',             zoom = 14 WHERE zip = '80222';
UPDATE zip_codes SET neighborhood = 'Baker / Overland',             zoom = 14 WHERE zip = '80223';
UPDATE zip_codes SET neighborhood = 'Lowry',                        zoom = 13 WHERE zip = '80230';
UPDATE zip_codes SET neighborhood = 'Central Park',                 zoom = 13 WHERE zip = '80238';
UPDATE zip_codes SET neighborhood = 'Montbello',                    zoom = 13 WHERE zip = '80239';
UPDATE zip_codes SET neighborhood = 'Hilltop',                      zoom = 14 WHERE zip = '80246';
UPDATE zip_codes SET neighborhood = 'Edgewater',                    zoom = 14 WHERE zip = '80214';
UPDATE zip_codes SET neighborhood = 'Morse Park / Edgewater',       zoom = 14 WHERE zip = '80215';
UPDATE zip_codes SET neighborhood = 'Globeville / Swansea',         zoom = 14 WHERE zip = '80221';
UPDATE zip_codes SET neighborhood = 'Goldsmith',                    zoom = 14 WHERE zip = '80224';
UPDATE zip_codes SET neighborhood = 'Belmar',                       zoom = 13 WHERE zip = '80226';
UPDATE zip_codes SET neighborhood = 'Bear Valley',                  zoom = 13 WHERE zip = '80227';
UPDATE zip_codes SET neighborhood = 'Green Mountain',               zoom = 13 WHERE zip = '80228';
UPDATE zip_codes SET neighborhood = 'Thornton / Northglenn',        zoom = 13 WHERE zip = '80229';
UPDATE zip_codes SET neighborhood = 'Windsor / Cherry Creek East',  zoom = 14 WHERE zip = '80231';
UPDATE zip_codes SET neighborhood = 'Lakewood',                     zoom = 13 WHERE zip = '80232';
UPDATE zip_codes SET neighborhood = 'Northglenn',                   zoom = 13 WHERE zip = '80233';
UPDATE zip_codes SET neighborhood = 'Westminster',                  zoom = 13 WHERE zip = '80234';
UPDATE zip_codes SET neighborhood = 'Lakewood / Columbine Hills',   zoom = 13 WHERE zip = '80235';
UPDATE zip_codes SET neighborhood = 'Harvey Park / Marston',        zoom = 13 WHERE zip = '80236';
UPDATE zip_codes SET neighborhood = 'Denver Tech Center',           zoom = 13 WHERE zip = '80237';
UPDATE zip_codes SET neighborhood = 'Lowry / East Colfax',          zoom = 14 WHERE zip = '80247';
UPDATE zip_codes SET neighborhood = 'Green Valley Ranch',           zoom = 13 WHERE zip = '80249';
UPDATE zip_codes SET neighborhood = 'Federal Heights',              zoom = 13 WHERE zip = '80260';
UPDATE zip_codes SET neighborhood = 'Downtown Denver',              zoom = 14 WHERE zip = '80264';
UPDATE zip_codes SET neighborhood = 'Downtown Denver',              zoom = 14 WHERE zip = '80266';
UPDATE zip_codes SET neighborhood = 'Downtown Denver / Civic Center', zoom = 14 WHERE zip = '80290';
UPDATE zip_codes SET neighborhood = 'Downtown Denver / Civic Center', zoom = 14 WHERE zip = '80293';
UPDATE zip_codes SET neighborhood = 'Downtown Denver / Civic Center', zoom = 14 WHERE zip = '80294';

-- Littleton
UPDATE zip_codes SET neighborhood = 'Littleton',                    zoom = 13 WHERE zip = '80120';
UPDATE zip_codes SET neighborhood = 'Littleton',                    zoom = 13 WHERE zip = '80121';
UPDATE zip_codes SET neighborhood = 'Littleton / Southglenn',       zoom = 13 WHERE zip = '80122';
UPDATE zip_codes SET neighborhood = 'Littleton / Columbine Valley', zoom = 13 WHERE zip = '80123';
UPDATE zip_codes SET neighborhood = 'Littleton / Sterling Ranch',   zoom = 13 WHERE zip = '80125';
UPDATE zip_codes SET neighborhood = 'Highlands Ranch',              zoom = 13 WHERE zip = '80126';
UPDATE zip_codes SET neighborhood = 'Littleton / Ken Caryl',        zoom = 13 WHERE zip = '80127';
UPDATE zip_codes SET neighborhood = 'Littleton / Columbine',        zoom = 13 WHERE zip = '80128';
UPDATE zip_codes SET neighborhood = 'Highlands Ranch',              zoom = 13 WHERE zip = '80129';
UPDATE zip_codes SET neighborhood = 'Highlands Ranch',              zoom = 13 WHERE zip = '80130';

-- Broomfield
UPDATE zip_codes SET neighborhood = 'Broomfield',                   zoom = 13 WHERE zip = '80020';
UPDATE zip_codes SET neighborhood = 'Broomfield / Westminster',     zoom = 13 WHERE zip = '80021';
UPDATE zip_codes SET neighborhood = 'Broomfield',                   zoom = 13 WHERE zip = '80023';

-- Centennial (listed as Englewood in simplemaps)
UPDATE zip_codes SET neighborhood = 'Centennial / Greenwood Village', zoom = 13 WHERE zip = '80111';
UPDATE zip_codes SET neighborhood = 'Centennial',                   zoom = 13 WHERE zip = '80112';

---- Down Migration
ALTER TABLE zip_codes
  DROP COLUMN IF EXISTS neighborhood,
  DROP COLUMN IF EXISTS zoom;
