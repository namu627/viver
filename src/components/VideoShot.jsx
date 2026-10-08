import { useState } from 'react'

// 유튜브 영상 슬롯. 처음엔 썸네일 + 재생 버튼만 보여주고(가벼움),
// 누르면 그 자리에서 유튜브 플레이어로 바뀌어 바로 재생된다.
export default function VideoShot({ youtube, label, className = '' }) {
  const [playing, setPlaying] = useState(false)
  return (
    <figure className={`shot video-shot ${className}`}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtube}?autoplay=1&rel=0&modestbranding=1`}
          title={`${label} 영상`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button type="button" className="video-poster" onClick={() => setPlaying(true)} aria-label={`${label} 영상 재생`}>
          <img src={`https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`} alt="" loading="lazy" />
          <span className="video-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
            </svg>
          </span>
          <span className="video-tag mono" aria-hidden="true">Play film</span>
        </button>
      )}
    </figure>
  )
}
