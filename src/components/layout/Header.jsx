import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { storeConfig } from '../../config/store';
import CartIcon from '../cart/CartIcon';
import './Header.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActiveLink = (to) => {
    if (to === '/nosotros') return location.pathname === '/nosotros';
    if (to === '/productos') {
      return location.pathname === '/productos' && !location.search.includes('categoria');
    }
    const searchPart = to.split('?')[1];
    return location.pathname === '/productos' && location.search.includes(searchPart);
  };

  const navLinks = [
    { to: '/productos', label: 'Productos' },
    { to: '/productos?categoria=mixes', label: 'Mixes' },
    { to: '/productos?categoria=frutos-secos', label: 'Frutos secos' },
    { to: '/productos?categoria=aceites', label: 'Aceites' },
    { to: '/productos?categoria=bebidas', label: 'Bebidas' },
    { to: '/nosotros', label: 'Nosotros' },
  ];

  return (
    <>
      <header className={`header ${scrolled ? 'header--scrolled' : ''} ${menuOpen ? 'header--menu-open' : ''}`}>
        <div className="header__container container">
          <Link to="/" className="header__logo" onClick={() => setMenuOpen(false)} title="Mixing Nuts - Inicio">
            <span className="header__logo-mixing">Mixing</span>
            <span className="header__logo-nuts">Nuts</span>
          </Link>

          <nav className="header__nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={`header__nav-link ${isActiveLink(link.to) ? 'header__nav-link--active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="header__actions">
            <CartIcon onClick={() => setMenuOpen(false)} />
            <button
              className={`header__hamburger ${menuOpen ? 'header__hamburger--open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <div className={`header__mobile-menu ${menuOpen ? 'header__mobile-menu--open' : ''}`}>
        <nav className="header__mobile-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={`header__mobile-link ${isActiveLink(link.to) ? 'header__mobile-link--active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Header;
