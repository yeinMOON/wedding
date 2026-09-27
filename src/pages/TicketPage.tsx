import { useEffect, useRef, useState } from 'react'
import { EVENT } from '@/data/event'
import { fetchTicket, type Ticket } from '@/lib/api'
import { Button } from '@/components/Button'
import './TicketPage.css'

/** /t/:code — 이름·시간대가 들어간 모바일 티켓. 캔버스로 그려 이미지로 저장할 수 있다. */
export function TicketPage({ code }: { code: string }) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    fetchTicket(code).then((t) => { setTicket(t); setState('ok') }).catch(() => setState('error'))
  }, [code])

  useEffect(() => {
    if (!ticket || !canvasRef.current) return
    draw(canvasRef.current, ticket)
  }, [ticket])

  async function save() {
    const canvas = canvasRef.current
    if (!canvas) return
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'))
    if (!blob) return
    const file = new File([blob], `ticket-${code}.png`, { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: EVENT.title }); return } catch { /* 취소 */ }
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = file.name; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="app ticket">
      {state === 'loading' && <p className="ticket__msg">티켓을 불러오는 중…</p>}
      {state === 'error' && (
        <div className="ticket__msg">
          <p>티켓을 찾을 수 없습니다.</p>
          <a href="/">처음으로</a>
        </div>
      )}
      {state === 'ok' && ticket && (
        <>
          <canvas ref={canvasRef} className="ticket__canvas" width={1080} height={1620} />
          <div className="ticket__actions">
            <Button onClick={save}>이미지로 저장</Button>
            <p className="ticket__hint">당일 시간과 장소를 잊지 않도록 간직해 주세요.</p>
            <a className="ticket__home" href="/">전시 안내로</a>
          </div>
        </>
      )}
    </main>
  )
}

function draw(canvas: HTMLCanvasElement, t: Ticket) {
  const ctx = canvas.getContext('2d')!
  const W = canvas.width, H = canvas.height
  const style = getComputedStyle(document.documentElement)
  const bg = style.getPropertyValue('--c-surface').trim() || '#fff'
  const ink = style.getPropertyValue('--c-ink').trim() || '#141414'
  const ink3 = style.getPropertyValue('--c-ink-3').trim() || '#999'
  const font = 'Pretendard Variable, Pretendard, -apple-system, system-ui, sans-serif'

  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.strokeRect(60, 60, W - 120, H - 120)

  ctx.fillStyle = ink3; ctx.font = `500 30px ${font}`; ctx.letterSpacing = '6px'
  ctx.fillText('EXHIBITION TICKET', 140, 200)
  ctx.letterSpacing = '0px'

  ctx.fillStyle = ink; ctx.font = `500 120px ${font}`
  ctx.fillText('어쩌다', 140, 420); ctx.fillText('결혼', 140, 560)

  ctx.font = `400 40px ${font}`; ctx.fillText(`${EVENT.groom} · ${EVENT.bride}`, 140, 660)

  line(ctx, 140, 780, W - 140, ink3)
  label(ctx, 'GUEST', 140, 880, ink3, font); ctx.fillStyle = ink; ctx.font = `500 64px ${font}`
  ctx.fillText(`${t.name} 님${t.headcount > 1 ? ` 외 ${t.headcount - 1}명` : ''}`, 140, 960)

  label(ctx, 'DATE', 140, 1080, ink3, font); ctx.fillStyle = ink; ctx.font = `400 48px ${font}`
  ctx.fillText(EVENT.dateShort, 140, 1150)
  label(ctx, 'TIME', 560, 1080, ink3, font); ctx.fillStyle = ink; ctx.font = `400 48px ${font}`
  ctx.fillText((t.slot ?? EVENT.timeLabel).replace(' (가족)', ''), 560, 1150)

  label(ctx, 'VENUE', 140, 1270, ink3, font); ctx.fillStyle = ink; ctx.font = `400 44px ${font}`
  ctx.fillText(EVENT.venue.address, 140, 1340)
  ctx.fillStyle = ink3; ctx.font = `400 32px ${font}`; ctx.fillText(EVENT.venue.name, 140, 1395)

  line(ctx, 140, 1470, W - 140, ink3)
  ctx.fillStyle = ink3; ctx.font = `400 30px ${font}`; ctx.letterSpacing = '4px'
  ctx.fillText(`NO. ${t.code}`, 140, 1530)
  ctx.letterSpacing = '0px'
}
function line(ctx: CanvasRenderingContext2D, x1: number, y: number, x2: number, color: string) {
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke()
}
function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, font: string) {
  ctx.fillStyle = color; ctx.font = `500 26px ${font}`; ctx.letterSpacing = '5px'; ctx.fillText(text, x, y); ctx.letterSpacing = '0px'
}
