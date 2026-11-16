/* ===== SEJARAH.JS: tandai bagian yang sedang dibaca pada menu Sejarah ===== */
(() => {
  const bagian = document.querySelectorAll("main section[id]");
  const tautan = document.querySelectorAll(".menu-list a, .menu-feature");
  const pengamat = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      tautan.forEach(a => a.classList.toggle("active", a.getAttribute("href").endsWith("#" + entry.target.id)));
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  bagian.forEach(s => pengamat.observe(s));
})();
