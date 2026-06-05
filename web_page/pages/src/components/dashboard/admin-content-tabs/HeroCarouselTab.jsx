import React, { useState, useEffect } from 'react';
import ApiService from '../../../services/api';

/**
 * HeroCarouselTab — Gestión del Hero Carrusel
 * Permite editar slides de la portada principal + streaming en vivo
 * - Hasta 4 slides regulares (imagen/video)
 * - Slide 5: Streaming en vivo (bloquea carrusel cuando está activo)
 * - Videos: sin volumen por defecto, bloquean carrusel durante reproducción
 */
const HeroCarouselTab = () => {
  // CONFIGURACIÓN GLOBAL DEL CARRUSEL
  const [globalConfig, setGlobalConfig] = useState({
    buttonText: '',
    tagline: ''
  });

  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editingGlobalConfig, setEditingGlobalConfig] = useState(false);
  const [globalConfigForm, setGlobalConfigForm] = useState({ 
    buttonText: globalConfig.buttonText,
    tagline: globalConfig.tagline
  });

  // ── Cargar configuración del hero desde API ──────────────────────────────
  useEffect(() => {
    const loadHeroConfig = async () => {
      try {
        const response = await fetch(`${ApiService.BASE_URL}site_config.php`);
        const data = await response.json();

        if (data.success) {
          // Mapear hero_cta_text a buttonText y hero_tagline a tagline
          const btnText = data.hero_cta_text || 'Descubre nuestros programas';
          const tagLine = data.hero_tagline || 'Donde la pasión se convierte en arte';
          setGlobalConfig({ buttonText: btnText, tagline: tagLine });
          setGlobalConfigForm({ buttonText: btnText, tagline: tagLine });

          // Procesar hero_slides desde API
          if (Array.isArray(data.hero_slides)) {
            const processedSlides = data.hero_slides
              .map((slide, idx) => ({
                id: slide.id || idx + 1,
                message: slide.label || '',
                mediaType: slide.is_live ? 'livestream' : 'image',
                media: slide.url || '',
                mediaInfo: slide.mediaInfo || {},
                order: slide.order !== undefined ? slide.order : idx + 1,
                isLiveActive: slide.is_live === true,
                liveUrl: slide.is_live ? (slide.url || '') : '',
                liveTitle: slide.is_live ? (slide.label || 'Transmisión en Vivo') : '',
                active: slide.active !== false
              }));

            // Si no hay livestream, agregarlo
            if (!processedSlides.some(s => s.mediaType === 'livestream')) {
              processedSlides.push({
                id: Math.max(...processedSlides.map(s => s.id), 0) + 1,
                mediaType: 'livestream',
                liveUrl: '',
                liveTitle: 'Transmisión en Vivo',
                mediaInfo: { type: 'LIVESTREAM', platform: 'YouTube/Vimeo/Custom' },
                order: 5,
                isLiveActive: false
              });
            }

            setSlides(processedSlides);
          } else {
            // Si no hay slides, crear uno default con livestream
            setSlides([
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
          }
        }
      } catch (error) {
        console.error('Error cargando configuración del hero:', error);
        // Fallback a livestream por defecto
        setSlides([
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
      } finally {
        setLoading(false);
        setHasLoaded(true);
      }
    };

    if (!hasLoaded) {
      loadHeroConfig();
    }
  }, [hasLoaded]);

  const handleEdit = (slide) => {
    setEditingId(slide.id);
    setEditForm({ ...slide });
  };

  const handleSave = async (slideId) => {
    try {
      // Actualizar estado local primero
      setSlides(slides.map(s => s.id === slideId ? editForm : s));
      setEditingId(null);

      // Preparar payload para API
      const payloadSlides = slides
        .map(s => s.id === slideId ? editForm : s)
        .filter(s => s.mediaType !== 'livestream' || s.liveUrl) // Solo livestream con URL
        .map(s => ({
          id: s.id,
          url: s.mediaType === 'livestream' ? s.liveUrl : s.media,
          label: s.mediaType === 'livestream' ? s.liveTitle : s.message,
          active: s.mediaType === 'livestream' ? s.isLiveActive === true : s.active !== false,
          is_live: s.mediaType === 'livestream',
          order: s.order || 0
        }));

      // Enviar a API
      const result = await ApiService.updateSiteConfig({
        action: 'update_hero',
        hero_cta_text: globalConfig.buttonText,
        hero_tagline: globalConfig.tagline,
        hero_slides: payloadSlides
      });

      if (result.success) {
        if (window.showToast) window.showToast('Slide actualizado correctamente', 'success');
      } else {
        if (window.showToast) window.showToast('Error: ' + (result.message || 'No se pudo guardar'), 'error');
      }
    } catch (error) {
      console.error('Error al guardar slide:', error);
      if (window.showToast) window.showToast('Error al guardar: ' + error.message, 'error');
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
      mediaType: 'image',
      media: '',
      mediaInfo: {},
      order: regularSlides.length + 1
    };
    setSlides([...slides, newSlide]);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <i className="bi bi-hourglass-split" style={{ fontSize: '2rem', color: 'var(--color-acento-naranja)', marginBottom: '1rem', display: 'block', animation: 'spin 2s linear infinite' }}></i>
        <p style={{ color: '#93b6ee', opacity: 0.8 }}>Cargando configuración del hero...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* CONFIGURACIÓN GLOBAL */}
      <div style={{
        background: 'rgba(231, 140, 59, 0.08)',
        border: '2px solid rgba(231, 140, 59, 0.3)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bi bi-gear"></i> Configuración Global del Carrusel
          </h3>
          <button
            onClick={() => {
              setEditingGlobalConfig(!editingGlobalConfig);
              if (!editingGlobalConfig) setGlobalConfigForm({ 
                buttonText: globalConfig.buttonText,
                tagline: globalConfig.tagline 
              });
            }}
            style={{
              padding: '0.5rem 1rem',
              background: editingGlobalConfig ? 'rgba(231, 140, 59, 0.2)' : 'rgba(231, 140, 59, 0.15)',
              color: 'var(--color-acento-naranja)',
              border: '1px solid rgba(231, 140, 59, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
          >
            {editingGlobalConfig ? '✓ Listo' : '✏️ Editar'}
          </button>
        </div>

        {editingGlobalConfig ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>
                Texto del Botón
              </label>
              <input
                type="text"
                value={globalConfigForm.buttonText}
                onChange={(e) => setGlobalConfigForm({ ...globalConfigForm, buttonText: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(231, 140, 59, 0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  marginBottom: '1rem'
                }}
              />
              <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>
                Tagline Global (Fallback / Por defecto)
              </label>
              <input
                type="text"
                value={globalConfigForm.tagline}
                onChange={(e) => setGlobalConfigForm({ ...globalConfigForm, tagline: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(231, 140, 59, 0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={async () => {
                  try {
                    setGlobalConfig(globalConfigForm);
                    setEditingGlobalConfig(false);

                    // Guardar en API
                    const payloadSlides = slides
                      .filter(s => s.mediaType !== 'livestream' || s.liveUrl)
                      .map(s => ({
                        id: s.id,
                        url: s.mediaType === 'livestream' ? s.liveUrl : s.media,
                        label: s.mediaType === 'livestream' ? s.liveTitle : s.message,
                        active: s.mediaType === 'livestream' ? s.isLiveActive === true : s.active !== false,
                        is_live: s.mediaType === 'livestream',
                        order: s.order || 0
                      }));

                    const result = await ApiService.updateSiteConfig({
                      action: 'update_hero',
                      hero_cta_text: globalConfigForm.buttonText,
                      hero_tagline: globalConfigForm.tagline,
                      hero_slides: payloadSlides
                    });

                    if (result.success) {
                      if (window.showToast) window.showToast('Configuración global actualizada', 'success');
                    } else {
                      if (window.showToast) window.showToast('Error: ' + (result.message || 'No se pudo guardar'), 'error');
                    }
                  } catch (error) {
                    console.error('Error al guardar configuración:', error);
                    if (window.showToast) window.showToast('Error al guardar', 'error');
                  }
                }}
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
                onClick={() => setEditingGlobalConfig(false)}
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
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 600 }}>
                Texto del Botón
              </p>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>
                {globalConfig.buttonText}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 600 }}>
                Tagline Global
              </p>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>
                {globalConfig.tagline}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SLIDES INDIVIDUALES */}
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
                        Si está "ACTIVA": bloquea el carrusel. Usuario solo avanza con botón Next o si desactiva volumen
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
                  <div>
                    <div style={{
                      background: 'rgba(52, 152, 219, 0.1)',
                      padding: '0.8rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(52, 152, 219, 0.2)',
                      marginBottom: '1rem',
                      fontSize: '0.85rem'
                    }}>
                      <strong>ℹ️ Configuración Visual</strong>
                      <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8, fontSize: '0.8rem' }}>
                        El botón es global, pero el mensaje es específico de este slide.
                      </p>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>
                        Mensaje Principal (Por esta imagen)
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
                      <small style={{ opacity: 0.6, fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>
                        Este mensaje cambia con cada slide ✓
                      </small>
                    </div>
                  </div>
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
                                if (window.showToast) window.showToast('Subiendo imagen...', 'info');
                                const mediaInfo = await getMediaFileInfo(file);
                                const result = await window.ApiService?.uploadHeroMedia(file);
                                if (result && result.success) {
                                  // The result returns the path without the domain, we need to prefix it or just use it if the API handles it
                                  // admin_upload_hero_media.php returns something like "public/uploads/hero/..."
                                  const finalUrl = window.ApiService?.getMediaUrl ? window.ApiService.getMediaUrl(result.url) : result.url;
                                  setEditForm({ ...editForm, media: finalUrl, mediaInfo });
                                  if (window.showToast) window.showToast('Imagen subida con éxito', 'success');
                                } else {
                                  if (window.showToast) window.showToast(result?.message || 'Error al subir', 'error');
                                }
                              }
                            }}
                            style={{ display: 'none' }}
                          />
                        </label>
                        {editForm.media && !editForm.media.startsWith('data:') && (
                          <div style={{
                            width: '100%',
                            height: '100px',
                            background: `url('${editForm.media.startsWith('http') ? editForm.media : ApiService.BASE_URL + editForm.media}') center / cover`,
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
                                if (window.showToast) window.showToast('Subiendo video...', 'info');
                                const mediaInfo = await getMediaFileInfo(file);
                                const result = await window.ApiService?.uploadHeroMedia(file);
                                if (result && result.success) {
                                  const finalUrl = window.ApiService?.getMediaUrl ? window.ApiService.getMediaUrl(result.url) : result.url;
                                  setEditForm({ ...editForm, media: finalUrl, mediaInfo });
                                  if (window.showToast) window.showToast('Video subido con éxito', 'success');
                                } else {
                                  if (window.showToast) window.showToast(result?.message || 'Error al subir', 'error');
                                }
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
                      <strong>⚙️ Comportamiento automático del carrusel:</strong>
                      <ul style={{ margin: '0.5rem 0 0 1.5rem', paddingLeft: 0 }}>
                        <li><strong>Volumen DESACTIVADO:</strong> Video mudo durante 7 seg, luego pasa al siguiente (como imagen)</li>
                        <li><strong>Volumen ACTIVADO:</strong> Inicia a 25% volumen. Carrusel se DETIENE y espera a que termine el video o usuario haga click en siguiente</li>
                        <li><strong>Máx duración:</strong> 30 segundos (recomendado: 15-20 seg tipo "reel")</li>
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
                          ? `url('${slide.media.startsWith('http') || slide.media.startsWith('data:') ? slide.media : ApiService.BASE_URL + slide.media}') center / cover`
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
                      <div style={{
                        fontSize: '0.75rem',
                        opacity: 0.5,
                        marginBottom: '1rem',
                        paddingTop: '0.5rem',
                        paddingBottom: '0.5rem',
                        borderTop: '1px solid rgba(147, 182, 238, 0.1)',
                        borderBottom: '1px solid rgba(147, 182, 238, 0.1)'
                      }}>
                        {slide.mediaType === 'image' ? '🖼️ Imagen' : '🎥 Video (sin volumen)'}
                        <MediaInfoTooltip info={slide.mediaInfo} />
                      </div>

                      <p style={{
                        margin: '0.5rem 0 1rem 0',
                        fontSize: '0.8rem',
                        opacity: 0.6,
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        lineHeight: 1.4
                      }}>
                        <strong>Global:</strong> "{globalConfig.buttonText}"
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
                        ✏️ Editar Mensaje
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

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default HeroCarouselTab;
