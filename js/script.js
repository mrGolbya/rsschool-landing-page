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