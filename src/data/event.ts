export const SLOT_CAPACITY = 20

/** 1시간 단위 슬롯, 13:30 시작. 마지막은 17:30–19:00 (1.5시간). 노션 「참석 시간대」 옵션과 라벨이 정확히 같아야 한다. */
export const SLOTS = [
  { id: 's1', label: '13:30–14:30' },
  { id: 's2', label: '14:30–15:30' },
  { id: 's3', label: '15:30–16:30' },
  { id: 's4', label: '16:30–17:30' },
  { id: 's5', label: '17:30–19:00' },
] as const

export type SlotLabel = (typeof SLOTS)[number]['label']

export const EVENT = {
  title: '어쩌다 결혼',
  groom: '김우진',
  bride: '문예인',
  date: new Date('2026-12-05T12:30:00+09:00'),
  dateLabel: '2026. 12. 5. 토요일',
  dateShort: '2026.12.05 SAT',
  timeLabel: '12:30 – 19:00',
  venue: {
    name: '플랫1399',
    address: '서울 강동구 양재대로 1399',
    naverShort: 'https://naver.me/GKIoo8dU',
  },
  physicalTicketDeadline: '2026-11-08',
  physicalTicketDeadlineLabel: '11월 8일',
} as const
