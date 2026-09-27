import { useState } from 'react'
import { motion } from 'motion/react'
import { EVENT, FAMILY_SLOT, SLOTS } from '@/data/event'
import { Reveal } from '@/components/Reveal'
import './Venue.css'

const KAKAO_MAP = `https://map.kakao.com/link/search/${encodeURIComponent(EVENT.venue.name)}`

/** 12:30–19:00 를 100% 로 두고 각 구간의 위치를 계산 */
const DAY_START = 12.5, DAY_END = 19
const pct = (h: number) => ((h - DAY_START) / (DAY_END - DAY_START)) * 100
const hm = (s: string) => { const [h, m] = s.split(':').map(Number); return h + m / 60 }

export function Venue({ family = false }: { family?: boolean }) {
  const [copied, setCopied] = useState(false)

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(EVENT.venue.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* 클립보드 미지원 */ }
  }

  return (
    <section className="section venue" id="venue">
      <Reveal><p className="eyebrow">02 · When &amp; Where</p></Reveal>

      <Reveal delay={0.05} className="venue__date">
        <p className="venue__day">12월 5일</p>
        <p className="venue__meta">2026 · 토요일 · {family ? EVENT.familyTimeLabel : EVENT.timeLabel}</p>
      </Reveal>

      <Reveal delay={0.1} className="venue__timeline" aria-label="하루 일정">
        <div className="venue__track">
          <motion.span
            className={`venue__seg venue__seg--family${family ? ' is-mine' : ''}`}
            style={{ left: `${pct(12.5)}%`, width: `${pct(14) - pct(12.5)}%` }}
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.span
            className={`venue__seg venue__seg--open${family ? '' : ' is-mine'}`}
            style={{ left: `${pct(14)}%`, width: `${pct(19) - pct(14)}%` }}
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          />
          {SLOTS.map((s) => (
            <span key={s.id} className="venue__tick" style={{ left: `${pct(hm(s.label.split('–')[0]))}%` }} />
          ))}
        </div>
        <div className="venue__labels">
          <span style={{ left: `${pct(12.5)}%` }}>12:30</span>
          <span style={{ left: `${pct(14)}%` }}>14:00</span>
          <span style={{ left: `${pct(19)}%` }} className="is-end">19:00</span>
        </div>
        <div className="venue__legend">
          <span><i className="venue__dot venue__dot--family" />{FAMILY_SLOT.display} 가족과 함께</span>
          <span><i className="venue__dot venue__dot--open" />{EVENT.timeLabel} 자유 관람</span>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="venue__place">
        <p className="venue__name">{EVENT.venue.name}</p>
        <p className="venue__addr">{EVENT.venue.address}</p>
        <div className="venue__actions">
          <a className="venue__btn" href={EVENT.venue.naverShort} target="_blank" rel="noreferrer">네이버 지도</a>
          <a className="venue__btn" href={KAKAO_MAP} target="_blank" rel="noreferrer">카카오맵</a>
          <button type="button" className="venue__btn" onClick={copyAddress}>{copied ? '복사됨' : '주소 복사'}</button>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="venue__notes">
        <div className="venue__note">
          <p className="eyebrow">Parking</p>
          <p>주차와 오시는 길은 초대장을 보내드릴 때 함께 안내드립니다.</p>
        </div>
        <div className="venue__note">
          <p className="eyebrow">Stay</p>
          <p>정해진 순서는 없습니다. 고르신 시간에 오셔서 머무르고 싶은 만큼 머무르다 가세요.</p>
        </div>
      </Reveal>
    </section>
  )
}
