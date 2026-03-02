import React, { useState } from 'react';

/**
 * MissionValuesTab — Gestión de Misión y Valores
 * Permite editar: Excelencia, Pasión, Innovación, Respeto
 */
const MissionValuesTab = () => {
  const [values, setValues] = useState([
    {
      id: 'excelencia',
      title: 'Excelencia',
      description: 'Compromiso con la calidad en cada clase.',
      icon: 'bi bi-star'
    },
    {
      id: 'pasion',
      title: 'Pasión',
      description: 'Amor genuino por la música y la enseñanza.',
      icon: 'bi bi-heart'
    },
    {
      id: 'innovacion',
      title: 'Innovación',
      description: 'Métodos educativos modernos y creativos.',
      icon: 'bi bi-lightbulb'
    },
    {
      id: 'respeto',
      title: 'Respeto',
      description: 'Ambiente inclusivo y de apoyo mutuo.',
      icon: 'bi bi-hand-thumbs-up'
    }
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (value) => {
    setEditingId(value.id);
    setEditForm({ ...value });
  };

  const handleSave = async (valueId) => {
    try {
      // TODO: Conectar con API
      setValues(values.map(v => v.id === valueId ? editForm : v));
      setEditingId(null);
      if (window.showToast) window.showToast('Valor actualizado correctamente', 'success');
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.5rem'
      }}>
        {values.map(value => (
          <div
            key={value.id}
            style={{
              background: 'rgba(147, 182, 238, 0.05)',
              border: '1px solid rgba(147, 182, 238, 0.15)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}
          >
            {editingId === value.id ? (
              // Modo edición
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem', textAlign: 'left' }}>
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
                  <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem', textAlign: 'left' }}>
                    Descripción
                  </label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows="2"
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
                  <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem', textAlign: 'left' }}>
                    Ícono (Bootstrap Icon Class)
                  </label>
                  <input
                    type="text"
                    value={editForm.icon || ''}
                    onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                    placeholder="bi bi-star"
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
                  <small style={{ opacity: 0.5, marginTop: '0.3rem', display: 'block' }}>
                    Ej: bi bi-star, bi bi-heart, bi bi-lightbulb, bi bi-hand-thumbs-up
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleSave(value.id)}
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
                <i className={value.icon} style={{
                  fontSize: '2.5rem',
                  color: 'var(--color-acento-naranja)',
                  marginBottom: '0.8rem',
                  display: 'block'
                }}></i>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 600 }}>
                  {value.title}
                </h4>
                <p style={{
                  margin: '0 0 1rem 0',
                  fontSize: '0.85rem',
                  opacity: 0.7,
                  lineHeight: 1.5,
                  minHeight: '40px'
                }}>
                  {value.description}
                </p>

                <button
                  onClick={() => handleEdit(value)}
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

export default MissionValuesTab;
