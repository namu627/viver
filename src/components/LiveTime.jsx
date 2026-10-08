import { useEffect, useState } from 'react'

const fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
})

// 히어로 우측 하단의 서울 시각 표시 (3D 시계와 같은 시간)
export default function LiveTime() {
  const [now, setNow] = useState(() => fmt.format(new Date()))
  useEffect(() => {
    const id = setInterval(() => setNow(fmt.format(new Date())), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <p className="live-time mono" aria-label="서울 현재 시각">
      <span>SEOUL</span>
      <time>{now}</time>
    </p>
  )
}
