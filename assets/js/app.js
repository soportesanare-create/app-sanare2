const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

const screens = $$("[data-screen]");
const navBtns = $$("[data-nav]");
const topTitle = $("#topTitle");
const topSub = $("#topSub");
const rolePill = $("#rolePill");
const navWearable = $("#navWearable");
const navPointsLabel = $("#navPointsLabel");

const roleModal = $("#roleModal");
const globalSearch = $("#globalSearch");

const pointsDoctor = $("#pointsDoctor");
const commKam = $("#commKam");

const monthLabel = $("#monthLabel");
const kpi1 = $("#kpi1");
const kpi2 = $("#kpi2");
const kpi1l = $("#kpi1l");
const kpi2l = $("#kpi2l");
const kpiHint = $("#kpiHint");

const newsGrid = $("#newsGrid");
const newsCount = $("#newsCount");

const profileName = $("#inpName");
const roleKamBtn = $("#roleKam");
const roleMedBtn = $("#roleMed");
const btnSaveProfile = $("#btnSaveProfile");

const inpGoal = $("#inpGoal");
const inpSales = $("#inpSales");
const btnSaveKam = $("#btnSaveKam");

const kamGoal = $("#kamGoal");
const kamSales = $("#kamSales");
const kamProgress = $("#kamProgress");
const kamMissing = $("#kamMissing");

const LS_KEY = "sanare_app_profile_v1";

function nowMonthLabel(){
  const d = new Date();
  const m = d.toLocaleDateString("es-MX",{month:"long"});
  const y = d.getFullYear();
  return `${m.charAt(0).toUpperCase()+m.slice(1)} ${y}`;
}

function money(n){
  const v = Number(n || 0);
  return v.toLocaleString("es-MX",{style:"currency", currency:"MXN", maximumFractionDigits:0});
}

function pct(n){
  return `${Math.max(0, Math.min(100, Math.round(n)))}%`;
}

function loadProfile(){
  try{
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  }catch(e){
    return {};
  }
}

function saveProfile(p){
  localStorage.setItem(LS_KEY, JSON.stringify(p));
}

function getRole(){
  const p = loadProfile();
  return (p.role === "medico" || p.role === "kam") ? p.role : null;
}

function setRole(role){
  const p = loadProfile();
  p.role = role;
  saveProfile(p);
}

function setName(name){
  const p = loadProfile();
  p.name = name || "";
  saveProfile(p);
}

function applyRoleUI(){
  const role = getRole() || "kam";
  const isMed = role === "medico";

  rolePill.textContent = isMed ? "Médico" : "KAM";

  // wearable nav only for medico
  navWearable.style.display = isMed ? "" : "none";

  // points screen content
  pointsDoctor.style.display = isMed ? "" : "none";
  commKam.style.display = isMed ? "none" : "";

  navPointsLabel.textContent = isMed ? "Puntos" : "Comisiones";

  // profile buttons
  roleKamBtn.classList.toggle("active", !isMed);
  roleMedBtn.classList.toggle("active", isMed);

  // update KPIs on home
  monthLabel.textContent = nowMonthLabel();
  if(isMed){
    kpi1.textContent = "Puntos";
    kpi2.textContent = "—";
    kpi1l.textContent = "Sección médica";
    kpi2l.textContent = "Revisa tu panel";
    kpiHint.textContent = "Entra a Puntos para ver tu avance y recompensas.";
  }else{
    const p = loadProfile();
    const goal = Number(p.kamGoal || 0);
    const sales = Number(p.kamSales || 0);
    kpi1.textContent = money(goal);
    kpi2.textContent = money(sales);
    kpi1l.textContent = "Meta del mes";
    kpi2l.textContent = "Ventas del mes";
    const missing = Math.max(0, goal - sales);
    const progress = goal > 0 ? (sales/goal)*100 : 0;
    kpiHint.textContent = goal > 0
      ? `Avance: ${pct(progress)} · Faltante: ${money(missing)}`
      : "Configura tu meta del mes en Comisiones.";
  }

  // avoid landing on hidden wearable tab
  const active = $(".navbtn.active")?.dataset.nav;
  if(active === "wearable" && !isMed){
    navigate("home");
  }
}

function navigate(id){
  screens.forEach(s => s.classList.toggle("active", s.dataset.screen === id));
  navBtns.forEach(b => b.classList.toggle("active", b.dataset.nav === id));

  // Top title changes
  const titles = {
    home: "SANARÉ",
    quote: "Cotizador",
    wearable: "Pulsera",
    points: (getRole()==="medico" ? "Puntos" : "Comisiones"),
    profile: "Perfil"
  };
  topTitle.textContent = titles[id] || "SANARÉ";

  // reset search
  if(globalSearch) globalSearch.value = "";
  window.scrollTo({top:0, behavior:"smooth"});
}

function initNav(){
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.nav));
  });
}

function initModal(){
  const role = getRole();
  if(!role){
    roleModal.classList.add("show");
    roleModal.setAttribute("aria-hidden","false");
  }
  $$("#roleModal [data-pick]").forEach(b => {
    b.addEventListener("click", () => {
      setRole(b.dataset.pick);
      roleModal.classList.remove("show");
      roleModal.setAttribute("aria-hidden","true");
      applyRoleUI();
    });
  });
}

function initProfile(){
  const p = loadProfile();
  profileName.value = p.name || "";

  roleKamBtn.addEventListener("click", () => {
    roleKamBtn.classList.add("active");
    roleMedBtn.classList.remove("active");
    setRole("kam");
    applyRoleUI();
  });
  roleMedBtn.addEventListener("click", () => {
    roleMedBtn.classList.add("active");
    roleKamBtn.classList.remove("active");
    setRole("medico");
    applyRoleUI();
  });

  btnSaveProfile.addEventListener("click", () => {
    setName(profileName.value.trim());
    applyRoleUI();
    navigate("home");
  });
}

function initKamCommissions(){
  const p = loadProfile();
  if(inpGoal) inpGoal.value = p.kamGoal || "";
  if(inpSales) inpSales.value = p.kamSales || "";

  const repaint = () => {
    const pp = loadProfile();
    const goal = Number(pp.kamGoal || 0);
    const sales = Number(pp.kamSales || 0);
    kamGoal.textContent = money(goal);
    kamSales.textContent = money(sales);
    const missing = Math.max(0, goal - sales);
    const progress = goal > 0 ? (sales/goal)*100 : 0;
    kamMissing.textContent = money(missing);
    kamProgress.textContent = pct(progress);
  };

  btnSaveKam?.addEventListener("click", () => {
    const goal = Number(inpGoal.value || 0);
    const sales = Number(inpSales.value || 0);
    const pp = loadProfile();
    pp.kamGoal = goal;
    pp.kamSales = sales;
    saveProfile(pp);
    repaint();
    applyRoleUI();
  });

  repaint();
}

function initNews(){
  const items = [
    {
      img:"assets/img/news/slide1.png?v=7",
      title:"Noticias Sanaré",
      sub:"Novedades clínicas, sedes y logística."
    },
    {
      img:"assets/img/news/slide2.png?v=7",
      title:"Disponibilidad de medicamentos",
      sub:"Inventario y alternativas terapéuticas."
    },
    {
      img:"assets/img/news/slide3.png?v=7",
      title:"Protocolos de infusión",
      sub:"Seguridad del paciente y operación."
    },
    {
      img:"assets/img/news/slide4.png?v=7",
      title:"Agenda de sedes",
      sub:"Horarios y coordinación de atención."
    }
  ];

  newsCount.textContent = String(items.length);

  // Carousel markup (scroll-snap friendly)
  newsGrid.innerHTML = `
    <div class="carousel" id="newsCarousel">
      <button class="carBtn prev" type="button" aria-label="Anterior">
        <i class="fa-solid fa-chevron-left"></i>
      </button>

      <div class="carTrack" id="newsTrack" tabindex="0" aria-label="Carrusel de noticias">
        ${items.map((x, idx) => `
          <div class="news carSlide" role="article" data-idx="${idx}">
            <img src="${x.img}" alt="${x.title}">
            <div class="meta">
              <p class="t">${x.title}</p>
              <p class="s">${x.sub}</p>
            </div>
          </div>
        `).join("")}
      </div>

      <button class="carBtn next" type="button" aria-label="Siguiente">
        <i class="fa-solid fa-chevron-right"></i>
      </button>

      <div class="carDots" id="newsDots" aria-label="Indicadores">
        ${items.map((_, idx) => `<button class="carDot ${idx===0?'active':''}" type="button" aria-label="Ir a noticia ${idx+1}" data-dot="${idx}"></button>`).join("")}
      </div>
    </div>
  `;

  const track = $("#newsTrack");
  const dots = $$("#newsDots .carDot");

  const goTo = (idx) => {
    const slide = track.querySelector(`.carSlide[data-idx="${idx}"]`);
    if(!slide) return;
    slide.scrollIntoView({behavior:"smooth", inline:"start", block:"nearest"});
    dots.forEach(d => d.classList.toggle("active", Number(d.dataset.dot) === idx));
    currentIdx = idx;
  };

  const nearestIndex = () => {
    const slides = $$(".carSlide", track);
    if(!slides.length) return 0;
    const left = track.scrollLeft;
    // find closest by offsetLeft
    let best = 0, bestDist = Infinity;
    slides.forEach((s, i) => {
      const dist = Math.abs(s.offsetLeft - left);
      if(dist < bestDist){ bestDist = dist; best = i; }
    });
    return best;
  };

  // Buttons
  let currentIdx = 0;
  $(".carBtn.prev").addEventListener("click", () => goTo(Math.max(0, currentIdx - 1)));
  $(".carBtn.next").addEventListener("click", () => goTo(Math.min(items.length - 1, currentIdx + 1)));

  // Dots
  dots.forEach(d => d.addEventListener("click", () => goTo(Number(d.dataset.dot))));

  // Update dots on manual scroll
  let scrollT;
  track.addEventListener("scroll", () => {
    clearTimeout(scrollT);
    scrollT = setTimeout(() => {
      const idx = nearestIndex();
      dots.forEach(d => d.classList.toggle("active", Number(d.dataset.dot) === idx));
      currentIdx = idx;
    }, 80);
  }, {passive:true});

  // Auto-advance (pause on hover/focus)
  let timer = null;
  const start = () => {
    stop();
    timer = setInterval(() => {
      const next = (currentIdx + 1) % items.length;
      goTo(next);
    }, 6500);
  };
  const stop = () => { if(timer) { clearInterval(timer); timer=null; } };

  const carousel = $("#newsCarousel");
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("focusin", stop);
  carousel.addEventListener("focusout", start);

  start();
}

function initSearch(){
  if(!globalSearch) return;
  globalSearch.addEventListener("input", () => {
    const q = globalSearch.value.toLowerCase().trim();
    if(!q){
      $$(".news").forEach(n => n.style.display="");
      return;
    }
    $$(".news").forEach(n => {
      const t = n.innerText.toLowerCase();
      n.style.display = t.includes(q) ? "" : "none";
    });
  });
}

function main(){
  initNav();
  initModal();
  initProfile();
  initKamCommissions();
  initNews();
  initSearch();
  applyRoleUI();
}

document.addEventListener("DOMContentLoaded", main);
