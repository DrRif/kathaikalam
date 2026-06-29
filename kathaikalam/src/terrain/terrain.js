import * as THREE from 'three'
import { makeNoise, fbm, Alea } from '../utils/noise.js'

export const SEG = 140
export const SIZE = 100

export const BIOME_CFG = {
  coastal:  { scale: 0.22, height: 14, sea: 0.35, oct: 6, rivers: 4, waterC: 0x0d3a5a, treeShape: 'palm' },
  highland: { scale: 0.18, height: 28, sea: 0.15, oct: 7, rivers: 5, waterC: 0x0a2a3a, treeShape: 'pine' },
  forest:   { scale: 0.20, height: 12, sea: 0.22, oct: 7, rivers: 6, waterC: 0x0a3020, treeShape: 'oak'  },
  desert:   { scale: 0.30, height: 10, sea: 0.05, oct: 4, rivers: 1, waterC: 0x0d2a1a, treeShape: 'dead' },
  arctic:   { scale: 0.20, height: 20, sea: 0.20, oct: 5, rivers: 2, waterC: 0x8899bb, treeShape: 'pine' },
}

function getVertexColor(nh, slope) {
  const c = new THREE.Color()
  if (nh < 0.01) { c.setHex(0x061828); return c }
  if (nh < 0.06) { c.setHex(0x0d2a3d); return c }
  if (nh < 0.09) { c.setHex(0x1a4a5a); return c }
  if (nh < 0.14) { c.lerpColors(new THREE.Color(0xd4a853), new THREE.Color(0xc4986a), (nh - 0.09) / 0.05); return c }
  if (slope > 0.62) { c.setHex(0x5a4a3a); return c }
  if (nh < 0.28) { c.lerpColors(new THREE.Color(0x3a6a1a), new THREE.Color(0x2a5a10), (nh - 0.14) / 0.14); return c }
  if (nh < 0.55) { c.lerpColors(new THREE.Color(0x2a5a10), new THREE.Color(0x4a3a2a), (nh - 0.28) / 0.27); return c }
  if (nh < 0.80) { c.lerpColors(new THREE.Color(0x5a4a38), new THREE.Color(0x888070), (nh - 0.55) / 0.25); return c }
  c.lerpColors(new THREE.Color(0x888888), new THREE.Color(0xeeeeee), (nh - 0.80) / 0.2)
  return c
}

export function generateTerrain(params) {
  const { seed, height, sea, oct, rivers, scale } = params

  const noise = makeNoise(seed)
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG)
  geo.rotateX(-Math.PI / 2)

  const pos = geo.attributes.position
  const N = pos.count
  const heightData = new Float32Array(N)
  const landPts = []

  // Raw noise pass
  const rawH = new Float32Array(N)
  let minH = Infinity, maxH = -Infinity

  for (let i = 0; i < N; i++) {
    const x = pos.getX(i), z = pos.getZ(i)
    const nx = x * scale * 0.1, nz = z * scale * 0.1
    // Domain warp for naturalness
    const wx = fbm(noise, nx + 1.7, nz + 9.2, 3, 0.5, 2.0) * 0.3
    const wz = fbm(noise, nx + 8.3, nz + 2.8, 3, 0.5, 2.0) * 0.3
    let h = fbm(noise, nx + wx, nz + wz, oct, 0.5, 2.0)
    // Island mask
    const dx = x / (SIZE / 2), dz = z / (SIZE / 2)
    const dist = Math.sqrt(dx * dx + dz * dz)
    const mask = Math.max(0, 1 - Math.pow(Math.max(0, dist - 0.6) / 0.4, 2))
    h = h * mask * 0.7 + h * 0.3
    rawH[i] = h
    if (h < minH) minH = h
    if (h > maxH) maxH = h
  }

  // Normalise and set Y
  const range = maxH - minH
  for (let i = 0; i < N; i++) {
    const nh = (rawH[i] - minH) / range
    heightData[i] = nh
    const worldH = nh < sea
      ? (nh / sea) * (-1)
      : ((nh - sea) / (1 - sea)) * height
    pos.setY(i, worldH)
    if (nh > sea + 0.06 && nh < 0.65 && worldH > 0.4) {
      landPts.push({ x: pos.getX(i), y: worldH, z: pos.getZ(i) })
    }
  }

  // River erosion
  const riverPaths = []
  for (let r = 0; r < rivers; r++) {
    const rng = Alea(seed + r * 137)
    let bestIdx = -1, bestH = -1
    for (let a = 0; a < 40; a++) {
      const ix = Math.floor(rng() * (SEG + 1))
      const iz = Math.floor(rng() * (SEG + 1))
      const idx = iz * (SEG + 1) + ix
      if (idx < N && heightData[idx] > 0.55 && heightData[idx] > bestH) {
        bestH = heightData[idx]; bestIdx = idx
      }
    }
    if (bestIdx < 0) continue
    const path = [bestIdx]
    const vis = new Set([bestIdx])
    let cur = bestIdx
    for (let s = 0; s < 200; s++) {
      const cx = cur % (SEG + 1), cz = Math.floor(cur / (SEG + 1))
      let ni = -1, nh = heightData[cur]
      for (const [dx, dz] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]) {
        const nx2 = cx + dx, nz2 = cz + dz
        if (nx2 < 0 || nx2 > SEG || nz2 < 0 || nz2 > SEG) continue
        const n2 = nz2 * (SEG + 1) + nx2
        if (vis.has(n2)) continue
        if (heightData[n2] < nh) { nh = heightData[n2]; ni = n2 }
      }
      if (ni < 0 || heightData[ni] < sea) break
      vis.add(ni); path.push(ni); cur = ni
    }
    if (path.length > 5) {
      riverPaths.push(path)
      path.forEach(idx => {
        const cx2 = idx % (SEG + 1), cz2 = Math.floor(idx / (SEG + 1))
        for (let dx = -3; dx <= 3; dx++) for (let dz = -3; dz <= 3; dz++) {
          const d = Math.sqrt(dx * dx + dz * dz)
          if (d > 3) continue
          const nx3 = cx2 + dx, nz3 = cz2 + dz
          if (nx3 < 0 || nx3 > SEG || nz3 < 0 || nz3 > SEG) continue
          const ni = nz3 * (SEG + 1) + nx3
          pos.setY(ni, pos.getY(ni) - 1.5 * Math.max(0, 1 - d / 3) * 0.6)
        }
      })
    }
  }

  // Thermal erosion (2 passes)
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < N; i++) {
      const cx = i % (SEG + 1), cz = Math.floor(i / (SEG + 1))
      const ch = pos.getY(i)
      for (const [dx, dz] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nx4 = cx + dx, nz4 = cz + dz
        if (nx4 < 0 || nx4 > SEG || nz4 < 0 || nz4 > SEG) continue
        const ni = nz4 * (SEG + 1) + nx4
        const diff = ch - pos.getY(ni)
        if (diff > 0.4) {
          const mv = diff * 0.15
          pos.setY(i, ch - mv)
          pos.setY(ni, pos.getY(ni) + mv)
        }
      }
    }
  }

  geo.computeVertexNormals()
  const normals = geo.attributes.normal
  const colors = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const nh = heightData[i]
    const slope = 1 - Math.abs(normals.getY(i))
    const c = getVertexColor(nh, slope)
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }))
  mesh.receiveShadow = true
  mesh.castShadow = true

  return { mesh, heightData, landPts, riverPaths, N }
}

export function buildWater(waterC) {
  const wg = new THREE.PlaneGeometry(SIZE * 1.5, SIZE * 1.5, 28, 28)
  wg.rotateX(-Math.PI / 2)
  const mesh = new THREE.Mesh(wg, new THREE.MeshLambertMaterial({
    color: waterC, transparent: true, opacity: 0.85
  }))
  mesh.position.y = -0.3
  mesh.receiveShadow = true
  return mesh
}

export function buildRivers(riverPaths, terrainMesh, waterC) {
  const meshes = []
  const pos = terrainMesh.geometry.attributes.position
  riverPaths.forEach(path => {
    if (path.length < 3) return
    const pts = path.map(idx => {
      const x = ((idx % (SEG + 1)) / SEG - 0.5) * SIZE
      const z = (Math.floor(idx / (SEG + 1)) / SEG - 0.5) * SIZE
      return new THREE.Vector3(x, Math.max(-0.2, pos.getY(idx)) + 0.06, z)
    })
    const curve = new THREE.CatmullRomCurve3(pts)
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, path.length, 0.2, 5, false),
      new THREE.MeshLambertMaterial({ color: waterC, transparent: true, opacity: 0.9 })
    )
    meshes.push(mesh)
  })
  return meshes
}

export function buildFoam(heightData, terrainMesh, sea) {
  const pos = terrainMesh.geometry.attributes.position
  const N = pos.count
  const fp = []
  for (let i = 0; i < N; i++) {
    const nh = heightData[i]
    if (nh > sea - 0.04 && nh < sea + 0.04) {
      const x = ((i % (SEG + 1)) / SEG - 0.5) * SIZE
      const z = (Math.floor(i / (SEG + 1)) / SEG - 0.5) * SIZE
      for (let f = 0; f < 2; f++) {
        fp.push(x + (Math.random() - 0.5) * 0.8, pos.getY(i) + 0.06, z + (Math.random() - 0.5) * 0.8)
      }
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(fp), 3))
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.5 }))
}

// Helpers for structure placement
export function getGroundY(terrainMesh, heightData, x, z) {
  const ix = Math.round((x / SIZE + 0.5) * SEG)
  const iz = Math.round((z / SIZE + 0.5) * SEG)
  if (ix < 0 || ix > SEG || iz < 0 || iz > SEG) return 0
  const idx = iz * (SEG + 1) + ix
  return idx < terrainMesh.geometry.attributes.position.count
    ? terrainMesh.geometry.attributes.position.getY(idx) || 0
    : 0
}

export function isFlat(terrainMesh, x, z, radius = 2) {
  const pos = terrainMesh.geometry.attributes.position
  const samples = []
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
    const sx = x + dx * radius * 0.5, sz = z + dz * radius * 0.5
    const ix = Math.round((sx / SIZE + 0.5) * SEG)
    const iz = Math.round((sz / SIZE + 0.5) * SEG)
    if (ix < 0 || ix > SEG || iz < 0 || iz > SEG) continue
    const idx = iz * (SEG + 1) + ix
    if (idx < pos.count) samples.push(pos.getY(idx))
  }
  if (samples.length < 2) return false
  return Math.max(...samples) - Math.min(...samples) < 1.8
}

// Animate water vertices
export function animateWater(waterMesh, frame) {
  const wp = waterMesh.geometry.attributes.position
  const t = frame * 0.005
  for (let i = 0; i < wp.count; i++) {
    const x = wp.getX(i), z = wp.getZ(i)
    wp.setY(i, Math.sin(x * 0.18 + t * 1.5) * 0.08 + Math.cos(z * 0.14 + t * 1.2) * 0.06 - 0.3)
  }
  wp.needsUpdate = true
  waterMesh.geometry.computeVertexNormals()
}
