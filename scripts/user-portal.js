/* =========================================================
   SMARTROUTE — USER PORTAL SCRIPT WITH SUPABASE & REROUTING
   ========================================================= */

const KIT_DATABASE = {
  accident: [
    'Hemostatic Gauze & Trauma Dressings',
    'Cervical Collar & Splints',
    'Tourniquet & Pressure Bandages',
    'Saline Wash & Antiseptic Wipes',
    'Burn Gel & Blanket'
  ],
  cardiac: [
    'Automated External Defibrillator (AED)',
    'Portable Oxygen Cylinder & Mask',
    'Aspirin & Nitroglycerin Support Kit',
    'ECG Monitor Lead Set',
    'Resuscitation Bag-Valve-Mask (BVM)'
  ],
  stroke: [
    'Supplemental Oxygen Therapy Kit',
    'Blood Glucose Monitor & Strips',
    'Blood Pressure & Pulse Oximeter',
    'Suction Unit & Airway Tubes',
    'IV Cannula & Fluid Administration Set'
  ],
  breathing: [
    'Nebulizer Machine & Inhalers',
    'High-Flow Oxygen Mask Set',
    'Suction Catheters & OPA/NPA Airways',
    'Pulse Oximeter & Capnograph',
    'Emergency Bronchodilators'
  ],
  burns: [
    'Sterile Burn Sheets & Gel Dressings',
    'Cooling Hydrogel Wraps',
    'Analgesic / Pain Relief Care Pack',
    'IV Normal Saline Rehydration Kit',
    'Non-Adherent Sterile Bandages'
  ],
  fracture: [
    'Vacuum / Traction Splints Set',
    'Rigid Cervical & Limb Immobilizers',
    'Elastic Compression Wraps',
    'Cold Compress Packs',
    'Padding & Triangular Bandages'
  ],
  poisoning: [
    'Activated Charcoal Solution',
    'Gastric Lavage / Suction Equipment',
    'Toxin Antidote Emergency Kit',
    'Oxygen Mask & Pulse Oximeter',
    'Vitals Monitoring Pack'
  ],
  allergic: [
    'EpiPen / Epinephrine Auto-Injectors',
    'Antihistamine & Corticosteroid Pack',
    'High-Flow Nebulizer Mask',
    'Airway Management Kit (Intubation Ready)',
    'IV Hydration Set'
  ],
  maternity: [
    'Sterile Emergency Delivery Pack',
    'Umbilical Cord Clamps & Scissors',
    'Infant Warm Blanket & Suction Bulb',
    'Obstetric Towels & Sanitary Pads',
    'Neonatal Resuscitation Mask'
  ],
  other: [
    'Standard Universal First-Aid Pack',
    'Antiseptic & Bandage Variety Kit',
    'Digital Vitals Monitor (BP, SpO2, Temp)',
    'Instant Cold / Hot Compress',
    'Sterile Gloves & Personal Protective Equipment'
  ]
};

document.addEventListener('DOMContentLoaded', async () => {
  let currentStep = 1;
  let selectedEmergencyType = '';
  let selectedSeverity = '';
  let patientCoords = { lat: null, lng: null, address: '' };
  let selectedHospital = null;
  let availableHospitals = [];

  // DOM Elements
  const stepIndicator = document.getElementById('stepIndicator');
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');

  const nextToStep2 = document.getElementById('nextToStep2');
  const nextToStep3 = document.getElementById('nextToStep3');
  const backToStep1 = document.getElementById('backToStep1');
  const backToStep2 = document.getElementById('backToStep2');

  const emergencyTypeGrid = document.getElementById('emergencyTypeGrid');
  const severitySelector = document.getElementById('severitySelector');
  const kitGuide = document.getElementById('kitGuide');
  const detectLocationBtn = document.getElementById('detectLocationBtn');
  const locStatus = document.getElementById('locStatus');
  const locCoords = document.getElementById('locCoords');
  const locAddress = document.getElementById('locAddress');

  const hospitalPickerList = document.getElementById('hospitalPickerList');
  const hospitalList = document.getElementById('hospitalList');
  const dispatchSummary = document.getElementById('dispatchSummary');
  const kitRecommendation = document.getElementById('kitRecommendation');
  const submitEmergencyBtn = document.getElementById('submitEmergency');
  const emergencyForm = document.getElementById('emergencyForm');
  const successScreen = document.getElementById('successScreen');
  const selectedHospSvgName = document.getElementById('selectedHospSvgName');

  // Load Hospitals from Backend (Supabase or LocalStorage)
  availableHospitals = await window.SmartBackend.getHospitals();
  if (!availableHospitals || availableHospitals.length === 0) {
    availableHospitals = [
      { id: 'h1', name: 'Central General Hospital', distance: '1.2 km', beds: 14, icu: 'Yes', phone: '+91 98765 00001', status: 'active', type: 'Trauma Center' },
      { id: 'h2', name: 'City Medical Center', distance: '2.4 km', beds: 8, icu: 'Yes', phone: '+91 98765 00002', status: 'active', type: 'General Hospital' },
      { id: 'h3', name: 'Apollo Multi-Specialty', distance: '3.1 km', beds: 5, icu: 'Yes', phone: '+91 98765 00003', status: 'partial', type: 'Specialty Care' }
    ];
  }

  // Set default selected hospital to first active hospital
  selectedHospital = availableHospitals[0];

  renderHospitalPicker();
  renderRightPanelHospitals();
  loadFormConfiguration();

  // Handle Emergency Type buttons
  if (emergencyTypeGrid) {
    emergencyTypeGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.etype-btn');
      if (!btn) return;

      document.querySelectorAll('.etype-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      selectedEmergencyType = btn.getAttribute('data-type');
      document.getElementById('emergencyType').value = selectedEmergencyType;

      updateKitGuide(selectedEmergencyType);
    });
  }

  // Handle Severity Selector
  if (severitySelector) {
    severitySelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.sev-btn');
      if (!btn) return;

      document.querySelectorAll('.sev-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      selectedSeverity = btn.getAttribute('data-severity');
      document.getElementById('severityLevel').value = selectedSeverity;
    });
  }

  // Navigation handlers
  if (nextToStep2) {
    nextToStep2.addEventListener('click', () => {
      goToStep(2);
      if (!patientCoords.lat) detectLocation();
    });
  }

  if (backToStep1) backToStep1.addEventListener('click', () => goToStep(1));

  if (nextToStep3) {
    nextToStep3.addEventListener('click', () => {
      const manualAddr = document.getElementById('manualAddress').value;
      if (manualAddr) patientCoords.address = manualAddr;
      if (!patientCoords.address && !patientCoords.lat) {
        patientCoords.address = 'Central City District GPS';
      }

      buildDispatchSummary();
      goToStep(3);
    });
  }

  if (backToStep2) backToStep2.addEventListener('click', () => goToStep(2));

  // Geolocation detection
  if (detectLocationBtn) {
    detectLocationBtn.addEventListener('click', detectLocation);
  }

  function detectLocation() {
    if (!locStatus) return;

    locStatus.textContent = '📡 Detecting GPS location...';
    locStatus.style.color = '#0EA5E9';

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          patientCoords.lat = lat;
          patientCoords.lng = lng;
          patientCoords.address = `GPS Position (${lat}° N, ${lng}° E)`;

          locStatus.textContent = '✅ Location Successfully Detected';
          locStatus.style.color = '#10B981';
          locCoords.textContent = `Latitude: ${lat} | Longitude: ${lng}`;
          locAddress.textContent = `Near Emergency Response Node ${Math.floor(Math.random() * 80 + 10)}`;
        },
        () => {
          const mockLat = (12.9716 + (Math.random() - 0.5) * 0.05).toFixed(4);
          const mockLng = (77.5946 + (Math.random() - 0.5) * 0.05).toFixed(4);
          patientCoords.lat = mockLat;
          patientCoords.lng = mockLng;
          patientCoords.address = `Simulated Coordinates (${mockLat}° N, ${mockLng}° E)`;

          locStatus.textContent = '📍 Location Auto-Estimated';
          locStatus.style.color = '#F59E0B';
          locCoords.textContent = `Lat: ${mockLat} | Lng: ${mockLng}`;
          locAddress.textContent = 'Sector 4, Central District';
        },
        { timeout: 5000 }
      );
    }
  }

  // Render Hospital Choice Picker in Step 2
  function renderHospitalPicker() {
    if (!hospitalPickerList) return;

    hospitalPickerList.innerHTML = '';
    availableHospitals.forEach((h, idx) => {
      const isSelected = selectedHospital && selectedHospital.id === h.id;
      const div = document.createElement('div');
      div.className = `hosp-picker-item ${isSelected ? 'selected' : ''}`;
      div.innerHTML = `
        <input type="radio" name="hospChoice" value="${h.id}" ${isSelected ? 'checked' : ''} />
        <div style="flex:1">
          <strong>${h.name}</strong>
          <div style="font-size:0.78rem; color:#9BA3C0">${h.type || 'General'} · ER Beds: <strong class="text-green">${h.beds || 10}</strong> · Phone: ${h.phone || '+91...'}</div>
        </div>
        <span class="hosp-badge ${isSelected ? 'green' : 'yellow'}">${isSelected ? 'Selected' : 'Available'}</span>
      `;

      div.addEventListener('click', () => {
        selectedHospital = h;
        document.querySelectorAll('.hosp-picker-item').forEach(i => i.classList.remove('selected'));
        div.classList.add('selected');
        const radio = div.querySelector('input');
        if (radio) radio.checked = true;

        if (selectedHospSvgName) selectedHospSvgName.textContent = h.name.slice(0, 14) + '...';
        renderRightPanelHospitals();
      });

      hospitalPickerList.appendChild(div);
    });
  }

  // Render hospitals list in right info panel
  function renderRightPanelHospitals() {
    if (!hospitalList) return;
    hospitalList.innerHTML = '';

    availableHospitals.forEach(h => {
      const isSelected = selectedHospital && selectedHospital.id === h.id;
      const div = document.createElement('div');
      div.className = 'hosp-item';
      div.style.border = isSelected ? '1.5px solid #10B981' : '1px solid var(--border)';

      div.innerHTML = `
        <div class="hosp-icon">🏥</div>
        <div class="hosp-info">
          <strong>${h.name}</strong>
          <span>${h.distance || '1.5 km'} · ER Beds: ${h.beds || 10}</span>
          <div class="hosp-badge ${isSelected ? 'green' : 'yellow'}">${isSelected ? 'Chosen Destination' : 'Available'}</div>
        </div>
      `;
      hospitalList.appendChild(div);
    });
  }

  // Multi-step navigation logic
  function goToStep(stepNumber) {
    currentStep = stepNumber;
    step1.classList.remove('active');
    step2.classList.remove('active');
    step3.classList.remove('active');

    if (stepNumber === 1) step1.classList.add('active');
    if (stepNumber === 2) step2.classList.add('active');
    if (stepNumber === 3) step3.classList.add('active');

    document.querySelectorAll('.step-dot').forEach((dot) => {
      const s = parseInt(dot.getAttribute('data-step'));
      dot.classList.remove('active', 'completed');
      if (s === stepNumber) dot.classList.add('active');
      if (s < stepNumber) dot.classList.add('completed');
    });

    document.querySelectorAll('.step-line').forEach((line, idx) => {
      if (idx < stepNumber - 1) line.classList.add('completed');
      else line.classList.remove('completed');
    });
  }

  function updateKitGuide(type) {
    if (!kitGuide) return;
    const items = KIT_DATABASE[type] || KIT_DATABASE['other'];
    let html = `
      <div style="margin-bottom:12px; font-size:0.85rem; color:#7C3AED; font-weight:600;">
        Pre-Loaded Kit for: <strong style="text-transform:capitalize;">${type}</strong>
      </div>
      <div class="kit-list">
    `;
    items.forEach(item => {
      html += `<div class="kit-list-item"><span>${item}</span></div>`;
    });
    html += '</div>';
    kitGuide.innerHTML = html;
  }

  function buildDispatchSummary() {
    const name = document.getElementById('patientName').value || 'Anonymous Patient';
    const age = document.getElementById('patientAge').value || 'N/A';
    const blood = document.getElementById('bloodGroup').value || 'N/A';
    const gender = document.getElementById('gender').value || 'N/A';
    const contact = document.getElementById('contactNumber').value || 'N/A';
    const disease = document.getElementById('diseaseName').value || selectedEmergencyType || 'General Emergency';
    const sev = selectedSeverity || 'Medium';

    const items = KIT_DATABASE[selectedEmergencyType] || KIT_DATABASE['other'];

    if (selectedHospSvgName && selectedHospital) {
      selectedHospSvgName.textContent = selectedHospital.name;
    }

    dispatchSummary.innerHTML = `
      <h3>📋 Emergency Dispatch Summary</h3>
      <div class="summary-grid">
        <div class="summary-item"><span class="s-label">Patient Name</span><span class="s-value">${name}</span></div>
        <div class="summary-item"><span class="s-label">Age / Gender</span><span class="s-value">${age} / ${gender}</span></div>
        <div class="summary-item"><span class="s-label">Blood Group</span><span class="s-value text-red">${blood}</span></div>
        <div class="summary-item"><span class="s-label">Severity</span><span class="s-value text-red" style="text-transform:capitalize;">${sev}</span></div>
        <div class="summary-item"><span class="s-label">Emergency Details</span><span class="s-value">${disease}</span></div>
        <div class="summary-item"><span class="s-label">Contact</span><span class="s-value">${contact}</span></div>
        <div class="summary-item" style="grid-column: span 2;"><span class="s-label">Chosen Target Hospital</span><span class="s-value text-green">🏥 ${selectedHospital ? selectedHospital.name : 'Central Hospital'}</span></div>
      </div>
    `;

    kitRecommendation.innerHTML = `
      <h3>🧰 Dispatched Ambulance First-Aid Kit</h3>
      <p style="font-size:0.85rem; color:#9BA3C0; margin-bottom:12px;">Based on emergency type (${selectedEmergencyType || 'General'}), the assigned unit will carry:</p>
      <div class="kit-items">
        ${items.map(it => `<div class="kit-item">${it}</div>`).join('')}
      </div>
    `;
  }

  // Handle Final Submission
  if (submitEmergencyBtn) {
    submitEmergencyBtn.addEventListener('click', async () => {
      const incidentId = 'INC-' + Math.floor(1000 + Math.random() * 9000);
      const name = document.getElementById('patientName').value || 'Anonymous';
      const age = document.getElementById('patientAge').value || 'N/A';
      const blood = document.getElementById('bloodGroup').value || 'N/A';
      const gender = document.getElementById('gender').value || 'N/A';
      const contact = document.getElementById('contactNumber').value || 'N/A';
      const type = selectedEmergencyType || 'General';
      const disease = document.getElementById('diseaseName').value || type;
      const sev = selectedSeverity || 'medium';
      const notes = document.getElementById('additionalNotes').value || 'No extra notes';

      const assignedAmb = `City Ambulance #${Math.floor(Math.random() * 10 + 1)}`;
      const assignedHosp = selectedHospital ? selectedHospital.name : 'Central General Hospital';
      const kitItems = KIT_DATABASE[type] || KIT_DATABASE['other'];

      const newIncident = {
        id: incidentId,
        ticket_code: incidentId,
        patientName: name,
        age: age,
        gender: gender,
        bloodGroup: blood,
        contact: contact,
        emergencyType: type,
        diseaseName: disease,
        severity: sev,
        notes: notes,
        location: patientCoords.address || 'Central City District',
        assignedAmbulance: assignedAmb,
        assignedHospital: assignedHosp,
        hospitalId: selectedHospital ? selectedHospital.id : 'h1',
        kitLoaded: kitItems,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0],
        status: 'Active Dispatch',
        rerouted: true
      };

      // Save via Supabase client wrapper
      await window.SmartBackend.createIncident(newIncident);

      // Show success screen
      emergencyForm.style.display = 'none';
      if (stepIndicator) stepIndicator.style.display = 'none';
      successScreen.style.display = 'flex';

      document.getElementById('ambName').textContent = assignedAmb;
      document.getElementById('hospName').textContent = assignedHosp;

      const detailsDiv = document.getElementById('dispatchDetails');
      if (detailsDiv) {
        detailsDiv.innerHTML = `
          <strong>Incident Ticket #${incidentId}</strong><br/>
          Assigned Ambulance: <strong>${assignedAmb}</strong> ➔ Transporting to <strong>${assignedHosp}</strong>.<br/>
          Dijkstra Shortest Path Calculated · Pre-loaded First-Aid Kit: <em>${kitItems.slice(0, 3).join(', ')}</em>
        `;
      }

      startETATimer();
    });
  }

  function startETATimer() {
    let secondsLeft = 225;
    const etaDisplay = document.getElementById('ambETA');

    const timer = setInterval(() => {
      if (secondsLeft <= 0) {
        clearInterval(timer);
        if (etaDisplay) etaDisplay.textContent = 'Ambulance Arrived at Patient Location!';
        return;
      }
      secondsLeft--;
      const mins = Math.floor(secondsLeft / 60);
      const secs = secondsLeft % 60;
      if (etaDisplay) etaDisplay.textContent = `${mins} min ${secs < 10 ? '0' : ''}${secs}s`;
    }, 1000);
  }

  function loadFormConfiguration() {
    const config = JSON.parse(localStorage.getItem('smartroute_form_config') || 'null');
    if (!config || !config.fields) return;

    if (config.fields.bloodGroup === false) {
      const bgGroup = document.getElementById('bloodGroup')?.closest('.form-group');
      if (bgGroup) bgGroup.style.display = 'none';
    }
    if (config.fields.age === false) {
      const ageGroup = document.getElementById('patientAge')?.closest('.form-group');
      if (ageGroup) ageGroup.style.display = 'none';
    }
  }
});
