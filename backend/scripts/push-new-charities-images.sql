-- Image URLs for 19 new charities
-- logo_url on charities, photo_url on charity_locations

BEGIN;

-- Charity logos
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089285/qek9tc0x7atcgdrmbka8.png' WHERE slug = 'animal-rescue-of-the-rockies';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776090124/xy6tw5sfdcx4qvhptfrq.png' WHERE slug = 'backpack-society';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089596/l8fbypm1janybeuw1wz6.png' WHERE slug = 'bgoldn';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776090178/obaiwttpfsksif9juqab.png' WHERE slug = 'bienvenidos-food-bank';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776090187/bpdnj5cvx0ugfmpbl8gq.jpg' WHERE slug = 'bluff-lake-nature-center';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776090218/y1c4ns5fsuylnvit7za2.jpg' WHERE slug = 'catholic-charities-archdiocese-denver';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093270/npglmeex0utm0kewuisx.jpg' WHERE slug = 'colorado-christian-services';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093036/y6pxhcztvbfltzatko2i.png' WHERE slug = 'colorado-public-radio';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093450/ducdumfif57w1njkeptv.png' WHERE slug = 'denver-audubon';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093493/bn1rf5bsglfflrvgb2pm.png' WHERE slug = 'denver-food-rescue';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776094484/hoxgngks8vsbjdqfjqmd.jpg' WHERE slug = 'family-promise-of-greater-denver';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776094425/jmjcjflracxh6vzdalwz.png' WHERE slug = 'friends-of-foothills-animal-shelter';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776094296/v0zhoansyyjcndkkewf5.png' WHERE slug = 'golden-retriever-rescue-of-the-rockies';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093834/ghhrm5q6r6hwsx05fny0.png' WHERE slug = 'groundwork-denver';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776094254/hpydvyahwe1iigectohd.png' WHERE slug = 'heartbeat-denver';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776094211/bogpzawy6lpitff0aw8d.jpg' WHERE slug = 'hope-house-colorado';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776094062/hkz2kdetzxhdt21np4gl.png' WHERE slug = 'rocky-mountain-public-media';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776094029/wlmpsrjssvkfmrn7ccer.png' WHERE slug = 'same-cafe';
UPDATE charities SET logo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093977/qay4qwc3p9hhnukwikw8.png' WHERE slug = 'the-action-center';

-- Location street view photos (matched by slug + label)
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776091842/charity-locations/location-580.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'animal-rescue-of-the-rockies') AND label = 'Animal Rescue of the Rockies HQ';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089362/charity-locations/location-581.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'animal-rescue-of-the-rockies') AND label = 'Cat Casita — Fairplay';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776091971/charity-locations/location-575.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'backpack-society') AND label = 'Backpack Society HQ';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776091935/charity-locations/location-577.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'bgoldn') AND label = 'BGOLDN HQ';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089359/charity-locations/location-578.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'bgoldn') AND label = 'BGOLDN Fresh Food Pantry';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776092022/charity-locations/location-572.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'bienvenidos-food-bank') AND label = 'Bienvenidos Food Bank';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776092039/charity-locations/location-573.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'bienvenidos-food-bank') AND label = 'Bienvenidos Mobile Pantry — West Colfax';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776092059/charity-locations/location-566.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'bluff-lake-nature-center') AND label = 'Bluff Lake Nature Center';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089366/charity-locations/location-588.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'catholic-charities-archdiocese-denver') AND label = 'Catholic Charities of Denver HQ';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776092899/charity-locations/location-589.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'catholic-charities-archdiocese-denver') AND label = 'Little Flower Assistance Center';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089368/charity-locations/location-590.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'catholic-charities-archdiocese-denver') AND label = 'Samaritan House';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776092923/charity-locations/location-591.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'catholic-charities-archdiocese-denver') AND label = 'St. Raphael Counseling';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089360/charity-locations/location-579.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'colorado-christian-services') AND label = 'Colorado Christian Services HQ';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093180/charity-locations/location-592.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'colorado-public-radio') AND label = 'Colorado Public Radio HQ';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093197/charity-locations/location-593.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'colorado-public-radio') AND label = 'CPR News Denver Newsroom';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093463/charity-locations/location-576.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'denver-audubon') AND label = 'Denver Audubon Nature Center';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093507/charity-locations/location-571.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'denver-food-rescue') AND label = 'Denver Food Rescue HQ';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776094450/charity-locations/location-568.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'family-promise-of-greater-denver') AND label = 'Family Promise of Greater Denver HQ';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089365/charity-locations/location-586.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'friends-of-foothills-animal-shelter') AND label = 'Foothills Animal Shelter';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093866/charity-locations/location-570.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'groundwork-denver') AND label = 'Groundwork Denver HQ';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089341/charity-locations/location-567.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'heartbeat-denver') AND label = 'Heartbeat Denver HQ';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776089364/charity-locations/location-585.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'hope-house-colorado') AND label = 'Hope House Colorado HQ';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776094086/charity-locations/location-584.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'rocky-mountain-public-media') AND label = 'Rocky Mountain Public Media HQ';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776094013/charity-locations/location-569.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'same-cafe') AND label = 'SAME Cafe';
UPDATE charity_locations SET photo_url = 'https://res.cloudinary.com/dr3gnrygp/image/upload/v1776093969/charity-locations/location-587.jpg'
  WHERE charity_id = (SELECT id FROM charities WHERE slug = 'the-action-center') AND label = 'The Action Center HQ';

COMMIT;
