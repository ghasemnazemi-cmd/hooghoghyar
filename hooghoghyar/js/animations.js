// animations.js — Ultra Motion 2026 — reveal + stagger + 3d + magnetic + view-transition
export function initAnimations(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observe = (sel, cls='reveal')=>{
    const els = document.querySelectorAll(sel);
    els.forEach(el=> el.classList.add(cls));
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -50px 0px'});
    els.forEach(el=> io.observe(el));
  };
  // stagger grids
  document.querySelectorAll('.course-grid,.bank-grid').forEach(g=> g.classList.add('stagger'));
  observe('.course-card, .bank-card, .chapter, .section-head, .bs-card');

  // Parallax hero (lerp, rAF)
  const hero = document.querySelector('.hero');
  if(hero){
    let y=0, ly=0;
    window.addEventListener('scroll', ()=>{ y = window.scrollY * 0.22; }, {passive:true});
    const loop = ()=>{
      ly += (y - ly) * 0.08;
      hero.style.setProperty('--parallax', ly.toFixed(1)+'px');
      hero.style.transform = `translateY(${ly*0.06}px)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // 3D tilt + shine (desktop)
  if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.querySelectorAll('.course-card, .bank-card').forEach(card=>{
      card.classList.add('card-3d','shine');
      card.addEventListener('mousemove', (e)=>{
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left)/r.width - 0.5;
        const y = (e.clientY - r.top)/r.height - 0.5;
        card.style.transform = `translateY(-5px) rotateY(${x*7}deg) rotateX(${-y*7}deg)`;
      });
      card.addEventListener('mouseleave', ()=>{ card.style.transform=''; });
    });
  }

  // Magnetic buttons
  document.querySelectorAll('.btn-primary, .hero-actions .btn').forEach(btn=>{
    btn.classList.add('magnetic');
    btn.addEventListener('mousemove', (e)=>{
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width/2) * 0.14;
      const y = (e.clientY - r.top - r.height/2) * 0.20;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', ()=> btn.style.transform='');
  });

  // Re-observe after SPA navigation (courses/bank render async)
  const reobserve = ()=> setTimeout(()=> observe('.course-card, .bank-card'), 300);
  window.addEventListener('hashchange', reobserve);
  // view transition wrapper (if supported)
  if(document.startViewTransition && window.switchTab){
    const orig = window.switchTab;
    window.switchTab = (which)=>{
      if(document.startViewTransition) document.startViewTransition(()=> orig(which));
      else orig(which);
    };
  }
  console.log('✦ Ultra Motion ready — stagger/reveal/3d/shine/magnetic/parallax');
}
