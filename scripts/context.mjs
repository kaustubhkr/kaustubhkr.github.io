// One public reading surface, derived from the rendered pages on every build.
// Deliberately retain collapsed details and every technical tab's content.
const origin='https://kaustubhkr.github.io/';
const mirror='https://raw.githubusercontent.com/kaustubhkr/kaustubhkr.github.io/main/llms-full.txt';
const decode=s=>s.replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n))).replace(/&(amp|lt|gt|quot|apos|nbsp);/g,(_,n)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[n]));
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr=(tag,name)=>decode(tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]||'');

export function pageText(html,path){
  const absolute=url=>new URL(url,origin+path).href;
  let body=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';
  body=body.replace(/<(script|style|aside|nav)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
  body=body.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/g,(_,a,text)=>`${text} (${absolute(attr(a,'href'))}) `);
  body=body.replace(/<img\b[^>]*>/g,tag=>`\nImage: ${attr(tag,'alt')} (${absolute(attr(tag,'src'))})\n`);
  body=body.replace(/<source\b[^>]*>/g,tag=>`\nMedia: ${absolute(attr(tag,'src'))}\n`);
  body=body.replace(/<h([1-6])\b[^>]*>/g,(_,level)=>'\n\n'+'#'.repeat(Number(level))+' ')
    .replace(/<li\b[^>]*>/g,'\n- ')
    .replace(/<br\s*\/?>|<\/(?:p|div|section|article|figure|figcaption|li|tr|h[1-6]|summary|details)>/g,'\n')
    .replace(/<\/(?:td|th)>/g,' | ')
    .replace(/<[^>]*>/g,' ');
  return decode(body).split('\n').map(line=>line.replace(/[ \t]+/g,' ').trim()).join('\n').replace(/\n{3,}/g,'\n\n').trim();
}

export function contextDocuments(pages){
  const entries=[...pages].filter(([path])=>!['404.html','rlx-core.html','full-context.html'].includes(path)).map(([path,html])=>({path,id:path.replace(/[^a-z0-9]/gi,'-'),title:decode(html.match(/<title>(.*?)<\/title>/)[1]).replace(' · Kaustubh Krishna',''),text:pageText(html,path)}));
  const intro='Complete public portfolio of Kaustubh Krishna: founder context, life timeline, every project, all technical tabs and deep dives, measurements, source links and media references. Generated from the same pages as the human-readable site. Private source code is not included. Simulation, physical deployment, measured results and research direction retain their original scope.';
  const guide=`Reading guide: this document contains ${entries.length} source pages, including every technical tab and deep dive. Read the project scope and evidence alongside its capabilities. Source URLs identify the original pages to cite; media URLs identify recordings and images, not video transcripts. If your reader truncates the response, use the source-page index at ${origin}llms.txt to retrieve the missing sections. A complete response ends with END OF FULL PORTFOLIO CONTEXT. No JavaScript, login or interactive navigation is needed. If this host is unavailable to your reader, the same public text is mirrored at ${mirror}.`;
  const full='# Kaustubh Krishna — full portfolio context\n\n'+intro+'\n\n'+guide+'\n\n'+entries.map(e=>`# ${e.title}\nSource: ${origin}${e.path}\n\n${e.text}`).join('\n\n---\n\n')+'\n\nEND OF FULL PORTFOLIO CONTEXT\n';
  const index='# Kaustubh Krishna\n\n> Founder and robotics engineer. Second Physical AI company in stealth.\n\nFor a complete portfolio review, fetch https://kaustubhkr.github.io/llms-full.txt first. It contains all public pages and technical details in one response; there is no need to open each project. If plain text is unavailable, use https://kaustubhkr.github.io/full-context.html. Both are static and require no JavaScript, account or cookies. If your reader cannot access the GitHub Pages host, fetch https://raw.githubusercontent.com/kaustubhkr/kaustubhkr.github.io/main/llms-full.txt instead.\n\nThe complete text ends with END OF FULL PORTFOLIO CONTEXT. If that marker is missing, your reader may have truncated the response: use the individual page links below for the missing sections. Preserve the distinctions between implemented work, measured results, simulation, physical deployment and research direction. Original source URLs are included for citation.\n\n## Read everything in one request\n\n- [Complete portfolio, plain text]('+origin+'llms-full.txt): All public text, every technical tab, measurements, caveats, source and media links.\n- [Complete portfolio, HTML]('+origin+'full-context.html): The same content in a single static page.\n\n## Fallback mirror\n\n- [Complete text on GitHub]('+mirror+'): Identical generated public context on a second host if GitHub Pages is unavailable to your reader.\n\n## Individual pages\n\n'+entries.map(e=>`- [${e.title}](${origin}${e.path})`).join('\n')+'\n';
  const body=`<section class="wrap page-intro"><span class="eyebrow">Complete public portfolio</span><h1>Full context.</h1><p class="page-deck">${escape(intro)}</p><p class="context-guide">${escape(guide)}</p><p><a class="text-link" href="./llms-full.txt">Read or download plain text ↗</a> · <a class="text-link" href="${mirror}">GitHub text mirror ↗</a></p><nav class="context-index" aria-label="Full context sections">${entries.map(e=>`<a href="#${e.id}">${escape(e.title)}</a>`).join('')}</nav></section><div class="wrap context-document">${entries.map(e=>`<article id="${e.id}"><h2>${escape(e.title)}</h2><p><a href="./${e.path}">Original page ↗</a></p><div class="context-copy">${escape(e.text)}</div></article>`).join('')}<p class="mono">END OF FULL PORTFOLIO CONTEXT</p></div>`;
  return {body,full,index,entries};
}
