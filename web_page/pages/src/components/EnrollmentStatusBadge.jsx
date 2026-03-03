import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';

const EnrollmentStatusBadge = () => {
    const [status, setStatus] = useState(null); // null = cargando

    useEffect(() => {
        const fetchStatus = () => {
            ApiService.getEnrollmentStatus()
                .then(data => {
                    if (data.success) {
                        setStatus({
                            open: data.enrollment_open,
                            year: data.enrollment_year,
                            message: data.enrollment_message,
                            closedMessage: data.enrollment_closed_message
                        });
                    }
                })
                .catch(err => {
                    console.error("[Badge] Error fetching status:", err);
                    setStatus({
                        open: true,
                        year: new Date().getFullYear(),
                        message: 'Las matrículas están abiertas. ¡Inscríbete ahora!',
                        closedMessage: 'Las matrículas se encuentran cerradas en este momento.'
                    });
                });
        };

        fetchStatus();

        // Listen for updates from the admin dashboard (Live update)
        const handleUpdate = (e) => {
            console.log("[Badge] Enrollment status updated event received:", e.detail);
            const { isOpen, year, message, closedMessage } = e.detail;
            setStatus(prev => ({
                ...prev,
                open: isOpen,
                year: year,
                message: message || prev.message,
                closedMessage: closedMessage || prev.closedMessage
            }));
        };

        document.addEventListener('enrollment-status-updated', handleUpdate);
        return () => document.removeEventListener('enrollment-status-updated', handleUpdate);
    }, []);

    if (!status) return null; // Ocultar mientras carga — sin flicker

    const isOpen = !!status.open && (status.open === true || status.open === 'open' || status.open === 1 || status.open === '1');
    const badgeClass = `jam-status-badge${isOpen ? '' : ' jam-status-badge--closed'}`;

    // Label: siempre sin año
    const statusText = isOpen ? 'Matrículas Abiertas' : 'Matrículas Cerradas';
    const message = isOpen ? status.message : status.closedMessage;

    return (
        <div>
            <div className={badgeClass}>
                <span className="pulse-dot"></span>
                <span>{statusText}</span>
            </div>
            {message && (
                <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.8rem', marginBottom: 0 }}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default EnrollmentStatusBadge;
