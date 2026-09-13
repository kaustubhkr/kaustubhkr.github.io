import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, relative, extname, sep } from 'node:path';
import assert from 'node:assert/strict';
import { build, publicAssets } from './build.mjs';

build();
const root=resolve(import.meta.dirname,'../dist');
const walk=dir=>readdirSync(dir).flatMap(n=>{const path=resolve(dir,n);return statSync(path).isDirectory()?walk(path):[path]});
const files=walk(root),htmlFiles=files.filter(p=>extname(p)==='.html');
const documents=new Map(htmlFiles.map(p=>[p,readFileSync(p,'utf8')]));
const forbidden=[/coming\s+soon/i,/ctrl\s*\+\s*drift/i,/\bISDI\b/,/localhost:\d+/,/file:\/\//,/résumé|resume\.html|resume\.pdf/i,/kaustubhkr12@gmail\.com/i,/2023[–-]2027/];
let localLinks=0;
for(const [file,html] of documents){
  const name=relative(root,file);
  for(const re of forbidden) assert(!re.test(html),`${name}: stale content ${re}`);
  assert(/<title>[^<]+<\/title>/.test(html),`${name}: missing title`);
  assert(/name="viewport"/.test(html),`${name}: missing responsive viewport`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`${name}: duplicate IDs`);
  for(const match of html.matchAll(/\b(?:href|src|poster)="([^"]+)"/g)){
    const href=match[1].replaceAll('&amp;','&');
    if(/^(https?:|mailto:|data:)/.test(href)) continue;
    const url=new URL(href,'https://local.test/'+name.replaceAll(sep,'/'));
    let target=resolve(root,'.'+decodeURIComponent(url.pathname));
    if(existsSync(target)&&statSync(target).isDirectory()) target=resolve(target,'index.html');
    assert(existsSync(target),`${name}: broken local URL ${href}`);
    if(url.hash&&documents.has(target)){
      assert(documents.get(target).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),`${name}: broken anchor ${href}`);
    }
    localLinks++;
  }
}
assert.equal(htmlFiles.length,18,'Unexpected route count');
const assets=readdirSync(root+'/assets');
for(const name of assets) assert(publicAssets.includes(name),`Unexpected public asset: ${name}`);
for(const name of publicAssets) assert(assets.includes(name),`Missing public asset: ${name}`);
for(const file of files) assert(statSync(file).size<30*1024*1024,`Oversized file: ${relative(root,file)}`);
const privateProjects=JSON.parse(readFileSync(resolve(root,'../content/projects.json'),'utf8')).filter(p=>p.access.startsWith('Private'));
for(const p of privateProjects) assert(!p.repo,`Private repository link on ${p.id}`);
assert(documents.get(resolve(root,'projects/autonomous-racing.html')).includes('Qualification · 3rd'),'Qualification wording missing');
assert(documents.get(resolve(root,'about.html')).includes('Model Predictive Contouring Control (MPCC)'),'MPCC experience missing');
const homepage=documents.get(resolve(root,'index.html'));
assert(!/\bAge[s]?\s+\d|I’m 20|B\.Tech|college|student/.test(homepage),'Student or age framing remains on homepage');
assert(homepage.includes('kaustubhkr.work@gmail.com'),'Current contact email missing');
assert(!homepage.includes('Second company / Building in stealth'),'Retired hero label remains');
const rlPage=documents.get(resolve(root,'projects/reinforcement-learning.html'));
assert(rlPage.includes('data-default="world-models"'),'World-model view must lead the learning architecture');
for(const name of ['Dreamer','PlaNet','PETS','MuZero','Hessian','Residual','Cooperative'])assert(rlPage.includes(name),`Missing technical coverage: ${name}`);
console.log(`PASS: ${htmlFiles.length} pages, ${localLinks} local references, ${assets.length} public assets, private-source boundaries and required portfolio details.`);

const racingProject=JSON.parse(readFileSync(resolve(root,'../content/projects.json'),'utf8')).find(p=>p.id==='autonomous-racing');
assert(!racingProject.repo,'Private racing source link remains');
assert(!homepage.includes('Private compute workspaces'),'Peripheral project remains on homepage');
assert(!/trpo-training|redq-training/.test(rlPage),'Retired training plots remain on RL page');
assert(documents.get(resolve(root,'projects/control-runtime.html')).includes('control-latency.svg'),'Control measurements missing');

const fullContext=readFileSync(resolve(root,'llms-full.txt'),'utf8');
const contextPage=documents.get(resolve(root,'full-context.html'));
const catalogue=JSON.parse(readFileSync(resolve(root,'../content/projects.json'),'utf8'));
assert.equal((contextPage.match(/<article id=/g)||[]).length,15,'Full context must include every content page');
assert(!/<details\b|<[^>]+\shidden(?:[\s=>])/.test(contextPage),'Full context must not hide technical sections');
for(const p of catalogue){
  assert(fullContext.includes(`Source: https://kaustubhkr.github.io/projects/${p.id}.html`),`Missing context source: ${p.id}`);
  for(const text of [p.note,p.boundary,...p.sections.flatMap(([heading,items])=>[heading,...items])]){
    assert(fullContext.includes(text),`Missing project context: ${p.id}: ${text}`);
  }
}
for(const phrase of ['Dreamer V1 / V2 / V3','342 ms','AviRob · three-robot warehouse demo','Age 20']) assert(fullContext.includes(phrase),`Missing full-context detail: ${phrase}`);
assert(fullContext.includes('https://kaustubhkr.github.io/evidence/pid-benchmark.csv'),'Missing source CSV in full context');
assert(!/Turns 20|Turning 20/.test(documents.get(resolve(root,'about.html'))),'Stale age wording');
assert(fullContext.endsWith('END OF FULL PORTFOLIO CONTEXT\n'),'Missing context completion marker');
assert(contextPage.includes('END OF FULL PORTFOLIO CONTEXT'),'HTML context completion marker missing');
assert(homepage.includes('For AI readers:'),'Homepage agent discovery missing');
const agentIndex=readFileSync(resolve(root,'llms.txt'),'utf8');
assert(agentIndex.includes('fetch https://kaustubhkr.github.io/llms-full.txt first'),'Agent fetch instructions missing');
for(const [file,html] of documents){
  if(['404.html','rlx-core.html'].includes(relative(root,file)))continue;
  assert(html.includes('rel="describedby"'),'Agent index discovery missing');
  assert(html.includes('type="text/plain" title="Complete portfolio context"'),'Full text discovery missing');
}
console.log('PASS: complete agent context, project scope, source links and technical disclosures.');
