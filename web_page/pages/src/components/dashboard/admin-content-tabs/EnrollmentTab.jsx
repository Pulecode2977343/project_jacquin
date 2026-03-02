import React, { useState } from 'react';

/**
 * EnrollmentTab — Control de Disponibilidad de Matrículas
 * Permite abrir/cerrar matrículas para la academia
 */
const EnrollmentTab = () => {
  const [enrollmentState, setEnrollmentState] = useState({
    status: 'open', // 'open' | 'closed'
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    message: 'Las matrículas están abiertas. ¡Inscríbete ahora!',
    closedMessage: 'Las matrículas se encuentran cerradas en este momento.'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...enrollmentState });

  const handleToggleStatus = () => {
    const newStatus = enrollmentState.status === 'open' ? 'closed' : 'open';
    setEnrollmentState({ ...enrollmentState, status: newStatus });
  };

  const handleSave = async () => {
    try {
      // TODO: Conectar con API
      setEnrollmentState({ ...editForm });
      setIsEditing(false);
      if (window.showToast) window.showToast('Configuración de matrículas actualizada', 'success');
    } catch (error) {
      if (window.showToast) window.showToast('Error al guardar', 'error');
    }
  };

  const isOpen = enrollmentState.status === 'open';

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* Estado Principal */}
      <div style={{
        background: isOpen
          ? 'rgba(39, 174, 96, 0.15)'
          : 'rgba(231, 76, 60, 0.15)',
        border: `2px solid ${isOpen ? 'rgba(39, 174, 96, 0.5)' : 'rgba(231, 76, 60, 0.5)'}`,
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <i className={isOpen ? 'bi bi-check-circle' : 'bi bi-x-circle'} style={{
            fontSize: '3rem',
            color: isOpen ? '#27ae60' : '#e74c3c',
            display: 'block',
            marginBottom: '1rem'
          }}></i>
          <h3 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 600,
            color: isOpen ? '#27ae60' : '#e74c3c'
          }}>
            {isOpen ? 'MATRÍCULAS ABIERTAS' : 'MATRÍCULAS CERRADAS'}
          </h3>
        </div>

        <p style={{
          fontSize: '0.95rem',
          opacity: 0.8,
          marginBottom: '1.5rem',
          maxWidth: '500px',
          margin: '0 auto 1.5rem'
        }}>
          {isOpen ? enrollmentState.message : enrollmentState.closedMessage}
        </p>

        <button
          onClick={handleToggleStatus}
          style={{
            padding: '0.8rem 2rem',
            background: isOpen ? 'var(--color-acento-naranja)' : '#27ae60',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {isOpen ? '🔒 Cerrar Matrículas' : '🔓 Abrir Matrículas'}
        </button>
      </div>

      {/* Detalles y Edición */}
      {!isEditing ? (
        <div style={{
          background: 'rgba(147, 182, 238, 0.05)',
          border: '1px solid rgba(147, 182, 238, 0.15)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Fecha Inicio
              </label>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>
                {new Date(enrollmentState.startDate).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Fecha Fin
              </label>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>
                {new Date(enrollmentState.endDate).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
              Mensaje (Matrículas Abiertas)
            </label>
            <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.8 }}>
              {enrollmentState.message}
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
              Mensaje (Matrículas Cerradas)
            </label>
            <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.8 }}>
              {enrollmentState.closedMessage}
            </p>
          </div>

          <button
            onClick={() => {
              setIsEditing(true);
              setEditForm({ ...enrollmentState });
            }}
            style={{
              padding: '0.7rem 1.5rem',
              background: 'rgba(147, 182, 238, 0.15)',
              color: '#93b6ee',
              border: '1px solid rgba(147, 182, 238, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(147, 182, 238, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(147, 182, 238, 0.15)';
            }}
          >
            ✏️ Editar Detalles
          </button>
        </div>
      ) : (
        // Formulario de edición
        <div style={{
          background: 'rgba(147, 182, 238, 0.05)',
          border: '1px solid rgba(147, 182, 238, 0.15)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div>
            <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>
              Fecha Inicio
            </label>
            <input
              type="date"
              value={editForm.startDate}
              onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
              style={{
                width: '100%',
                padding: '0.7rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(147, 182, 238, 0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>
              Fecha Fin
            </label>
            <input
              type="date"
              value={editForm.endDate}
              onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
              style={{
                width: '100%',
                padding: '0.7rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(147, 182, 238, 0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.3rem' }}>
              Mensaje (Abiertas)
            </label>
            <textarea
              value={editForm.message}
              onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
              rows="2"
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
              Mensaje (Cerradas)
            </label>
            <textarea
              value={editForm.closedMessage}
              onChange={(e) => setEditForm({ ...editForm, closedMessage: e.target.value })}
              rows="2"
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
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '0.7rem',
                background: 'var(--color-acento-naranja)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              💾 Guardar
            </button>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                flex: 1,
                padding: '0.7rem',
                background: 'rgba(147, 182, 238, 0.1)',
                color: '#93b6ee',
                border: '1px solid rgba(147, 182, 238, 0.2)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentTab;
