# Charity Page Optimization

Goal: Optimize the charity detail page for better conversion (more donations clicked).

## Research & Audit

- [ ] Review current CharityPreviewDrawer and any full charity detail page for conversion gaps
- [ ] Identify missing trust signals (ratings, financials, impact stats, social proof)
- [ ] Audit CTA placement, copy, and visual hierarchy

## Improvements

- [ ] I want to improve the process of navigating from /charities to a specific charity page. right now it feels like you lose your old spot on the map. is there a better way where we can make it feel more integrated, without losing their place, but without sacrificing that the charity page needs to be able to stand on its own (e.g. unique url that can be shared etc.)
- [ ] I want to add a second field called "impact." it only shows if the "impact" field is filled out in the db for the charity. 
	- [ ] This will likely require a migration to add the field. 
	- [ ] On large viewports, the field can sit 50/50 split with the charity description, on the righthand column. on medium / small viewports it can sit beneath.
- [ ] Donate CTA should be one unified color
- [ ] Remove the "x miles away" as this is not relevant when only knowing a zip code. We don't need any "x miles away" across the entire site.
