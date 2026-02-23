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

    if (loading) return null;

    return (
        <section className="bento-section" id="programas">
            <div className="section-header">
                <h2>Nuestros Programas</h2>
                <p>Explora tu talento con nuestra metodología personalizada</p>
            </div>

            <div className="programs-carousel" style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    effect="slide"
                    grabCursor={true}
                    centeredSlides={false}
                    spaceBetween={20}
                    slidesPerView={1}
                    loop={keys.length > 3}
                    speed={600}
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
                    style={{ paddingBottom: '40px' }}
                >
                    {keys.map(key => {
                        const p = programs[key];
                        return (
                            <SwiperSlide key={key}>
                                <div
                                    className="about-card-premium"
                                    onClick={() => window.openProgramModal && window.openProgramModal(key)}
                                    style={{
                                        backgroundImage: `url(${p.image ? (
                                            p.image.startsWith('assets/') ||
                                                p.image.startsWith('uploads/') ||
                                                p.image.startsWith('http') ||
                                                p.image.startsWith('data:')
                                                ? p.image
                                                : (p.image.startsWith('uploads') ? p.image : 'assets/' + p.image.replace(/^\//, ''))
                                        ) : 'assets/images/hero/hero-banner.jpg'})`
                                    }}
                                >
                                    <div className="about-card-overlay"></div>
                                    <div className="about-card-shine"></div>
                                    <div className="about-card-content">
                                        <i className={`bi ${p.icon} about-card-icon`}></i>
                                        <h3>{p.title}</h3>
                                        <span className="about-card-subtitle">{p.subtitle}</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                <div className="programs-prev"></div>
                <div className="programs-next"></div>
            </div>
        </section>
    );
};

export default Programs;
