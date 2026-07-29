# GIWA Learn 기술 아키텍처

## 시스템 흐름

```text
참여자 브라우저
  ├─ 학습 카드 완료
  ├─ 공개 질문·선택지 수신
  └─ 지갑 서명·claim 전송
          │
          ▼
Next.js API
  ├─ 정답 비공개 채점
  ├─ 4/5 합격 확인
  ├─ GIWA Dojang isVerified 조회
  └─ 15분 EIP-712 claim 권한 서명
          │
          ▼
GIWA Sepolia
  ├─ Dojang Scroll: 검증 상태 재확인
  ├─ GiwaLearnRewards: 기간·서명·nonce·중복·예산 검사
  ├─ gLEARN: 테스트 보상 지급
  └─ LearningRewardClaimed: 완료 이벤트
          │
          ▼
GIWA 운영 콘솔
  └─ 컨트랙트 이벤트 기준 참여·청구·잔여 예산 집계
```

## 핵심 컨트랙트

### GiwaLearnRewards

- `AccessControl`: 관리자, 운영자, 긴급 중지 역할 분리
- `EIP712`와 `SignatureChecker`: EOA와 스마트 지갑 서명 검증
- `Pausable`: 전역 긴급 중지
- `ReentrancyGuard`와 `SafeERC20`: 안전한 토큰 지급
- `Campaign`: 토큰, 단가, 기간, 잔여 예산, 콘텐츠 해시, 청구 수
- `hasClaimed`: 캠페인·지갑별 한 번만 지급
- `authorizationUsed`: nonce 권한 재사용 차단

### Claim 권한

```text
Claim(
  campaignId,
  learner,
  completionId,
  nonce,
  deadline
)
```

권한은 다른 캠페인이나 지갑에 사용할 수 없고 기한 이후에는 거절됩니다. 컨트랙트는 서명을 확인하기 전에 Dojang 검증 상태를 청구 시점에 다시 조회합니다.

## 신뢰 경계

| 경계 | 신뢰하지 않는 값 | 검증 |
| --- | --- | --- |
| 브라우저 → 퀴즈 API | 답안, 캠페인 요청 | Zod 스키마와 서버 정답표 |
| 브라우저 → 권한 API | 지갑 주소, 답안 | Zod, 재채점, Dojang 조회 |
| 권한 API → 컨트랙트 | EIP-712 권한 | 도메인, signer, deadline, nonce |
| 컨트랙트 → Dojang | 검증 상태 | 공식 Dojang Scroll 직접 호출 |
| 운영자 → 캠페인 | 예산, 기간, 콘텐츠 | 역할 권한과 선예치 토큰 |

## 개인정보 원칙

- 이름, 전화번호, 생년월일, KYC 문서를 받거나 저장하지 않습니다.
- 지갑 주소와 Dojang의 참·거짓 결과만 사용합니다.
- 퀴즈 답안은 권한 발급 시점에만 처리하고 온체인에 기록하지 않습니다.
- 온체인에는 캠페인 ID, 지갑, 완료 ID, 보상 이벤트만 남습니다.

## 데모와 라이브 분리

- **데모**: 지갑 설치 없이 제품 여정과 상태 전환을 보여주는 로컬 시뮬레이션. 화면에 `DEMO`를 고정 표시합니다.
- **라이브**: injected EVM wallet, GIWA Sepolia, Dojang, EIP-712 signer, 실제 컨트랙트 claim을 사용합니다.
- 운영 콘솔의 현재 수치는 심사용 샘플이며 `SAMPLE DATA`로 표시합니다. 실운영에서는 컨트랙트 이벤트 인덱서로 교체합니다.

## 공식 네트워크 의존성

- Chain ID: `91342`
- RPC: `https://sepolia-rpc.giwa.io`
- Explorer: `https://sepolia-explorer.giwa.io`
- Dojang Scroll: `0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9`
- 공개 프로토타입 attester: GIWA Testnet Faucet `0xaa92f8c143657dde575de430aecaea6ca91f2e6072339b16932d426895d8d678`
- 운영 전환 대상 attester: Upbit Korea `0xd99b42e778498aa3c9c1f6a012359130252780511687a35982e8e52735453034`
- GiwaLearnRewards: `0x22acb03CaB80Caaff541B39b1eEeBF374E02C9Ca`
- LearnRewardToken: `0x2082d1242Bac97553eaa1C5CDeD0987587c56327`

공개 테스트넷은 인간 검증 없이도 심사자가 재현할 수 있는 공식 Faucet attester를 사용합니다. 운영 배포에서는 같은 인터페이스를 유지한 채 Upbit Korea attester로 교체합니다.

공식 문서: [GIWA 연결 정보](https://docs.giwa.io/giwa-chain/en/get-started/connect-to-giwa), [OnchainVerifiable](https://docs.giwa.io/giwa-chain/en/get-started/smart-contract/onchainverifiable), [Hardhat 배포](https://docs.giwa.io/giwa-chain/en/get-started/smart-contract/develop/hardhat)
