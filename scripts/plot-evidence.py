"""Render archived public control measurements. Requires matplotlib; not part of the Node build."""
from pathlib import Path
import csv, json, hashlib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
ROOT=Path(__file__).resolve().parent.parent
plt.rcParams.update({'figure.facecolor':'#171a15','axes.facecolor':'#171a15','axes.edgecolor':'#64705b','axes.labelcolor':'#dce3d1','text.color':'#f0f2e9','xtick.color':'#b5bfa8','ytick.color':'#b5bfa8','font.family':'DejaVu Sans','font.size':11,'grid.color':'#3a4233','grid.alpha':.65,'svg.fonttype':'path'})
accent='#d6f46a';blue='#7dd7db';orange='#efb477'
def rows(name):return list(csv.DictReader((ROOT/'content/evidence'/name).open()))
def style(ax):ax.grid(True,linewidth=.6);ax.spines[['top','right']].set_visible(False)
def save(fig,name):
 path=ROOT/'assets'/name
 fig.savefig(path,bbox_inches='tight',metadata={'Creator':'Portfolio measurement renderer','Date':None})
 path.write_text('\n'.join(line.rstrip() for line in path.read_text().splitlines())+'\n')
 plt.close(fig)
for fname,yfield,out,title in [('pid-position.csv','y','control-response.svg','Position control'),('pid-cascade.csv','x','control-cascade.svg','Cascade position control')]:
 d=rows(fname);t=[float(r['t_ms']) for r in d];y=[float(r[yfield]) for r in d];u=[float(r['u']) for r in d]
 fig,axs=plt.subplots(2,1,figsize=(9,6),sharex=True,layout='constrained');fig.suptitle(title,ha='left',x=.09,fontsize=17)
 axs[0].axhspan(.98,1.02,color=accent,alpha=.10,label='±2% band');axs[0].axhline(1,color='#a8af9f',linestyle='--',linewidth=1,label='Setpoint');axs[0].plot(t,y,color=accent,lw=2,label='Recorded response');axs[0].set_ylabel('Position / target');axs[0].legend(loc='lower right',facecolor='#171a15',edgecolor='#3a4233',fontsize=9)
 axs[1].plot(t,u,color=blue,lw=1.8,label='Applied command');axs[1].set_ylabel('Command u');axs[1].set_xlabel('Model time (ms)');axs[1].legend(facecolor='#171a15',edgecolor='#3a4233',fontsize=9)
 for ax in axs:style(ax)
 save(fig,out)
raw=(ROOT/'content/evidence/pid-benchmark.csv').read_text();d=[line.split(',') for line in raw.splitlines() if line.startswith('pid,')]
fig,ax=plt.subplots(figsize=(9,5.6),layout='constrained');fig.suptitle('Recorded update cost · 1–64 channels',x=.09,ha='left',fontsize=17)
for field,color in [(4,accent),(5,blue),(6,orange)]:
 for j,sweep in enumerate([d[:6],d[6:]]):
  ax.plot([int(r[1]) for r in sweep],[float(r[field]) for r in sweep],color=color,linestyle='-' if j==0 else '--',marker='o' if j==0 else 'x',label=f'{["p50","p95","p99"][field-4]} · sweep {"AB"[j]}')
ax.set_xscale('log',base=2);ax.set_xticks([1,4,8,16,32,64],labels=['1','4','8','16','32','64']);ax.set_xlabel('Control channels');ax.set_ylabel('Amortised nanoseconds / update');style(ax);ax.legend(facecolor='#171a15',edgecolor='#3a4233',fontsize=9,ncol=2);save(fig,'control-latency.svg')
summary={}
for name,col in [('pid-position.csv','y'),('pid-cascade.csv','x')]:
 d=rows(name);y=[float(r[col]) for r in d];outside=[i for i,v in enumerate(y) if abs(v-1)>.02];idx=outside[-1]+1 if outside else 0
 summary[name]={'samples':len(d),'sha256':hashlib.sha256((ROOT/'content/evidence'/name).read_bytes()).hexdigest(),'overshoot_percent':max(0,(max(y)-1)*100),'settling_2pct_ms':float(d[idx]['t_ms']) if idx<len(d) else None,'last_response':y[-1]}
(ROOT/'output').mkdir(exist_ok=True)
(ROOT/'output/measurement-summary.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary,indent=2))
