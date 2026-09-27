import './Placeholder.css'

/** 구현 전 섹션의 자리. 초안 진행 중 순서를 확인하기 위한 용도. */
export function Placeholder({ label, note }: { label: string; note?: string }) {
  return (
    <section className="section placeholder">
      <p className="eyebrow">{label}</p>
      {note && <p className="placeholder__note">{note}</p>}
    </section>
  )
}
