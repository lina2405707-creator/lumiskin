// ── State ──────────────────────────────────────────────────────────────────
const answers = {};
const flags = {};

const TOTAL_STEPS = 15;

function getNextStep(current) {
  switch (current) {
    case 1: return answers.s1 === 'none' ? 3 : 2;
    case 8: return answers.s8 === 'male' ? 10 : 9;
    case 11: return flags.hasAllergy ? 12 : 13;
    case 13: return flags.hasCondition ? 14 : 15;
    case 15: return flags.hasExtra ? 16 : 'result';
    case 16: return 'result';
    default: return current + 1;
  }
}

function getPrevStep(current) {
  switch (current) {
    case 3: return answers.s1 === 'none' ? 1 : 2;
    case 10: return answers.s8 === 'male' ? 8 : 9;
    case 13: return flags.hasAllergy ? 12 : 11;
    case 15: return flags.hasCondition ? 14 : 13;
    case 16: return 15;
    case 'result': return flags.hasExtra ? 16 : 15;
    default: return current - 1;
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

function goBack() {
  showStep(getPrevStep(currentStep));
}

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

function selectMultiNone(card, stepNum) {
  card.closest('.options-list').querySelectorAll('.opt-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  answers['s' + stepNum] = ['none'];
  const btn = document.getElementById('next' + stepNum);
  if (btn) btn.disabled = false;
}

function selectGoal(card) {
  card.classList.toggle('selected');
  answers.goals = [...document.querySelectorAll('.goal-card.selected')].map(c => c.dataset.value);
  const btn = document.getElementById('next5');
  if (btn) btn.disabled = answers.goals.length === 0;
}

function setFlag(key, val) { flags[key] = val; }

// Dynamic textarea button validation rule matching localized inputs safely
function checkTextarea(id, btnId) {
  const btn = document.getElementById(btnId);
  if (btn) btn.disabled = document.getElementById(id).value.trim().length === 0;
}

function showResult() {
  var t = window.LumiI18n ? window.LumiI18n.t.bind(window.LumiI18n) : function(k){ return k; };

  showStep('result');
  const acne        = answers.s1 || 'none';
  const skinType    = answers.s3 || 'combination';
  const sensitivity = answers.s4 || 'normal';
  const goals       = answers.goals || [];
  const pregnancy   = answers.s9;

  const acneLabels = {
    mild    : t('quiz.acne.mild'),
    moderate: t('quiz.acne.moderate'),
    severe  : t('quiz.acne.severe'),
    none    : t('quiz.acne.none')
  };
  const skinLabels = {
    very_dry   : t('quiz.skin.very_dry'),
    often_dry  : t('quiz.skin.often_dry'),
    combination: t('quiz.skin.combo'),
    often_oily : t('quiz.skin.often_oily'),
    very_oily  : t('quiz.skin.very_oily')
  };

  document.getElementById('resultTitle').textContent =
    t('quiz.result.profile') + ' ' + (skinLabels[skinType] || t('quiz.skin.combo')) + ' ' + t('quiz.result.and') + ' ' + (acneLabels[acne] || t('quiz.acne.none'));

  let desc = t('quiz.result.based') + ' ' + (skinLabels[skinType] || t('quiz.skin.combo')).toLowerCase() + ' ' + t('quiz.result.skin');
  if (acne !== 'none') desc += ' ' + t('quiz.result.with') + ' ' + (acneLabels[acne] || '').toLowerCase();
  if (sensitivity === 'sensitive') desc += t('quiz.result.sensitive');
  desc += '. ' + t('quiz.result.routine');
  document.getElementById('resultDesc').textContent = desc;

  const tagEl = document.getElementById('resultTags');
  tagEl.innerHTML = '';
  
  const goalTranslations = {
    clogged_pores: t('quiz.q5.pores'),
    dark_spots: t('quiz.q5.spots'),
    firmness: t('quiz.q5.firm'),
    texture: t('quiz.q5.texture')
  };

  [skinLabels[skinType], sensitivity === 'sensitive' ? (document.documentElement.dir === 'rtl' ? 'بشرة حساسة' : 'Sensitive') : null, ...goals.map(g => goalTranslations[g] || g)]
    .filter(Boolean).forEach(tag => {
      const span = document.createElement('span');
      span.className = 'result-tag';
      span.textContent = tag;
      tagEl.appendChild(span);
    });

  const isDry      = ['very_dry','often_dry'].includes(skinType);
  const isOily     = ['often_oily','very_oily'].includes(skinType);
  const isSensitive = sensitivity === 'sensitive';
  const isPregnant = ['pregnant','breastfeeding','trying'].includes(pregnancy);
  const routine    = [];

  if (isOily || acne === 'moderate' || acne === 'severe')
    routine.push({ name: t('quiz.p.cerave.foam'),    desc: t('quiz.p.cerave.foam.desc') });
  else if (isDry || isSensitive)
    routine.push({ name: t('quiz.p.cerave.hydrate'), desc: t('quiz.p.cerave.hydrate.desc') });
  else
    routine.push({ name: t('quiz.p.uriage.gel'),     desc: t('quiz.p.uriage.gel.desc') });

  if ((acne === 'severe' || acne === 'moderate' || acne === 'mild') && !isPregnant)
    routine.push({ name: t('quiz.p.lrp.effaclar'),   desc: t('quiz.p.lrp.effaclar.desc') });
  else if (goals.includes('dark_spots') || goals.includes('texture'))
    routine.push({ name: t('quiz.p.uriage.cica'),    desc: t('quiz.p.uriage.cica.desc') });

  if (isSensitive || goals.includes('rosacea') || isPregnant)
    routine.push({ name: t('quiz.p.lrp.cicaplast'),  desc: t('quiz.p.lrp.cicaplast.desc') });

  if (isDry || goals.includes('firmness') || goals.includes('glow'))
    routine.push({ name: t('quiz.p.cerave.lotion'),  desc: t('quiz.p.cerave.lotion.desc') });
  else if (!isOily)
    routine.push({ name: t('quiz.p.uriage.water'),   desc: t('quiz.p.uriage.water.desc') });

  if (isOily || acne !== 'none')
    routine.push({ name: t('quiz.p.lrp.spf'),        desc: t('quiz.p.lrp.spf.desc') });
  else
    routine.push({ name: t('quiz.p.cerave.spf'),     desc: t('quiz.p.cerave.spf.desc') });

  const routineEl = document.getElementById('routineList');
  routineEl.innerHTML = '';
  routine.forEach((item, i) => {
    routineEl.innerHTML += `<div class="result-item">
      <div class="result-num">${i + 1}</div>
      <div class="result-item-text"><strong>${item.name}</strong><span>${item.desc}</span></div>
    </div>`;
  });
}

function restartQuiz() {
  Object.keys(answers).forEach(k => delete answers[k]);
  Object.keys(flags).forEach(k => delete flags[k]);
  document.querySelectorAll('.opt-card.selected, .img-card.selected, .goal-card.selected').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.btn-continue[id]').forEach(btn => { btn.disabled = true; });
  document.querySelectorAll('textarea').forEach(t => t.value = '');
  document.querySelectorAll('.warning-box').forEach(w => w.classList.remove('visible'));
  showStep(1);
}

updateProgress();

document.addEventListener('langchange', function () {
  if (currentStep === 'result') showResult();
});