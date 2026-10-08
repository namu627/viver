// 사이트에 들어가는 모든 문구. 수정은 여기서만 하면 된다.

export const NOTION_URL = 'https://app.notion.com/p/3e30f963b6ce805c9aeec8674642f23d' // 노션 포트폴리오 메인
export const EMAIL = '0627eric@naver.com'
export const GITHUB_URL = 'https://github.com/namu627'

export const hero = {
  eyebrow: 'Service Planner, Junior — 2026',
  title: ['깊이 생각하고,', '끝까지 해냅니다.'],
  name: '남유찬',
  nameEn: 'YUCHAN NAM',
}

// 분해된 전체 모습 위에 한 줄
export const overview = {
  eyebrow: 'Exploded View',
  title: '무엇을 채우고, 무엇을 비워둘지.',
}

// 부품별 챕터 — part 값은 3D 시계의 부품 키와 같아야 한다.
// 애니메이션이 주인공이라 "선언 한 줄 + 프로젝트 이름"만. 세부 근거는 Notion에서.
export const chapters = [
  { part: 'crystal', label: 'Crystal', title: '만든 것을 냉정하게 봅니다.', project: 'MakeBlack' },
  { part: 'dial', label: 'Dial & Hands', title: '막히는 길목을 먼저 그립니다.', project: 'my stella' },
  { part: 'case', label: 'Case', title: '목적이 먼저, 도구는 그다음.', project: 'OptiMeal · 드론 홍보영상' },
  { part: 'movement', label: 'Movement', title: '생각을 오래 굴립니다.', project: 'OptiMeal · my stella' },
  { part: 'rotor', label: 'Rotor & Caseback', title: '맡은 자리에서 증명합니다.', project: 'WiFi CSI · moodico' },
]

export const why = {
  eyebrow: 'Why VIVER',
  title: ['이 시장을 아는 유저로서,', '만드는 쪽에 서고 싶습니다.'],
  points: [
    { k: '신뢰', v: '어떤 화면이 신뢰를 주는지 유저의 눈으로 봅니다.' },
    { k: '길목', v: '거래의 어느 길목에서 불안해지는지 경험으로 압니다.' },
    { k: '검증', v: '실제 사용자 곁에서 판단을 검증받고 싶습니다.' },
  ],
}

// Selected works — 이미지는 src/assets/works/<folder>/ 에 넣으면 자동 표시 (2장 이상이면 슬라이드, 파일명 순서).
// youtube: '영상ID' 가 있으면 영상 카드.
// 프로젝트별 Notion 페이지가 생기면 각 항목에 url: '...' 을 추가하면 그 페이지로 연결 (없으면 메인 Notion)
// link: 카드의 바로가기 주소 / linkLabel: 버튼 문구 (없으면 Notion)
export const works = [
  { name: 'OptiMeal', kind: '졸업 프로젝트', line: '소규모 레시피를 대규모 급식 식단으로.', folder: 'optimeal', size: 'wide', link: 'https://github.com/namu627/optimeal', linkLabel: 'GitHub' },
  { name: 'my stella', kind: '개인 앱', line: '실제 별 위에 남기는 나만의 기록.', folder: 'mystella', size: 'tall' }, // 코드가 비공개라 Notion으로 연결 (약관 페이지: https://namu627.github.io/mystella-legal/terms)
  { name: 'moodico', kind: '피로그래밍 23기', line: '무드 기반 화장품 추천, 3D 컬러 매트릭스.', youtube: 'Sbzhx7mM5Uc', link: 'https://youtu.be/Sbzhx7mM5Uc', linkLabel: 'YouTube' },
  { name: '다온아이앤씨', kind: '일경험 · 드론 홍보영상', line: '생성형 AI로 만든 30초 홍보영상.', youtube: 'XWMsQnpBwzk', link: 'https://youtu.be/XWMsQnpBwzk', linkLabel: 'YouTube' },
  { name: 'WiFi CSI Twin', kind: '메타버스 아카데미 7기', line: '재난 실험을 위한 1:1 디지털 트윈.', folder: 'wificsi' },
  { name: 'MakeBlack', kind: '개인 앱', line: '완료할수록 검게 물드는 팔레트.', folder: 'makeblack', link: 'https://github.com/namu627/MakeBlack', linkLabel: 'GitHub' },
]

export const profile = {
  school: '홍익대학교 세종 · 소프트웨어융합 / 빅데이터비즈니스',
  status: '졸업학기',
}
