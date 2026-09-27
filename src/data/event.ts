export const SLOT_CAPACITY = 20

/** 가족 전용 시간. 정원 검사 없음. 노션 「참석 시간대」 옵션과 라벨이 정확히 같아야 한다. */
export const FAMILY_SLOT = { id: 'family', label: '12:30–14:00 (가족)', display: '12:30 – 14:00' } as const

/** 일반 하객 1시간 단위 슬롯 5개. 노션 「참석 시간대」 옵션과 라벨이 정확히 같아야 한다. */
export const SLOTS = [
  { id: 's1', label: '14:00–15:00' },
  { id: 's2', label: '15:00–16:00' },
  { id: 's3', label: '16:00–17:00' },
  { id: 's4', label: '17:00–18:00' },
  { id: 's5', label: '18:00–19:00' },
] as const

export type SlotLabel = (typeof SLOTS)[number]['label'] | typeof FAMILY_SLOT.label

export const EVENT = {
  title: '어쩌다 결혼',
  groom: '김우진',
  bride: '문예인',
  date: new Date('2026-12-05T12:30:00+09:00'),
  dateLabel: '2026. 12. 5. 토요일',
  dateShort: '2026.12.05 SAT',
  /** 일반 하객 관람 시간 */
  timeLabel: '14:00 – 19:00',
  /** 가족 시간 */
  familyTimeLabel: '12:30 – 14:00',
  venue: {
    name: '플랫1399',
    address: '서울 강동구 양재대로 1399',
    naverShort: 'https://naver.me/GKIoo8dU',
  },
  physicalTicketDeadline: '2026-11-08',
  physicalTicketDeadlineLabel: '11월 8일',
} as const

/** URL에 ?family 가 있으면 가족 모드. 부모님을 통해 전달하는 링크. */
export function isFamilyMode(): boolean {
  return new URLSearchParams(window.location.search).has('family')
}
