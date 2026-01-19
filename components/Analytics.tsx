
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const data = [
  { name: 'Mon', queries: 400, tokens: 2400 },
  { name: 'Tue', queries: 300, tokens: 1398 },
  { name: 'Wed', queries: 200, tokens: 9800 },
  { name: 'Thu', queries: 278, tokens: 3908 },
  { name: 'Fri', queries: 189, tokens: 4800 },
  { name: 'Sat', queries: 239, tokens: 3800 },
  { name: 'Sun', queries: 349, tokens: 4300 },
];

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'];

const Analytics: React.FC = () => {
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">System Analytics</h1>
            <p className="text-slate-400 mt-1">Real-time performance metrics and usage data.</p>
          </div>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium border border-slate-700 transition-colors">
            Download Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Tokens', value: '1.2M', change: '+12.5%', color: 'indigo' },
            { label: 'Avg Latency', value: '42ms', change: '-4.2%', color: 'emerald' },
            { label: 'Successful Calls', value: '18.4k', change: '+8.1%', color: 'blue' },
            { label: 'Active Sessions', value: '429', change: '+24%', color: 'purple' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-6">Token Consumption (7D)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Area type="monotone" dataKey="tokens" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-6">Request Distribution</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#1e293b'}}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  />
                  <Bar dataKey="queries" radius={[6, 6, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
