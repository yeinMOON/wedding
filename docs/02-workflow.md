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
nvm use          # Node 22
npm install
npm run dev
npm run build    # 타입체크 + 빌드
```

## 구조

```
src/
  data/event.ts      행사 상수 (날짜, 장소, 슬롯)
  styles/tokens.css  디자인 토큰 (레퍼런스 확정 후 값만 교체)
  styles/global.css  리셋, 레이아웃 셸 (max-width 500px)
  sections/          섹션 단위 컴포넌트 + CSS
  components/        공용 컴포넌트
api/                 Vercel 서버리스 함수 (노션 연동)
docs/                기획·결정 문서
```
