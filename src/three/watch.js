// 절차적 3D 시계 — 44GS 계열의 디자인 문법을 참고한 오리지널 모델 (로고 없음).
//  · 케이스: 넓고 평평한 러그가 케이스와 한 덩어리로 이어지고, 윗면은 거울 연마 평면,
//    모서리는 하나의 날카로운 챔퍼 면으로 깎은 형태
//  · 다이얼: 딥 블랙, 다이아몬드 컷 다면 인덱스, 12시 더블 인덱스, 3시 날짜창
//  · 바늘: 가운데 능선이 선 넓은 다면 바늘
// 부품은 각각 그룹으로 나뉘어 로컬 z축(다이얼 방향 +z)으로 분해된다.
import * as THREE from 'three'

const TAU = Math.PI * 2

function canvasTex(size, draw) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d'), size)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

function dialTexture() {
  return canvasTex(2048, (g, s) => {
    const c = s / 2
    // 딥 블랙 + 아주 옅은 선버스트 결
    g.fillStyle = '#050506'
    g.fillRect(0, 0, s, s)
    for (let i = 0; i < 1600; i++) {
      const a = (i / 1600) * TAU
      const sheen = Math.pow(0.5 + 0.5 * Math.cos(2 * (a - 0.7)), 3)
      g.strokeStyle = `rgba(255,255,255,${0.006 + sheen * 0.035 * Math.random()})`
      g.lineWidth = 1.3
      g.beginPath()
      g.moveTo(c, c)
      g.lineTo(c + Math.cos(a) * c, c + Math.sin(a) * c)
      g.stroke()
    }
    // 미닛 트랙: 60개 작은 눈금(5분 단위는 굵게) + 가는 테두리
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * TAU - Math.PI / 2
      const major = i % 5 === 0
      g.strokeStyle = 'rgba(232,232,236,0.85)'
      g.lineWidth = major ? 9 : 5
      g.beginPath()
      g.moveTo(c + Math.cos(a) * c * 0.968, c + Math.sin(a) * c * 0.968)
      g.lineTo(c + Math.cos(a) * c * (major ? 0.93 : 0.945), c + Math.sin(a) * c * (major ? 0.93 : 0.945))
      g.stroke()
    }
    g.strokeStyle = 'rgba(232,232,236,0.3)'
    g.lineWidth = 2.5
    g.beginPath()
    g.arc(c, c, c * 0.972, 0, TAU)
    g.stroke()
    g.fillStyle = 'rgba(236,236,240,0.9)'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = '500 30px "Inter Tight", "Helvetica Neue", Arial, sans-serif'
    g.letterSpacing = '10px'
    g.fillStyle = 'rgba(200,200,206,0.55)'
  })
}

// 가죽 스트랩: 색 맵(미세한 얼룩 + 양쪽 스티치)과 범프 맵(오돌토돌한 그레인)
function leatherTextures() {
  const W = 512
  const H = 1024
  const mk = (draw, srgb) => {
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    draw(c.getContext('2d'))
    const t = new THREE.CanvasTexture(c)
    if (srgb) t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }
  const map = mk((g) => {
    g.fillStyle = '#0a0908'
    g.fillRect(0, 0, W, H)
    for (let i = 0; i < 1500; i++) {
      const r = 4 + Math.random() * 18
      g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,245,235' : '0,0,0'},${Math.random() * 0.018})`
      g.beginPath()
      g.arc(Math.random() * W, Math.random() * H, r, 0, TAU)
      g.fill()
    }
    // 스티치: 양쪽 가장자리를 따라 짧은 실땀
    g.strokeStyle = 'rgba(120,116,110,0.7)'
    g.lineWidth = 5
    g.lineCap = 'round'
    ;[0.075, 0.925].forEach((u) => {
      for (let y = 10; y < H; y += 26) {
        g.beginPath()
        g.moveTo(u * W, y)
        g.lineTo(u * W, y + 13)
        g.stroke()
      }
    })
  }, true)
  const bump = mk((g) => {
    g.fillStyle = '#808080'
    g.fillRect(0, 0, W, H)
    for (let i = 0; i < 14000; i++) {
      const x = Math.random() * W
      const y = Math.random() * H
      const r = 1.5 + Math.random() * 4
      const v = Math.random() < 0.5 ? 150 + Math.random() * 60 : 50 + Math.random() * 40
      g.fillStyle = `rgba(${v},${v},${v},0.55)`
      g.beginPath()
      g.arc(x, y, r, 0, TAU)
      g.fill()
    }
    // 스티치 홈
    g.strokeStyle = 'rgba(40,40,40,0.9)'
    g.lineWidth = 6
    ;[0.075, 0.925].forEach((u) => {
      g.beginPath()
      g.moveTo(u * W, 0)
      g.lineTo(u * W, H)
      g.stroke()
    })
  }, false)
  return { map, bump }
}

function perlageTexture() {
  return canvasTex(1024, (g, s) => {
    g.fillStyle = '#8e8f94'
    g.fillRect(0, 0, s, s)
    const step = 46
    for (let y = -step; y < s + step; y += step * 0.72) {
      for (let x = -step; x < s + step; x += step * 0.72) {
        const gr = g.createRadialGradient(x, y, 2, x, y, step * 0.62)
        gr.addColorStop(0, 'rgba(255,255,255,0.35)')
        gr.addColorStop(0.55, 'rgba(120,120,126,0.2)')
        gr.addColorStop(1, 'rgba(40,40,44,0.35)')
        g.fillStyle = gr
        g.beginPath()
        g.arc(x, y, step * 0.6, 0, TAU)
        g.fill()
      }
    }
  })
}

function cotesTexture() {
  return canvasTex(1024, (g, s) => {
    g.fillStyle = '#b4b5ba'
    g.fillRect(0, 0, s, s)
    g.save()
    g.translate(s / 2, s / 2)
    g.rotate(-0.5)
    const w = 70
    for (let x = -s; x < s; x += w) {
      const gr = g.createLinearGradient(x, 0, x + w, 0)
      gr.addColorStop(0, 'rgba(60,60,66,0.45)')
      gr.addColorStop(0.5, 'rgba(255,255,255,0.55)')
      gr.addColorStop(1, 'rgba(60,60,66,0.45)')
      g.fillStyle = gr
      g.fillRect(x, -s, w, s * 2)
    }
    g.restore()
  })
}

function lathe(points, segments = 160) {
  const g = new THREE.LatheGeometry(points.map(([r, z]) => new THREE.Vector2(r, z)), segments)
  g.rotateX(Math.PI / 2)
  return g
}

// 한 번의 챔퍼(bevelSegments 1)로 다면 컷을 만드는 압출
function faceted(shape, depth, bevel, size = bevel) {
  return new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: size, bevelSegments: 1, curveSegments: 64,
  })
}

function gearGeometry(r, teeth, depth, windows = 5) {
  const shape = new THREE.Shape()
  const th = Math.min(0.06, r * 0.1)
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * TAU
    const a = TAU / teeth
    ;[[r - th, a0], [r, a0 + a * 0.25], [r, a0 + a * 0.5], [r - th, a0 + a * 0.75]].forEach(([rr, aa], k) => {
      const x = Math.cos(aa) * rr
      const y = Math.sin(aa) * rr
      if (i === 0 && k === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    })
  }
  shape.closePath()
  const hole = new THREE.Path()
  hole.absarc(0, 0, r * 0.1, 0, TAU, true)
  shape.holes.push(hole)
  if (r > 0.28) {
    for (let i = 0; i < windows; i++) {
      const a = (i / windows) * TAU
      const w = new THREE.Path()
      w.absarc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.2, 0, TAU, true)
      shape.holes.push(w)
    }
  }
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 6 })
}

// 44GS식 러그 (참고: 정면 사진).
//  · 케이스 바깥 벽(반지름 RW)에서 자라나오므로 베젤·다이얼 위로 올라오지 않는다
//  · 바깥 선이 끝으로 갈수록 안쪽으로 모여 러그가 점점 좁아진다
//  · 윗면은 헤어라인, 바깥 모서리는 거울 연마 경사면, 끝으로 갈수록 손목 쪽으로 휜다
// 단면(x-z)의 각 꼭짓점이 '케이스 벽 → 러그 끝'을 따라가도록 이어 붙인다.
function lugGeometry(sx, sy) {
  const N = 64
  const RW = 1.99
  const Y1 = 2.32
  const ys = (x) => Math.sqrt(Math.max(0, RW * RW - x * x)) // 케이스 벽 위의 시작점

  // 단면 꼭짓점(안쪽 아래, 안쪽 위, 경사 시작, 경사 끝, 바깥 아래)의 모서리를 둥글게 깎은 윤곽.
  // 각 점에 어느 면인지 표시해 두었다가 경사면(2)만 거울 연마 재질로 나눈다.
  const RADII = [0.035, 0.06, 0.025, 0.04, 0.06, 0.05]
  const S = 5 // 모서리당 샘플 수
  const fillet = (pts) => {
    const out = []
    const n = pts.length
    for (let c = 0; c < n; c++) {
      const P = pts[(c + n - 1) % n]
      const C = pts[c]
      const Nx = pts[(c + 1) % n]
      const d1 = [P[0] - C[0], P[1] - C[1]]
      const d2 = [Nx[0] - C[0], Nx[1] - C[1]]
      const l1 = Math.hypot(...d1)
      const l2 = Math.hypot(...d2)
      const cos = (d1[0] * d2[0] + d1[1] * d2[1]) / (l1 * l2)
      const half = Math.acos(Math.min(1, Math.max(-1, cos))) / 2
      const tl = Math.min(RADII[c] / Math.tan(half), l1 * 0.45, l2 * 0.45)
      const a = [C[0] + (d1[0] / l1) * tl, C[1] + (d1[1] / l1) * tl]
      const b = [C[0] + (d2[0] / l2) * tl, C[1] + (d2[1] / l2) * tl]
      for (let k = 0; k <= S; k++) {
        const u = k / S
        const x = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * C[0] + u * u * b[0]
        const z = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * C[1] + u * u * b[1]
        out.push({ x, z, face: u < 0.5 ? (c + n - 1) % n : c }) // 면 번호 = 그 점에서 시작하는 변
      }
    }
    return out
  }

  // 바깥 윤곽 = 둥근 몸체(원)와 러그의 직선 테이퍼를 부드럽게 합친 선(smooth max).
  // 3·9시 쪽은 몸체의 원이 그대로 보이고, 1·5시 무렵부터 러그가 자연스럽게 뻗어나와 끝까지 직선으로 좁아진다.
  const Y0 = 0.95 // 이 높이에선 러그 윤곽이 아직 몸체 안쪽 → 시작 단면이 보이지 않음
  const RC = 1.95 // 시작 바깥 반지름 ≈2.03: 몸체 윗선(≈2.02)과 거의 같은 선에서 출발
  const smax = (a, b, k) => (a + b + Math.sqrt((a - b) * (a - b) + k * k)) / 2
  const rings = []
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const y = Y0 + (Y1 - Y0) * t
    const circle = Math.sqrt(Math.max(0, RC * RC - y * y))
    const line = 1.96 - 0.62 * (y / Y1)
    const xo = smax(circle, line, 0.18)
    const zt = 0.0 - 0.17 * Math.pow(t, 1.15) // 몸체 윗선에서 끝까지 매끄럽게 낮아짐
    const zb = -0.56 + 0.14 * t
    const xi = 1.02
    const fw = 0.28 - 0.18 * t
    const fd = 0.2 - 0.1 * t
    // 바깥 옆면: 몸체 옆선처럼 가운데가 볼록하고 아래로 갈수록 안으로 말려 들어감 (몸체 쪽에서 더 크게, 끝으로 갈수록 평평)
    const bulge = 0.07 * (1 - t) * Math.min(1, t / 0.15) // 시작부에선 0 → 몸체 밖으로 튀어나오지 않음
    const zm = (zt - fd + zb) / 2
    const prof = fillet([[xi, zb], [xi, zt], [xo - fw, zt], [xo, zt - fd], [xo + bulge, zm], [xo - 0.05 - bulge * 0.5, zb]])
    // 케이스 벽 안쪽의 점은 벽 위로 밀어낸다 → 러그가 몸체 벽에서 자라나온다
    rings.push(prof.map((p) => ({ v: new THREE.Vector3(p.x, Math.max(ys(p.x), y), p.z), face: p.face })))
  }
  // 끝단도 둥글게: 단면을 중심으로 오므리며 살짝 앞으로 밀어 닫는다
  const last = rings[N]
  const cx = last.reduce((a, p) => a + p.v.x, 0) / last.length
  const cz = last.reduce((a, p) => a + p.v.z, 0) / last.length
  for (let k = 1; k <= 6; k++) {
    const ang = (k / 6) * (Math.PI / 2)
    const f = Math.cos(ang)
    rings.push(last.map((p) => ({
      v: new THREE.Vector3(cx + (p.v.x - cx) * f, p.v.y + 0.09 * Math.sin(ang), cz + (p.v.z - cz) * f),
      face: p.face,
    })))
  }

  const M = rings[0].length
  const pos = []
  rings.forEach((r) => r.forEach((p) => pos.push(p.v.x * sx, p.v.y * sy, p.v.z)))
  const flip = sx * sy < 0
  const brushed = []
  const mirror = []
  for (let j = 0; j < rings.length - 1; j++) {
    for (let i = 0; i < M; i++) {
      const i2 = (i + 1) % M
      const a = j * M + i
      const b = j * M + i2
      const c = (j + 1) * M + i
      const d = (j + 1) * M + i2
      const tri = flip ? [a, b, c, b, d, c] : [a, c, b, b, c, d]
      ;(rings[j][i].face === 2 && rings[j][i2].face === 2 ? mirror : brushed).push(...tri)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setIndex([...brushed, ...mirror])
  geo.addGroup(0, brushed.length, 0)
  geo.addGroup(brushed.length, mirror.length, 1)
  geo.computeVertexNormals()
  return geo
}

// 가죽 스트랩: 박스를 손목 곡선(z = -0.1·y²)으로 휘고 끝으로 갈수록 좁힌다
function strapGeometry(dir) {
  const L = 3.8
  const K = 72 // 길이 방향 분할
  const M = 40 // 단면 둘레 분할
  const W0 = 2.0
  const W1 = 1.6
  const TIP = 0.75 // 끝을 둥글게 마감하는 구간
  const pos = []
  const uv = []
  const idx = []
  for (let j = 0; j <= K; j++) {
    const y = (j / K) * L
    let w = W0 + (W1 - W0) * (y / L)
    const tipT = Math.max(0, (y - (L - TIP)) / TIP)
    const round = Math.sqrt(Math.max(0, 1 - tipT * tipT))
    w *= Math.max(round, 0.02)
    for (let i = 0; i <= M; i++) {
      const a = (i / M) * TAU
      const ca = Math.cos(a)
      const sa = Math.sin(a)
      const ex = 2 / 5 // 슈퍼타원: 모서리가 둥근 납작한 단면
      const x = (w / 2) * Math.sign(ca) * Math.pow(Math.abs(ca), ex)
      const edge = 1 - Math.pow((2 * x) / W0, 2) // 가장자리로 갈수록 얇게(패딩)
      const h = (0.07 + 0.05 * Math.max(0, edge)) * (0.6 + 0.4 * round)
      const z = h * Math.sign(sa) * Math.pow(Math.abs(sa), ex)
      pos.push(x, dir * y, z - 0.1 * y * y)
      uv.push(w > 0.01 ? x / w + 0.5 : 0.5, y / L) // 폭에 비례 → 스티치가 가장자리를 따라 좁아짐
    }
  }
  for (let j = 0; j < K; j++) {
    for (let i = 0; i < M; i++) {
      const a = j * (M + 1) + i
      const b = a + M + 1
      const f = [a, b, a + 1, b, b + 1, a + 1]
      idx.push(...(dir > 0 ? f : [f[0], f[2], f[1], f[3], f[5], f[4]]))
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

export function createWatch() {
  const root = new THREE.Group()
  root.scale.setScalar(0.93) // 40mm → 37mm 느낌
  const parts = {}

  const mat = {
    mirror: new THREE.MeshPhysicalMaterial({ color: 0xe8e9ec, metalness: 1, roughness: 0.08, clearcoat: 0.6, clearcoatRoughness: 0.05 }),
    facet: new THREE.MeshPhysicalMaterial({ color: 0xd4d5da, metalness: 1, roughness: 0.1 }),
    brushed: new THREE.MeshPhysicalMaterial({ color: 0xc4c5ca, metalness: 1, roughness: 0.34 }),
    brushedLug: new THREE.MeshPhysicalMaterial({ color: 0xc8c9ce, metalness: 1, roughness: 0.3, side: THREE.DoubleSide }),
    mirrorLug: new THREE.MeshPhysicalMaterial({ color: 0xe8e9ec, metalness: 1, roughness: 0.06, clearcoat: 0.6, side: THREE.DoubleSide }),
    leather: (() => {
      const { map, bump } = leatherTextures()
      return new THREE.MeshPhysicalMaterial({ map, bumpMap: bump, bumpScale: 1.4, roughness: 0.62, metalness: 0, sheen: 0.12, sheenRoughness: 0.5, sheenColor: 0x1e1c1a, side: THREE.DoubleSide })
    })(),
    satin: new THREE.MeshPhysicalMaterial({ color: 0xdcdde1, metalness: 1, roughness: 0.2, clearcoat: 0.4 }),
    applied: new THREE.MeshPhysicalMaterial({ color: 0xf2f2f5, metalness: 0.85, roughness: 0.12, clearcoat: 1 }),
    gunmetal: new THREE.MeshStandardMaterial({ color: 0x3a3b40, metalness: 1, roughness: 0.32 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1b1c1f, metalness: 0.9, roughness: 0.4 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0, opacity: 0.1, envMapIntensity: 1, depthWrite: false }),
    cotes: new THREE.MeshStandardMaterial({ map: cotesTexture(), metalness: 0.9, roughness: 0.3 }),
    perlage: new THREE.MeshStandardMaterial({
      map: (() => {
        const t = perlageTexture()
        t.wrapS = t.wrapT = THREE.RepeatWrapping // 압출 지오메트리의 UV는 실제 좌표 → 반복으로 타일링
        t.repeat.set(0.3, 0.3)
        return t
      })(),
      metalness: 0.85,
      roughness: 0.42,
    }),
    dial: new THREE.MeshPhysicalMaterial({ map: dialTexture(), metalness: 0.5, roughness: 0.3, clearcoat: 0.8 }),
    rehaut: new THREE.MeshPhysicalMaterial({ color: 0x1a1a1d, metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide }),
  }

  // ── 가죽 스트랩
  const strap = new THREE.Group()
  const sTop = new THREE.Mesh(strapGeometry(1), mat.leather)
  sTop.position.set(0, 1.98, -0.3)
  const sBot = new THREE.Mesh(strapGeometry(-1), mat.leather)
  sBot.position.set(0, -1.98, -0.3)
  strap.add(sTop, sBot)

  // ── 케이스: 헤어라인 미들 케이스 + 폴리시드 경사 띠 + 44GS식 러그
  const kase = new THREE.Group()
  kase.add(new THREE.Mesh(lathe([
    [1.74, -0.56], [1.94, -0.56], [2.01, -0.51], [2.05, -0.41], [2.065, -0.29], [2.05, -0.16], [1.74, -0.16], [1.74, -0.56],
  ]), mat.brushed))
  kase.add(new THREE.Mesh(lathe([
    [1.74, -0.16], [2.05, -0.16], [2.02, -0.05], [1.74, -0.05], [1.74, -0.16],
  ]), mat.mirror))
  ;[[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sx, sy]) => {
    const g = lugGeometry(sx, sy)
    kase.add(
      new THREE.Mesh(g, [mat.brushedLug, mat.mirrorLug]),
    )
  })
  // 크라운
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.26, 40), mat.mirror)
  crown.rotation.z = Math.PI / 2
  crown.position.set(2.22, 0, -0.33)
  kase.add(crown)
  for (let i = 0; i < 20; i++) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.032), mat.brushed)
    const a = (i / 20) * TAU
    r.position.set(2.23, Math.cos(a) * 0.202, -0.33 + Math.sin(a) * 0.202)
    r.rotation.x = a
    kase.add(r)
  }

  // ── 베젤: 높고 둥글게 솟은 거울 연마 링 + 다이얼까지 내려가는 안쪽 벽(레호) → 다이얼이 깊어 보인다
  const bezel = new THREE.Group()
  bezel.add(new THREE.Mesh(lathe([
    [1.72, 0.08], [1.72, 0.26], [1.76, 0.29], [1.84, 0.29], [1.93, 0.23], [2.0, 0.12], [2.03, 0.02], [2.02, -0.04], [1.74, -0.04], [1.72, 0.08],
  ]), mat.mirror))
  bezel.add(new THREE.Mesh(lathe([[1.7, -0.075], [1.72, 0.26], [1.725, 0.26], [1.705, -0.075], [1.7, -0.075]]), mat.rehaut))

  // ── 크리스탈: 평평한 사파이어
  const crystal = new THREE.Group()
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(1.73, 1.73, 0.04, 128), mat.glass)
  glass.rotation.x = Math.PI / 2
  crystal.add(glass)
  crystal.position.z = 0.25

  // ── 다이얼 + 다면 인덱스 + 날짜창
  const dial = new THREE.Group()
  dial.add(new THREE.Mesh(new THREE.CircleGeometry(1.8, 160), mat.dial))
  const rect = (w, h, y0 = 0) => {
    const s = new THREE.Shape()
    s.moveTo(-w / 2, y0)
    s.lineTo(w / 2, y0)
    s.lineTo(w / 2, y0 + h)
    s.lineTo(-w / 2, y0 + h)
    s.closePath()
    return s
  }
  const addIndex = (a, r, w, h, dx = 0) => {
    const m = new THREE.Mesh(faceted(rect(w, h), 0.012, 0.035, w * 0.44), mat.applied)
    m.rotation.z = -a
    m.position.set(Math.sin(a) * r, Math.cos(a) * r, 0.01)
    m.translateX(dx)
    dial.add(m)
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU
    if (i === 0) {
      addIndex(a, 1.1, 0.068, 0.48, -0.055)
      addIndex(a, 1.1, 0.068, 0.48, 0.055)
    } else {
      addIndex(a, 1.14, 0.075, i % 3 === 0 ? 0.46 : 0.42)
    }
  }
  dial.position.z = -0.08
  dial.scale.setScalar(0.95) // 다이얼 반지름 1.71 = 베젤 안쪽 벽 바닥(1.7)과 맞춤

  // ── 바늘: 도피네(칼침) 형태. 중심 가까이에서 가장 넓고 끝으로 뾰족해지며, 챔퍼로 가운데 능선을 세운다
  // 마름모의 좌우 꼭짓점을 y=0에 두어, 두 대각선의 교점이 곧 회전축(원점)이 되게 한다
  const handShape = (len, w, tail) => {
    const s = new THREE.Shape()
    s.moveTo(0, -tail)
    s.lineTo(w / 2, 0)
    s.lineTo(0, len)
    s.lineTo(-w / 2, 0)
    s.closePath()
    return s
  }
  const hands = {}
  hands.hour = new THREE.Mesh(faceted(handShape(1.04, 0.19, 0.26), 0.006, 0.03, 0.03), mat.applied)
  hands.minute = new THREE.Mesh(faceted(handShape(1.58, 0.19, 0.3), 0.006, 0.03, 0.03), mat.applied)
  hands.minute.position.z = 0.06
  const sec = new THREE.Group()
  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.018, 1.68, 0.012), mat.applied)
  needle.position.y = 0.79
  // 꼬리: 축에서 가늘게 출발해 끝에서 둥글게 부풀었다 닫히는 눈물방울
  // 꼬리: 축에서 서서히 넓어지다가 끝을 반원으로 둥글게 마감
  const tearShape = new THREE.Shape()
  const TL = 0.4
  const RE = 0.028
  tearShape.moveTo(-0.009, 0)
  tearShape.lineTo(0.009, 0)
  tearShape.lineTo(RE, -(TL - RE))
  tearShape.absarc(0, -(TL - RE), RE, 0, -Math.PI, true)
  tearShape.lineTo(-0.009, 0)
  const weight = new THREE.Mesh(new THREE.ExtrudeGeometry(tearShape, { depth: 0.012, bevelEnabled: false }), mat.applied)
  weight.position.z = -0.006
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 32), mat.mirror)
  cap.rotation.x = Math.PI / 2
  sec.add(needle, weight, cap)
  sec.position.z = 0.1
  hands.second = sec
  const handGroup = new THREE.Group()
  handGroup.add(hands.hour, hands.minute, hands.second)
  handGroup.position.z = -0.03
  handGroup.scale.setScalar(0.95)

  // ── 무브먼트
  const movement = new THREE.Group()
  // 지판: 밸런스 휠 자리에 구멍 → 뒤(케이스백 쪽)에서 밸런스가 들여다보인다
  const plateShape = new THREE.Shape()
  plateShape.absarc(0, 0, 1.7, 0, TAU, false)
  const balanceHole = new THREE.Path()
  balanceHole.absarc(-0.9, -0.82, 0.42, 0, TAU, true)
  plateShape.holes.push(balanceHole)
  const plateGeo = new THREE.ExtrudeGeometry(plateShape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2, curveSegments: 96 })
  plateGeo.translate(0, 0, -0.05)
  const plate = new THREE.Mesh(plateGeo, mat.perlage)
  plate.position.z = -0.02
  movement.add(plate)
  const gears = []
  ;[
    { r: 0.62, t: 64, x: -0.55, y: 0.55, z: 0.03, speed: 0.08, m: mat.brushed },
    { r: 0.42, t: 48, x: 0.42, y: 0.62, z: 0.06, speed: -0.2, m: mat.gunmetal },
    { r: 0.32, t: 40, x: 0.78, y: 0.0, z: 0.03, speed: 0.45, m: mat.brushed },
    { r: 0.26, t: 32, x: 0.3, y: -0.35, z: 0.07, speed: -0.9, m: mat.gunmetal },
    { r: 0.2, t: 15, x: -0.18, y: -0.05, z: 0.09, speed: 1.6, m: mat.brushed },
  ].forEach((d) => {
    const g = new THREE.Mesh(gearGeometry(d.r, d.t, 0.04), d.m)
    g.position.set(d.x, d.y, d.z)
    g.userData = { speed: d.speed, baseZ: d.z }
    const arbor = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 12), mat.dark)
    arbor.rotation.x = Math.PI / 2
    g.add(arbor)
    movement.add(g)
    gears.push(g)
  })
  const balance = new THREE.Group()
  balance.add(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.028, 12, 64), mat.mirror))
  for (let i = 0; i < 2; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.025, 0.02), mat.mirror)
    spoke.rotation.z = (i * Math.PI) / 2
    balance.add(spoke)
  }
  const spiral = []
  for (let i = 0; i <= 300; i++) {
    const a = i * 0.12
    const r = 0.04 + i * 0.0008
    spiral.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0.02))
  }
  balance.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spiral), 400, 0.0035, 5), mat.applied))
  balance.position.set(-0.9, -0.82, 0.1)
  balance.userData.baseZ = 0.1
  movement.add(balance)
  // 태엽통 위 래칫 휠(거울) + 크라운 휠 + 작은 톱니들
  ;[
    { r: 0.48, t: 72, x: -0.55, y: 0.55, z: 0.1, speed: -0.03, m: mat.mirror },
    { r: 0.22, t: 28, x: -0.02, y: 1.08, z: 0.1, speed: 0.07, m: mat.mirror },
    { r: 0.17, t: 20, x: 0.98, y: -0.48, z: 0.05, speed: -1.2, m: mat.brushed },
    { r: 0.14, t: 16, x: 0.12, y: 0.25, z: 0.12, speed: 2.1, m: mat.gunmetal },
    { r: 0.3, t: 36, x: -0.2, y: -0.75, z: 0.04, speed: 0.6, m: mat.brushed },
  ].forEach((d) => {
    const g = new THREE.Mesh(gearGeometry(d.r, d.t, 0.03), d.m)
    g.position.set(d.x, d.y, d.z)
    g.userData = { speed: d.speed, baseZ: d.z }
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(d.r * 0.22, d.r * 0.22, 0.05, 20), mat.mirror)
    cap.rotation.x = Math.PI / 2
    cap.position.z = 0.03
    g.add(cap)
    movement.add(g)
    gears.push(g)
  })
  // 브릿지 나사(일자 홈) + 주얼
  const screwGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.03, 20)
  const slotGeo = new THREE.BoxGeometry(0.08, 0.012, 0.012)
  ;[[-1.3, -0.4], [-0.95, -1.1], [-0.2, -1.45], [0.6, -1.3], [-1.45, 0.3], [1.3, 0.55]].forEach(([x, y], i) => {
    const sc = new THREE.Mesh(screwGeo, mat.mirror)
    sc.rotation.x = Math.PI / 2
    sc.position.set(x, y, 0.135)
    const slot = new THREE.Mesh(slotGeo, mat.dark)
    slot.position.set(x, y, 0.152)
    slot.rotation.z = i * 0.7
    movement.add(sc, slot)
  })
  const jewelMat = new THREE.MeshPhysicalMaterial({ color: 0x2a2a30, metalness: 0.2, roughness: 0.05, clearcoat: 1 })
  ;[[0.42, 0.62], [0.78, 0], [0.3, -0.35], [-0.18, -0.05], [-0.2, -0.75]].forEach(([x, y]) => {
    const j = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 20), jewelMat)
    j.rotation.x = Math.PI / 2
    j.position.set(x, y, 0.16)
    movement.add(j)
  })
  movement.rotation.z = Math.PI
  movement.position.z = -0.3

  // ── 로터
  // 로터: 무게추(호 형태, 양끝 둥글게) + 허브에서 뻗어나가 넓어지는 곡선 암(가운데 창) + 허브
  const rotor = new THREE.Group()
  const RO = 1.64
  const RI = 1.22
  const A0 = Math.PI * 0.12
  const A1 = Math.PI * 0.88
  // 단면(r, z): 안쪽은 두껍고 바깥 끝은 칼날처럼 얇아진다
  const blade = [[RI, -0.04], [RI, 0.05], [RI + 0.12, 0.06], [RO - 0.02, 0.008], [RO, 0], [RO - 0.02, -0.008], [RI + 0.12, -0.045]]
  const SEG = 96
  const bpos = []
  const bidx = []
  for (let k = 0; k <= SEG; k++) {
    const a = A0 + ((A1 - A0) * k) / SEG
    blade.forEach(([r, z]) => bpos.push(Math.cos(a) * r, Math.sin(a) * r, z))
  }
  const BP = blade.length
  for (let k = 0; k < SEG; k++) {
    for (let j = 0; j < BP; j++) {
      const a = k * BP + j
      const b = k * BP + ((j + 1) % BP)
      bidx.push(a, b, a + BP, b, b + BP, a + BP)
    }
  }
  // 양끝 마개 (반지름 방향 직선 단면)
  ;[0, SEG].forEach((k) => {
    for (let j = 1; j < BP - 1; j++) bidx.push(k * BP, k * BP + j, k * BP + j + 1)
  })
  const bladeGeo = new THREE.BufferGeometry()
  bladeGeo.setAttribute('position', new THREE.Float32BufferAttribute(bpos, 3))
  bladeGeo.setIndex(bidx)
  bladeGeo.computeVertexNormals()
  const rotorMat = mat.mirror.clone()
  rotorMat.side = THREE.DoubleSide
  rotorMat.roughness = 0.22 // 거울보다 살짝 거칠게 → 조명 하이라이트가 넓게 맺혀 형태가 드러남
  rotor.add(new THREE.Mesh(bladeGeo, rotorMat))
  // 도끼날처럼 허브에서 넓어지는 암 + 가운데 날렵한 창 두 개
  const arm = new THREE.Shape()
  const B0 = Math.PI * 0.22
  const B1 = Math.PI * 0.78
  arm.moveTo(Math.cos(B0 - 0.9) * 0.22, Math.sin(B0 - 0.9) * 0.22)
  arm.quadraticCurveTo(Math.cos(B0) * 0.75, Math.sin(B0) * 0.75 - 0.05, Math.cos(B0) * (RI + 0.06), Math.sin(B0) * (RI + 0.06))
  arm.absarc(0, 0, RI + 0.06, B0, B1, false)
  arm.quadraticCurveTo(Math.cos(B1) * 0.75, Math.sin(B1) * 0.75 - 0.05, Math.cos(B1 + 0.9) * 0.22, Math.sin(B1 + 0.9) * 0.22)
  arm.absarc(0, 0, 0.22, B1 + 0.9, B0 - 0.9 + TAU, false)
  ;[-1, 1].forEach((side) => {
    const w = new THREE.Path()
    const c0 = Math.PI / 2 + side * 0.05
    const c1 = Math.PI / 2 + side * 0.42
    w.moveTo(Math.cos(c0) * 0.42, Math.sin(c0) * 0.42)
    w.lineTo(Math.cos(c0) * (RI - 0.12), Math.sin(c0) * (RI - 0.12))
    w.absarc(0, 0, RI - 0.12, c0, c1, side < 0)
    w.lineTo(Math.cos(c1) * 0.62, Math.sin(c1) * 0.62)
    w.closePath()
    arm.holes.push(w)
  })
  const armMesh = new THREE.Mesh(faceted(arm, 0.04, 0.015, 0.015), rotorMat)
  armMesh.position.z = 0.012
  rotor.add(armMesh)
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.09, 40), mat.mirror)
  hub.rotation.x = Math.PI / 2
  hub.position.z = 0.04
  rotor.add(hub)
  const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 24), mat.gunmetal)
  screw.rotation.x = Math.PI / 2
  screw.position.z = -0.01
  rotor.add(screw)
  rotor.position.z = -0.5

  // ── 케이스백
  const caseback = new THREE.Group()
  // 납작한 링(헤어라인) + 안쪽 폴리시드 테두리 + 디스플레이 사파이어
  caseback.add(new THREE.Mesh(lathe([
    [1.28, 0], [1.97, 0], [1.96, -0.04], [1.9, -0.08], [1.28, -0.08], [1.28, 0],
  ]), mat.brushed))
  caseback.add(new THREE.Mesh(lathe([[1.22, -0.01], [1.3, -0.01], [1.3, -0.085], [1.22, -0.07], [1.22, -0.01]]), mat.mirror))
  const backGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(1.24, 1.24, 0.045, 96),
    new THREE.MeshPhysicalMaterial({ color: 0xdfe6ee, metalness: 0, roughness: 0.02, opacity: 0.22, clearcoat: 1, envMapIntensity: 2, depthWrite: false }),
  )
  backGlass.rotation.x = Math.PI / 2
  backGlass.position.z = -0.04
  caseback.add(backGlass)
  caseback.position.z = -0.6

  Object.assign(parts, { strap, case: kase, bezel, crystal, dial, hands: handGroup, movement, rotor, caseback })
  // 분해 시 이동 거리 (+z: 다이얼 쪽)
  const EXPLODE = {
    crystal: 5.4, bezel: 4.3, hands: 3.2, dial: 2.0, case: 0, strap: 0,
    movement: -1.9, rotor: -3.4, caseback: -4.7,
  }
  Object.entries(parts).forEach(([k, obj]) => {
    obj.userData.baseZ = obj.position.z
    obj.userData.explodeZ = EXPLODE[k]
    root.add(obj)
  })

  // 포커스 연출용: 부품별로 재질을 복제해 투명도를 따로 조절한다
  const partMats = {}
  Object.entries(parts).forEach(([k, obj]) => {
    const cache = new Map()
    partMats[k] = []
    obj.traverse((o) => {
      if (!o.isMesh) return
      const swap = (m) => {
        if (!cache.has(m)) {
          const c = m.clone()
          c.transparent = true
          c.userData.baseOpacity = m.opacity
          cache.set(m, c)
          partMats[k].push(c)
        }
        return cache.get(m)
      }
      o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material)
    })
  })

  function setPartOpacity(k, v) {
    partMats[k].forEach((m) => {
      m.opacity = m.userData.baseOpacity * v
      m.depthWrite = m.userData.baseOpacity >= 1 && v > 0.6
    })
  }

  function applyExplode(e, strapOut) {
    // 분해되면 베젤이 검은 배경만 비춰 까맣게 보이므로, 표면을 살짝 거칠게 해 조명을 받게 한다
    partMats.bezel.forEach((m) => { if (m.metalness === 1) m.roughness = 0.08 + 0.2 * e })
    Object.values(parts).forEach((obj) => {
      obj.position.z = obj.userData.baseZ + obj.userData.explodeZ * e
    })
    // 톱니는 판 위에 층층이 살짝만 떠오른다 (따로 놀지 않게)
    // 톱니는 판에서 떨어져 서로 다른 높이로 층을 이룬다 (케이스까지는 닿지 않게)
    gears.forEach((g, i) => { g.position.z = g.userData.baseZ + e * (0.35 + ((i * 3) % 5) * 0.13) })
    balance.position.z = balance.userData.baseZ + e * 0.1 // 구멍 바로 위에 머물러 뒤에서 들여다보이게
    sTop.position.y = 1.98 + strapOut * 2.4
    sBot.position.y = -1.98 - strapOut * 2.4
  }

  function tick(now, t) {
    const s = now.getSeconds() + now.getMilliseconds() / 1000
    const m = now.getMinutes() + s / 60
    const h = (now.getHours() % 12) + m / 60
    hands.second.rotation.z = -(s / 60) * TAU
    hands.minute.rotation.z = -(m / 60) * TAU
    hands.hour.rotation.z = -(h / 12) * TAU
    gears.forEach((g) => { g.rotation.z = t * g.userData.speed })
    balance.rotation.z = Math.sin(t * TAU * 3) * 1.4
    rotor.rotation.z = Math.sin(t * 0.35) * 0.9 + t * 0.05
  }

  return { root, parts, applyExplode, setPartOpacity, tick }
}
