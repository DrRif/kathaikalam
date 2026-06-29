// ── ERA DEFINITIONS ──
// Each era has a list of building definitions with placement metadata

export const ERAS = {
  ancient: {
    name: 'Ancient Tamil Kingdom',
    torchColor: 0xff8822,
    bldgs: [
      { id: 'gopuram',   icon: '🕌', cat: 'sacred',      lore: 'Seven-tiered Gopuram. Priests can nullify royal decrees once per reign.', fn: 'gopuram',   weight: 1 },
      { id: 'palace',    icon: '🏛️', cat: 'civic',       lore: 'The warrior queen holds court here. Every stone from the northern mountains.', fn: 'palace',    weight: 1 },
      { id: 'hut',       icon: '🏠', cat: 'residential', lore: 'Woven palm roof. Three generations born here.', fn: 'hut',       weight: 4 },
      { id: 'stilt',     icon: '🏚️', cat: 'residential', lore: 'Built over water. Family knows tides by the sound underfoot.', fn: 'stilt',     weight: 3 },
      { id: 'stall',     icon: '🏪', cat: 'commerce',    lore: 'Spices, cloth, fish. The merchant knows everything moving through this port.', fn: 'stall',     weight: 3 },
      { id: 'fortwall',  icon: '🏰', cat: 'military',    lore: 'Three metres thick. Archers cover every approach road.', fn: 'fortwall',  weight: 1 },
      { id: 'warehouse', icon: '🏭', cat: 'commerce',    lore: 'What is stored here is not in any official record.', fn: 'warehouse', weight: 2 },
      { id: 'watchtower',icon: '🗼', cat: 'military',    lore: 'Guard awake two days. Something on the horizon.', fn: 'watchtower',weight: 2 },
    ]
  },

  medieval: {
    name: 'Medieval European',
    torchColor: 0xff6622,
    bldgs: [
      { id: 'castle',    icon: '🏰', cat: 'civic',       lore: 'Three sieges. Never taken. The fourth is coming. The lord knows.', fn: 'castle',    weight: 1 },
      { id: 'cathedral', icon: '⛪', cat: 'sacred',      lore: 'Stained glass took 40 years. The crypt holds older secrets.', fn: 'cathedral', weight: 1 },
      { id: 'cottage',   icon: '🏠', cat: 'residential', lore: 'Three generations. The cellar has wine from before the war.', fn: 'cottage',   weight: 5 },
      { id: 'tavern',    icon: '🍺', cat: 'commerce',    lore: 'Three rooms upstairs. The innkeeper has heard every secret in the kingdom.', fn: 'tavern',    weight: 2 },
      { id: 'fortress',  icon: '🏰', cat: 'military',    lore: 'Moat, drawbridge, murder holes. Designed with personal hatred of attackers.', fn: 'fortress',  weight: 1 },
      { id: 'watchtower',icon: '🗼', cat: 'military',    lore: 'The guard sees something on the horizon.', fn: 'watchtower',weight: 2 },
      { id: 'warehouse', icon: '🏭', cat: 'commerce',    lore: 'Goods not listed in any official record.', fn: 'warehouse', weight: 2 },
    ]
  },

  feudal: {
    name: 'Feudal Japanese',
    torchColor: 0xffdd44,
    bldgs: [
      { id: 'jpcastle',  icon: '🏯', cat: 'civic',       lore: 'Five-tier pagoda castle. The daimyo has not left in three years.', fn: 'jpcastle',  weight: 1 },
      { id: 'shrine',    icon: '⛩️', cat: 'sacred',      lore: 'The torii gate marks the boundary between worlds.', fn: 'shrine',    weight: 2 },
      { id: 'jphouse',   icon: '🏯', cat: 'residential', lore: 'Sliding paper doors. A sword hidden beneath the tatami.', fn: 'jphouse',   weight: 5 },
      { id: 'teahouse',  icon: '🍵', cat: 'commerce',    lore: 'Even enemies bow at the entrance. Peace enforced here.', fn: 'teahouse',  weight: 2 },
      { id: 'watchtower',icon: '🗼', cat: 'military',    lore: 'Guard watches the tree line. Something moved.', fn: 'watchtower',weight: 2 },
      { id: 'warehouse', icon: '🏭', cat: 'commerce',    lore: 'Rice stockpile. Rationed. Guarded.', fn: 'warehouse', weight: 2 },
    ]
  },

  viking: {
    name: 'Viking Norse',
    torchColor: 0xff5511,
    bldgs: [
      { id: 'greathall',   icon: '🏕️', cat: 'civic',       lore: 'Greatest longhouse. Skulls on the beams. Feasts lasting three days.', fn: 'greathall',   weight: 1 },
      { id: 'stones',      icon: '🗿', cat: 'sacred',      lore: 'Arranged by ancestors. The alignment is astronomical.', fn: 'stones',      weight: 2 },
      { id: 'longhouse',   icon: '🏕️', cat: 'residential', lore: 'Long and low. Smoke from the central fire stings the eyes.', fn: 'longhouse',   weight: 5 },
      { id: 'tradingpost', icon: '⚓', cat: 'commerce',    lore: 'Furs, amber, slaves. Three languages spoken here at once.', fn: 'tradingpost', weight: 2 },
      { id: 'palisade',    icon: '🛡️', cat: 'military',    lore: 'Sharpened logs. The heads on spikes are a warning.', fn: 'palisade',    weight: 1 },
      { id: 'watchtower',  icon: '🗼', cat: 'military',    lore: 'Ice on the rungs. Guard watches the fjord.', fn: 'watchtower',  weight: 2 },
    ]
  },

  fantasy: {
    name: 'Fantasy Realm',
    torchColor: 0xaa66ff,
    bldgs: [
      { id: 'magetower',   icon: '🔮', cat: 'sacred',      lore: 'The scholar lives alone. The tower is taller inside than outside.', fn: 'magetower',   weight: 1 },
      { id: 'castle',      icon: '🏰', cat: 'civic',       lore: 'Ancient stones. The last king died here three hundred years ago.', fn: 'castle',      weight: 1 },
      { id: 'stones',      icon: '🗿', cat: 'sacred',      lore: 'The alignment is magical. Strange things happen at midnight.', fn: 'stones',      weight: 2 },
      { id: 'cottage',     icon: '🏠', cat: 'residential', lore: 'Someone lives here. Smoke rises but no one answers the door.', fn: 'cottage',     weight: 4 },
      { id: 'ruinstemple', icon: '🏚️', cat: 'sacred',      lore: 'What was worshipped here was forgotten before the roof fell.', fn: 'ruinstemple', weight: 2 },
      { id: 'watchtower',  icon: '🗼', cat: 'military',    lore: 'Abandoned. Vines growing through the arrow slits.', fn: 'watchtower',  weight: 2 },
    ]
  },

  scifi: {
    name: 'Sci-Fi Colony',
    torchColor: 0x0088ff,
    bldgs: [
      { id: 'dome',      icon: '🛸', cat: 'residential', lore: 'Pressurised. Seals failing on two of six. Nobody told the residents.', fn: 'dome',      weight: 3 },
      { id: 'commtower', icon: '🗼', cat: 'civic',       lore: 'Signal to Earth stopped 8 months ago. Nobody knows why.', fn: 'commtower', weight: 1 },
      { id: 'warehouse', icon: '🏭', cat: 'commerce',    lore: 'Rations logged but the numbers do not add up.', fn: 'warehouse', weight: 2 },
      { id: 'barrier',   icon: '⚡', cat: 'military',    lore: 'Electrified. Power at 40% and falling.', fn: 'barrier',   weight: 2 },
      { id: 'ruinstower',icon: '🗼', cat: 'civic',       lore: 'First colony structure. Abandoned when the crater shifted.', fn: 'ruinstower',weight: 2 },
    ]
  },

  apocalypse: {
    name: 'Post-Apocalypse',
    torchColor: 0xff3300,
    bldgs: [
      { id: 'scraptower',  icon: '🗼', cat: 'military',    lore: 'Built from a truck chassis. Bell warns of raider approach.', fn: 'scraptower',  weight: 2 },
      { id: 'shack',       icon: '🏚️', cat: 'residential', lore: 'Sheet metal and broken doors. Owner painted a number to find it again.', fn: 'shack',       weight: 5 },
      { id: 'ruinstemple', icon: '🏚️', cat: 'civic',       lore: 'Shelter now. Whatever it was before is long forgotten.', fn: 'ruinstemple', weight: 2 },
      { id: 'barrier',     icon: '⚡', cat: 'military',    lore: 'Chain link and corrugated iron. Not enough.', fn: 'barrier',     weight: 2 },
      { id: 'warehouse',   icon: '🏭', cat: 'commerce',    lore: 'The supply cache. Everyone knows. Nobody says.', fn: 'warehouse',   weight: 2 },
    ]
  },
}

// Weighted random pick from era building list
export function pickBuilding(era, rng) {
  const bldgs = ERAS[era]?.bldgs || ERAS.ancient.bldgs
  const totalWeight = bldgs.reduce((s, b) => s + b.weight, 0)
  let r = rng() * totalWeight
  for (const b of bldgs) {
    r -= b.weight
    if (r <= 0) return b
  }
  return bldgs[0]
}
