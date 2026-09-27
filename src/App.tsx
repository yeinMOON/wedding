import { Intro } from '@/sections/Intro'
import { Placeholder } from '@/sections/Placeholder'

export default function App() {
  return (
    <main className="app">
      <Intro />
      <Placeholder label="01 · 전시 형태" note="갤러리 전시임을 안내. 사진 + 오브제." />
      <Placeholder label="02 · 장소 · 시간" note="지도, 주차(추후 안내), 대중교통." />
      <Placeholder label="03 · 전시 구성" note="케이터링, 사진 판매 → 1859 갈라파고스." />
      <Placeholder label="04 · 참석 · 티켓" note="참석 여부 → 시간대 → 이름·인원 → 실물/모바일." />
    </main>
  )
}
