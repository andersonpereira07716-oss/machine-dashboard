import React, { useEffect, useState } from 'react';

export default function TacticalLiveFeed() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Simulação de escuta em tempo real do Supabase (anpr_logs)
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/anpr_logs?select=*&order=detected_at.desc&limit=5`, {
          headers: {
            "apikey": process.env.REACT_APP_SUPABASE_KEY,
            "Authorization": `Bearer ${process.env.REACT_APP_SUPABASE_KEY}`
          }
        });
        const data = await response.json();
        if (Array.isArray(data)) setLogs(data);
      } catch (err) {
        console.error("Erro ao sincronizar feeds:", err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Atualização periódica live
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-950 border border-cyan-500/30 p-4 rounded-xl text-cyan-400 font-mono my-4 shadow-xl">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
        <span className="animate-pulse">🔴</span> FEED TÁTICO EM TEMPO REAL (GOV-OPS)
      </h3>
      <div className="space-y-2">
        {logs.map((item) => (
          <div key={item.id} className="p-3 bg-slate-900 border border-slate-800 rounded flex justify-between items-center text-sm">
            <div>
              <p className="font-bold text-cyan-300">{item.plate} - <span className="text-slate-300 font-normal">{item.vehicle_model}</span></p>
              <p className="text-xs text-slate-500">Local: {item.location} | {new Date(item.detected_at).toLocaleTimeString()}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded font-bold ${item.status.includes('ROUBO') ? 'bg-red-900 text-red-200' : 'bg-emerald-900 text-emerald-200'}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
