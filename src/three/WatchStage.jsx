import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createWatch } from './watch'
import TextShimmer from '../components/TextShimmer'
import LiveTime from '../components/LiveTime'
import { hero, overview, chapters, why } from '../content'

gsap.registerPlugin(ScrollTrigger)

// 시계 촬영 스튜디오처럼 검은 공간에 길쭉한 소프트박스만 둔 환경맵
function studioEnvironment() {
  const env = new THREE.Scene()
  env.background = new THREE.Color(0x020203)
  const box = (w, h, x, y, z, v) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(v, v, v), side: THREE.DoubleSide }),
    )
    m.position.set(x, y, z)
    m.lookAt(0, 0, 0)
    env.add(m)
  }
  box(2.2, 14, -7, 0, 3, 3.2)
  box(1.4, 14, 7, 1, -2, 2.2)
  box(14, 1.6, 0, 7, 2, 1.6)
  box(8, 3, 0, -6, 5, 0.6)
  box(2, 2, 6, 5.5, 5, 1.2)
  // 카메라 뒤쪽 큰 소프트박스 + 띠 조명: 거울 연마된 평면(케이스 윗면·러그)에 회색 반사와 하이라이트 띠를 만든다
  box(16, 9, 0, -1, 10, 0.32)
  box(16, 0.9, 0, 3.2, 9.5, 2.4)
  // 뒷면(로터·케이스백)을 볼 때를 위한 뒤쪽 소프트박스
  box(12, 6, -2, 1, -10, 0.9)
  box(10, 0.8, 0, 3, -9, 2)
  return env
}

// 챕터별로 카메라가 다가가는 거리 (작은 부품일수록 가깝게)
const FOCUS_DIST = { crystal: 16, dial: 15, case: 17, movement: 14.5, rotor: 16 }
// 같은 챕터에서 함께 또렷하게 보일 부품
const FOCUS_OWNERS = {
  crystal: ['crystal', 'bezel'],
  dial: ['dial', 'hands'],
  case: ['case'],
  movement: ['movement'],
  rotor: ['rotor'], // 케이스백은 흐리게 → 로터가 잘 보이게
}
const ALL_PARTS = ['strap', 'case', 'bezel', 'crystal', 'dial', 'hands', 'movement', 'rotor', 'caseback']
const lerp = (a, b, t) => a + (b - a) * t

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M4 12 L12 4 M5.5 4 H12 V10.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export default function WatchStage({ onReady, loaded, reducedMotion }) {
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const engineRef = useRef(null)

  // ── 3D 엔진 ─────────────────────────────────────────────
  useEffect(() => {
    let disposed = false
    let cleanup = () => {}

    const start = () => {
      if (disposed) return
      const canvas = canvasRef.current
      let renderer
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
      } catch {
        onReady?.()
        return
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05
      renderer.outputColorSpace = THREE.SRGBColorSpace

      const scene = new THREE.Scene()
      const pmrem = new THREE.PMREMGenerator(renderer)
      const envRT = pmrem.fromScene(studioEnvironment(), 0.02)
      scene.environment = envRT.texture
      scene.environmentIntensity = 1.35
      const key = new THREE.DirectionalLight(0xffffff, 3)
      key.position.set(-4, 6, 8)
      const rim = new THREE.DirectionalLight(0xdfe6ff, 2.8)
      rim.position.set(6, 2, -6)
      const fill = new THREE.DirectionalLight(0xffffff, 0.4)
      fill.position.set(0, -6, 4)
      // 뒷면 챕터 전용 조명: 카메라 쪽에서 비추고, 뒷면을 볼 때만 켜진다
      const backKey = new THREE.DirectionalLight(0xffffff, 0)
      const backRim = new THREE.DirectionalLight(0xe8ecf5, 0)
      // 분해 장면 보조광: 카메라 쪽에서 부품 앞면을 비춘다
      const explodeFill = new THREE.DirectionalLight(0xffffff, 0)
      scene.add(key, rim, fill, backKey, backRim, explodeFill)

      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200)
      const watch = createWatch()
      scene.add(watch.root)
      watch.root.rotation.order = 'ZXY'

      // 스크롤이 조절하는 상태
      const narrow = window.matchMedia('(max-width: 820px)').matches
      const S = { explode: 0, turn: 0, focus: -1, strap: 0, shiftX: narrow ? 0 : 0.2, shiftY: narrow ? 0.2 : 0 }
      const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
      let w = 1
      let h = 1
      const resize = () => {
        const r = canvas.getBoundingClientRect()
        w = Math.max(1, r.width)
        h = Math.max(1, r.height)
        renderer.setSize(w, h, false)
        camera.aspect = w / h
      }
      resize()
      window.addEventListener('resize', resize)
      const onMove = (e) => {
        pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2
        pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2
      }
      if (!reducedMotion) window.addEventListener('pointermove', onMove)

      const parts = chapters.map((c) => c.part)
      const tmp = new THREE.Vector3()
      const tgt = new THREE.Vector3()
      const camDir = new THREE.Vector3(0, 0.1, 1).normalize()
      const partCenter = (k, out) => watch.parts[k].getWorldPosition(out)

      const apply = (t) => {
        const portrait = w / h < 0.85
        pointer.x += (pointer.tx - pointer.x) * 0.05
        pointer.y += (pointer.ty - pointer.y) * 0.05

        watch.applyExplode(S.explode, S.strap)
        const root = watch.root
        // 로터·케이스백 챕터에선 시계를 뒤로 더 돌려 뒷면을 보여준다
        const backView = Math.min(1, Math.max(0, S.focus - (parts.length - 2))) * Math.min(1, Math.max(0, S.focus + 1))
        root.rotation.y = lerp(-0.24, -1.12, S.turn) - 1.5 * backView + pointer.x * 0.12
        backKey.intensity = 3.2 * backView
        backRim.intensity = 2.4 * backView
        scene.environmentIntensity = 1.35 + 0.8 * backView
        root.rotation.x = lerp(-0.16, 0.3, S.turn) + pointer.y * 0.07
        root.rotation.z = lerp(0, portrait ? -1.3 : 0.08, S.turn)
        root.position.y = reducedMotion ? 0 : Math.sin(t * 0.6) * 0.04
        root.updateMatrixWorld(true)

        // 카메라: 전체 → 포커스 부품 (소수 focus 값이면 두 부품 사이를 보간)
        const fAmt = Math.min(1, Math.max(0, S.focus + 1))
        const fc = Math.max(0, S.focus)
        const i0 = Math.min(parts.length - 1, Math.floor(fc))
        const i1 = Math.min(parts.length - 1, i0 + 1)
        const k = fc - i0
        partCenter(parts[i0], tmp)
        partCenter(parts[i1], tgt)
        tmp.lerp(tgt, k)
        const overviewCenter = new THREE.Vector3(0, 0, 0.35 * S.explode).applyMatrix4(root.matrixWorld)
        tgt.copy(overviewCenter).lerp(tmp, fAmt)
        const widthFit = Math.max(1, 0.85 / camera.aspect)
        // 키가 작은 폰(예: 360×640)이나 세로 태블릿은 아래쪽 글과 겹치지 않게 조립된 시계를 더 작게
        const heroDist = 14.5 * widthFit * (portrait && (h < 740 || w / h > 0.6) ? 1.45 : 1) // 짧은 폰·세로 태블릿
        const overviewDist = (portrait ? 22 : 27) * widthFit
        // 세로 화면에선 부품이 비스듬히 누워 가로로 길어지므로 조금 더 물러나 여백을 둔다
        const focusDist = lerp(FOCUS_DIST[parts[i0]], FOCUS_DIST[parts[i1]], k) * widthFit * (portrait ? 1.18 : 1)
        const dist = lerp(lerp(heroDist, overviewDist, S.explode), focusDist, fAmt)
        camera.position.copy(tgt).addScaledVector(camDir, dist)
        camera.lookAt(tgt)
        backKey.position.copy(camera.position).add(new THREE.Vector3(-3, 4, 0))
        explodeFill.position.copy(camera.position).add(new THREE.Vector3(2, 3, 0))
        explodeFill.intensity = 1.8 * S.explode * (1 - backView)
        backRim.position.copy(tgt).add(new THREE.Vector3(5, -2, -2))
        camera.setViewOffset(w, h, -S.shiftX * w, S.shiftY * h, w, h)
        camera.updateProjectionMatrix()

        // 포커스 아닌 부품은 흐리게
        const weight = {}
        parts.forEach((p, i) => { weight[p] = Math.max(0, 1 - Math.abs(fc - i)) })
        ALL_PARTS.forEach((p) => {
          let v = 1
          if (fAmt > 0) {
            const owner = Object.keys(FOCUS_OWNERS).find((c) => FOCUS_OWNERS[c].includes(p))
            const wv = owner ? weight[owner] : 0
            v = lerp(1, lerp(0.1, 1, wv), fAmt)
          }
          if (p === 'strap') v *= 1 - S.strap * 0.75
          watch.setPartOpacity(p, v)
        })
        watch.tick(new Date(), t)
      }

      const t0 = performance.now()
      let raf = 0
      let first = true
      let running = true
      const loop = () => {
        if (running) {
          apply((performance.now() - t0) / 1000)
          renderer.render(scene, camera)
          if (first) {
            first = false
            onReady?.()
          }
        }
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)

      engineRef.current = { S, setRunning: (v) => { running = v } }

      cleanup = () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', resize)
        window.removeEventListener('pointermove', onMove)
        envRT.dispose()
        pmrem.dispose()
        scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose()
          const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []
          ms.forEach((m) => { m.map?.dispose(); m.dispose() })
        })
        renderer.dispose()
        engineRef.current = null
      }
    }

    // 다이얼 텍스처가 웹폰트를 쓰므로 폰트 로드 후 생성
    ;(document.fonts?.ready ?? Promise.resolve()).then(start)
    return () => {
      disposed = true
      cleanup()
    }
  }, [onReady, reducedMotion])

  // ── 스크롤 타임라인 ─────────────────────────────────────
  useEffect(() => {
    if (!loaded || !engineRef.current) return
    const { S, setRunning } = engineRef.current
    const stage = stageRef.current
    const mobile = window.matchMedia('(max-width: 820px)').matches
    const side = (i) => (i % 2 === 0 ? 1 : -1) // 1: 패널 왼쪽·시계 오른쪽, -1: 반대

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray('.ch-panel')
      const dots = gsap.utils.toArray('.ch-index li')
      gsap.set(panels, { autoAlpha: 0 })
      gsap.set(['.ov-caption', '.why-panel', '.ch-index'], { autoAlpha: 0 })

      if (reducedMotion) {
        // 움직임 최소화: 분해된 정지 화면 + 모든 내용을 순서대로 노출
        Object.assign(S, { explode: 1, turn: 1, focus: -1, strap: 1, shiftX: 0 })
        stage.classList.add('is-static')
        gsap.set([panels, '.ov-caption', '.why-panel'], { autoAlpha: 1 })
        return
      }

      const CH = 1.5
      const T0 = 2.6
      const tE = T0 + chapters.length * CH
      const total = tE + 2.4
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: `+=${total * 85}%`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          onUpdate: (st) => {
            const t = st.progress * total
            const idx = Math.round((t - T0 - 0.4) / CH)
            dots.forEach((d, i) => d.classList.toggle('is-on', i === idx && t > T0 && t < tE))
          },
        },
      })

      // 1) 히어로 → 전체 분해
      // 왼쪽 위 로고: 분해와 함께 N—Y → NamYuchan, 재조립과 함께 다시 접힘 (로고는 스테이지 밖이라 요소를 직접 지정)
      const mark = document.querySelector('.nav-mark')
      if (mark) {
        tl.fromTo(mark, { '--x': 0 }, { '--x': 1, duration: 1.2, ease: 'power2.inOut' }, 0.35)
          .to(mark, { '--x': 0, duration: 1.1, ease: 'power2.inOut' }, tE + 0.25)
      }
      tl.to(['.st-hero', '.live-time'], { autoAlpha: 0, y: -40, duration: 0.6, ease: 'power1.in' }, 0)
        .to(S, { turn: 1, duration: 1.4 }, 0)
        .to(S, { explode: 1, duration: 1.4 }, 0.3)
        .to(S, { strap: 1, duration: 1 }, 0.2)
        .to(S, { shiftX: 0, shiftY: 0, duration: 1.2 }, 0.1)
        .fromTo('.ov-caption', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.4)
        .to('.ov-caption', { autoAlpha: 0, y: -24, duration: 0.4, ease: 'power1.in' }, T0 - 0.35)
        .to('.ch-index', { autoAlpha: 1, duration: 0.3 }, T0 - 0.2)

      // 2) 부품별 챕터: 카메라가 부품으로 이동하고, 패널이 좌우에서 미끄러져 들어온다
      panels.forEach((p, i) => {
        const t = T0 + i * CH
        const s = side(i)
        const from = -(mobile ? 70 : 40) * s
        tl.to(S, { focus: i, duration: 0.8 }, t)
          .to(S, { shiftX: mobile ? 0 : 0.2 * s, shiftY: mobile ? 0.17 : 0, duration: 0.8 }, t)
          .fromTo(p, { autoAlpha: 0, xPercent: from }, { autoAlpha: 1, xPercent: 0, duration: 0.55, ease: 'power3.out' }, t + 0.3)
          .fromTo(p.querySelectorAll('[data-in]'), { autoAlpha: 0, x: -24 * s }, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }, t + 0.4)
          .to(p, { autoAlpha: 0, xPercent: from * 0.6, duration: 0.35, ease: 'power2.in' }, t + CH - 0.2)
      })

      // 3) 재조립 → Why VIVER
      tl.to('.ch-index', { autoAlpha: 0, duration: 0.3 }, tE)
        .to(S, { focus: -1, duration: 1 }, tE)
        .to(S, { explode: 0, duration: 1.2 }, tE + 0.2)
        .to(S, { turn: 0, strap: 0, duration: 1.2 }, tE + 0.3)
        .to(S, { shiftX: mobile ? 0 : -0.22, shiftY: mobile ? (window.innerHeight < 740 ? 0.3 : 0.22) : 0, duration: 1.2 }, tE + 0.3)
        .fromTo('.why-panel', { autoAlpha: 0, xPercent: 30 }, { autoAlpha: 1, xPercent: 0, duration: 0.6, ease: 'power3.out' }, tE + 1.1)
        .fromTo('.why-panel [data-in]', { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, tE + 1.2)
        .to({}, { duration: 0.4 }, total - 0.4)

      // 내비게이션: 스토리/Why 위치로 바로 이동할 수 있게 스크롤 좌표 계산
      window.__stageJump = (key) => {
        const st = tl.scrollTrigger
        const at = key === 'why' ? total - 0.3 : T0 + 0.6
        return st.start + ((st.end - st.start) * at) / total
      }
      window.__stageAt = (at) => tl.scrollTrigger.start + ((tl.scrollTrigger.end - tl.scrollTrigger.start) * at) / total

      // 화면 밖에선 렌더링 중지
      ScrollTrigger.create({
        trigger: stage.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (st) => setRunning(st.isActive),
      })
    }, stage)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [loaded, reducedMotion])

  return (
    <section ref={stageRef} className="stage" id="top" aria-label="시계 부품으로 보는 남유찬">
      <canvas ref={canvasRef} className="stage-canvas" aria-hidden="true" />
      <div className="stage-vignette" aria-hidden="true" />

      <div className="st-hero">
        <p className="eyebrow mono" data-hero>{hero.eyebrow}</p>
        <h1 className="hero-title" data-hero>
          {hero.title.map((l) => <span key={l} className="metal">{l}</span>)}
        </h1>
        <div className="hero-foot" data-hero>
          <span className="hero-name">{hero.name}<span className="mono">{hero.nameEn}</span></span>
          <span className="scroll-cue mono"><TextShimmer>SCROLL</TextShimmer><i aria-hidden="true" /></span>
        </div>
      </div>
      <LiveTime />

      <div className="ov-caption">
        <p className="eyebrow mono">{overview.eyebrow}</p>
        <h2 className="display metal">{overview.title}</h2>
      </div>

      <div className="ch-layer" id="story">
        {chapters.map((c, i) => (
          <article key={c.part} className={`ch-panel glass ${i % 2 === 0 ? 'is-left' : 'is-right'}`}>
            <p className="mono ch-label" data-in><span>{String(i + 1).padStart(2, '0')}</span>{c.label}</p>
            <h2 className="ch-title" data-in>{c.title}</h2>
            <p className="ch-project mono" data-in>{c.project}</p>
          </article>
        ))}
      </div>

      <ol className="ch-index mono" aria-hidden="true">
        {chapters.map((c, i) => <li key={c.part}><span>{String(i + 1).padStart(2, '0')}</span>{c.label}</li>)}
      </ol>

      <div className="why-panel" id="why">
        <p className="eyebrow mono" data-in>{why.eyebrow}</p>
        <h2 className="display" data-in>
          {why.title.map((l) => <span key={l} className="metal">{l}</span>)}
        </h2>
        <dl className="why-points">
          {why.points.map((p) => (
            <div key={p.k} className="why-point" data-in>
              <dt className="mono">{p.k}</dt>
              <dd>{p.v}</dd>
            </div>
          ))}
        </dl>
        <a className="why-link mono" href="#works" data-in>Selected Works <Arrow /></a>
      </div>
    </section>
  )
}
