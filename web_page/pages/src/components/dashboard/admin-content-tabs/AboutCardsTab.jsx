import React, { useState, useEffect } from 'react';
import ApiService from '../../../services/api';

/**
 * AboutCardsTab — Gestión de tarjetas "Sobre Nosotros"
 * Permite editar: Historia, Equipo, Metodología, Instalaciones
 */
const AboutCardsTab = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const getPreviewUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('assets/') || url.startsWith('/assets/')) {
        return url.startsWith('/') ? url : '/' + url;
    }
    if (url.startsWith('images/')) return '/assets/' + url;
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return (ApiService.BASE_URL || '/jacquin_api/') + cleanUrl;
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getAboutCardsAdmin();
      if (res.success) {
        setCards(res.data);
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (card) => {
    setEditingId(card.id);
    // Asegurar que image_url esté en el form
    setEditForm({ ...card, imageUrl: card.image_url });
  };

  const handleSave = async (cardId) => {
    try {
      // Mapear campos para el backend (el backend espera image_url no imageUrl)
      const payload = {
        ...editForm,
        image_url: editForm.imageUrl
      };
      
      const res = await ApiService.updateAboutCard(payload);
      if (res.success) {
        setCards(cards.map(c => c.id === cardId ? { ...editForm, image_url: editForm.imageUrl } : c));
        setEditingId(null);
        if (window.showToast) window.showToast('Tarjeta actualizada correctamente', 'success');
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      if (window.showToast) window.showToast('Error al guardar: ' + error.message, 'error');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (loading) return <div className="loading-text">Cargando tarjetas...</div>;

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {cards.map(card => (
          <div
            key={card.id}
            style={{
              background: 'rgba(147, 182, 238, 0.05)',
              border: '1px solid rgba(147, 182, 238, 0.15)',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            {editingId === card.id ? (
              // Modo edición
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                    Contenido
                  </label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(147, 182, 238, 0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>
                    Imagen
                  </label>
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    marginBottom: '0.5rem', 
                    flexDirection: window.innerWidth < 400 ? 'column' : 'row',
                    alignItems: 'stretch'
                  }}>
                    <input
                      type="text"
                      value={editForm.imageUrl || ''}
                      onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                      placeholder="URL o ruta del archivo..."
                      style={{
                        flex: 1,
                        padding: '0.7rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(147, 182, 238, 0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        minWidth: 0,
                        boxSizing: 'border-box'
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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      minWidth: '100px'
                    }}>
                      <i className="bi bi-upload"></i> Subir
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              if (window.showToast) window.showToast('Subiendo imagen...', 'info');
                              const res = await ApiService.uploadAboutCardImage(file);
                              if (res.success) {
                                setEditForm({ ...editForm, imageUrl: res.url });
                                if (window.showToast) window.showToast('Imagen cargada', 'success');
                              } else {
                                if (window.showToast) window.showToast('Error: ' + res.error, 'error');
                              }
                            } catch (err) {
                              if (window.showToast) window.showToast('Error de conexión', 'error');
                            }
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  {editForm.imageUrl && (
                    <div style={{
                      width: '100%',
                      height: '110px',
                      background: `url('${getPreviewUrl(editForm.imageUrl)}') center / cover`,
                      borderRadius: '8px',
                      border: '1px solid rgba(147, 182, 238, 0.2)',
                      marginTop: '0.8rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}></div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>
                    Ícono (Bootstrap Icon Class)
                  </label>
                  <input
                    type="text"
                    value={editForm.icon || ''}
                    onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                    placeholder="bi bi-book-half"
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
                    onClick={() => handleSave(card.id)}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
                  <i className={card.icon} style={{ fontSize: '1.5rem', color: 'var(--color-acento-naranja)' }}></i>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{card.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>{card.subtitle}</p>
                  </div>
                </div>
                
                {card.image_url && (
                  <div style={{
                    width: '100%',
                    height: '90px',
                    background: `url('${getPreviewUrl(card.image_url)}') center / cover`,
                    borderRadius: '8px',
                    border: '1px solid rgba(147, 182, 238, 0.2)',
                    marginBottom: '0.8rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}></div>
                )}

                <p style={{
                  fontSize: '0.85rem',
                  opacity: 0.7,
                  lineHeight: 1.5,
                  marginBottom: '1rem',
                  maxHeight: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {card.description}
                </p>

                <button
                  onClick={() => handleEdit(card)}
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutCardsTab;
