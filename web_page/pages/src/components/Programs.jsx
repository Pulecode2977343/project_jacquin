import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ApiService from '../services/api';

const Programs = () => {
    const [programs, setPrograms] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrograms = async () => {
            const data = await ApiService.getProgramsJson();
            if (data && Object.keys(data).length > 0) {
                setPrograms(data);
            }
            setLoading(false);
        };
        fetchPrograms();
    }, []);

    const keys = Object.keys(programs);

    if (loading) return (
        <div id="programas" className="programs-section">
            <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                <div className="loader">Cargando Programas...</div>
            </div>
        </div>
    );

    return (
        <section id="programas" className="programs-section">
            <div className="container">
                <div className="section-header">
                    <span className="section-badge">Nuestros Programas</span>
                    <h2 className="section-title">Encuentra tu <span className="text-secondary">Ritmo</span></h2>
                    <p className="section-desc">Estructuras académicas diseñadas para cada nivel y aspiración artística.</p>
                </div>

                <div className="programs-carousel">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={20}
                        slidesPerView={1}
                        loop={keys.length > 3}
                        autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                        navigation={{ nextEl: '.programs-next', prevEl: '.programs-prev' }}
                        pagination={{ clickable: true, dynamicBullets: true }}
                        breakpoints={{
                            480: { slidesPerView: 1.2, spaceBetween: 15 },
                            768: { slidesPerView: 2.2, spaceBetween: 20 },
                            1024: { slidesPerView: 3.2, spaceBetween: 20 },
                            1366: { slidesPerView: 4, spaceBetween: 25 },
                            1600: { slidesPerView: 5, spaceBetween: 30 }
                        }}
                        className="programs-swiper"
                    >
                        {keys.map(key => {
                            const p = programs[key];
                            return (
                                <SwiperSlide key={key}>
                                    <div
                                        className="program-card"
                                        onClick={() => window.openProgramModal && window.openProgramModal(key)}
                                        style={{ backgroundImage: `url(${p.image || '/images/hero-banner.jpg'})` }}
                                    >
                                        <div className="program-overlay"></div>
                                        <div className="program-content">
                                            <div className="program-icon"><i className={`bi ${p.icon}`}></i></div>
                                            <h3>{p.title}</h3>
                                            <p>{p.subtitle}</p>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>

                    <div className="swiper-button-prev programs-prev"></div>
                    <div className="swiper-button-next programs-next"></div>
                </div>
            </div>
        </section>
    );
};

export default Programs;
