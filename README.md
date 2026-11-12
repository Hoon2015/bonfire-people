# 모닥불 사람들

말 없이 얼굴·몸짓·소리·그림말로 소통하며 구석기 무리와 함께 가을과 첫 겨울 이레를 넘기는 게임의 수직 슬라이스 프로토타입입니다.

- 플레이: `index.html`을 브라우저로 열거나 GitHub Pages 주소로 접속
- 탭: 이동 / 길게 누르기: 사람에게는 몸짓 바퀴, 땅·짐승에게는 가리키기 / 밤: 북 박자에 맞춰 탭

## 구조

- `src/data.js` 규칙·무리·그림말·감정 엔진(`appraise`)·얼굴 생성기
- `src/audio.js` WebAudio 목소리·북·소리
- `src/world.js` 아이소메트릭 지도·길찾기(A*)·스프라이트
- `src/game.js` 하루 흐름·NPC 루틴·사냥·발견·밤·사회 반응·튜토리얼
- `src/main.js` 렌더링·HUD·패널·입력
- `src/shell.html` 화면 뼈대와 스타일

`python3 build.py` → `dist/bonfire.html`(본문)과 `dist/test.html`(완전한 HTML). 배포용 `index.html`은 `dist/test.html`을 복사한 것입니다.
