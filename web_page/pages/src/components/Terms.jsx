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
    border: '1px solid #ccc', fontSize: '0.9rem', width: '220px',
  },
  actions: { marginTop: '2em', textAlign: 'center' },
  btn: {
    background: '#223F61', color: '#0B3A53', border: 'none',
    padding: '0.7em 1.5em', borderRadius: '5px', cursor: 'pointer',
    fontSize: '0.95rem', marginTop: '0.5em',
  },
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
  return <p>{hl(children, q)}</p>;
}

function H3({ children, q }) {
  return <h3 style={s.h3}>{hl(children, q)}</h3>;
}

export default function Terms() {
  const [q, setQ] = useState('');

  return (
    <div style={s.wrapper}>
      <div style={s.a4}>
        <div style={s.searchBar}>
          <input
            type="text"
            placeholder="Buscar en los términos..."
            style={s.searchInput}
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        <h2 style={s.h2}>{hl('Términos y Condiciones Generales', q)}</h2>
        <P q={q}>
          Bienvenido a Jacquin Academia Musical. Al acceder y utilizar nuestros servicios, usted acepta cumplir con los siguientes términos y condiciones. Le recomendamos leer este documento detenidamente antes de registrarse o participar en nuestras actividades.
        </P>

        <H3 q={q}>1. Inscripciones y Pagos</H3>
        <P q={q}>Las inscripciones se realizan a través de los canales oficiales de la Academia. Los pagos deben efectuarse según las fechas establecidas en el calendario académico. No se realizarán reembolsos una vez iniciado el curso.</P>

        <H3 q={q}>2. Uso de las Instalaciones y Recursos</H3>
        <P q={q}>Los estudiantes se comprometen a cuidar las instalaciones, instrumentos y materiales proporcionados por la Academia. Cualquier daño ocasionado por mal uso será responsabilidad del estudiante.</P>

        <H3 q={q}>3. Derechos de Propiedad Intelectual</H3>
        <P q={q}>Todo el material didáctico, audiovisual y contenido digital generado por la Academia Jacquin está protegido por derechos de autor. No está permitido su uso con fines comerciales o su reproducción sin autorización.</P>

        <H3 q={q}>4. Conducta y Normas</H3>
        <P q={q}>Se espera un comportamiento respetuoso entre estudiantes, profesores y personal administrativo. La falta de cumplimiento de estas normas puede conllevar la suspensión o cancelación de la matrícula.</P>

        <H3 q={q}>5. Privacidad y Protección de Datos</H3>
        <P q={q}>La información personal de los estudiantes será tratada conforme a la Ley de Protección de Datos Personales. No será compartida con terceros sin consentimiento expreso.</P>

        <H3 q={q}>6. Cambios y Actualizaciones</H3>
        <P q={q}>La Academia se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Las versiones actualizadas estarán disponibles en nuestro sitio web oficial.</P>

        <p><strong>Última actualización:</strong> Octubre de 2025</p>

        <div style={s.actions}>
          <button style={s.btn} onClick={() => window.print()}>Descargar / Imprimir PDF</button>
        </div>
      </div>
    </div>
  );
}
