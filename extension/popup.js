const BLOG_URL = "https://www.antireport-thrakis.gr/"; // Replace with your blog URL
const RSS_URL = BLOG_URL + "feeds/posts/default?alt=rss";

const list = document.getElementById("articles");
list.innerHTML = `<li class="loading">Loading...</li>`;

// Keep track of last seen titles
let lastTitles = [];

// Notifications enabled?
let notificationsEnabled = localStorage.getItem("notifications") === "true";

// ---------------- Load Articles ----------------
async function loadArticles() {
  list.innerHTML = `<li class="loading">Loading...</li>`;

  try {
    const res = await fetch(RSS_URL);
    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "application/xml");

    const items = Array.from(xml.querySelectorAll("item")).slice(0, 8);
    list.innerHTML = "";

    const newTitles = [];

    items.forEach(item => {
      const title = item.querySelector("title").textContent;
      let linkNode = item.querySelector("link");
      let link = linkNode ? linkNode.textContent : "#";

      newTitles.push(title);

      const li = document.createElement("li");
      li.className = "article";
      li.innerHTML = `<a href="${link}" target="_blank">${title}</a>`;
      list.appendChild(li);
    });

    // 🔔 Show notifications for new articles
    if (notificationsEnabled && lastTitles.length > 0) {
      const newOnes = newTitles.filter(title => !lastTitles.includes(title));
      newOnes.forEach(title => {
        showNotification("📰 New Article", title);
      });
    }

    lastTitles = newTitles;

  } catch (error) {
    list.innerHTML = `<li>Error loading feed: ${error}</li>`;
  }
}

// ---------------- Notifications ----------------
function showNotification(title, body) {
  chrome.runtime.sendMessage({
    type: "showNotification",
    title,
    body
  });
}

document.getElementById("toggleNotifications").addEventListener("click", () => {
  if (Notification.permission === "default") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        notificationsEnabled = true;
        localStorage.setItem("notifications", "true");
        alert("Notifications enabled!");
      }
    });
  } else {
    notificationsEnabled = !notificationsEnabled;
    localStorage.setItem("notifications", notificationsEnabled);
    alert(notificationsEnabled ? "Notifications enabled!" : "Notifications disabled!");
  }
});

// ---------------- Theme Toggle ----------------
function applyTheme(theme) {
  document.body.classList.remove("light", "dark");
  document.body.classList.add(theme);
  localStorage.setItem("theme", theme);
}

document.getElementById("toggleTheme").addEventListener("click", () => {
  const current = document.body.classList.contains("light") ? "light" : "dark";
  const newTheme = current === "light" ? "dark" : "light";
  applyTheme(newTheme);
});

// ---------------- View All ----------------
document.getElementById("viewAll").addEventListener("click", () => {
  window.open(BLOG_URL, "_blank");
});

// ---------------- Apply Saved Settings ----------------
const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

// ---------------- Load First Time ----------------
loadArticles();
