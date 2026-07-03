// nav.js
// Бургер-меню для брейкпоинтов, где nav.nav-desktop скрыт (см. style.css).
// Отдельный файл — логика навигации не пересекается с темой (theme.js) или
// scroll-spy/reveal (motion.js), каждый файл отвечает за одно поведение.

(function () {
  var toggle = document.getElementById('navToggle');
  var panel = document.getElementById('mobileNav');
  if (!toggle || !panel) return;

  function closeNav() {
    toggle.classList.remove('is-open');
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function openNav() {
    toggle.classList.add('is-open');
    panel.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  toggle.addEventListener('click', function () {
    if (toggle.classList.contains('is-open')) closeNav();
    else openNav();
  });

  panel.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  document.addEventListener('click', function (e) {
    if (!toggle.classList.contains('is-open')) return;
    if (panel.contains(e.target) || toggle.contains(e.target)) return;
    closeNav();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) closeNav();
  });
})();
