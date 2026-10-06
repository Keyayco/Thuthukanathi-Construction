/* Standalone browser behaviour. No libraries or server required. */
(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNavigation = document.querySelector('.mobile-nav');
  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    mobileNavigation.hidden = true;
  }
  menuButton.addEventListener('click', () => {
    const opening = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
    mobileNavigation.hidden = !opening;
  });
  mobileNavigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 800) closeMenu();
  });

  const quoteDialog = document.getElementById('quote-dialog');
  const imageDialog = document.getElementById('image-dialog');
  function openDialog(dialog) {
    closeMenu();
    dialog.showModal();
    document.body.classList.add('modal-open');
  }
  document.querySelectorAll('[data-quote]').forEach(button => {
    button.addEventListener('click', () => openDialog(quoteDialog));
  });
  [quoteDialog, imageDialog].forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  });

  const gallery = document.querySelector('.project-grid');
  const projects = Array.from(document.querySelectorAll('.project-image'));
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(filter => {
        const selected = filter === button;
        filter.classList.toggle('active', selected);
        filter.setAttribute('aria-pressed', String(selected));
      });
      gallery.classList.toggle('filtered', category !== 'all');
      projects.forEach(project => {
        project.hidden = category !== 'all' && project.dataset.category !== category;
      });
    });
  });
  projects.forEach(project => {
    project.addEventListener('click', () => {
      const image = imageDialog.querySelector('img');
      image.src = project.dataset.image;
      image.alt = project.querySelector('img').alt;
      imageDialog.querySelector('p').textContent = project.dataset.caption;
      openDialog(imageDialog);
    });
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    if (!reducedMotion.matches) document.body.classList.add('motion-ready');
    document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
    const navigationObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.desktop-nav a').forEach(link => {
            const active = link.getAttribute('href') === '#' + entry.target.id;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
    document.querySelectorAll('main section[id]').forEach(section => navigationObserver.observe(section));
  }
  const hero = document.querySelector('.hero');
  const heroImage = document.querySelector('.hero-image');
  let scrollQueued = false;
  window.addEventListener('scroll', () => {
    if (scrollQueued || reducedMotion.matches) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      if (window.scrollY < hero.offsetHeight) {
        heroImage.style.transform = 'translateY(' + Math.min(window.scrollY * 0.08, 40) + 'px)';
      }
      scrollQueued = false;
    });
  }, { passive: true });
})();
