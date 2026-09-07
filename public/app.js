let deleteTarget = null;
let deleteType = null;
let allHonors = [];

// =========================
// API
// =========================

async function api(url, options = {}) {
  const token = localStorage.getItem("talonAdminToken");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("talonAdminToken");
    }

    throw new Error(data.error || "خطایی رخ داد");
  }

  return data;
}

// =========================
// NAVIGATION
// =========================

function showSection(id) {
  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active");
  });

  const section = document.getElementById(id);

  if (!section) {
    console.error("Section not found:", id);
    return;
  }

  section.classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// =========================
// LOGIN
// =========================

async function login() {
  const username =
    document.getElementById("username").value.trim();

  const password =
    document.getElementById("password").value;

  if (!username || !password) {
    alert("نام کاربری و رمز عبور را وارد کنید.");
    return;
  }

  try {
    const result = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({
        username,
        password
      })
    });

    localStorage.setItem(
      "talonAdminToken",
      result.token
    );

    alert("ورود موفق بود 🦅");

    document.getElementById("loginBox").style.display =
      "none";

    document.getElementById("adminPanel").style.display =
      "block";

    await loadAdminData();

  } catch (error) {
    alert(error.message);
  }
}

// =========================
// LOGOUT
// =========================

async function logout() {
  try {
    await api("/api/logout", {
      method: "POST"
    });
  } catch (error) {
    // حتی اگر درخواست خروج خطا داد،
    // توکن محلی را پاک می‌کنیم.
  }

  localStorage.removeItem("talonAdminToken");

  document.getElementById("loginBox").style.display =
    "block";

  document.getElementById("adminPanel").style.display =
    "none";

  alert("از پنل خارج شدید 👋");
}

// =========================
// GAMES
// =========================

async function loadGames() {
  const games = await api("/api/games");

  const container =
    document.getElementById("gamesList");

  if (!games.length) {
    container.innerHTML =
      "<p>هنوز بازی‌ای ثبت نشده است.</p>";
    return;
  }

  container.innerHTML = games.map(game => `
    <div class="game-card">
      <div class="team">
        ${escapeHTML(game.home_team)}
      </div>

      <div class="game-score">
        ${game.home_score} - ${game.away_score}
      </div>

      <div class="team">
        ${escapeHTML(game.away_team)}
      </div>

      <div class="game-date">
        ${escapeHTML(game.date || "")}
      </div>
    </div>
  `).join("");
}

// =========================
// STANDINGS
// =========================

async function loadStandings() {
  const standings =
    await api("/api/standings");

  const container =
    document.getElementById("standingsList");

  if (!standings.length) {
    container.innerHTML =
      "<p>هنوز جدولی ثبت نشده است.</p>";
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>رتبه</th>
          <th>تیم</th>
          <th>بازی</th>
          <th>برد</th>
          <th>مساوی</th>
          <th>باخت</th>
          <th>امتیاز</th>
        </tr>
      </thead>

      <tbody>
        ${standings.map((team, index) => `
          <tr>
            <td>${index + 1}</td>

            <td>
              ${escapeHTML(team.team)}
            </td>

            <td>${team.played}</td>
            <td>${team.wins}</td>
            <td>${team.draws}</td>
            <td>${team.losses}</td>

            <td>
              <strong>${team.points}</strong>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

// =========================
// HONORS
// =========================

async function loadHonors() {
  allHonors =
    await api("/api/honors");

  renderHonors(allHonors);
}

function renderHonors(list) {
  const container =
    document.getElementById("honorsList");

  if (!list.length) {
    container.innerHTML =
      "<p>موردی پیدا نشد.</p>";
    return;
  }

  container.innerHTML = list.map((person, index) => `
    <div class="honor-card">

      <span class="rank">
        ${index + 1}
      </span>

      <span class="honor-name">
        ${escapeHTML(person.name)}
      </span>

      <span class="honor-points">
        ${person.points} امتیاز
      </span>

    </div>
  `).join("");
}

function searchHonors() {
  const query =
    document
      .getElementById("honorSearch")
      .value
      .trim()
      .toLowerCase();

  const filtered =
    allHonors.filter(person =>
      person.name
        .toLowerCase()
        .includes(query)
    );

  renderHonors(filtered);
}

// =========================
// NEWS
// =========================

async function loadNews() {
  const news =
    await api("/api/news");

  const container =
    document.getElementById("newsList");

  if (!news.length) {
    container.innerHTML =
      "<p>هنوز خبری منتشر نشده است.</p>";
    return;
  }

  container.innerHTML = news.map(item => `
    <article class="news-card">

      <h3>
        ${escapeHTML(item.title)}
      </h3>

      <p>
        ${escapeHTML(item.content)}
      </p>

      <small>
        ${formatDate(item.created_at)}
      </small>

    </article>
  `).join("");
}

// =========================
// CHAT
// =========================

async function loadChat() {
  const messages =
    await api("/api/chat");

  const container =
    document.getElementById("chatMessages");

  if (!messages.length) {
    container.innerHTML =
      "<p>هنوز پیامی وجود ندارد. اولین پیام را بفرستید 🦅</p>";
    return;
  }

  container.innerHTML = messages.map(message => `
    <div class="chat-message">

      <strong>
        ${escapeHTML(message.username)}
      </strong>

      <p>
        ${escapeHTML(message.message)}
      </p>

    </div>
  `).join("");

  container.scrollTop =
    container.scrollHeight;
}

async function sendMessage() {
  const username =
    document
      .getElementById("chatUsername")
      .value
      .trim();

  const message =
    document
      .getElementById("chatMessage")
      .value
      .trim();

  if (!username || !message) {
    alert("نام و پیام را وارد کنید.");
    return;
  }

  try {
    await api("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        username,
        message
      })
    });

    document.getElementById(
      "chatMessage"
    ).value = "";

    await loadChat();

    const adminPanel =
      document.getElementById("adminPanel");

    if (
      adminPanel &&
      adminPanel.style.display !== "none"
    ) {
      await loadAdminChat();
    }

  } catch (error) {
    alert(error.message);
  }
}

// =========================
// POLL
// =========================

async function loadPoll() {
  const poll =
    await api("/api/poll");

  const container =
    document.getElementById("pollBox");

  if (!poll) {
    container.innerHTML =
      "<p>فعلاً نظرسنجی فعالی وجود ندارد.</p>";
    return;
  }

  const total =
    Number(poll.votes1 || 0) +
    Number(poll.votes2 || 0) +
    Number(poll.votes3 || 0);

  container.innerHTML = `
    <h2>
      ${escapeHTML(poll.question)}
    </h2>

    <button
      class="poll-option"
      onclick="votePoll(${poll.id}, 1)"
    >
      ${escapeHTML(poll.option1)}
    </button>

    <button
      class="poll-option"
      onclick="votePoll(${poll.id}, 2)"
    >
      ${escapeHTML(poll.option2)}
    </button>

    <button
      class="poll-option"
      onclick="votePoll(${poll.id}, 3)"
    >
      ${escapeHTML(poll.option3)}
    </button>

    <p class="poll-result">
      مجموع رأی‌ها: ${total}
    </p>
  `;
}

async function votePoll(id, option) {
  try {
    await api("/api/poll/vote", {
      method: "POST",
      body: JSON.stringify({
        pollId: id,
        option
      })
    });

    alert("رأی شما ثبت شد ✅");

    await loadPoll();

  } catch (error) {
    alert(error.message);
  }
}

// =========================
// ADMIN DATA
// =========================

async function loadAdminData() {
  await loadAdminNews();
  await loadAdminGames();
  await loadAdminStandings();
  await loadAdminHonors();
  await loadAdminPoll();
  await loadAdminChat();
}

// =========================
// ADMIN NEWS
// =========================

async function loadAdminNews() {
  const news =
    await api("/api/news");

  const container =
    document.getElementById("adminNewsList");

  if (!news.length) {
    container.innerHTML =
      "<p>خبری ثبت نشده است.</p>";
    return;
  }

  container.innerHTML = news.map(item => `
    <div class="admin-item">

      <span>
        ${escapeHTML(item.title)}
      </span>

      <div>

        <button
          onclick="editNews(${item.id})"
        >
          ✏️ ویرایش
        </button>

        <button
          onclick="askDelete('news', ${item.id})"
        >
          🗑️ حذف
        </button>

      </div>

    </div>
  `).join("");
}

async function addNews() {
  const title =
    prompt("عنوان خبر:");

  if (!title) return;

  const content =
    prompt("متن خبر:");

  if (!content) return;

  try {
    await api("/api/news", {
      method: "POST",
      body: JSON.stringify({
        title,
        content
      })
    });

    alert("خبر اضافه شد ✅");

    await loadNews();
    await loadAdminNews();

  } catch (error) {
    alert(error.message);
  }
}

async function editNews(id) {
  if (
    !confirm(
      "آیا مطمئن هستید که می‌خواهید این خبر را ویرایش کنید؟"
    )
  ) {
    return;
  }

  const title =
    prompt("عنوان جدید:");

  if (!title) return;

  const content =
    prompt("متن جدید:");

  if (!content) return;

  try {
    await api(`/api/news/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        title,
        content
      })
    });

    alert("خبر ویرایش شد ✅");

    await loadNews();
    await loadAdminNews();

  } catch (error) {
    alert(error.message);
  }
}

// =========================
// ADMIN GAMES
// =========================

async function loadAdminGames() {
  const games =
    await api("/api/games");

  const container =
    document.getElementById("adminGamesList");

  if (!games.length) {
    container.innerHTML =
      "<p>بازی‌ای ثبت نشده است.</p>";
    return;
  }

  container.innerHTML = games.map(game => `
    <div class="admin-item">

      <span>
        ${escapeHTML(game.home_team)}
        ${game.home_score}
        -
        ${game.away_score}
        ${escapeHTML(game.away_team)}
      </span>

      <div>

        <button
          onclick="editGame(${game.id})"
        >
          ✏️ ویرایش
        </button>

        <button
          onclick="askDelete('games', ${game.id})"
        >
          🗑️ حذف
        </button>

      </div>

    </div>
  `).join("");
}

async function addGame() {
  const home_team =
    prompt("نام تیم اول:");

  if (!home_team) return;

  const away_team =
    prompt("نام تیم دوم:");

  if (!away_team) return;

  const home_score =
    Number(prompt("گل تیم اول:", "0")) || 0;

  const away_score =
    Number(prompt("گل تیم دوم:", "0")) || 0;

  const date =
    prompt("تاریخ بازی:") || "";

  try {
    await api("/api/games", {
      method: "POST",
      body: JSON.stringify({
        home_team,
        away_team,
        home_score,
        away_score,
        date
      })
    });

    alert("بازی اضافه شد ✅");

    await loadGames();
    await loadAdminGames();

  } catch (error) {
    alert(error.message);
  }
}

async function editGame(id) {
  if (
    !confirm(
      "آیا مطمئن هستید که می‌خواهید این بازی را ویرایش کنید؟"
    )
  ) {
    return;
  }

  const home_team =
    prompt("نام تیم اول:");

  if (!home_team) return;

  const away_team =
    prompt("نام تیم دوم:");

  if (!away_team) return;

  const home_score =
    Number(prompt("گل تیم اول:", "0")) || 0;

  const away_score =
    Number(prompt("گل تیم دوم:", "0")) || 0;

  const date =
    prompt("تاریخ بازی:") || "";

  try {
    await api(`/api/games/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        home_team,
        away_team,
        home_score,
        away_score,
        date
      })
    });

    alert("بازی ویرایش شد ✅");

    await loadGames();
    await loadAdminGames();

  } catch (error) {
    alert(error.message);
  }
}

// =========================
// ADMIN STANDINGS
// =========================

async function loadAdminStandings() {
  const standings =
    await api("/api/standings");

  const container =
    document.getElementById(
      "adminStandingsList"
    );

  if (!standings.length) {
    container.innerHTML =
      "<p>تیمی ثبت نشده است.</p>";
    return;
  }

  container.innerHTML = standings.map(team => `
    <div class="admin-item">

      <span>
        ${escapeHTML(team.team)}
        — ${team.points} امتیاز
      </span>

      <div>

        <button
          onclick="editStanding(${team.id})"
        >
          ✏️ ویرایش
        </button>

        <button
          onclick="askDelete('standings', ${team.id})"
        >
          🗑️ حذف
        </button>

      </div>

    </div>
  `).join("");
}

async function addStanding() {
  const team =
    prompt("نام تیم:");

  if (!team) return;

  const played =
    Number(prompt("بازی:", "0")) || 0;

  const wins =
    Number(prompt("برد:", "0")) || 0;

  const draws =
    Number(prompt("مساوی:", "0")) || 0;

  const losses =
    Number(prompt("باخت:", "0")) || 0;

  const points =
    Number(prompt("امتیاز:", "0")) || 0;

  try {
    await api("/api/standings", {
      method: "POST",
      body: JSON.stringify({
        team,
        played,
        wins,
        draws,
        losses,
        points
      })
    });

    alert("تیم اضافه شد ✅");

    await loadStandings();
    await loadAdminStandings();

  } catch (error) {
    alert(error.message);
  }
}

async function editStanding(id) {
  if (
    !confirm(
      "آیا مطمئن هستید که می‌خواهید این تیم را ویرایش کنید؟"
    )
  ) {
    return;
  }

  const team =
    prompt("نام تیم:");

  if (!team) return;

  const played =
    Number(prompt("بازی:", "0")) || 0;

  const wins =
    Number(prompt("برد:", "0")) || 0;

  const draws =
    Number(prompt("مساوی:", "0")) || 0;

  const losses =
    Number(prompt("باخت:", "0")) || 0;

  const points =
    Number(prompt("امتیاز:", "0")) || 0;

  try {
    await api(`/api/standings/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        team,
        played,
        wins,
        draws,
        losses,
        points
      })
    });

    alert("جدول ویرایش شد ✅");

    await loadStandings();
    await loadAdminStandings();

  } catch (error) {
    alert(error.message);
  }
}

// =========================
// ADMIN HONORS
// =========================

async function loadAdminHonors() {
  const honors =
    await api("/api/honors");

  const container =
    document.getElementById(
      "adminHonorsList"
    );

  if (!honors.length) {
    container.innerHTML =
      "<p>مربی‌ای ثبت نشده است.</p>";
    return;
  }

  container.innerHTML = honors.map(person => `
    <div class="admin-item">

      <span>
        ${escapeHTML(person.name)}
        — ${person.points} امتیاز
      </span>

      <div>

        <button
          onclick="editHonor(${person.id})"
        >
          ✏️ ویرایش
        </button>

        <button
          onclick="askDelete('honors', ${person.id})"
        >
          🗑️ حذف
        </button>

      </div>

    </div>
  `).join("");
}

async function addHonor() {
  const name =
    prompt("نام مربی:");

  if (!name) return;

  const points =
    Number(prompt("امتیاز:", "0")) || 0;

  try {
    await api("/api/honors", {
      method: "POST",
      body: JSON.stringify({
        name,
        points
      })
    });

    alert("مربی اضافه شد ✅");

    await loadHonors();
    await loadAdminHonors();

  } catch (error) {
    alert(error.message);
  }
}

async function editHonor(id) {
  if (
    !confirm(
      "آیا مطمئن هستید که می‌خواهید این افتخار را ویرایش کنید؟"
    )
  ) {
    return;
  }

  const name =
    prompt("نام مربی:");

  if (!name) return;

  const points =
    Number(prompt("امتیاز:", "0")) || 0;

  try {
    await api(`/api/honors/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name,
        points
      })
    });

    alert("افتخار ویرایش شد ✅");

    await loadHonors();
    await loadAdminHonors();

  } catch (error) {
    alert(error.message);
  }
}

// =========================
// ADMIN POLL
// =========================

async function loadAdminPoll() {
  const poll =
    await api("/api/poll");

  const container =
    document.getElementById("adminPoll");

  if (!poll) {
    container.innerHTML =
      "<p>نظرسنجی فعالی وجود ندارد.</p>";
    return;
  }

  container.innerHTML = `
    <div class="admin-item">

      <span>
        ${escapeHTML(poll.question)}
      </span>

      <button
        onclick="askDelete('poll', ${poll.id})"
      >
        🗑️ حذف
      </button>

    </div>
  `;
}

async function addPoll() {
  const question =
    prompt("سؤال نظرسنجی:");

  if (!question) return;

  const option1 =
    prompt("گزینه اول:");

  if (!option1) return;

  const option2 =
    prompt("گزینه دوم:");

  if (!option2) return;

  const option3 =
    prompt("گزینه سوم:");

  if (!option3) return;

  try {
    await api("/api/poll", {
      method: "POST",
      body: JSON.stringify({
        question,
        option1,
        option2,
        option3
      })
    });

    alert("نظرسنجی ساخته شد ✅");

    await loadPoll();
    await loadAdminPoll();

  } catch (error) {
    alert(error.message);
  }
}

// =========================
// ADMIN CHAT
// =========================

async function loadAdminChat() {
  const messages =
    await api("/api/chat");

  const container =
    document.getElementById(
      "adminChatList"
    );

  if (!messages.length) {
    container.innerHTML =
      "<p>پیامی وجود ندارد.</p>";
    return;
  }

  container.innerHTML = messages.map(message => `
    <div class="admin-item">

      <span>
        <strong>
          ${escapeHTML(message.username)}
        </strong>

        :
        ${escapeHTML(message.message)}
      </span>

      <button
        onclick="askDelete('chat', ${message.id})"
      >
        🗑️ حذف
      </button>

    </div>
  `).join("");
}

// =========================
// DELETE
// =========================

function askDelete(type, id) {
  deleteType = type;
  deleteTarget = id;

  document.getElementById(
    "deleteModal"
  ).style.display = "flex";
}

function closeDeleteModal() {
  document.getElementById(
    "deleteModal"
  ).style.display = "none";

  deleteTarget = null;
  deleteType = null;
}

async function confirmDelete() {
  if (!deleteTarget || !deleteType) {
    return;
  }

  try {
    await api(
      `/api/${deleteType}/${deleteTarget}`,
      {
        method: "DELETE"
      }
    );

    closeDeleteModal();

    alert("با موفقیت حذف شد 🗑️");

    await loadGames();
    await loadStandings();
    await loadHonors();
    await loadNews();
    await loadChat();
    await loadPoll();
    await loadAdminData();

  } catch (error) {
    alert(error.message);
  }
}

// =========================
// HELPERS
// =========================

function escapeHTML(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(date) {
  if (!date) return "";

  try {
    return new Date(date)
      .toLocaleDateString("fa-IR");
  } catch {
    return date;
  }
}

// =========================
// START
// =========================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    try {
      await loadGames();
      await loadStandings();
      await loadHonors();
      await loadNews();
      await loadChat();
      await loadPoll();

      const me =
        await api("/api/me");

      if (me.loggedIn) {
        document.getElementById(
          "loginBox"
        ).style.display = "none";

        document.getElementById(
          "adminPanel"
        ).style.display = "block";

        await loadAdminData();
      }

    } catch (error) {
      console.error(
        "TALON Error:",
        error
      );
    }
  }
);
