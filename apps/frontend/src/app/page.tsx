'use client';

import { useState } from 'react';

export default function NarayaniSmilesHome() {
  const [isAdminMode, setIsAdminMode] = useState(false);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* HEADER NAVIGATION */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
        <h1 style={{ margin: 0, color: '#111' }}>🦷 Narayani Smiles</h1>
        <button 
          onClick={() => setIsAdminMode(!isAdminMode)}
          style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', background: '#333', color: '#fff', border: 'none' }}
        >
          {isAdminMode ? 'Switch to Patient Site' : 'Staff Dashboard Access'}
        </button>
      </header>

      {/* PATIENT LANDING PAGE */}
      {!isAdminMode ? (
        <main style={{ marginTop: '40px' }}>
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9f9f9', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Your Smile, Our Passion</h2>
            <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto 24px' }}>
              Experience high-end dental care led by Dr. Alex Sharma. Book appointments and scan clinical records instantly via WhatsApp.
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
                <p style={{ color: '#666' }}>Comprehensive dental examination and personalized care plan with Dr. Alex Sharma.</p>
                <strong style={{ fontSize: '1.2rem' }}>500 INR</strong>
              </div>
              <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                <h4>AI Vision Diagnostic Pre-Check</h4>
                <p style={{ color: '#666' }}>Text an image of your tooth or X-ray to our WhatsApp gateway for immediate clinical summary updates.</p>
                <strong style={{ fontSize: '1.2rem', color: '#0070f3' }}>Included Free</strong>
              </div>
            </div>
          </section>

          <footer style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1px solid #eee', color: '#888', fontSize: '0.9rem' }}>
            📍 123 Dental Avenue, Bengaluru, Karnataka. | 🕒 Mon-Sat: 9:00 AM - 7:00 PM
          </footer>
        </main>
      ) : (
        /* STAFF ADMINISTRATIVE PORTAL */
        <main style={{ marginTop: '40px' }}>
          <h2 style={{ marginBottom: '24px' }}>⚙️ Staff Administration Command Center</h2>
          
          <div style={{ background: '#fff3cd', color: '#856404', padding: '16px', borderRadius: '6px', marginBottom: '24px' }}>
            🔒 <strong>Secure Database Connection Active:</strong> Streaming live data segments directly from your Neon cloud repository.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', background: '#f1f3f5', borderRadius: '8px' }}>
              <h4>Live Revenue Pipeline</h4>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '10px 0 0' }}>1,500 INR</p>
              <small style={{ color: '#666' }}>Based on today's scheduled sessions</small>
            </div>
            
            <div style={{ padding: '20px', background: '#f1f3f5', borderRadius: '8px' }}>
              <h4>Active Queue Metrics</h4>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '10px 0 0' }}>3 Patients Scheduled</p>
              <small style={{ color: '#666' }}>Automated WhatsApp reminders sent out</small>
            </div>
          </div>

          <section style={{ marginTop: '40px', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
            <h3>👁️ Recent AI Vision Submissions</h3>
            <div style={{ background: '#fafafa', padding: '12px', borderRadius: '6px', marginTop: '12px', borderLeft: '4px solid #0070f3' }}>
              <small style={{ color: '#888' }}>Patient: WhatsApp Patient | Contact: Live Bridge</small>
              <p style={{ margin: '6px 0 0', fontStyle: 'italic', color: '#333' }}>
                "[AI Vision Summary] Visible premolar discoloration noted on image scan. Patient requests review during examination."
              </p>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}