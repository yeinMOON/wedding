import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PROP, STATUS, queryAll, read } from './_notion.js'

/** 슬롯별 확정 인원 합계. 프론트가 정원과 비교해 잔여를 계산한다. */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const pages = await queryAll({ property: PROP.status, status: { equals: STATUS.attend } })
    const taken: Record<string, number> = {}
    for (const p of pages) {
      const slot = read.select(p, PROP.slot)
      if (!slot) continue
      taken[slot] = (taken[slot] ?? 0) + (read.number(p, PROP.headcount) ?? 1)
    }
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ taken })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'slots_unavailable' })
  }
}
