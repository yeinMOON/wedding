# 개발 워크플로우

## 브랜치와 병합

1. `main`이 기준. 직접 푸시하지 않는다.
2. 작업은 브랜치에서 하고 `main`을 대상으로 PR을 연다. 한 PR은 한 섹션 또는 한 기능.
3. **QA 역할**이 PR을 검수하고 리뷰 코멘트를 단다 (레이아웃, 모바일 사양, 결정 사항과의 일치, 접근성).
4. 클라이언트(예인)가 Vercel 프리뷰 URL로 확인하고 리뷰 후 **직접 병합**한다.
5. 병합되면 Vercel이 `main`을 프로덕션에 배포한다.

## 배포

- Vercel, 프레임워크 Vite. 설정은 `vercel.json`.
- PR마다 프리뷰 URL이 생성된다. PR 본문에 적는다.
- 환경변수(`NOTION_TOKEN`, `NOTION_DATABASE_ID`)는 Vercel 프로젝트 설정에만 둔다. `.env.example` 참고.

## 로컬

```
git clone https://github.com/yeinMOON/wedding.git && cd wedding
nvm use                       # Node 22
npm install
cp .env.example .env.local    # 값 채우기. .env.local은 git에 올라가지 않는다
```

세 가지 실행 방법이 있다. 대부분은 1번이면 된다.

| 명령 | 프론트 | /api | 언제 |
|---|---|---|---|
| `npm run dev` | 로컬 | **목업** (노션에 쓰지 않음) | 화면·인터랙션 작업 |
| `npm run dev` + `.env.local`의 `VITE_API_PROXY=프리뷰URL` | 로컬 | Vercel 프리뷰의 실제 함수 | 폼을 실제 노션과 붙여 볼 때 |
| `npm run dev:full` (`vercel dev`) | 로컬 | 로컬에서 함수 실행 | 함수 코드를 고칠 때. `npm i -g vercel` 후 `vercel link`, `vercel env pull .env.local`로 환경변수를 받아온다 |

`vercel env pull`을 쓰면 Vercel에 넣어둔 `NOTION_TOKEN`이 `.env.local`로 내려오므로 토큰을 따로 복사할 필요가 없다.

## 구조

```
src/
  data/event.ts      행사 상수 (날짜, 장소, 슬롯)
  styles/tokens.css  디자인 토큰 (레퍼런스 확정 후 값만 교체)
  styles/global.css  리셋, 레이아웃 셸 (max-width 500px)
  sections/          섹션 단위 컴포넌트 + CSS
  components/        공용 컴포넌트
api/                 Vercel 서버리스 함수 (노션 연동)
  _notion.ts         REST 래퍼, 속성명 상수
  slots.ts           GET  슬롯별 확정 인원
  rsvp.ts            POST 참석 신청 (이름 매칭 → 갱신/생성, 정원 검사, 티켓 코드 발급)
  ticket.ts          GET  티켓 코드 → 이름·시간대·인원
src/pages/TicketPage /t/:code 모바일 티켓 (캔버스 → 이미지 저장)
src/lib/api.ts       API 클라이언트. `vite dev`에서 VITE_API_PROXY 없으면 목업
docs/                기획·결정 문서
```
