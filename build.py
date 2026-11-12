import os
here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, 'src')
os.makedirs(os.path.join(here, 'dist'), exist_ok=True)
shell = open(os.path.join(src, 'shell.html'), encoding='utf-8').read()
js = '\n'.join(open(os.path.join(src, f), encoding='utf-8').read() for f in ['data.js', 'audio.js', 'world.js', 'game.js', 'main.js'])
out = shell.replace('/*__SCRIPTS__*/', js)
open(os.path.join(here, 'dist', 'bonfire.html'), 'w', encoding='utf-8').write(out)
# 로컬 테스트용: 스켈레톤을 씌운 파일
test = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + out + '</body></html>'
open(os.path.join(here, 'dist', 'test.html'), 'w', encoding='utf-8').write(test)
print(len(out))
