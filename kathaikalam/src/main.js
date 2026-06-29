import * as THREE from 'three'
import { createRenderer, createCamera, createCameraController, resizeRenderer } from './core/renderer.js'
import { generateTerrain, buildWater, buildRivers, buildFoam, animateWater, BIOME_CFG } from './terrain/terrain.js'
import { placeStructures, placeNature, raycastStructures, exportScene } from './structures/placement.js'
import { buildPalm, buildPine, buildOak, buildDeadTree, buildRock } from './structures/builders.js'
import { createLights, applyTime, createTorches, removeTorches, animateTorches, createGodRays, renderGodRays } from './lighting/lighting.js'
import { generateWorldFromPrompt, SURPRISE_PROMPTS } from './core/ai.js'
import { ERAS } from './structures/eras.js'

// ── STATE ──
const state = {
  world: null,
  params: {
    seed: 42, height: 14, sea: 0.32, oct: 6, rivers: 4, scale: 0.22,
    settle: 12, scatter: 18, hscale: 1.0, spacing: 5, rotVar: 0.3,
    trees: 30, rocks: 10, treeSc: 1.0,
    torchN: 8, torchR: 10, shadSoft: 2, fog: 0.007,
    era: 'ancient', biome: 'coastal',
  },
  features: { shadow: true, torch: true, glow: true, godray: true, cycle: true },
  timeT: 0.75,
  cycleSpeed: 0.00015,
}

// ── SCENE OBJECTS ──
let renderer, camera, camCtrl, scene
let terrainMesh = null, waterMesh = null, riverMeshes = [], foamMesh = null
let structureGroup = null, natureGroup = null
let lights = null
let torchData = { torches: [], fires: [] }
let godRays = createGodRays(12)
const mouse = new THREE.Vector2()

let frame = 0, lastFT = performance.now(), fpsCount = 0

// ── INIT ──
function init() {
  const canvas = document.getElementById('world-canvas')
  const container = document.getElementById('worldView')

  renderer = createRenderer(canvas)
  camera = createCamera(container.clientWidth / container.clientHeight)
  camCtrl = createCameraController(camera, canvas)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2a0d05)
  scene.fog = new THREE.FogExp2(0x1a0805, 0.007)

  lights = createLights(scene)

  // Raycasting for hover
  canvas.addEventListener('mousemove', onMouseMove)

  // Resize
  window.addEventListener('resize', () => {
    resizeRenderer(renderer, camera, container)
    const grCanvas = document.getElementById('godray-canvas')
    grCanvas.width = container.clientWidth
    grCanvas.height = container.clientHeight
  })

  // Initial resize
  resizeRenderer(renderer, camera, container)
  const grCanvas = document.getElementById('godray-canvas')
  grCanvas.width = container.clientWidth
  grCanvas.height = container.clientHeight

  bindUI()
  buildWorld()
  animate()
}

// ── BUILD WORLD ──
async function buildWorld() {
  showOverlay('Building terrain...')

  const p = state.params
  const biomeCfg = BIOME_CFG[p.biome] || BIOME_CFG.coastal
  const terrainParams = {
    seed: p.seed,
    height: p.height,
    sea: p.sea,
    oct: p.oct,
    rivers: p.rivers,
    scale: biomeCfg.scale,
  }

  setOverlaySub('Computing heightmap')
  const result = generateTerrain(terrainParams)

  // Clear old terrain
  if (terrainMesh) scene.remove(terrainMesh)
  if (waterMesh) scene.remove(waterMesh)
  riverMeshes.forEach(m => scene.remove(m))
  if (foamMesh) scene.remove(foamMesh)

  terrainMesh = result.mesh
  scene.add(terrainMesh)

  setOverlaySub('Building water')
  waterMesh = buildWater(biomeCfg.waterC)
  scene.add(waterMesh)

  riverMeshes = buildRivers(result.riverPaths, terrainMesh, biomeCfg.waterC)
  riverMeshes.forEach(m => scene.add(m))

  foamMesh = buildFoam(result.heightData, terrainMesh, p.sea)
  scene.add(foamMesh)

  setOverlaySub('Placing structures')
  await placeStructuresAndNature(result)

  setOverlaySub('Placing lights')
  rebuildTorches(result.landPts)

  updateHUD()
  hideOverlay()
}

async function placeStructuresAndNature(terrainResult) {
  const p = state.params

  // Remove old
  if (structureGroup) scene.remove(structureGroup)
  if (natureGroup) scene.remove(natureGroup)

  // Structures
  const structs = placeStructures(scene, terrainMesh, terrainResult.heightData, terrainResult.landPts, {
    ...p, sea: p.sea
  })
  structureGroup = structs.group

  // Nature
  const biome = BIOME_CFG[p.biome]
  const treeBuilder = {
    coastal: buildPalm, highland: buildPine, forest: buildOak,
    desert: buildDeadTree, arctic: buildPine
  }[p.biome] || buildOak

  const nat = placeNature(scene, terrainMesh, terrainResult.heightData, terrainResult.landPts, {
    ...p, sea: p.sea
  }, treeBuilder, buildRock)
  natureGroup = nat.group

  // Update stats
  document.getElementById('st-structs').textContent = structs.count
  document.getElementById('st-trees').textContent = nat.treeCount
  document.getElementById('tb-structs').textContent = structs.count
}

function rebuildTorches(landPts) {
  removeTorches(scene, torchData.torches, torchData.fires)
  const era = ERAS[state.params.era]
  torchData = createTorches(scene, landPts || [], {
    seed: state.params.seed,
    torchN: state.params.torchN,
    torchR: state.params.torchR,
    torchColor: era?.torchColor || 0xff8822
  })
  document.getElementById('st-lights').textContent = torchData.torches.length + 2
}

// Cache terrain result for rebuilds
let lastTerrainResult = null

async function rebuildStructuresOnly() {
  if (!lastTerrainResult) return
  await placeStructuresAndNature(lastTerrainResult)
  rebuildTorches(lastTerrainResult.landPts)
}

// ── ANIMATE ──
function animate() {
  requestAnimationFrame(animate)
  frame++
  fpsCount++

  const now = performance.now()
  if (now - lastFT > 1000) {
    document.getElementById('tb-fps').textContent = fpsCount
    fpsCount = 0; lastFT = now
  }

  // Day cycle
  if (state.features.cycle) {
    state.timeT = (state.timeT + state.cycleSpeed) % 1
    document.getElementById('time-slider').value = state.timeT
  }

  // Apply time
  const timeResult = applyTime(state.timeT, lights, renderer, scene, state.features)
  document.getElementById('time-label').textContent = timeResult.label
  document.getElementById('hud-time').textContent = timeResult.timeOfDay

  // God rays
  if (state.features.godray) {
    const grCanvas = document.getElementById('godray-canvas')
    const grCtx = grCanvas.getContext('2d')
    renderGodRays(grCtx, grCanvas, godRays, timeResult.horizonProximity, timeResult.sun, timeResult.sx, timeResult.sy, camera, frame)
  } else {
    const grCanvas = document.getElementById('godray-canvas')
    grCanvas.getContext('2d').clearRect(0, 0, grCanvas.width, grCanvas.height)
  }

  // Torches
  animateTorches(torchData.torches, torchData.fires, frame, state.features, true)

  // Water
  if (waterMesh) animateWater(waterMesh, frame)
  if (foamMesh) {
    foamMesh.visible = true
    foamMesh.material.opacity = 0.3 + Math.sin(frame * 0.04) * 0.12
  }

  camCtrl.update()
  renderer.render(scene, camera)
}

// ── MOUSE HOVER ──
function onMouseMove(e) {
  const canvas = document.getElementById('world-canvas')
  const rect = canvas.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  const hit = raycastStructures(structureGroup, mouse, camera)
  const popup = document.getElementById('struct-popup')
  if (hit) {
    document.getElementById('sp-icon').textContent = hit.icon || '🏛️'
    document.getElementById('sp-name').textContent = hit.name?.replace(/_/g, ' ') || '—'
    document.getElementById('sp-type').textContent = `${(hit.cat || '').toUpperCase()} · ${hit.era || ''}`
    document.getElementById('sp-lore').textContent = hit.lore || '—'
    popup.style.left = Math.min(e.clientX + 14, window.innerWidth - 260) + 'px'
    popup.style.top = Math.max(60, e.clientY - 120) + 'px'
    popup.classList.add('show')
  } else {
    popup.classList.remove('show')
  }
}

// ── UI BINDINGS ──
function bindUI() {
  // Sliders
  const sliders = [
    ['s-seed', 'v-seed', 'seed', 0],
    ['s-height', 'v-height', 'height', 0],
    ['s-sea', 'v-sea', 'sea', 2],
    ['s-rivers', 'v-rivers', 'rivers', 0],
    ['s-settle', 'v-settle', 'settle', 0],
    ['s-scatter', 'v-scatter', 'scatter', 0],
    ['s-hscale', 'v-hscale', 'hscale', 1],
    ['s-trees', 'v-trees', 'trees', 0],
    ['s-rocks', 'v-rocks', 'rocks', 0],
    ['s-torches', 'v-torches', 'torchN', 0],
    ['s-shadsoft', 'v-shadsoft', 'shadSoft', 0],
    ['s-fog', 'v-fog', 'fog', 3],
  ]

  sliders.forEach(([id, valId, key, dec]) => {
    const el = document.getElementById(id)
    if (!el) return
    el.addEventListener('input', () => {
      const val = parseFloat(el.value)
      state.params[key] = val
      const vEl = document.getElementById(valId)
      if (vEl) vEl.textContent = val.toFixed(dec)
    })
  })

  // Fog live update
  document.getElementById('s-fog')?.addEventListener('input', e => {
    scene.fog.density = parseFloat(e.target.value)
  })

  // Shadow softness live update
  document.getElementById('s-shadsoft')?.addEventListener('input', e => {
    if (lights.sunLight) lights.sunLight.shadow.radius = parseFloat(e.target.value)
  })

  // Era select
  document.getElementById('era-select')?.addEventListener('change', e => {
    state.params.era = e.target.value
    document.getElementById('tb-era').textContent = e.target.value
    document.getElementById('hud-era').textContent = ERAS[e.target.value]?.name || e.target.value
    rebuildStructuresOnly()
  })

  // Biome select
  document.getElementById('biome-select')?.addEventListener('change', e => {
    state.params.biome = e.target.value
    document.getElementById('hud-biome').textContent = e.target.value
    buildWorld()
  })

  // Time scrubber
  document.getElementById('time-slider')?.addEventListener('input', e => {
    state.timeT = parseFloat(e.target.value)
  })

  // Camera buttons
  document.querySelectorAll('.cam-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      camCtrl.setView(btn.dataset.view)
    })
  })

  // Top bar feature toggles
  ;[
    ['btn-shadow', 'shadow'],
    ['btn-torch', 'torch'],
    ['btn-godray', 'godray'],
    ['btn-cycle', 'cycle'],
  ].forEach(([id, feat]) => {
    const btn = document.getElementById(id)
    if (!btn) return
    btn.classList.add('on')
    btn.addEventListener('click', () => {
      state.features[feat] = !state.features[feat]
      btn.classList.toggle('on', state.features[feat])
    })
  })

  document.getElementById('btn-auto')?.addEventListener('click', function() {
    camCtrl.state.auto = !camCtrl.state.auto
    this.classList.toggle('on', camCtrl.state.auto)
  })

  // Rebuild buttons
  document.getElementById('btn-regen')?.addEventListener('click', () => {
    state.params.seed = Math.floor(Math.random() * 998) + 1
    document.getElementById('s-seed').value = state.params.seed
    document.getElementById('v-seed').textContent = state.params.seed
    buildWorld()
  })

  document.getElementById('btn-rebuild-structs')?.addEventListener('click', rebuildStructuresOnly)

  // AI generation
  document.getElementById('btn-gen-world')?.addEventListener('click', genWorldFromAI)
  document.getElementById('btn-surprise')?.addEventListener('click', () => {
    const prompt = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)]
    document.getElementById('world-prompt').value = prompt
    genWorldFromAI()
  })

  // Export
  document.getElementById('btn-export')?.addEventListener('click', () => {
    const data = exportScene(state.world, structureGroup, state.params)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    a.download = `${(state.world?.name || 'world').replace(/\s+/g, '-').toLowerCase()}.kk.json`
    a.click()
  })
}

async function genWorldFromAI() {
  const prompt = document.getElementById('world-prompt')?.value?.trim()
  if (!prompt) return

  const btn = document.getElementById('btn-gen-world')
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Generating...' }
  showOverlay('AI forging world...')

  try {
    const world = await generateWorldFromPrompt(prompt)
    state.world = world
    state.params.era = world.eraStyle || 'ancient'
    state.params.biome = world.biome || 'coastal'
    state.params.seed = Math.floor(Math.random() * 998) + 1

    // Sync UI
    const eraEl = document.getElementById('era-select')
    if (eraEl) eraEl.value = state.params.era
    const biomeEl = document.getElementById('biome-select')
    if (biomeEl) biomeEl.value = state.params.biome
    document.getElementById('tb-era').textContent = state.params.era
    document.getElementById('hud-era').textContent = ERAS[state.params.era]?.name || state.params.era
    document.getElementById('hud-biome').textContent = state.params.biome
    if (world.time) {
      const timeMap = { dawn: 0.25, dusk: 0.75, noon: 0.5, night: 0.0 }
      state.timeT = timeMap[world.time] ?? 0.75
    }

    // Show world title
    const hud = document.getElementById('world-hud')
    if (hud) hud.style.opacity = '1'
    const nameEl = document.getElementById('wh-name')
    if (nameEl) nameEl.textContent = world.name
    const subEl = document.getElementById('wh-sub')
    if (subEl) subEl.textContent = `"${world.tagline}" · ${world.era}`

    await buildWorld()
  } catch (err) {
    console.error('AI generation failed:', err)
    hideOverlay()
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🌍 Generate World' }
  }
}

function updateHUD() {
  const era = state.params.era
  const biome = state.params.biome
  document.getElementById('tb-era').textContent = era
  document.getElementById('hud-era').textContent = ERAS[era]?.name || era
  document.getElementById('hud-biome').textContent = biome
}

function showOverlay(txt = 'Building...') {
  document.getElementById('gen-overlay')?.classList.add('show')
  const t = document.getElementById('gen-txt')
  if (t) t.textContent = txt
}
function setOverlaySub(txt) {
  const s = document.getElementById('gen-sub')
  if (s) s.textContent = txt
}
function hideOverlay() {
  document.getElementById('gen-overlay')?.classList.remove('show')
}

// ── START ──
init()
