'use client';

import { useState, useEffect } from 'react';
import { getLiveMetrics, getAppointments, getPatientNotes } from './actions';

export default function CombinedPortal() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [activeTab, setActiveTab] = useState('Growth & Sales');
  const [metrics, setMetrics] = useState({ leads: 0, pipeline: 0 });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    const [metricsData, apptData] = await Promise.all([getLiveMetrics(), getAppointments()]);
    setMetrics(metricsData);
    setAppointments(apptData);
    setIsRefreshing(false);
  };

  useEffect(() => { if (isAdminMode) fetchData(); }, [isAdminMode, activeTab]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f4f6f8' }}>
      <div style={{ background: '#111', padding: '8px 24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setIsAdminMode(!isAdminMode)} style={{ padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', background: '#333', color: '#fff', border: '1px solid #555' }}>
          {isAdminMode ? 'View Public Site 👁️' : 'Enter Admin Mode 🔒'}
        </button>
      </div>

      {isAdminMode && (
        <div>
          <nav style={{ background: '#2B2D61', color: 'white', padding: '0 24px', display: 'flex', alignItems: 'center', height: '60px', gap: '30px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>DGOS PLATFORM</h2>
            {['Growth & Sales', 'Clinical Engine', 'Reception Desk'].map(tab => (
              <span key={tab} onClick={() => setActiveTab(tab)} style={{ cursor: 'pointer', borderBottom: activeTab === tab ? '3px solid white' : '3px solid transparent' }}>{tab}</span>
            ))}
          </nav>

          <main style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2>{activeTab}</h2>
              <button onClick={fetchData} style={{ padding: '8px 16px', background: '#ebf4ff', borderRadius: '6px', cursor: 'pointer' }}>🔄 Sync Data</button>
            </div>

            {activeTab === 'Growth & Sales' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}><h3>Pipeline</h3><p style={{ fontSize: '2rem' }}>₹{metrics.pipeline.toLocaleString()}</p></div>
                <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}><h3>Leads</h3><p style={{ fontSize: '2rem' }}>{metrics.leads} Patients</p></div>
              </div>
            )}

            {activeTab === 'Reception Desk' && (
              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
                <h3>Upcoming Appointments</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                  <thead><tr style={{ borderBottom: '2px solid #eee' }}><th style={{ padding: '12px' }}>Date</th><th style={{ padding: '12px' }}>Time</th><th style={{ padding: '12px' }}>Patient</th><th style={{ padding: '12px' }}>Status</th></tr></thead>
                  <tbody>{appointments.map((a, i) => <tr key={i} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '12px' }}>{a.date}</td><td style={{ padding: '12px' }}>{a.time}</td><td style={{ padding: '12px' }}>{a.firstName} {a.lastName}</td><td style={{ padding: '12px' }}>{a.status}</td></tr>)}</tbody>
                </table>
              </div>
            )}

            {activeTab === 'Clinical Engine' && (
              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
                <h3>Clinical History</h3>
                <input id="phoneSearch" placeholder="WhatsApp Number (e.g., 59816076644369@lid)..." style={{ padding: '8px', width: '300px', border: '1px solid #ddd' }} />
                <button onClick={async () => { const p = (document.getElementById('phoneSearch') as HTMLInputElement).value; alert(await getPatientNotes(p)); }} style={{ marginLeft: '10px', padding: '8px 16px', background: '#2B2D61', color: '#fff', border: 'none' }}>Fetch</button>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}