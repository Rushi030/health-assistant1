/***************************
  script.js – Fixed Medication Tracking
***************************/

/************* API Base URL *************/
const API = "https://health-assistant1-2.onrender.com";



/***************************************
        DARK MODE FUNCTIONALITY
****************************************/
function initDarkMode() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.body.setAttribute('data-theme', savedTheme);
  updateThemeIcon();
}

function toggleDarkMode() {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    const theme = document.documentElement.getAttribute('data-theme');
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

/***************************************
        Utility Functions
****************************************/
function showAlert(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove("d-none");
}

function hideAlert(id) {
  const el = document.getElementById(id);
  el.classList.add("d-none");
  el.textContent = "";
}

function validateEmail(email) {
  const allowedDomains = [
      "gmail.com",
      "outlook.com",
      "hotmail.com",
      "yahoo.com",
      "rediffmail.com"
  ];
  const parts = email.trim().split("@");
  if (parts.length !== 2) return false;
  return allowedDomains.includes(parts[1].toLowerCase());
}

function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  const icon = button.querySelector('i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

function setCurrentUser(user) { localStorage.setItem("currentUser", JSON.stringify(user)); }
function getCurrentUser() { return JSON.parse(localStorage.getItem("currentUser") || "null"); }
function logout() { localStorage.removeItem("currentUser"); location.reload(); }

/***************************************
            AUTH (Login / Signup)
****************************************/
async function signUp() {
  hideAlert("signupError");
  hideAlert("signupSuccess");

  const name = su_name.value.trim();
  const email = su_email.value.trim();
  const password = su_password.value;
  const confirm = su_confirm.value;

  if (!name || !email || !password || !confirm)
    return showAlert("signupError", "Fill all fields.");

  if (!validateEmail(email))
    return showAlert("signupError", "Use Gmail, Outlook, Yahoo, Hotmail, Rediffmail only.");

  if (password.length < 6)
    return showAlert("signupError", "Password must be at least 6 characters.");

  if (password !== confirm)
    return showAlert("signupError", "Passwords do not match.");

  try {
    const res = await fetch(`${API}/signup`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name, email, password})
    });

    const out = await res.json();

    if (out.status === "error")
      return showAlert("signupError", out.msg);

    showAlert("signupSuccess", out.msg);
    setTimeout(showLogin, 1500);
  } catch (error) {
    showAlert("signupError", "Server error. Make sure Flask is running.");
  }
}

async function login() {
  hideAlert("loginError");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password)
    return showAlert("loginError", "Enter email and password.");

  if (!validateEmail(email))
    return showAlert("loginError", "Invalid email format.");

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email, password})
    });

    const out = await res.json();

    if (out.status === "error")
      return showAlert("loginError", out.msg);

    setCurrentUser(out.user);
    openApp();
  } catch (error) {
    showAlert("loginError", "Server error. Make sure Flask is running.");
  }
}

/***************************************
               NAVIGATION
****************************************/
function showLogin() {
  signupPage.style.display = "none";
  loginPage.style.display = "block";
}

function showSignup() {
  loginPage.style.display = "none";
  signupPage.style.display = "block";
}

function openApp() {
  loginPage.style.display = "none";
  signupPage.style.display = "none";
  mainApp.style.display = "block";
  updateGreeting();
  loadDoctorOptions();
  loadTimeSlots();
  loadAppointments();
  loadHealthTip();
  loadProfileData();
  loadMedications();
  loadTodaySchedule();
  loadHealthRecords();
}

function showPage(page) {
  document.querySelectorAll("#mainApp > div.container")
    .forEach(div => div.style.display = "none");

  document.getElementById(page).style.display = "block";

  document.querySelectorAll('.nav-tabs .nav-link')
    .forEach(a => a.classList.remove('active'));

  document.querySelector(`.nav-link[data-page="${page}"]`)?.classList.add("active");

  if (page === "appointment") loadAppointments();
  if (page === "profile") loadProfileData();
  if (page === "medication") {
    loadMedications();
    loadTodaySchedule();
  }
  if (page === "records") loadHealthRecords();
}

function updateGreeting() {
  const user = getCurrentUser();
  if (user) {
    userGreeting.innerText = `Hello, ${user.name}`;
    userGreeting.style.display = "inline-block";
  }
}

/***************************************
           DASHBOARD FUNCTIONS
****************************************/
function calculateBMI() {
  const h = Number(document.getElementById('height').value);
  const w = Number(document.getElementById('weight').value);
  const bmiResult = document.getElementById('bmiResult');

  if (h <= 0 || w <= 0) {
    bmiResult.innerText = "Enter valid values.";
    bmiResult.style.color = "#dc3545";
    return;
  }

  const bmi = (w / ((h/100)**2)).toFixed(2);
  let category = "";
  let color = "";
  
  if (bmi < 18.5) {
    category = "Underweight";
    color = "#ffc107";
  } else if (bmi < 25) {
    category = "Normal weight";
    color = "#28a745";
  } else if (bmi < 30) {
    category = "Overweight";
    color = "#fd7e14";
  } else {
    category = "Obese";
    color = "#dc3545";
  }
  
  bmiResult.innerHTML = `Your BMI is: <strong>${bmi}</strong> <span style="color:${color}">(${category})</span>`;
  bmiResult.style.fontWeight = "600";
  bmiResult.style.color = "#234";
}

function trackWater() {
  const waterInput = document.getElementById('water');
  const waterBar = document.getElementById('waterBar');
  
  let ml = Number(waterInput.value);
  
  if (ml < 0 || ml > 10000) {
    alert("Please enter a valid water amount (0-10000 ml)");
    return;
  }
  
  let percent = Math.min((ml / 3000) * 100, 100);
  waterBar.style.width = percent + "%";
  waterBar.innerText = `${percent.toFixed(0)}%`;
  
  if (percent < 33) {
    waterBar.style.backgroundColor = "#dc3545";
  } else if (percent < 66) {
    waterBar.style.backgroundColor = "#ffc107";
  } else {
    waterBar.style.backgroundColor = "#28a745";
  }
}

function calculateCalories() {
  const ageInput = document.getElementById('calAge');
  const genderSelect = document.getElementById('calGender');
  const goalSelect = document.getElementById('calGoal');
  const calResult = document.getElementById('calResult');
  
  const age = Number(ageInput.value);
  const gender = genderSelect.value;
  const goal = goalSelect.value;
  
  if (!age || !gender || !goal) {
    calResult.innerText = "⚠️ Please fill all fields.";
    calResult.style.color = "#dc3545";
    calResult.style.fontWeight = "600";
    return;
  }
  
  if (age < 10 || age > 100) {
    calResult.innerText = "⚠️ Please enter a valid age (10-100).";
    calResult.style.color = "#dc3545";
    calResult.style.fontWeight = "600";
    return;
  }
  
  let baseCalories;
  if (gender === "male") {
    baseCalories = 2500 - (age * 5);
  } else {
    baseCalories = 2000 - (age * 4);
  }
  
  let finalCalories;
  let goalText;
  
  if (goal === "lose") {
    finalCalories = baseCalories - 500;
    goalText = "Weight Loss";
  } else if (goal === "gain") {
    finalCalories = baseCalories + 500;
    goalText = "Weight Gain";
  } else {
    finalCalories = baseCalories;
    goalText = "Maintenance";
  }
  
  calResult.innerHTML = `
    <strong style="color: #0868d8;">Recommended: ${finalCalories} calories/day</strong><br>
    <small style="color: #666;">Goal: ${goalText} | Gender: ${gender === 'male' ? 'Male' : 'Female'} | Age: ${age}</small>
  `;
  calResult.style.fontWeight = "normal";
}

/***************************************
         APPOINTMENTS
****************************************/
const DOCTORS = [
  "Dr. Meera Sharma",
  "Dr. Arjun Patel",
  "Dr. Priya Desai",
  "Dr. Rahul Joshi",
  "Dr. Neha Kumar"
];

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

function loadDoctorOptions() {
  const docSelect = document.getElementById('docSelect');
  docSelect.innerHTML = '<option value="">Select Doctor</option>';
  DOCTORS.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    docSelect.appendChild(opt);
  });
}

function loadTimeSlots() {
  const timeSelect = document.getElementById('timeSelect');
  timeSelect.innerHTML = '<option value="">Select Time</option>';
  TIME_SLOTS.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    timeSelect.appendChild(opt);
  });
}

function clearAppointmentForm() {
  document.getElementById('docSelect').value = "";
  document.getElementById('date').value = "";
  document.getElementById('timeSelect').value = "";
}

function bookWithDoctor(doctorName) {
  showPage('appointment');
  document.getElementById('docSelect').value = doctorName;
}

async function addAppointment() {
  const user = getCurrentUser();
  const doctor = document.getElementById('docSelect').value;
  const date = document.getElementById('date').value;
  const time = document.getElementById('timeSelect').value;

  if (!doctor || !date || !time) {
    alert("Please fill all appointment details.");
    return;
  }

  const data = {
    email: user.email,
    doctor,
    date,
    time
  };

  try {
    const res = await fetch(`${API}/appointment/add`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    });

    const out = await res.json();
    alert(out.msg);
    
    if (out.status === "success") {
      clearAppointmentForm();
      loadAppointments();
    }
  } catch (error) {
    alert("Server error. Make sure Flask is running.");
  }
}

async function loadAppointments() {
  const user = getCurrentUser();
  const appointmentList = document.getElementById('appointmentList');

  try {
    const res = await fetch(`${API}/appointment/get`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email: user.email})
    });

    const list = await res.json();

    appointmentList.innerHTML = "";
    
    if (list.length === 0) {
      appointmentList.innerHTML = '<li class="list-group-item text-center" style="color:#666;">No appointments yet. Book your first appointment!</li>';
      return;
    }
    
    list.forEach(a => {
      appointmentList.innerHTML += `
        <li class="list-group-item">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="color:#0868d8; font-size:16px;">${a.doctor}</strong><br>
              <span style="color:#666;">📅 ${a.date} • 🕐 ${a.time}</span>
            </div>
          </div>
        </li>`;
    });
  } catch (error) {
    appointmentList.innerHTML = '<li class="list-group-item text-danger">Error loading appointments</li>';
  }
}

/***************************************
    MEDICATION REMINDER - FIXED VERSION
    Added persistent tracking and visual feedback
****************************************/

// Add this to your existing script.js file
// Replace the existing medication functions with these:

/***************************************
         MEDICATION REMINDER
****************************************/
function clearMedicationForm() {
  document.getElementById('medName').value = "";
  document.getElementById('medDosage').value = "";
  document.getElementById('medFrequency').value = "";
  document.getElementById('medDuration').value = "";
}

async function addMedication() {
  const user = getCurrentUser();
  const name = document.getElementById('medName').value.trim();
  const dosage = document.getElementById('medDosage').value.trim();
  const frequency = document.getElementById('medFrequency').value;
  const duration = document.getElementById('medDuration').value;

  if (!name || !dosage || !frequency || !duration) {
    alert("Please fill all medication details.");
    return;
  }

  const data = {
    email: user.email,
    name,
    dosage,
    frequency,
    duration
  };

  try {
    const res = await fetch(`${API}/medication/add`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    });

    const out = await res.json();
    alert(out.msg);
    
    if (out.status === "success") {
      clearMedicationForm();
      loadMedications();
    }
  } catch (error) {
    alert("Server error. Make sure Flask is running.");
  }
}

async function loadMedications() {
  const user = getCurrentUser();
  const medicationList = document.getElementById('medicationList');
  const todayMedications = document.getElementById('todayMedications');

  try {
    const res = await fetch(`${API}/medication/get`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email: user.email})
    });

    const list = await res.json();

    medicationList.innerHTML = "";
    todayMedications.innerHTML = "";
    
    if (list.length === 0) {
      medicationList.innerHTML = '<li class="list-group-item text-center" style="color:#666;">No medications added yet.</li>';
      todayMedications.innerHTML = '<p style="color:#666;">No medications scheduled for today.</p>';
      return;
    }
    
    // All medications list
    list.forEach(m => {
      medicationList.innerHTML += `
        <li class="list-group-item">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="color:#0868d8; font-size:16px;">💊 ${m.name}</strong><br>
              <span style="color:#666;">Dosage: ${m.dosage} | ${m.frequency} | ${m.duration} days</span>
            </div>
          </div>
        </li>`;
    });
    
    // Today's schedule with proper tracking
    displayTodaySchedule(list, user.email);
    
  } catch (error) {
    medicationList.innerHTML = '<li class="list-group-item text-danger">Error loading medications</li>';
  }
}

function displayTodaySchedule(medications, userEmail) {
  const todayMedications = document.getElementById('todayMedications');
  
  if (medications.length === 0) {
    todayMedications.innerHTML = '<p style="color:#666;">No medications scheduled for today.</p>';
    return;
  }
  
  // Get today's date as a key
  const today = new Date().toISOString().split('T')[0];
  
  // Load today's taken medications from localStorage
  const takenKey = `medTaken_${userEmail}_${today}`;
  const takenMeds = JSON.parse(localStorage.getItem(takenKey) || '{}');
  
  let schedule = "";
  
  medications.forEach(m => {
    const times = m.frequency.split(',');
    times.forEach(time => {
      const medKey = `${m.id}_${time.trim()}`;
      const isTaken = takenMeds[medKey] || false;
      
      schedule += `
        <div id="med-${medKey}" style="background:${isTaken ? '#d4edda' : '#f8f9fa'}; padding:15px; border-radius:10px; margin-bottom:10px; border-left: 4px solid ${isTaken ? '#28a745' : '#0868d8'}; transition: all 0.3s;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="flex-grow: 1;">
              <strong style="color:#0868d8; font-size: 16px;">💊 ${m.name}</strong> - ${m.dosage}<br>
              <span style="color:#666;">🕐 ${time.trim()}</span>
              ${isTaken ? '<br><span style="color:#28a745; font-weight: 600;"><i class="fas fa-check-circle"></i> Taken at ' + takenMeds[medKey] + '</span>' : ''}
            </div>
            <button 
              class="btn btn-sm ${isTaken ? 'btn-secondary' : 'btn-success'}" 
              onclick="markTaken('${m.id}', '${time.trim()}', '${m.name}', '${userEmail}')"
              ${isTaken ? 'disabled' : ''}
              style="min-width: 120px;">
              ${isTaken ? '<i class="fas fa-check"></i> Taken' : '<i class="fas fa-hand-holding-medical"></i> Mark Taken'}
            </button>
          </div>
        </div>`;
    });
  });
  
  todayMedications.innerHTML = schedule || '<p style="color:#666;">All medications taken for today! 🎉</p>';
  
  // Update progress
  updateMedicationProgress(medications, takenMeds);
}

function markTaken(medId, time, medName, userEmail) {
  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  // Load existing taken medications for today
  const takenKey = `medTaken_${userEmail}_${today}`;
  const takenMeds = JSON.parse(localStorage.getItem(takenKey) || '{}');
  
  // Mark this medication as taken
  const medKey = `${medId}_${time}`;
  takenMeds[medKey] = now;
  
  // Save back to localStorage
  localStorage.setItem(takenKey, JSON.stringify(takenMeds));
  
  // Show success message
  showMedicationToast(`✅ ${medName} marked as taken at ${now}`);
  
  // Update the UI
  const medElement = document.getElementById(`med-${medKey}`);
  if (medElement) {
    medElement.style.background = '#d4edda';
    medElement.style.borderLeft = '4px solid #28a745';
    
    // Update button
    const button = medElement.querySelector('button');
    button.innerHTML = '<i class="fas fa-check"></i> Taken';
    button.classList.remove('btn-success');
    button.classList.add('btn-secondary');
    button.disabled = true;
    
    // Add taken time info
    const timeInfo = medElement.querySelector('div > div');
    const existingTakenInfo = timeInfo.querySelector('.taken-info');
    if (!existingTakenInfo) {
      timeInfo.innerHTML += `<br><span class="taken-info" style="color:#28a745; font-weight: 600;"><i class="fas fa-check-circle"></i> Taken at ${now}</span>`;
    }
  }
  
  // Reload to update progress
  loadMedications();
}

function updateMedicationProgress(medications, takenMeds) {
  // Calculate total doses for today
  let totalDoses = 0;
  let takenDoses = 0;
  
  medications.forEach(m => {
    const times = m.frequency.split(',');
    totalDoses += times.length;
    
    times.forEach(time => {
      const medKey = `${m.id}_${time.trim()}`;
      if (takenMeds[medKey]) {
        takenDoses++;
      }
    });
  });
  
  // Add progress bar if it doesn't exist
  let progressContainer = document.getElementById('medicationProgress');
  if (!progressContainer) {
    progressContainer = document.createElement('div');
    progressContainer.id = 'medicationProgress';
    progressContainer.style.marginTop = '20px';
    progressContainer.style.padding = '15px';
    progressContainer.style.background = 'white';
    progressContainer.style.borderRadius = '10px';
    progressContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    
    const todayMedications = document.getElementById('todayMedications');
    todayMedications.parentElement.insertBefore(progressContainer, todayMedications);
  }
  
  const percentage = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
  
  progressContainer.innerHTML = `
    <div style="margin-bottom: 10px;">
      <strong style="color: #0868d8;">📊 Today's Progress</strong>
      <span style="float: right; color: #666; font-weight: 600;">${takenDoses} / ${totalDoses} doses</span>
    </div>
    <div style="background: #e9ecef; border-radius: 10px; height: 30px; overflow: hidden;">
      <div style="background: linear-gradient(90deg, #28a745, #20c997); width: ${percentage}%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; transition: width 0.5s ease;">
        ${percentage}%
      </div>
    </div>
    ${percentage === 100 ? '<p style="color: #28a745; text-align: center; margin-top: 10px; font-weight: 600;"><i class="fas fa-trophy"></i> All medications taken today! Great job!</p>' : ''}
  `;
}

function showMedicationToast(message) {
  // Remove existing toast if any
  const existingToast = document.getElementById('medicationToast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.id = 'medicationToast';
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    font-weight: 600;
    animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 2.5s;
    min-width: 300px;
  `;
  toast.innerHTML = message;
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.remove();
    style.remove();
  }, 3000);
}

// Add function to reset daily at midnight (optional)
function checkAndResetDailyMedications() {
  const user = getCurrentUser();
  if (!user) return;
  
  const today = new Date().toISOString().split('T')[0];
  const lastResetKey = `lastReset_${user.email}`;
  const lastReset = localStorage.getItem(lastResetKey);
  
  if (lastReset !== today) {
    // New day - could show a notification or just update the key
    localStorage.setItem(lastResetKey, today);
    
    // Optionally reload medications to show fresh schedule
    if (document.getElementById('medication').style.display !== 'none') {
      loadMedications();
    }
  }
}

// Check for new day every minute when user is on medication page
setInterval(() => {
  if (document.getElementById('medication').style.display !== 'none') {
    checkAndResetDailyMedications();
  }
}, 60000); // Check every minute
/***************************************
         HEALTH RECORDS
****************************************/
function saveBasicInfo() {
  const user = getCurrentUser();
  const data = {
    email: user.email,
    bloodGroup: document.getElementById('bloodGroup').value,
    height: document.getElementById('recordHeight').value,
    weight: document.getElementById('recordWeight').value
  };
  
  localStorage.setItem(`healthRecords_${user.email}`, JSON.stringify(data));
  updateHealthSummary();
  alert("Basic information saved!");
}

function saveEmergencyContact() {
  const user = getCurrentUser();
  const data = {
    name: document.getElementById('emergencyName').value,
    relation: document.getElementById('emergencyRelation').value,
    phone: document.getElementById('emergencyPhone').value
  };
  
  localStorage.setItem(`emergency_${user.email}`, JSON.stringify(data));
  updateHealthSummary();
  alert("Emergency contact saved!");
}

function saveMedicalConditions() {
  const user = getCurrentUser();
  const data = document.getElementById('medicalConditions').value;
  localStorage.setItem(`conditions_${user.email}`, data);
  alert("Medical conditions saved!");
}

function saveAllergies() {
  const user = getCurrentUser();
  const data = document.getElementById('allergies').value;
  localStorage.setItem(`allergies_${user.email}`, data);
  alert("Allergies saved!");
}

function loadHealthRecords() {
  const user = getCurrentUser();
  
  const basicInfo = JSON.parse(localStorage.getItem(`healthRecords_${user.email}`) || '{}');
  if (basicInfo.bloodGroup) document.getElementById('bloodGroup').value = basicInfo.bloodGroup;
  if (basicInfo.height) document.getElementById('recordHeight').value = basicInfo.height;
  if (basicInfo.weight) document.getElementById('recordWeight').value = basicInfo.weight;
  
  const emergency = JSON.parse(localStorage.getItem(`emergency_${user.email}`) || '{}');
  if (emergency.name) document.getElementById('emergencyName').value = emergency.name;
  if (emergency.relation) document.getElementById('emergencyRelation').value = emergency.relation;
  if (emergency.phone) document.getElementById('emergencyPhone').value = emergency.phone;
  
  const conditions = localStorage.getItem(`conditions_${user.email}`) || '';
  document.getElementById('medicalConditions').value = conditions;
  
  const allergies = localStorage.getItem(`allergies_${user.email}`) || '';
  document.getElementById('allergies').value = allergies;
  
  updateHealthSummary();
}

function updateHealthSummary() {
  const user = getCurrentUser();
  const basicInfo = JSON.parse(localStorage.getItem(`healthRecords_${user.email}`) || '{}');
  const emergency = JSON.parse(localStorage.getItem(`emergency_${user.email}`) || '{}');
  
  document.getElementById('summaryBloodGroup').innerText = basicInfo.bloodGroup || 'Not set';
  document.getElementById('summaryHeight').innerText = basicInfo.height ? `${basicInfo.height} cm` : 'Not set';
  document.getElementById('summaryWeight').innerText = basicInfo.weight ? `${basicInfo.weight} kg` : 'Not set';
  
  if (basicInfo.height && basicInfo.weight) {
    const bmi = (basicInfo.weight / ((basicInfo.height/100)**2)).toFixed(2);
    document.getElementById('summaryBMI').innerText = bmi;
  } else {
    document.getElementById('summaryBMI').innerText = 'Not calculated';
  }
  
  if (emergency.name) {
    document.getElementById('summaryEmergency').innerText = `${emergency.name} (${emergency.relation}) - ${emergency.phone}`;
  } else {
    document.getElementById('summaryEmergency').innerText = 'Not set';
  }
}

/***************************************
                 CHATBOT
****************************************/
async function chatBot() {
  const chatInput = document.getElementById('chatInput');
  const msg = chatInput.value.trim();
  if (!msg) return;

  appendChat("you", msg);
  chatInput.value = "";

  try {
    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({question: msg})
    });

    const out = await res.json();
    appendChat("bot", out.reply);
  } catch (error) {
    appendChat("bot", "Server error. Please try again.");
  }
}

function appendChat(who, text) {
  const chatHistory = document.getElementById('chatHistory');
  const box = document.createElement("div");
  box.style.margin = "8px 0";
  box.style.padding = "10px";
  box.style.borderRadius = "10px";
  
  if (who === "you") {
    box.style.background = "#0868d8";
    box.style.color = "white";
    box.style.textAlign = "right";
    box.innerHTML = `<b>You:</b> ${text}`;
  } else {
    box.style.background = "#f2f7ff";
    box.style.color = "#234";
    box.innerHTML = `<b>🤖 Bot:</b> ${text}`;
  }
  
  chatHistory.appendChild(box);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

/***************************************
              PROFILE
****************************************/
function loadProfileData() {
  const user = getCurrentUser();
  if (user) {
    document.getElementById('pname').value = user.name || "";
    document.getElementById('page').value = user.age || "";
    document.getElementById('pbio').value = user.bio || "";
  }
}

async function saveProfile() {
  const user = getCurrentUser();

  const data = {
    email: user.email,
    name: document.getElementById('pname').value.trim(),
    age: document.getElementById('page').value.trim(),
    bio: document.getElementById('pbio').value.trim()
  };

  try {
    await fetch(`${API}/profile/save`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    });

    user.name = data.name;
    user.age = data.age;
    user.bio = data.bio;
    setCurrentUser(user);
    updateGreeting();

    alert("Profile saved successfully!");
  } catch (error) {
    alert("Error saving profile. Make sure Flask is running.");
  }
}

/***************************************
            HEALTH TIPS
****************************************/
const tips = [
  "💧 Drink 8 glasses of water daily.",
  "🚶 Take a 10-minute walk every day.",
  "🥗 Eat fruits and vegetables regularly.",
  "😴 Sleep 7–8 hours for better health.",
  "📱 Avoid screens before sleep.",
  "🧘 Practice meditation for 5 minutes daily.",
  "🏃 Exercise at least 30 minutes a day.",
  "🥛 Include protein in every meal.",
  "🌞 Get some sunlight exposure daily.",
  "❌ Avoid processed foods and sugary drinks."
];

function loadHealthTip() {
  const healthTip = document.getElementById('healthTip');
  healthTip.innerText = tips[Math.floor(Math.random() * tips.length)];
}

/***************************************
            EVENT LISTENERS
****************************************/
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  
  const chatSendBtn = document.getElementById('chatSendBtn');
  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', chatBot);
  }
  
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') chatBot();
    });
  }
  
  const loginPassword = document.getElementById('password');
  if (loginPassword) {
    loginPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') login();
    });
  }
  
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }
});

/***************************************
            PAGE INITIALIZATION
****************************************/
window.onload = () => {
  const user = getCurrentUser();
  if (user) {
    openApp();
  } else {
    showLogin();
  }

};



