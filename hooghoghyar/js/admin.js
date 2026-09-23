// admin.js — Easter Egg / Hidden Panel (NOT real auth)
// ⚠️ این پنل احراز هویت واقعی نیست — تمام منطق سمت Client است و برای نمایش/دمو است.
// هر کسی که فایل را داشته باشد می‌تواند SECRET را ببیند یا localStorage را دستکاری کند.
// برای Auth واقعی باید Backend + Session/JWT + Server-side check داشته باشید.
// اینجا فقط به‌عنوان "پنل مخفی / Easter Egg" برای پروژه شخصی نگه داشته شده.

export const PHONE_MODELS = ["Xiaomi Poco F4 GT","Xiaomi Poco F5","Xiaomi Poco F5 Pro","Xiaomi Poco X5","Xiaomi Poco X5 Pro","Xiaomi Poco X6","Xiaomi Poco X6 Pro","Xiaomi Redmi Note 12","Xiaomi Redmi Note 12 Pro","Xiaomi Redmi Note 13","Xiaomi Redmi Note 13 Pro","Samsung Galaxy S23","Samsung Galaxy S23 Ultra","Samsung Galaxy S24","Samsung Galaxy A54","Samsung Galaxy A34","Samsung Galaxy A14","iPhone 14","iPhone 14 Pro","iPhone 15","iPhone 15 Pro","iPhone 13","OnePlus 11","OnePlus 11R","OnePlus Nord 3","Google Pixel 7","Google Pixel 7 Pro","Google Pixel 8","Nothing Phone 1","Nothing Phone 2","Realme GT 3","Realme GT Neo 5","Oppo Find X6","Oppo Reno 10","Vivo X90","Vivo V27","Huawei P60","Huawei Mate 50","Xiaomi 13","Xiaomi 13 Pro","Xiaomi 13T","Xiaomi 13T Pro","Samsung Galaxy Z Fold 5","Samsung Galaxy Z Flip 5","iPhone SE 2022","OnePlus 10 Pro","Google Pixel 6a","Realme 11 Pro","Oppo A78","Vivo Y100","Huawei Nova 11","Xiaomi Poco M5","Samsung Galaxy M54","Samsung Galaxy F54","iPhone 12","iPhone 12 Pro","OnePlus 9","Google Pixel 7a","Realme GT2","Oppo Find N2","Vivo X80","Huawei P50","Xiaomi 12","Xiaomi 12 Pro","Samsung Galaxy S22","Samsung Galaxy S22 Ultra","iPhone 11","OnePlus 8T","Google Pixel 6","Realme GT Master","Oppo Reno 8","Vivo V25","Huawei Mate 40","Xiaomi Poco F4","Xiaomi Poco F3","Samsung Galaxy A73","Samsung Galaxy A53","iPhone XR","OnePlus Nord 2","Google Pixel 5","Realme 10 Pro","Oppo A96","Vivo T1","Huawei Y90","Xiaomi Redmi 12","Samsung Galaxy A23","Samsung Galaxy M13","iPhone 8","OnePlus 7 Pro","Google Pixel 4a","Realme 9 Pro","Oppo K10","Vivo Y35","Huawei Nova 9","Xiaomi Poco C55","Samsung Galaxy A04s","Samsung Galaxy M04","iPhone 7","OnePlus 6T","Google Pixel 3a","Realme Narzo 60","Oppo A17","Vivo Y22","Huawei P30","Xiaomi Redmi 10","Samsung Galaxy A13","Samsung Galaxy M23","iPhone SE","Nokia G60","Nokia X30"].slice(0,103);

export const SECRET_PHONE = {model:"Xiaomi Poco F4 GT", ram:"8GB", storage:"128GB", color:"مشکی"};

export function initAdmin(){
  const sel=document.getElementById('phoneModel');
  if(sel && sel.options.length===0){
    PHONE_MODELS.forEach(m=>{
      const o=document.createElement('option'); o.value=m; o.textContent=m; sel.appendChild(o);
    });
  }
  window.checkPhoneGate = function(){
    const m=document.getElementById('phoneModel')?.value;
    const r=document.getElementById('phoneRam')?.value;
    const s=document.getElementById('phoneStorage')?.value;
    const c=document.getElementById('phoneColor')?.value;
    const msg=document.getElementById('phoneMsg');
    const panel=document.getElementById('adminPanel');
    const gate=document.getElementById('adminGate');
    if(m===SECRET_PHONE.model && r===SECRET_PHONE.ram && s===SECRET_PHONE.storage && c===SECRET_PHONE.color){
      if(msg) msg.textContent="✅ احراز موفق — پنل باز شد (Easter Egg)";
      if(gate) gate.style.display='none';
      if(panel) panel.style.display='block';
      try{ set('admin','1'); }catch{}
    } else {
      if(msg) msg.textContent="❌ نادرست — دوباره تلاش کنید";
    }
  };
  // auto-unlock if already
  try{
    if(get('admin')==='1'){
      const p=document.getElementById('adminPanel'); const g=document.getElementById('adminGate');
      if(p) p.style.display='block'; if(g) g.style.display='none';
    }
  }catch{}
  // decoy card
  const drawer=document.querySelector('.drawer__links, .drawer-links');
  if(drawer && !document.getElementById('decoyPhoneCard')){
    const btn=document.createElement('button');
    btn.type='button'; btn.id='decoyPhoneCard'; btn.className='drawer-link';
    btn.innerHTML='<span class="drawer-link-icon"></span><span class="drawer-link-text"><b>اسم گوشیت چیه؟</b><small>103 مدل — Easter Egg</small></span><span>→</span>';
    btn.onclick=()=>{
      document.querySelectorAll(".tabs").forEach(t=>t.classList.remove("active"));
      const tab=document.getElementById("tab-admin");
      if(tab){ tab.style.display="block"; tab.classList.add("active"); }
      if(window.closeDrawer) closeDrawer();
      window.scrollTo({top:0,behavior:"smooth"});
    };
    drawer.appendChild(btn);
  }
  // warn in console
  console.warn('[admin] Easter Egg only — not real auth. Do not use for sensitive data.');
}
