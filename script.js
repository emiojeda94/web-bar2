const menuToggle = document.querySelector('.menu-toggle');
const navigationLinks = document.querySelector('#navigation-links');
if (menuToggle && navigationLinks) {
  function closeMenu() {
    navigationLinks.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  menuToggle.addEventListener('click', () => {
    const isOpen = navigationLinks.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navigationLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigationLinks.classList.contains('is-open')) {
      closeMenu();
      menuToggle.focus();
    }
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
}

const servicesTrack = document.querySelector('#services-track');
const servicesPrev = document.querySelector('#services-prev');
const servicesNext = document.querySelector('#services-next');
const servicesStatus = document.querySelector('.carousel-status');

if (servicesTrack && servicesPrev && servicesNext && servicesStatus) {
  const cards = [...servicesTrack.querySelectorAll('.service-card')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileCarousel = window.matchMedia('(max-width: 760px)');

  function updateCarousel() {
    if (!mobileCarousel.matches) {
      servicesPrev.disabled = true;
      servicesNext.disabled = true;
      servicesStatus.textContent = '';
      return;
    }
    const maxScroll = servicesTrack.scrollWidth - servicesTrack.clientWidth;
    servicesPrev.disabled = servicesTrack.scrollLeft <= 2;
    servicesNext.disabled = servicesTrack.scrollLeft >= maxScroll - 2;
    const viewport = servicesTrack.getBoundingClientRect();
    const visible = cards.map((card, index) => ({ rect: card.getBoundingClientRect(), index }))
      .filter(({ rect }) => rect.left >= viewport.left - 2 && rect.right <= viewport.right + 2);
    if (visible.length) {
      const first = visible[0].index + 1;
      const last = visible[visible.length - 1].index + 1;
      servicesStatus.textContent = `${first === last ? first : `${first}–${last}`} / ${cards.length}`;
    }
  }

  function moveCarousel(direction) {
    if (!mobileCarousel.matches) return;
    const gap = parseFloat(getComputedStyle(servicesTrack).columnGap) || 0;
    const step = cards[0].getBoundingClientRect().width + gap;
    servicesTrack.scrollBy({ left: direction * step, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  servicesPrev.addEventListener('click', () => moveCarousel(-1));
  servicesNext.addEventListener('click', () => moveCarousel(1));
  servicesTrack.addEventListener('scroll', updateCarousel, { passive: true });
  servicesTrack.addEventListener('keydown', event => {
    // Las flechas controlan el carrusel cuando su área tiene el foco.
    if (event.target !== servicesTrack || !mobileCarousel.matches) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      moveCarousel(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  new ResizeObserver(updateCarousel).observe(servicesTrack);
  document.fonts.ready.then(updateCarousel);
  function configureCarousel() {
    if (mobileCarousel.matches) {
      servicesTrack.setAttribute('tabindex', '0');
      servicesTrack.setAttribute('aria-roledescription', 'carrusel');
      servicesTrack.setAttribute('aria-label', 'Servicios: usá las flechas o deslizá para explorar');
    } else {
      servicesTrack.removeAttribute('tabindex');
      servicesTrack.removeAttribute('aria-roledescription');
      servicesTrack.setAttribute('aria-label', 'Servicios');
      servicesTrack.scrollLeft = 0;
    }
    updateCarousel();
  }
  mobileCarousel.addEventListener('change', configureCarousel);
  configureCarousel();
}

// El contenido permanece visible si no hay soporte o se solicita reducir movimiento.
const pageMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !pageMotionPreference.matches) {
  const revealBlocks = document.querySelectorAll(
    '.hero-content, .services-heading, .hours-heading, .hours-details, .contact-copy, .contact-channels'
  );
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  revealBlocks.forEach(block => {
    block.classList.add('scroll-reveal');
    revealObserver.observe(block);
  });
  document.addEventListener('focusin', event => {
    const block = event.target.closest('.scroll-reveal');
    if (block) {
      block.classList.add('is-visible');
      revealObserver.unobserve(block);
    }
  });
}
