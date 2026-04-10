# Enhance Map (/charities)

Goal: Polish the map experience with better controls, mobile UX, and location awareness.

## Zip / Location Display
- [ ] If a location (zip) is set, always display it in the zip field — authenticated users with no zip preference currently fall through without a localStorage fallback
- [ ] Authenticated user with no zip in prefs should fall back to localStorage before showing "Set location"

## Map Controls
- [ ] Add + / − zoom buttons (overlay on map, bottom-left or top-right)
- [ ] Add a "Recenter" button that flies back to the user's active zip location (only shown when a zip is set and map has been panned away)

## Mobile UX
- [ ] Review map/list toggle behavior on mobile — ensure switching modes is smooth and doesn't lose scroll position in list
- [ ] Drawer (LocationDrawer) on mobile: confirm swipe-to-dismiss feels natural; consider adding a visible swipe handle affordance
- [ ] On mobile map view, tag filter pills should not obscure the zoom/recenter controls
- [ ] Ensure bottom controls (zip button, zoom, recenter) don't overlap the mobile map/list toggle pill

## Desktop / Other Views
- [ ] Confirm zip field is always visible on desktop (currently bottom-right, may overlap with multi-pin drawer on small laptops)
- [ ] Verify sidebar + map layout at mid-size breakpoints (lg boundary ~1024px)


when map is loading it flashes all of den then zip. add loading state