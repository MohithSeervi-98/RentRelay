// Adds a direct account entry to each RentRelay page navigation.
function updateRentRelayAccountLink(link) {
  if (!link) return;
  const session = (() => { try { return JSON.parse(localStorage.getItem("rentrelay_demo_session_v1") || "null"); } catch { return null; } })();
  const inPages = location.pathname.includes("/pages/");
  const base = inPages ? "" : "pages/";
  link.className = "account-nav-link";
  link.href = session ? base + "profile.html" : base + "login.html";
  link.innerHTML = "";
  if (session) {
    const avatar = document.createElement("span");
    avatar.className = "account-nav-avatar";
    if (session.profilePicData) {
      const img = document.createElement("img"); img.src = session.profilePicData; img.alt = ""; avatar.appendChild(img);
    } else {
      avatar.textContent = String(session.name || "R").trim().split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase() || "R";
    }
    const name = document.createElement("span"); name.textContent = session.name || "My profile";
    link.append(avatar, name);
  } else link.textContent = "Log in";
}
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".site-header nav"); if (!nav) return;
  let link = nav.querySelector("[data-account-link]");
  if (!link) { link = document.createElement("a"); link.dataset.accountLink = "true"; nav.appendChild(link); }
  updateRentRelayAccountLink(link);
});
