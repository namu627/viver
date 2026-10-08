import { motion } from 'motion/react'

// 21st.dev "Text Shimmer"(ibelick)을 Tailwind 없이 메탈릭 모노톤으로 옮긴 버전.
// 텍스트 위로 은빛 하이라이트가 흐른다.
export default function TextShimmer({ children, duration = 2.4, spread = 2, className = '' }) {
  return (
    <motion.span
      className={`text-shimmer ${className}`}
      style={{ '--spread': `${children.length * spread}px` }}
      initial={{ backgroundPosition: '100% center' }}
      animate={{ backgroundPosition: '0% center' }}
      transition={{ repeat: Infinity, duration, ease: 'linear' }}
    >
      {children}
    </motion.span>
  )
}
