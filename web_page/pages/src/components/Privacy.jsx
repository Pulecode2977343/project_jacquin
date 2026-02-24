import React, { useState } from 'react';

const s = {
  wrapper: { display: 'flex', justifyContent: 'center', margin: '3em 1em' },
  a4: {
    background: 'linear-gradient(135deg, #f5f3e8 0%, #ebe7d7 50%, #f2eede 100%)',
    width: '100%',
    maxWidth: '210mm',
    minHeight: '297mm',
    padding: '20mm',
    boxShadow: '0 0 20px rgba(0,0,0,0.2)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    color: '#1a1a2e',
  },
  h2: { color: '#223F61', marginBottom: '0.5em' },
  h3: { color: '#223F61', marginTop: '1em', marginBottom: '0.3em' },
  searchBar: { textAlign: 'right', marginBottom: '1em' },
  searchInput: {
    padding: '0.5em 1em', borderRadius: '5px',
    border: '1px solid #ccc', fontSize: '0.9rem', width: '240px',
  },
  actions: { marginTop: '2em', textAlign: 'center' },
  btn: {
    background: '#223F61', color: '#0B3A53', border: 'none',
    padding: '0.7em 1.5em', borderRadius: '5px', cursor: 'pointer',
    fontSize: '0.95rem', marginTop: '0.5em',
  },
  contact: {
    background: 'rgba(11,58,83,0.08)', border: '1px solid #0B3A53',
    borderRadius: '8px', padding: '1em 1.5em', marginTop: '1em',
  },
  link: { color: '#0B3A53' },
};

function hl(text, q) {
  if (!q.trim()) return text;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase()
      ? <mark key={i} style={{ background: 'yellow', fontWeight: 'bold' }}>{p}</mark>
      : p
  );
}

function P({ children, q }) {
  return <p>{hl(typeof children === 'string' ? children : children, q)}</p>;
}

function H3({ children, q }) {
  return <h3 style={s.h3}>{hl(children, q)}</h3>;
}

export default function Privacy() {
  const [q, setQ] = useState('');

  return (
    <div style={s.wrapper}>
      <div style={s.a4}>
        <div style={s.searchBar}>
          <input
            type="text"
            placeholder="Buscar en la política de datos..."
            style={s.searchInput}
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        <h2 style={s.h2}>{hl('Política de Tratamiento de Datos Personales', q)}</h2>
        <p>
          {hl('Jacquin Academia Musical (en adelante, "la Academia") reconoce la importancia de proteger los datos personales de estudiantes, profesores, administradores, personal y visitantes. La presente Política describe las prácticas de recolección, uso, almacenamiento, protección y ejercicio de derechos respecto a los datos personales, en concordancia con la ', q)}
          <strong>Ley 1581 de 2012</strong>, el <strong>Decreto 1377 de 2013</strong>
          {hl(' y los principios de Habeas Data aplicables en la República de Colombia.', q)}
        </p>

        <H3 q={q}>1. Responsable del Tratamiento</H3>
        <p>
          {hl('La Academia Jacquin, con NIT: XXXX-XXXX, es la entidad responsable del tratamiento de los datos personales recabados. Contacto: ', q)}
          <a href="mailto:protecciondatos@jacquin.edu" style={s.link}>protecciondatos@jacquin.edu</a>
        </p>

        <H3 q={q}>2. Finalidades del Tratamiento</H3>
        <P q={q}>Los datos personales recolectados serán utilizados para las siguientes finalidades:</P>
        <ul>
          <li>{hl('Gestión académica y administrativa (matrículas, expedición de certificados, seguimiento académico).', q)}</li>
          <li>{hl('Comunicación de información institucional, eventos y cambios en programación.', q)}</li>
          <li>{hl('Procesos de facturación y pagos.', q)}</li>
          <li>{hl('Seguridad y control de acceso a las instalaciones.', q)}</li>
          <li>{hl('Estadística interna y mejora de la calidad educativa (con datos agregados y anonimizados).', q)}</li>
        </ul>

        <H3 q={q}>3. Datos Recolectados</H3>
        <P q={q}>Según la finalidad, la Academia podrá recolectar datos como: nombres, documento de identidad, correo electrónico, teléfono, fecha de nacimiento, información académica, datos de pago y otra información pertinente al servicio ofrecido.</P>

        <H3 q={q}>4. Base Legal y Consentimiento</H3>
        <P q={q}>El tratamiento se realiza con base en el consentimiento del titular cuando sea requerido, y en las demás bases legales aplicables (cumplimiento de una obligación contractual o legal, relación administrativa, interés legítimo).</P>

        <H3 q={q}>5. Derechos de los Titulares (ARCO)</H3>
        <P q={q}>Los titulares de los datos tienen derecho a:</P>
        <ul>
          <li><strong>Acceder</strong> {hl('a la información que sobre él exista en las bases de datos de la Academia.', q)}</li>
          <li><strong>Rectificar</strong> {hl('y actualizar los datos cuando sean inexactos o incompletos.', q)}</li>
          <li><strong>Cancelar</strong> {hl('sus datos cuando considere que no están siendo tratados conforme a la ley.', q)}</li>
          <li><strong>Oponerse</strong> {hl(' al tratamiento por motivos legítimos.', q)}</li>
        </ul>
        <p>
          {hl('Para ejercer los derechos ARCO, envíe una solicitud a ', q)}
          <a href="mailto:protecciondatos@jacquin.edu" style={s.link}>protecciondatos@jacquin.edu</a>
        </p>

        <H3 q={q}>6. Transferencias y Encargados</H3>
        <P q={q}>La Academia podrá compartir datos con terceros encargados del tratamiento (plataformas de pago, proveedores educativos, servicios en la nube) bajo contratos que garanticen la protección y confidencialidad de la información.</P>

        <H3 q={q}>7. Medidas de Seguridad</H3>
        <P q={q}>Se adoptan medidas administrativas, técnicas y físicas razonables para proteger los datos personales contra pérdida, acceso no autorizado, divulgación, alteración o destrucción.</P>

        <H3 q={q}>8. Conservación</H3>
        <P q={q}>Los datos personales se conservarán durante el tiempo necesario para cumplir las finalidades para las cuales fueron recolectados y de acuerdo con los plazos legales aplicables.</P>

        <H3 q={q}>9. Quejas y Reclamos</H3>
        <p>
          {hl('En caso de incidentes, quejas o reclamos, contáctenos en ', q)}
          <a href="mailto:protecciondatos@jacquin.edu" style={s.link}>protecciondatos@jacquin.edu</a>
        </p>

        <H3 q={q}>10. Cambios en la Política</H3>
        <P q={q}>La Academia se reserva el derecho de modificar esta Política. Las versiones actualizadas estarán publicadas en el sitio web y entrarán en vigencia a partir de su publicación.</P>

        <div style={s.contact}>
          <strong>Contacto de Protección de Datos</strong><br />
          Correo: <a href="mailto:protecciondatos@jacquin.edu" style={s.link}>protecciondatos@jacquin.edu</a>
        </div>

        <p><strong>Última actualización:</strong> Octubre de 2025</p>

        <div style={s.actions}>
          <button style={s.btn} onClick={() => window.print()}>Descargar / Imprimir PDF</button>
        </div>
      </div>
    </div>
  );
}
