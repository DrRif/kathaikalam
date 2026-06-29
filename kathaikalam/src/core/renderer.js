import * as THREE from 'three'

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance'
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.85
  renderer.physicallyCorrectLights = true
  return renderer
}

export function createCamera(aspect) {
  const camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 600)
  return camera
}

export function createCameraController(camera, canvas) {
  const state = {
    theta: 0.4,
    phi: 1.05,
    radius: 55,
    target: new THREE.Vector3(0, 2, 0),
    auto: false,
    view: 'cin'
  }

  const VIEWS = {
    cin:  { phi: 1.05, radius: 55 },
    top:  { phi: 0.06, radius: 80 },
    low:  { phi: 1.48, radius: 18 },
    fly:  { phi: 0.4,  radius: 70 },
  }

  let isDrag = false, lx = 0, ly = 0

  canvas.addEventListener('mousedown', e => {
    isDrag = true; lx = e.clientX; ly = e.clientY
    state.auto = false
  })
  window.addEventListener('mouseup', () => isDrag = false)
  window.addEventListener('mousemove', e => {
    if (!isDrag) return
    state.theta -= (e.clientX - lx) * 0.007
    state.phi = Math.max(0.05, Math.min(1.55, state.phi + (e.clientY - ly) * 0.004))
    lx = e.clientX; ly = e.clientY
  })
  canvas.addEventListener('wheel', e => {
    state.radius = Math.max(6, Math.min(120, state.radius + e.deltaY * 0.06))
    e.preventDefault()
  }, { passive: false })

  // Touch
  canvas.addEventListener('touchstart', e => {
    isDrag = true
    lx = e.touches[0].clientX; ly = e.touches[0].clientY
  })
  canvas.addEventListener('touchend', () => isDrag = false)
  canvas.addEventListener('touchmove', e => {
    state.theta -= (e.touches[0].clientX - lx) * 0.007
    state.phi = Math.max(0.05, Math.min(1.55, state.phi + (e.touches[0].clientY - ly) * 0.004))
    lx = e.touches[0].clientX; ly = e.touches[0].clientY
    e.preventDefault()
  }, { passive: false })

  function update() {
    if (state.auto) state.theta += 0.001
    camera.position.set(
      state.radius * Math.sin(state.phi) * Math.sin(state.theta) + state.target.x,
      state.radius * Math.cos(state.phi) + state.target.y,
      state.radius * Math.sin(state.phi) * Math.cos(state.theta) + state.target.z
    )
    camera.lookAt(state.target)
  }

  function setView(v) {
    state.view = v
    if (VIEWS[v]) {
      state.phi = VIEWS[v].phi
      state.radius = VIEWS[v].radius
    }
    if (v === 'fly') state.auto = true
  }

  function resize(w, h) {
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  return { state, update, setView, resize }
}

export function resizeRenderer(renderer, camera, container) {
  const w = container.clientWidth
  const h = container.clientHeight
  renderer.setSize(w, h)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}
