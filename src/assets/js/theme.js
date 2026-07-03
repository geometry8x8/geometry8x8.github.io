// theme.js — переключение темы по клику. Определение темы при загрузке
// делает отдельный инлайн-скрипт в <head> (до отрисовки, против FOUC).
(function () {
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('geometriya-theme', theme); } catch (e) {}
  }
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  });
})();
