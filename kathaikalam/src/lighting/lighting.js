import * as THREE from 'three'
import { Alea } from '../utils/noise.js'

// ── SKY KEYFRAMES [t, skyR, skyG, skyB, exposure, fogR, fogG, fogB] ──
const SKY = [
  [0.00, 0.01, 0.01, 0.03, 0.18, 0.01, 0.01, 0.02],
  [0.20, 0.05, 0.03, 0.06, 0.28, 0.02, 0.01, 0.03],
  [0.25, 0.24, 0.12, 0.05, 0.60, 0.16, 0.08, 0.04],
  [0.32, 0.40, 0.28, 0.20, 0.85, 0.25, 0.18, 0.12],
  [0.50, 0.33, 0.47, 0.68, 1.10, 0.27, 0.40, 0.60],
  [0.68, 0.35, 0.30, 0.25, 0.95, 0.22, 0.18, 0.14],
  [0.75, 0.17, 0.05, 0.02, 0.78, 0.10, 0.04, 0.02],
  [0.82, 0.05, 0.03, 0.05, 0.40, 0.03, 0.02, 0.04],
  [1.00, 0.01, 0.01, 0.03, 0.18, 0.01, 0.01, 0.02],
]

// ── SUN KEYFRAMES [t, r, g, b, intensity] ──
const SUN = [
  [0.00, 0.3, 0.3, 0.5, 0.1],
  [0.20, 0.4, 0.3, 0.5, 0.2],
  [0.25, 1.0, 0.6, 0.3, 0.8],
  [0.32, 1.0, 0.8, 0.5, 1.2],
  [0.50, 1.0, 1.0, 0.95, 2.0],
  [0.68, 1.0, 0.85, 0.6, 1.4],
  [0.75, 1.0, 0.4, 0.2, 1.0],
  [0.82, 0.4, 0.2, 0.3, 0.3],
  [1.00, 0.3, 0.3, 0.5, 0.1],
]

function lerpKey(arr, t) {
  t = ((t % 1) + 1) % 1
  let i = 0
  while (i < arr.length - 1 && arr[i + 1][0] < t) i++
  const a = arr[i], b = arr[(i + 1) % arr.length]
  const at = a[0], bt = b[0] > a[0] ? b[0] : b[0] + 1
  const f = (t - at) / (bt - at + 0.0001)
  return a.slice(1).map((v, j) => v + (b[j + 1] - v) * f)
}

// ── SETUP MAIN LIGHTS ──
export function createLights(scene) {
  const sunLight = new THREE.DirectionalLight(0xffddaa, 1.2)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.set(2048, 2048)
  sunLight.shadow.camera.near = 0.5
  sunLight.shadow.camera.far = 200
  sunLight.shadow.camera.left = -60
  sunLight.shadow.camera.right = 60
  sunLight.shadow.camera.top = 60
  sunLight.shadow.camera.bottom = -60
  sunLight.shadow.bias = -0.0003
  sunLight.shadow.radius = 2
  scene.add(sunLight)

  const moonLight = new THREE.DirectionalLight(0x8899cc, 0.15)
  moonLight.castShadow = false
  scene.add(moonLight)

  const ambLight = new THREE.AmbientLight(0xffeedd, 0.4)
  scene.add(ambLight)

  const hemiLight = new THREE.HemisphereLight(0x334466, 0x112200, 0.2)
  scene.add(hemiLight)

  // Sun/moon visual spheres
  const sunSphere = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffaa })
  )
  scene.add(sunSphere)

  const moonSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.8, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xddeeff, transparent: true, opacity: 0.9 })
  )
  moonSphere.visible = false
  scene.add(moonSphere)

  // Star field
  const stg = new THREE.BufferGeometry()
  const stp = new Float32Array(2000 * 3)
  for (let i = 0; i < 2000 * 3; i++) stp[i] = (Math.random() - 0.5) * 500
  stg.setAttribute('position', new THREE.BufferAttribute(stp, 3))
  const stars = new THREE.Points(stg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.28, transparent: true, opacity: 0 }))
  scene.add(stars)

  return { sunLight, moonLight, ambLight, hemiLight, sunSphere, moonSphere, stars }
}

// ── APPLY TIME ──
export function applyTime(t, lights, renderer, scene, features) {
  const sky = lerpKey(SKY, t)
  const sun = lerpKey(SUN, t)
  const { sunLight, moonLight, ambLight, hemiLight, sunSphere, moonSphere, stars } = lights

  scene.background.setRGB(sky[0], sky[1], sky[2])
  scene.fog.color.setRGB(sky[3], sky[4], sky[5])
  renderer.toneMappingExposure = sky[6]

  // Sun arc
  const angle = (t - 0.25) * Math.PI * 2
  const sx = Math.cos(angle) * 80
  const sy = Math.sin(angle) * 80
  const sz = -20

  sunLight.position.set(sx, sy, sz)
  sunLight.color.setRGB(sun[0], sun[1], sun[2])
  sunLight.intensity = sun[3]
  sunLight.castShadow = features.shadow && sy > 5

  sunSphere.position.set(sx, sy, sz)
  sunSphere.visible = sy > -5
  sunSphere.material.color.setRGB(sun[0], sun[1], sun[2])

  // Moon
  moonLight.position.set(-sx, -sy, -sz)
  moonLight.intensity = sy < 0 ? 0.2 : 0.0
  moonSphere.position.set(-sx, -sy, -sz)
  moonSphere.visible = sy < 0

  ambLight.intensity = 0.3 * (0.15 + Math.max(0, sun[3] * 0.35))
  hemiLight.intensity = 0.15 + Math.max(0, sun[3] * 0.12)
  stars.material.opacity = Math.max(0, Math.min(0.85, -sy * 0.012))

  // Time label
  const hours = ((t * 24 + 6) % 24)
  const h = Math.floor(hours), m = Math.floor((hours - h) * 60)
  const label = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`
  const timeOfDay = t < 0.23 ? 'Night' : t < 0.27 ? 'Dawn' : t < 0.48 ? 'Morning'
    : t < 0.52 ? 'Noon' : t < 0.72 ? 'Afternoon' : t < 0.78 ? 'Dusk' : t < 0.85 ? 'Twilight' : 'Night'

  const horizonProximity = Math.max(0, 1 - Math.abs(sy) / 12)

  return { label, timeOfDay, horizonProximity, sun, sx, sy }
}

// ── TORCH LIGHTS ──
export function createTorches(scene, placedBuildings, params) {
  const { seed, torchN, torchR, torchColor } = params
  const torches = []
  const fires = []

  if (!placedBuildings.length) return { torches, fires }

  const rng = Alea(seed + 700)
  const shuffled = [...placedBuildings].sort(() => rng() - 0.5)
  const n = Math.min(torchN, shuffled.length)

  for (let i = 0; i < n; i++) {
    const pt = shuffled[i]
    if (!pt) continue
    const px = pt.x + (rng() - 0.5) * 2
    const pz = pt.z + (rng() - 0.5) * 2
    const py = pt.y || 0

    // Torch pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 2, 6),
      new THREE.MeshLambertMaterial({ color: 0x3a2010 })
    )
    pole.position.set(px, py + 1, pz)
    pole.castShadow = true
    scene.add(pole)

    // Flame
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.35, 7),
      new THREE.MeshBasicMaterial({ color: torchColor, transparent: true, opacity: 0.9 })
    )
    flame.position.set(px, py + 2.2, pz)
    scene.add(flame)

    // Point light
    const light = new THREE.PointLight(torchColor, 1.5, torchR)
    light.position.set(px, py + 2.2, pz)
    light.castShadow = false // keep perf reasonable
    scene.add(light)

    // Fire particles
    const fp = new Float32Array(24 * 3)
    for (let j = 0; j < 24 * 3; j += 3) {
      fp[j] = (rng() - 0.5) * 0.2
      fp[j + 1] = rng() * 0.4
      fp[j + 2] = (rng() - 0.5) * 0.2
    }
    const fpg = new THREE.BufferGeometry()
    fpg.setAttribute('position', new THREE.BufferAttribute(fp, 3))
    const firePts = new THREE.Points(fpg, new THREE.PointsMaterial({ color: 0xff8800, size: 0.1, transparent: true, opacity: 0.7 }))
    firePts.position.set(px, py + 2, pz)
    scene.add(firePts)
    fires.push(firePts)

    torches.push({ light, flame, pole, phase: rng() * Math.PI * 2, px, py, pz })
  }

  return { torches, fires }
}

export function removeTorches(scene, torches, fires) {
  torches.forEach(t => {
    if (t.light) scene.remove(t.light)
    if (t.flame) scene.remove(t.flame)
    if (t.pole) scene.remove(t.pole)
  })
  fires.forEach(f => scene.remove(f))
}

// ── ANIMATE TORCHES ──
export function animateTorches(torches, fires, frame, features, showFire) {
  torches.forEach((t) => {
    if (!t.light) return
    t.light.visible = features.torch
    if (!features.torch) return

    const f = frame * 0.04 + t.phase
    const flicker = 1 + (Math.sin(f) * Math.sin(f * 1.7) * Math.sin(f * 2.3 + 1)) * 0.5 * 0.4
    t.light.intensity = 1.5 * flicker
    t.light.color.setHSL(0.06 + Math.sin(f * 0.3) * 0.02, 0.9, 0.55 + Math.sin(f) * 0.05)

    if (t.flame) {
      t.flame.position.x = t.px + Math.sin(f * 0.7) * 0.04
      t.flame.rotation.z = Math.sin(f * 0.8) * 0.15
      t.flame.material.opacity = 0.7 + Math.sin(f) * 0.2
    }
  })

  fires.forEach((fp, i) => {
    fp.visible = features.torch && showFire
    if (!fp.visible) return
    const pp = fp.geometry.attributes.position
    for (let j = 1; j < pp.count * 3; j += 3) {
      pp.array[j] += 0.015
      if (pp.array[j] > 0.5) pp.array[j] = 0
    }
    pp.needsUpdate = true
    fp.material.opacity = 0.5 + Math.sin(frame * 0.05 + i) * 0.2
  })
}

// ── GOD RAYS ──
export function createGodRays(n = 12) {
  const rays = []
  for (let i = 0; i < n; i++) {
    rays.push({
      angle: (i / n) * Math.PI * 2,
      spread: (Math.random() - 0.5) * 0.5,
      width: 40 + Math.random() * 50,
      opacity: 0.2 + Math.random() * 0.4
    })
  }
  return rays
}

export function renderGodRays(ctx, canvas, rays, intensity, sun, sx, sy, camera, frame, rayIntensity = 0.6) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (intensity < 0.05) return

  // Project sun position to canvas
  const sunPos = new THREE.Vector3(sx, sy, -20)
  // We need camera for projection — pass it in
  sunPos.project(camera)
  const cx = (sunPos.x * 0.5 + 0.5) * canvas.width
  const cy = (-sunPos.y * 0.5 + 0.5) * canvas.height

  const maxLen = Math.max(canvas.width, canvas.height) * 1.5

  rays.forEach(ray => {
    const a = ray.angle + ray.spread + frame * 0.0005
    const ex = cx + Math.cos(a) * maxLen
    const ey = cy + Math.sin(a) * maxLen

    const grad = ctx.createLinearGradient(cx, cy, ex, ey)
    const r = Math.floor(sun[0] * 255)
    const g = Math.floor(sun[1] * 255)
    const b = Math.floor(sun[2] * 255)
    const alpha = ray.opacity * intensity * rayIntensity * (Math.abs(Math.sin(frame * 0.008 + ray.angle)) * 0.3 + 0.7)

    grad.addColorStop(0, `rgba(${r},${g},${b},${Math.min(0.85, alpha)})`)
    grad.addColorStop(0.3, `rgba(${r},${g},${b},${Math.min(0.3, alpha * 0.4)})`)
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`)

    const perpX = Math.sin(a) * ray.width * 0.5 * intensity
    const perpY = -Math.cos(a) * ray.width * 0.5 * intensity

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(ex + perpX, ey + perpY)
    ctx.lineTo(ex - perpX, ey - perpY)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()
  })
}
