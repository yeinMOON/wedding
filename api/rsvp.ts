import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PROP, STATUS, notion, queryAll, read, write, newTicketCode } from './_notion.js'

const SLOT_CAPACITY = 20
const SLOTS = ['12:30–13:30', '13:30–14:30', '14:30–15:30', '15:30–16:30', '16:30–17:30', '17:30–19:00']

type Body = {
  attending: boolean
  name: string
  phone?: string
  slot?: string
  headcount?: number
  ticketType?: '실물' | '모바일'
  postcode?: string
  address?: string
  message?: string
  website?: string // honeypot
}

function bad(res: VercelResponse, code: string, status = 400) {
  return res.status(status).json({ error: code })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return bad(res, 'method_not_allowed', 405)
  const b = (req.body ?? {}) as Body
  if (b.website) return res.status(200).json({ ok: true }) // 봇은 조용히 무시

  const name = String(b.name ?? '').trim()
  if (name.length < 2 || name.length > 20) return bad(res, 'invalid_name')
  const phone = String(b.phone ?? '').replace(/[^0-9]/g, '')
  if (phone && !/^01[016789][0-9]{7,8}$/.test(phone)) return bad(res, 'invalid_phone')

  const attending = Boolean(b.attending)
  let slot: string | null = null
  let headcount: number | null = null
  let ticketType: '실물' | '모바일' | null = null
  let postcode = ''
  let address = ''

  if (attending) {
    slot = String(b.slot ?? '')
    if (!SLOTS.includes(slot)) return bad(res, 'invalid_slot')
    headcount = Number(b.headcount)
    if (!Number.isInteger(headcount) || headcount < 1 || headcount > 6) return bad(res, 'invalid_headcount')
    if (!phone) return bad(res, 'invalid_phone')
    ticketType = b.ticketType === '실물' ? '실물' : b.ticketType === '모바일' ? '모바일' : null
    if (!ticketType) return bad(res, 'invalid_ticket_type')
    if (ticketType === '실물') {
      postcode = String(b.postcode ?? '').trim()
      address = String(b.address ?? '').trim()
      if (!/^[0-9]{5}$/.test(postcode) || address.length < 5) return bad(res, 'invalid_address')
    }
  }

  try {
    // 1) 이름으로 기존 행 찾기
    const matches = await queryAll({ property: PROP.name, title: { equals: name } })
    const target = matches.length === 1 ? matches[0] : null
    const memo =
      matches.length === 0 ? '사이트에서 신규 생성' : matches.length > 1 ? '동명이인 확인 필요 (사이트 신규 생성)' : ''

    // 2) 정원 확인 (본인 기존 인원 제외)
    if (attending && slot) {
      const attendees = await queryAll({
        and: [
          { property: PROP.status, status: { equals: STATUS.attend } },
          { property: PROP.slot, select: { equals: slot } },
        ],
      })
      const taken = attendees
        .filter((p) => p.id !== target?.id)
        .reduce((sum, p) => sum + (read.number(p, PROP.headcount) ?? 1), 0)
      if (taken + (headcount ?? 0) > SLOT_CAPACITY) return bad(res, 'slot_full', 409)
    }

    // 3) 티켓 코드: 기존 것 유지, 없으면 발급
    const ticketCode = (target && read.text(target, PROP.ticketCode)) || newTicketCode()

    const properties: Record<string, unknown> = {
      [PROP.status]: write.status(attending ? STATUS.attend : STATUS.decline),
      [PROP.slot]: write.select(slot),
      [PROP.headcount]: write.number(headcount),
      [PROP.ticketType]: write.select(ticketType),
      [PROP.phone]: write.phone(phone ? phone.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3') : null),
      [PROP.postcode]: write.text(postcode),
      [PROP.address]: write.text(address),
      [PROP.ticketCode]: write.text(attending ? ticketCode : ''),
      [PROP.respondedAt]: write.date(new Date().toISOString()),
      [PROP.memo]: write.text([memo, b.message?.trim()].filter(Boolean).join(' / ').slice(0, 500)),
    }

    if (target) {
      await notion(`/pages/${target.id}`, { method: 'PATCH', body: { properties } })
    } else {
      await notion('/pages', {
        method: 'POST',
        body: {
          parent: { database_id: process.env.NOTION_DATABASE_ID },
          properties: { [PROP.name]: write.title(name), ...properties },
        },
      })
    }

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ ok: true, ticketCode: attending ? ticketCode : null })
  } catch (e) {
    console.error(e)
    return bad(res, 'server_error', 500)
  }
}
