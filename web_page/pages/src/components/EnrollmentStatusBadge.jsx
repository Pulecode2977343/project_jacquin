import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';

const EnrollmentStatusBadge = () => {
    const [status, setStatus] = useState(null); // null = cargando

    useEffect(() => {
        const fetchStatus = () => {
            ApiService.getEnrollmentStatus()
                .then(data => {
                    if (data.success) {
                        setStatus({ open: data.enrollment_open, year: data.enrollment_year });
                    }
                })
                .catch(err => {
                    console.error("[Badge] Error fetching status:", err);
                    setStatus({ open: true, year: new Date().getFullYear() });
                });
        };

        fetchStatus();

        // Listen for updates from the admin dashboard (Live update)
        const handleUpdate = (e) => {
            console.log("[Badge] Enrollment status updated event received:", e.detail);
            const { isOpen, year } = e.detail;
            setStatus({ open: isOpen, year: year });
        };

        document.addEventListener('enrollment-status-updated', handleUpdate);
        return () => document.removeEventListener('enrollment-status-updated', handleUpdate);
    }, []);

    if (!status) return null; // Ocultar mientras carga — sin flicker

    const isOpen = !!status.open && (status.open === true || status.open === 'open' || status.open === 1 || status.open === '1');
    const badgeClass = `jam-status-badge${isOpen ? '' : ' jam-status-badge--closed'}`;

    // Label inteligente: solo mostramos el año si las matrículas están ABIERTAS
    const statusText = isOpen ? 'Matrículas Abiertas' : 'Matrículas Cerradas';
    const label = (isOpen && status.year) ? `${statusText} ${status.year}` : statusText;

    return (
        <div className={badgeClass}>
            <span className="pulse-dot"></span>
            <span>{label}</span>
        </div>
    );
};

export default EnrollmentStatusBadge;
