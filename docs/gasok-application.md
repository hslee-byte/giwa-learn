# GASOK 신청서 원고 — GIWA Learn

## 프로젝트 기본 정보

- 프로젝트명: **GIWA Learn**
- 주 트랙: **Track 03 — GIWA-Native Ideas**
- 보조 트랙: **Track 05 — Mass Adoption**
- 한 문장: **검증 지갑의 학습을 첫 GIWA 온체인 행동으로 바꿉니다.**
- 운영 모델: 프로젝트용 셀프서브 SaaS가 아니라 업비트/GIWA 내부 캠페인팀이 직접 품질·예산·공개 상태를 관리하는 전용 인프라

공식 GASOK 안내는 5개 트랙 중복 참여를 허용합니다. 복수 선택 시 Track 03을 주 트랙, Track 05를 보조 트랙으로 제출하고, 폼이 단일 선택만 제공하면 Track 03을 선택합니다.

## 문제

거래소의 프로젝트 퀴즈와 소액 에어드랍은 이미 강한 도달 수단입니다. 하지만 기존 방식은 공지 열람과 정답 제출에서 끝나기 때문에 세 가지가 남지 않습니다.

1. 사용자가 프로젝트가 승인한 핵심 내용을 학습했는지 확인하기 어렵습니다.
2. 동일 지갑의 반복 청구를 공개된 지급 규칙으로 막기 어렵습니다.
3. 캠페인 참여가 GIWA의 첫 트랜잭션과 재사용 가능한 온체인 이력으로 이어지지 않습니다.

## 해결책

GIWA Learn은 `학습 → 퀴즈 → 검증 지갑 확인 → 보상 청구`를 하나의 3분 여정으로 묶습니다.

- 사용자는 프로젝트가 승인한 3개 학습 카드를 읽습니다.
- 정답이 브라우저에 노출되지 않는 5문항 퀴즈를 풉니다.
- 서버가 4문항 이상 정답인 사용자에게 15분짜리 EIP-712 청구 권한을 발급합니다.
- 보상 컨트랙트가 청구 시점에 Dojang Verified Address를 다시 확인합니다.
- 캠페인·지갑별 한 번만 보상하고 `LearningRewardClaimed` 이벤트를 남깁니다.

첫 데모 캠페인은 **3분 만에 GIWA 배우기**입니다. 사용자는 GIWA Chain, Dojang Verified Address, 온체인 보상 구조를 익히고 테스트넷 전용 `10 gLEARN`을 청구합니다.

5문항 퀴즈는 사용자의 깊은 이해나 인간 단위 유일성을 증명한다고 주장하지 않습니다. 승인된 핵심 학습의 통과 여부를 확인하고, 컨트랙트는 동일 검증 지갑의 반복 청구를 차단합니다.

## 왜 GIWA여야 하는가

GIWA Learn의 핵심은 일반적인 Learn & Earn 화면이 아니라 GIWA의 네이티브 구성요소를 연결한 보상 안전장치입니다.

- **Dojang**: 공개 테스트넷은 공식 GIWA Testnet Faucet attester로 실제 검증 흐름을 증명하고, 운영 전환 시 Upbit Korea attester로 교체합니다.
- **GIWA Sepolia**: 학습 완료를 사용자의 첫 GIWA 트랜잭션으로 만듭니다.
- **EVM 호환성**: Solidity와 EIP-712를 사용해 공개 검증 가능한 지급 규칙을 구현합니다.
- **GIWA 운영 콘솔**: 콘텐츠 승인, 예산 입력, 긴급 중지만 사람이 담당하고 채점·검증·서명·중복 차단·집계는 자동화합니다.

Dojang을 빼면 검증 사용자 한정 보상이 사라지고, GIWA를 빼면 학습에서 첫 온체인 행동으로 이어지는 제품 루프가 사라집니다. 따라서 GIWA는 단순 배포 체인이 아니라 제품의 신뢰 계층입니다.

일반적인 태스크 플랫폼이 외부 행동 인증과 멀티체인 보상에 집중한다면, GIWA Learn은 **업비트 퀴즈의 유입 → Dojang 검증 상태 → 청구 시점 재검증 → 첫 GIWA 트랜잭션**을 GIWA가 직접 운영하는 하나의 루프로 묶습니다.

## 작동하는 MVP

[로그인 없이 체험하는 GIWA Learn 웹 MVP](https://giwa-learn-gasok.vercel.app)

### 제출 링크

- 공개 GitHub: https://github.com/hslee-byte/giwa-learn
- 90초 데모 영상: https://github.com/hslee-byte/giwa-learn/releases/download/gasok-submission/GIWA-Learn-90s-Demo.mp4
- 피치덱 PDF: https://github.com/hslee-byte/giwa-learn/releases/download/gasok-submission/GIWA-Learn-GASOK-Pitch-Deck.pdf
- 기술 문서: https://github.com/hslee-byte/giwa-learn/blob/main/docs/technical-architecture.md

현재 구현된 범위:

- 반응형 참여자 여정: 홈, 학습, 퀴즈, 보상 청구
- 지갑 없이 끝까지 확인하는 명시적 심사용 데모 모드
- injected EVM wallet 기반 GIWA Sepolia 실제 청구 경로
- Dojang `isVerified` 조회
- 서버 전용 퀴즈 채점과 EIP-712 합격 권한
- GIWA 내부 운영자용 캠페인 상태·예산·중지·집행 규칙 콘솔
- GIWA 보상 컨트랙트, 테스트 토큰, Hardhat Ignition 배포 모듈
- 지갑 미검증, 서명 오용, 중복 청구, 예산 초과, 활성 예산 인출을 막는 테스트

### 온체인 검증 증거

- GIWA Sepolia `GiwaLearnRewards`: [`0x22ac…C9Ca`](https://sepolia-explorer.giwa.io/address/0x22acb03CaB80Caaff541B39b1eEeBF374E02C9Ca)
- 소스 검증된 `gLEARN`: [`0x2082…6327`](https://sepolia-explorer.giwa.io/address/0x2082d1242Bac97553eaa1C5CDeD0987587c56327#code)
- 공식 Faucet Dojang 발급: [`0x73c6…25a4`](https://sepolia-explorer.giwa.io/tx/0x73c67b7fd545ee6c82f66654dd4cb0eac99d31a0704f067da662dba4bd9325a4)
- 실제 `10 gLEARN` 청구: [`0xf143…f1de`](https://sepolia-explorer.giwa.io/tx/0xf143b3d6242532d77c7f37fa66b51f28314b167fc521b8910552c48202abf1de)
- 청구 후 확인값: `hasClaimed=true`, 잔여 예산 `9,990 gLEARN`, 청구 수 `1`

## 보안 및 개인정보

- 퀴즈 정답과 합격 기준은 클라이언트 번들에 포함하지 않고 서버에서 채점합니다.
- 개인정보나 KYC 원문은 저장하지 않으며 Dojang의 검증 결과만 조회합니다.
- 청구 권한은 캠페인 ID, 사용자 지갑, 완료 ID, nonce, 만료 시각에 묶입니다.
- 컨트랙트는 청구 시 Dojang을 재확인하고 지갑당 한 번만 지급합니다.
- 보상은 선예치된 수량을 초과할 수 없고, 활성 캠페인의 잔여 예산은 인출할 수 없습니다.
- 관리자 전역 중지와 캠페인별 긴급 중지를 분리했습니다.

## 운영 모델과 사람 개입 최소화

사람이 하는 일은 세 가지입니다.

1. 프로젝트 학습 내용과 문제를 승인합니다.
2. 보상 단가·총예산·기간을 승인합니다.
3. 이상 징후가 있을 때 캠페인을 긴급 중지합니다.

시스템은 게시, 채점, 지갑 검증, 권한 서명, 중복 차단, 지급, 이벤트 집계를 자동 처리합니다. 초기에는 INF CryptoLab이 콘텐츠와 캠페인 운영을 보조하고, 최종 운영 권한과 품질 기준은 업비트/GIWA에 둡니다.

## 시장 진입

1단계는 신규 GIWA 사용자에게 GIWA 자체를 가르치는 캠페인입니다. 2단계는 GIWA 생태계 프로젝트의 신규 기능·토큰·보안 교육 캠페인으로 확장합니다. 3단계는 누적된 캠페인 완료 이벤트를 지갑의 Learning Passport로 활용해 다음 캠페인의 난이도와 보상을 개인화합니다.

초기 배포 채널은 이미 사용자가 익숙한 업비트의 프로젝트 퀴즈·소액 보상 문법입니다. 새로운 행동을 교육하기보다 기존 행동을 GIWA 온체인 활성화로 연결하기 때문에 채택 장벽이 낮습니다. 생태계 프로젝트 2곳은 현재 확보 실적이 아니라 GASOK 선정 후 90일 파일럿 목표입니다.

## 실행 역량

INF CryptoLab 소개서 기준으로 팀은 다음 실행 경험을 보유합니다.

- Web3 클라이언트 15곳 이상 — 소개서 p.2
- 프로젝트 레퍼런스 80건 이상 — 소개서 p.2
- KOL 집행 누적 약 550만 달러 — 소개서 p.5
- 단일·누적 캠페인 참여자 10,000명 이상 경험 — 소개서 p.18
- 지갑 연결 1,100% 성장 레퍼런스 — 소개서 p.26
- 로열 사용자 3,000명 규모 레퍼런스 — 소개서 p.26

이 수치는 GIWA Learn의 현재 사용 지표가 아니라 팀의 과거 캠페인 수행 레퍼런스입니다. MVP 운영 콘솔의 숫자도 심사용 샘플 데이터로 명확히 표시했습니다.

현재 기술 준비도는 Production Next.js 앱, GIWA Sepolia 배포 컨트랙트, 실제 Dojang 검증·보상 청구, Hardhat 배포 자동화, 18개 unit·contract 테스트와 데스크톱·태블릿·모바일 E2E 여정입니다. 메인넷 또는 실자산 운영 전에는 GIWA 기술 리뷰와 제3자 컨트랙트 보안 감사를 완료합니다.

## 성공 지표

- 학습 시작 대비 완료율
- 완료 대비 퀴즈 합격률
- 합격 대비 검증 지갑 연결률
- 검증 지갑 대비 온체인 청구율
- 고유 검증 지갑당 보상·운영 비용
- 캠페인당 신규 GIWA 활성 지갑 수
- 첫 청구 후 30일 내 두 번째 GIWA 행동 비율
- 캠페인별 보상 예산 대비 고유 검증 학습자 수

## 90일 로드맵

- 0~30일: GIWA Basics 캠페인 테스트넷 운영, 퍼널·오류·부정 청구 로그 검증
- 31~60일: 생태계 프로젝트 2곳의 학습 캠페인 파일럿, 콘텐츠 승인 템플릿 정립
- 61~90일: 운영 콘솔 실데이터 연동, 캠페인 템플릿, Learning Passport 조회 화면 공개

## 심사 기준 대응

| 기준 | 대응 |
| --- | --- |
| GIWA 적합성 | Dojang 실시간 검증과 GIWA 청구 트랜잭션이 핵심 제품 루프 |
| 독창성 | 거래소 퀴즈를 검증 학습자 기반 온체인 온보딩 인프라로 전환 |
| 실현 가능성 | Production 웹 MVP, GIWA Sepolia 컨트랙트, 실제 보상 청구와 재현 가능한 배포 모듈 완성 |
| 시장성 | 익숙한 업비트 퀴즈 문법을 활용해 GIWA 신규 행동의 채택 장벽 축소 |
| 팀 역량 | 80건 이상 Web3 레퍼런스와 대규모 캠페인 집행 경험 |
| 지갑 경험 | 지갑 없는 심사 데모와 Dojang 검증 지갑의 실제 GIWA Sepolia 청구 경로 제공 |

## 마지막 한 문장

**GIWA Learn은 에어드랍 비용을 일회성 클릭 구매가 아니라, 핵심 학습을 통과한 검증 지갑의 첫 GIWA 행동을 만드는 온보딩 예산으로 바꿉니다.**

## GASOK 선정 시 요청

- GIWA 내부 운영 스폰서와 기술 리뷰 담당 각 1명
- GIWA Basics 테스트 캠페인 보상 예산
- 90일 파일럿에 참여할 생태계 프로젝트 2곳 연결

## 공식 참고 자료

- [GASOK](https://giwa.io/gasok)
- [GIWA Verified Address](https://docs.giwa.io/giwa-chain/en/giwa-ecosystem/dojang/verified-address)
- [GIWA OnchainVerifiable](https://docs.giwa.io/giwa-chain/en/get-started/smart-contract/onchainverifiable)
- [GIWA Hardhat 배포 가이드](https://docs.giwa.io/giwa-chain/en/get-started/smart-contract/develop/hardhat)
