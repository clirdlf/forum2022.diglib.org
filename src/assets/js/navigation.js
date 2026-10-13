export function init(root = document) {
  const sidebar = root.querySelector('#header-menu-sidebar');
  const toggles = [...root.querySelectorAll('header .navbar-toggle:not(.caret-wrap)')];
  let menuOpener = toggles.find(button => !sidebar?.contains(button));
  const setMenu = open => {
    if (!open && sidebar?.contains(document.activeElement)) menuOpener?.focus();
    document.body.classList.toggle('is-menu-sidebar', open);
    if (sidebar) sidebar.inert = !open;
    toggles.forEach(button => button.setAttribute('aria-expanded', String(open)));
  };
  setMenu(false);
  toggles.forEach(button => button.addEventListener('click', () => {
    const open = !document.body.classList.contains('is-menu-sidebar');
    if (open && !sidebar?.contains(button)) menuOpener = button;
    setMenu(open);
  }));

  root.querySelectorAll('header .caret-wrap').forEach(button => {
    const submenu = button.closest('li')?.querySelector(':scope > .sub-menu');
    if (!submenu) return;
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      submenu.classList.toggle('dropdown-open', open);
    });
  });
  root.querySelectorAll('header a[href]').forEach(a => {
    if (new URL(a.href).pathname !== location.pathname) return;
    a.setAttribute('aria-current', 'page');
    a.closest('li')?.classList.add('current-menu-item', 'nv-active');
    let ancestor = a.closest('li')?.parentElement?.closest('li');
    while (ancestor) {
      ancestor.classList.add('nv-active');
      ancestor = ancestor.parentElement?.closest('li');
    }
  });
  document.addEventListener('click', event => {
    root.querySelectorAll('header .dropdown-open').forEach(submenu => {
      if (!submenu.parentElement.contains(event.target)) {
        submenu.classList.remove('dropdown-open');
        submenu.parentElement.querySelector('.caret-wrap')?.setAttribute('aria-expanded', 'false');
      }
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const submenu = document.activeElement.closest('header .sub-menu');
    submenu?.parentElement.querySelector('.caret-wrap')?.focus();
    setMenu(false);
    root.querySelectorAll('header .dropdown-open').forEach(el => el.classList.remove('dropdown-open'));
    root.querySelectorAll('header .caret-wrap').forEach(el => el.setAttribute('aria-expanded', 'false'));
  });

  root.querySelectorAll('.elementor-menu-toggle').forEach(button => {
    const menu = button.parentElement.querySelector('.elementor-nav-menu--dropdown');
    if (!menu) return;
    const set = open => {
      button.setAttribute('aria-expanded', String(open));
      button.classList.toggle('elementor-active', open);
      menu.setAttribute('aria-hidden', String(!open));
      menu.classList.toggle('archive-footer-open', open);
      menu.querySelectorAll('a[href]').forEach(a => { a.tabIndex = open ? 0 : -1; });
    };
    set(false);
    const toggle = () => set(button.getAttribute('aria-expanded') !== 'true');
    button.addEventListener('click', toggle);
    button.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); }
    });
    menu.addEventListener('keydown', event => {
      if (event.key === 'Escape') { button.focus(); set(false); }
    });
  });
  const top = root.querySelector('#scroll-to-top');
  if (top) {
    const update = () => top.classList.toggle('visible', scrollY > 400);
    addEventListener('scroll', update, {passive: true});
    update();
    top.addEventListener('click', () => scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth'}));
  }
}
