import React, { useEffect, useState } from 'react';

const dateFormat = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Mexico_City' });

function Login({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'No fue posible acceder.');
      onSuccess();
    } catch (cause) { setError(cause.message || 'No fue posible acceder.'); } finally { setLoading(false); }
  }
  return <main className="admin-page"><section className="admin-login">
    <p className="eyebrow">Candy · Agustín · Gael</p><h1>Confirmaciones</h1><p>Acceso privado para consultar la lista de invitados.</p>
    <form onSubmit={submit}>{error && <p className="admin-error" role="alert">{error}</p>}<label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label><button type="submit" disabled={loading}>{loading ? 'Abriendo…' : 'Entrar al panel'}</button></form>
    <a href="/">← Volver a la invitación</a>
  </section></main>;
}

function StatCard({ label, value, color }) {
  return (
    <article className="stat-card" style={{ '--stat-color': color }}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Dashboard({ data, reload, onLogout }) {
  const { summary, rsvps } = data;
  return <main className="admin-page"><section className="admin-dashboard">
    <header className="admin-header">
      <div>
        <p className="eyebrow">Candy · Agustín · Gael</p>
        <h1>Confirmaciones</h1>
        <p>Actualizado al momento.</p>
      </div>
      <div className="admin-actions">
        <button className="admin-secondary" onClick={reload}>Actualizar</button>
        <button className="admin-secondary" onClick={onLogout}>Salir</button>
      </div>
    </header>
    <div className="admin-stats" role="region" aria-label="Resumen de confirmaciones">
      <StatCard label="Respuestas" value={summary.responses} color="var(--gold)" />
      <StatCard label="Asistirán" value={summary.attending} color="var(--green)" />
      <StatCard label="Personas confirmadas" value={summary.guests} color="var(--olive)" />
      <StatCard label="No asistirán" value={summary.declining} color="var(--gold)" />
    </div>
    <section className="admin-list" aria-labelledby="list-heading">
      <div className="admin-list-heading" id="list-heading">
        <h2>Lista de respuestas</h2>
        <span>{rsvps.length} registro{rsvps.length !== 1 ? 's' : ''}</span>
      </div>
      {rsvps.length === 0 ? (
        <p className="admin-empty">Aún no hay confirmaciones. Las nuevas respuestas aparecerán aquí.</p>
      ) : (
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invitado</th>
                <th>Personas</th>
                <th>Respuesta</th>
                <th>Recibida</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((rsvp) => (
                <tr key={rsvp.id}>
                  <td data-label="Invitado">{rsvp.name}</td>
                  <td data-label="Personas">{rsvp.guests}</td>
                  <td data-label="Respuesta"><span className={`status ${rsvp.attendance}`}>{rsvp.attendance === 'si' ? 'Asistirá' : 'No asistirá'}</span></td>
                  <td data-label="Recibida">{dateFormat.format(new Date(rsvp.created_at))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
    <a href="/" className="admin-back">← Ver invitación pública</a>
  </section></main>;
}

export default function Admin() {
  const [data, setData] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    setError(''); const response = await fetch('/api/admin/rsvps', { cache: 'no-store' });
    if (response.status === 401) { setData(null); return; }
    const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'No se pudo consultar la información.'); setData(payload);
  };
  useEffect(() => { load().catch((cause) => setError(cause.message)).finally(() => setChecking(false)); }, []);
  async function logout() { await fetch('/api/admin/logout', { method: 'POST' }); setData(null); }
  if (checking) return <main className="admin-page"><p className="admin-loading">Cargando confirmaciones…</p></main>;
  if (!data) return <Login onSuccess={() => { setChecking(true); load().catch((cause) => setError(cause.message)).finally(() => setChecking(false)); }} />;
  return <>{error && <p className="admin-floating-error">{error}</p>}<Dashboard data={data} reload={() => load().catch((cause) => setError(cause.message))} onLogout={logout} /></>;
}