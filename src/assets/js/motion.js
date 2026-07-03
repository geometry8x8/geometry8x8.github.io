// motion.js
// Три поведения на IntersectionObserver, без зависимостей:
//
// 1. Высота шапки -> CSS-переменная --header-h. Используется в CSS
//    (scroll-margin-top секций) и здесь же в JS (rootMargin наблюдателя),
//    чтобы оба механизма всегда были синхронизированы с одной цифрой,
//    а не с двумя независимо подобранными на глаз.
//
// 2. Scroll-spy: треугольник-индикатор раздела (data-spy) пульсирует у
//    секции с наибольшим текущим процентом видимости во вьюпорте
//    (intersectionRatio), а не у ближайшей по краю — так поведение
//    соответствует тому, что человек реально видит на экране.
//
// 3. Reveal: блоки с классом .reveal плавно появляются при входе в
//    вьюпорт и плавно скрываются при выходе — в обе стороны, при каждом
//    прохождении, а не один раз за загрузку страницы.

(function () {
  // --- 1. Высота шапки в CSS-переменную ---
  var header = document.querySelector('header');
  var headerHeight = header ? header.offsetHeight : 70;

  function syncHeaderHeight() {
    headerHeight = header ? header.offsetHeight : 70;
    document.documentElement.style.setProperty('--header-h', headerHeight + 'px');
  }
  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight);

  // --- 2. Scroll-spy по проценту видимости ---
  var spyTriggers = document.querySelectorAll('[data-spy]');
  if (spyTriggers.length && 'IntersectionObserver' in window) {
    var sections = {};
    spyTriggers.forEach(function (trigger) {
      var id = trigger.getAttribute('data-spy');
      var el = document.getElementById(id);
      if (el) sections[id] = { trigger: trigger, ratio: 0 };
    });
    var ids = Object.keys(sections);

    function applyActive() {
      var winnerId = null;
      var maxRatio = 0;
      ids.forEach(function (id) {
        if (sections[id].ratio > maxRatio) {
          maxRatio = sections[id].ratio;
          winnerId = id;
        }
      });
      if (!winnerId) return;
      ids.forEach(function (id) {
        sections[id].trigger.classList.toggle('is-active', id === winnerId);
      });
    }

    // Плотная сетка порогов — наблюдатель уведомляет при каждом шаге в 5%
    // видимости, а не только на входе/выходе, иначе "текущий максимум"
    // не будет обновляться, пока идёт прокрутка внутри секции.
    var thresholds = [];
    for (var t = 0; t <= 1; t += 0.05) thresholds.push(t);

    function buildSpyObserver() {
      return new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.id;
          if (sections[id]) sections[id].ratio = entry.intersectionRatio;
        });
        applyActive();
      }, {
        rootMargin: '-' + headerHeight + 'px 0px 0px 0px',
        threshold: thresholds
      });
    }

    var spyObserver = buildSpyObserver();
    ids.forEach(function (id) {
      spyObserver.observe(document.getElementById(id));
    });

    // При смене высоты шапки (например, ресайз с десктопа на мобильный)
    // пересоздаём наблюдатель с новым rootMargin — иначе он останется
    // привязан к старой высоте до следующей полной перезагрузки страницы.
    window.addEventListener('resize', function () {
      spyObserver.disconnect();
      spyObserver = buildSpyObserver();
      ids.forEach(function (id) {
        spyObserver.observe(document.getElementById(id));
      });
    });
  }

  // --- 3. Reveal, в обе стороны ---
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }
})();
