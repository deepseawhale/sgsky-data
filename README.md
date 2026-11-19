# sgsky · 地图数据 / map data

这是小红书小工具「sgsky」用到的全部地图数据，按 ODbL 1.0 公开。游戏本身的代码和美术不在这里。

This is all the map data the 小红书 mini-tool "sgsky" uses, published as the ODbL asks. The game's
code and art are not part of this repository.

## 署名与许可 / Attribution and licence

**地图数据 © OpenStreetMap 贡献者** · Map data © OpenStreetMap contributors — <https://www.openstreetmap.org/copyright>

这里的文件（`vtiles/`、`far.bin`、`places.json`、`minimap.png`、`meta.json`）是 OpenStreetMap 的衍生数据库，
按 [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/) 提供：可以自由使用、修改、再发布，
条件是署名 OpenStreetMap 贡献者，并且把你改出来的数据库同样按 ODbL 公开。

The files here are a derivative database of OpenStreetMap, offered under the ODbL 1.0: you may use, change and
share them, provided you credit OpenStreetMap's contributors and offer any database you derive from them under
the ODbL too.

**组屋楼层 / HDB floor counts**: 484 栋楼（共 217,309 栋）在 OpenStreetMap 里既没有高度也没有层数，
它们的高度取自新加坡建屋发展局的层数（层数 × 2.8 米 + 3 米）。Contains information from *HDB Property
Information* accessed on 2026-11-17 from data.gov.sg, which is made available under the terms of the
[Singapore Open Data Licence version 1.0](https://data.gov.sg/open-data-licence). 本数据与新加坡政府及其机构无关，
也未获其认可 · Not endorsed by, or affiliated with, the Singapore Government or its agencies.

## 来源 / Sources

- OpenStreetMap France extracts: `singapore-latest.osm.pbf`, `riau_islands-latest.osm.pbf` — <https://download.openstreetmap.fr/extracts/>
- Geofabrik GmbH: `malaysia-singapore-brunei-latest.osm.pbf`（柔佛一侧 / the Johor side）— <https://download.geofabrik.de/asia/malaysia-singapore-brunei.html>
- 构建时间 / built: 2026-11-18T06:35:32.810Z

## 怎么做出来的 / How it was made

从上面的导出里取出海岸线、土地用途、水体、道路和铁路、楼宇轮廓和地名；坐标投到以 (1.3521°N, 103.8198°E)
为原点的米制平面，量化到 0.25 米；楼高取 OSM 的 `height`，没有就用 `building:levels` × 层高，再没有就用上面
说的组屋层数，都没有就按楼的类型估一个；高度统一乘 0.75。然后按 1024 米见方的瓦片切开，每块一个文件。

Coastlines, land use, water, roads and rails, building outlines and place names are taken from the extracts
above; projected to a metric plane about (1.3521°N, 103.8198°E) and snapped to 0.25 m; a building's height is
OSM's `height`, else `building:levels` times a storey, else the HDB floor count above, else a guess by the
kind of building; all heights are scaled by 0.75. The result is cut into tiles 1024 m square, one file each.

## 制作 / Made by

本数据由作者与 Claude Code 协作整理 · Prepared by the author, co-working with Claude Code.

## 文件 / Files

| 文件 | 内容 |
|---|---|
| `vtiles/<tx>_<tz>.bin` | 每块瓦片的形状：土地、海岸、道路、楼宇（1646 个文件）· the shapes of each tile |
| `far.bin` | 全图 32 米一格的高度和类别 · the whole map at 32 m a block |
| `places.json` | 地名（1865 条）· place names |
| `minimap.png` | 全图小地图，16 米一像素 · the whole map at 16 m a pixel |
| `meta.json` | 坐标框架和瓦片清单 · the map's frame and the list of tiles |
| `FORMAT.md` | 文件格式说明 · the formats |
| `decode-vtile.mjs` | 把一个形状文件读成带经纬度的 JSON（Node 18+）· reads a shape file into JSON with longitudes and latitudes |

```bash
node decode-vtile.mjs vtiles/28_17.bin > 28_17.json
```
