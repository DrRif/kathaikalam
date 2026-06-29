import * as THREE from 'three'
import { BUILDERS } from './builders.js'
import { ERAS, pickBuilding } from './eras.js'
import { Alea } from '../utils/noise.js'
import { getGroundY, isFlat, SIZE, SEG } from '../terrain/terrain.js'

export function placeStructures(scene, terrainMesh, heightData, landPts, params) {
  const { seed, era, settle, scatter, hscale, biome } = params
  const group = new THREE.Group()
  group.name = 'structures'

  const rng = Alea(seed + 500)
  const placed = []
  const stats = { residential: 0, civic: 0, sacred: 0, military: 0, commerce: 0 }

  // Find a flat centre point for the settlement
  const shuffled = [...landPts].sort(() => rng() - 0.5)
  const centre = shuffled.find(p =>
    Math.sqrt(p.x*p.x + p.z*p.z) < scatter * 0.5 &&
    isFlat(terrainMesh, p.x, p.z, 3)
  ) || shuffled[0] || { x: 0, y: 0, z: 0 }

  let count = 0
  let attempts = 0
  const maxAttempts = settle * 25

  while (count < settle && attempts < maxAttempts) {
    attempts++
    const bDef = pickBuilding(era, rng)
    const angle = rng() * Math.PI * 2
    const dist = rng() * scatter
    const px = centre.x + Math.cos(angle) * dist + (rng() - 0.5) * 4
    const pz = centre.z + Math.sin(angle) * dist + (rng() - 0.5) * 4

    // Bounds check
    if (Math.abs(px) > SIZE * 0.46 || Math.abs(pz) > SIZE * 0.46) continue

    // Get ground height
    const py = getGroundY(terrainMesh, heightData, px, pz)

    // Height normalised check
    const ix = Math.round((px / SIZE + 0.5) * SEG)
    const iz = Math.round((pz / SIZE + 0.5) * SEG)
    const nh = heightData[iz * (SEG + 1) + ix] || 0

    // Must be on land, not too high
    if (nh < params.sea + 0.06 || nh > 0.65) continue

    // Must be flat
    const minRadius = bDef.cat === 'military' ? 3 : 2
    if (!isFlat(terrainMesh, px, pz, minRadius)) continue

    // Spacing check
    const minSpacing = params.spacing || 5
    if (placed.some(p => Math.sqrt((px-p.x)**2 + (pz-p.z)**2) < minSpacing)) continue

    // Build it
    const sc = hscale * (0.75 + rng() * 0.5)
    const fn = BUILDERS[bDef.fn]
    if (!fn) continue

    let obj
    try { obj = fn(sc) }
    catch (e) { console.warn('Builder failed:', bDef.fn, e); continue }

    obj.position.set(px, py, pz)
    // Walls and military structures face outward; others rotate freely
    obj.rotation.y = bDef.cat === 'military'
      ? Math.atan2(px - centre.x, pz - centre.z)
      : rng() * Math.PI * 2

    // Store metadata for raycasting / export
    obj.userData = {
      name: bDef.id,
      icon: bDef.icon,
      cat: bDef.cat,
      lore: bDef.lore,
      era,
      pos: { x: px, y: py, z: pz }
    }

    group.add(obj)
    placed.push({ x: px, z: pz, cat: bDef.cat })
    stats[bDef.cat] = (stats[bDef.cat] || 0) + 1
    count++
  }

  scene.add(group)
  return { group, placed, stats, count, centre }
}

export function placeNature(scene, terrainMesh, heightData, landPts, params, buildTree, buildRock) {
  const { seed, trees, rocks, treeSc, biome, sea } = params
  const group = new THREE.Group()
  group.name = 'nature'

  const rng = Alea(seed + 200)
  const shuffled = [...landPts].sort(() => rng() - 0.5)
  let treeCount = 0, rockCount = 0

  // Trees — spread across outer areas
  for (let i = 0; i < Math.min(trees, shuffled.length * 2); i++) {
    if (treeCount >= trees) break
    const pt = shuffled[i % shuffled.length]
    if (!pt) continue
    const px = pt.x + (rng() - 0.5) * 8
    const pz = pt.z + (rng() - 0.5) * 8
    if (Math.abs(px) > SIZE * 0.47 || Math.abs(pz) > SIZE * 0.47) continue
    const py = getGroundY(terrainMesh, heightData, px, pz)
    const sc = (treeSc || 1.0) * (0.5 + rng() * 0.9)
    const tree = buildTree(sc)
    tree.position.set(px, py, pz)
    tree.rotation.y = rng() * Math.PI * 2
    group.add(tree)
    treeCount++
  }

  // Rocks
  const rshuffled = [...landPts].sort(() => rng() - 0.5)
  for (let i = 0; i < Math.min(rocks * 3, rshuffled.length); i++) {
    if (rockCount >= rocks) break
    const pt = rshuffled[i]
    if (!pt) continue
    const px = pt.x + (rng() - 0.5) * 10
    const pz = pt.z + (rng() - 0.5) * 10
    if (Math.abs(px) > SIZE * 0.47 || Math.abs(pz) > SIZE * 0.47) continue
    const py = getGroundY(terrainMesh, heightData, px, pz)
    const rock = buildRock(0.4 + rng() * 0.9)
    rock.position.set(px, py, pz)
    rock.rotation.y = rng() * Math.PI * 2
    group.add(rock)
    rockCount++
  }

  scene.add(group)
  return { group, treeCount, rockCount }
}

// Raycasting — find which structure is under the mouse
export function raycastStructures(structureGroup, mouse, camera) {
  if (!structureGroup) return null
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)
  const hits = raycaster.intersectObjects(structureGroup.children, true)
  if (hits.length === 0) return null
  let obj = hits[0].object
  while (obj.parent && !obj.userData.name) obj = obj.parent
  return obj.userData.name ? obj.userData : null
}

// Export scene data as JSON
export function exportScene(world, structureGroup, params) {
  const structures = []
  if (structureGroup) {
    structureGroup.children.forEach(obj => {
      if (obj.userData.name) {
        structures.push({
          id: obj.userData.name,
          icon: obj.userData.icon,
          cat: obj.userData.cat,
          era: obj.userData.era,
          pos: obj.userData.pos,
        })
      }
    })
  }
  return {
    world,
    params,
    structures,
    exportedAt: new Date().toISOString(),
    version: '0.1.0'
  }
}
