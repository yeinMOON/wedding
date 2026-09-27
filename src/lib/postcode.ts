/** 다음 우편번호 서비스. 필요할 때만 스크립트를 로드한다. */
type DaumPostcodeResult = { zonecode: string; roadAddress: string; jibunAddress: string; buildingName?: string }
declare global {
  interface Window {
    daum?: { Postcode: new (opts: { oncomplete: (d: DaumPostcodeResult) => void; onclose?: () => void }) => { open: () => void } }
  }
}

let loading: Promise<void> | null = null
function load(): Promise<void> {
  if (window.daum?.Postcode) return Promise.resolve()
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
      s.onload = () => resolve()
      s.onerror = () => { loading = null; reject(new Error('postcode_load_failed')) }
      document.head.appendChild(s)
    })
  }
  return loading
}

export async function searchPostcode(): Promise<{ postcode: string; address: string } | null> {
  await load()
  return new Promise((resolve) => {
    let done = false
    new window.daum!.Postcode({
      oncomplete: (d) => {
        done = true
        const base = d.roadAddress || d.jibunAddress
        resolve({ postcode: d.zonecode, address: d.buildingName ? `${base} (${d.buildingName})` : base })
      },
      onclose: () => { if (!done) resolve(null) },
    }).open()
  })
}
