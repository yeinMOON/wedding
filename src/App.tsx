import { Intro } from '@/sections/Intro'
import { Placeholder } from '@/sections/Placeholder'
import { Rsvp } from '@/sections/Rsvp'
import { TicketPage } from '@/pages/TicketPage'

export default function App() {
  const m = window.location.pathname.match(/^\/t\/([A-Za-z0-9]{6})\/?$/)
  if (m) return <TicketPage code={m[1].toUpperCase()} />

  return (
    <main className="app">
      <Intro />
      <Placeholder label="01 · 전시 형태" note="갤러리 전시임을 안내. 사진 + 오브제." />
      <Placeholder label="02 · 장소 · 시간" note="지도, 주차(추후 안내), 대중교통." />
      <Placeholder label="03 · 전시 구성" note="케이터링, 사진 판매 → 1859 갈라파고스." />
      <Rsvp />
    </main>
  )
}
