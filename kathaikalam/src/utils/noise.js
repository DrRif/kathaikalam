// ── ALEA PRNG ──
export function Alea(seed) {
  let s0, s1, s2, c
  function mash(d) {
    d = d.toString()
    let n = 0xefc8249d
    for (let i = 0; i < d.length; i++) {
      n += d.charCodeAt(i)
      let h = 0.02519603282416938 * n
      n = h >>> 0
      h -= n
      h *= n
      n = h >>> 0
      h -= n
      n += h * 0x100000000
    }
    return (n >>> 0) * 2.3283064365386963e-10
  }
  s0 = mash(' '); s1 = mash(' '); s2 = mash(' '); c = 1
  s0 -= mash(seed); if (s0 < 0) s0 += 1
  s1 -= mash(seed); if (s1 < 0) s1 += 1
  s2 -= mash(seed); if (s2 < 0) s2 += 1
  return function () {
    const t = 2091639 * s0 + c * 2.3283064365386963e-10
    s0 = s1; s1 = s2
    return s2 = t - (c = t | 0)
  }
}

// ── PERLIN NOISE ──
export function makeNoise(seed) {
  const rng = Alea(seed)
  const perm = new Uint8Array(512)
  const p = new Uint8Array(256)
  for (let i = 0; i < 256; i++) p[i] = i
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]]
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]

  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10) }
  function lerp(a, b, t) { return a + (b - a) * t }
  function grad(h, x, y) {
    const H = h & 3
    const u = H < 2 ? x : y
    const v = H < 2 ? y : x
    return ((H & 1) ? -u : u) + ((H & 2) ? -v : v)
  }

  return function noise2D(x, y) {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    x -= Math.floor(x); y -= Math.floor(y)
    const u = fade(x), v = fade(y)
    const a = perm[X] + Y, aa = perm[a], ab = perm[a + 1]
    const b = perm[X + 1] + Y, ba = perm[b], bb = perm[b + 1]
    return lerp(
      lerp(grad(perm[aa], x, y), grad(perm[ba], x - 1, y), u),
      lerp(grad(perm[ab], x, y - 1), grad(perm[bb], x - 1, y - 1), u),
      v
    )
  }
}

// ── FRACTAL BROWNIAN MOTION ──
export function fbm(noise, x, y, octaves = 6, persistence = 0.5, lacunarity = 2.0) {
  let val = 0, amp = 1, freq = 1, max = 0
  for (let i = 0; i < octaves; i++) {
    val += noise(x * freq, y * freq) * amp
    max += amp
    amp *= persistence
    freq *= lacunarity
  }
  return val / max
}
