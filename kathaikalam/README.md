# Kathai Kalam — World Builder

AI-powered 3D world-building platform for solo creators and indie filmmakers.

## Setup (10 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# Opens at http://localhost:5173
```

## Project Structure

```
kathaikalam/
├── index.html                  # Entry point
├── src/
│   ├── main.js                 # App entry — wires everything together
│   ├── core/
│   │   ├── renderer.js         # Three.js setup, camera controller
│   │   └── ai.js               # Anthropic API world generation
│   ├── terrain/
│   │   └── terrain.js          # Noise, erosion, rivers, vertex colours
│   ├── structures/
│   │   ├── builders.js         # 30 building types, each in own function
│   │   ├── eras.js             # Era definitions (Ancient Tamil → Sci-Fi)
│   │   └── placement.js        # Heightmap-aware placement, raycasting
│   ├── lighting/
│   │   └── lighting.js         # Day/night cycle, torch flicker, god rays
│   ├── nature/                 # (next: tree ecosystem module)
│   └── ui/
│       └── styles.css          # All styles
└── public/
    └── favicon.svg
```

## What's built (Layers 1–3b)

- **L1 Terrain** — Simplex noise, domain warping, FBM, river erosion, thermal erosion, vertex colour bands
- **L2 PBR-ready** — Vertex colour terrain, water animation
- **L3 Lighting** — Full day/night cycle with keyframed sky, PCF shadows, torch flicker with fire particles, god rays
- **L3b Structures** — 30 building types across 7 eras, heightmap-aware placement, raycasting hover

## Roadmap

| Layer | What | Status |
|-------|------|--------|
| L1 | Terrain — noise, rivers, coastlines | ✅ Done |
| L2 | PBR Textures | ✅ Done (vertex colours, water) |
| L3 | Lighting — shadows, torches, god rays | ✅ Done |
| L4 | Living world — NPCs, animals, routines | Next |
| L5 | Physics — collision, water flow | Later |
| L6 | Export — glTF to Godot/Unity | Later |

## Era Styles

| Era | Style | Key Buildings |
|-----|-------|---------------|
| ancient | Tamil Kingdom | Gopuram, Palace, Stilt houses, Market stalls |
| medieval | European | Castle, Cathedral, Cottages, Tavern |
| feudal | Japanese | Pagoda castle, Shrine, Farmhouses, Tea house |
| viking | Norse | Great hall, Standing stones, Longhouses |
| fantasy | Mixed | Mage tower, Ancient castle, Ruins |
| scifi | Futuristic | Dome shelters, Comm tower, Barriers |
| apocalypse | Post-collapse | Scrap tower, Shacks, Ruins |

## Controls

- **Drag** — rotate camera
- **Scroll** — zoom
- **Time slider** — scrub through 24 hours
- **Hover** — see building lore popup
- **Generate World** — AI creates a world from your prompt
- **Surprise Me** — random world from curated prompts
- **Export** — saves scene as `.kk.json`

## Adding New Buildings

1. Add a builder function to `src/structures/builders.js`
2. Add to the `BUILDERS` lookup table at the bottom
3. Add to the relevant era in `src/structures/eras.js`

## Adding New Eras

Add a new entry to `ERAS` in `src/structures/eras.js` with a name, torch colour, and building list.
