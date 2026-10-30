import re,sys
out=sys.argv[1]; pre=sys.argv[2] if len(sys.argv)>2 else ''
s=open('bundle.html',encoding='utf-8').read()
src=open('index.src.html',encoding='utf-8').read()
head=re.search(r'<head>(.*?)</head>',src,re.S).group(1)
tags=re.findall(r'<(?:meta|title|link)[^>]*>(?:[^<]*</title>)?',head)
for pat in [r'<meta charset[^>]*>',r'<meta name=viewport[^>]*>',r'<title>.*?</title>',r'<meta name=description[^>]*>',r'<meta name=robots[^>]*>',r'<meta name=theme-color[^>]*>',r'<link rel=icon[^>]*>',r'<link rel="icon"[^>]*>']:
    s=re.sub(pat,'',s,count=1,flags=re.S)
pl=f'<link rel="preload" as="image" href="{pre}" fetchpriority="high">' if pre else ''
newhead='<head>'+''.join(tags)+pl+'</head>'
m=re.match(r'<!DOCTYPE html><html lang=[^>]*>',s)
s='<!DOCTYPE html><html lang="pt-BR">'+newhead+s[m.end():]
assert s.find('charset')<400
open(out,'w',encoding='utf-8').write(s)
print(len(s.encode())//1024,'KB')
