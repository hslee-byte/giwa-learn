# GIWA Learn Design System

## 0. Research Log

- Embedded refs: GIWA GASOK 공식 화면, Coinbase, Revolut을 비교하고 `minimalist-skill` + `coinbase.md`를 선택했다. GIWA의 흑백·1px 테두리 문법을 유지하면서 Coinbase의 금융 신뢰 구조만 차용한다.
- Lazyweb: GASOK, Verified Address, GIWA Hardhat 공식 문서 화면 3종을 확인했다. 단일 주 행동, 짧은 단계, 검증 상태를 항상 보이는 레이아웃을 채택했다.
- UI/UX DB: `centralized crypto exchange learn and earn...` 디자인 시스템과 퀴즈 접근성 검색을 실행했다. 진행률, 44px 터치 영역, 오류의 `aria-live`, 색상 외 상태 표기를 반영한다.
- Imagen drafts: 생략 — 사용자가 제공한 GIWA 공식 스크린샷이 시각 언어의 구체적 기준이다.

## 1. Atmosphere & Identity

거래소가 직접 운영하는 검증된 교육 채널처럼 느껴져야 한다. 검은 캔버스, 희고 얇은 선, 기술적인 대문자 라벨로 GIWA의 언어를 유지한다. 시그니처는 학습 단계마다 이어지는 **Verification Rail**이다. 학습, 합격, KYC, 보상 상태가 하나의 직선 위에서 채워져 사용자가 다음 행동을 즉시 이해한다.

## 2. Color

| Role | Token | Value | Usage |
|---|---|---|---|
| Canvas | `--surface-canvas` | `#050505` | 전체 배경 |
| Primary surface | `--surface-primary` | `#0B0B0C` | 카드와 패널 |
| Elevated surface | `--surface-elevated` | `#121214` | 팝오버, 선택 상태 |
| Inverse surface | `--surface-inverse` | `#F4F4EF` | 주 행동 버튼 |
| Text primary | `--text-primary` | `#F4F4EF` | 제목, 핵심 본문 |
| Text secondary | `--text-secondary` | `#A1A19B` | 설명, 메타데이터 |
| Text inverse | `--text-inverse` | `#090909` | 밝은 버튼 텍스트 |
| Border default | `--border-default` | `#3A3A3E` | 카드와 구획 |
| Border strong | `--border-strong` | `#66666C` | 활성·포커스 외곽 |
| Verified | `--status-verified` | `#C9FF63` | KYC·합격·보상 완료 |
| Verified muted | `--status-verified-muted` | `#1F2B13` | 완료 상태 배경 |
| Warning | `--status-warning` | `#FFCF5A` | 마감·예산 경고 |
| Error | `--status-error` | `#FF7B7B` | 오류·실패 |

규칙:

- `--status-verified`는 검증되었거나 완료된 상태에만 쓴다. 장식용 사용을 금지한다.
- 상태는 색상과 함께 텍스트 또는 기호를 제공한다.
- 컴포넌트 파일에 원시 색상값을 추가하지 않는다.

## 3. Typography

| Level | Size | Weight | Line height | Tracking | Usage |
|---|---:|---:|---:|---:|---|
| Display | `clamp(48px, 8vw, 96px)` | 500 | 0.96 | `-0.05em` | 캠페인 히어로 |
| H1 | `clamp(36px, 5vw, 64px)` | 500 | 1.02 | `-0.04em` | 페이지 제목 |
| H2 | `32px` | 500 | 1.12 | `-0.03em` | 주요 섹션 |
| H3 | `22px` | 600 | 1.25 | `-0.02em` | 카드 제목 |
| Body large | `18px` | 500 | 1.6 | `-0.01em` | 리드 문장 |
| Body | `16px` | 400 | 1.65 | `0` | 기본 본문 |
| Body small | `14px` | 500 | 1.5 | `0` | 보조 정보 |
| Label | `12px` | 600 | 1.3 | `0.08em` | 상태·단계 라벨 |

- Display/UI: `Space Grotesk Variable`
- Korean/body: `Noto Sans KR Variable`
- 숫자는 `font-variant-numeric: tabular-nums`를 사용한다.

## 4. Spacing & Layout

기본 단위는 4px다.

| Token | Value | Usage |
|---|---:|---|
| `--space-1` | 4px | 아이콘 간격 |
| `--space-2` | 8px | 라벨 간격 |
| `--space-3` | 12px | 컴팩트 패딩 |
| `--space-4` | 16px | 모바일 거터 |
| `--space-5` | 20px | 필드 간격 |
| `--space-6` | 24px | 카드 패딩 |
| `--space-8` | 32px | 카드 그룹 |
| `--space-10` | 40px | 섹션 내부 |
| `--space-12` | 48px | 주요 구획 |
| `--space-16` | 64px | 페이지 리듬 |
| `--space-20` | 80px | 히어로 |

- 최대 너비: 1280px
- 모바일 375px: 16px 거터, 1열
- 태블릿 768px: 24px 거터, 6열
- 데스크톱 1280px: 32px 거터, 12열
- 모든 전체 높이 화면은 `100dvh`를 기준으로 한다.

## 5. Components

### App Header

- 구조: 브랜드 워드마크, 환경 라벨, 월렛 상태, 운영자 링크
- 상태: 기본, 월렛 연결, 네트워크 오류, 모바일 메뉴
- 접근성: 현재 경로 표기, 44px 이상 터치 영역, skip link 제공
- 모션: 상태 교체 시 opacity 150ms

### Action Button

- 변형: primary inverse, secondary outline, verified, danger text
- 상태: default, hover, active, focus-visible, disabled, loading
- 접근성: 네이티브 button/link, 로딩 중 `aria-busy`, 최소 높이 48px
- 모션: transform과 색상 150ms

### Status Chip

- 변형: neutral, verified, warning, error
- 상태: 정적 상태 표현; 색상과 텍스트를 함께 사용
- 접근성: 의미가 있는 경우 숨김 기호 대신 읽을 수 있는 라벨 제공

### Campaign Card

- 구조: 상태 라벨, 제목, 요약, 리워드, 참여 지표, 행동
- 변형: featured, compact, operator
- 상태: default, hover, focus-within, closed, budget-low
- 접근성: 카드 전체를 중복 클릭 영역으로 만들지 않고 제목 링크를 주 진입점으로 사용

### Verification Rail

- 구조: 번호, 단계명, 상태, 연결선
- 상태: pending, current, complete, blocked
- 접근성: 순서 목록과 화면 판독기용 상태 문구 제공
- 모션: 완료 시 현재 점만 scale 150ms, reduced-motion에서는 제거

### Quiz Option

- 구조: 라디오 입력, 선택 기호, 답안 텍스트
- 상태: default, hover, selected, focus, disabled, correct, incorrect
- 접근성: fieldset/legend, 키보드 방향키와 탭, 색상 외 정오답 텍스트

### Metric Tile

- 구조: 라벨, 값, 보조 설명
- 상태: default, loading, empty, warning
- 접근성: 표 형식이 필요한 데이터는 별도 테이블로도 제공

### Form Field

- 구조: label, input/textarea, helper, error
- 상태: default, focus, disabled, read-only, error
- 접근성: 오류를 필드와 연결하고 `role="alert"` 사용

## 6. Motion & Interaction

| Type | Duration | Easing | Usage |
|---|---:|---|---|
| Micro | 150ms | ease-out | 버튼, 선택, 포커스 |
| Standard | 240ms | ease-in-out | 패널, 단계 교체 |
| Emphasis | 400ms | cubic-bezier(0.16, 1, 0.3, 1) | 클레임 성공 |

- 의미 있는 상태 전환에만 모션을 사용한다.
- `transform`과 `opacity`만 애니메이션한다.
- `prefers-reduced-motion`에서는 필수 피드백 외 모션을 제거한다.

## 7. Depth & Surface

전략은 **borders-only + tonal shift**다. 그림자와 장식적 blur를 사용하지 않는다. 깊이는 `--surface-canvas` → `--surface-primary` → `--surface-elevated`의 명도 차와 1px 선으로 표현한다.

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- WCAG 2.2 AA: 본문 4.5:1, 큰 글자와 UI 그래픽 3:1 이상
- 모든 행동은 키보드로 가능하고 포커스가 명확해야 한다.
- 200% 확대에서 가로 스크롤 없이 핵심 흐름을 완료할 수 있어야 한다.
- 퀴즈 제한 시간은 MVP에서 사용하지 않는다.
- 오류는 원인과 해결 행동을 함께 말한다.

### Inclusive personas

- **첫 Web3 사용자**: 지갑·가스·서명 의미를 모른다. 매 단계에 평문 설명이 필요하다.
- **모바일 참여자**: 한 손 사용과 불안정한 네트워크를 가정한다.
- **키보드/화면 판독기 사용자**: 퀴즈와 운영자 폼 전체를 포인터 없이 완료해야 한다.

### Accepted Debt

| Item | Location | Why accepted | Owner / Exit |
|---|---|---|---|
| 실제 GIWA Wallet SDK 미연동 | wallet adapter | 공식 월렛 개발 중 | SDK 공개 시 어댑터 교체 |
