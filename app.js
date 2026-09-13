document.querySelectorAll('[data-video]').forEach(button => {
  const video = document.getElementById(button.dataset.video);
  if (!video) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const sync = () => {
    button.textContent = video.paused ? '▶' : 'Ⅱ';
    button.setAttribute('aria-label', video.paused ? 'Play racing footage' : 'Pause racing footage');
  };
  // Native controls remain available if JavaScript is unavailable.
  video.controls = false;
  button.hidden = false;
  button.addEventListener('click', () => {
    if (video.paused) video.play().catch(sync);
    else video.pause();
  });
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  motion.addEventListener('change', () => { if (motion.matches) video.pause(); });
  if (!motion.matches) video.play().catch(sync);
  sync();
});
// Progressive enhancement: every technical section stays readable without JS.
document.querySelectorAll('[data-tabs]').forEach(group=>{
  const bar=group.querySelector(':scope > .explorer-tabs');
  const buttons=[...bar.querySelectorAll(':scope > [data-tab]')];
  const panels=[...group.querySelectorAll(':scope > [data-panel]')];
  bar.setAttribute('role','tablist');
  group.classList.add('is-enhanced');
  const select=(key,focus=false)=>{
    buttons.forEach(button=>{
      const active=button.dataset.tab===key;
      button.setAttribute('role','tab');
      button.setAttribute('aria-selected',String(active));
      button.tabIndex=active?0:-1;
      if(active&&focus)button.focus();
    });
    panels.forEach(panel=>{
      panel.setAttribute('role','tabpanel');
      panel.tabIndex=0;
      panel.hidden=panel.dataset.panel!==key;
    });
  };
  buttons.forEach((button,index)=>{
    button.addEventListener('click',()=>select(button.dataset.tab));
    button.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(index+1)%buttons.length;
      if(event.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=buttons.length-1;
      if(next===undefined)return;
      event.preventDefault();
      select(buttons[next].dataset.tab,true);
    });
  });
  select(group.dataset.default||buttons[0].dataset.tab);
});

// Keep existing deep links useful when their technical section is collapsed.
function revealLinkedSection() {
  if (!location.hash) return;
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  const ancestors = [];
  for (let node = target; node; node = node.parentElement) {
    if (node.tagName === 'DETAILS') ancestors.push(node);
  }
  ancestors.forEach(node => { node.open = true; });
  if (ancestors.length) target.scrollIntoView();
}
addEventListener('hashchange', revealLinkedSection);
revealLinkedSection();
