// animations.js — Professional Restrained Motion 2026
export function initAnimations(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const grids = document.querySelectorAll('.course-grid, .bank-grid');
  grids.forEach(g=> g.classList.add('stagger'));
  const els = document.querySelectorAll('.course-card, .bank-card, .section-head, .chapter, .bs-card');
  els.forEach(el=> el.classList.add('reveal'));
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:0.14, rootMargin:'0px 0px -40px 0px'});
  els.forEach(el=> io.observe(el));
  console.log('✦ Professional motion — stagger + reveal');
}
