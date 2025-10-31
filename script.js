/* ---------------------------
   Analyzer + Stats + Chatbot
   --------------------------- */

/* Utility: ensure healthStats exists */
function ensureStats() {
  if (!localStorage.getItem('healthStats')) {
    localStorage.setItem('healthStats', JSON.stringify({ Low: 0, Medium: 0, High: 0, total: 0, totalScore: 0 }));
  }
  if (!localStorage.getItem('patients')) {
    localStorage.setItem('patients', JSON.stringify([]));
  }
}
ensureStats();

/* Scroll helper */
function scrollToCheckup() {
  const el = document.getElementById("checkup");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

/* --- Health Analyzer logic --- */
const form = document.getElementById("healthForm");
if (form) {
  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const age = parseInt(document.getElementById("age").value);
    const familyHistory = document.getElementById("familyHistory").value === "yes";
    const urination = document.getElementById("urination").value === "yes";
    const chestPain = document.getElementById("chestPain").value === "yes";
    const weightLoss = document.getElementById("weightLoss").value === "yes";
    const vision = document.getElementById("vision").value === "yes";

    // Simple explainable scoring (demo)
    let score = 0;
    if (age > 60) score += 2;
    if (familyHistory) score += 2;
    if (urination) score += 2;
    if (chestPain) score += 3;
    if (weightLoss) score += 2;
    if (vision) score += 2;

    let riskLevel, adviceText;
    if (score <= 3) {
      riskLevel = "Low";
      adviceText = "Maintain healthy diet & regular checkups.";
    } else if (score <= 6) {
      riskLevel = "Medium";
      adviceText = "Schedule a general health check-up soon.";
    } else {
      riskLevel = "High";
      adviceText = "Urgent medical attention recommended!";
      // alarm sound
      try {
        const alarm = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
        alarm.play();
      } catch (err) { /* ignore audio errors in some environments */ }
    }

    // Update summary stats
    const stats = JSON.parse(localStorage.getItem("healthStats")) || { Low: 0, Medium: 0, High: 0, total: 0, totalScore: 0 };
    stats[riskLevel]++;
    stats.total++;
    stats.totalScore += score;
    localStorage.setItem("healthStats", JSON.stringify(stats));

    // Save individual patient record
    const patients = JSON.parse(localStorage.getItem("patients")) || [];
    patients.push({ name, age, riskLevel, score, advice: adviceText, date: new Date().toLocaleString() });
    localStorage.setItem("patients", JSON.stringify(patients));

    // Update result UI
    const resultDiv = document.getElementById("result");
    const riskText = document.getElementById("riskLevel");
    const advice = document.getElementById("advice");
    resultDiv.classList.remove("hidden", "low", "medium", "high");
    if (riskLevel === "Low") resultDiv.classList.add("low");
    else if (riskLevel === "Medium") resultDiv.classList.add("medium");
    else resultDiv.classList.add("high");

    riskText.textContent = riskLevel.toUpperCase() + " RISK";
    advice.textContent = adviceText;
    resultDiv.scrollIntoView({ behavior: "smooth" });
    form.reset();
  });
}

/* --- Simple AI Chatbot --- */
function sendMessage() {
  const input = document.getElementById("userInput");
  if (!input) return;
  const userText = input.value.trim();
  if (!userText) return;
  appendMessage("user", userText);
  input.value = "";
  setTimeout(() => appendMessage("bot", getBotResponse(userText.toLowerCase())), 500);
}

function appendMessage(sender, text) {
  const chatlog = document.getElementById("chatlog");
  if (!chatlog) return;
  const msg = document.createElement("div");
  msg.classList.add(sender === "user" ? "user-msg" : "bot-msg");
  msg.textContent = text;
  chatlog.appendChild(msg);
  chatlog.scrollTop = chatlog.scrollHeight;
}

function getBotResponse(input) {
  // Normalize
  input = input.toLowerCase();

  // ❤️ Heart-related
  if (input.includes("chest pain") || input.includes("pressure") || input.includes("palpitations") || input.includes("shortness of breath")) {
    return "⚠️ Possible cardiac issue. Please visit a cardiologist immediately — symptoms like chest pain or breathlessness can indicate heart disease.";
  }
  if (input.includes("dizziness") || input.includes("fainting") || input.includes("lightheaded")) {
    return "🩺 Dizziness could be due to low blood pressure, dehydration, or heart rhythm issues. Rest, hydrate, and seek medical evaluation if it persists.";
  }

  // 💉 Diabetes-related
  if (input.includes("thirst") || input.includes("urination") || input.includes("frequent urination") || input.includes("blurred vision") || input.includes("vision")) {
    return "👁️ Frequent thirst or urination and blurred vision can indicate diabetes. Please get a blood sugar test soon.";
  }
  if (input.includes("fatigue") || input.includes("tired") || input.includes("weakness")) {
    return "😴 Fatigue or weakness can be due to anemia, thyroid issues, diabetes, or lifestyle. Consider a basic health screening.";
  }
  if (input.includes("numbness") || input.includes("tingling") || input.includes("hands") || input.includes("feet")) {
    return "🦶 Numbness or tingling in hands/feet could indicate nerve damage, often related to diabetes or vitamin deficiency.";

  // 🧠 Neurological
  } else if (input.includes("headache") || input.includes("migraine") || input.includes("head pain")) {
    return "🤕 Persistent headaches can be due to stress, dehydration, or migraines. If severe or sudden, seek immediate care.";
  } else if (input.includes("memory") || input.includes("confusion") || input.includes("forget")) {
    return "🧠 Memory issues can arise from stress, sleep deprivation, or neurological conditions. Consult a neurologist if ongoing.";

  // 🫁 Respiratory
  } else if (input.includes("cough") || input.includes("cold") || input.includes("breathing") || input.includes("asthma")) {
    return "🌬️ Persistent cough or shortness of breath may indicate respiratory infection or asthma. Visit a pulmonologist if it lasts over a week.";
  } else if (input.includes("fever") || input.includes("temperature") || input.includes("infection")) {
    return "🌡️ Fever may suggest infection. Stay hydrated and consult a doctor if it persists beyond 2 days.";

  // 🦠 Cancer indicators
  } else if (input.includes("lump") || input.includes("mass") || input.includes("tumor")) {
    return "🩸 Unexplained lumps or swelling should be examined promptly — could indicate infection or tumor. Early detection saves lives.";
  } else if (input.includes("weight loss") || input.includes("loss of appetite")) {
    return "⚖️ Sudden unexplained weight loss could relate to cancer, thyroid, or metabolic diseases. Please get a full-body checkup.";
  }

  // 🩸 Blood & fatigue-related
  else if (input.includes("pale") || input.includes("anemia") || input.includes("iron")) {
    return "🩸 Pale skin or anemia symptoms indicate low hemoglobin. Eat iron-rich foods and consult for blood tests.";

  // 🧍 Musculoskeletal
  } else if (input.includes("joint") || input.includes("pain") || input.includes("back pain") || input.includes("stiffness")) {
    return "🦴 Joint or back pain can result from posture, arthritis, or inflammation. If chronic, see an orthopedist or physiotherapist.";

  // 🧍‍♀️ Women-specific
  } else if (input.includes("menstrual") || input.includes("period") || input.includes("pcos") || input.includes("cramps")) {
    return "👩‍⚕️ Irregular periods or cramps may signal PCOS or hormonal imbalance. Consider consulting a gynecologist.";
  } else if (input.includes("pregnancy") || input.includes("pregnant")) {
    return "🤰 Pregnancy-related concerns require medical follow-up. Please contact your obstetrician for personalized care.";

  // 🦷 Dental
  } else if (input.includes("tooth") || input.includes("gum") || input.includes("mouth")) {
    return "😁 Dental pain or bleeding gums can indicate infection. Maintain oral hygiene and visit a dentist soon.";

  // 🧍 General Health / Lifestyle
  } else if (input.includes("diet") || input.includes("food") || input.includes("nutrition")) {
    return "🥗 Balanced diet helps reduce risk for diabetes and heart disease. Focus on vegetables, lean proteins, and hydration.";
  } else if (input.includes("exercise") || input.includes("workout")) {
    return "🏃 Regular exercise improves heart health and blood sugar control. Aim for 30 minutes of moderate activity daily.";
  } else if (input.includes("sleep") || input.includes("insomnia")) {
    return "😴 Good sleep (7–8 hours) is vital for metabolism, mood, and heart health. Reduce screen time before bed.";

  // 🧘 Mental health
  } else if (input.includes("stress") || input.includes("anxiety") || input.includes("depression")) {
    return "🧘 Mental health matters! Practice relaxation techniques, take breaks, and reach out for counseling if needed.";

  // 💬 Greetings / fallback
  } else if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
    return "👋 Hi there! I’m your AI health assistant. Describe any symptom and I’ll suggest possible next steps.";
  } else if (input.includes("thank")) {
    return "😊 You're welcome! Stay proactive about your health — early diagnosis saves lives.";
  } else if (input.includes("help")) {
    return "🆘 I can help you understand possible risks based on symptoms like chest pain, fatigue, or thirst. Type one of them!";
  } else if (input.includes("test") || input.includes("checkup") || input.includes("risk")) {
    return "🩺 You can use the Health Analyzer form below to get your personalized risk score instantly.";
  } else {
    return "🤔 I’m not sure about that symptom. Try describing one in simple terms, e.g., 'chest pain', 'blurred vision', or 'frequent urination'.";
  }
}


/* allow pressing Enter in chat input */
const chatInput = document.getElementById("userInput");
if (chatInput) {
  chatInput.addEventListener("keydown", function(e) { if (e.key === "Enter") sendMessage(); });
}

/* Keep the UI responsive by ensuring stats exist on load */
window.addEventListener('load', ensureStats);













/*
// ----- Doctor Login -----
function doctorLogin(event) {
  event.preventDefault();
  const username = document.getElementById("docUser").value.trim();
  const password = document.getElementById("docPass").value.trim();
  const msgBox = document.getElementById("loginMsg");

  if (username === "doctor" && password === "earlycare") {
    msgBox.style.display = "block";
    msgBox.innerHTML = `
      <strong>✅ Login Successful!</strong><br>
      <a href="dashboard.html" class="hero-btn" style="margin-top:10px;display:inline-block;">View Dashboard</a>
    `;
  } else {
    msgBox.style.display = "block";
    msgBox.innerHTML = "❌ Invalid credentials. Try username: doctor, password: earlycare";
  }
}

// ----- Appointment Booking -----
function bookAppointment(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const department = document.getElementById("department").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const confirmationBox = document.getElementById("confirmationBox");

  confirmationBox.style.display = "block";
  confirmationBox.innerHTML = `
    ✅ <strong>Appointment Confirmed!</strong><br>
    <b>${name}</b>, your ${department} consultation is booked on 
    <b>${date}</b> at <b>${time}</b>.<br><br>
    You’ll receive an email confirmation shortly. Thank you for choosing EarlyCare!
  `;

  document.getElementById("appointmentForm").reset();
}
*/









function bookAppointment(event) {
  event.preventDefault();

  // Collect form data
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const department = document.getElementById("department").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  // Validation check
  if (!name || !email || !phone || !date) {
    alert("⚠️ Please fill all required fields.");
    return;
  }

  // Create appointment object
  const appointment = {
    name,
    email,
    phone,
    department,
    date,
    time,
    bookedAt: new Date().toLocaleString(),
    status: "Pending",
  };

  // Save to localStorage
  const appointments = JSON.parse(localStorage.getItem("appointments")) || [];
  appointments.push(appointment);
  localStorage.setItem("appointments", JSON.stringify(appointments));

  // Show confirmation
  const confirmationBox = document.getElementById("confirmationBox");
  confirmationBox.innerHTML = `
    <div class="success-box">
      <h3>✅ Appointment Booked Successfully!</h3>
      <p><strong>Department:</strong> ${department}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p>Our doctor will review your appointment shortly.</p>
    </div>
  `;

  // Reset form
  document.getElementById("appointmentForm").reset();
}

// ------------------------------
// 👨‍⚕️ Doctor Dashboard Functions
// ------------------------------
function loadAppointments() {
  const tableBody = document.getElementById("appointmentTableBody");
  const noData = document.getElementById("noDataMessage");

  if (!tableBody) return; // only run on doctor.html

  const appointments = JSON.parse(localStorage.getItem("appointments")) || [];

  tableBody.innerHTML = "";
  if (appointments.length === 0) {
    noData.style.display = "block";
    return;
  }

  appointments.forEach((appt, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${appt.name}</td>
      <td>${appt.email}</td>
      <td>${appt.phone}</td>
      <td>${appt.department}</td>
      <td>${appt.date}</td>
      <td>${appt.time}</td>
      <td>${appt.status}</td>
      <td>
        <button class="action-btn" onclick="recommend('${appt.department}')">Advice</button>
        <button class="done-btn" onclick="markDone(${index})">Mark Done</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}