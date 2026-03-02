import React, { useState } from 'react';

/**
 * HeroCarouselTab — Gestión del Hero Carrusel
 * Permite editar slides de la portada principal
 */
const HeroCarouselTab = () => {
  const [slides, setSlides] = useState([
    {
      id: 1,
      message: 'Donde la pasión se convierte en arte',
      buttonText: 'Descubre nuestros programas',
      buttonMessage: 'Conoce nuestros programas',
      mediaType: 'image',
      media: 'assets/images/hero/hero-banner.jpg',
      order: 1
    },
    {
      id: 2,
      message: 'Programas Especializados para ti',
      buttonText: 'Explorar programas',
      buttonMessage: 'Piano, Guitarra, Voz, Percusión y más',
      mediaType: 'image',
      media: 'assets/images/programs/piano.png',
      order: 2
    },
    {
      id: 3,
      message: 'Nuestro Equipo de Expertos',
      buttonText: 'Conoce el equipo',
      buttonMessage: 'Profesores apasionados y dedicados',
      mediaType: 'image',
      media: 'assets/images/about/equipo.jpg',
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
      message: 'Nuevo mensaje principal',
      buttonText: 'Texto del botón',
      buttonMessage: 'Mensaje del botón',
      mediaType: 'image',
      media: '',
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
                    Mensaje Principal
                  </label>
                  <input
                    type="text"
                    value={editForm.message || ''}
                    onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                    placeholder="Ej: Donde la pasión se convierte en arte"
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
                    Texto del Botón (CTA)
                  </label>
                  <input
                    type="text"
                    value={editForm.buttonText || ''}
                    onChange={(e) => setEditForm({ ...editForm, buttonText: e.target.value })}
                    placeholder="Ej: Descubre nuestros programas"
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
                    Mensaje del Botón (Subtítulo)
                  </label>
                  <input
                    type="text"
                    value={editForm.buttonMessage || ''}
                    onChange={(e) => setEditForm({ ...editForm, buttonMessage: e.target.value })}
                    placeholder="Ej: Conoce nuestros programas"
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
                    Tipo de Media
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <button
                      onClick={() => setEditForm({ ...editForm, mediaType: 'image' })}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: editForm.mediaType === 'image' ? 'var(--color-acento-naranja)' : 'rgba(147, 182, 238, 0.1)',
                        color: editForm.mediaType === 'image' ? '#fff' : '#93b6ee',
                        border: '1px solid rgba(147, 182, 238, 0.2)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}
                    >
                      <i className="bi bi-image" style={{ marginRight: '0.3rem' }}></i> Imagen
                    </button>
                    <button
                      onClick={() => setEditForm({ ...editForm, mediaType: 'video' })}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: editForm.mediaType === 'video' ? 'var(--color-acento-naranja)' : 'rgba(147, 182, 238, 0.1)',
                        color: editForm.mediaType === 'video' ? '#fff' : '#93b6ee',
                        border: '1px solid rgba(147, 182, 238, 0.2)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}
                    >
                      <i className="bi bi-play-circle" style={{ marginRight: '0.3rem' }}></i> Video
                    </button>
                  </div>
                </div>

                {editForm.mediaType === 'image' ? (
                  <div>
                    <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>
                      URL de Imagen
                    </label>
                    <input
                      type="text"
                      value={editForm.media || ''}
                      onChange={(e) => setEditForm({ ...editForm, media: e.target.value })}
                      placeholder="assets/images/..."
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(147, 182, 238, 0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem'
                      }}
                    />
                    <label style={{
                      padding: '0.7rem 1rem',
                      background: 'rgba(147, 182, 238, 0.15)',
                      border: '1px solid rgba(147, 182, 238, 0.2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#93b6ee',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <i className="bi bi-upload"></i> Subir Imagen
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setEditForm({ ...editForm, media: event.target?.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {editForm.media && !editForm.media.startsWith('data:') && (
                      <div style={{
                        width: '100%',
                        height: '100px',
                        background: `url('${editForm.media}') center / cover`,
                        borderRadius: '6px',
                        border: '1px solid rgba(147, 182, 238, 0.2)',
                        marginTop: '0.5rem'
                      }}></div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>
                      URL del Video
                    </label>
                    <input
                      type="text"
                      value={editForm.media || ''}
                      onChange={(e) => setEditForm({ ...editForm, media: e.target.value })}
                      placeholder="https://youtube.com/... o URL de video"
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(147, 182, 238, 0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem'
                      }}
                    />
                    <label style={{
                      padding: '0.7rem 1rem',
                      background: 'rgba(147, 182, 238, 0.15)',
                      border: '1px solid rgba(147, 182, 238, 0.2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#93b6ee',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <i className="bi bi-upload"></i> Subir Video
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setEditForm({ ...editForm, media: event.target?.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>
                    Orden
                  </label>
                  <input
                    type="number"
                    value={editForm.order || 1}
                    onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) })}
                    min="1"
                    max="4"
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
                {slide.media && (
                  <div style={{
                    width: '100%',
                    height: '180px',
                    background: slide.mediaType === 'image'
                      ? `url('${slide.media}') center / cover`
                      : 'rgba(0, 0, 0, 0.5)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {slide.mediaType === 'video' && (
                      <i className="bi bi-play-circle" style={{
                        fontSize: '3rem',
                        color: 'var(--color-acento-naranja)',
                        opacity: 0.8
                      }}></i>
                    )}
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
                    {slide.message}
                  </h4>
                  <p style={{
                    margin: '0 0 0.8rem 0',
                    fontSize: '0.8rem',
                    opacity: 0.6,
                    textTransform: 'uppercase',
                    fontWeight: 500
                  }}>
                    Botón: <strong>{slide.buttonText}</strong>
                  </p>
                  <p style={{
                    margin: '0 0 1rem 0',
                    fontSize: '0.85rem',
                    opacity: 0.7,
                    lineHeight: 1.4
                  }}>
                    {slide.buttonMessage}
                  </p>
                  <div style={{
                    fontSize: '0.75rem',
                    opacity: 0.5,
                    marginBottom: '1rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid rgba(147, 182, 238, 0.1)'
                  }}>
                    {slide.mediaType === 'image' ? '🖼️ Imagen' : '🎥 Video'}
                  </div>

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
