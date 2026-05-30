
// ── Skin Advisor Controller ───────────────────────────────────────────────────
//  — External API task
// Uses Open-Meteo (100% free, no API key required)
// Combines UV index + temperature + humidity to give skincare advice

exports.getSkinAdvisor = (req, res) => {
  res.render('skinAdvisor', {
    user: req.session.user || '',
    role: req.session.role || ''
  });
};