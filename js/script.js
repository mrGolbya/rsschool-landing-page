// --- ПЕРЕКЛЮЧЕНИЕ ТЕМЫ ---
const themeBtn = document.querySelector('.theme-toggle');

// Функция смены темы
function toggleTheme() {
    const isDark = document.documentElement.hasAttribute('data-theme');

    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Проверяем сохранённую тему при загрузке
// js/theme-init.js
try {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
} catch (e) {
  // localStorage недоступен — остаёмся на светлой
}

themeBtn.addEventListener('click', toggleTheme);

// БУРГЕР-МЕНЮ
const burger = document.querySelector('.burger');
const nav    = document.querySelector('.header__nav');

if (burger && nav) {
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('no-scroll', open);
  };

  burger.addEventListener('click', () => {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });
}

// СЛАЙДЕР
const sliderEl = document.querySelector('.slider');

if (sliderEl) {
  const track = sliderEl.querySelector('.slider__track');
  const slides = sliderEl.querySelectorAll('.slider__slide');
  const prevBtn = sliderEl.querySelector('.slider__arrow--prev');
  const nextBtn = sliderEl.querySelector('.slider__arrow--next');
  const dots = sliderEl.querySelectorAll('.slider__dot');

  const totalSlides = slides.length;
  let currentSlide = 0;

  const updateSlider = () => {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, i) => {
      dot.classList.toggle('slider__dot--active', i === currentSlide);
    });
  };

  const goToSlide = (index) => {
    currentSlide = (index + totalSlides) % totalSlides;
    updateSlider();
  };

  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
  dots.forEach((dot) => dot.addEventListener('click', () => goToSlide(Number(dot.dataset.dot))));

  updateSlider();
}

(function () {
  
  // Константы
  
  const CARDS_PER_PAGE = 4;   // сколько карточек показывать сначала

  const tabs = document.querySelectorAll('.menu-tabs__btn');
  const panels = document.querySelectorAll('.menu-panel');
  if (!tabs.length || !panels.length) return;

  let MENU_DATA = [];

  // Храним состояние по каждой категории
  const state = {
    coffee:  { rendered: false, visible: CARDS_PER_PAGE },
    tea:     { rendered: false, visible: CARDS_PER_PAGE },
    dessert: { rendered: false, visible: CARDS_PER_PAGE },
  };

  
  // Загрузка данных
  
  async function loadMenu() {
    try {
      const res = await fetch('./js/data.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      MENU_DATA = await res.json();
    } catch (err) {
      console.error('Ошибка загрузки data.json:', err);
    }
  }

  
  // Создание карточки
  
  function createCard(item) {
    const li = document.createElement('li');
    li.className = 'menu-card';
    li.dataset.id = item.id;
    li.dataset.category = item.category;
    li.innerHTML = `
      <div class="menu-card__image-wrap">
        <img class="menu-card__image" src="${item.img}" alt="${item.name}"
             width="310" height="310" loading="lazy">
      </div>
      <div class="menu-card__body">
        <h3 class="menu-card__name">${item.name}</h3>
        <p class="menu-card__desc">${item.desc}</p>
        <span class="menu-card__price">$${item.price.toFixed(2)}</span>
      </div>
    `;
    return li;
  }

  
  // Рендер всех карточек категории (но с показом только N)
  
  function renderCategory(category) {
    if (state[category].rendered) return;

    const grid = document.querySelector(`[data-grid="${category}"]`);
    if (!grid) return;

    const items = MENU_DATA.filter((item) => item.category === category);

    grid.innerHTML = '';
    items.forEach((item) => grid.appendChild(createCard(item)));

    state[category].rendered = true;
    updateVisibility(category);
  }

  
  // Показать только N карточек, остальные — скрыть
  
  function updateVisibility(category) {
    const grid = document.querySelector(`[data-grid="${category}"]`);
    if (!grid) return;

    const cards = grid.querySelectorAll('.menu-card');
    const limit = state[category].visible;

    cards.forEach((card, i) => {
      card.hidden = i >= limit;
    });

    updateMoreButton(category, cards.length);
  }

  
  // Показать/скрыть кнопку "Show more"
  
  function updateMoreButton(category, totalCards) {
    const btn = document.querySelector(`[data-more="${category}"]`);
    if (!btn) return;

    const visible = state[category].visible;

    // Кнопка есть, только если не все карточки показаны
    btn.hidden = visible >= totalCards;
  }

  
  // Клик по "Show more"
  
  function bindMoreButtons() {
    const buttons = document.querySelectorAll('.menu-more__btn');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.more;

        // Показываем все карточки — или ещё столько же
        // (по ТЗ "показывает дополнительные или все оставшиеся")
        state[category].visible += CARDS_PER_PAGE;
        updateVisibility(category);
      });
    });
  }

  // Переключение табов

  function bindTabs() {
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const category = tab.dataset.tab;

        // Ленивая отрисовка при первом клике
        renderCategory(category);

        // Обновляем активный таб
        tabs.forEach((t) => {
          t.classList.toggle('menu-tabs__btn--active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });

        // Показываем нужную панель
        panels.forEach((p) => {
          p.hidden = p.dataset.panel !== category;
        });
      });
    });
  }

  
  // Инициализация
  
  async function init() {
    await loadMenu();
    renderCategory('coffee');   // активная по умолчанию
    bindTabs();
    bindMoreButtons();
  }

  init();
})();