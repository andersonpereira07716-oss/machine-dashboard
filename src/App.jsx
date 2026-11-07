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
  const [targets, setTargets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('TODOS');
  const [newName, setNewName] = useState('');
  const [newSSN, setNewSSN] = useState('');
  const [newStatus, setNewStatus] = useState('Ameaça');
  const [logs, setLogs] = useState([
    { id: 'l1', source_type: 'SUPABASE-CLOUD', content: 'Ligação WebSocket estabelecida com a Máquina.', created_at: new Date().toLocaleTimeString() }
  ]);

  // 1. Buscar alvos iniciais do Supabase
  useEffect(() => {
    async function fetchTargets() {
      const { data, error } = await supabase.from('targets').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setTargets(data);
        setSelectedId(data[0].id);
      } else {
        // Alvos padrão caso a tabela esteja vazia
        setTargets([
          { id: '1', full_name: 'JOHN REESE', ssn_last_four: '8921', status: 'Aliado', threat_level: 15, location: 'LAT: -7.0172 | LONG: -37.2841' },
          { id: '2', full_name: 'HAROLD FINCH', ssn_last_four: '4012', status: 'Aliado', threat_level: 5, location: 'LAT: -7.0185 | LONG: -37.2820' }
        ]);
        setSelectedId('1');
      }
    }
    fetchTargets();
  }, []);

  // 2. Subscrever WebSockets em tempo real (Alvos e Logs)
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'surveillance_feed' },
        (payload) => {
          const newMsg = {
            id: payload.new.id || Math.random().toString(),
            source_type: payload.new.source_type || 'FEED-EXTERNO',
            content: sanitizeString(payload.new.content),
            created_at: new Date().toLocaleTimeString()
          };
          setLogs(prev => [newMsg, ...prev.slice(0, 19)]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'targets' },
        (payload) => {
          setTargets(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const currentSelected = targets.find(t => t.id === selectedId) || targets[0];

  const handleSelectTarget = (target) => {
    setSelectedId(target.id);
  };

  const handleAddTarget = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newEntry = {
      full_name: newName.toUpperCase(),
      ssn_last_four: newSSN || '0000',
      status: newStatus,
      threat_level: newStatus === 'Ameaça' ? 88 : 10,
      location: 'LAT: -7.0190 | LONG: -37.2850'
    };

    // Insere diretamente no Supabase (o Realtime atualizará o painel)
    const { error } = await supabase.from('targets').insert([newEntry]);
    if (!error) {
      setNewName('');
      setNewSSN('');
    } else {
      alert('Erro ao processar alvo na base de dados.');
    }
  };

  const handleTriggerAlert = () => {
    alert(`[ALERTA MÁQUINA] Protocolo de emergência disparado para o alvo: ${currentSelected?.full_name}!`);
  };

  const filteredTargets = targets.filter(t => {
    if (filter === 'ALIADOS') return t.status === 'Aliado';
    if (filter === 'AMEAÇAS') return t.status === 'Ameaça';
    return true;
  });

  const styles = {
    container: { backgroundColor: '#07090d', color: '#ffb703', fontFamily: 'monospace', padding: '12px', minHeight: '100vh', boxSizing: 'border-box' },
    header: { borderBottom: '1.5px solid rgba(255, 183, 3, 0.4)', paddingBottom: '10px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '6px' },
    grid: { display: 'flex', flexDirection: 'column', gap: '14px' },
    card: { backgroundColor: '#0e1117', border: '1px solid rgba(255, 183, 3, 0.3)', padding: '12px', borderRadius: '6px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)' },
    title: { fontSize: '12px', fontWeight: 'bold', color: '#7a828e', marginBottom: '10px', borderBottom: '1px solid #1a202c', paddingBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' },
    scrollArea: { overflowY: 'auto', maxHeight: '260px', display: 'flex', flexDirection: 'column', gap: '10px' },
    targetItem: (isThreat, isSelected) => ({
      padding: '12px',
      border: isSelected ? (isThreat ? '2px solid #ff0055' : '2px solid #ffb703') : (isThreat ? '1px solid rgba(255, 0, 85, 0.4)' : '1px solid rgba(255, 183, 3, 0.3)'),
      backgroundColor: isSelected ? (isThreat ? 'rgba(255, 0, 85, 0.2)' : 'rgba(255, 183, 3, 0.15)') : 'transparent',
      color: isThreat ? '#ff0055' : '#ffb703',
      borderRadius: '4px',
      cursor: 'pointer',
    }),
    badge: (isThreat) => ({
      fontSize: '10px',
      fontWeight: 'bold',
      padding: '4px 8px',
      border: isThreat ? '1px solid #ff0055' : '1px solid #ffb703',
      backgroundColor: isThreat ? 'rgba(255, 0, 85, 0.2)' : 'rgba(255, 183, 3, 0.2)',
      color: isThreat ? '#ff0055' : '#ffb703',
      borderRadius: '3px',
    }),
    filterBtn: (active) => ({
      padding: '3px 8px',
      fontSize: '9px',
      fontWeight: 'bold',
      backgroundColor: active ? '#ffb703' : 'transparent',
      color: active ? '#07090d' : '#ffb703',
      border: '1px solid #ffb703',
      borderRadius: '3px',
      cursor: 'pointer',
    }),
    input: {
      backgroundColor: '#040507',
      border: '1px solid rgba(255, 183, 3, 0.4)',
      color: '#ffb703',
      padding: '8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontFamily: 'monospace',
      width: '100%',
      boxSizing: 'border-box'
    },
    actionBtn: {
      backgroundColor: '#ff0055',
      color: '#fff',
      border: 'none',
      padding: '10px',
      borderRadius: '4px',
      fontWeight: 'bold',
      fontSize: '11px',
      cursor: 'pointer',
      letterSpacing: '1px',
      marginTop: '8px',
      width: '100%',
      boxShadow: '0 0 10px rgba(255, 0, 85, 0.4)'
    },
    logItem: { padding: '8px 10px', backgroundColor: '#040507', borderLeft: '2px solid #ffb703', fontSize: '11px' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: '#ffb703', borderRadius: '50%', boxShadow: '0 0 10px #ffb703' }} />
          <h1 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, letterSpacing: '1.5px' }}>THE MACHINE // CLOUD DATABASE</h1>
        </div>
        <div style={{ fontSize: '10px', color: '#7a828e', display: 'flex', justifyContent: 'space-between' }}>
          <div>ESTADO: <span style={{ color: '#00f0ff', fontWeight: 'bold' }}>ONLINE (SUPABASE)</span></div>
          <div>FOCO: <span style={{ color: currentSelected?.status === 'Ameaça' ? '#ff0055' : '#ffb703', fontWeight: 'bold' }}>{currentSelected?.full_name || 'N/A'}</span></div>
        </div>
      </header>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={styles.title}>1. SUJEITOS DE INTERESSE (NUVEM)</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['TODOS', 'ALIADOS', 'AMEAÇAS'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={styles.filterBtn(filter === f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={styles.scrollArea}>
            {filteredTargets.map((target) => {
              const isThreat = target.status === 'Ameaça';
              const isSelected = currentSelected?.id === target.id;
              return (
                <div key={target.id} onClick={() => handleSelectTarget(target)} style={styles.targetItem(isThreat, isSelected)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 'bold' }}>
                    <span>{isSelected ? `> ${sanitizeString(target.full_name)}` : sanitizeString(target.full_name)}</span>
                    <span style={styles.badge(isThreat)}>{target.status}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#8a92a0', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>ID: XXX-XX-{sanitizeString(target.ssn_last_four)}</span>
                    <span style={{ fontWeight: 'bold' }}>RISCO: {target.threat_level}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.title}>2. INGESTÃO DE NOVO ALVO (SUPABASE)</div>
          <form onSubmit={handleAddTarget} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input type="text" placeholder="NOME COMPLETO" value={newName} onChange={(e) => setNewName(e.target.value)} style={styles.input} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="ID / SSN (4 dígitos)" value={newSSN} onChange={(e) => setNewSSN(e.target.value)} style={styles.input} />
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={styles.input}>
                <option value="Ameaça">Ameaça</option>
                <option value="Aliado">Aliado</option>
              </select>
            </div>
            <button type="submit" style={{ ...styles.actionBtn, backgroundColor: '#ffb703', color: '#07090d', boxShadow: '0 0 10px rgba(255,183,3,0.3)' }}>
              + REGISTRAR NA NUVEM
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <div style={styles.title}>3. RECONHECIMENTO ÓPTICO E MATRIZ</div>
          <div style={{ height: '180px', backgroundColor: '#040507', border: '1px dashed rgba(255, 183, 3, 0.4)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ textAlign: 'center', zIndex: 1, padding: '0 10px' }}>
              <span style={{ fontSize: '16px', fontWeight: '900', opacity: 0.5, display: 'block', color: currentSelected?.status === 'Ameaça' ? '#ff0055' : '#ffb703' }}>
                ALVO: {sanitizeString(currentSelected?.full_name)}
              </span>
              <span style={{ fontSize: '10px', color: '#00f0ff', fontWeight: 'bold' }}>
                [ {sanitizeString(currentSelected?.location)} ]
              </span>
            </div>
            <div style={{ position: 'absolute', width: '80px', height: '80px', border: currentSelected?.status === 'Ameaça' ? '1.5px solid rgba(255, 0, 85, 0.8)' : '1.5px solid rgba(255, 183, 3, 0.8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '6px', height: '6px', backgroundColor: currentSelected?.status === 'Ameaça' ? '#ff0055' : '#ffb703', borderRadius: '50%', boxShadow: currentSelected?.status === 'Ameaça' ? '0 0 10px #ff0055' : '0 0 10px #ffb703' }} />
            </div>
          </div>
          <button onClick={handleTriggerAlert} style={styles.actionBtn}>
            ⚠️ DISPARAR ALERTA CRÍTICO
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.title}>4. TELEMETRIA E LOGS EM TEMPO REAL</div>
          <div style={styles.scrollArea}>
            {logs.map((log) => (
              <div key={log.id} style={styles.logItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '9px', marginBottom: '2px' }}>
                  <span>[{sanitizeString(log.source_type)}]</span>
                  <span>{log.created_at}</span>
                </div>
                <div style={{ color: '#c5cbd3' }}>{log.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
