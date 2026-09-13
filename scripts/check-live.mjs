import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

// Run after deployment. Check actual public bytes against this commit's build,
// allowing a short window for GitHub Pages CDN propagation.
const base='https://kaustubhkr.github.io/';
const root=resolve(import.meta.dirname,'../dist');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const textPaths=['','index.html','full-context.html','llms.txt','llms-full.txt','robots.txt','sitemap.xml'];
async function verify(path,type,agent='portfolio-release-check'){
  const response=await fetch(base+path,{headers:{'User-Agent':agent,'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)});
  assert.equal(response.status,200,`${path}: HTTP ${response.status}`);
  assert(response.headers.get('content-type')?.includes(type),`${path}: incorrect content type`);
  assert(!/noindex|nofollow|none/i.test(response.headers.get('x-robots-tag')||''),`${path}: restrictive crawler header`);
  const bytes=Buffer.from(await response.arrayBuffer());
  assert.equal(digest(bytes),digest(readFileSync(resolve(root,path||'index.html'))),`${path}: live bytes differ from build`);
}
async function check(){
  const results=await Promise.allSettled(textPaths.map(path=>verify(path,(!path||path.endsWith('.html'))?'text/html':path.endsWith('.xml')?'xml':'text/plain')));
  const failed=results.filter(r=>r.status==='rejected');
  if(failed.length)throw new AggregateError(failed.map(r=>r.reason),'Live text checks failed');
  // This checks that these UA strings aren't blocked. It is not a claim that
  // the vendors have indexed the site or fetched it from their own networks.
  for(const agent of ['OAI-SearchBot','ChatGPT-User','Claude-User','Claude-SearchBot'])await verify('llms-full.txt','text/plain',agent);
  for(const path of ['assets/avirob-isaac-sim.mp4','assets/wro-demo-silent-125.mp4','assets/racing-loop.mp4']){
    const response=await fetch(base+path,{headers:{Range:'bytes=0-1023'},signal:AbortSignal.timeout(15000)});
    assert.equal(response.status,206,`${path}: byte-range playback unavailable`);
    assert(response.headers.get('content-type')?.includes('video/mp4'),`${path}: incorrect video type`);
    const bytes=Buffer.from(await response.arrayBuffer());
    assert(bytes.equals(readFileSync(resolve(root,path)).subarray(0,1024)),`${path}: media bytes differ`);
  }
}
for(let attempt=1;attempt<=6;attempt++){
  try{await check();console.log('PASS: live pages and agent exports match the build; crawler requests and video byte ranges succeed.');break;}
  catch(error){
    const reasons=error.errors?.map(e=>e.message).join('; ')||error.message;
    if(attempt===6)throw error;
    console.log(`Live check ${attempt}/6: ${reasons}. Retrying after CDN propagation.`);
    await new Promise(resolve=>setTimeout(resolve,10000));
  }
}
