import React, { useState } from 'react';
import AboutCardsTab from './admin-content-tabs/AboutCardsTab';
import MissionValuesTab from './admin-content-tabs/MissionValuesTab';
import EnrollmentTab from './admin-content-tabs/EnrollmentTab';
import HeroCarouselTab from './admin-content-tabs/HeroCarouselTab';
import GalleryTab from './admin-content-tabs/GalleryTab';
import useOutsideClick from '../../hooks/useOutsideClick';
import './PanelCommon.css';

/**
 * AdminContentWeb — Modal elegante con 4 tabs para gestión de contenido web
 */
const AdminContentWeb = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const modalRef = useOutsideClick(onClose);

  const tabs = [
    {
      id: 'sobre-nosotros',
      label: 'Tarjetas "Sobre Nosotros"',
      icon: 'bi bi-layout-text-window-reverse',
      component: <AboutCardsTab />
    },
    {
      id: 'mision-valores',
      label: 'Misión y Valores',
      icon: 'bi bi-star',
      component: <MissionValuesTab />
    },
    {
      id: 'matriculas',
      label: 'Disponibilidad Matrículas',
      icon: 'bi bi-check-circle',
      component: <EnrollmentTab />
    },
    {
      id: 'hero-carrusel',
      label: 'Hero Carrusel',
      icon: 'bi bi-image',
      component: <HeroCarouselTab />
    },
    {
      id: 'galeria-multimedia',
      label: 'Galería Multimedia',
      icon: 'bi bi-collection-play',
      component: <GalleryTab />
    }
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0, 5, 10, 0.85)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 50000,
      backdropFilter: 'blur(10px)',
      animation: 'fadeInModal 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Modal Container */}
      <div
        ref={modalRef}
        style={{
          width: '95%', maxWidth: '1000px', maxHeight: '85vh',
          background: 'linear-gradient(135deg, rgba(30, 50, 90, 0.95), rgba(20, 40, 80, 0.95))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(147, 182, 238, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid rgba(147, 182, 238, 0.1)',
          background: 'rgba(10, 20, 40, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <i className="bi bi-layout-text-window-reverse" style={{ fontSize: '1.8rem', color: 'rgba(147, 182, 238, 0.9)' }}></i>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 300, letterSpacing: '0.5px' }}>
              Gestión de Contenido Web
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'rgba(147, 182, 238, 0.8)',
              fontSize: '1.8rem', cursor: 'pointer', padding: '0.25rem 0.5rem',
              transition: 'color 0.3s ease', opacity: 0.8
            }}
            onMouseEnter={(e) => e.target.style.opacity = '1'}
            onMouseLeave={(e) => e.target.style.opacity = '0.8'}
          >✕</button>
        </div>

        {/* Tabs Navigation */}
        <div style={{
          display: 'flex', padding: '0.5rem 1rem', background: 'rgba(10, 20, 40, 0.3)',
          borderBottom: '1px solid rgba(147, 182, 238, 0.1)', gap: '0.5rem', overflowX: 'auto'
        }}>
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(idx)}
              style={{
                background: activeTab === idx ? 'rgba(147, 182, 238, 0.2)' : 'transparent',
                border: activeTab === idx ? '1px solid rgba(147, 182, 238, 0.4)' : '1px solid rgba(147, 182, 238, 0.1)',
                color: activeTab === idx ? '#93b6ee' : 'rgba(147, 182, 238, 0.6)',
                padding: '0.7rem 1.2rem', borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.3s ease',
                display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap'
              }}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', color: 'rgba(255, 255, 255, 0.85)' }}>
          {tabs[activeTab].component}
        </div>
      </div>

      <style>{`
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default AdminContentWeb;
