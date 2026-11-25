import sys
from PIL import Image
n=sys.argv[2:];c=2;W,H=960,540;s=.78
o=Image.new('RGB',(int(W*s)*c,int(H*s)*((len(n)+1)//c)))
for i,k in enumerate(n): o.paste(Image.open(f'tests/shots/{k}.png').convert('RGB').resize((int(W*s),int(H*s))),((i%c)*int(W*s),(i//c)*int(H*s)))
o.save(sys.argv[1])
