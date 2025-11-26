// ========================================
// pages/Public/LandingPage.jsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Scissors, Sparkles, Clock, Award,
  Star, Users, Heart, Menu, X,
  Instagram, Facebook, Phone, Mail, MapPin, LogOut, User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useServicios } from '../../hooks/useServicios';
import { Button } from '../../components/ui';
import styles from './LandingPage.module.css';


// ========================================
// NAVBAR PÚBLICO
// ========================================
const PublicNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, user, isEmpleado, isAdmin } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
      logout();
      navigate('/');
      setMobileMenuOpen(false);
  };

  // Enlaces comunes (Anclas dentro de la landing)
  const commonLinks = [
    { label: 'Inicio', href: '#inicio', type: 'anchor' },
    { label: 'Nosotros', href: '#nosotros', type: 'anchor' },
    { label: 'Servicios', href: '#servicios', type: 'anchor' },
  ];

  // --- CONFIGURACIÓN DE ENLACES DE CLIENTE ---
  const userLinks = [
      { label: 'Agendar Turno', to: '/reservar', type: 'router' },
      { label: 'Mis Turnos', to: "/mis-turnos", type: 'router' }, // Apunta a src/pages/Cliente/MisTurnos.jsx
      { label: 'Mi Perfil', to: '/perfilC', type: 'router' },      // Apunta a src/pages/Cliente/PerfilC.jsx
  ];

  const renderLink = (link) => {
      if (link.type === 'router') {
          return <Link key={link.label} to={link.to} className={styles.navLink}>{link.label}</Link>;
      }
      return <a key={link.label} href={link.href} className={styles.navLink}>{link.label}</a>;
  };

  const renderMobileLink = (link) => {
      if (link.type === 'router') {
          return <Link key={link.label} to={link.to} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>{link.label}</Link>;
      }
      return <a key={link.label} href={link.href} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>{link.label}</a>;
  };

  return (
    <motion.nav
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.navContainer}>
        <Link to="/" className={styles.logo}>
          <Sparkles size={28} />
          <span className={styles.logoText}>Mi Tiempo</span>
        </Link>

        {/* DESKTOP MENU */}
        <div className={styles.navLinks}>
          {commonLinks.map(renderLink)}
          {isAuthenticated && userLinks.map(renderLink)}
        </div>

        <div className={styles.navActions}>
          {isAuthenticated ? (
            <div style={{display:'flex', gap: 10, alignItems:'center'}}>
               {/* Si es staff, mostrar botón para ir al panel */}
               {(isAdmin || isEmpleado) && (
                   <Button size="sm" variant="outline" onClick={() => navigate('/dashboard')}>
                       Panel Staff
                   </Button>
               )}
               
               {/* Botón Cerrar Sesión */}
               <Button variant="ghost" onClick={handleLogout} icon={LogOut}>
                   Salir
               </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Ingresar
              </Button>
              <Button onClick={() => navigate('/register')}>
                 Registrarse
              </Button>
            </>
          )}
          
          {/* Mobile Toggle */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {commonLinks.map(renderMobileLink)}
            {isAuthenticated && userLinks.map(renderMobileLink)}

            <div className={styles.mobileBtns}>
              {isAuthenticated ? (
                  <>
                    {(isAdmin || isEmpleado) && (
                        <Button fullWidth onClick={() => navigate('/dashboard')}>
                            Ir al Panel
                        </Button>
                    )}
                    <Button fullWidth variant="danger" onClick={handleLogout} icon={LogOut}>
                        Cerrar Sesión
                    </Button>
                  </>
              ) : (
                  <>
                    <Button variant="ghost" fullWidth onClick={() => navigate('/login')}>
                        Ingresar
                    </Button>
                    <Button fullWidth onClick={() => navigate('/register')}>
                        Registrarse
                    </Button>
                  </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// ========================================
// HERO SECTION
// ========================================
const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section id="inicio" className={styles.hero}>
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <motion.div
          className={styles.heroText}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className={styles.heroTitle}>
            Tu momento de <span className={styles.heroAccent}>belleza</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Descubre un oasis de elegancia donde cada detalle está pensado para ti.
            Tratamientos personalizados con los más altos estándares de calidad.
          </p>
          <div className={styles.heroCta}>
            <Button size="lg" icon={Calendar} onClick={() => navigate('/reservar')}>
              Reservar Turno
            </Button>
            <Button size="lg" variant="outline">
              <a href="#servicios" style={{ color: 'inherit', textDecoration: 'none' }}>
                Ver Servicios
              </a>
            </Button>
          </div>
        </motion.div>

        <motion.div
          className={styles.heroStats}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className={styles.statItem}>
            <Award size={32} />
            <span className={styles.statNumber}>10+</span>
            <span className={styles.statLabel}>Años de Experiencia</span>
          </div>
          <div className={styles.statItem}>
            <Users size={32} />
            <span className={styles.statNumber}>5000+</span>
            <span className={styles.statLabel}>Clientes Satisfechos</span>
          </div>
          <div className={styles.statItem}>
            <Star size={32} />
            <span className={styles.statNumber}>10+</span>
            <span className={styles.statLabel}>Servicios personalizados para un mejor cuidado</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ========================================
// ABOUT SECTION
// ========================================
const AboutSection = () => {
  const features = [
    {
      icon: Scissors,
      title: 'Profesionales Expertos',
      description: 'Equipo altamente capacitado con años de experiencia',
    },
    {
      icon: Sparkles,
      title: 'Productos Premium',
      description: 'Utilizamos solo las mejores marcas del mercado',
    },
    {
      icon: Heart,
      title: 'Atención Personalizada',
      description: 'Cada tratamiento adaptado a tus necesidades',
    },
    {
      icon: Clock,
      title: 'Puntualidad Garantizada',
      description: 'Respetamos tu tiempo con turnos precisos',
    },
  ];

  return (
    <section id="nosotros" className={styles.about}>
      <div className={styles.container}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.sectionTitle}>Sobre Nosotros</h2>
          <p className={styles.sectionSubtitle}>
            Un espacio dedicado a tu bienestar y belleza
          </p>
        </motion.div>

        <div className={styles.aboutContent}>
          <motion.div
            className={styles.aboutImage}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.imagePlaceholder}>
              <Sparkles size={64} />
            </div>
          </motion.div>

          <motion.div
            className={styles.aboutText}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3>Tu refugio de belleza y bienestar</h3>
            <p>
              En Mi Tiempo creemos que cada persona merece un espacio donde sentirse
              especial. Nuestro centro de estética combina elegancia, profesionalismo
              y calidez para brindarte una experiencia única.
            </p>
            <p>
              Con más de 10 años de trayectoria, nos especializamos en tratamientos
              de belleza personalizados que realzan tu esencia natural. Nuestro equipo
              de profesionales está comprometido con tu satisfacción y bienestar.
            </p>
          </motion.div>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className={styles.featureCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.featureIcon}>
                <feature.icon size={28} />
              </div>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========================================
// SERVICES SECTION
// ========================================
const ServicesSection = () => {
  const { servicios, fetchServicios } = useServicios();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const navigate = useNavigate();

  useEffect(() => {
    fetchServicios({ activo: true });
  }, [fetchServicios]);

  const categories = ['Todos', ...new Set(servicios.map((s) => s.tipo_serv))];

  const filteredServicios =
    selectedCategory === 'Todos'
      ? servicios
      : servicios.filter((s) => s.tipo_serv === selectedCategory);

  return (
    <section id="servicios" className={styles.services}>
      <div className={styles.container}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.sectionTitle}>Nuestros Servicios</h2>
          <p className={styles.sectionSubtitle}>
            Tratamientos diseñados para realzar tu belleza natural
          </p>
        </motion.div>

        <div className={styles.categoryFilter}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryBtn} ${
                selectedCategory === cat ? styles.active : ''
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.servicesGrid}>
          {filteredServicios.map((servicio, index) => (
            <motion.div
              key={servicio.id_serv}
              className={styles.serviceCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className={styles.serviceIcon}>
                <Scissors size={32} />
              </div>
              <h3>{servicio.nombre}</h3>
              <p className={styles.serviceDescription}>
                {servicio.descripcion || 'Tratamiento profesional personalizado'}
              </p>
              <div className={styles.serviceDetails}>
                <span className={styles.serviceDuration}>
                  <Clock size={16} /> {servicio.duracion} min
                </span>
                <span className={styles.servicePrice}>
                  ${servicio.precio}
                </span>
              </div>
              
              <Button
                variant="outline"
                fullWidth
                icon={Calendar}
                onClick={() => navigate('/reservar')}
              >
                Reservar
              </Button>
            </motion.div>
          ))}
        </div>

        {filteredServicios.length === 0 && (
          <div className={styles.emptyState}>
            <Scissors size={48} />
            <p>No hay servicios disponibles en esta categoría</p>
          </div>
        )}
      </div>
    </section>
  );
};

// ========================================
// CTA SECTION
// ========================================

// ========================================
// FOOTER
// ========================================
const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3 className={styles.footerLogo}>
            <Sparkles size={24} />
            Mi Tiempo
          </h3>
          <p>Tu espacio de belleza y bienestar</p>
          <div className={styles.socialLinks}>
            <a href="#" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="#" aria-label="Facebook">
              <Facebook size={20} />
            </a>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h4>Contacto</h4>
          <ul>
            <li>
              <Phone size={16} />
              <a href="tel:+54123456789">+54 9 387 529-8723</a>
            </li>
            <li>
              <Mail size={16} />
              <a href="mailto:mitiempo@gmail.com">mitiempo@gmail.com</a>
            </li>
            <li>
              <MapPin size={16} />
              <span> O'Higgins 1234 - Salta</span>
            </li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>Horarios</h4>
          <ul>
            <li>Lunes a Viernes: 8:00 - 21:00</li>
            <li>Sábados: 9:00 - 18:00</li>
            <li>Domingos: Cerrado</li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>Enlaces</h4>
          <ul>
            <li><a href="#nosotros">Sobre Nosotros</a></li>
            <li><a href="#servicios">Servicios</a></li>
            <li><Link to="/login">Ingresar</Link></li>
            <li><Link to="/register">Registrarse</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy;</p>
      </div>
    </footer>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================
export const LandingPage = () => {
  return (
    <div className={styles.landingPage}>
      <PublicNavbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      
      <Footer />
    </div>
  );
};

export default LandingPage;