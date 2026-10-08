import { useRef, useState } from 'react'

// 프로젝트 이미지 슬롯.
// src/assets/works/<폴더>/ 에 넣은 이미지를 빌드 때 자동으로 모은다 (파일명 순서대로).
//  · 0장: 자리표시 프레임 · 1장: 그대로 표시 · 2장 이상: 좌우 슬라이드
const files = import.meta.glob('../assets/works/*/*.{jpg,jpeg,png,webp,gif,avif,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  import: 'default',
})
const byFolder = {}
Object.keys(files)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .forEach((path) => {
    const folder = path.split('/').slice(-2, -1)[0]
    ;(byFolder[folder] ??= []).push(files[path])
  })

export default function Shot({ folder, label, className = '', ...rest }) {
  const images = byFolder[folder] ?? []
  const [index, setIndex] = useState(0)
  const drag = useRef(null)
  const count = images.length

  if (count === 0) {
    return (
      <figure className={`shot ${className}`} {...rest}>
        <div className="shot-empty">
          <span className="mono">{label}</span>
          <span className="mono shot-path">src/assets/works/{folder}/</span>
        </div>
      </figure>
    )
  }

  const go = (i) => setIndex((i + count) % count)

  // 손가락·마우스로 밀어서 넘기기
  const onDown = (e) => { drag.current = { x: e.clientX, moved: 0 } }
  const onMove = (e) => { if (drag.current) drag.current.moved = e.clientX - drag.current.x }
  const onUp = () => {
    if (!drag.current) return
    const d = drag.current.moved
    drag.current = null
    if (Math.abs(d) > 40) go(index + (d < 0 ? 1 : -1))
  }

  return (
    <figure
      className={`shot gallery ${className}`}
      {...rest}
      onPointerDown={count > 1 ? onDown : undefined}
      onPointerMove={count > 1 ? onMove : undefined}
      onPointerUp={count > 1 ? onUp : undefined}
      onPointerLeave={count > 1 ? onUp : undefined}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1)
        if (e.key === 'ArrowLeft') go(index - 1)
      }}
      tabIndex={count > 1 ? 0 : undefined}
      aria-roledescription={count > 1 ? 'carousel' : undefined}
      aria-label={count > 1 ? `${label} 이미지 ${index + 1} / ${count}` : undefined}
    >
      <div className="gallery-track" style={{ transform: `translateX(${-index * 100}%)` }}>
        {images.map((src, i) => (
          <div className="gallery-slide" key={src} aria-hidden={i !== index}>
            {/* 세로 앱 화면도 잘리지 않게: 흐린 배경 + 전체가 보이는 이미지 */}
            <img className="gallery-bg" src={src} alt="" aria-hidden="true" loading="lazy" draggable={false} />
            <img className="gallery-img" src={src} alt={`${label} 화면 ${i + 1}`} loading="lazy" draggable={false} />
          </div>
        ))}
      </div>
      {count > 1 && (
        <>
          <button type="button" className="gallery-nav prev" onClick={() => go(index - 1)} aria-label="이전 이미지">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
          </button>
          <button type="button" className="gallery-nav next" onClick={() => go(index + 1)} aria-label="다음 이미지">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
          </button>
          <div className="gallery-dots" role="tablist">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`${i + 1}번째 이미지`}
                className={i === index ? 'is-on' : ''}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <span className="gallery-count mono">{String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
        </>
      )}
    </figure>
  )
}
