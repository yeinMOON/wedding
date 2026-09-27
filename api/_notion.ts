/**
 * 노션 REST 최소 래퍼. SDK 없이 fetch만 사용한다.
 * 토큰은 서버리스 함수 환경변수에서만 읽는다.
 */
const NOTION_VERSION = '2022-06-28'

export const PROP = {
  name: '이름',
  status: '참석 가능 확인 완료',
  slot: '참석 시간대',
  headcount: '인원',
  ticketType: '청첩장',
  phone: '전화번호',
  postcode: '우편번호',
  address: '주소',
  ticketCode: '티켓 코드',
  respondedAt: '사이트 응답일시',
  memo: '사이트 메모',
} as const

export const STATUS = { attend: '참석', decline: '불참' } as const

function env(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

export async function notion<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${env('NOTION_TOKEN')}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Notion ${res.status}: ${text.slice(0, 300)}`)
  }
  return res.json() as Promise<T>
}

export type NotionPage = {
  id: string
  properties: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

export async function queryAll(filter?: unknown): Promise<NotionPage[]> {
  const dbId = env('NOTION_DATABASE_ID')
  const pages: NotionPage[] = []
  let cursor: string | undefined
  do {
    const data = await notion<{ results: NotionPage[]; has_more: boolean; next_cursor: string | null }>(
      `/databases/${dbId}/query`,
      { method: 'POST', body: { filter, page_size: 100, start_cursor: cursor } },
    )
    pages.push(...data.results)
    cursor = data.has_more && data.next_cursor ? data.next_cursor : undefined
  } while (cursor)
  return pages
}

/* 값 읽기 */
export const read = {
  title: (p: NotionPage, key: string): string =>
    (p.properties[key]?.title ?? []).map((t: { plain_text: string }) => t.plain_text).join(''),
  text: (p: NotionPage, key: string): string =>
    (p.properties[key]?.rich_text ?? []).map((t: { plain_text: string }) => t.plain_text).join(''),
  select: (p: NotionPage, key: string): string | null => p.properties[key]?.select?.name ?? null,
  status: (p: NotionPage, key: string): string | null => p.properties[key]?.status?.name ?? null,
  number: (p: NotionPage, key: string): number | null => p.properties[key]?.number ?? null,
  phone: (p: NotionPage, key: string): string | null => p.properties[key]?.phone_number ?? null,
}

/* 값 쓰기 */
export const write = {
  title: (v: string) => ({ title: [{ text: { content: v } }] }),
  text: (v: string) => ({ rich_text: v ? [{ text: { content: v } }] : [] }),
  select: (v: string | null) => ({ select: v ? { name: v } : null }),
  status: (v: string) => ({ status: { name: v } }),
  number: (v: number | null) => ({ number: v }),
  phone: (v: string | null) => ({ phone_number: v || null }),
  date: (iso: string) => ({ date: { start: iso } }),
}

export function newTicketCode(): string {
  // 혼동 문자(0/O, 1/I) 제외 6자리
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let out = ''
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  for (const b of bytes) out += alphabet[b % alphabet.length]
  return out
}
