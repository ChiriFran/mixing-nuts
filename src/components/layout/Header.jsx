import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getAllCategories } from '../../services/categories';
import CartIcon from '../cart/CartIcon';
import './Header.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const closeTimerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    getAllCategories().then(setCategories);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActiveLink = (to) => location.pathname === to;

  const openDropdown = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setDropdownOpen(true);
  };

  const closeDropdownAfterDelay = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setDropdownOpen(false);
      closeTimerRef.current = null;
    }, 300);
  };

  const closeDropdown = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setDropdownOpen(false);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setProductsOpen(false);
  };

  return (
    <>
      <header className={`header ${scrolled ? 'header--scrolled' : ''} ${menuOpen ? 'header--menu-open' : ''}`}>
        <div className="header__container container">
          <Link to="/" className="header__logo" onClick={closeMenu} title="Mixing Nuts - Inicio">
            <span className="header__logo-mixing">Mixing</span>
            <span className="header__logo-nuts">Nuts</span>
          </Link>

          <nav className="header__nav">
            <NavLink
              to="/"
              className={`header__nav-link ${isActiveLink('/') ? 'header__nav-link--active' : ''}`}
            >
              Home
            </NavLink>

            <div
              className="header__nav-item"
              onMouseEnter={openDropdown}
              onMouseLeave={closeDropdownAfterDelay}
            >
              <NavLink
                to="/productos"
                className={`header__nav-link ${isActiveLink('/productos') ? 'header__nav-link--active' : ''}`}
                onClick={closeDropdown}
              >
                Productos
                <span className="header__nav-caret" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </NavLink>
              <div className={`header__dropdown ${dropdownOpen ? 'header__dropdown--open' : ''}`}>
                <Link to="/productos" className="header__dropdown-link" onClick={closeDropdown}>
                  Todos los productos
                </Link>
                <div className="header__dropdown-divider" role="separator"></div>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/productos?categoria=${cat.slug}`}
                    className="header__dropdown-link"
                    onClick={closeDropdown}
                  >
                    {cat.nombre}
                  </Link>
                ))}
              </div>
            </div>

            <NavLink
              to="/nosotros"
              className={`header__nav-link ${isActiveLink('/nosotros') ? 'header__nav-link--active' : ''}`}
            >
              Nosotros
            </NavLink>
          </nav>

          <div className="header__actions">
            <CartIcon onClick={closeMenu} />
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
          <NavLink
            to="/"
            className={`header__mobile-link ${isActiveLink('/') ? 'header__mobile-link--active' : ''}`}
            onClick={closeMenu}
          >
            Home
          </NavLink>

          <div className="header__mobile-item">
            <div className="header__mobile-item-row">
              <NavLink
                to="/productos"
                className={`header__mobile-link ${isActiveLink('/productos') ? 'header__mobile-link--active' : ''}`}
                onClick={closeMenu}
              >
                Productos
              </NavLink>
              <button
                className={`header__mobile-chevron ${productsOpen ? 'header__mobile-chevron--open' : ''}`}
                onClick={() => setProductsOpen(!productsOpen)}
                aria-label="Mostrar categorías"
                aria-expanded={productsOpen}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
            {productsOpen && (
              <div className="header__mobile-subnav">
                <Link to="/productos" className="header__mobile-subnav-link" onClick={closeMenu}>
                  Todos los productos
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/productos?categoria=${cat.slug}`}
                    className="header__mobile-subnav-link"
                    onClick={closeMenu}
                  >
                    {cat.nombre}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NavLink
            to="/nosotros"
            className={`header__mobile-link ${isActiveLink('/nosotros') ? 'header__mobile-link--active' : ''}`}
            onClick={closeMenu}
          >
            Nosotros
          </NavLink>
        </nav>
      </div>
    </>
  );
};

export default Header;