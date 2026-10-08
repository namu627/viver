# VIVER — 남유찬 포트폴리오

서비스기획 Junior 지원용 원페이지 포트폴리오. 스크롤하면 3D 시계가 분해되며 부품마다 일하는 방식이 하나씩 나타납니다.

- 사이트: https://namu627.github.io/viver/
- 스택: React · Vite · three.js · GSAP ScrollTrigger · Lenis · Motion
- 3D 시계는 이미지 없이 코드로 모델링한 오리지널 디자인입니다 (특정 브랜드와 무관).

## 개발

```
npm install
npm run dev
```

문구는 `src/content.js`, 프로젝트 이미지는 `src/assets/works/<프로젝트>/` 에서 수정합니다.
main에 push하면 GitHub Actions가 빌드해 Pages에 배포합니다.
