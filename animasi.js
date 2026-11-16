/* =========================================================
   ANIMASI WEBSITE SEJARAH KABUPATEN BARRU
   Pengganti animasi.js lama — tidak memerlukan perubahan HTML.
   ========================================================= */

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. PRELOADER: tutup setelah halaman siap, dengan fallback agar tidak macet.
  const preloader = document.getElementById('barru-preloader');
  if (preloader) {
    document.body.classList.add('sedang-memuat');
    let sudahDitutup = false;

    const tutupPreloader = () => {
      if (sudahDitutup) return;
      sudahDitutup = true;
      const jeda = reduceMotion ? 0 : 450;
      window.setTimeout(() => {
        preloader.classList.add('selesai');
        document.body.classList.remove('sedang-memuat');
        window.setTimeout(() => preloader.remove(), reduceMotion ? 0 : 700);
      }, jeda);
    };

    if (document.readyState === 'complete') tutupPreloader();
    else window.addEventListener('load', tutupPreloader, { once: true });
    // Fallback jika event load tertahan oleh aset eksternal.
    window.setTimeout(tutupPreloader, 4500);
  }

  // 2. KELAS JS untuk mengaktifkan animasi CSS.
  document.documentElement.classList.add('js');
  if (reduceMotion) {
    document.documentElement.classList.add('motion-reduce');
    return;
  }

  // 3. SCROLL REVEAL + STAGGER untuk kartu.
  const revealSelector = [
    'main > section:not(.hero)',
    'main .judul-tengah',
    'main .kartu',
    'main .section-wrap > *',
    '.footer'
  ].join(',');

  const revealItems = [...document.querySelectorAll(revealSelector)];
  revealItems.forEach((el, index) => {
    el.classList.add('anim-reveal');
    if (el.matches('.kartu')) {
      const siblingCards = [...el.parentElement.querySelectorAll('.kartu')];
      el.style.setProperty('--reveal-delay', `${siblingCards.indexOf(el) * 110}ms`);
    } else {
      el.style.setProperty('--reveal-delay', `${(index % 3) * 65}ms`);
    }
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(el => revealObserver.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('is-visible'));
  }

  // 4. HERO: animasi teks bertahap saat halaman dibuka.
  const hero = document.querySelector('.hero');
  if (hero) {
    window.requestAnimationFrame(() => hero.classList.add('hero-animasi-mulai'));
  }

  // 5. NAVBAR: muncul dari atas dan memiliki status saat halaman digulir.
  const header = document.querySelector('.site-header');
  if (header) {
    header.classList.add('header-animasi');
    window.requestAnimationFrame(() => header.classList.add('header-siap'));

    let scrollTicking = false;
    const updateHeader = () => {
      header.classList.toggle('header-scrolled', window.scrollY > 18);
      scrollTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(updateHeader);
        scrollTicking = true;
      }
    }, { passive: true });
    updateHeader();
  }

  // 6. DROPDOWN: deteksi saat menu dibuka oleh CSS atau JavaScript menu utama.
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    const menu = dropdown.querySelector('.dropdown-menu');
    const button = dropdown.querySelector('.dropdown-toggle');
    if (!menu) return;

    const animateMenu = () => {
      const style = window.getComputedStyle(menu);
      const visible = style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0;
      if (visible) {
        menu.classList.remove('menu-baru-dibuka');
        // Paksa reflow supaya animasi dapat diputar ulang setiap dibuka.
        void menu.offsetWidth;
        menu.classList.add('menu-baru-dibuka');
      } else {
        menu.classList.remove('menu-baru-dibuka');
      }
    };

    if (button) {
      button.addEventListener('click', () => window.setTimeout(animateMenu, 20));
      button.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') window.setTimeout(animateMenu, 20);
      });
    }
    dropdown.addEventListener('mouseenter', animateMenu);
    dropdown.addEventListener('focusin', animateMenu);
    dropdown.addEventListener('mouseleave', () => menu.classList.remove('menu-baru-dibuka'));
    dropdown.addEventListener('focusout', event => {
      if (!dropdown.contains(event.relatedTarget)) menu.classList.remove('menu-baru-dibuka');
    });

  });

  // 7. SCROLL PROGRESS BAR di bagian paling atas.
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  let progressTicking = false;
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progress.style.setProperty('--scroll-progress', `${Math.min(100, Math.max(0, percent))}%`);
    progressTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!progressTicking) {
      window.requestAnimationFrame(updateProgress);
      progressTicking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  // 8. PARALLAX ringan pada latar hero. Nonaktif di layar kecil.
  const heroBackground = document.querySelector('.hero-kiri');
  if (heroBackground && window.matchMedia('(min-width: 768px)').matches) {
    let parallaxTicking = false;
    const updateParallax = () => {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const offset = Math.max(-22, Math.min(22, rect.top * -0.045));
        heroBackground.style.setProperty('--hero-parallax-y', `${offset}px`);
      }
      parallaxTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        window.requestAnimationFrame(updateParallax);
        parallaxTicking = true;
      }
    }, { passive: true });
    updateParallax();
  }

  // 9. ZOOM HALUS pada gambar ketika bagian terkait terlihat.
  const visualItems = document.querySelectorAll('.mengenal .foto, .kartu .gbr');
  if ('IntersectionObserver' in window) {
    const visualObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('gambar-terlihat');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    visualItems.forEach(el => {
      el.classList.add('gambar-animasi');
      visualObserver.observe(el);
    });
  } else {
    visualItems.forEach(el => el.classList.add('gambar-terlihat'));
  }

  // 10. MAGNETIC MICRO-INTERACTION ringan untuk tombol utama.
  const magneticItems = document.querySelectorAll('.nav-cta, .hero .btn, .mengenal .btn');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    magneticItems.forEach(item => {
      item.classList.add('magnetic-ready');
      item.addEventListener('pointermove', event => {
        const rect = item.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
        item.style.setProperty('--mag-x', `${x * 5}px`);
        item.style.setProperty('--mag-y', `${y * 5}px`);
      });
      item.addEventListener('pointerleave', () => {
        item.style.setProperty('--mag-x', '0px');
        item.style.setProperty('--mag-y', '0px');
      });
    });
  }

  // 11. ACTIVE NAV LINK untuk tautan yang mengarah ke bagian halaman.
  const sectionLinks = [...document.querySelectorAll('.main-nav a[href*="#"]')];
  const pageSections = sectionLinks
    .map(link => document.querySelector(link.getAttribute('href').split('#')[1] ? `#${CSS.escape(link.getAttribute('href').split('#')[1])}` : ''))
    .filter(Boolean);

  if (pageSections.length && 'IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        sectionLinks.forEach(link => {
          const targetId = link.getAttribute('href').split('#')[1];
          link.classList.toggle('section-active', targetId === id);
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    pageSections.forEach(section => activeObserver.observe(section));
  }
})();
