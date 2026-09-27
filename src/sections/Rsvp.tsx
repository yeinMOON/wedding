import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EVENT, SLOTS } from '@/data/event'
import { ApiError, fetchRemaining, submitRsvp } from '@/lib/api'
import { searchPostcode } from '@/lib/postcode'
import { Button } from '@/components/Button'
import { Field } from '@/components/Field'
import './Rsvp.css'

type Step = 'attend' | 'slot' | 'who' | 'ticket' | 'address' | 'decline' | 'sending' | 'done'

type Form = {
  attending: boolean | null
  slot: string
  name: string
  phone: string
  headcount: number
  ticketType: '실물' | '모바일' | null
  postcode: string
  address: string
  detail: string
  message: string
}

const initial: Form = {
  attending: null, slot: '', name: '', phone: '', headcount: 1,
  ticketType: null, postcode: '', address: '', detail: '', message: '',
}

const ERRORS: Record<string, string> = {
  slot_full: '방금 이 시간대가 마감되었습니다. 다른 시간을 골라주세요.',
  invalid_phone: '휴대폰 번호를 다시 확인해 주세요.',
  invalid_name: '이름을 다시 확인해 주세요.',
  invalid_address: '주소를 다시 확인해 주세요.',
}

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
}

export function Rsvp() {
  const [step, setStep] = useState<Step>('attend')
  const [form, setForm] = useState<Form>(initial)
  const [remaining, setRemaining] = useState<Record<string, number> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ticketCode, setTicketCode] = useState<string | null>(null)
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    if (step === 'slot' && remaining === null) fetchRemaining().then(setRemaining)
  }, [step, remaining])

  const phoneOk = useMemo(() => /^01[016789][0-9]{7,8}$/.test(form.phone.replace(/\D/g, '')), [form.phone])
  const nameOk = form.name.trim().length >= 2

  async function submit() {
    setStep('sending'); setError(null)
    try {
      const res = await submitRsvp({
        attending: form.attending === true,
        name: form.name.trim(),
        phone: form.phone,
        slot: form.slot,
        headcount: form.headcount,
        ticketType: form.ticketType ?? undefined,
        postcode: form.postcode,
        address: [form.address, form.detail.trim()].filter(Boolean).join(', '),
        message: form.message,
      })
      setTicketCode(res.ticketCode)
      setStep('done')
    } catch (e) {
      const code = e instanceof ApiError ? e.code : 'unknown'
      setError(ERRORS[code] ?? '전송에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      if (code === 'slot_full') { setRemaining(null); setStep('slot') }
      else setStep(form.attending ? (form.ticketType === '실물' ? 'address' : 'ticket') : 'decline')
    }
  }

  return (
    <section className="section rsvp" id="rsvp">
      <p className="eyebrow">04 · RSVP</p>
      <div className="rsvp__stage">
        <AnimatePresence mode="wait" initial={false}>

          {step === 'attend' && (
            <motion.div key="attend" className="rsvp__step" {...slide}>
              <h2 className="rsvp__q">전시에 오실 수 있나요?</h2>
              <p className="rsvp__sub">{EVENT.dateLabel} · {EVENT.timeLabel}</p>
              <div className="rsvp__choices">
                <Button variant="choice" onClick={() => { set('attending', true); setStep('slot') }}>참석합니다</Button>
                <Button variant="choice" onClick={() => { set('attending', false); setStep('decline') }}>마음만 보냅니다</Button>
              </div>
            </motion.div>
          )}

          {step === 'slot' && (
            <motion.div key="slot" className="rsvp__step" {...slide}>
              <h2 className="rsvp__q">언제쯤 들르실 건가요?</h2>
              <p className="rsvp__sub">전시는 시간 내 자유롭게 관람하실 수 있습니다. 시간대별로 스무 분까지 모십니다.</p>
              {error && <p className="rsvp__error">{error}</p>}
              <div className="rsvp__choices">
                {SLOTS.map((s) => {
                  const left = remaining?.[s.label]
                  const full = left !== undefined && left <= 0
                  return (
                    <Button key={s.id} variant="choice" selected={form.slot === s.label} disabled={full}
                      onClick={() => { set('slot', s.label); setStep('who') }}>
                      <span>{s.label}</span>
                      <span className="btn__sub">
                        {remaining === null ? '' : full ? '마감' : left! <= 5 ? `${left}자리 남음` : ''}
                      </span>
                    </Button>
                  )
                })}
              </div>
              <Button variant="ghost" onClick={() => setStep('attend')}>이전</Button>
            </motion.div>
          )}

          {step === 'who' && (
            <motion.div key="who" className="rsvp__step" {...slide}>
              <h2 className="rsvp__q">누가 오시나요?</h2>
              <div className="rsvp__fields">
                <Field label="이름" value={form.name} onChange={(e) => set('name', e.target.value)}
                  placeholder="홍길동" autoComplete="name" maxLength={20}
                  hint="초청 명단과 맞춰볼 수 있게 본명으로 적어주세요" />
                <Field label="휴대폰 번호" value={form.phone} onChange={(e) => set('phone', e.target.value)}
                  placeholder="010-0000-0000" inputMode="tel" autoComplete="tel" type="tel"
                  hint="티켓 안내에만 사용합니다" />
                <div className="rsvp__count">
                  <span className="field__label">함께 오는 인원 (본인 포함)</span>
                  <div className="rsvp__stepper">
                    <button type="button" onClick={() => set('headcount', Math.max(1, form.headcount - 1))} aria-label="줄이기">−</button>
                    <span>{form.headcount}명</span>
                    <button type="button" onClick={() => set('headcount', Math.min(6, form.headcount + 1))} aria-label="늘리기">+</button>
                  </div>
                </div>
              </div>
              <Button disabled={!nameOk || !phoneOk} onClick={() => setStep('ticket')}>다음</Button>
              <Button variant="ghost" onClick={() => setStep('slot')}>이전</Button>
            </motion.div>
          )}

          {step === 'ticket' && (
            <motion.div key="ticket" className="rsvp__step" {...slide}>
              <h2 className="rsvp__q">초대장은 어떻게 받으실래요?</h2>
              {error && <p className="rsvp__error">{error}</p>}
              <div className="rsvp__choices">
                <Button variant="choice" selected={form.ticketType === '실물'} onClick={() => { set('ticketType', '실물'); setStep('address') }}>
                  <span>종이 초대장</span><span className="btn__sub">우편 · {EVENT.physicalTicketDeadlineLabel}까지</span>
                </Button>
                <Button variant="choice" selected={form.ticketType === '모바일'} onClick={() => { set('ticketType', '모바일'); submit() }}>
                  <span>모바일 티켓</span><span className="btn__sub">바로 발급</span>
                </Button>
              </div>
              <Button variant="ghost" onClick={() => setStep('who')}>이전</Button>
            </motion.div>
          )}

          {step === 'address' && (
            <motion.div key="address" className="rsvp__step" {...slide}>
              <h2 className="rsvp__q">어디로 보내드릴까요?</h2>
              {error && <p className="rsvp__error">{error}</p>}
              <div className="rsvp__fields">
                <Field label="주소" value={form.address} readOnly placeholder="우편번호 찾기를 눌러주세요"
                  onClick={async () => { const r = await searchPostcode(); if (r) { set('postcode', r.postcode); set('address', r.address) } }}
                  trailing={<Button variant="choice" className="rsvp__find" onClick={async () => { const r = await searchPostcode(); if (r) { set('postcode', r.postcode); set('address', r.address) } }}>찾기</Button>} />
                <Field label="상세 주소" value={form.detail} onChange={(e) => set('detail', e.target.value)} placeholder="동 · 호수" maxLength={60} />
              </div>
              <p className="rsvp__note">주소와 번호는 초대장 발송에만 쓰고, 전시가 끝나면 지웁니다.</p>
              <Button disabled={!form.postcode || !form.address} onClick={submit}>보내주세요</Button>
              <Button variant="ghost" onClick={() => setStep('ticket')}>이전</Button>
            </motion.div>
          )}

          {step === 'decline' && (
            <motion.div key="decline" className="rsvp__step" {...slide}>
              <h2 className="rsvp__q">그래도 이름은 남겨주세요.</h2>
              {error && <p className="rsvp__error">{error}</p>}
              <div className="rsvp__fields">
                <Field label="이름" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="홍길동" maxLength={20} />
                <Field label="한마디 (선택)" value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="" maxLength={200} />
              </div>
              <Button disabled={!nameOk} onClick={submit}>전하기</Button>
              <Button variant="ghost" onClick={() => setStep('attend')}>이전</Button>
            </motion.div>
          )}

          {step === 'sending' && (
            <motion.div key="sending" className="rsvp__step rsvp__step--center" {...slide}>
              <p className="rsvp__sub">전하는 중…</p>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" className="rsvp__step" {...slide}>
              {form.attending ? (
                form.ticketType === '실물' ? (
                  <>
                    <h2 className="rsvp__q">{form.name} 님, 12월에 뵙겠습니다.</h2>
                    <p className="rsvp__sub">
                      종이 초대장은 11월 중 우편으로 도착합니다.<br />
                      {form.slot} 에 스무 자리 중 {form.headcount}자리를 비워두겠습니다.
                    </p>
                    {ticketCode && (
                      <p className="rsvp__note">모바일 티켓도 함께 발급되었습니다. <a href={`/t/${ticketCode}`}>티켓 보기</a></p>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="rsvp__q">{form.name} 님, 티켓이 발급되었습니다.</h2>
                    <p className="rsvp__sub">{form.slot} · {form.headcount}명</p>
                    {ticketCode && <Button onClick={() => { window.location.href = `/t/${ticketCode}` }}>티켓 열기</Button>}
                  </>
                )
              ) : (
                <>
                  <h2 className="rsvp__q">고맙습니다.</h2>
                  <p className="rsvp__sub">전시 사진은 나중에 이 페이지에서 보실 수 있게 하겠습니다.</p>
                </>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="rsvp__hp" aria-hidden="true" />
    </section>
  )
}
