# GIWA Learn

**검증 지갑의 학습을 첫 GIWA 온체인 행동으로 바꾸는 Learn & Earn 온보딩 인프라입니다.**

GASOK 주 트랙은 **Track 03 — GIWA-Native Ideas**, 보조 트랙은 **Track 05 — Mass Adoption**입니다. 사용자는 프로젝트를 3분간 학습하고 퀴즈를 통과한 뒤, Dojang 검증 지갑으로 GIWA Sepolia 보상을 한 번 청구합니다.

> 공식 업비트 서비스가 아닙니다. GASOK 제출과 테스트넷 검증을 위한 작동형 프로토타입입니다.

## 바로 실행

Node.js 22 이상과 pnpm이 필요합니다.

```bash
pnpm install
pnpm verify
pnpm deploy:local
```

웹 MVP를 실행하려면 `pnpm dev` 후 브라우저에서 `http://localhost:3000`을 열고 `바로 체험하기`를 누릅니다. 심사용 데모 여정은 지갑과 환경 변수 없이 끝까지 작동합니다.

## 제품 구성

- `/` — 캠페인 소개와 즉시 체험 CTA
- `/learn/giwa-basics` — GIWA·Dojang·온체인 보상 학습
- `/quiz/giwa-basics` — 서버에서 채점하는 5문항 퀴즈
- `/claim/giwa-basics` — 데모 또는 실제 GIWA Sepolia 지갑 보상 청구
- `/operator` — GIWA 내부 캠페인팀용 운영 콘솔
- `/showcase` — 디자인 프리미티브 확인

## 검증

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:contracts
pnpm test:e2e
pnpm build
pnpm deploy:local
```

## GIWA Sepolia 실연동

`.env.example`을 `.env`로 복사하고 필요한 값을 넣습니다. GASOK 테스트넷 배포에서는 하나의 전용 테스트 키를 배포자와 claim signer로 함께 사용할 수 있습니다.

```bash
REWARDS_CONTRACT_ADDRESS=0x...
CLAIM_SIGNER_PRIVATE_KEY=0x...
PRIVATE_KEY=0x...
```

- `PRIVATE_KEY` — 테스트 ETH가 있는 배포 지갑
- `CLAIM_SIGNER_PRIVATE_KEY` — 합격자용 EIP-712 권한 서명 지갑. 초기 배포에서는 `PRIVATE_KEY`와 같은 테스트 키
- `REWARDS_CONTRACT_ADDRESS` — 배포 후 생성된 `GiwaLearnRewards` 주소

개인 키는 저장소나 메신저에 올리지 않습니다. 실제 운영 인수 전에는 관리자·운영자·claim signer를 각각 분리합니다. 테스트넷 배포와 소스 검증 절차는 [배포 체크리스트](./docs/deployment-checklist.md)를 따릅니다.

### 현재 공개 배포

- 웹: [giwa-learn-gasok.vercel.app](https://giwa-learn-gasok.vercel.app)
- 공개 저장소: [github.com/hslee-byte/giwa-learn](https://github.com/hslee-byte/giwa-learn)
- 보상 컨트랙트: [`0x22ac…C9Ca`](https://sepolia-explorer.giwa.io/address/0x22acb03CaB80Caaff541B39b1eEeBF374E02C9Ca#code)
- gLEARN 토큰: [`0x2082…6327`](https://sepolia-explorer.giwa.io/address/0x2082d1242Bac97553eaa1C5CDeD0987587c56327#code)
- 실제 `10 gLEARN` 청구: [`0xf143…f1de`](https://sepolia-explorer.giwa.io/tx/0xf143b3d6242532d77c7f37fa66b51f28314b167fc521b8910552c48202abf1de)

## 핵심 기술

- Next.js 16, React 19, TypeScript, Zod, viem
- Solidity 0.8.28, OpenZeppelin, Hardhat 3, Ignition
- GIWA Sepolia `91342`
- Dojang Scroll `0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9`
- 공개 테스트넷 attester ID `0xaa92f8c143657dde575de430aecaea6ca91f2e6072339b16932d426895d8d678` (GIWA Testnet Faucet)

공개 프로토타입은 누구나 재현 가능한 공식 Testnet Faucet attester를 사용합니다. 실제 업비트/GIWA 운영 전환 시에는 컨트랙트와 앱의 attester를 Upbit Korea ID로 교체합니다.

## 아키텍처

```text
학습·퀴즈
  → Next.js 서버 채점
  → Dojang 검증 상태 조회
  → 15분 EIP-712 청구 권한
  → GiwaLearnRewards의 청구 시점 재검증
  → gLEARN 지급 및 LearningRewardClaimed 이벤트
```

세부 신뢰 경계와 운영 구조는 [기술 아키텍처](./docs/technical-architecture.md)에서 확인할 수 있습니다.

## 제출 자료

- [GASOK 신청서 원고](./docs/gasok-application.md)
- [90초 데모 스크립트](./docs/demo-script-90s.md)
- [10장 피치덱 PDF](./docs/GIWA-Learn-GASOK-Pitch-Deck.pdf)
- [기술 아키텍처](./docs/technical-architecture.md)
- [배포 체크리스트](./docs/deployment-checklist.md)
