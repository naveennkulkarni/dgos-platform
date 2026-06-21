"use client";

import { useState, useEffect } from "react";

export default function Dashboard() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  
  // Form States
  const [clinicName, setClinicName] = useState("");
  const [patientFirstName, setPatientFirstName] = useState("");
  const [patientLastName, setPatientLastName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");

  const loadData = async () => {
    try {
      const clinicRes = await fetch("http://localhost:3000/clinics");
      const patientRes = await fetch("http://localhost:3000/patients");
      
      if (clinicRes.ok) setClinics(await clinicRes.json());
      if (patientRes.ok) setPatients(await patientRes.json());
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">Dental Growth OS</h1>
          <p className="text-gray-500">Practice Management Dashboard</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Clinics</h2>
            
            <form onSubmit={handleCreateClinic} className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="Clinic Name (e.g. Downtown Dental)" 
                className="flex-1 border p-2 rounded text-gray-800"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                required
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Add Clinic
              </button>
            </form>

            <div className="border rounded overflow-hidden">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3">Clinic Name</th>
                    <th className="p-3">Tenant ID</th>
                  </tr>
                </thead>
                <tbody>
                  {clinics.map((clinic) => (
                    <tr key={clinic.id} className="border-t">
                      <td className="p-3 font-medium">{clinic.name}</td>
                      <td className="p-3 text-gray-500">{clinic.tenantId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Patients</h2>
            
            <form onSubmit={handleCreatePatient} className="flex flex-col gap-2 mb-6">
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="First Name" className="flex-1 border p-2 rounded text-gray-800"
                  value={patientFirstName} onChange={(e) => setPatientFirstName(e.target.value)} required
                />
                <input 
                  type="text" placeholder="Last Name" className="flex-1 border p-2 rounded text-gray-800"
                  value={patientLastName} onChange={(e) => setPatientLastName(e.target.value)} required
                />
              </div>
              <div className="flex gap-2">
                <input 
                  type="tel" placeholder="Phone Number" className="flex-1 border p-2 rounded text-gray-800"
                  value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} required
                />
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Add Patient
                </button>
              </div>
            </form>

            <div className="border rounded overflow-hidden">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id} className="border-t">
                      <td className="p-3 font-medium">{patient.firstName} {patient.lastName}</td>
                      <td className="p-3 text-gray-500">{patient.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}