import React, { useEffect, useState } from 'react';

const templeMap = 'https://www.google.com/maps/search/?api=1&query=Templo+del+Se%C3%B1or+de+la+Salud+Puru%C3%A1ndiro+Michoac%C3%A1n';
const venueMap = 'https://www.google.com/maps/search/?api=1&query=Sal%C3%B3n+El+Molino+Puru%C3%A1ndiro+Michoac%C3%A1n';
const eventDate = new Date('2026-11-14T13:00:00-06:00');

function Countdown() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const remaining = Math.max(0, eventDate.getTime() - now.getTime());
  const totalMinutes = Math.floor(remaining / 60_000);
  const values = [
    ['Días', Math.floor(totalMinutes / 1440)],
    ['Horas', Math.floor((totalMinutes % 1440) / 60)],
    ['Minutos', totalMinutes % 60],
  ];
  return <div className="countdown">{values.map(([label, value]) => <div className="count" key={label}><strong>{String(value).padStart(2, '0')}</strong><span>{label}</span></div>)}</div>;
}

function MapButton({ href }) {
  return <a className="map-button" href={href} target="_blank" rel="noreferrer">Ver ubicación en Google Maps <span>↗</span></a>;
}

function RSVP() {
  const [submitted, setSubmitted] = useState(false);
  const [opened, setOpened] = useState(false);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name'),
      guests: formData.get('guests'),
      attendance: answer,
    };
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al enviar');
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'No se pudo enviar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) return <div className="rsvp-success"><span>✦</span><h3>¡Gracias por confirmar!</h3><p>Recibimos tu respuesta con mucho cariño.</p></div>;
  if (!opened) return <button className="envelope" type="button" onClick={() => setOpened(true)} aria-label="Abrir confirmación de asistencia">
    <span className="envelope-flap" /><span className="envelope-seal">A · C · G</span><span className="envelope-copy">Toca para abrir<br /><b>tu invitación</b></span>
  </button>;
  return <form className="rsvp-form" onSubmit={submit}>
    {error && <div className="rsvp-error" role="alert">{error}</div>}
    <label>Nombre completo<input required type="text" name="name" placeholder="Escribe tu nombre" /></label>
    <label>Número de personas<input required type="number" min="1" max="12" name="guests" placeholder="Ej. 2" /></label>
    <fieldset><legend>¿Nos acompañas?</legend>
      <label className="choice"><input required type="radio" name="attendance" value="si" onChange={() => setAnswer('si')} /> Con alegría, asistiré</label>
      <label className="choice"><input required type="radio" name="attendance" value="no" onChange={() => setAnswer('no')} /> Con cariño, no podré asistir</label>
    </fieldset>
    <button type="submit" disabled={loading}>{loading ? 'Enviando…' : answer === 'si' ? 'Enviar mi confirmación' : 'Enviar respuesta'}</button>
  </form>;
}

function App() {
  return <main>
    <section className="hero" id="inicio">
      <img src="/images/cover.jpeg" alt="Candy y Agustín" />
      <div className="hero-overlay" />
      <div className="hero-copy">
        <p className="eyebrow">Boda & Bautizo</p><span className="monogram">A · C · G</span>
        <h1>Candy <i>&</i> Agustín</h1>
        <p className="date">14 · NOVIEMBRE · 2026</p>
        <a href="#bienvenida" className="hero-cta">Ver nuestra historia</a>
      </div>
    </section>

    <section className="intro" id="bienvenida"><p className="eyebrow">Con mucha alegría</p>
      <h2>Nuestra historia<br /><i>ya comenzó</i></h2>
      <p>Nuestro hogar ya existe y nuestro amor sigue creciendo cada día. Hoy queremos celebrar todo lo que somos y compartir contigo la alegría de reunir a nuestras familias y amigos en este día tan especial.</p>
      <div className="photo-collage couple-collage" aria-label="Momentos de Candy y Agustín">
        <img className="p-one" src="/images/couple-01.jpeg" alt="Candy y Agustín" /><img className="p-two" src="/images/couple-02.jpeg" alt="Candy y Agustín" />
        <img className="p-three" src="/images/couple-03.jpeg" alt="Anillos de Candy y Agustín" /><img className="p-four" src="/images/couple.jpeg" alt="Candy y Agustín celebrando" />
        <img className="p-five" src="/images/couple-04.jpeg" alt="Candy y Agustín" /><img className="p-six" src="/images/couple-06.jpeg" alt="Candy y Agustín" />
      </div>
    </section>

    <section className="padrinos">
      <p className="eyebrow">Con gratitud</p><h2>Nuestros padrinos</h2>
      <p className="names">Reyna Marcela Núñez Cervantes <b>&</b> Gerardo Delgado Gallardo</p>
      <p>Con cariño y gratitud, les agradecemos por acompañarnos y ser parte de este momento tan importante en nuestras vidas.</p>
    </section>

    <section className="event ceremony"><p className="eyebrow">Ceremonia religiosa</p><h2>El inicio de<br /><i>nuestro para siempre</i></h2>
      <div className="event-details"><p><b>14</b><span>Noviembre<br />2026</span></p><p><b>1:00</b><span>p. m.</span></p></div>
      <p>Templo del Señor de la Salud<br />Puruándiro, Michoacán</p><MapButton href={templeMap} />
    </section>

    <section className="gael"><div className="photo-collage gael-collage" aria-label="Momentos de Gael Imanol">
      <img className="p-one" src="/images/gael.jpeg" alt="Gael Imanol" /><img className="p-two" src="/images/gael-02.jpeg" alt="Gael Imanol" />
      <img className="p-three" src="/images/gael-03.jpeg" alt="Gael Imanol" /><img className="p-four" src="/images/gael-04.jpeg" alt="Gael Imanol" /><img className="p-five" src="/images/gael-05.jpeg" alt="Gael Imanol" />
    </div><div className="gael-copy">
      <p className="eyebrow">Un momento muy especial</p><h2>Nuestro amor también tiene un <i>pequeño gran testigo</i></h2>
      <p>La celebración será aún más especial porque tendremos la dicha de llevar a nuestro hijo <strong>Gael Imanol Armenta Delgado</strong> a recibir el sacramento del bautismo.</p>
    </div></section>

    <section className="padrinos pale"><p className="eyebrow">Con amor y fe</p><h2>Sus padrinos</h2>
      <p className="names">Antonio Maldonado López <b>&</b> Dulce Belén Reyes Cortés</p>
      <p>Que Dios bendiga siempre su corazón por aceptar la hermosa misión de acompañarlo en su camino de fe.</p>
    </section>

    <section className="event baptism"><p className="eyebrow">Ceremonia de bautizo</p><h2>La bendición de<br /><i>Gael Imanol</i></h2>
      <div className="event-details"><p><b>14</b><span>Noviembre<br />2026</span></p><p><b>2:00</b><span>p. m.</span></p></div>
      <p>Templo del Señor de la Salud<br />Puruándiro, Michoacán</p><MapButton href={templeMap} />
    </section>

    <section className="reception"><img src="/images/venue.jpeg" alt="Salón El Molino" /><div><p className="eyebrow">Recepción</p><h2>Brindemos por<br /><i>nuestra familia</i></h2><p>14 de noviembre de 2026 · 3:00 p. m.<br />Salón El Molino · Puruándiro, Michoacán</p><MapButton href={venueMap} /></div></section>

    <section className="details"><div><p className="eyebrow">Código de vestimenta</p><div className="dress-code"><h2 className="gift-title">Vestimenta formal</h2><img src="/images/ropa.png" alt="Vestimenta" className="dress-icon" /></div><p>Con mucho cariño pedimos a nuestros invitados respetar el color blanco, reservado para la novia.</p></div><div><p className="eyebrow">Lluvia de sobres</p><h2 className="gift-title">Lluvia de sobres</h2><p>El mejor regalo es compartir este día con ustedes. Si desean tener un detalle con nosotros, tendremos lluvia de sobres; aunque, si prefieren obsequiarnos algo, lo recibiremos con mucho cariño.</p></div></section>

    <section className="countdown-section"><p className="eyebrow">Faltan</p><h2>Momentos para celebrar</h2><Countdown /></section>

    <section className="rsvp" id="confirmacion"><p className="eyebrow">Confirmación de asistencia</p><h2>¿Nos acompañas?</h2><p>Nos encantaría celebrar este día contigo, por favor confirma tu asistencia.</p><RSVP /></section>
    <footer><span>✦</span><p>Con cariño</p><h2>Candy, Agustín & Gael</h2><small>14 · 11 · 2026</small></footer>
  </main>;
}

export default App;
