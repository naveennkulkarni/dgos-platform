'use client';

import { useState } from 'react';

export default function CombinedPortal() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [activeTab, setActiveTab] = useState('Growth & Sales');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: isAdminMode ? '#f4f6f8' : '#ffffff' }}>
      
      {/* GLOBAL TOGGLE SWITCH (Hidden in a real production app, but kept here so you can test) */}
      <div style={{ background: '#111', padding: '8px 24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => setIsAdminMode(!isAdminMode)}
          style={{ padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', background: '#333', color: '#fff', border: '1px solid #555', fontSize: '0.85rem' }}
        >
          {isAdminMode ? 'View Public Patient Site 👁️' : 'Enter Staff Admin Mode 🔒'}
        </button>
      </div>

      {/* ========================================= */}
      {/* VIEW 1: PUBLIC PATIENT LANDING PAGE       */}
      {/* ========================================= */}
      {!isAdminMode && (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
            <h1 style={{ margin: 0, color: '#111' }}>🦷 Narayani Smiles</h1>
            <span style={{ color: '#666' }}>Dr. Alex Sharma</span>
          </header>

          <main style={{ marginTop: '40px' }}>
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9f9f9', borderRadius: '12px' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Your Smile, Our Passion</h2>
              <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto 24px' }}>
                Experience high-end dental care. Book appointments and scan clinical records instantly via WhatsApp.
              </p>
              <a 
                href="https://wa.me/59816076644369" 
                target="_blank" 
                rel="noreferrer"
                style={{ display: 'inline-block', padding: '14px 28px', background: '#25D366', color: '#fff', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem' }}
              >
                💬 Chat & Book Now via WhatsApp
              </a>
            </div>

            <section style={{ marginTop: '50px' }}>
              <h3>Our Services & Transparent Pricing</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                  <h4>General Consultation</h4>
                  <p style={{ color: '#666' }}>Comprehensive dental examination and personalized care plan.</p>
                  <strong style={{ fontSize: '1.2rem' }}>500 INR</strong>
                </div>
              </div>
            </section>
          </main>
        </div>
      )}

      {/* ========================================= */}
      {/* VIEW 2: DGOS STAFF ADMINISTRATIVE PORTAL  */}
      {/* ========================================= */}
      {isAdminMode && (
        <div>
          {/* THE RESTORED DARK BLUE NAVIGATION BAR */}
          <nav style={{ background: '#2B2D61', color: 'white', padding: '0 24px', display: 'flex', alignItems: 'center', height: '60px', gap: '30px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', letterSpacing: '1px', marginRight: '20px' }}>DGOS PLATFORM</h2>
            
            {['CEO Dock', 'Clinical Engine', 'Reception Desk', 'Financial Ledger'].map(tab => (
              <span 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                style={{ cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center', fontWeight: activeTab === tab ? 'bold' : 'normal', borderBottom: activeTab === tab ? '3px solid white' : '3px solid transparent' }}
              >
                {tab}
              </span>
            ))}
            
            <button 
              onClick={() => setActiveTab('Growth & Sales')}
              style={{ marginLeft: 'auto', background: activeTab === 'Growth & Sales' ? '#fff' : '#f0f0f0', color: '#2B2D61', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
            >
              Growth & Sales
            </button>
          </nav>

          {/* DASHBOARD CONTENT BODY */}
          <main style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', color: '#111' }}>{activeTab} Hub</h2>
                <p style={{ margin: 0, color: '#666' }}>Enterprise PRM, Referral Tracker, and Lead CRM.</p>
              </div>
              <button style={{ background: '#ebf4ff', color: '#0066cc', border: '1px solid #cce0ff', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                🔄 Refresh Live Pipeline
              </button>
            </div>

            {/* METRICS CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <p style={{ margin: '0 0 8px 0', color: '#888', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Pipeline Value</p>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>₹0</h3>
                <p style={{ margin: 0, color: '#0066cc', fontSize: '0.9rem' }}>Active Unconverted Prospects</p>
              </div>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <p style={{ margin: '0 0 8px 0', color: '#888', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Blended Acquisition Cost (CAC)</p>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '2rem', color: '#00b36b' }}>₹840</h3>
                <p style={{ margin: 0, color: '#00b36b', fontSize: '0.9rem' }}>Optimal Target Zone (Under ₹1200)</p>
              </div>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <p style={{ margin: '0 0 8px 0', color: '#888', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Gateway Intelligence</p>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: '#0066cc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#0066cc', borderRadius: '50%', display: 'inline-block' }}></span>
                  🧠 Llama Vision Active
                </h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Radiology image parsing online.</p>
              </div>
            </div>
            
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#aaa', fontStyle: 'italic' }}>No inbound leads captured yet. Send a WhatsApp to begin!</p>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}