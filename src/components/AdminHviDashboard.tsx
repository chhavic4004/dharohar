import React, { useState } from 'react';
import { ShieldAlert, DollarSign } from 'lucide-react';

interface Tradition {
  id: number;
  name: string;
  region: string;
  hvi: number;
  status: string;
  practitioners: number;
  youthRate: string;
}

export default function AdminHviDashboard() {
  const [traditions] = useState<Tradition[]>([
    { id: 1, name: 'Chope Phulkari Embroidery', region: 'Patiala, Punjab', hvi: 24.5, status: 'Critical', practitioners: 12, youthRate: '4%' },
    { id: 2, name: 'Mata ni Pachedi Textile', region: 'Ahmedabad, Gujarat', hvi: 28.0, status: 'Critical', practitioners: 8, youthRate: '5%' },
    { id: 3, name: 'Toda Embroidery', region: 'Nilgiris, Tamil Nadu', hvi: 42.1, status: 'Vulnerable', practitioners: 45, youthRate: '14%' },
    { id: 4, name: 'Patan Patola Double Ikat', region: 'Patan, Gujarat', hvi: 68.4, status: 'Stable', practitioners: 120, youthRate: '35%' },
  ]);

  const triggerFundAllocation = (name: string) => {
    alert(`[ACTION TRIGGERED]: Emergency Institutional Preservation Grant initiated for "${name}" under Ministry IKS Funds.`);
  };

  return (
    <div className="p-8 bg-slate-900 text-white min-h-screen rounded-xl my-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-400 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            Dharohar Admin Command: Heritage Vulnerability Index (HVI)
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time Telemetry Engine for Endangered Intangible Traditions</p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-xs font-mono text-amber-300">
          Formula: V = 0.30T + 0.25P + 0.20D + 0.15C + 0.10F
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-red-950/40 border border-red-800/60 p-5 rounded-xl">
          <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Critical Threat Zone (HVI &lt; 30)</span>
          <p className="text-3xl font-extrabold text-red-500 mt-2">2 Traditions</p>
          <span className="text-xs text-slate-400 mt-1 block">Immediate Funding Action Required</span>
        </div>
        <div className="bg-amber-950/40 border border-amber-800/60 p-5 rounded-xl">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Vulnerable Zone (HVI 30-50)</span>
          <p className="text-3xl font-extrabold text-amber-400 mt-2">1 Tradition</p>
          <span className="text-xs text-slate-400 mt-1 block">NEP Student Documentation Active</span>
        </div>
        <div className="bg-emerald-950/40 border border-emerald-800/60 p-5 rounded-xl">
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Monitored / Stable (HVI &gt; 50)</span>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">1 Tradition</p>
          <span className="text-xs text-slate-400 mt-1 block">Healthy Artisan Transmission</span>
        </div>
      </div>

      <div className="bg-slate-800/60 rounded-xl border border-slate-700 overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs font-semibold">
            <tr>
              <th className="p-4">Tradition Name</th>
              <th className="p-4">Region</th>
              <th className="p-4">Master Artisans</th>
              <th className="p-4">Youth Rate (T)</th>
              <th className="p-4">HVI Score</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Policy Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {traditions.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition">
                <td className="p-4 font-bold text-white">{item.name}</td>
                <td className="p-4 text-slate-400">{item.region}</td>
                <td className="p-4 font-mono">{item.practitioners} families</td>
                <td className="p-4 text-red-400">{item.youthRate}</td>
                <td className="p-4 font-extrabold text-lg">
                  <span className={item.hvi < 30 ? 'text-red-500' : item.hvi < 50 ? 'text-amber-400' : 'text-emerald-400'}>
                    {item.hvi} / 100
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    item.status === 'Critical' ? 'bg-red-900/60 text-red-300 border border-red-700' : 'bg-amber-900/60 text-amber-300'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {item.hvi < 30 && (
                    <button 
                      onClick={() => triggerFundAllocation(item.name)}
                      className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ml-auto"
                    >
                      <DollarSign className="w-4 h-4" /> Deploy Grants
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}