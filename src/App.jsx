import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, (match) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
    return map[match];
  });
};

export default function MachineDashboard() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [targets, setTargets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('TODOS');
  const [newName, setNewName] = useState('');
  const [newSSN, setNewSSN] = useState('');
  const [newStatus, setNewStatus] = useState('Ameaça');
  const [logs, setLogs] = useState([
    { id: 'l1', source_type: 'ZERO-TRUST-AUTH', content: 'Aguardando autenticação criptografada do operador...', created_at: new Date().toLocaleTimeString() }
  ]);

  // Verificar sessão ativa
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carregar dados se autenticado
  useEffect(() => {
    if (!session) return;

    async function fetchData() {
      const { data } = await supabase.from('targets').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setTargets(data);
        setSelectedId(data[0].id);
      }
    }
    fetchData();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'surveillance_feed' }, (payload) => {
        setLogs(prev => [{
          id: payload.new.id || Math.random().toString(),
          source_type: payload.new.source_type || 'FEED',
          content: sanitizeString(payload.new.content),
          created_at: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 19)]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'targets' }, (payload) => {
        setTargets(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Falha na autenticação: ' + error.message);
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const currentSelected = targets.find(t => t.id === selectedId) || targets[0];

  const handleAddTarget = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await supabase.from('targets').insert([{
      full_name: newName.toUpperCase(),
      ssn_last_four: newSSN || '0000',
      status: newStatus,
      threat_level: newStatus === 'Ameaça' ? 88 : 10,
      location: 'LAT: -7.0190 | LONG: -37.2850'
    }]);
    setNewName('');
    setNewSSN('');
  };

  const handleTriggerAlert = () => {
    alert(`[ALERTA DE EMERGÊNCIA] Protocolo acionado para o alvo: ${currentSelected?.full_name}`);
  };

  const styles = {
    container: { backgroundColor: '#07090d', color: '#ffb703', fontFamily: 'monospace', padding: '12px', minHeight: '100vh', boxSizing: 'border-box' },
    header: { borderBottom: '1.5px solid rgba(255, 183, 3, 0.4)', paddingBottom: '10px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '6px' },
    card: { backgroundColor: '#0e1117', border: '1px solid rgba(255, 183, 3, 0.3)', padding: '12px', borderRadius: '6px', marginBottom: '14px' },
    input: { backgroundColor: '#040507', border: '1px solid rgba(255, 183, 3, 0.4)', color: '#ffb703', padding: '10px', borderRadius: '4px', fontSize: '12px', width: '100%', boxSizing: 'border-box', marginBottom: '8px' },
    btn: { backgroundColor: '#ffb703', color: '#07090d', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', width: '100%' },
    targetItem: (isThreat, isSelected) => ({
      padding: '10px', border: isSelected ? '2px solid #ff0055' : '1px solid rgba(255,183,3,0.3)',
      backgroundColor: isSelected ? 'rgba(255,0,85,0.15)' : 'transparent', color: isThreat ? '#ff0055' : '#ffb703',
      borderRadius: '4px', cursor: 'pointer', marginBottom: '8px'
    })
  };

  // Ecrã de Login Criptografado (Zero-Trust) se não estiver autenticado
  if (!session) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...styles.card, width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '14px', letterSpacing: '2px', marginBottom: '16px' }}>🔒 ACESSO RESTRITO // A MÁQUINA</h2>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="E-MAIL DE OPERADOR" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} />
            <input type="password" placeholder="CHAVE DE ACESSO (PASSWORD)" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} />
            <button type="submit" style={styles.btn}>{authLoading ? 'VALIDANDO...' : 'AUTENTICAR SESSÃO'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '14px', margin: 0, letterSpacing: '1px' }}>THE MACHINE // SECURE HUD</h1>
          <button onClick={handleLogout} style={{ fontSize: '9px', background: '#ff0055', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer' }}>TERMINAR SESSÃO</button>
        </div>
      </header>

      <div style={styles.card}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>1. SUJEITOS DE INTERESSE (BLINDADO)</div>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {targets.map(t => (
            <div key={t.id} onClick={() => setSelectedId(t.id)} style={styles.targetItem(t.status === 'Ameaça', selectedId === t.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{sanitizeString(t.full_name)}</span>
                <span>{t.status}</span>
              </div>
              <div style={{ fontSize: '10px', color: '#8a92a0', marginTop: '4px' }}>RISCO: {t.threat_level}%</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>2. INGESTÃO DE ALVO</div>
        <form onSubmit={handleAddTarget}>
          <input type="text" placeholder="NOME COMPLETO" value={newName} onChange={e => setNewName(e.target.value)} style={styles.input} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="ID (4 dígitos)" value={newSSN} onChange={e => setNewSSN(e.target.value)} style={styles.input} />
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={styles.input}>
              <option value="Ameaça">Ameaça</option>
              <option value="Aliado">Aliado</option>
            </select>
          </div>
          <button type="submit" style={styles.btn}>+ REGISTRAR NA NUVEM</button>
        </form>
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>3. MATRIZ DE LOCALIZAÇÃO</div>
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#040507', border: '1px dashed rgba(255,183,3,0.3)', marginBottom: '8px' }}>
          <div style={{ color: '#ff0055', fontWeight: 'bold', fontSize: '13px' }}>{currentSelected?.full_name}</div>
          <div style={{ fontSize: '10px', color: '#00f0ff', marginTop: '4px' }}>[{currentSelected?.location}]</div>
        </div>
        <button onClick={handleTriggerAlert} style={{ ...styles.btn, backgroundColor: '#ff0055', color: '#fff' }}>⚠️ DISPARAR ALERTA CRÍTICO</button>
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>4. TELEMETRIA E LOGS</div>
        <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {logs.map(l => (
            <div key={l.id} style={{ fontSize: '11px', padding: '6px', backgroundColor: '#040507', borderLeft: '2px solid #ffb703' }}>
              <span style={{ color: '#777', fontSize: '9px' }}>[{l.source_type}]</span> {l.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
