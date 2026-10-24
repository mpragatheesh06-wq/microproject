/* =========================================================
   SMARTROUTE — SUPABASE CLIENT & BACKEND DATA ABSTRACTION
   ========================================================= */

// Supabase configuration credentials (Users can replace these with real Supabase credentials)
const SUPABASE_CONFIG = {
  url: localStorage.getItem('smartroute_supabase_url') || 'https://xyzcompany.supabase.co',
  anonKey: localStorage.getItem('smartroute_supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  isConfigured: () => !!(localStorage.getItem('smartroute_supabase_url') && localStorage.getItem('smartroute_supabase_key'))
};

// Unified Data Service API with localStorage + Supabase Dual-Mode Support
const SmartBackend = {
  // Check backend status
  getStatus() {
    return {
      connected: SUPABASE_CONFIG.isConfigured(),
      mode: SUPABASE_CONFIG.isConfigured() ? 'Supabase Cloud DB' : 'Local Mock DB (LocalStorage)'
    };
  },

  // HOSPITALS
  async getHospitals() {
    if (SUPABASE_CONFIG.isConfigured() && window.supabase) {
      try {
        const client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        const { data, error } = await client.from('hospitals').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase fetch failed, falling back to local DB:', e);
      }
    }
    return JSON.parse(localStorage.getItem('smartroute_hospitals') || '[]');
  },

  async saveHospital(hospitalData) {
    let hospitals = JSON.parse(localStorage.getItem('smartroute_hospitals') || '[]');
    if (hospitalData.id) {
      const idx = hospitals.findIndex(h => h.id === hospitalData.id);
      if (idx !== -1) hospitals[idx] = hospitalData;
      else hospitals.push(hospitalData);
    } else {
      hospitalData.id = 'h-' + Date.now();
      hospitals.push(hospitalData);
    }
    localStorage.setItem('smartroute_hospitals', JSON.stringify(hospitals));

    if (SUPABASE_CONFIG.isConfigured() && window.supabase) {
      try {
        const client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        await client.from('hospitals').upsert([hospitalData]);
      } catch (e) {
        console.warn('Supabase upsert error:', e);
      }
    }
    return hospitalData;
  },

  // INCIDENTS
  async createIncident(incident) {
    let incidents = JSON.parse(localStorage.getItem('smartroute_incidents') || '[]');
    incidents.unshift(incident);
    localStorage.setItem('smartroute_incidents', JSON.stringify(incidents));

    if (SUPABASE_CONFIG.isConfigured() && window.supabase) {
      try {
        const client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        await client.from('incidents').insert([incident]);
      } catch (e) {
        console.warn('Supabase incident insert error:', e);
      }
    }
    return incident;
  },

  async updateIncidentHospital(incidentId, selectedHospital) {
    let incidents = JSON.parse(localStorage.getItem('smartroute_incidents') || '[]');
    const inc = incidents.find(i => i.id === incidentId);
    if (inc) {
      inc.selectedHospital = selectedHospital.name;
      inc.hospitalId = selectedHospital.id;
      inc.rerouted = true;
      inc.updatedAt = new Date().toISOString();
      localStorage.setItem('smartroute_incidents', JSON.stringify(incidents));
    }

    if (SUPABASE_CONFIG.isConfigured() && window.supabase) {
      try {
        const client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        await client.from('incidents').update({
          selected_hospital_id: selectedHospital.id,
          rerouted: true
        }).eq('ticket_code', incidentId);
      } catch (e) {
        console.warn('Supabase incident update error:', e);
      }
    }
    return inc;
  }
};

window.SmartBackend = SmartBackend;
