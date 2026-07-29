# GIWA Learn 배포 체크리스트

## 필요한 값

- GIWA Sepolia 테스트 ETH가 있는 배포 지갑 private key
- GASOK 테스트넷용 전용 private key 1개
- 최종 운영자·관리자 지갑 주소

개인 키는 채팅이나 문서에 붙여넣지 않고 로컬 환경 변수 또는 호스팅 비밀 저장소에 직접 입력합니다. 프로토타입의 초기 배포자·관리자·운영자·claim signer는 이 테스트 지갑 하나로 설정되고, 실제 운영 인수 전 역할과 키를 분리합니다.

## 1. 로컬 최종 검증

```bash
cd /path/to/giwa-learn
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm test:contracts
pnpm test:e2e
pnpm build
pnpm deploy:local
```

모든 명령이 종료 코드 0인지 확인합니다.

## 2. GIWA Sepolia 컨트랙트 배포

루트에 `.env`를 만들고 전용 테스트 키를 입력합니다.

```bash
PRIVATE_KEY=0x...
CLAIM_SIGNER_PRIVATE_KEY=0x...
```

배포합니다.

```bash
pnpm deploy:giwa
```

출력에서 아래 두 주소를 기록합니다.

```text
GiwaLearnRewards: 0x...
LearnRewardToken: 0x...
```

## 3. Explorer 소스 검증

```bash
pnpm exec hardhat --network giwaSepolia --build-profile production verify blockscout \
  --contract contracts/GiwaLearnRewards.sol:GiwaLearnRewards \
  <GiwaLearnRewards 주소> \
  <관리자 주소> \
  <운영자 주소> \
  <claim signer 주소> \
  0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9 \
  0xaa92f8c143657dde575de430aecaea6ca91f2e6072339b16932d426895d8d678

pnpm exec hardhat --network giwaSepolia --build-profile production verify blockscout \
  --contract contracts/LearnRewardToken.sol:LearnRewardToken \
  <LearnRewardToken 주소> \
  <토큰 수령 주소>
```

Explorer의 `Contract` 탭에 소스와 Read/Write 인터페이스가 보이는지 확인합니다.

## 4. 웹 환경 변수

```bash
REWARDS_CONTRACT_ADDRESS=<GiwaLearnRewards 주소>
CLAIM_SIGNER_PRIVATE_KEY=<claim signer private key>
```

초기 배포에서는 `CLAIM_SIGNER_PRIVATE_KEY`가 `PRIVATE_KEY`와 같아야 합니다. 다르면 컨트랙트가 서명을 거절합니다. 두 값 모두 브라우저에 노출되는 `NEXT_PUBLIC_` 접두사를 절대 붙이지 않습니다.

## 5. 공개 배포 후 스모크 테스트

1. 홈에서 학습 화면으로 이동합니다.
2. 카드 3개와 퀴즈 5문항을 완료합니다.
3. 미검증 지갑에서 Dojang 단계가 거절되는지 확인합니다.
4. 검증 지갑에서 gLEARN을 청구합니다.
5. Explorer에서 `LearningRewardClaimed` 이벤트를 확인합니다.
6. 같은 지갑의 두 번째 청구가 거절되는지 확인합니다.
7. 운영 콘솔에서 캠페인 중지·재개를 확인합니다.

## 6. GASOK 제출 폼 반영

- 공개 MVP URL
- GitHub 저장소 URL
- 90초 데모 영상 URL
- GIWA Sepolia `GiwaLearnRewards` 주소
- Explorer 소스 검증 URL
- 기술 문서 URL
- 피치덱 PDF URL

## 배포 기록

```text
웹 배포 일시: 2026-07-15
웹 런타임: Vercel Production / Node.js 22.x
웹 URL: https://giwa-learn-gasok.vercel.app
웹 QA: desktop + tablet + mobile 18화면 및 전체 학습자 여정 통과
컨트랙트 배포 일시: 2026-07-15
배포자 주소: 0x985E8D68cF4B02d5c476191D446f1dB8a1D0c71E
GiwaLearnRewards: 0x22acb03CaB80Caaff541B39b1eEeBF374E02C9Ca
LearnRewardToken: 0x2082d1242Bac97553eaa1C5CDeD0987587c56327
LearnRewardToken 소스 검증: https://sepolia-explorer.giwa.io/address/0x2082d1242Bac97553eaa1C5CDeD0987587c56327#code
실제 claim 트랜잭션: https://sepolia-explorer.giwa.io/tx/0xf143b3d6242532d77c7f37fa66b51f28314b167fc521b8910552c48202abf1de
중복 claim: AlreadyClaimed 거절 확인
2026-07-29 라이브 QA: desktop + mobile 학습·퀴즈·데모 청구, 미검증 지갑 거절,
  검증 지갑 live_ready, 실제 LearningRewardClaimed 이벤트, 중복 청구 revert,
  운영 콘솔 중지·재개 확인
GiwaLearnRewards 소스 검증: Explorer API 403으로 Standard JSON 수동 업로드 대기
GitHub URL: https://github.com/hslee-byte/giwa-learn
데모 영상 URL: https://github.com/hslee-byte/giwa-learn/releases/download/gasok-submission/GIWA-Learn-90s-Demo.mp4
피치덱 URL: https://github.com/hslee-byte/giwa-learn/releases/download/gasok-submission/GIWA-Learn-GASOK-Pitch-Deck.pdf
기술 문서 URL: https://github.com/hslee-byte/giwa-learn/blob/main/docs/technical-architecture.md
```
