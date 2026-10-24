/* ===================================
   SMARTROUTE — ADMIN DASHBOARD SCRIPT
   =================================== */

// Default initial data for Hospitals
const INITIAL_HOSPITALS = [
  { id: 'h1', name: 'Central General Hospital', address: '102 Healthcare Boulevard, Central Zone', lat: '12.9716', lng: '77.5946', phone: '+91 98765 00001', beds: 14, icu: 'Yes', status: 'active', type: 'Trauma Center', spec: 'Trauma, Cardiology, ICU' },
  { id: 'h2', name: 'City Medical Center', address: '45 Station Road, North District', lat: '12.9820', lng: '77.6010', phone: '+91 98765 00002', beds: 8, icu: 'Yes', status: 'active', type: 'General Hospital', spec: 'General Medicine, Surgery' },
  { id: 'h3', name: 'Apollo Multi-Specialty Hospital', address: '88 Tech Park Way, East Avenue', lat: '12.9550', lng: '77.6320', phone: '+91 98765 00003', beds: 5, icu: 'Yes', status: 'partial', type: 'Specialty Care', spec: 'Neurology, Oncology, Pediatrics' },
  { id: 'h4', name: 'St. Jude Emergency Clinic', address: '12 Riverbank Road, South Ward', lat: '12.9300', lng: '77.5800', phone: '+91 98765 00004', beds: 2, icu: 'No', status: 'full', type: 'Emergency Only', spec: 'First Response, Triage' }
];

// Default initial Ambulances
const INITIAL_AMBULANCES = [
  { id: 'AMB-101', driver: 'Rajesh Kumar', phone: '+91 98111 00001', status: 'Available', assignment: 'Station 1 - Central', kitLoaded: 'Cardiac & Trauma Kit' },
  { id: 'AMB-102', driver: 'Vikram Singh', phone: '+91 98111 00002', status: 'Busy', assignment: 'INC-4082 (En route)', kitLoaded: 'Burn & Fracture Kit' },
  { id: 'AMB-103', driver: 'Suresh Patel', phone: '+91 98111 00003', status: 'Available', assignment: 'Station 3 - North', kitLoaded: 'Universal First-Aid Pack' },
  { id: 'AMB-104', driver: 'Anita Roy', phone: '+91 98111 00004', status: 'Maintenance', assignment: 'Depot Repair Shop', kitLoaded: 'Restocking Needed' }
];

// Default initial Emergency Incidents
const INITIAL_INCIDENTS = [
  {
    id: 'INC-4082',
    patientName: 'Ramesh Sharma',
    age: '42',
    gender: 'Male',
    bloodGroup: 'O+',
    contact: '+91 98450 12345',
    emergencyType: 'accident',
    diseaseName: 'Two-Wheeler Collision & Leg Fracture',
    severity: 'critical',
    notes: 'Severe bleeding from right leg. Patient conscious.',
    location: 'MG Road Junction, near Metro Pillar 42',
    assignedAmbulance: 'City Ambulance #2',
    assignedHospital: 'Central General Hospital',
    timestamp: '10:42 AM',
    status: 'Dispatched'
  },
  {
    id: 'INC-4081',
    patientName: 'Priya Sundaram',
    age: '58',
    gender: 'Female',
    bloodGroup: 'B+',
    contact: '+91 98450 67890',
    emergencyType: 'cardiac',
    diseaseName: 'Acute Chest Pain & Breathlessness',
    severity: 'high',
    notes: 'History of hypertension. Requested cardiac oxygen unit.',
    location: '2nd Cross, Indiranagar',
    assignedAmbulance: 'City Ambulance #5',
    assignedHospital: 'Apollo Multi-Specialty Hospital',
    timestamp: '10:15 AM',
    status: 'In Transit'
  },
  {
    id: 'INC-4080',
    patientName: 'Arun Verma',
    age: '24',
    gender: 'Male',
    bloodGroup: 'A+',
    contact: '+91 98450 99887',
    emergencyType: 'burns',
    diseaseName: 'Kitchen Flash Fire / Hand Burns',
    severity: 'medium',
    notes: 'First degree burn on left forearm.',
    location: 'Koramangala 4th Block',
    assignedAmbulance: 'City Ambulance #1',
    assignedHospital: 'City Medical Center',
    timestamp: '09:30 AM',
    status: 'Resolved'
  }
];

// First-Aid Kits Configuration Database
let KITS_DATA = {
  accident: ['Hemostatic Gauze & Trauma Dressings', 'Cervical Collar & Splints', 'Tourniquet & Pressure Bandages', 'Saline Wash & Antiseptic Wipes'],
  cardiac: ['Automated External Defibrillator (AED)', 'Portable Oxygen Cylinder & Mask', 'Aspirin & Nitroglycerin Support Kit', 'ECG Monitor Lead Set'],
  stroke: ['Supplemental Oxygen Therapy Kit', 'Blood Glucose Monitor & Strips', 'Blood Pressure & Pulse Oximeter', 'Suction Unit & Airway Tubes'],
  breathing: ['Nebulizer Machine & Inhalers', 'High-Flow Oxygen Mask Set', 'Suction Catheters & OPA/NPA Airways', 'Pulse Oximeter & Capnograph'],
  burns: ['Sterile Burn Sheets & Gel Dressings', 'Cooling Hydrogel Wraps', 'Analgesic Care Pack', 'IV Normal Saline Rehydration Kit'],
  fracture: ['Vacuum / Traction Splints Set', 'Rigid Cervical & Limb Immobilizers', 'Elastic Compression Wraps', 'Cold Compress Packs'],
  poisoning: ['Activated Charcoal Solution', 'Gastric Lavage / Suction Equipment', 'Toxin Antidote Emergency Kit', 'Oxygen Mask Pack'],
  allergic: ['EpiPen Auto-Injectors', 'Antihistamine & Corticosteroid Pack', 'High-Flow Nebulizer Mask', 'Airway Management Kit'],
  maternity: ['Sterile Emergency Delivery Pack', 'Umbilical Cord Clamps & Scissors', 'Infant Warm Blanket', 'Obstetric Towels & Pads'],
  other: ['Universal First-Aid Pack', 'Antiseptic & Bandage Variety Kit', 'Digital Vitals Monitor', 'Instant Cold / Hot Compress']
};

document.addEventListener('DOMContentLoaded', () => {
  // Navigation & Sidebar Toggle
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
  const dashSections = document.querySelectorAll('.dash-section');
  const sectionTitle = document.getElementById('sectionTitle');
  const dashTime = document.getElementById('dashTime');

  // Update real-time clock
  if (dashTime) {
    const updateTime = () => {
      dashTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  // Sidebar link switcher
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSec = link.getAttribute('data-section');

      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      dashSections.forEach(sec => sec.classList.remove('active'));
      const activeSec = document.getElementById(`section-${targetSec}`);
      if (activeSec) activeSec.classList.add('active');

      if (sectionTitle) {
        sectionTitle.textContent = link.querySelector('span').textContent;
      }

      if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove('open');
      }
    });
  });

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // ===================================
  // DATA STORAGE INIT
  // ===================================
  function getHospitals() {
    return JSON.parse(localStorage.getItem('smartroute_hospitals') || JSON.stringify(INITIAL_HOSPITALS));
  }
  function setHospitals(data) {
    localStorage.setItem('smartroute_hospitals', JSON.stringify(data));
    renderHospitals();
    updateDashboardStats();
  }

  function getAmbulances() {
    return JSON.parse(localStorage.getItem('smartroute_ambulances') || JSON.stringify(INITIAL_AMBULANCES));
  }
  function setAmbulances(data) {
    localStorage.setItem('smartroute_ambulances', JSON.stringify(data));
    renderAmbulances();
    updateDashboardStats();
  }

  function getIncidents() {
    return JSON.parse(localStorage.getItem('smartroute_incidents') || JSON.stringify(INITIAL_INCIDENTS));
  }
  function setIncidents(data) {
    localStorage.setItem('smartroute_incidents', JSON.stringify(data));
    renderIncidents();
    renderPatientRecords();
    updateDashboardStats();
  }

  // ===================================
  // HOSPITALS MANAGEMENT
  // ===================================
  const hospitalsGrid = document.getElementById('hospitalsGrid');
  const hospitalModal = document.getElementById('hospitalModal');
  const addHospitalBtn = document.getElementById('addHospitalBtn');
  const closeHospitalModal = document.getElementById('closeHospitalModal');
  const cancelHospital = document.getElementById('cancelHospital');
  const hospitalForm = document.getElementById('hospitalForm');

  function renderHospitals() {
    if (!hospitalsGrid) return;

    const hospitals = getHospitals();
    hospitalsGrid.innerHTML = '';

    hospitals.forEach(h => {
      const card = document.createElement('div');
      card.className = 'hosp-card';
      const statusBadgeClass = h.status === 'active' ? 'badge-open' : (h.status === 'partial' ? 'badge-partial' : 'badge-full');

      card.innerHTML = `
        <div class="hosp-card-header">
          <div>
            <div class="hosp-card-type">${h.type || 'Hospital'}</div>
            <div class="hosp-card-name">${h.name}</div>
          </div>
          <span class="badge ${statusBadgeClass}" style="text-transform:capitalize;">${h.status}</span>
        </div>
        <div class="hosp-card-body">
          <span>📍 <strong>Address:</strong> ${h.address}</span>
          <span>📞 <strong>Phone:</strong> ${h.phone}</span>
          <span>🛏️ <strong>ER Beds Available:</strong> <strong>${h.beds}</strong></span>
          <span>🫀 <strong>ICU Support:</strong> ${h.icu}</span>
          <span>🩺 <strong>Specialties:</strong> ${h.spec || 'Emergency & General'}</span>
        </div>
        <div class="hosp-card-actions">
          <button class="btn-icon" onclick="editHospital('${h.id}')">✏️ Edit</button>
          <button class="btn-icon danger" onclick="deleteHospital('${h.id}')">🗑️ Remove</button>
        </div>
      `;
      hospitalsGrid.appendChild(card);
    });
  }

  // Add / Edit Hospital Handlers
  if (addHospitalBtn) {
    addHospitalBtn.addEventListener('click', () => {
      document.getElementById('hospitalModalTitle').textContent = 'Add New Hospital';
      document.getElementById('editHospitalId').value = '';
      hospitalForm.reset();
      hospitalModal.style.display = 'flex';
    });
  }

  if (closeHospitalModal) closeHospitalModal.addEventListener('click', () => hospitalModal.style.display = 'none');
  if (cancelHospital) cancelHospital.addEventListener('click', () => hospitalModal.style.display = 'none');

  if (hospitalForm) {
    hospitalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('editHospitalId').value;
      const hospitals = getHospitals();

      const newHosp = {
        id: editId || 'h-' + Date.now(),
        name: document.getElementById('hospName').value,
        type: document.getElementById('hospType').value,
        address: document.getElementById('hospAddress').value,
        lat: document.getElementById('hospLat').value || '12.9716',
        lng: document.getElementById('hospLng').value || '77.5946',
        phone: document.getElementById('hospPhone').value || '+91 98765 00000',
        beds: parseInt(document.getElementById('hospBeds').value || '0', 10),
        icu: document.getElementById('hospICU').value,
        status: document.getElementById('hospStatus').value,
        spec: document.getElementById('hospSpec').value || 'Emergency Care'
      };

      if (editId) {
        const idx = hospitals.findIndex(h => h.id === editId);
        if (idx !== -1) hospitals[idx] = newHosp;
      } else {
        hospitals.push(newHosp);
      }

      setHospitals(hospitals);
      hospitalModal.style.display = 'none';
    });
  }

  window.editHospital = (id) => {
    const hospitals = getHospitals();
    const h = hospitals.find(item => item.id === id);
    if (!h) return;

    document.getElementById('hospitalModalTitle').textContent = 'Edit Hospital Details';
    document.getElementById('editHospitalId').value = h.id;
    document.getElementById('hospName').value = h.name;
    document.getElementById('hospType').value = h.type || 'general';
    document.getElementById('hospAddress').value = h.address;
    document.getElementById('hospLat').value = h.lat || '';
    document.getElementById('hospLng').value = h.lng || '';
    document.getElementById('hospPhone').value = h.phone || '';
    document.getElementById('hospBeds').value = h.beds || 0;
    document.getElementById('hospICU').value = h.icu || 'Yes';
    document.getElementById('hospStatus').value = h.status || 'active';
    document.getElementById('hospSpec').value = h.spec || '';

    hospitalModal.style.display = 'flex';
  };

  window.deleteHospital = (id) => {
    if (confirm('Are you sure you want to remove this hospital from the network?')) {
      const hospitals = getHospitals().filter(h => h.id !== id);
      setHospitals(hospitals);
    }
  };

  // ===================================
  // AMBULANCES FLEET MANAGEMENT
  // ===================================
  const ambTableBody = document.getElementById('ambTableBody');
  const addAmbBtn = document.getElementById('addAmbBtn');

  function renderAmbulances() {
    if (!ambTableBody) return;

    const ambulances = getAmbulances();
    ambTableBody.innerHTML = '';

    ambulances.forEach(a => {
      const tr = document.createElement('tr');
      const badgeClass = a.status === 'Available' ? 'badge-available' : (a.status === 'Busy' ? 'badge-busy' : 'badge-offline');

      tr.innerHTML = `
        <td class="td-strong">${a.id}</td>
        <td>${a.driver}</td>
        <td>${a.phone}</td>
        <td><span class="badge ${badgeClass}">${a.status}</span></td>
        <td>${a.assignment}</td>
        <td><span class="type-pill" style="margin:0">${a.kitLoaded}</span></td>
        <td>
          <button class="btn-icon" onclick="toggleAmbStatus('${a.id}')">🔄 Status</button>
          <button class="btn-icon danger" onclick="deleteAmb('${a.id}')">🗑️ Delete</button>
        </td>
      `;
      ambTableBody.appendChild(tr);
    });
  }

  if (addAmbBtn) {
    addAmbBtn.addEventListener('click', () => {
      const driver = prompt('Enter Ambulance Driver Name:');
      if (!driver) return;
      const phone = prompt('Enter Driver Phone Number:', '+91 98111 ');

      const ambulances = getAmbulances();
      const newAmb = {
        id: 'AMB-' + Math.floor(100 + Math.random() * 900),
        driver: driver,
        phone: phone || 'N/A',
        status: 'Available',
        assignment: 'Station Depot',
        kitLoaded: 'Universal First-Aid Pack'
      };
      ambulances.push(newAmb);
      setAmbulances(ambulances);
    });
  }

  window.toggleAmbStatus = (id) => {
    const ambulances = getAmbulances();
    const amb = ambulances.find(a => a.id === id);
    if (!amb) return;

    const statuses = ['Available', 'Busy', 'Maintenance'];
    const currIdx = statuses.indexOf(amb.status);
    amb.status = statuses[(currIdx + 1) % statuses.length];
    setAmbulances(ambulances);
  };

  window.deleteAmb = (id) => {
    if (confirm('Remove ambulance unit from fleet?')) {
      const ambulances = getAmbulances().filter(a => a.id !== id);
      setAmbulances(ambulances);
    }
  };

  // ===================================
  // INCIDENTS & PATIENT RECORDS
  // ===================================
  const incidentTableBody = document.getElementById('incidentTableBody');
  const recentIncidents = document.getElementById('recentIncidents');
  const patientTableBody = document.getElementById('patientTableBody');
  const incidentFilter = document.getElementById('incidentFilter');
  const patientSearch = document.getElementById('patientSearch');

  function renderIncidents() {
    const incidents = getIncidents();
    const filterVal = incidentFilter ? incidentFilter.value : 'all';

    // Render Recent Incidents in Dashboard card
    if (recentIncidents) {
      recentIncidents.innerHTML = '';
      const topIncidents = incidents.slice(0, 4);

      topIncidents.forEach(inc => {
        const item = document.createElement('div');
        item.className = 'incident-item';
        item.onclick = () => showIncidentDetail(inc.id);

        item.innerHTML = `
          <div class="inc-sev ${inc.severity}"></div>
          <div class="inc-info">
            <strong>${inc.patientName || 'Anonymous'} (${inc.emergencyType})</strong>
            <span>📍 ${inc.location}</span>
          </div>
          <span class="inc-type-badge">${inc.status}</span>
          <span class="inc-time">${inc.timestamp}</span>
        `;
        recentIncidents.appendChild(item);
      });
    }

    // Render Incidents Table
    if (incidentTableBody) {
      incidentTableBody.innerHTML = '';
      const filtered = incidents.filter(i => filterVal === 'all' || i.severity === filterVal);

      filtered.forEach(inc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="td-strong">${inc.id}</td>
          <td>${inc.patientName || 'Anonymous'} (${inc.age || 'N/A'})</td>
          <td style="text-transform:capitalize">${inc.emergencyType}</td>
          <td><span class="badge badge-${inc.severity}" style="text-transform:capitalize">${inc.severity}</span></td>
          <td><strong class="text-red">${inc.bloodGroup || 'N/A'}</strong></td>
          <td style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${inc.location}</td>
          <td>${inc.assignedAmbulance}</td>
          <td><span class="badge badge-dispatched">${inc.status}</span></td>
          <td>
            <button class="btn-icon" onclick="showIncidentDetail('${inc.id}')">👁️ View</button>
            <button class="btn-icon danger" onclick="resolveIncident('${inc.id}')">✓ Resolve</button>
          </td>
        `;
        incidentTableBody.appendChild(tr);
      });
    }
  }

  if (incidentFilter) {
    incidentFilter.addEventListener('change', renderIncidents);
  }

  function renderPatientRecords() {
    if (!patientTableBody) return;

    const incidents = getIncidents();
    const query = (patientSearch ? patientSearch.value : '').toLowerCase();

    patientTableBody.innerHTML = '';

    const filtered = incidents.filter(i => {
      const name = (i.patientName || '').toLowerCase();
      const id = (i.id || '').toLowerCase();
      const type = (i.emergencyType || '').toLowerCase();
      return name.includes(query) || id.includes(query) || type.includes(query);
    });

    filtered.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="td-strong">${p.id}</td>
        <td>${p.patientName || 'Anonymous'}</td>
        <td>${p.age || 'N/A'}</td>
        <td>${p.gender || 'N/A'}</td>
        <td><strong class="text-red">${p.bloodGroup || 'N/A'}</strong></td>
        <td style="text-transform:capitalize">${p.emergencyType}</td>
        <td><span class="badge badge-${p.severity}" style="text-transform:capitalize">${p.severity}</span></td>
        <td>${p.contact || 'N/A'}</td>
        <td>${p.timestamp || 'Today'}</td>
        <td><span class="badge badge-active">${p.status || 'Active'}</span></td>
      `;
      patientTableBody.appendChild(tr);
    });
  }

  if (patientSearch) {
    patientSearch.addEventListener('input', renderPatientRecords);
  }

  // Incident detail modal
  const incidentModal = document.getElementById('incidentModal');
  const closeIncidentModal = document.getElementById('closeIncidentModal');
  const incidentDetailContent = document.getElementById('incidentDetailContent');

  if (closeIncidentModal) {
    closeIncidentModal.addEventListener('click', () => incidentModal.style.display = 'none');
  }

  window.showIncidentDetail = (id) => {
    const incidents = getIncidents();
    const inc = incidents.find(i => i.id === id);
    if (!inc) return;

    incidentDetailContent.innerHTML = `
      <div class="detail-grid">
        <div class="detail-item"><span class="d-label">Ticket ID</span><span class="d-value">${inc.id}</span></div>
        <div class="detail-item"><span class="d-label">Patient Name</span><span class="d-value">${inc.patientName || 'Anonymous'}</span></div>
        <div class="detail-item"><span class="d-label">Age / Gender</span><span class="d-value">${inc.age || 'N/A'} / ${inc.gender || 'N/A'}</span></div>
        <div class="detail-item"><span class="d-label">Blood Group</span><span class="d-value text-red">${inc.bloodGroup || 'N/A'}</span></div>
        <div class="detail-item"><span class="d-label">Severity</span><span class="d-value text-red" style="text-transform:capitalize">${inc.severity}</span></div>
        <div class="detail-item"><span class="d-label">Contact</span><span class="d-value">${inc.contact || 'N/A'}</span></div>
        <div class="detail-item"><span class="d-label">Emergency Type</span><span class="d-value" style="text-transform:capitalize">${inc.emergencyType}</span></div>
        <div class="detail-item" style="grid-column: span 2"><span class="d-label">Disease / Incident Description</span><span class="d-value">${inc.diseaseName || 'N/A'}</span></div>
      </div>
      <hr style="border:none; border-top:1px solid var(--border); margin:16px 0;" />
      <div class="detail-grid">
        <div class="detail-item" style="grid-column: span 3"><span class="d-label">Patient Location</span><span class="d-value">📍 ${inc.location}</span></div>
        <div class="detail-item"><span class="d-label">Assigned Ambulance</span><span class="d-value text-blue">${inc.assignedAmbulance || 'City Ambulance #1'}</span></div>
        <div class="detail-item"><span class="d-label">Assigned Hospital</span><span class="d-value text-blue">${inc.assignedHospital || 'Central General Hospital'}</span></div>
        <div class="detail-item"><span class="d-label">Status</span><span class="d-value text-green">${inc.status}</span></div>
      </div>
      <hr style="border:none; border-top:1px solid var(--border); margin:16px 0;" />
      <div>
        <span class="d-label" style="display:block; margin-bottom:8px">First-Aid Kit Pre-Loaded in Ambulance:</span>
        <div class="kit-items">
          ${(inc.kitLoaded || ['Standard First Aid Kit']).map(k => `<div class="kit-item" style="font-size:0.85rem">✓ ${k}</div>`).join('')}
        </div>
      </div>
    `;

    incidentModal.style.display = 'flex';
  };

  window.resolveIncident = (id) => {
    const incidents = getIncidents();
    const inc = incidents.find(i => i.id === id);
    if (inc) {
      inc.status = 'Resolved';
      setIncidents(incidents);
    }
  };

  // ===================================
  // FORM CONFIGURATION MANAGEMENT
  // ===================================
  const configFieldsContainer = document.getElementById('configFields');
  const saveFormConfigBtn = document.getElementById('saveFormConfig');

  const defaultFieldsConfig = {
    bloodGroup: true,
    age: true,
    gender: true,
    contactNumber: true,
    diseaseName: true,
    severityLevel: true,
    additionalNotes: true
  };

  function renderFormConfig() {
    if (!configFieldsContainer) return;

    const savedConfig = JSON.parse(localStorage.getItem('smartroute_form_config') || 'null') || { fields: defaultFieldsConfig };

    const fieldLabels = {
      bloodGroup: 'Blood Group Field',
      age: 'Age Field',
      gender: 'Gender Field',
      contactNumber: 'Phone / Contact Field',
      diseaseName: 'Disease / Accident Details',
      severityLevel: 'Severity Level Selector',
      additionalNotes: 'Additional Notes Textarea'
    };

    configFieldsContainer.innerHTML = '';

    Object.keys(fieldLabels).forEach(key => {
      const isChecked = savedConfig.fields[key] !== false;
      const item = document.createElement('div');
      item.className = 'config-field-item';

      item.innerHTML = `
        <div>
          <div class="config-field-name">${fieldLabels[key]}</div>
          <div class="config-field-required">User Portal Field</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="config_field_${key}" ${isChecked ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      `;
      configFieldsContainer.appendChild(item);
    });
  }

  if (saveFormConfigBtn) {
    saveFormConfigBtn.addEventListener('click', () => {
      const fields = {
        bloodGroup: document.getElementById('config_field_bloodGroup')?.checked ?? true,
        age: document.getElementById('config_field_age')?.checked ?? true,
        gender: document.getElementById('config_field_gender')?.checked ?? true,
        contactNumber: document.getElementById('config_field_contactNumber')?.checked ?? true,
        diseaseName: document.getElementById('config_field_diseaseName')?.checked ?? true,
        severityLevel: document.getElementById('config_field_severityLevel')?.checked ?? true,
        additionalNotes: document.getElementById('config_field_additionalNotes')?.checked ?? true
      };

      const title = document.getElementById('portalTitle')?.value || 'Request Emergency Help';
      const subtitle = document.getElementById('portalSubtitle')?.value || 'Fill in what you know.';
      const hotline = document.getElementById('emergencyHotline')?.value || '108';

      const config = { fields, title, subtitle, hotline };
      localStorage.setItem('smartroute_form_config', JSON.stringify(config));

      alert('Form Configuration Saved Successfully! User portal layout updated.');
    });
  }

  // ===================================
  // FIRST-AID KITS MANAGEMENT
  // ===================================
  const kitMgmtGrid = document.getElementById('kitMgmtGrid');
  const saveKitConfigBtn = document.getElementById('saveKitConfig');

  function renderKitManagement() {
    if (!kitMgmtGrid) return;

    const savedKits = JSON.parse(localStorage.getItem('smartroute_kits') || JSON.stringify(KITS_DATA));
    KITS_DATA = savedKits;

    kitMgmtGrid.innerHTML = '';

    Object.keys(savedKits).forEach(type => {
      const card = document.createElement('div');
      card.className = 'kit-card';

      let itemsHtml = savedKits[type].map((item, idx) => `
        <div class="kit-edit-item">
          <input type="text" value="${item}" data-type="${type}" data-idx="${idx}" class="kit-item-input" />
          <button type="button" class="kit-del-btn" onclick="removeKitItem('${type}', ${idx})">✕</button>
        </div>
      `).join('');

      card.innerHTML = `
        <div class="kit-card-header">
          <div class="kit-card-icon">🧰</div>
          <h4 style="text-transform:capitalize">${type} Kit</h4>
        </div>
        <div class="kit-items-list" id="kit_list_${type}">
          ${itemsHtml}
        </div>
        <button type="button" class="kit-add-item" onclick="addKitItem('${type}')">+ Add Kit Item</button>
      `;
      kitMgmtGrid.appendChild(card);
    });
  }

  window.addKitItem = (type) => {
    KITS_DATA[type] = KITS_DATA[type] || [];
    KITS_DATA[type].push('New Medical Supply Item');
    localStorage.setItem('smartroute_kits', JSON.stringify(KITS_DATA));
    renderKitManagement();
  };

  window.removeKitItem = (type, idx) => {
    if (KITS_DATA[type]) {
      KITS_DATA[type].splice(idx, 1);
      localStorage.setItem('smartroute_kits', JSON.stringify(KITS_DATA));
      renderKitManagement();
    }
  };

  if (saveKitConfigBtn) {
    saveKitConfigBtn.addEventListener('click', () => {
      // Gather inputs
      document.querySelectorAll('.kit-item-input').forEach(inp => {
        const type = inp.getAttribute('data-type');
        const idx = parseInt(inp.getAttribute('data-idx'), 10);
        if (KITS_DATA[type] && KITS_DATA[type][idx] !== undefined) {
          KITS_DATA[type][idx] = inp.value;
        }
      });

      localStorage.setItem('smartroute_kits', JSON.stringify(KITS_DATA));
      alert('First-Aid Kit configurations saved!');
    });
  }

  // Update dashboard stat counters
  function updateDashboardStats() {
    const activeStat = document.getElementById('statActive');
    const hospStat = document.getElementById('statHospitals');
    const ambStat = document.getElementById('statAmb');
    const totalStat = document.getElementById('statTotal');
    const incidentBadge = document.getElementById('incidentBadge');

    const incidents = getIncidents();
    const active = incidents.filter(i => i.status !== 'Resolved').length;

    if (activeStat) activeStat.textContent = active;
    if (incidentBadge) incidentBadge.textContent = active;
    if (hospStat) hospStat.textContent = getHospitals().length;
    if (ambStat) ambStat.textContent = getAmbulances().filter(a => a.status === 'Available').length;
    if (totalStat) totalStat.textContent = incidents.length + 44; // Total count including archives
  }

  // Initial render calls
  renderHospitals();
  renderAmbulances();
  renderIncidents();
  renderPatientRecords();
  renderFormConfig();
  renderKitManagement();
  updateDashboardStats();
});
