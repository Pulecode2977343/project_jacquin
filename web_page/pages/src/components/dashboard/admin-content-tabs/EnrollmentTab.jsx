import React, { useState, useEffect } from 'react';
import ApiService from '../../../services/api';

/**
 * EnrollmentTab — Control de Disponibilidad de Matrículas
 * Sincronizado con API y EnrollmentStatusBadge en Footer
 */
const EnrollmentTab = () => {
  const [enrollmentState, setEnrollmentState] = useState({
    status: 'open',
    message: 'Las matrículas están abiertas. ¡Inscríbete ahora!',
    closedMessage: 'Las matrículas se encuentran cerradas en este momento.',
    year: new Date().getFullYear()
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...enrollmentState });
  const [loading, setLoading] = useState(true);

  // Cargar datos de la API al montar
  useEffect(() => {
    const fetchEnrollmentData = async () => {
      try {
        const response = await ApiService.getEnrollmentStatus();
        if (response.success) {
          setEnrollmentState(prev => ({
            ...prev,
            status: response.enrollment_open ? 'open' : 'closed',
            year: response.enrollment_year || new Date().getFullYear(),
            message: response.enrollment_message || prev.message,
            closedMessage: response.enrollment_closed_message || prev.closedMessage
          }));
          setEditForm(prev => ({
            ...prev,
            status: response.enrollment_open ? 'open' : 'closed',
            year: response.enrollment_year || new Date().getFullYear(),
            message: response.enrollment_message || prev.message,
            closedMessage: response.enrollment_closed_message || prev.closedMessage
          }));
        }
      } catch (error) {
        console.error("Error cargando estado de matrículas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollmentData();
  }, []);

  const handleToggleStatus = async () => {
    const newStatus = enrollmentState.status === 'open' ? 'closed' : 'open';
    const newState = { ...enrollmentState, status: newStatus };
    const isOpen = newStatus === 'open';

    try {
      setLoading(true);
      // Guardar automáticamente en la API
      const response = await ApiService.updateEnrollmentStatus(isOpen, enrollmentState.year);

      if (response.success) {
        setEnrollmentState(newState);
        setEditForm(newState);

        // Emitir evento para actualizar el footer en tiempo real
        document.dispatchEvent(new CustomEvent('enrollment-status-updated', {
          detail: {
            isOpen,
            year: enrollmentState.year,
            message: enrollmentState.message,
            closedMessage: enrollmentState.closedMessage
          }
        }));

        if (window.showToast) {
          window.showToast(
            isOpen ? '🔓 Matrículas abiertas' : '🔒 Matrículas cerradas',
            'success'
          );
        }
      } else {
        if (window.showToast) window.showToast(response.message || 'Error al guardar', 'error');
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      if (window.showToast) window.showToast('Error al cambiar estado', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Guardar en API
      const isOpen = editForm.status === 'open';
      const response = await ApiService.updateEnrollmentStatus(isOpen, editForm.year);

      if (response.success) {
        setEnrollmentState({ ...editForm });
        setIsEditing(false);

        // Emitir evento para actualizar el badge del footer en tiempo real
        document.dispatchEvent(new CustomEvent('enrollment-status-updated', {
          detail: {
            isOpen,
            year: editForm.year,
            message: editForm.message,
            closedMessage: editForm.closedMessage
          }
        }));

        if (window.showToast) window.showToast('Configuración de matrículas actualizada', 'success');
      } else {
        if (window.showToast) window.showToast(response.message || 'Error al guardar', 'error');
      }
    } catch (error) {
      console.error("Error guardando matrículas:", error);
      if (window.showToast) window.showToast('Error al guardar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isOpen = enrollmentState.status === 'open';

  if (loading) {
    return (
      <div style={{ padding: '1rem 0', textAlign: 'center', opacity: 0.6 }}>
        <p>Cargando configuración de matrículas...</p>
      </div>
    );
  }

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
