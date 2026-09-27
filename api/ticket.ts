import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PROP, STATUS, queryAll, read } from './_notion.js'

/** 티켓 코드로 이름·시간대·인원 조회. 주소·전화번호는 내보내지 않는다. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const code = String(req.query.code ?? '').toUpperCase()
  if (!/^[A-Z2-9]{6}$/.test(code)) return res.status(400).json({ error: 'invalid_code' })
  try {
    const pages = await queryAll({
      and: [
        { property: PROP.ticketCode, rich_text: { equals: code } },
        { property: PROP.status, status: { equals: STATUS.attend } },
      ],
    })
    const p = pages[0]
    if (!p) return res.status(404).json({ error: 'not_found' })
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({
      name: read.title(p, PROP.name),
      slot: read.select(p, PROP.slot),
      headcount: read.number(p, PROP.headcount) ?? 1,
      code,
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server_error' })
  }
}
