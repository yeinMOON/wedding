import { motion } from 'motion/react'
import { EVENT } from '@/data/event'
import './Intro.css'

export function Intro() {
  return (
    <section className="intro">
      <motion.p
        className="eyebrow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Exhibition · {EVENT.dateLabel}
      </motion.p>
      <motion.h1
        className="intro__title"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        어쩌다
        <br />
        결혼
      </motion.h1>
      <motion.p
        className="intro__names"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        {EVENT.groom} &nbsp;·&nbsp; {EVENT.bride}
      </motion.p>
      <motion.p
        className="intro__meta"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
      >
        {EVENT.timeLabel} · {EVENT.venue.address}
      </motion.p>
    </section>
  )
}
