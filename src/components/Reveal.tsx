import { motion, type HTMLMotionProps } from 'motion/react'

/** 뷰포트에 들어올 때 한 번 페이드·상승. 모바일에서 가벼운 기본 등장 효과. */
export function Reveal({ delay = 0, children, ...rest }: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
