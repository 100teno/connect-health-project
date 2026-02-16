window.addEventListener("load", function() {
    const splash = document.getElementById("splash");
    if (!splash) return;

    setTimeout(() => {
        splash.style.opacity = "0";
        setTimeout(() => splash.style.display = "none", 600);
    }, 1200);
});

document.addEventListener("DOMContentLoaded", function() {
    
    const menuToggle = document.getElementById("menuToggle");
    const sideMenu = document.getElementById("sideMenu");
    const closeMenu = document.getElementById("closeMenu");
    const overlay = document.getElementById("overlay");

    function openMenu(){
        sideMenu.classList.add("open");
        overlay.classList.add("show");
    }

    function closeMenuFunc(){
        sideMenu.classList.remove("open");
        overlay.classList.remove("show");
    }

    if(menuToggle){
        menuToggle.addEventListener("click", openMenu);
    }

    if(closeMenu){
        closeMenu.addEventListener("click", closeMenuFunc);
    }

    if(overlay){
        overlay.addEventListener("click", closeMenuFunc);
    }

});

// logica para a streak ofensiva

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

function loadHistory() {
  return JSON.parse(localStorage.getItem("workoutHistory")) || [];
}

function saveHistory(history) {
  localStorage.setItem("workoutHistory", JSON.stringify(history));
}

function updateStreak(tipoTreino) {
  const today = getTodayISO();
  let history = loadHistory();

  const alreadyTrainedToday = history.some(h => h.date === today);

  if (!alreadyTrainedToday) {
    history.push({ date: today, type: tipoTreino });
    saveHistory(history);
  }

  calculateStreak();
}

function calculateStreak() {
  let history = loadHistory().sort((a, b) => new Date(b.date) - new Date(a.date));
  if (history.length === 0) return 0;

  let streak = 1;
  let yesterday = new Date(history[0].date);

  for (let i = 1; i < history.length; i++) {
    let currentDate = new Date(history[i].date);
    let diff = (yesterday - currentDate) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      streak++;
      yesterday = currentDate;
    } else {
      break;
    }
  }

  localStorage.setItem("streak", streak);
  return streak;
}

function loadStreakUI() {
  const streakCount = document.getElementById("streakCount");
  const streakType = document.getElementById("streakType");

  let history = loadHistory();
  let streak = calculateStreak();

  if (streakCount) streakCount.innerText = streak + " dias";

  if (streakType && history.length > 0) {
    streakType.innerText = history[history.length - 1].type;
  }
}

document.querySelectorAll(".video-btn").forEach(btn => {
  btn.addEventListener("click", function() {
    const tipo = this.getAttribute("data-treino");
    updateStreak(tipo);
  });
});


// atualizar ofensiva na Home
const homeStreak = document.getElementById("homeStreak");

if (homeStreak) {
  let streak = calculateStreak();
  homeStreak.innerText = streak + " dias seguidos";
}

if (homeStreak) {
  let streak = localStorage.getItem("streak") || 0;
  let lastType = localStorage.getItem("lastType") || "Nenhum treino";

  homeStreak.innerText = streak + " dias seguidos • Último: " + lastType;
}


// calendario

function renderCalendar() {
  const calendarGrid = document.getElementById("calendarGrid");
  if (!calendarGrid) return;

  const history = loadHistory();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  calendarGrid.innerHTML = "";

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateISO = new Date(currentYear, currentMonth, day).toISOString().split("T")[0];
    const dayBox = document.createElement("div");
    dayBox.classList.add("calendar-day");
    dayBox.innerText = day;

    if (history.some(h => h.date === dateISO)) {
      dayBox.classList.add("trained");
      dayBox.innerHTML = day + " 🔥";
    }

    if (day === today.getDate()) {
      dayBox.classList.add("today");
    }

    calendarGrid.appendChild(dayBox);
  }
}

document.addEventListener("DOMContentLoaded", function() {
  loadStreakUI();
  renderCalendar();
});

function checkBadges() {
  const badgeStatus = document.getElementById("badgeStatus");
  if (!badgeStatus) return;

  let streak = parseInt(localStorage.getItem("streak")) || 0;

  if (streak >= 30) badgeStatus.innerText = "👑 Mestre da Consistência (30 dias)";
  else if (streak >= 15) badgeStatus.innerText = "🥇 Ouro - 15 dias";
  else if (streak >= 7) badgeStatus.innerText = "🥈 Prata - 7 dias";
  else if (streak >= 3) badgeStatus.innerText = "🥉 Bronze - 3 dias";
  else badgeStatus.innerText = "Continue treinando para ganhar conquistas!";
}

document.addEventListener("DOMContentLoaded", function() {
  loadStreakUI();
  renderCalendar();
  checkBadges();
});

function checkBrokenStreak() {
  const warning = document.getElementById("streakWarning");
  if (!warning) return;

  let history = loadHistory();
  if (history.length === 0) return;

  history.sort((a,b)=> new Date(b.date)-new Date(a.date));

  const lastDate = new Date(history[0].date);
  const today = new Date();
  const diff = (today - lastDate) / (1000 * 60 * 60 * 24);

  if (diff > 1) {
    warning.style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", checkBrokenStreak);

function renderMonthlyStats() {
  const stats = document.getElementById("monthlyStats");
  if (!stats) return;

  const history = loadHistory();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const monthWorkouts = history.filter(h => {
    const d = new Date(h.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  let total = monthWorkouts.length;

  let types = {};
  monthWorkouts.forEach(h => {
    types[h.type] = (types[h.type] || 0) + 1;
  });
  
}

function getMostTrained() {
  const treinos = JSON.parse(localStorage.getItem("treinos")) || [];

  if (treinos.length === 0) {
    return "Nenhum ainda";
  }

  const contagem = {};

  treinos.forEach(t => {
    contagem[t] = (contagem[t] || 0) + 1;
  });

  let maisTreinado = null;
  let maior = 0;

  for (let tipo in contagem) {
    if (contagem[tipo] > maior) {
      maior = contagem[tipo];
      maisTreinado = tipo;
    }
  }

  return maisTreinado || "Nenhum ainda";
}


const most = document.getElementById("mostTrained");
if (most) {
  most.textContent = getMostTrained();
}

document.addEventListener("DOMContentLoaded", renderMonthlyStats);

// cardapios no array (dinamico)

const cardapios = [
  {
    titulo: "🥗 Café da Manhã Fit",
    descricao: "Ovos mexidos + fruta + café sem açúcar."
  },
  {
    titulo: "🍗 Almoço Balanceado",
    descricao: "Arroz integral + frango grelhado + salada."
  },
  {
    titulo: "🥑 Jantar Leve",
    descricao: "Salada com proteína + azeite extra virgem."
  },
  {
    titulo: "🍌 Lanche Pré-Treino",
    descricao: "Banana + pasta de amendoim."
  },
  {
    titulo: "🐟 Jantar Proteico",
    descricao: "Salmão grelhado + legumes."
  }
];

const container = document.getElementById("listaCardapios");

if (container) {
  cardapios.forEach(item => {
    container.innerHTML += `
      <div class="card">
        <div class="card-body">
          <h3>${item.titulo}</h3>
          <p>${item.descricao}</p>
        </div>
      </div>
    `;
  });
}

