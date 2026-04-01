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
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
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
                    value={editForm.content || ''}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
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
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
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
                        minWidth: '200px'
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
                      gap: '0.3rem'
                    }}>
                      <i className="bi bi-upload"></i> Subir
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setEditForm({ ...editForm, imageUrl: event.target?.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  {editForm.imageUrl && (
                    <div style={{
                      width: '100%',
                      height: '100px',
                      background: `url('${editForm.imageUrl}') center / cover`,
                      borderRadius: '6px',
                      border: '1px solid rgba(147, 182, 238, 0.2)',
                      marginTop: '0.5rem'
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                  <i className={card.icon} style={{ fontSize: '1.5rem', color: 'var(--color-acento-naranja)' }}></i>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{card.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>{card.description}</p>
                  </div>
                </div>

                <p style={{
                  fontSize: '0.85rem',
                  opacity: 0.7,
                  lineHeight: 1.5,
                  marginBottom: '1rem',
                  maxHeight: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {card.content}
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
