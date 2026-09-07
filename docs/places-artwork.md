# HER Places Artwork

All `place-*.png` illustrations in `images/pictures/` are native-resolution crops
of the transparent reference sheet supplied on 2026-09-07. External captions and
low-opacity background residue were removed; no artwork was generated or sent
to an external image provider. Original illustration files are retained.

| Catalog place | Asset in `images/pictures/` |
| --- | --- |
| Mori Window Cafe | `place-mori-window-cafe.png` |
| Station Glow Cafe | `place-station-glow-cafe.png` |
| Sora Work Lounge | `place-sora-work-lounge.png` |
| Tsuki Books | `place-tsuki-books.png` |
| Hana Room | `place-hana-room.png` |
| Riverside Park | `place-riverside-park.png` |
| Nagi Museum Hour | `place-nagi-museum.png` |
| Clay Nest Studio | `place-clay-nest-studio.png` |
| Green Kitchen Class | `place-green-kitchen-class.png` |
| Luna Boxing Studio | `place-luna-boxing-studio.png` |
| Yuzu Solo Table | `place-yuzu-solo-table.png` |
| Haru Fast Table | `place-yuzu-solo-table.png` (shared restaurant illustration) |

The reference labels a bookstore illustration "Haru Fast Table" even though the
catalog defines Haru as a restaurant. Its NAGI BOOKSTORE artwork is assigned to
Tsuki Books, keeping the existing fictional names and categories unchanged.
Haru uses the restaurant crop until a dedicated fast-food illustration is supplied.
Signs painted inside the original artwork have not been rewritten.

List cards, selected map cards and details resolve the same catalog `place.image`.
All twelve places now have an image; the neutral icon remains a missing-image
fallback. Saved-place storage still contains IDs, not duplicate artwork data.

## Prototype Map

`places-map-background.png` is cropped from the top-right reference map. Its
baked-in controls, markers and distance scale were locally removed, leaving an
illustrative background. Small repaired areas are not geographic data.

Map/List changes presentation only. Search retains the existing form handler.
Zoom and reset affect the shared background/marker layer; they do not calculate
routes, distances or location. Area filtering, `mapPosition` values and external
Google Maps links are unchanged. Every displayed marker is an actual catalog
selection control. No geolocation, Maps SDK or live-business lookup is added.

Desktop selected cards float at lower right. Mobile cards sit below the map.
The prototype badge and illustrative-navigation disclosure remain localized.

`map-control-*.svg` assets are exported from Lucide and retain its ISC license in
`images/pictures/map-controls-LICENSE.txt`.
