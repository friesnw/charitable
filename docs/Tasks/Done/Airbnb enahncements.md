


  ---
  4. Charity Cards in the Left Panel

  Airbnb: Full-bleed photo tiles with star rating, price, and key metadata visible at a glance.

  GoodLocal issues (Charities.tsx:234-349):
  - Left panel cards are text-only rows with a tiny 40×40 logo — no photo. This is intentionally compact but
  makes all charities feel equally unimportant.
  - Cause tags are plain text-xs chips with no color — no visual differentiation between tags, even though you have causeColor available and use it on the map.
  - The inline location expansion (accordion) is functional but the UX is rough: it shows "Locations (3)" as a small uppercase header, then thumbnail rows. There's no affordance that a card is clickable to expand.
  - NearbyCharityCard.tsx (the grid view) is much richer — it has a photo, gradient, neighborhood badges, and a
  hover scale. The left panel cards feel like a different product.

  Fix direction: Color the cause tag chips in the list panel (you already have causeColor per tag). Consider
  adding a small thumbnail photo to list rows, or at minimum adding a colored left border matching the cause
  color.

  ---
  ---
  6. Filters / Tag Chips

  Airbnb: Category filter bar is a permanent part of the layout below the search bar, not overlaid on content.

  GoodLocal issues (Charities.tsx:388-427):
  - Tag chips float over the top of the map as absolute positioned overlays with pointer-events-none on the
  container. They can visually obscure map content and feel less stable.
  - Only one tag can be active at a time — no multi-select.
  - The + N more button to show remaining tags (Charities.tsx:418-425) is tucked in the chip row and easy to
  miss.
  - No chip for "nearby" / distance as a sort option.
  - The tag row has no visual scrollability indicator (fade/shadow) on mobile.

  Fix direction: Move the filter chips to a persistent bar between the header and the split panel (not floating
  over the map). Add a right-edge fade to signal horizontal scroll.

  
