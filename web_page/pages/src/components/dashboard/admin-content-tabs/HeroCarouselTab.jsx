import React, { useState } from 'react';

/**
 * HeroCarouselTab — Gestión del Hero Carrusel
 * Permite editar slides de la portada principal
 */
const HeroCarouselTab = () => {
  const [slides, setSlides] = useState([
    {
      id: 1,
      title: 'Educación Musical de Excelencia',
      subtitle: 'Desde 2010 formando músicos integrales',
      image: 'assets/images/hero/hero-banner.jpg',
      order: 1
    },
    {
      id: 2,
      title: 'Programas Especializados',
      subtitle: 'Piano, Guitarra, Voz, Percusión y más',
      image: 'assets/images/programs/piano.png',
      order: 2
    },
    {
      id: 3,
      title: 'Nuestro Equipo',
      subtitle: 'Profesores apasionados y expertos',
      image: 'assets/images/about/equipo.jpg',
      order: 3
    }
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (slide) => {
    setEditingId(slide.id);
    setEditForm({ ...slide });
  };

  const handleSave = async (slideId) => {
    try {
      // TODO: Conectar con API
      setSlides(slides.map(s => s.id === slideId ? editForm : s));
      setEditingId(null);
      if (window.showToast) window.showToast('Slide actualizado correctamente', 'success');
    } catch (error) {
      if (window.showToast) window.showToast('Error al guardar', 'error');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: Math.max(...slides.map(s => s.id), 0) + 1,
      title: 'Nuevo Slide',
      subtitle: 'Edita este contenido',
      image: '',
      order: slides.length + 1
    };
    setSlides([...slides, newSlide]);
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={handleAddSlide}
          style={{
            padding: '0.8rem 1.5rem',
            background: 'var(--color-acento-naranja)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <i className="bi bi-plus-circle"></i> Agregar Slide
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            style={{
              background: 'rgba(147, 182, 238, 0.05)',
              border: '1px solid rgba(147, 182, 238, 0.15)',
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
          >
            {editingId === slide.id ? (
              // Modo edición
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>
                    Título
                  </label>
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(147, 182, 238, 0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={editForm.subtitle || ''}
                    onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(147, 182, 238, 0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>
                    URL de Imagen
                  </label>
                  <input
                    type="text"
                    value={editForm.image || ''}
                    onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                    placeholder="assets/images/..."
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(147, 182, 238, 0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>
                    Orden
                  </label>
                  <input
                    type="number"
                    value={editForm.order || 1}
                    onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) })}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(147, 182, 238, 0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleSave(slide.id)}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      background: 'var(--color-acento-naranja)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  >
                    💾 Guardar
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      background: 'rgba(147, 182, 238, 0.1)',
                      color: '#93b6ee',
                      border: '1px solid rgba(147, 182, 238, 0.2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // Modo visualización
              <div>
                {slide.image && (
                  <div style={{
                    width: '100%',
                    height: '180px',
                    background: `url('${slide.image}') center / cover`,
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: 'rgba(0, 0, 0, 0.6)',
                      color: 'var(--color-acento-naranja)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      #{slide.order}
                    </div>
                  </div>
                )}

                <div style={{ padding: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600 }}>
                    {slide.title}
                  </h4>
                  <p style={{
                    margin: '0 0 1rem 0',
                    fontSize: '0.85rem',
                    opacity: 0.7,
                    lineHeight: 1.4
                  }}>
                    {slide.subtitle}
                  </p>

                  <button
                    onClick={() => handleEdit(slide)}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      background: 'rgba(147, 182, 238, 0.15)',
                      color: '#93b6ee',
                      border: '1px solid rgba(147, 182, 238, 0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(147, 182, 238, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(147, 182, 238, 0.15)';
                    }}
                  >
                    ✏️ Editar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroCarouselTab;
