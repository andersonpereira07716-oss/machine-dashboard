import { dispararAlertaTelegramTatico } from './services/telegramService';
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
  const [userRole, setUserRole] = useState('operador');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [targets, setTargets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('TODOS');
  const [newName, setNewName] = useState('');
  const [newSSN, setNewSSN] = useState('');
  const [newStatus, setNewStatus] = useState('Ameaça');
  const [commandInput, setCommandInput] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [scanningFace, setScanningFace] = useState(false);
  const [scanningSignal, setScanningSignal] = useState(false);
  const [interceptedData, setInterceptedData] = useState(null);

  const [logs, setLogs] = useState([
    { id: 'l1', source_type: 'INTEL-CORE', content: 'Módulos avançados de Dossiê e Overlay de Vídeo integrados.', created_at: new Date().toLocaleTimeString() }
  ]);

  const playAudioBeep = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserRole(userId) {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (data) setUserRole(data.role);
  }

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
        playAudioBeep();
        setLogs(prev => [{
          id: payload.new.id || Math.random().toString(),
          source_type: payload.new.source_type || 'FEED',
          content: sanitizeString(payload.new.content),
          created_at: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 19)]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'targets' }, (payload) => {
        playAudioBeep();
        setTargets(prev => [payload.new, ...prev]);
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => { supabase.removeChannel(channel); };
  }, [session, soundEnabled]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert('Falha na autenticação: ' + error.message);
    setAuthLoading(false);
  };

  const handleLogout = () => supabase.auth.signOut();

  const currentSelected = targets.find(t => t.id === selectedId) || targets[0];

  const handleAddTarget = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await supabase.from('targets').insert([{
      full_name: newName.toUpperCase(),
      ssn_last_four: newSSN || '0000',
      status: newStatus,
      threat_level: newStatus === 'Ameaça' ? 95 : 10,
      location: `LAT: -7.0${Math.floor(Math.random()*900)} | LONG: -37.2${Math.floor(Math.random()*900)}`,
      ai_analysis: 'Registo manual inserido no sistema tático.',
      suggested_action: 'Monitoramento Contínuo'
    }]);
    setNewName('');
    setNewSSN('');
  };

  const handleFacialScan = () => {
    setScanningFace(true);
    playAudioBeep();
    setTimeout(async () => {
      const foragidosExemplo = [
        { nome: "CARLOS ALBERTO (FORAGIDO PRISIONAL)", risco: 98, local: "LAT: -7.0142 | LONG: -37.2910" },
        { nome: "MARCOS V. SANTOS (MANDADO EM ABERTO)", risco: 94, local: "LAT: -7.0210 | LONG: -37.2750" }
      ];
      const match = foragidosExemplo[Math.floor(Math.random() * foragidosExemplo.length)];

      await supabase.from('targets').insert([{
        full_name: match.nome,
        ssn_last_four: '9999',
        status: 'Ameaça',
        threat_level: match.risco,
        location: match.local,
        ai_analysis: 'MATCH BIOMÉTRICO POSITIVO: 99.4% de similaridade com base carcerária.',
        suggested_action: 'Acionar autoridades locais e equipa tática'
      }]);

      setScanningFace(false);
    }, 2000);
  };

  const handleSignalScan = () => {
    setScanningSignal(true);
    playAudioBeep();
    setTimeout(() => {
      const freq = (800 + Math.random() * 100).toFixed(2);
      const transcriptions = [
        "\"...mudando para a rota secundária em 5 minutos...\"",
        "\"...pacote confirmado no ponto de encontro...\"",
        "\"...desliguem os dispositivos, sinal detetado...\""
      ];
      const randomText = transcriptions[Math.floor(Math.random() * transcriptions.length)];
      
      setInterceptedData({ freq: `${freq} MHz`, text: randomText, quality: `${Math.floor(85 + Math.random() * 14)}%` });

      setLogs(prev => [{
        id: Math.random().toString(),
        source_type: 'SIGINT',
        content: `Sinal interceptado em ${freq} MHz: ${randomText}`,
        created_at: new Date().toLocaleTimeString()
      }, ...prev]);

      setScanningSignal(false);
    }, 1800);
  };

  const exportDossier = () => {
    if (!currentSelected) return;
    const dossierText = `========================================\n` +
                        ` THE MACHINE // DOSSIÊ DE INTELIGÊNCIA\n` +
                        `========================================\n` +
                        `ALVO: ${currentSelected.full_name}\n` +
                        `ESTADO: ${currentSelected.status}\n` +
                        `NÍVEL DE RISCO: ${currentSelected.threat_level}%\n` +
                        `COORDENADAS: ${currentSelected.location}\n` +
                        `ANÁLISE IA: ${currentSelected.ai_analysis}\n` +
                        `AÇÃO SUGERIDA: ${currentSelected.suggested_action}\n` +
                        `DATA DE EMISSÃO: ${new Date().toLocaleString()}\n` +
                        `========================================\n`;

    const blob = new Blob([dossierText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dossie_${currentSelected.full_name.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  const handleTriggerAlert = () => {
    playAudioBeep();
    alert(`[ALERTA MÁXIMO] Protocolo de captura acionado para: ${currentSelected?.full_name}`);
  };

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    const cmd = commandInput.trim().toLowerCase();
    
    let responseText = `Comando executado: ${cmd}`;
    if (cmd === '/scan') responseText = 'Varredura multiespectral concluída.';
    else if (cmd === '/lock') responseText = `Alvo ${currentSelected?.full_name || 'N/A'} travado no sistema de mira.`;
    else if (cmd === '/dossier') { exportDossier(); responseText = 'Dossiê do alvo gerado e descarregado.'; }
    else if (cmd === '/purge') responseText = 'Cache limpo.';

    setLogs(prev => [{
      id: Math.random().toString(),
      source_type: 'TERMINAL',
      content: responseText,
      created_at: new Date().toLocaleTimeString()
    }, ...prev]);

    setCommandInput('');
  };

  const exportLogs = () => {
    const textContent = logs.map(l => `[${l.created_at}] [${l.source_type}] ${l.content}`).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_maquina_${Date.now()}.txt`;
    a.click();
  };

  const filteredTargets = targets.filter(t => {
    if (filter === 'AMEAÇAS') return t.status === 'Ameaça';
    if (filter === 'ALIADOS') return t.status === 'Aliado';
    return true;
  });

  const totalThreats = targets.filter(t => t.status === 'Ameaça').length;
  const avgThreatLevel = targets.length > 0 
    ? Math.round(targets.reduce((acc, curr) => acc + (curr.threat_level || 0), 0) / targets.length)
    : 0;

  const styles = {
    container: { backgroundColor: '#07090d', color: '#ffb703', fontFamily: 'monospace', padding: '12px', minHeight: '100vh', boxSizing: 'border-box' },
    header: { borderBottom: '1.5px solid rgba(255, 183, 3, 0.4)', paddingBottom: '10px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '6px' },
    card: { backgroundColor: '#0e1117', border: '1px solid rgba(255, 183, 3, 0.3)', padding: '12px', borderRadius: '6px', marginBottom: '14px' },
    input: { backgroundColor: '#040507', border: '1px solid rgba(255, 183, 3, 0.4)', color: '#ffb703', padding: '10px', borderRadius: '4px', fontSize: '12px', width: '100%', boxSizing: 'border-box', marginBottom: '8px' },
    btn: { backgroundColor: '#ffb703', color: '#07090d', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', width: '100%' },
    filterBtn: (active) => ({
      backgroundColor: active ? '#ffb703' : 'transparent',
      color: active ? '#07090d' : '#ffb703',
      border: '1px solid #ffb703', padding: '4px 8px', borderRadius: '3px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold'
    }),
    targetItem: (isThreat, isSelected) => ({
      padding: '10px', border: isSelected ? '2px solid #ff0055' : '1px solid rgba(255,183,3,0.3)',
      backgroundColor: isSelected ? 'rgba(255,0,85,0.15)' : 'transparent', color: isThreat ? '#ff0055' : '#ffb703',
      borderRadius: '4px', cursor: 'pointer', marginBottom: '8px'
    })
  };

  if (!session) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...styles.card, width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '14px', letterSpacing: '2px', marginBottom: '16px' }}>🔒 MÁQUINA // OMNI-AUTH</h2>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="E-MAIL DE OPERADOR" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} />
            <input type="password" placeholder="PASSWORD" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} />
            <button type="submit" style={styles.btn}>{authLoading ? 'VALIDANDO...' : 'ACEDER AO SISTEMA'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '13px', margin: 0, letterSpacing: '1px' }}>THE MACHINE // GOV-OPS</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={() => setSoundEnabled(!soundEnabled)} style={{ fontSize: '9px', background: soundEnabled ? '#00f0ff' : '#333', color: '#000', border: 'none', padding: '3px 6px', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer' }}>
              {soundEnabled ? '🔊 SOM' : '🔇 MUTE'}
            </button>
            <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '3px', backgroundColor: isConnected ? 'rgba(0,255,100,0.2)' : 'rgba(255,0,0,0.2)', color: isConnected ? '#00ff64' : '#ff0055', border: '1px solid currentColor' }}>
              {isConnected ? 'ONLINE' : 'SYNC'}
            </span>
            <button onClick={handleLogout} style={{ fontSize: '9px', background: '#ff0055', color: '#fff', border: 'none', padding: '3px 6px', borderRadius: '3px', cursor: 'pointer' }}>SAIR</button>
          </div>
        </div>
        <div style={{ fontSize: '10px', color: '#8a92a0' }}>NÍVEL DE ACESSO: <span style={{ color: '#00f0ff' }}>{userRole.toUpperCase()}</span></div>
      </header>

      {/* MÉTRICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        <div style={{ backgroundColor: '#0e1117', border: '1px solid rgba(255,0,85,0.4)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#aaa' }}>FORAGIDOS / AMEAÇAS</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff0055' }}>{totalThreats}</div>
        </div>
        <div style={{ backgroundColor: '#0e1117', border: '1px solid rgba(255,183,3,0.4)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#aaa' }}>RISCO MÉDIO</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffb703' }}>{avgThreatLevel}%</div>
        </div>
      </div>

      {/* OVERLAY DE CÂMARA URBANA COM MIRA (NOVO) */}
      <div style={styles.card}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>🎥 OVERLAY TÁTICO DE CÂMARA (RTSP SIM)</div>
        <div style={{ position: 'relative', height: '140px', backgroundColor: '#040507', border: '1px solid #00f0ff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '6px', left: '8px', fontSize: '9px', color: '#00f0ff' }}>FEED: SETOR NORTE // 30 FPS</div>
          <div style={{ position: 'absolute', width: '70px', height: '90px', border: '2px dashed #ff0055', borderRadius: '4px', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '2px' }}>
            <span style={{ fontSize: '8px', backgroundColor: '#ff0055', color: '#fff', padding: '1px 3px' }}>LOCK</span>
          </div>
          <div style={{ fontSize: '10px', color: '#aaa', zIndex: 2, textAlign: 'center', marginTop: '40px' }}>
            A rastrear alvo ativo em tempo real...
          </div>
        </div>
      </div>

      {/* RECONHECIMENTO FACIAL E SIGINT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        <button onClick={handleFacialScan} disabled={scanningFace} style={{ ...styles.btn, backgroundColor: '#ff0055', color: '#fff', padding: '8px' }}>
          {scanningFace ? 'ESCANEANDO...' : '🔍 FACIAL FORAGIDO'}
        </button>
        <button onClick={handleSignalScan} disabled={scanningSignal} style={{ ...styles.btn, backgroundColor: '#00f0ff', color: '#07090d', padding: '8px' }}>
          {scanningSignal ? 'ESCANEANDO...' : '⚡ SIGINT RÁDIO'}
        </button>
      </div>

      {interceptedData && (
        <div style={{ ...styles.card, padding: '8px', borderLeft: '2px solid #00f0ff', fontSize: '10px', marginBottom: '14px' }}>
          <div>FREQ: <span style={{ color: '#00f0ff' }}>{interceptedData.freq}</span> | SINAL: {interceptedData.quality}</div>
          <div style={{ color: '#fff', marginTop: '2px', fontStyle: 'italic' }}>{interceptedData.text}</div>
        </div>
      )}

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold' }}>1. SUJEITOS DE INTERESSE</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => setFilter('TODOS')} style={styles.filterBtn(filter === 'TODOS')}>TODOS</button>
            <button onClick={() => setFilter('AMEAÇAS')} style={styles.filterBtn(filter === 'AMEAÇAS')}>AMEAÇAS</button>
            <button onClick={() => setFilter('ALIADOS')} style={styles.filterBtn(filter === 'ALIADOS')}>ALIADOS</button>
          </div>
        </div>
        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
          {filteredTargets.map(t => (
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

      {userRole === 'admin' && (
        <div style={styles.card}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>2. CADASTRAR FORAGIDO (ADMIN)</div>
          <form onSubmit={handleAddTarget}>
            <input type="text" placeholder="NOME DO FORAGIDO" value={newName} onChange={e => setNewName(e.target.value)} style={styles.input} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="ID (4 dígitos)" value={newSSN} onChange={e => setNewSSN(e.target.value)} style={styles.input} />
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={styles.input}>
                <option value="Ameaça">Foragido / Ameaça</option>
                <option value="Aliado">Aliado</option>
              </select>
            </div>
            <button type="submit" style={styles.btn}>+ INSERIR NA BASE</button>
          </form>
        </div>
      )}

      {/* MAPA & GERADOR DE DOSSIÊ (NOVO) */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold' }}>3. MAPA & DOSSIÊ TÁTICO</div>
          <button onClick={exportDossier} style={{ fontSize: '9px', background: '#00f0ff', color: '#07090d', border: 'none', padding: '3px 6px', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer' }}>📄 GERAR DOSSIÊ</button>
        </div>
        <div style={{ padding: '12px', backgroundColor: '#040507', border: '1px dashed rgba(255,183,3,0.3)', borderRadius: '4px', marginBottom: '10px' }}>
          <div style={{ color: currentSelected?.status === 'Ameaça' ? '#ff0055' : '#ffb703', fontWeight: 'bold', fontSize: '12px' }}>
            ALVO: {currentSelected?.full_name || 'Nenhum selecionado'}
          </div>
          <div style={{ fontSize: '10px', color: '#00f0ff', marginTop: '2px' }}>COORDENADAS: [{currentSelected?.location || 'N/A'}]</div>
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#aaa', borderTop: '1px solid #1a202c', paddingTop: '6px' }}>
            <div>🤖 **ANÁLISE:** {currentSelected?.ai_analysis || 'Aguardando telemetria...'}</div>
            <div style={{ color: '#ffb703', marginTop: '2px' }}>⚡ **AÇÃO:** {currentSelected?.suggested_action || 'N/A'}</div>
          </div>
        </div>
        <button onClick={handleTriggerAlert} style={{ ...styles.btn, backgroundColor: '#ff0055', color: '#fff' }}>⚠️ EXECUTAR PROTOCOLO TÁTICO</button>
      </div>

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold' }}>4. TERMINAL DE COMANDOS & LOGS</div>
          <button onClick={exportLogs} style={{ fontSize: '9px', background: '#ffb703', color: '#07090d', border: 'none', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer' }}>💾 EXPORTAR</button>
        </div>
        <form onSubmit={handleCommandSubmit} style={{ marginBottom: '8px' }}>
          <input type="text" placeholder="Comandos (/scan, /lock, /dossier, /purge)..." value={commandInput} onChange={e => setCommandInput(e.target.value)} style={{ ...styles.input, marginBottom: '4px' }} />
        </form>
        <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {logs.map(l => (
            <div key={l.id} style={{ fontSize: '10px', padding: '6px', backgroundColor: '#040507', borderLeft: '2px solid #00f0ff' }}>
              <span style={{ color: '#777' }}>[{l.source_type}]</span> {l.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// tatico-trigger-active
