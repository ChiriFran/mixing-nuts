import { Link } from 'react-router-dom';
import { storeConfig } from '../../config/store';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__wave">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,40 C360,100 720,0 1080,60 C1260,80 1380,40 1440,40 L1440,100 L0,100 Z" fill="currentColor"/>
        </svg>
      </div>
      <div className="footer__content container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/" className="footer__logo" title="Mixing Nuts - Inicio">
              <span className="footer__logo-mixing">Mixing</span>
              <span className="footer__logo-nuts">Nuts</span>
            </Link>
            <p className="footer__description">
              Frutos secos y mixes seleccionados con calidad. Disfrutá lo natural todos los días.
            </p>
          </div>

          <div className="footer__links">
            <h4 className="footer__heading">Productos</h4>
            <Link to="/productos?categoria=frutos-secos" className="footer__link" title="Frutos secos">Frutos secos</Link>
            <Link to="/productos?categoria=mixes" className="footer__link" title="Mixes de frutos secos">Mixes</Link>
            <Link to="/productos?categoria=deshidratados" className="footer__link" title="Deshidratados">Deshidratados</Link>
            <Link to="/productos?categoria=aceites" className="footer__link" title="Aceites">Aceites</Link>
            <Link to="/productos?categoria=harinas" className="footer__link" title="Harinas">Harinas</Link>
            <Link to="/productos?categoria=bebidas" className="footer__link" title="Bebidas">Bebidas</Link>
          </div>

          <div className="footer__links">
            <h4 className="footer__heading">Empresa</h4>
            <Link to="/nosotros" className="footer__link" title="Conocé nuestra historia">Nosotros</Link>
            <Link to="/contacto" className="footer__link" title="Contactanos">Contacto</Link>
          </div>

          <div className="footer__links">
            <h4 className="footer__heading">Contacto</h4>
            <a href={`https://wa.me/${storeConfig.whatsapp}`} target="_blank" rel="noopener noreferrer" className="footer__link" title="Contactanos por WhatsApp">
              WhatsApp
            </a>
            <a href={storeConfig.instagram} target="_blank" rel="noopener noreferrer" className="footer__link" title="Seguinos en Instagram">
              Instagram
            </a>
            <a href={`mailto:${storeConfig.email}`} className="footer__link" title="Envianos un email">
              {storeConfig.email}
            </a>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {new Date().getFullYear()} {storeConfig.name}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
