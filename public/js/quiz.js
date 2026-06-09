// ── State ─────────────────────────────────────────────────────────────────
const answers = {};
const flags   = {};
const TOTAL_STEPS = 15;

// ── Skin profile labels ───────────────────────────────────────────────────
const SKIN_LABELS = {
  very_dry:    'Very Dry Skin',
  often_dry:   'Dry Skin',
  combination: 'Combination Skin',
  often_oily:  'Oily Skin',
  very_oily:   'Very Oily Skin'
};
const ACNE_LABELS = {
  mild:     'Mild Acne',
  moderate: 'Moderate Acne',
  severe:   'Severe Acne',
  none:     'Acne-Free'
};
const SENS_LABELS = {
  sensitive: 'Sensitive',
  normal:    'Normal',
  avoids:    'Avoids New Products'
};

// ── Product data ──────────────────────────────────────────────────────────
const PRODUCTS = {
  'cerave-foam':    { name: 'CeraVe Foaming Facial Cleanser 236ml',            price: 550,  image: '/images/foaming-cleanser-236ml-1 cerave.jpg',          step: 'CERAVE-FOAM' },
  'cerave-hydrate': { name: 'CeraVe Hydrating Facial Cleanser 236ml',          price: 580,  image: '/images/hydrating-cleanser-236ml-first cerave.jpg',     step: 'CERAVE-HYDRATE' },
  'cerave-lotion':  { name: 'CeraVe Daily Moisturizing Lotion 473ml',          price: 650,  image: '/images/CeraVe-Moisturizing-Lotion.avif',              step: 'DERM APPROVED' },
  'cerave-spf':     { name: 'CeraVe AM Facial Moisturising Lotion SPF50 52ml', price: 1150, image: '/images/sunblock cera 1.webp',                         step: 'PROTECT' },
  'uriage-gel':     { name: 'Uriage Hyséac Cleansing Gel 200ml',               price: 799,  image: '/images/uriage cleanser 1.webp',                       step: 'CLEANSE' },
  'uriage-cica':    { name: 'Uriage Bariéderm-Cica Daily Serum 30ml',          price: 1559, image: '/images/1 uriage.jpg',                                 step: 'REPAIR' },
  'uriage-water':   { name: 'Uriage Eau Thermale Water Cream 40ml',            price: 814,  image: '/images/uriage thermal 1.avif',                        step: 'HYDRATE' },
  'lrp-effaclar':   { name: 'La Roche-Posay Effaclar Duo(+) 40ml',            price: 850,  image: '/images/Effaclar_Duo+M_40ml_01_La-Roche-Posay.jpg',    step: 'LRP-EFFACLAR' },
  'lrp-cicaplast':  { name: 'La Roche-Posay Cicaplast Baume B5+ 40ml',        price: 900,  image: '/images/cica 1.webp',                                  step: 'REPAIR' },
  'lrp-spf':        { name: 'La Roche-Posay Anthelios Invisible Fluid SPF50+', price: 1150, image: '/images/sunblock1.jpg',                                step: 'PROTECT' }
};

// ── Navigation helpers ────────────────────────────────────────────────────
// Steps 9 and 10 are female-only (pregnancy + period questions).
// Males jump from 8 → 11, skipping both.

function getNextStep(current) {
  switch (current) {
    case 1:  return answers.s1 === 'none' ? 3 : 2;
    case 8:  return answers.s8 === 'male' ? 11 : 9;   // ✅ males skip 9 AND 10
    case 9:  return 10;
    case 10: return 11;
    case 11: return flags.hasAllergy   ? 12 : 13;
    case 13: return flags.hasCondition ? 14 : 15;
    case 15: return flags.hasExtra     ? 16 : 'result';
    case 16: return 'result';
    default: return current + 1;
  }
}

function getPrevStep(current) {
  switch (current) {
    case 3:        return answers.s1 === 'none' ? 1 : 2;
    case 9:        return 8;
    case 10:       return 9;
    case 11:       return answers.s8 === 'male' ? 8 : 10;  // ✅ males go back to 8
    case 13:       return flags.hasAllergy   ? 12 : 11;
    case 15:       return flags.hasCondition ? 14 : 13;
    case 16:       return 15;
    case 'result': return flags.hasExtra ? 16 : 15;
    default:       return current - 1;
  }
}

let currentStep = 1;

function updateProgress() {
  const bar = document.getElementById('segProgress');
  if (!bar) return;
  const stepIndex = currentStep === 'result' ? TOTAL_STEPS : Math.min(currentStep, TOTAL_STEPS);
  bar.innerHTML = '';
  const w = Math.floor(560 / TOTAL_STEPS);
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const seg = document.createElement('div');
    seg.style.width = w + 'px';
    seg.className = 'seg' + (i < stepIndex ? ' filled' : i === stepIndex ? ' partial' : '');
    bar.appendChild(seg);
  }
}

function showStep(step) {
  document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
  const target = document.querySelector(`.step[data-step="${step}"]`);
  if (target) target.classList.add('active');
  currentStep = step;
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goNext() {
  const next = getNextStep(currentStep);
  showStep(next);
  if (next === 'result') showResult();
}
function goBack() { showStep(getPrevStep(currentStep)); }

function selectImg(card, stepKey) {
  card.closest('.img-grid').querySelectorAll('.img-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  answers[stepKey] = card.dataset.value;
  const btn = document.getElementById('next1');
  if (btn) btn.disabled = false;
}

function selectSingle(card, stepNum) {
  card.closest('.options-list').querySelectorAll('.opt-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  answers['s' + stepNum] = card.dataset.value;
  const btn = document.getElementById('next' + stepNum);
  if (btn) btn.disabled = false;

  if (stepNum === 9) {
    const warn = document.getElementById('pregnancyWarning');
    if (warn) warn.classList.toggle('visible', ['pregnant','breastfeeding','trying'].includes(card.dataset.value));
  }
}

function selectMulti(card, stepNum) {
  card.closest('.options-list').querySelectorAll('[data-value="none"]').forEach(c => c.classList.remove('selected'));
  card.classList.toggle('selected');
  const selected = [...card.closest('.options-list').querySelectorAll('.opt-card.selected')].map(c => c.dataset.value);
  answers['s' + stepNum] = selected;
  const btn = document.getElementById('next' + stepNum);
  if (btn) btn.disabled = selected.length === 0;
}

function selectGoal(card) {
  card.classList.toggle('selected');
  answers.goals = [...document.querySelectorAll('.goal-card.selected')].map(c => c.dataset.value);
  const btn = document.getElementById('next5');
  if (btn) btn.disabled = answers.goals.length === 0;
}

function setFlag(key, val) { flags[key] = val; }

function checkTextarea(id, btnId) {
  const btn = document.getElementById(btnId);
  if (btn) btn.disabled = document.getElementById(id).value.trim().length === 0;
}






// ── Add to cart ───────────────────────────────────────────────────────────
function addToCartFromQuiz(productKey, btn) {
  const product = PRODUCTS[productKey];
  if (!product) return;
  // Pass all 5 args matching the brand-page signature:
  // addToCart(productId, productName, price, image, step)
  if (typeof addToCart === 'function') {
    addToCart(productKey, product.name, product.price, product.image || '', product.step || '');
  }
  const original = btn.textContent;
  btn.textContent = '✓ Added!';
  btn.style.background = 'rgb(39,174,96)';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = original;
    btn.style.background = 'rgb(83,54,30)';
    btn.disabled = false;
  }, 2000);
}

// ── Save quiz result to DB ────────────────────────────────────────────────
function saveQuizResultToDB(resultText) {
  fetch('/user/save-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result: resultText })
  }).catch(() => {});
}

// ── Build routine ─────────────────────────────────────────────────────────
function buildRoutine(skinType, acne, sensitivity, goals, pregnancy) {
  const isDry       = ['very_dry','often_dry'].includes(skinType);
  const isOily      = ['often_oily','very_oily'].includes(skinType);
  const isSensitive = sensitivity === 'sensitive';
  // Males have no pregnancy answer — treat as none
  const isPregnant  = ['pregnant','breastfeeding','trying'].includes(pregnancy);
  const routine     = [];

  // Cleanser
  if (isOily || acne === 'moderate' || acne === 'severe')
    routine.push({ key: 'cerave-foam',    step: 'Cleanser',    desc: 'Removes excess oil and unclogs pores without stripping.' });
  else if (isDry || isSensitive)
    routine.push({ key: 'cerave-hydrate', step: 'Cleanser',    desc: 'Gently cleanses while maintaining the skin moisture barrier.' });
  else
    routine.push({ key: 'uriage-gel',     step: 'Cleanser',    desc: 'Purifying gel for balanced combination skin types.' });

  // Treatment
  if ((acne === 'severe' || acne === 'moderate' || acne === 'mild') && !isPregnant)
    routine.push({ key: 'lrp-effaclar',   step: 'Treatment',   desc: 'Targets blemishes and unclogs pores. Dermatologist tested.' });
  else if (goals.includes('dark_spots') || goals.includes('texture'))
    routine.push({ key: 'uriage-cica',    step: 'Serum',       desc: 'Repairs damaged skin and fades post-acne marks over time.' });

  // Soothing/repair
  if (isSensitive || goals.includes('rosacea') || isPregnant)
    routine.push({ key: 'lrp-cicaplast',  step: 'Repair Balm', desc: 'Soothes irritated skin and strengthens the skin barrier.' });

  // Moisturizer
  if (isDry || goals.includes('firmness'))
    routine.push({ key: 'cerave-lotion',  step: 'Moisturizer', desc: 'Deep hydration with ceramides for dry and normal skin.' });
  else if (!isOily)
    routine.push({ key: 'uriage-water',   step: 'Moisturizer', desc: '24H hydration boost for combination and normal skin.' });

  // SPF
  if (isOily || acne !== 'none')
    routine.push({ key: 'lrp-spf',        step: 'Sunscreen',   desc: 'Invisible fluid SPF50+ — ideal for oily and acne-prone skin.' });
  else
    routine.push({ key: 'cerave-spf',     step: 'Sunscreen',   desc: 'Moisturising SPF50+ lotion with ceramides for daily use.' });

  return routine;
}

function showResult() {
  showStep('result');

  const skinType    = answers.s3 || 'combination';
  const acne        = answers.s1 || 'none';
  const sensitivity = answers.s4 || 'normal';
  const goals       = answers.goals || [];
  // Males won't have s9 set — defaults to undefined → treated as 'none' in buildRoutine
  const pregnancy   = answers.s9;

  const skinLabel = SKIN_LABELS[skinType]     || 'Combination Skin';
  const acneLabel = ACNE_LABELS[acne]         || 'Acne-Free';
  const sensLabel = SENS_LABELS[sensitivity]  || 'Normal';

  const resultTitle   = skinLabel;
  const resultSummary = `${skinLabel} · ${acneLabel} · ${sensLabel} Sensitivity`;

  document.getElementById('resultTitle').textContent = resultTitle;
  document.getElementById('resultDesc').textContent  =
    `Based on your answers, your skin profile is: ${resultSummary}. ` +
    `Here is your personalized skincare routine — each product is carefully selected for your skin type.`;

  // Tags
  const tagEl = document.getElementById('resultTags');
  tagEl.innerHTML = '';
  const goalLabels = { clogged_pores: 'Clogged Pores', dark_spots: 'Dark Spots', firmness: 'Firmness', texture: 'Texture' };
  [skinLabel, acneLabel,
   sensLabel === 'Normal' ? null : sensLabel + ' Skin',
   ...goals.map(g => goalLabels[g]).filter(Boolean)]
    .filter(Boolean).forEach(tag => {
      const span = document.createElement('span');
      span.className = 'result-tag';
      span.textContent = tag;
      tagEl.appendChild(span);
    }); 
  // Routine
  const routine   = buildRoutine(skinType, acne, sensitivity, goals, pregnancy);
  const routineEl = document.getElementById('routineList');
  routineEl.innerHTML = '';

  routine.forEach((item, i) => {
    const product = PRODUCTS[item.key];
    if (!product) return;
    const safeKey = item.key.replace(/'/g, "\\'");
    routineEl.innerHTML += `
      <div class="result-item" style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;">
        <div style="display:flex;gap:14px;align-items:flex-start;flex:1;">
          <div class="result-num">${i + 1}</div>
          <div class="result-item-text">
            <strong>${product.name}</strong>
            <span style="font-size:12px;color:#888;display:block;margin-top:2px;">${item.step}</span>
            <span>${item.desc}</span>
            <span style="color:rgb(206,110,26);font-weight:700;font-size:13px;display:block;margin-top:4px;">
              ${product.price} EGP
            </span>
          </div>
        </div>
        <button
          onclick="addToCartFromQuiz('${safeKey}', this)"
          style="padding:8px 16px;background:rgb(83,54,30);color:#fff;border:none;
                 border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.06em;
                 text-transform:uppercase;cursor:pointer;white-space:nowrap;
                 transition:background 0.2s;flex-shrink:0;margin-top:4px;"
          onmouseover="if(!this.disabled) this.style.background='rgb(147,97,62)'"
          onmouseout="if(!this.disabled) this.style.background='rgb(83,54,30)'"
        >+ Add to Cart</button>
      </div>`;
  });

  saveQuizResultToDB(resultSummary);
}

function restartQuiz() {
  Object.keys(answers).forEach(k => delete answers[k]);
  Object.keys(flags).forEach(k => delete flags[k]);
  document.querySelectorAll('.opt-card.selected, .img-card.selected, .goal-card.selected')
    .forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.btn-continue[id]').forEach(btn => { btn.disabled = true; });
  document.querySelectorAll('textarea').forEach(t => t.value = '');
  document.querySelectorAll('.warning-box').forEach(w => w.classList.remove('visible'));
  showStep(1);
}

updateProgress();
document.addEventListener('langchange', () => { if (currentStep === 'result') showResult(); });
