function getMyths() {
  var t = window.LumiI18n ? window.LumiI18n.t.bind(window.LumiI18n) : function(k){ return k; };
  return [
    { icon: '☀️', myth: t('myth.m1'), truthHeading: t('myth.t1h'), truth: t('myth.t1') },
    { icon: '🫧',  myth: t('myth.m2'), truthHeading: t('myth.t2h'), truth: t('myth.t2') },
    { icon: '💧', myth: t('myth.m3'), truthHeading: t('myth.t3h'), truth: t('myth.t3') },
    { icon: '🌿', myth: t('myth.m4'), truthHeading: t('myth.t4h'), truth: t('myth.t4') },
    { icon: '👁️', myth: t('myth.m5'), truthHeading: t('myth.t5h'), truth: t('myth.t5') },
    { icon: '💸', myth: t('myth.m6'), truthHeading: t('myth.t6h'), truth: t('myth.t6') },
    { icon: '🧴', myth: t('myth.m7'), truthHeading: t('myth.t7h'), truth: t('myth.t7') },
    { icon: '🔴', myth: t('myth.m8'), truthHeading: t('myth.t8h'), truth: t('myth.t8') },
    { icon: '✨', myth: t('myth.m9'), truthHeading: t('myth.t9h'), truth: t('myth.t9') },
  ];
}

let flippedCount = 0;
let flipped = new Set();
let grid;

function buildCards() {
  var t = window.LumiI18n ? window.LumiI18n.t.bind(window.LumiI18n) : function(k){ return k; };
  const myths = getMyths();
  flippedCount = 0;
  flipped.clear();
  grid.innerHTML = '';

  const scoreEl    = document.getElementById('scoreCount');
  const progressEl = document.getElementById('progressText');
  if (scoreEl) scoreEl.textContent = 0;
  if (progressEl) progressEl.textContent = '';

  myths.forEach((m, i) => {
    const card = document.createElement('div');
    card.className = 'myth-card';
    card.innerHTML = `
      <div class="myth-card-inner">
        <div class="myth-front">
          <span class="myth-badge myth"><i class="fas fa-times"></i> ${t('myth.card.badge')}</span>
          <div class="myth-icon">${m.icon}</div>
          <p class="myth-text">${m.myth}</p>
          <span class="myth-tap-hint"><i class="fas fa-sync-alt"></i> ${t('myth.card.tap')}</span>
        </div>
        <div class="myth-back">
          <span class="myth-badge truth"><i class="fas fa-check"></i> ${t('myth.card.truth')}</span>
          <p class="truth-heading">${m.truthHeading}</p>
          <p class="truth-body">${m.truth}</p>
          <div class="truth-check">✅</div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      if (card.classList.contains('flipped') && !flipped.has(i)) {
        flipped.add(i);
        flippedCount++;
        var t2 = window.LumiI18n ? window.LumiI18n.t.bind(window.LumiI18n) : function(k){ return k; };
        const scoreEl    = document.getElementById('scoreCount');
        const progressEl = document.getElementById('progressText');
        const total      = myths.length;
        const pct        = Math.round((flippedCount / total) * 100);
        if (scoreEl) scoreEl.textContent = flippedCount;
        if (progressEl) {
          progressEl.textContent = flippedCount === total
            ? t2('myth.progress.done').replace('{n}', total)
            : t2('myth.progress.wip').replace('{done}', flippedCount).replace('{total}', total).replace('{pct}', pct);
        }
      }
    });

    grid.appendChild(card);
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = [...grid.children].indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), 80 * idx);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.myth-card').forEach(c => observer.observe(c));
}

document.addEventListener('DOMContentLoaded', function () {
  grid = document.getElementById('mythsGrid');
  if (!grid) return;

  buildCards();

  window.addEventListener('scroll', () => {
    const brand = document.querySelector('.footer-brand h1');
    if (!brand) return;
    if (brand.getBoundingClientRect().top < window.innerHeight * 0.85) {
      brand.style.transform = 'translateY(0)';
      brand.style.opacity   = '1';
    }
  });
});

document.addEventListener('langchange', function () {
  if (!grid) return;
  buildCards();
});