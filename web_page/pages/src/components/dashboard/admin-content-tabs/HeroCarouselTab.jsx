import React, { useState } from 'react';

/**
 * HeroCarouselTab — Gestión del Hero Carrusel
 * Permite editar slides de la portada principal + streaming en vivo
 * - Hasta 4 slides regulares (imagen/video)
 * - Slide 5: Streaming en vivo (bloquea carrusel cuando está activo)
 * - Videos: sin volumen por defecto, bloquean carrusel durante reproducción
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
      mediaInfo: { size: '2.4 MB', dimensions: '1920x1080 px', format: 'JPEG' },
      order: 1
    },
    {
      id: 2,
      message: 'Programas Especializados para ti',
      buttonText: 'Explorar programas',
      buttonMessage: 'Piano, Guitarra, Voz, Percusión y más',
      mediaType: 'image',
      media: 'assets/images/programs/piano.png',
      mediaInfo: { size: '1.8 MB', dimensions: '1920x1080 px', format: 'PNG' },
      order: 2
    },
    {
      id: 3,
      message: 'Nuestro Equipo de Expertos',
      buttonText: 'Conoce el equipo',
      buttonMessage: 'Profesores apasionados y dedicados',
      mediaType: 'image',
      media: 'assets/images/about/equipo.jpg',
      mediaInfo: { size: '2.1 MB', dimensions: '1920x1080 px', format: 'JPEG' },
      order: 3
    },
    {
      id: 5,
      mediaType: 'livestream',
      liveUrl: '',
      liveTitle: 'Transmisión en Vivo',
      mediaInfo: { type: 'LIVESTREAM', platform: 'YouTube/Vimeo/Custom' },
      order: 5,
      isLiveActive: false
    }
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showMediaInfo, setShowMediaInfo] = useState(null);

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

  const getMediaFileInfo = (file) => {
    if (!file) return null;
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const format = file.type.split('/')[1].toUpperCase();

    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            resolve({
              size: `${sizeMB} MB`,
              dimensions: `${img.width}x${img.height} px`,
              format: format
            });
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const video = document.createElement('video');
          video.onloadedmetadata = () => {
            resolve({
              size: `${sizeMB} MB`,
              duration: `${Math.round(video.duration)}s`,
              format: format
            });
          };
          video.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const MediaInfoTooltip = ({ info }) => {
    if (!info) return null;
    return (
      <div style={{
        position: 'relative',
        display: 'inline-block',
        cursor: 'help'
      }}>
        <i className="bi bi-info-circle" style={{
          marginLeft: '0.5rem',
          color: 'var(--color-acento-naranja)',
          fontSize: '0.9rem'
        }}></i>
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '-80px',
          width: '180px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#fff',
          padding: '0.8rem',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 500,
          zIndex: 1000,
          marginBottom: '0.5rem',
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease',
          lineHeight: '1.6'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0'}
        >
          {Object.entries(info).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '0.3rem' }}>
              <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleAddSlide = () => {
    // Solo permitir agregar si hay menos de 4 slides regulares (no contar livestream)
    const regularSlides = slides.filter(s => s.mediaType !== 'livestream');
    if (regularSlides.length >= 4) {
      if (window.showToast) window.showToast('Máximo 4 slides permitidos (streaming no cuenta)', 'warning');
      return;
    }

    const newSlide = {
      id: Math.max(...slides.map(s => s.id), 0) + 1,
      message: 'Nuevo mensaje principal',
      buttonText: 'Texto del botón',
      buttonMessage: 'Mensaje del botón',
      mediaType: 'image',
      media: '',
      mediaInfo: {},
      order: regularSlides.length + 1
    };
    setSlides([...slides, newSlide]);
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
        <div style={{
          fontSize: '0.8rem',
          opacity: 0.6,
          padding: '0.5rem 1rem',
          background: 'rgba(147, 182, 238, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(147, 182, 238, 0.2)'
        }}>
          <strong>Máximo 4 slides</strong> + 1 streaming en vivo
        </div>
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
              background: slide.mediaType === 'livestream'
                ? 'rgba(231, 76, 60, 0.08)'
                : 'rgba(147, 182, 238, 0.05)',
              border: slide.mediaType === 'livestream'
                ? '2px solid rgba(231, 76, 60, 0.3)'
                : '1px solid rgba(147, 182, 238, 0.15)',
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
          >
            {slide.mediaType === 'livestream' && (
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: '#e74c3c',
                color: '#fff',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                animation: 'pulse 2s infinite',
                zIndex: 10
              }}>
                🔴 LIVE
              </div>
            )}

            {editingId === slide.id ? (
              // Modo edición
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {slide.mediaType === 'livestream' ? (
                  // Formulario para livestream
                  <>
                    <div style={{
                      background: 'rgba(231, 76, 60, 0.15)',
                      padding: '1rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(231, 76, 60, 0.3)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      textAlign: 'center'
                    }}>
                      <i className="bi bi-broadcast" style={{ marginRight: '0.5rem' }}></i>
                      <strong>TRANSMISIÓN EN VIVO</strong>
                      <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8, fontSize: '0.8rem' }}>
                        Cuando esté activa, bloquea el carrusel
                      </p>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>
                        Título de Transmisión
                      </label>
                      <input
                        type="text"
                        value={editForm.liveTitle || ''}
                        onChange={(e) => setEditForm({ ...editForm, liveTitle: e.target.value })}
                        placeholder="Ej: En vivo ahora"
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
                        URL de Transmisión (YouTube, Vimeo, Custom)
                      </label>
                      <input
                        type="text"
                        value={editForm.liveUrl || ''}
                        onChange={(e) => setEditForm({ ...editForm, liveUrl: e.target.value })}
                        placeholder="https://youtube.com/watch?v=... o URL embed"
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
                        ¿Está activa ahora?
                      </label>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        padding: '0.7rem',
                        background: 'rgba(147, 182, 238, 0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(147, 182, 238, 0.2)'
                      }}>
                        <input
                          type="checkbox"
                          checked={editForm.isLiveActive || false}
                          onChange={(e) => setEditForm({ ...editForm, isLiveActive: e.target.checked })}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.9rem' }}>
                          {editForm.isLiveActive ? '🔴 Transmitiendo ahora (carrusel bloqueado)' : '⚪ Inactiva (carrusel normal)'}
                        </span>
                      </label>
                    </div>
                  </>
                ) : (
                  // Formulario para slides regulares
                  <>
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
                  </>
                )}

                {editForm.mediaType !== 'livestream' && (
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
                )}

                {editForm.mediaType !== 'livestream' && (
                  <>
                    {editForm.mediaType === 'image' ? (
                      <div>
                        <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'flex', alignItems: 'center', marginBottom: '0.3rem', gap: '0.3rem' }}>
                          URL de Imagen
                          <MediaInfoTooltip info={editForm.mediaInfo} />
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
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = async (event) => {
                                  const mediaInfo = await getMediaFileInfo(file);
                                  setEditForm({ ...editForm, media: event.target?.result, mediaInfo });
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
                        <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'flex', alignItems: 'center', marginBottom: '0.3rem', gap: '0.3rem' }}>
                          URL del Video (sin volumen por defecto)
                          <MediaInfoTooltip info={editForm.mediaInfo} />
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
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = async (event) => {
                                  const mediaInfo = await getMediaFileInfo(file);
                                  setEditForm({ ...editForm, media: event.target?.result, mediaInfo });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    )}

                    <div style={{
                      background: 'rgba(52, 152, 219, 0.1)',
                      padding: '0.8rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(52, 152, 219, 0.2)',
                      fontSize: '0.8rem'
                    }}>
                      <strong>⚙️ Comportamiento del carrusel:</strong>
                      <ul style={{ margin: '0.5rem 0 0 1.5rem', paddingLeft: 0 }}>
                        <li>Video sin volumen → usuario puede activar</li>
                        <li>Carrusel bloqueado durante reproducción</li>
                        <li>Se reanuda al terminar el video</li>
                      </ul>
                    </div>
                  </>
                )}

                {editForm.mediaType !== 'livestream' && (
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
                )}

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
                {slide.mediaType === 'livestream' ? (
                  // Vista de livestream
                  <div>
                    <div style={{
                      width: '100%',
                      height: '180px',
                      background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(231, 76, 60, 0.05))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <i className="bi bi-broadcast" style={{
                          fontSize: '2.5rem',
                          color: '#e74c3c',
                          marginBottom: '0.5rem',
                          display: 'block',
                          animation: 'pulse 2s infinite'
                        }}></i>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e74c3c' }}>
                          {slide.liveTitle || 'Transmisión en Vivo'}
                        </div>
                        {slide.isLiveActive && (
                          <div style={{
                            fontSize: '0.75rem',
                            marginTop: '0.3rem',
                            color: '#27ae60',
                            fontWeight: 600
                          }}>
                            ✓ ACTIVO AHORA
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                      <p style={{
                        margin: '0 0 0.8rem 0',
                        fontSize: '0.8rem',
                        opacity: 0.6,
                        textTransform: 'uppercase',
                        fontWeight: 500
                      }}>
                        URL: <code style={{ fontSize: '0.7rem', opacity: 0.7 }}>{slide.liveUrl ? slide.liveUrl.substring(0, 40) + '...' : 'No configurada'}</code>
                      </p>
                      <div style={{
                        fontSize: '0.75rem',
                        opacity: 0.5,
                        marginBottom: '1rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid rgba(147, 182, 238, 0.1)'
                      }}>
                        {slide.isLiveActive ? '🔴 Streaming - Carrusel Bloqueado' : '⚪ Inactiva'}
                      </div>

                      <button
                        onClick={() => handleEdit(slide)}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          background: 'rgba(231, 76, 60, 0.2)',
                          color: '#e74c3c',
                          border: '1px solid rgba(231, 76, 60, 0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: '0.85rem',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(231, 76, 60, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(231, 76, 60, 0.2)';
                        }}
                      >
                        ✏️ Editar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Vista de slide regular
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
                        <MediaInfoTooltip info={slide.mediaInfo} />
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
                        {slide.mediaType === 'image' ? '🖼️ Imagen' : '🎥 Video (sin volumen por defecto)'}
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
            )}
          </div>
        ))}
      </div>

      {/* Estilos CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes fadeInModal {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default HeroCarouselTab;
