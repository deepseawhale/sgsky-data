# File formats

Everything here is derived from OpenStreetMap and offered under the ODbL 1.0 (see README.md).

## meta.json

The map's frame. The fields a reader needs:

| field | meaning |
|---|---|
| `lat0`, `lon0` | the origin of the local metric frame (degrees) |
| `mlat`, `mlon` | metres per degree of latitude / longitude at the origin |
| `x0`, `z0` | the map's north-west corner in that frame (metres east, metres south of the origin) |
| `cell` | metres per map cell (2) |
| `tile` | cells per tile side (512: a tile is 1024 m square) |
| `gw`, `gh` | the map's size in cells |
| `tiles` | `[tx, tz, tallest]` for every tile that has land |
| `vtiles` | `[tx, tz]` for every shape file |
| `bake.ratio`, `bake.coarseW`, `bake.coarseH` | the coarse ground grid: `cell x ratio` metres per coarse cell |

A point `(X, Z)` in metres (east, south of the origin) is at longitude `lon0 + X / mlon`, latitude `lat0 - Z / mlat`.

## vtiles/<tx>_<tz>.bin — the shapes of one tile

zlib-deflated. Inside, unsigned integers are LEB128 varints (7 bits a byte, low first); signed ones are
zig-zag (`v >= 0 ? 2v : -2v - 1`) varints. Points are whole eighths of a cell (0.25 m) from the map's corner
`(x0, z0)`, each written as the signed difference from the point before it (x then z), running through the
whole file.

Lists are written as a count, then the items with rising keys, each key as `key - previous key - 1`
(the first against -1). A key is the shape's number in the build's own lists: the same shape has the same
key in every tile file it appears in.

In order:

1. `version` (varint): 2.
2. The coarse ground: `(tile / ratio)²` bytes, row by row. Bit 0: land; bit 1: coast nearby; bit 2: open sea
   within 60 coarse cells of land.
3. Areas (land use, water, parks, …), cut along the tile's edges: key, `layer` (byte: drawing order), `class`
   (byte: what it is), ring count, then each ring as a point count and its points.
4. Coastline pieces: key, two points.
5. Roads and rails: key, `class` (byte), `width` (byte, metres of one carriageway), `bridge` (byte 0/1), point
   count, points.
6. Buildings: key, `height` (byte, cells: metres / 2, after the map's height scale of 0.75), `colour family`
   (byte), `base` (byte, cells: the underside of a part that floats, else 0), ring count, then each ring as a
   varint `2 x points + p` and its points; when `p` is 1 the ring is a parallelogram of four corners and only
   three are written (the fourth is the first plus the third less the second).

A shape that crosses a tile's edge is in each tile file it touches (areas are cut instead: each piece is in
one file). `decode-vtile.mjs` reads a file and prints it as JSON with longitudes and latitudes.

## far.bin — the whole map at 32 m

zlib-deflated. For each tile in `meta.tiles`' order: 32 x 32 heights (bytes, cells), then 32 x 32 material
numbers (bytes). A block is a building where buildings cover 30% of it or more.

## places.json

Named places from OpenStreetMap: `n` name, `zh` Chinese name where there is one, `k` kind, `x`, `y` map cells
(multiply by `cell` and add `x0`, `z0` for metres), `w` a Wikidata id where OSM has one.

## minimap.png

The whole map drawn at 16 m a pixel.
