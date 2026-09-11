import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToProducts } from '../services/products';
import { getAllCategories } from '../services/categories';
import ProductCard from '../components/products/ProductCard';
import FeaturedProducts from '../components/products/FeaturedProducts';
import MobileSlider from '../components/ui/MobileSlider';
import Spinner from '../components/ui/Spinner';
import './Home.css';

const Home = () => {
  const [mixProducts, setMixProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionsRef = useRef([]);

  useEffect(() => {
    const unsubscribe = subscribeToProducts((products) => {
      setMixProducts(products.filter((p) => p.categoria === 'Mixes' && p.activo));
      setLoading(false);
    }, (error) => {
      console.error('Error loading products:', error);
      setLoading(false);
    });
    getAllCategories().then(setCategories);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section--visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionsRef.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const addSectionRef = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__container container">
          <div className="hero__content">
            <span className="hero__tag">Frutos secos y mixes seleccionados</span>
            <h1 className="hero__title">
              Frutos secos y mixes <span className="hero__title-highlight">en Buenos Aires</span>
            </h1>
            <p className="hero__subtitle">
              Comprá online almendras, nueces, cajú, maní, frutas deshidratadas y mixes premium seleccionados en Argentina.
            </p>
          </div>
          <div className="hero__visual">
            <div className="hero__image-wrapper">
              <div className="hero__blob"></div>
              <img src="/images/hero.png" alt="Frutos secos y mixes" title="Frutos secos y mixes Mixing Nuts Buenos Aires" className="hero__image" />
            </div>
          </div>
          <div className="hero__cta">
            <Link to="/productos" className="btn btn-primary btn-lg" title="Ver todos nuestros productos">
              Ver productos
            </Link>
            <Link to="/productos?categoria=mixes" className="btn btn-outline btn-lg" title="Comprar mixes de frutos secos">
              Conocé nuestros mixes
            </Link>
          </div>
        </div>
        <div className="hero__decoration">
          <svg viewBox="0 0 1440 200" preserveAspectRatio="none">
            <path d="M0,80 C120,180 240,-20 360,80 C480,180 600,-20 720,80 C840,180 960,-20 1080,80 C1200,180 1320,-20 1440,80 L1440,200 L0,200Z" fill="var(--color-primary-light)" opacity="0.5"/>
            <path d="M0,100 C120,200 240,0 360,100 C480,200 600,0 720,100 C840,200 960,0 1080,100 C1200,200 1320,0 1440,100 L1440,200 L0,200Z" fill="currentColor"/>
          </svg>
        </div>
      </section>

      {/* Categories */}
      <section className="categories section" ref={addSectionRef}>
        <div className="container">
          <h2 className="section-title">Comprá frutos secos, mixes y productos naturales</h2>
          <p className="section-subtitle">Encontrá almendras, nueces, deshidratados, aceites, harinas y más en un solo lugar.</p>
          <div className="categories__grid">
            {loading ? (
              <Spinner />
            ) : categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/productos?categoria=${cat.slug}`}
                className="category-circle"
              >
                <div className="category-circle__image">
                  <img src={cat.imagen} alt={cat.nombre} title={`Categoría ${cat.nombre} - Frutos secos`} />
                </div>
                <span className="category-circle__name">{cat.nombre}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial 1 */}
      <section className="editorial section" ref={addSectionRef}>
        <div className="container">
          <div className="editorial__grid editorial__grid--reverse">
            <div className="editorial__image">
              <img src="/images/back-1.png" alt="Frutos secos seleccionados" title="Nuestra selección de frutos secos premium" className="editorial__img" />
            </div>
            <div className="editorial__content">
              <span className="editorial__tag">Nuestra historia</span>
              <h2 className="editorial__title">Frutos secos seleccionados para disfrutar todos los días</h2>
              <p className="editorial__text">
                En Mixing Nuts seleccionamos almendras, nueces, cajú, maní y frutas deshidratadas
                para ofrecer snacks saludables con calidad y sabor. Armamos cada mix pensando en
                tus momentos de energía, trabajo, estudio o descanso.
              </p>
              <Link to="/nosotros" className="btn btn-outline" title="Conocé nuestra historia">
                Conocé más
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Mixes Section */}
      <section className="mixes section" ref={addSectionRef}>
        <div className="container">
          <h2 className="section-title">Mixes de frutos secos para cada momento</h2>
          <p className="section-subtitle">Comprá Mix Premium, Mix Completo, Mix Intermedio y otras combinaciones online.</p>
          {loading ? (
            <Spinner />
          ) : (
            <div className="mixes__grid">
              {mixProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Editorial 2 */}
      <section className="editorial section" ref={addSectionRef}>
        <div className="container">
          <div className="editorial__grid">
            <div className="editorial__content">
              <span className="editorial__tag">Calidad garantizada</span>
              <h2 className="editorial__title">Calidad en frutos secos y snacks saludables</h2>
              <p className="editorial__text">
                Cada producto que llega a tus manos fue cuidadosamente seleccionado.
                Trabajamos con proveedores de confianza para ofrecer frutos secos,
                deshidratados y mixes frescos, sabrosos y prácticos.
              </p>
              <Link to="/productos" className="btn btn-outline" title="Explorar catálogo de productos">
                Explorar productos
              </Link>
            </div>
            <div className="editorial__image">
              <img src="/images/back-1.png" alt="Frutos secos seleccionados" title="Nuestra selección de frutos secos premium" className="editorial__img" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="benefits section" ref={addSectionRef}>
        <div className="container">
          <MobileSlider gridClass="benefits-grid">
            <div className="benefit">
              <div className="benefit__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className="benefit__title">Calidad asegurada</h3>
              <p className="benefit__text">Seleccionamos cada producto con estándares estrictos de calidad.</p>
            </div>
            <div className="benefit">
              <div className="benefit__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
              </div>
              <h3 className="benefit__title">Hecho con pasión</h3>
              <p className="benefit__text">Amamos lo que hacemos y se nota en cada detalle.</p>
            </div>
            <div className="benefit">
              <div className="benefit__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3 className="benefit__title">Envío rápido</h3>
              <p className="benefit__text">Recibí tu pedido en el menor tiempo posible.</p>
            </div>
          </MobileSlider>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-final section" ref={addSectionRef}>
        <div className="cta-final__wave">
          <svg viewBox="0 0 1440 200" preserveAspectRatio="none">
            <path d="M0,120 C120,20 240,220 360,120 C480,20 600,220 720,120 C840,20 960,220 1080,120 C1200,20 1320,220 1440,120 L1440,0 L0,0Z" fill="var(--color-primary-light)" opacity="0.5"/>
            <path d="M0,100 C120,0 240,200 360,100 C480,0 600,200 720,100 C840,0 960,200 1080,100 C1200,0 1320,200 1440,100 L1440,0 L0,0Z" fill="currentColor"/>
          </svg>
        </div>
        <div className="container">
          <div className="cta-final__content">
            <h2 className="cta-final__title">Comprá frutos secos online en Buenos Aires</h2>
            <p className="cta-final__text">
              Explorá el catálogo de Mixing Nuts y encontrá el mix o producto natural ideal para vos.
            </p>
            <Link to="/productos" className="btn btn-primary btn-lg" title="Ver catálogo completo">
              Ver catálogo completo
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials section" ref={addSectionRef}>
        <div className="container">
          <h2 className="section-title">Opiniones sobre nuestros frutos secos y mixes</h2>
          <p className="section-subtitle">Testimonios reales de quienes ya probaron nuestros productos.</p>
          <MobileSlider gridClass="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-card__stars">★★★★★</div>
              <p className="testimonial-card__text">
                "Excelente calidad y muy buena atención. Los mixes son los mejores que probé."
              </p>
              <span className="testimonial-card__author">— María G.</span>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-card__stars">★★★★★</div>
              <p className="testimonial-card__text">
                "El Mix Premium es increíble. Nota la diferencia con otros productos del mercado."
              </p>
              <span className="testimonial-card__author">— Carlos R.</span>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-card__stars">★★★★★</div>
              <p className="testimonial-card__text">
                "Compro regularmente para mi familia. Siempre llega en perfecto estado."
              </p>
              <span className="testimonial-card__author">— Laura M.</span>
            </div>
          </MobileSlider>
        </div>
      </section>
    </div>
  );
};

export default Home;
