import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'

// 단순한 와인딩 로더: 얇은 링 + 12개 눈금 + 바늘 하나 + 크라운.
// 크라운을 감을수록 링이 채워지고, 3D 씬이 준비돼야 100%가 된다.
const MIN_MS = 2200
const TICKS = Array.from({ length: 12 }, (_, i) => i)

export default function Loader({ ready, onDone, reducedMotion }) {
  const [p, setP] = useState(0)
  const pRef = useRef(0)
  const readyRef = useRef(ready)
  useEffect(() => { readyRef.current = ready }, [ready])

  useEffect(() => {
    const t0 = performance.now()
    let raf = 0
    const step = (now) => {
      const timeFrac = Math.min(1, (now - t0) / (reducedMotion ? 500 : MIN_MS))
      const target = readyRef.current ? timeFrac : Math.min(timeFrac, 0.85)
      pRef.current += (target - pRef.current) * 0.08
      if (target === 1 && pRef.current > 0.995) pRef.current = 1
      setP(pRef.current)
      if (pRef.current === 1) {
        setTimeout(onDone, reducedMotion ? 100 : 350)
        return
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [onDone, reducedMotion])

  const pct = Math.round(p * 100)
  return (
    <motion.div
      className="loader"
      role="status"
      aria-label={`로딩 중 ${pct}%`}
      exit={{ clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }}
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      <motion.svg
        className="loader-dial"
        viewBox="-110 -110 230 220"
        exit={{ scale: 0.92, opacity: 0, transition: { duration: 0.4, ease: 'easeIn' } }}
      >
        <circle r="96" className="ld-ring" />
        <circle r="96" className="ld-arc" pathLength="1" strokeDashoffset={1 - p} />
        {TICKS.map((i) => (
          <line key={i} x1="0" y1="-86" x2="0" y2={i % 3 === 0 ? -74 : -80} transform={`rotate(${i * 30})`} className="ld-tick" />
        ))}
        <line x1="0" y1="12" x2="0" y2="-80" className="ld-hand" transform={`rotate(${p * 720})`} />
        <circle r="3" className="ld-pin" />
        {/* 크라운: 홈이 위로 흘러 감기는 느낌 */}
        <g transform="translate(100 0)">
          <rect x="0" y="-9" width="9" height="18" rx="2" className="ld-crown" />
          {[0, 1, 2].map((k) => (
            <line key={k} x1="1.5" x2="7.5" y1={((k * 6 - p * 160) % 18 + 18) % 18 - 9} y2={((k * 6 - p * 160) % 18 + 18) % 18 - 9} className="ld-groove" />
          ))}
        </g>
      </motion.svg>
      <p className="loader-label mono">Winding <span>{String(pct).padStart(2, '0')}</span></p>
    </motion.div>
  )
}
