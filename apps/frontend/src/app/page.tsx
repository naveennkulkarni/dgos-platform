"use client";

import { useState, useEffect } from "react";

// Standardized INR values for clinical procedures (for pipeline forecasting)
const TREATMENT_VALUES: Record<string, number> = {
  "General Consultation": 500,
  "Root Canal Treatment (RCT)": 4500,
  "Dental Implant Placement": 25000,
  "Smile Design / Veneers": 15000,
  "Orthodontic Aligners": 50000,
  "Scaling & Maintenance": 1500,
};

export default function Dashboard() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  // Existing Form States
  const [clinicName, setClinicName] = useState("");
  const [patientFirstName, setPatientFirstName] = useState("");
  const [patientLastName, setPatientLastName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");

  // Appointment Form States
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [treatmentType, setTreatmentType] = useState("General Consultation");
  const [appointmentStatus, setAppointmentStatus] = useState("Scheduled");

  const loadData = async () => {
    try {
      const clinicRes = await fetch("http://localhost:3000/clinics");
      const patientRes = await fetch("http://localhost:3000/patients");
      
      if (clinicRes.ok) setClinics(await clinicRes.json());
      if (patientRes.ok) {
        const data = await patientRes.json();
        setPatients(data);
        if (data.length > 0 && !selectedPatientId) {
          setSelectedPatientId(data[0].id);
        }
      }
      
      const localApps = localStorage.getItem("dgos_appointments");
      if (localApps) {
        setAppointments(JSON.parse(localApps));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedString = clinicName.toLowerCase().replace(/\s+/g, '-');
    
    await fetch("http://localhost:3000/clinics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: clinicName,
        slug: formattedString + "-" + Date.now(),
        tenantId: formattedString + "-tenant"
      }),
    });
    
    setClinicName("");
    loadData();
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clinics.length === 0) {
        alert("Please create a Clinic first!");
        return;
    }

    await fetch("http://localhost:3000/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: patientFirstName,
        lastName: patientLastName,
        phone: patientPhone,
        dateOfBirth: new Date("1990-01-01").toISOString(),
        clinicId: clinics[0].id
      }),
    });
    
    setPatientFirstName("");
    setPatientLastName("");
    setPatientPhone("");
    loadData();
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert("Please select or add a patient first!");
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    const newAppointment = {
      id: "app-" + Date.now(),
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient",
      patientPhone: patient ? patient.phone : "",
      date: appointmentDate,
      time: appointmentTime,
      treatment: treatmentType,
      value: TREATMENT_VALUES[treatmentType] || 0,
      status: appointmentStatus
    };

    const updatedAppointments = [newAppointment, ...appointments];
    setAppointments(updatedAppointments);
    localStorage.setItem("dgos_appointments", JSON.stringify(updatedAppointments));

    setAppointmentDate("");
    setAppointmentTime("");
  };

  // Calculate KPIs
  const totalPipelineValue = appointments.reduce((sum, app) => sum + (app.value || 0), 0);
  const averageTreatmentValue = appointments.length > 0 ? (totalPipelineValue / appointments.length) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dental Growth OS</h1>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Layer 3: Business Intelligence Cockpit</p>
          </div>
          <div className="mt-4 md:mt-0 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm">
            <span className="text-xs font-bold text-indigo-800 uppercase block text-center">System Status</span>
            <span className="text-sm font-bold text-indigo-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> All Systems Operational
            </span>
          </div>
        </header>

        {/* CEO KPI DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Pipeline Value</p>
            <h3 className="text-3xl font-black text-gray-800 mt-1">₹{totalPipelineValue.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-green-600 font-bold mt-2 bg-green-50 w-max px-2 py-1 rounded">Live Forecast</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Patient Base</p>
            <h3 className="text-3xl font-black text-gray-800 mt-1">{patients.length}</h3>
            <p className="text-xs text-blue-600 font-bold mt-2 bg-blue-50 w-max px-2 py-1 rounded">Registered</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Scheduled Treatments</p>
            <h3 className="text-3xl font-black text-gray-800 mt-1">{appointments.length}</h3>
            <p className="text-xs text-purple-600 font-bold mt-2 bg-purple-50 w-max px-2 py-1 rounded">In Queue</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Avg. Treatment Value</p>
            <h3 className="text-3xl font-black text-gray-800 mt-1">₹{averageTreatmentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
            <p className="text-xs text-orange-600 font-bold mt-2 bg-orange-50 w-max px-2 py-1 rounded">Per Appointment</p>
          </div>
        </div>

        {/* OPERATIONAL BLOCK */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-black uppercase text-gray-800 border-b pb-3 mb-4">1. Clinic Entities</h2>
            <form onSubmit={handleCreateClinic} className="flex gap-2 mb-4">
              <input 
                type="text" placeholder="Clinic Name" className="flex-1 border border-gray-300 p-2 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={clinicName} onChange={(e) => setClinicName(e.target.value)} required
              />
              <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 font-bold transition">Add</button>
            </form>
            <div className="border border-gray-100 rounded-lg max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 font-bold text-gray-500 uppercase tracking-wider border-b">Clinic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {clinics.map((clinic) => (
                    <tr key={clinic.id} className="hover:bg-gray-50">
                      <td className="p-3 font-semibold">{clinic.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-black uppercase text-gray-800 border-b pb-3 mb-4">2. Patient Acquisition</h2>
            <form onSubmit={handleCreatePatient} className="space-y-3 mb-4">
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="First Name" className="flex-1 border border-gray-300 p-2 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={patientFirstName} onChange={(e) => setPatientFirstName(e.target.value)} required
                />
                <input 
                  type="text" placeholder="Last Name" className="flex-1 border border-gray-300 p-2 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={patientLastName} onChange={(e) => setPatientLastName(e.target.value)} required
                />
              </div>
              <div className="flex gap-2">
                <input 
                  type="tel" placeholder="Phone Number" className="flex-1 border border-gray-300 p-2 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} required
                />
                <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 font-bold transition">Register</button>
              </div>
            </form>
            <div className="border border-gray-100 rounded-lg max-h-40 overflow-y-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <tbody className="divide-y divide-gray-50">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="p-3 font-semibold">{patient.firstName} {patient.lastName}</td>
                      <td className="p-3 text-gray-500">{patient.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 ring-1 ring-indigo-50">
            <h2 className="text-sm font-black uppercase text-indigo-900 border-b pb-3 mb-4">3. Production Engine (Book Slot)</h2>
            <form onSubmit={handleCreateAppointment} className="space-y-3">
              <div>
                <select 
                  className="w-full border border-gray-300 p-2 rounded-lg text-sm text-gray-800 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} required
                >
                  {patients.length === 0 && <option value="">Select a registered patient...</option>}
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} • {p.phone}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <input 
                  type="date" className="flex-1 border border-gray-300 p-2 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required
                />
                <input 
                  type="time" className="flex-1 border border-gray-300 p-2 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} required
                />
              </div>
              <div>
                <select 
                  className="w-full border border-gray-300 p-2 rounded-lg text-sm text-gray-800 bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  value={treatmentType} onChange={(e) => setTreatmentType(e.target.value)}
                >
                  {Object.keys(TREATMENT_VALUES).map(treatment => (
                    <option key={treatment} value={treatment}>{treatment} (₹{TREATMENT_VALUES[treatment].toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg text-sm font-black hover:bg-indigo-700 transition shadow-md mt-2">
                Secure Slot & Add to Pipeline
              </button>
            </form>
          </div>

        </div>

        {/* REAL-TIME MATRIX */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-black uppercase text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Live Production Matrix
          </h2>
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 border-b">Patient</th>
                  <th className="p-4 border-b">Schedule</th>
                  <th className="p-4 border-b">Clinical Focus</th>
                  <th className="p-4 border-b text-right">Projected Value (INR)</th>
                  <th className="p-4 border-b text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-gray-900">
                      {app.patientName}
                      <span className="block text-xs text-gray-500 font-normal">{app.patientPhone}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-gray-800">{app.date}</span>
                      <span className="block text-xs font-bold text-indigo-600">{app.time}</span>
                    </td>
                    <td className="p-4 font-medium text-gray-700">{app.treatment}</td>
                    <td className="p-4 font-black text-green-700 text-right">₹{(app.value || 0).toLocaleString('en-IN')}</td>
                    <td className="p-4 text-center">
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider border border-indigo-100">
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-400 font-medium bg-gray-50/50">
                      No treatments scheduled. Book an appointment above to populate the pipeline.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}