


// ПЕРЕКЛЮЧЕНИЕ ТЕМЫ

const themeBtn = document.querySelector('.theme-toggle');

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

try {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
} catch (e) { /* localStorage недоступен */ }

if (themeBtn) themeBtn.addEventListener('click', toggleTheme);



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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      burger.focus();
    }
  });

  const mq = window.matchMedia('(min-width: 769px)');
  const onDesktop = (e) => { if (e.matches) setMenu(false); };
  if (mq.addEventListener) mq.addEventListener('change', onDesktop);
  else mq.addListener(onDesktop);
}



// СЛАЙДЕР

const sliderEl = document.querySelector('.slider');

if (sliderEl) {
  const track   = sliderEl.querySelector('.slider__track');
  const slides  = sliderEl.querySelectorAll('.slider__slide');
  const prevBtn = sliderEl.querySelector('.slider__arrow--prev');
  const nextBtn = sliderEl.querySelector('.slider__arrow--next');
  const dots    = sliderEl.querySelectorAll('.slider__dot');

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
  dots.forEach((dot) =>
    dot.addEventListener('click', () => goToSlide(Number(dot.dataset.dot)))
  );

  updateSlider();
}



// МЕНЮ (табы, карточки, "Show more")

const CARDS_PER_PAGE = 4;

const tabs   = document.querySelectorAll('.menu-tabs__btn');
const panels = document.querySelectorAll('.menu-panel');

let MENU_DATA = [];

const state = {
  coffee:  { rendered: false, visible: CARDS_PER_PAGE },
  tea:     { rendered: false, visible: CARDS_PER_PAGE },
  dessert: { rendered: false, visible: CARDS_PER_PAGE },
};

async function loadMenu() {
  try {
    const res = await fetch('./js/data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    MENU_DATA = await res.json();
  } catch (err) {
    console.error('Ошибка загрузки data.json:', err);
  }
}

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
      <p class="menu-card__desc">${item.description}</p>
      <span class="menu-card__price">$${Number(item.price).toFixed(2)}</span>
    </div>
  `;
  return li;
}

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

function updateVisibility(category) {
  const grid = document.querySelector(`[data-grid="${category}"]`);
  if (!grid) return;

  const cards = grid.querySelectorAll('.menu-card');
  const limit = state[category].visible;

  cards.forEach((card, i) => { card.hidden = i >= limit; });

  updateMoreButton(category, cards.length);
}

function updateMoreButton(category, totalCards) {
  const btn = document.querySelector(`[data-more="${category}"]`);
  if (!btn) return;

  btn.hidden = state[category].visible >= totalCards;
}

function bindMoreButtons() {
  document.querySelectorAll('.menu-more__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.more;
      state[category].visible += CARDS_PER_PAGE;
      updateVisibility(category);
    });
  });
}

function bindTabs() {
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.tab;

      renderCategory(category);

      tabs.forEach((t) => {
        t.classList.toggle('menu-tabs__btn--active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });

      panels.forEach((p) => { p.hidden = p.dataset.panel !== category; });
    });
  });
}



// МОДАЛЬНОЕ ОКНО ТОВАРА

function initProductModal() {
  const grid = document.querySelector('.menu-grid');
  if (!grid) return;

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="modal__overlay" data-close></div>
    <div class="modal__dialog" role="dialog" aria-modal="true">
      <div class="modal__content">
        <div class="modal__media">
          <img class="modal__image" data-img src="" alt="">
        </div>
        <div class="modal__body">
          <h2 class="modal__title" data-title></h2>
          <p  class="modal__desc"  data-desc></p>

          <div class="modal__group" data-sizes-group>
            <p class="modal__group-title">Size</p>
            <div class="modal__options" data-sizes></div>
          </div>

          <div class="modal__group" data-adds-group>
            <p class="modal__group-title">Additives</p>
            <div class="modal__options" data-adds></div>
          </div>

          <div class="modal__total">
            <span>Total:</span>
            <span data-total>$0.00</span>
          </div>

          <p class="modal__note" data-note></p>
          <button class="modal__submit" type="button" data-close>Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const $ = (sel) => modal.querySelector(sel);
  let item = null;

  function open(product) {
    item = product;

    const base = Number(product.price);

    $('[data-img]').src           = product.img;
    $('[data-img]').alt           = product.name;
    $('[data-title]').textContent = product.name;
    $('[data-desc]').textContent  = product.description;

    // ---------- Sizes ----------
    $('[data-sizes-group]').hidden = !product.sizes;
    $('[data-sizes]').innerHTML = Object.entries(product.sizes || {})
      .map(([key, s]) => `
        <button class="modal__option" type="button"
                data-size="${key}"
                data-price="${base + Number(s['add-price'])}">
          <span class="modal__option-icon">${key.toUpperCase()}</span>
          <span class="modal__option-text">${s.size}</span>
        </button>
      `).join('');

    // ---------- Additives ----------
    $('[data-adds-group]').hidden = !product.additives?.length;
    $('[data-adds]').innerHTML = (product.additives || [])
      .map((a, i) => `
        <button class="modal__option" type="button"
                data-add
                data-price="${a['add-price']}">
          <span class="modal__option-icon">${i + 1}</span>
          <span class="modal__option-text">${a.name}</span>
        </button>
      `).join('');

    // ---------- Note ----------
    $('[data-note]').textContent = product.additives?.length
      ? `Add ${product.additives.map((a) => a.name.toLowerCase()).join(', ')} for an extra charge.`
      : `Made with fresh ingredients.`;

    // первый размер — активный
    modal.querySelectorAll('[data-size]').forEach((b, i) => {
      b.classList.toggle('is-active', i === 0);
    });

    updateTotal();
    modal.hidden = false;
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => modal.classList.add('is-open'));
  }

  function updateTotal() {
    const sizePrice =
      +modal.querySelector('[data-size].is-active')?.dataset.price ||
      Number(item.price);

    const addPrice = [...modal.querySelectorAll('[data-add].is-active')]
      .reduce((sum, b) => sum + (+b.dataset.price || 0), 0);

    $('[data-total]').textContent = `$${(sizePrice + addPrice).toFixed(2)}`;
  }

  function close() {
    modal.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    setTimeout(() => { modal.hidden = true; item = null; }, 250);
  }

  // ---------- Делегированный обработчик ----------
  document.addEventListener('click', (e) => {
    // открытие — клик по карточке меню
    const card = e.target.closest('.menu-card');
    if (card) {
      const found = MENU_DATA.find((x) => x.id === card.dataset.id);
      if (found) open(found);
      return;
    }

    // закрытие
    if (e.target.closest('[data-close]')) { close(); return; }

    // размер — radio
    const sizeBtn = e.target.closest('[data-size]');
    if (sizeBtn) {
      modal.querySelectorAll('[data-size]').forEach((b) =>
        b.classList.toggle('is-active', b === sizeBtn));
      updateTotal();
      return;
    }

    // добавка — toggle
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      addBtn.classList.toggle('is-active');
      updateTotal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) close();
  });
}



// ИНИЦИАЛИЗАЦИЯ

async function init() {
  if (tabs.length && panels.length) {
    await loadMenu();
    renderCategory('coffee');
    bindTabs();
    bindMoreButtons();
    initProductModal();
  }
}

init();