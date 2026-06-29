import * as THREE from 'three'

function M(c) { return new THREE.MeshLambertMaterial({ color: c }) }

function add(g, geo, c, x = 0, y = 0, z = 0, ry = 0) {
  const m = new THREE.Mesh(geo, M(c))
  m.position.set(x, y, z)
  if (ry) m.rotation.y = ry
  m.castShadow = true
  m.receiveShadow = true
  g.add(m)
  return m
}

function PL(g, c, x, y, z, intensity = 0.8, distance = 8) {
  const l = new THREE.PointLight(c, intensity, distance)
  l.position.set(x, y, z)
  g.add(l)
  return l
}

// ── NATURE ──
export function buildPalm(sc) {
  const g = new THREE.Group()
  add(g, new THREE.CylinderGeometry(0.06*sc, 0.1*sc, 5*sc, 8), 0x8b4513, 0, 2.5*sc, 0)
  for (let i = 0; i < 7; i++) {
    const a = i * (Math.PI * 2 / 7)
    const fr = new THREE.Mesh(new THREE.ConeGeometry(1.2*sc, 2*sc, 4), M(0x3d6b20))
    fr.position.set(Math.cos(a)*0.8*sc, 5.2*sc, Math.sin(a)*0.8*sc)
    fr.rotation.z = Math.PI/2 - 0.35; fr.rotation.y = a
    fr.castShadow = true; g.add(fr)
  }
  PL(g, 0xffcc88, 0, 4*sc, 0, 0.2, 6)
  return g
}

export function buildPine(sc) {
  const g = new THREE.Group()
  add(g, new THREE.CylinderGeometry(0.04*sc, 0.07*sc, sc*0.8, 8), 0x3a2010, 0, 0.4*sc, 0)
  for (let i = 0; i < 4; i++) {
    const t = 1 - (i / 4) * 0.5
    add(g, new THREE.ConeGeometry(1.4*sc*t, 2*sc, 8), i % 2 === 0 ? 0x1a3a0a : 0x2a4a0a, 0, (0.6 + i*1.6)*sc, 0)
  }
  return g
}

export function buildOak(sc) {
  const g = new THREE.Group()
  add(g, new THREE.CylinderGeometry(0.05*sc, 0.09*sc, 3*sc, 8), 0x5a3a10, 0, 1.5*sc, 0)
  for (const [lx, ly, lz, s] of [[0, 5.5*sc, 0, 1], [-0.8*sc, 4.5*sc, 0.5*sc, 0.75], [0.8*sc, 4.2*sc, -0.4*sc, 0.8], [0.7*sc, 3.9*sc, 0.7*sc, 0.7]]) {
    add(g, new THREE.SphereGeometry(1.8*sc*s, 8, 6), 0x2d4a10, lx, ly, lz)
  }
  return g
}

export function buildDeadTree(sc) {
  const g = new THREE.Group()
  add(g, new THREE.CylinderGeometry(0.05*sc, 0.09*sc, 4*sc, 8), 0x3a2010, 0, 2*sc, 0)
  for (const [bw, by, ra] of [[0.5, 2.4*sc, 0.4], [0.45, 2.8*sc, -0.45], [0.35, 3.2*sc, 0.35]]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.04*sc, 0.08*sc, bw*sc*2.5, 6), M(0x2a1808))
    b.position.set(Math.cos(ra)*bw*sc, by, Math.sin(ra)*bw*sc)
    b.rotation.z = ra * 0.45; b.castShadow = true; g.add(b)
  }
  return g
}

export function buildRock(sc) {
  const g = new THREE.Group()
  const dm = new THREE.Mesh(new THREE.DodecahedronGeometry((0.6 + Math.random()*0.6)*sc), M(0x7a7060))
  dm.position.y = (0.6 + Math.random()*0.4)*sc*0.8
  dm.castShadow = true; dm.receiveShadow = true; g.add(dm)
  return g
}

// ── RESIDENTIAL ──
export function buildHut(sc) {
  const g = new THREE.Group()
  add(g, new THREE.CylinderGeometry(1.8*sc, 2*sc, 1.8*sc, 10), 0x8b4513, 0, 0.9*sc, 0)
  add(g, new THREE.ConeGeometry(2.4*sc, 2.2*sc, 10), 0xb8860b, 0, 2.9*sc, 0)
  add(g, new THREE.BoxGeometry(0.7*sc, 1.4*sc, 0.2), 0x3a2010, 0, 0.7*sc, 2*sc)
  PL(g, 0xffaa44, 0, 1.5*sc, 0, 0.4, 5)
  return g
}

export function buildStilt(sc) {
  const g = new THREE.Group()
  for (const [sx, sz] of [[-1.2*sc,-1.2*sc],[1.2*sc,-1.2*sc],[-1.2*sc,1.2*sc],[1.2*sc,1.2*sc]]) {
    add(g, new THREE.CylinderGeometry(0.1, 0.12, 2.4*sc, 6), 0x5a3a10, sx, 1.2*sc, sz)
  }
  add(g, new THREE.BoxGeometry(4*sc, 2*sc, 3.6*sc), 0x8b6914, 0, 3*sc, 0)
  add(g, new THREE.BoxGeometry(4.4*sc, 0.15, 4*sc), 0x5a3a10, 0, 2*sc, 0)
  add(g, new THREE.ConeGeometry(2.6*sc, 1.4*sc, 4), 0x8b6914, 0, 4.4*sc, 0)
  PL(g, 0xffaa44, 0, 2.8*sc, 0, 0.5, 6)
  return g
}

export function buildCottage(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(5*sc, 2.8*sc, 4*sc), 0x8a7a6a, 0, 1.4*sc, 0)
  const rg = new THREE.CylinderGeometry(0.01, 3.6*sc, 2*sc, 4)
  add(g, rg, 0x5a4a3a, 0, 3.8*sc, 0)
  add(g, new THREE.BoxGeometry(0.7*sc, 2.2*sc, 0.2), 0x3a2010, 0, 1.1*sc, 2.05*sc)
  add(g, new THREE.BoxGeometry(0.4*sc, 1.4*sc, 0.4*sc), 0x8a7a6a, 0.8*sc, 3.8*sc, 0)
  PL(g, 0xff6622, 0.8*sc, 4.2*sc, 0, 0.3, 4)
  return g
}

export function buildJpHouse(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(6*sc, 3.2*sc, 5.1*sc), 0x5a3820, 0, 1.6*sc, 0)
  add(g, new THREE.CylinderGeometry(0.01, 3.9*sc, 2.7*sc, 4), 0x3a2010, 0, 4.55*sc, 0)
  add(g, new THREE.BoxGeometry(6.9*sc, 0.12*sc, 5.7*sc), 0x3a2010, 0, 3.2*sc, 0)
  for (let i = 0; i < 3; i++) add(g, new THREE.BoxGeometry(0.04*sc, 2.7*sc, 1.35*sc), 0xf0e8d0, (-1+i)*2*sc, 1.6*sc, 2.55*sc)
  PL(g, 0xffee88, 0, 1.6*sc, 0, 0.4, 5)
  return g
}

export function buildLonghouse(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(10*sc, 2.8*sc, 3*sc), 0x5a4030, 0, 1.4*sc, 0)
  for (let i = 0; i < 6; i++) {
    const t = (i/5)*10*sc - 5*sc
    const rh = 2.8 + Math.sin((i/5)*Math.PI)*0.8
    add(g, new THREE.CylinderGeometry(0.01, 1.76*sc, rh*sc, 4), 0x3a2818, t, 1.4*sc + rh*sc/2, 0)
  }
  add(g, new THREE.CylinderGeometry(0.2*sc, 0.2*sc, 0.3*sc, 8, 1, true), 0x2a1808, 0, 3.5*sc, 0)
  PL(g, 0xff6622, 0, 1.6*sc, 0, 1.2, 16)
  return g
}

export function buildDome(sc) {
  const g = new THREE.Group()
  const dg = new THREE.SphereGeometry(4.5*sc, 16, 10, 0, Math.PI*2, 0, Math.PI/2)
  const dm = new THREE.Mesh(dg, new THREE.MeshLambertMaterial({ color: 0x3a4a5a, transparent: true, opacity: 0.85 }))
  dm.castShadow = true; g.add(dm)
  add(g, new THREE.CylinderGeometry(4.5*sc, 4.68*sc, 1.2*sc, 16), 0x2a3a4a, 0, 0.6*sc, 0)
  add(g, new THREE.BoxGeometry(1.2*sc, 4*sc, 0.2), 0x2a3a4a, 0, 2*sc, 4.5*sc)
  for (let i = 0; i < 5; i++) {
    const a = i * (Math.PI*2/5)
    add(g, new THREE.BoxGeometry(0.05*sc, 4.5*sc, 0.05*sc), 0x88aacc, Math.cos(a)*4.42*sc, 2.25*sc, Math.sin(a)*4.42*sc)
  }
  PL(g, 0x88aacc, 0, 2*sc, 0, 0.8, 10)
  return g
}

export function buildShack(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(4*sc, 2.8*sc, 3*sc), 0x5a5040, 0, 1.4*sc, 0)
  const rf = new THREE.Mesh(new THREE.BoxGeometry(4.4*sc, 0.12*sc, 3.4*sc), M(0x3a3028))
  rf.position.set(0, 2.84*sc, 0); rf.rotation.x = 0.08; g.add(rf)
  add(g, new THREE.BoxGeometry(0.6*sc, 1.6*sc, 0.12*sc), 0x2a1808, 0, 1.1*sc, 1.52*sc)
  return g
}

// ── CIVIC ──
export function buildPalace(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(12*sc, 3*sc, 8.4*sc), 0xd4a853, 0, 1.5*sc, 0)
  add(g, new THREE.BoxGeometry(8.4*sc, 2.2*sc, 6*sc), 0xd4a853, 0, 4.1*sc, 0)
  add(g, new THREE.BoxGeometry(5.4*sc, 1.6*sc, 4.2*sc), 0xd4a853, 0, 6.2*sc, 0)
  add(g, new THREE.SphereGeometry(1.44*sc, 10, 8, 0, Math.PI*2, 0, Math.PI/2), 0xd4a853, 0, 7.8*sc, 0)
  for (const [tx, ty] of [[-4.56*sc, 5.5*sc],[4.56*sc, 5.5*sc]]) {
    add(g, new THREE.CylinderGeometry(0.56*sc, 0.64*sc, 6*sc, 8), 0x8b4513, tx, 3*sc, 0)
    add(g, new THREE.ConeGeometry(0.88*sc, 1.2*sc, 8), 0xcc2200, tx, ty, 0)
  }
  add(g, new THREE.BoxGeometry(2.16*sc, 3*sc, 0.24), 0x8b4513, 0, 1.5*sc, 4.24*sc)
  PL(g, 0xffaa33, 0, 5*sc, 0, 1.2, 18)
  return g
}

export function buildCastle(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(9*sc, 10.4*sc, 8.1*sc), 0x7a7060, 0, 5.2*sc, 0)
  for (const [tx, tz] of [[-4.05*sc,-3.6*sc],[4.05*sc,-3.6*sc],[-4.05*sc,3.6*sc],[4.05*sc,3.6*sc]]) {
    add(g, new THREE.CylinderGeometry(1.44*sc, 1.8*sc, 9*sc, 8), 0x5a5040, tx, 4.5*sc, tz)
    add(g, new THREE.ConeGeometry(1.98*sc, 2.7*sc, 8), 0x8B0000, tx, 10.2*sc, tz)
  }
  for (const tx of [-4.05*sc, 4.05*sc]) add(g, new THREE.BoxGeometry(0.5, 6.2*sc, 8.2*sc), 0x6a6050, tx, 3.1*sc, 0)
  for (const tz of [-3.6*sc, 3.6*sc]) add(g, new THREE.BoxGeometry(8.2*sc, 6.2*sc, 0.5), 0x6a6050, 0, 3.1*sc, tz)
  for (let i = -3; i <= 3; i++) add(g, new THREE.BoxGeometry(0.45, 0.7, 0.45), 0x7a7060, i*1.3*sc, 6.5*sc, 4.1*sc)
  PL(g, 0xff6622, 0, 4*sc, 0, 0.8, 14)
  return g
}

export function buildJpCastle(sc) {
  const g = new THREE.Group()
  for (let i = 0; i < 5; i++) {
    const t = 1 - (i/5)*0.55, th = 3.2*sc
    add(g, new THREE.BoxGeometry(12*sc*t, th, 10.2*sc*t), 0x2a2a2a, 0, i*th + th/2, 0)
    const ev = new THREE.Mesh(new THREE.BoxGeometry(12*sc*t*1.12, 0.15, 10.2*sc*t*0.95), M(0x1a1a1a))
    ev.position.set(0, i*th + th, 0); g.add(ev)
  }
  add(g, new THREE.ConeGeometry(2.16*sc, 3.2*sc, 4), 0x1a1a1a, 0, 17.6*sc, 0)
  PL(g, 0xffee88, 0, 8*sc, 0, 0.6, 14)
  return g
}

export function buildGreatHall(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(14*sc, 4.8*sc, 3.04*sc), 0x4a3020, 0, 2.4*sc, 0)
  for (let i = -4; i <= 4; i++) add(g, new THREE.CylinderGeometry(0.2*sc, 0.24*sc, 4.4*sc, 6), 0x2a1810, i*1.6*sc, 2.2*sc, 0)
  add(g, new THREE.CylinderGeometry(0.01, 4.4*sc, 4.8*sc, 4), 0x2a1810, 0, 6.8*sc, 0)
  PL(g, 0xff6622, 0, 1.6*sc, 0, 1.4, 18)
  return g
}

export function buildWatchtower(sc) {
  const g = new THREE.Group()
  add(g, new THREE.CylinderGeometry(1.4*sc, 1.68*sc, 8*sc, 10), 0x7a7060, 0, 4*sc, 0)
  add(g, new THREE.CylinderGeometry(1.68*sc, 1.68*sc, 0.4, 10), 0x5a5040, 0, 8.2*sc, 0)
  for (let i = 0; i < 7; i++) {
    const a = i*(Math.PI*2/7)
    add(g, new THREE.BoxGeometry(0.25, 0.5, 0.25), 0x7a7060, Math.cos(a)*1.52*sc, 8.5*sc, Math.sin(a)*1.52*sc)
  }
  add(g, new THREE.ConeGeometry(1.8*sc, 2.4*sc, 10), 0x8B0000, 0, 9.8*sc, 0)
  PL(g, 0xff8822, 0, 8*sc, 0, 0.5, 8)
  return g
}

export function buildCommTower(sc) {
  const g = new THREE.Group()
  add(g, new THREE.CylinderGeometry(2*sc, 2.8*sc, 11.2*sc, 8), 0x2a3a4a, 0, 5.6*sc, 0)
  add(g, new THREE.CylinderGeometry(0.96*sc, 1.44*sc, 2*sc, 6), 0x3a4a5a, 0, 12.6*sc, 0)
  add(g, new THREE.SphereGeometry(1.6*sc, 10, 8), 0x00aaff, 0, 14.6*sc, 0)
  add(g, new THREE.CylinderGeometry(0.04*sc, 0.04*sc, 3.2*sc, 4), 0x3a4a5a, 0, 16.6*sc, 0)
  PL(g, 0x00aaff, 0, 14.6*sc, 0, 2.0, 22)
  return g
}

// ── COMMERCE ──
export function buildStall(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(4*sc, 1.2*sc, 2.6*sc), 0xc45c2e, 0, 0.6*sc, 0)
  add(g, new THREE.BoxGeometry(4.8*sc, 0.15, 3.2*sc), 0xd4a853, 0, 1.4*sc, 0)
  for (const [sx, sz] of [[-2*sc, 1.7*sc],[2*sc, 1.7*sc]]) {
    add(g, new THREE.CylinderGeometry(0.05, 0.06, 1.7*sc, 5), 0x8b3a10, sx, 0.85*sc, sz)
  }
  for (let i = 0; i < 4; i++) add(g, new THREE.SphereGeometry(0.14*sc, 5, 4), 0xd4a853, (Math.random()-0.5)*2.4*sc, 0.7*sc, 0)
  PL(g, 0xffcc44, 0, 0.8*sc, 0, 0.4, 4)
  return g
}

export function buildTavern(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(8*sc, 4.8*sc, 5.6*sc), 0x6a4a28, 0, 2.4*sc, 0)
  add(g, new THREE.BoxGeometry(8.4*sc, 2.56*sc, 5.76*sc), 0x4a3018, 0, 5.44*sc, 0)
  add(g, new THREE.CylinderGeometry(0.01, 4.8*sc, 2.8*sc, 4), 0x4a3018, 0, 7.36*sc, 0)
  add(g, new THREE.BoxGeometry(0.8*sc, 0.5*sc, 0.1), 0x3a2010, 0, 4.8*sc, 2.85*sc)
  PL(g, 0xff8833, 0, 2.4*sc, 0, 0.8, 12)
  return g
}

export function buildTeaHouse(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(5*sc, 3.2*sc, 4.25*sc), 0x5a3820, 0, 1.6*sc, 0)
  add(g, new THREE.CylinderGeometry(0.01, 3.25*sc, 1.75*sc, 4), 0x3a2010, 0, 4.275*sc, 0)
  add(g, new THREE.BoxGeometry(5.75*sc, 0.1*sc, 4.75*sc), 0x3a2010, 0, 3.2*sc, 0)
  add(g, new THREE.BoxGeometry(5.75*sc, 0.12*sc, 5.5*sc), 0x5a3820, 0, 0.7*sc, 0)
  PL(g, 0xffee88, 0, 1.6*sc, 0, 0.5, 7)
  return g
}

export function buildTradingPost(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(7*sc, 3.2*sc, 4.8*sc), 0x5a4030, 0, 1.6*sc, 0)
  add(g, new THREE.BoxGeometry(7.56*sc, 0.15*sc, 5.2*sc), 0x3a2818, 0, 3.2*sc, 0)
  add(g, new THREE.CylinderGeometry(0.01, 4.96*sc, 2*sc, 4), 0x3a2818, 0, 4.2*sc, 0)
  PL(g, 0xff8822, 0, 1.6*sc, 0, 0.4, 7)
  return g
}

export function buildWarehouse(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(10*sc, 4.8*sc, 4.4*sc), 0x5a5040, 0, 2.4*sc, 0)
  const rg = new THREE.CylinderGeometry(2.8*sc, 2.8*sc, 4.8*sc, 6, 1, false, 0, Math.PI)
  rg.rotateZ(Math.PI / 2)
  add(g, rg, 0x3a3028, 0, 5.6*sc, 0)
  add(g, new THREE.BoxGeometry(2.8*sc, 4*sc, 0.15), 0x3a3028, 0, 2*sc, 2.2*sc)
  return g
}

// ── SACRED ──
export function buildGopuram(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(8*sc, 2, 5.6*sc), 0xd4aa88, 0, 1, 0)
  add(g, new THREE.BoxGeometry(6*sc, 1.8, 4.2*sc), 0xd4aa88, 0, 2.9, 0)
  for (let i = 0; i < 5; i++) {
    const t = 1 - (i/5)*0.5, th = 1.1*sc
    add(g, new THREE.BoxGeometry(5.2*t*sc, th, 4.5*t*sc), 0xd4b896, 0, 4.5 + i*th, 0)
  }
  add(g, new THREE.ConeGeometry(0.64*sc, 0.96*sc, 8), 0xd4a853, 0, 10.5*sc, 0)
  for (const [tx, ty] of [[-3.2*sc, 5*sc],[3.2*sc, 5*sc]]) {
    add(g, new THREE.CylinderGeometry(0.4*sc, 0.48*sc, 5*sc, 8), 0x8b7355, tx, 2.5*sc, 0)
    add(g, new THREE.ConeGeometry(0.56*sc, 0.8*sc, 8), 0xd4a853, tx, ty, 0)
  }
  PL(g, 0xffaa33, 0, 1.5, 0, 0.8, 12)
  PL(g, 0xff6622, 0, 6*sc, 0, 0.5, 10)
  return g
}

export function buildCathedral(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(6*sc, 11.2*sc, 4.2*sc), 0x8a8878, 0, 5.6*sc, 0)
  add(g, new THREE.BoxGeometry(12*sc, 5.4*sc, 2.4*sc), 0x8a8878, 0, 2.7*sc, 0)
  for (const tx of [-2.64*sc, 2.64*sc]) {
    add(g, new THREE.BoxGeometry(2.16*sc, 13.6*sc, 2.16*sc), 0x5a5848, tx, 6.8*sc, 2.04*sc)
    add(g, new THREE.ConeGeometry(1.44*sc, 4*sc, 8), 0x5a5848, tx, 15.6*sc, 2.04*sc)
  }
  PL(g, 0xffeedd, 0, 4*sc, 0, 0.7, 18)
  return g
}

export function buildShrine(sc) {
  const g = new THREE.Group()
  for (const tx of [-2.1*sc, 2.1*sc]) add(g, new THREE.CylinderGeometry(0.15*sc, 0.18*sc, 4.5*sc, 8), 0xd4490a, tx, 2.25*sc, 0)
  add(g, new THREE.BoxGeometry(5.1*sc, 0.22*sc, 0.22*sc), 0xd4490a, 0, 4.68*sc, 0)
  add(g, new THREE.BoxGeometry(4.2*sc, 0.18*sc, 0.18*sc), 0xd4490a, 0, 3.9*sc, 0)
  add(g, new THREE.BoxGeometry(3*sc, 3*sc, 2.4*sc), 0x2a1a0a, 0, 1.5*sc, 4.8*sc)
  add(g, new THREE.ConeGeometry(2.1*sc, 2.1*sc, 4), 0xd4490a, 0, 4*sc, 4.8*sc)
  for (const [lx, ly, lz] of [[-2.1*sc, 2.4*sc, 1.2*sc],[2.1*sc, 2.4*sc, 1.2*sc]]) {
    add(g, new THREE.BoxGeometry(0.25*sc, 0.35*sc, 0.25*sc), 0x8b4513, lx, ly, lz)
    PL(g, 0xff8822, lx, ly + 0.2, lz, 0.4, 3)
  }
  return g
}

export function buildStones(sc) {
  const g = new THREE.Group()
  const ct = 7, r = 4.5*sc
  for (let i = 0; i < ct; i++) {
    const a = (i/ct)*Math.PI*2, sh = (2.4 + Math.random()*2)*sc
    add(g, new THREE.BoxGeometry((0.4+Math.random()*0.3)*sc, sh, (0.35+Math.random()*0.25)*sc), 0x6a6060, Math.cos(a)*r, sh/2, Math.sin(a)*r, Math.random()*0.4-0.2)
  }
  add(g, new THREE.BoxGeometry(sc, 0.4*sc, 0.7*sc), 0x4a4040, 0, 0.2*sc, 0)
  PL(g, 0x8844ff, 0, sc, 0, 0.5, 8)
  return g
}

export function buildMageTower(sc) {
  const g = new THREE.Group()
  add(g, new THREE.CylinderGeometry(2.24*sc, 3.04*sc, 12*sc, 10), 0x4a2a7a, 0, 6*sc, 0)
  add(g, new THREE.CylinderGeometry(2.56*sc, 2.56*sc, 0.4*sc, 10), 0x2a1a4a, 0, 12.2*sc, 0)
  add(g, new THREE.ConeGeometry(2.56*sc, 4*sc, 10), 0x2a1a4a, 0, 14.2*sc, 0)
  for (let i = 0; i < 4; i++) {
    const a = i*(Math.PI*2/4)
    add(g, new THREE.SphereGeometry(0.28*sc, 6, 5), 0xaa66ff, Math.cos(a)*2.16*sc, (3+i*2.5)*sc, Math.sin(a)*2.16*sc)
    PL(g, 0xaa66ff, Math.cos(a)*2.16*sc, (3+i*2.5)*sc, Math.sin(a)*2.16*sc, 0.4, 3.5)
  }
  PL(g, 0xaa66ff, 0, 8*sc, 0, 1.2, 16)
  return g
}

// ── MILITARY ──
export function buildFortWall(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(14*sc, 4.8*sc, 0.6), 0x8a7060, 0, 2.4*sc, 0)
  for (let i = -5; i <= 5; i++) add(g, new THREE.BoxGeometry(0.4*sc, 1.2*sc, 0.7), 0x8a7060, i*1.3*sc, 5.4*sc, 0)
  add(g, new THREE.BoxGeometry(0.25, 4.8*sc, 0.7), 0x6a5040, -1.2*sc, 2.4*sc, 0)
  add(g, new THREE.BoxGeometry(0.25, 4.8*sc, 0.7), 0x6a5040, 1.2*sc, 2.4*sc, 0)
  return g
}

export function buildFortress(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(8.1*sc, 8.8*sc, 7.2*sc), 0x7a7060, 0, 4.4*sc, 0)
  for (const [tx, tz] of [[-3.6*sc,-3.15*sc],[3.6*sc,-3.15*sc],[-3.6*sc,3.15*sc],[3.6*sc,3.15*sc]]) {
    add(g, new THREE.CylinderGeometry(1.26*sc, 1.62*sc, 7.56*sc, 8), 0x5a5040, tx, 3.78*sc, tz)
  }
  for (const tx of [-3.78*sc, 3.78*sc]) add(g, new THREE.BoxGeometry(0.5, 5.4*sc, 7.2*sc), 0x6a6050, tx, 2.7*sc, 0)
  PL(g, 0xff6622, 0, 4*sc, 0, 0.7, 14)
  return g
}

export function buildPalisade(sc) {
  const g = new THREE.Group()
  const pc = 16
  for (let i = 0; i < pc; i++) {
    const x = (-7*sc) + (i/pc)*14*sc
    const ph = (2.8 + Math.random()*1.6)*sc
    add(g, new THREE.CylinderGeometry(0.12*sc, 0.15*sc, ph, 6), 0x4a3020, x, ph/2, 0)
    add(g, new THREE.ConeGeometry(0.14*sc, 0.35*sc, 4), 0x2a1810, x, ph, 0)
  }
  for (const hy of [1.4*sc, 2.8*sc]) add(g, new THREE.BoxGeometry(14*sc, 0.12*sc, 0.12*sc), 0x3a2818, 0, hy, 0)
  return g
}

export function buildBarrier(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(14*sc, 4*sc, 0.5), 0x2a3a4a, 0, 2*sc, 0)
  const posB = new Float32Array(80*3)
  for (let i = 0; i < 80*3; i += 3) {
    posB[i] = (Math.random()-0.5)*14*sc
    posB[i+1] = Math.random()*4*sc
    posB[i+2] = 0.26
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(posB, 3))
  g.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x0088ff, size: 0.08, transparent: true, opacity: 0.6 })))
  PL(g, 0x0088ff, 0, 2*sc, 0, 1.2, 9)
  return g
}

export function buildScrapTower(sc) {
  const g = new THREE.Group()
  add(g, new THREE.BoxGeometry(2.8*sc, 0.6*sc, 2.2*sc), 0x6a6050, 0, 0.3*sc, 0)
  for (const [sx, sz] of [[-1.12*sc,-0.88*sc],[1.12*sc,-0.88*sc],[-1.12*sc,0.88*sc],[1.12*sc,0.88*sc]]) {
    add(g, new THREE.CylinderGeometry(0.08*sc, 0.1*sc, 7.2*sc, 4), 0x4a4030, sx, 3.6*sc, sz)
  }
  add(g, new THREE.BoxGeometry(2.6*sc, 0.15*sc, 2*sc), 0x6a6050, 0, 7.2*sc, 0)
  add(g, new THREE.CylinderGeometry(0.2*sc, 0.3*sc, 0.35*sc, 8, 1, true), 0xaaaa80, 0, 7.55*sc, 0)
  PL(g, 0xff4400, 0, 7.2*sc, 0, 0.6, 7)
  return g
}

// ── RUINS ──
export function buildRuinsTemple(sc) {
  const g = new THREE.Group()
  for (const [ry, ht, ox, rz] of [[0, 3.3*sc, 0, 0.12],[Math.PI/7, 2.7*sc, 0.3*sc, -0.08],[0, 3.6*sc, -0.3*sc, 0.07]]) {
    const wl = new THREE.Mesh(new THREE.BoxGeometry(0.4*sc, ht, 4.8*sc), M(0x7a6a5a))
    wl.position.set((-0.5+ox)*4*sc, ht/2, 0); wl.rotation.y = ry; wl.rotation.z = rz
    wl.castShadow = true; g.add(wl)
  }
  for (let i = 0; i < 14; i++) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry((0.2+Math.random()*0.4)*sc), M(0x6a5a4a))
    rock.position.set((Math.random()-0.5)*7*sc, Math.random()*0.25*sc, (Math.random()-0.5)*4*sc)
    rock.rotation.set(Math.random(), Math.random(), Math.random())
    rock.castShadow = true; g.add(rock)
  }
  PL(g, 0x4400aa, 0, 0.5*sc, 0, 0.3, 7)
  return g
}

export function buildRuinsTower(sc) {
  const g = new THREE.Group()
  add(g, new THREE.CylinderGeometry(2.56*sc, 3.2*sc, 8.8*sc, 10), 0x6a6050, 0, 4.4*sc, 0)
  const bt = new THREE.Mesh(new THREE.CylinderGeometry(2.4*sc, 2.56*sc, 3.52*sc, 10), M(0x4a4030))
  bt.position.set(0.8*sc, 10*sc, 0); bt.rotation.z = 0.35; bt.castShadow = true; g.add(bt)
  for (let i = 0; i < 8; i++) {
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry((0.2+Math.random()*0.3)*sc), M(0x6a6050))
    s.position.set((Math.random()-0.5)*7.2*sc, Math.random()*0.3*sc, (Math.random()-0.5)*7.2*sc)
    s.castShadow = true; g.add(s)
  }
  return g
}

// ── LOOKUP TABLE ──
export const BUILDERS = {
  // Nature
  palm: buildPalm, pine: buildPine, oak: buildOak, dead: buildDeadTree, rock: buildRock,
  // Residential
  hut: buildHut, stilt: buildStilt, cottage: buildCottage,
  jphouse: buildJpHouse, longhouse: buildLonghouse, dome: buildDome, shack: buildShack,
  // Civic
  palace: buildPalace, castle: buildCastle, jpcastle: buildJpCastle,
  greathall: buildGreatHall, watchtower: buildWatchtower, commtower: buildCommTower,
  // Commerce
  stall: buildStall, tavern: buildTavern, teahouse: buildTeaHouse,
  tradingpost: buildTradingPost, warehouse: buildWarehouse,
  // Sacred
  gopuram: buildGopuram, cathedral: buildCathedral, shrine: buildShrine,
  stones: buildStones, magetower: buildMageTower,
  // Military
  fortwall: buildFortWall, fortress: buildFortress, palisade: buildPalisade,
  barrier: buildBarrier, scraptower: buildScrapTower,
  // Ruins
  ruinstemple: buildRuinsTemple, ruinstower: buildRuinsTower,
}
