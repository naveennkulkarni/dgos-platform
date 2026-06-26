"use client";

import React, { useEffect, useState } from 'react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  treatment: string;
  status: string;
  value: number;
  patient: Patient;
  doctor: Doctor;
}

export default function GrowthDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = () => {
    setIsLoading(true);
    fetch('http://localhost:3000/api/appointments/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Backend error:", data.error);
          setAppointments([]);
        } else {
          setAppointments(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setIsLoading(false);
      });
  };

  // Triggers the Backend OUTBOUND Bridge
  const markCompleted = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' })
      });
      fetchAppointments();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* NAVIGATION BAR */}
      <nav className="bg-[#2a266b] text-white py-4 px-8 flex items-center gap-8 shadow-md">
        <div className="font-black text-xl tracking-wider uppercase">DGOS Platform</div>
        <div className="flex gap-6 items-center font-semibold text-sm ml-4">
          <button className="hover:text-blue-200 transition-colors">CEO Dock</button>
          <button className="hover:text-blue-200 transition-colors">Clinical Engine</button>
          <button className="hover:text-blue-200 transition-colors">Reception Desk</button>
          <button className="hover:text-blue-200 transition-colors">Financial Ledger</button>
          <button className="bg-white text-[#2a266b] px-4 py-2 rounded shadow-sm hover:bg-gray-100 transition-colors">
            Growth & Sales
          </button>
        </div>
      </nav>

      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Growth & Patient Acquisition Hub</h1>
            <p className="text-slate-500 text-sm mt-1">Enterprise PRM, Referral Tracker, and Lead CRM.</p>
          </div>
          <button 
            onClick={fetchAppointments}
            className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center gap-2"
          >
            <span>🔄</span> Refresh Live Pipeline
          </button>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Total Pipeline Value</h3>
            <div className="text-3xl font-bold text-slate-800">
              ₹{appointments.reduce((sum, apt) => sum + (apt.value || 0), 0).toLocaleString()}
            </div>
            <p className="text-blue-600 text-sm font-medium mt-2">Active Unconverted Prospects</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Blended Acquisition Cost (CAC)</h3>
            <div className="text-3xl font-bold text-emerald-600">₹840</div>
            <p className="text-emerald-600 text-sm font-medium mt-2">Optimal Target Zone (Under ₹1200)</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Gateway Intelligence</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-3 w-3 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-xl font-bold text-blue-700">🧠 Gemini AI Active</span>
            </div>
            <p className="text-slate-500 text-sm mt-2">Linguistic translation online.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-6">LIVE PATIENT HEATMAP PIPELINE</h3>
            
            {isLoading ? (
              <div className="text-center py-10 text-slate-400 animate-pulse">Syncing with Gateway...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-10 text-slate-400 italic">No inbound leads captured yet. Send a WhatsApp to begin!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs text-slate-400 uppercase border-b border-slate-100">
                      <th className="pb-3 font-semibold">Patient Prospect</th>
                      <th className="pb-3 font-semibold">Date & Time</th>
                      <th className="pb-3 font-semibold">Clinical Intent</th>
                      <th className="pb-3 font-semibold">Assigned To</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="py-4 pr-4">
                          <div className="font-medium text-slate-800">
                            {apt.patient?.firstName} {apt.patient?.lastName}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 font-mono">
                            {apt.patient?.phone.replace('@c.us', '').replace('@lid', '')}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="text-sm font-medium text-slate-700">{apt.date}</div>
                          <div className="text-xs font-semibold text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">
                            {apt.time}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">
                            {apt.treatment}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-slate-600 font-medium">
                          {apt.doctor?.name}
                        </td>
                        <td className="py-4 pl-4 text-right">
                          {apt.status === 'Completed' ? (
                            <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">
                              Completed ✓
                            </span>
                          ) : (
                            <button 
                              onClick={() => markCompleted(apt.id)}
                              className="text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all shadow-sm"
                            >
                              Mark Completed
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-fit">
            <h3 className="font-bold text-slate-800 mb-6 uppercase text-sm tracking-wider">Heatmap Legend</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded border border-slate-100">
                <div className="w-4 h-4 rounded bg-slate-200 border border-slate-300"></div>
                <span className="text-sm font-medium text-slate-700">1 Msg: Casual Inquiry</span>
              </div>
              <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded border border-yellow-100">
                <div className="w-4 h-4 rounded bg-yellow-400 border border-yellow-500"></div>
                <span className="text-sm font-medium text-yellow-800">2 Msgs: Warm Lead</span>
              </div>
              <div className="flex items-center gap-3 bg-orange-50 p-3 rounded border border-orange-100">
                <div className="w-4 h-4 rounded bg-orange-500 border border-orange-600"></div>
                <span className="text-sm font-medium text-orange-800">3 Msgs: Hot Prospect</span>
              </div>
              <div className="flex items-center gap-3 bg-red-50 p-3 rounded border border-red-100">
                <div className="w-4 h-4 rounded bg-red-600 border border-red-700"></div>
                <span className="text-sm font-medium text-red-800">4+ Msgs: URGENT / PAIN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}