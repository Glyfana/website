# glyfana-website 인수인계

작성일: 2026-10-18 (KST)

## 목적과 현재 상태

Glyfana 다운로드·릴리스 안내 및 유료 프리뷰 진입 페이지.

- 단계: **정적 배포 사이트**
- 기준: 저장소 코드·설정·기존 문서를 확인한 인수인계이며, 이번 작업에서 앱 전체 테스트나 운영 배포를 수행하지 않았다.
- 시장 검증: 유료 고객·매출·반복 사용은 이번 점검에서 확인되지 않았다. 구현 정도와 수익성은 별도로 판단해야 한다.

## 저장소와 작업 기준

- 저장소: [Glyfana/website](https://github.com/Glyfana/website)
- 인수인계 반영 브랜치: `backup/workspace-2026-10-18`
- 문서 작성 직전 코드: [`7b3d56cba878`](https://github.com/Glyfana/website/commit/7b3d56cba8780bf3c07a19646129a8ddb6552074)
- 위 커밋은 코드 기준점이며 이 문서 추가 커밋과는 다르다.
- 기존 작업 보존용 백업 브랜치를 유지했다. 기본 브랜치에 병합하거나 운영 배포한 상태로 간주하지 않는다.

## 구조와 구현 범위

site/app.js가 GitHub Releases 정보를 읽고 site/release-manifest.json으로 대체한다. 영문/한국어 페이지, 릴리스 메타데이터 갱신 workflow, 스크린샷 도구가 있다.

주요 위치: [scripts/](scripts/), [site/](site/).

## 실행과 검증

명령은 별도 표시가 없으면 저장소 루트에서 실행한다. 환경 예제의 값과 필요한 DB/외부 서비스를 먼저 준비한다. 예제 복사 시 기존 환경 파일을 덮어쓰지 않는다.

```bash
python3 -m http.server 4177 --bind 127.0.0.1 --directory site
```

다음은 인수자가 실행할 검증 명령이며 이번 작업의 통과 기록은 아니다.

```bash
node --check site/app.js
```

## 설정과 데이터 보존

웹 루트는 site이다. release-manifest.json의 commerce 설정이 가격 문구·결제/문의 링크·노출 여부를 결정한다. API 장애 시 고정 manifest가 사용되므로 앱 릴리스와 함께 갱신해야 한다.

## 미완료 사항과 주의점

현재 작업은 backup/workspace-2026-10-18 브랜치에 있다. 기본 브랜치/Pages 운영본과 동일하지 않을 수 있다. 유료 CTA는 결제·라이선스 처리 시스템의 완성을 뜻하지 않는다.

## 다음 담당자가 먼저 할 일

영문/한국어 다운로드 링크와 릴리스 자산 SHA256 안내를 실제 배포 파일에 대조한다. 백업 브랜치 변경을 기본 브랜치와 비교한 뒤 Pages 배포 대상에 통합한다.

## 먼저 읽을 자료

- [README.md](README.md)
- [site/README.md](site/README.md)
