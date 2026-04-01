import React, { useState, useEffect } from 'react';
import ApiService from '../../../services/api';

/**
 * MissionValuesTab — Gestión de Misión y Valores
 * Permite editar: Excelencia, Pasión, Innovación, Respeto
 */
const MissionValuesTab = () => {
  const [mission, setMission] = useState({ title: '', description: '' });
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingMission, setEditingMission] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getMissionValues();
      if (res.success) {
        setMission(res.data.mission || { title: '', description: '' });
        setValues(res.data.values || []);
      }
    } catch (error) {
      console.error("Error fetching mission/values:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (value) => {
    setEditingId(value.id);
    setEditForm({ ...value });
  };

  const handleSaveValue = async (valueId) => {
    try {
      const res = await ApiService.updateMissionValues({
        values: [editForm] // El backend espera un array de valores
      });
      if (res.success) {
        setValues(values.map(v => v.id === valueId ? editForm : v));
        setEditingId(null);
        if (window.showToast) window.showToast('Valor actualizado correctamente', 'success');
      }
    } catch (error) {
      if (window.showToast) window.showToast('Error al guardar', 'error');
    }
  };

  const handleSaveMission = async () => {
    try {
      const res = await ApiService.updateMissionValues({
        mission: editForm
      });
      if (res.success) {
        setMission(editForm);
        setEditingMission(false);
        if (window.showToast) window.showToast('Misión actualizada correctamente', 'success');
      }
    } catch (error) {
      if (window.showToast) window.showToast('Error al guardar misión', 'error');
    }
  };

  if (loading) return <div className="loading-text">Cargando misión y valores...</div>;

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* Sección Misión y Visión */}
      <div style={{
        background: 'rgba(147, 182, 238, 0.05)',
        border: '1px solid rgba(147, 182, 238, 0.15)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        {editingMission ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Editar Misión y Visión</h3>
            <div>
              <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>Título Principal</label>
              <input 
                type="text" 
                value={editForm.title || ''} 
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(147,182,238,0.2)', borderRadius: '6px', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>Descripción</label>
              <textarea 
                value={editForm.description || ''} 
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                rows="4"
                style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(147,182,238,0.2)', borderRadius: '6px', color: '#fff', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={handleSaveMission}
                style={{ flex: 1, padding: '0.7rem', background: 'var(--color-acento-naranja)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >💾 Guardar Misión</button>
              <button 
                onClick={() => setEditingMission(false)}
                style={{ flex: 1, padding: '0.7rem', background: 'rgba(147,182,238,0.1)', color: '#93b6ee', border: '1px solid rgba(147,182,238,0.2)', borderRadius: '6px', cursor: 'pointer' }}
              >Cancelar</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>{mission.title || 'Misión y Visión'}</h3>
              <p style={{ opacity: 0.7, lineHeight: 1.6, fontSize: '0.95rem' }}>{mission.description}</p>
            </div>
            <button 
              onClick={() => { setEditForm(mission); setEditingMission(true); }}
              className="btn-edit" 
              style={{ alignSelf: 'flex-start' }}
            >✏️ Editar Texto</button>
          </div>
        )}
      </div>

      <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 400 }}>Nuestros Valores</h3>
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
                    Imagen (Opcional)
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={editForm.imageUrl || ''}
                      onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                      placeholder="URL de la imagen..."
                      style={{
                        flex: 1,
                        padding: '0.7rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(147, 182, 238, 0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        minWidth: 0
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
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const res = await ApiService.uploadAboutCardImage(file);
                              if (res.success) {
                                setEditForm({ ...editForm, imageUrl: res.data.file_path });
                              }
                            } catch (err) {
                              console.error("Upload error", err);
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
                      height: '80px',
                      background: `url('${editForm.imageUrl}') center / cover`,
                      borderRadius: '6px',
                      border: '1px solid rgba(147, 182, 238, 0.2)',
                      marginTop: '0.5rem'
                    }}></div>
                  )}
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
                    onClick={() => handleSaveValue(value.id)}
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
                    onClick={() => setEditingId(null)}
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
