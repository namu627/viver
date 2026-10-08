import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import WatchStage from './three/WatchStage'
import Loader from './components/Loader'
import Shot from './components/Shot'
import VideoShot from './components/VideoShot'
import { NOTION_URL, EMAIL, GITHUB_URL, works, profile } from './content'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const notionHref = NOTION_URL || '#contact'
const notionTarget = NOTION_URL ? '_blank' : undefined

function Arrow() {
  return (
    <svg className="arrow" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M4 12 L12 4 M5.5 4 H12 V10.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export default function App() {
  const [sceneReady, setSceneReady] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const handleReady = useCallback(() => setSceneReady(true), [])
  const handleDone = useCallback(() => setLoaded(true), [])

  // 부드러운 스크롤 (로딩이 끝난 뒤 시작)
  useEffect(() => {
    document.documentElement.classList.toggle('is-loading', !loaded)
    if (!loaded || reducedMotion) return
    const lenis = new Lenis({ duration: 1.15 })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    window.__lenis = lenis
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      window.__lenis = null
    }
  }, [loaded])

  // 등장 애니메이션
  useEffect(() => {
    if (!loaded || reducedMotion) return
    const ctx = gsap.context(() => {
      gsap.from('[data-hero]', { y: 40, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.35 })
      gsap.from('.nav', { y: -20, autoAlpha: 0, duration: 1, ease: 'expo.out', delay: 0.6 })
      gsap.utils.toArray('.reveal-up').forEach((el) => {
        gsap.from(el, {
          y: 48, autoAlpha: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
        })
      })
    })
    return () => ctx.revert()
  }, [loaded])

  const scrollToY = (y) => {
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.8 })
    else window.scrollTo({ top: y, behavior: reducedMotion ? 'auto' : 'smooth' })
  }
  const go = (e, key) => {
    e.preventDefault()
    if (key === 'top') return scrollToY(0)
    if ((key === 'story' || key === 'why') && window.__stageJump) return scrollToY(window.__stageJump(key))
    const el = document.getElementById(key)
    if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY)
  }

  return (
    <>
      <AnimatePresence>
        {!loaded && <Loader ready={sceneReady} onDone={handleDone} reducedMotion={reducedMotion} />}
      </AnimatePresence>

      <div className="grid-overlay" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => <span key={i} />)}
      </div>
      <div className="grain" aria-hidden="true" />

      <header className="nav">
        <a href="#top" className="nav-mark" onClick={(e) => go(e, 'top')} aria-label="맨 위로">
          {/* 시계가 분해되면 N—Y → NamYuchan 으로 펼쳐진다 (--x: 0 접힘 ~ 1 펼침, WatchStage 타임라인이 조절) */}
          <span className="nm-c">N</span>
          <span className="nm-rest" aria-hidden="true">am</span>
          <span className="nm-dash" aria-hidden="true">—</span>
          <span className="nm-c">Y</span>
          <span className="nm-rest" aria-hidden="true">uchan</span>
        </a>
        <nav className="nav-pill" aria-label="주요 메뉴">
          <a href="#story" onClick={(e) => go(e, 'story')}>Story</a>
          <a href="#why" onClick={(e) => go(e, 'why')}>Why VIVER</a>
          <a href="#works" onClick={(e) => go(e, 'works')}>Works</a>
          <a href="#contact" onClick={(e) => go(e, 'contact')}>Contact</a>
        </nav>
        <a className="nav-cta" href={notionHref} target={notionTarget} rel="noreferrer">
          Notion <Arrow />
        </a>
      </header>

      <main>
        <WatchStage onReady={handleReady} loaded={loaded} reducedMotion={reducedMotion} />

        <section id="works" className="works">
          <div className="section-head reveal-up">
            <p className="eyebrow mono">Selected Works</p>
            <h2 className="display metal">이런 것들을 만들어 봤습니다.</h2>
          </div>
          <ul className="bento">
            {works.map((w) => (
              <li key={w.name} className={`card glass reveal-up ${w.size ?? ''}`}>
                {w.youtube ? (
                  <VideoShot youtube={w.youtube} label={w.name} className="card-shot" />
                ) : (
                  <Shot folder={w.folder} label={w.name} className="card-shot" />
                )}
                <div className="card-body">
                  <p className="mono card-kind">{w.kind}</p>
                  <h3>{w.name}</h3>
                  <p className="card-line">{w.line}</p>
                </div>
                <a className="card-link mono" href={w.link || notionHref} target="_blank" rel="noreferrer" aria-label={`${w.name} ${w.linkLabel || 'Notion'}에서 보기`}>
                  {w.linkLabel || 'Notion'}에서 보기 <Arrow />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section id="contact" className="contact">
          <div className="contact-inner reveal-up">
            <h2 className="display metal">자세한 기록은<br />Notion에서.</h2>
            <a className="btn-primary" href={notionHref} target={notionTarget} rel="noreferrer">
              포트폴리오 전체 보기 <Arrow />
            </a>
            <dl className="contact-list">
              <div><dt className="mono">Email</dt><dd><a href={`mailto:${EMAIL}`}>{EMAIL}</a></dd></div>
              <div><dt className="mono">GitHub</dt><dd><a href={GITHUB_URL} target="_blank" rel="noreferrer">github.com/namu627</a></dd></div>
              <div><dt className="mono">Education</dt><dd>{profile.school}</dd></div>
              <div><dt className="mono">Status</dt><dd>{profile.status}</dd></div>
            </dl>
          </div>
        </section>
      </main>

      <footer className="footer mono">
        <span>© 2026 Yuchan Nam</span>
        <span>Original 3D watch · not affiliated with any watch brand</span>
      </footer>
    </>
  )
}
