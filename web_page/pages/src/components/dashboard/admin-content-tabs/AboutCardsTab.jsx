import React, { useState, useEffect } from 'react';
import ApiService from '../../../services/api';

/**
 * AboutCardsTab — Gestión de tarjetas "Sobre Nosotros"
 * Permite editar: Historia, Equipo, Metodología, Instalaciones
 */
const AboutCardsTab = () => {
  const [cards, setCards] = useState([
    {
      id: 'historia',
      title: 'Nuestra Historia',
      description: 'Desde 2010',
      content: 'Fundada con la visión de democratizar la educación musical de calidad...',
      icon: 'bi bi-book-half'
    },
    {
      id: 'equipo',
      title: 'Nuestro Equipo',
      description: 'Profesionales apasionados',
      content: 'Contamos con un equipo de profesores profesionales, músicos activos y pedagogos...',
      icon: 'bi bi-people'
    },
    {
      id: 'metodologia',
      title: 'Metodología',
      description: 'Enfoque personalizado',
      content: 'Nuestra metodología combina técnica clásica con enfoques modernos...',
      icon: 'bi bi-music-note'
    },
    {
      id: 'instalaciones',
      title: 'Instalaciones',
      description: 'Espacios creativos',
      content: 'Espacios creativos diseñados para inspirar. Salones equipados con instrumentos...',
      icon: 'bi bi-building'
    }
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (card) => {
    setEditingId(card.id);
    setEditForm({ ...card });
  };

  const handleSave = async (cardId) => {
    try {
      // TODO: Conectar con API para guardar
      // await ApiService.updateAboutCard(cardId, editForm);
      setCards(cards.map(c => c.id === cardId ? editForm : c));
      setEditingId(null);
      // Mostrar toast de éxito
      if (window.showToast) window.showToast('Tarjeta actualizada correctamente', 'success');
    } catch (error) {
      if (window.showToast) window.showToast('Error al guardar', 'error');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

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
                    rows="4"
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
