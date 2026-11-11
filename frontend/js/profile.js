// Browser-only profile and listing management prototype. Not secure authentication.
(function () {
  const SESSION_KEY = "rentrelay_demo_session_v1";
  const LISTINGS_KEY = "rentrelay_listings_v1";
  function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
  function escapeHtml(value) { return String(value || "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]); }
  function render() {
    const session = read(SESSION_KEY, null);
    const email = session && session.email;
    const emailNode = document.querySelector("#profile-email");
    const status = document.querySelector("#profile-status");
    const grid = document.querySelector("#my-listings");
    const feedback = document.querySelector("#profile-feedback");
    if (!email) {
      emailNode.textContent = "You're browsing as a guest";
      status.textContent = "Sign in through the prototype to view listings saved under your demo email.";
      grid.innerHTML = '<div class="profile-empty">No profile session found. <a href="login.html">Continue to sign in</a>.</div>';
      return;
    }
    emailNode.textContent = email;
    status.textContent = "Signed in to the RentRelay browser prototype.";
    const mine = read(LISTINGS_KEY, []).filter(item => item.demoOwner === email);
    if (!mine.length) {
      grid.innerHTML = '<div class="profile-empty">You haven't listed anything yet. <a href="create-listing.html">Create your first listing</a>.</div>';
      return;
    }
    grid.innerHTML = mine.map(item => `
      <article class="listing-card">
        ${item.photoData ? `<img class="listing-photo" src="${item.photoData}" alt="Photo of ${escapeHtml(item.title)}">` : '<div class="listing-visual" aria-hidden="true">▧</div>'}
        <div class="listing-content"><h3>${escapeHtml(item.title)}</h3>
          <p class="listing-meta">${escapeHtml(item.category)} · ${escapeHtml(item.condition || "Condition not specified")}</p>
          <p>${escapeHtml(item.description || "No description provided.")}</p>
          <p class="listing-price">₹${Number(item.price).toFixed(0)} / day</p>
          <div class="profile-listing-actions"><button class="delete-listing-button" type="button" data-delete-id="${escapeHtml(item.id)}">Delete listing</button></div>
        </div>
      </article>`).join("");
    grid.onclick = event => {
      const button = event.target.closest("[data-delete-id]");
      if (!button) return;
      if (!window.confirm("Delete this listing? This cannot be undone in the prototype.")) return;
      const currentSession = read(SESSION_KEY, null);
      const currentEmail = currentSession && currentSession.email;
      const all = read(LISTINGS_KEY, []);
      const target = all.find(item => item.id === button.dataset.deleteId);
      if (!target || target.demoOwner !== currentEmail) {
        feedback.textContent = "You can only delete listings saved under your current profile.";
        return;
      }
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(all.filter(item => item.id !== target.id)));
      feedback.textContent = "Listing deleted from this browser prototype.";
      render();
    };
  }
  document.addEventListener("DOMContentLoaded", render);
})();
