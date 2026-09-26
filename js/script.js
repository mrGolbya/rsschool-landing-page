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