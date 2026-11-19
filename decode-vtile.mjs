// Reads one of the map's shape files (vtiles/<tx>_<tz>.bin) and prints what is in it as JSON, with every point
// as [longitude, latitude]. Stands alone: Node 18+, nothing to install.
//   node decode-vtile.mjs vtiles/28_17.bin > 28_17.json
// The layout is described in FORMAT.md. Data (c) OpenStreetMap contributors, ODbL 1.0.

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const meta = JSON.parse(fs.readFileSync(path.join(here, 'meta.json'), 'utf8'))
const file = process.argv[2]
if (!file) { console.error('usage: node decode-vtile.mjs vtiles/<tx>_<tz>.bin'); process.exit(2) }
const bytes = zlib.inflateSync(fs.readFileSync(file))

const Q = 8 / meta.cell // units a metre: points are whole eighths of a cell from the map's corner (x0, z0)
let i = 0, px = 0, pz = 0
const u = () => { let v = 0, m = 1, b; do { b = bytes[i++]; v += (b & 127) * m; m *= 128 } while (b > 127); return v }
const s = () => { const v = u(); return v % 2 ? -(v + 1) / 2 : v / 2 }
const byte = () => bytes[i++]
const lonlat = (qx, qz) => [+(meta.lon0 + (meta.x0 + qx / Q) / meta.mlon).toFixed(7), +(meta.lat0 - (meta.z0 + qz / Q) / meta.mlat).toFixed(7)]
const pt = () => { px += s(); pz += s(); return lonlat(px, pz) }
const list = (one) => { const n = u(), out = []; let k = -1; for (let j = 0; j < n; j++) { k += u() + 1; out.push(one(k)) } return out }
const rings = () => { const n = u(), out = []; for (let r = 0; r < n; r++) { const m = u(), ring = []; for (let q = 0; q < m; q++) ring.push(pt()); out.push(ring) } return out }

const version = u()
if (version !== 2) { console.error(`version ${version}: this reader knows version 2`); process.exit(1) }
const CT = meta.tile / meta.bake.ratio // the coarse ground: CT x CT cells of (cell x ratio) metres
const coarse = [...bytes.subarray(i, i + CT * CT)]; i += CT * CT
const areas = list((key) => ({ key, layer: byte(), class: byte(), rings: rings() }))
const coast = list((key) => ({ key, from: pt(), to: pt() }))
const roads = list((key) => { const cls = byte(), width = byte(), bridge = byte() === 1, n = u(), line = []; for (let q = 0; q < n; q++) line.push(pt()); return { key, class: cls, widthMetres: width, bridge, line } })
const buildings = list((key) => {
  const heightCells = byte(), colourFamily = byte(), baseCells = byte(), n = u(), out = []
  for (let r = 0; r < n; r++) {
    const v = u(), m = v >> 1, ring = []
    if (v & 1) { // a parallelogram: three corners written, the fourth is the first plus the third less the second
      ring.push(pt()); const ax = px, az = pz; ring.push(pt()); const bx = px, bz = pz; ring.push(pt())
      ring.push(lonlat(ax - bx + px, az - bz + pz))
    } else for (let q = 0; q < m; q++) ring.push(pt())
    out.push(ring)
  }
  return { key, heightMetres: heightCells * meta.cell, baseMetres: baseCells * meta.cell, colourFamily, rings: out }
})
process.stdout.write(JSON.stringify({ file: path.basename(file), version, coarseCellsAcross: CT, coarse, areas, coast, roads, buildings }))
