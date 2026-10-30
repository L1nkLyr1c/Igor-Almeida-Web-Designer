import re,sys
s=open('bundle.html',encoding='utf-8').read()
src=open('index.html',encoding='utf-8').read()
head=re.search(r'<head>(.*?)</head>',src,re.S).group(1)
tags=re.findall(r'<(?:meta|title|link)[^>]*>(?:[^<]*</title>)?',head)
for pat in [r'<meta charset[^>]*>',r'<meta name=viewport[^>]*>',r'<title>.*?</title>',r'<meta name=description[^>]*>',r'<meta name=robots[^>]*>',r'<meta name=theme-color[^>]*>',r'<link rel=icon[^>]*>',r'<link rel="icon"[^>]*>']:
    s=re.sub(pat,'',s,count=1,flags=re.S)
newhead='<head>'+''.join(tags)+'<link rel="preload" as="image" href="../assets/projetos/forno-vivo/capa.webp" fetchpriority="high"></head>'
s=s.replace('<!DOCTYPE html><html lang=pt-BR>','<!DOCTYPE html><html lang="pt-BR">'+newhead,1)
assert s.find('charset')<400, s[:400]
open(sys.argv[1],'w',encoding='utf-8').write(s)
print(len(s.encode())//1024,'KB'); print(s[:900])
