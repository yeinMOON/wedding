export const EVENT = {
  title: '어쩌다 결혼',
  groom: '김우진',
  bride: '문예인',
  date: new Date('2026-12-05T12:30:00+09:00'),
  dateLabel: '2026. 12. 5. 토요일',
  timeLabel: '12:30 – 19:00',
  venue: {
    name: '플랫1399',
    address: '서울 강동구 양재대로 1399',
    naverShort: 'https://naver.me/GKIoo8dU',
  },
  /** 1시간 단위 슬롯. 슬롯당 정원 20명. */
  slots: ['12:30', '13:30', '14:30', '15:30', '16:30', '17:30'].map((start, i, arr) => ({
    id: `s${i}`,
    start,
    end: arr[i + 1] ?? '19:00',
    capacity: 20,
  })),
  physicalTicketDeadline: '2026-11-08',
} as const
