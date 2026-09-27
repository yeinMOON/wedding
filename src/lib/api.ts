import { SLOTS, SLOT_CAPACITY } from '@/data/event'

export type RsvpPayload = {
  attending: boolean
  name: string
  phone?: string
  slot?: string
  headcount?: number
  ticketType?: '실물' | '모바일'
  postcode?: string
  address?: string
  message?: string
  website?: string
}

export type Ticket = { name: string; slot: string | null; headcount: number; code: string }

const MOCK = import.meta.env.DEV && !import.meta.env.VITE_API_PROXY

export class ApiError extends Error {
  constructor(public code: string, public status: number) {
    super(code)
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } })
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new ApiError(data.error ?? 'unknown', res.status)
  return data
}

/** 슬롯별 잔여 인원. 실패 시 null (잔여 표시 없이 진행). */
export async function fetchRemaining(): Promise<Record<string, number> | null> {
  if (MOCK) return Object.fromEntries(SLOTS.map((s, i) => [s.label, i === 2 ? 0 : SLOT_CAPACITY - i * 3]))
  try {
    const { taken } = await call<{ taken: Record<string, number> }>('/api/slots')
    return Object.fromEntries(SLOTS.map((s) => [s.label, Math.max(0, SLOT_CAPACITY - (taken[s.label] ?? 0))]))
  } catch {
    return null
  }
}

export async function submitRsvp(payload: RsvpPayload): Promise<{ ticketCode: string | null }> {
  if (MOCK) {
    await new Promise((r) => setTimeout(r, 600))
    return { ticketCode: payload.attending ? 'MOCK42' : null }
  }
  return call('/api/rsvp', { method: 'POST', body: JSON.stringify(payload) })
}

export async function fetchTicket(code: string): Promise<Ticket> {
  if (MOCK) return { name: '홍길동', slot: SLOTS[1].label, headcount: 2, code }
  return call(`/api/ticket?code=${encodeURIComponent(code)}`)
}
