import { mkdirSync, copyFileSync, existsSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { renderSite } from './render.mjs';
export const publicAssets=['racing-loop.mp4','racing-poster.jpg','icra-qualification.mp4','early-robot.jpeg','early-pid.mp4','wro-demo-silent-125.mp4','wro-demo-poster.jpg','wro-robot.jpeg','roscon-stage.jpg','control-response.svg','control-cascade.svg','control-latency.svg'];
const evidenceFiles=['pid-benchmark.csv','pid-position.csv','pid-cascade.csv'];
export function build(){
  const root=resolve(import.meta.dirname,'..');
  const pages=renderSite(root);
  for(const [path,html] of pages){
    for(const destination of [root,root+'/dist']){
      mkdirSync(dirname(destination+'/'+path),{recursive:true});
      writeFileSync(destination+'/'+path,html);
    }
  }
  mkdirSync(root+'/dist/assets',{recursive:true});
  for(const f of ['styles.css','app.js','favicon.svg']) copyFileSync(root+'/'+f,root+'/dist/'+f);
  for(const f of publicAssets) if(existsSync(root+'/assets/'+f)) copyFileSync(root+'/assets/'+f,root+'/dist/assets/'+f);
  mkdirSync(root+'/dist/evidence',{recursive:true});
  for(const name of evidenceFiles)copyFileSync(root+'/content/evidence/'+name,root+'/dist/evidence/'+name);
  const sitemap=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...pages.keys()].filter(p=>!['404.html','rlx-core.html'].includes(p)).map(p=>`<url><loc>https://kaustubhkr.github.io/${p==='index.html'?'':p}</loc></url>`).join('')}</urlset>`;
  for(const destination of [root,root+'/dist']){
    writeFileSync(destination+'/sitemap.xml',sitemap);
    writeFileSync(destination+'/robots.txt','User-agent: *\nAllow: /\nSitemap: https://kaustubhkr.github.io/sitemap.xml\n');
    writeFileSync(destination+'/.nojekyll','');
  }
  // Remove retired outputs too: a removed page or download must stop being served.
  const allowed=new Set([...pages.keys(),'styles.css','app.js','favicon.svg','sitemap.xml','robots.txt','.nojekyll',...publicAssets.map(f=>'assets/'+f),...evidenceFiles.map(f=>'evidence/'+f)]);
  const prune=(dir,prefix='')=>{
    for(const name of readdirSync(dir)){
      const path=prefix+name;
      if(statSync(dir+'/'+name).isDirectory())prune(dir+'/'+name,path+'/');
      else if(!allowed.has(path))unlinkSync(dir+'/'+name);
    }
  };
  prune(root+'/dist');
  console.log(`Built ${pages.size} static pages for local review`);
}
if(process.argv[1] && resolve(process.argv[1])===resolve(import.meta.filename)) build();
