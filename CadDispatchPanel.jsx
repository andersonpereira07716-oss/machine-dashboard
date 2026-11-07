import React, { useState } from 'react';

export default function CadDispatchPanel() {
  const [dispatched, setDispatched] = useState(false);
  const [unit, setUnit] = useState(null);

  const handleDispatch = () => {
    // Simula o acionamento direto via painel
    const selectedUnit = "DELTA-07 (Setor Norte)";
    setUnit(selectedUnit);
    setDispatched(true);
    setTimeout(() => setDispatched(false), 4000);
  };

  return (
    <div className="bg-slate-950 border border-red-500/40 p-4 rounded-xl text-red-400 font-mono my-4 shadow-2xl">
      <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
        <span>🛡️</span> CENTRA DE COMANDO CAD & DESPACHO TÁTICO
      </h3>
      <p className="text-xs text-slate-400 mb-4">
        Sistema automatizado de alocação de viaturas por proximidade (Geofencing) com cadeia de custódia imutável.
      </p>
      
      <div className="flex gap-4 items-center">
        <button 
          onClick={handleDispatch}
          className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded shadow transition-all uppercase text-xs tracking-wider"
        >
          {dispatched ? '⚡ A Despachar Unidade...' : '🚀 Acionar Unidade Mais Próxima'}
        </button>

        {unit && (
          <span className="text-xs text-emerald-400 animate-pulse">
            ✓ Viatura <b>{unit}</b> em rota de interceção!
          </span>
        )}
      </div>
    </div>
  );
}
