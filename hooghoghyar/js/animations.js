// animations.js — Modern Motion 2026 — Scroll Reveal + Stagger + Parallax
export function initAnimations(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.course-card, .bank-card, .chapter, .section-head');
  revealEls.forEach(el=> el.classList.add('reveal'));
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
  revealEls.forEach(el=> io.observe(el));

  // Parallax hero
  const hero = document.querySelector('.hero');
  if(hero){
    window.addEventListener('scroll', ()=>{
      const y = window.scrollY * 0.3;
      hero.style.setProperty('--parallax', y+'px');
    }, {passive:true});
  }

  // Card 3D tilt (desktop only)
  if(window.matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.course-card').forEach(card=>{
      card.classList.add('card-3d','shine');
      card.addEventListener('mousemove', (e)=>{
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left)/r.width - 0.5;
        const y = (e.clientY - r.top)/r.height - 0.5;
        card.style.transform = `translateY(-4px) rotateY(${x*6}deg) rotateX(${-y*6}deg)`;
      });
      card.addEventListener('mouseleave', ()=>{
        card.style.transform = '';
      });
    });
  }

  // View transition for tab switch (if supported)
  if(document.startViewTransition){
    const origSwitch = window.switchTab;
    if(origSwitch){
      window.switchTab = (which)=>{
        document.startViewTransition(()=> origSwitch(which));
      };
    }
  }
  console.log('✦ Animations modern ready — reveal + parallax + 3d');
}
