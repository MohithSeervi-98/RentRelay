// RentRelay browser-only listing prototype. Shared backend is not connected yet.
(function () {
  const STORAGE_KEY = "rentrelay_listings_v1";
  const PENDING_BORROW_KEY = "rentrelay_pending_borrow_v1";
  function getListings() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } }
  function escapeHtml(value) { return String(value || "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]); }
  function renderListings(container, searchTerm = "") {
    const term = searchTerm.trim().toLowerCase();
    const filtered = getListings().filter(item => [item.title,item.category,item.description,item.location].some(value => String(value || "").toLowerCase().includes(term)));
    if (!filtered.length) { container.innerHTML = '<div class="empty-state">No listings found yet. Be the first to list an item.</div>'; return; }
    container.innerHTML = filtered.map(item => `
      <article class="listing-card">
        ${item.photoData ? `<img class="listing-photo" src="${item.photoData}" alt="Photo of ${escapeHtml(item.title)}">` : '<div class="listing-visual" aria-hidden="true">▧</div>'}
        <div class="listing-content"><h3>${escapeHtml(item.title)}</h3>
          <p class="listing-meta">${escapeHtml(item.category)} · ${escapeHtml(item.location)}</p>
          <p>${escapeHtml(item.description || "No description provided.")}</p>
          <p class="listing-price">₹${Number(item.price).toFixed(0)} / day</p>
          <button class="button primary borrow-button" type="button" data-borrow-id="${escapeHtml(item.id)}">Borrow this item</button>
        </div>
      </article>`).join("");
  }
  document.addEventListener("DOMContentLoaded", () => {
    const feedback = document.querySelector("#explore-feedback");
    const params = new URLSearchParams(location.search);
    if (feedback && params.get("listed") === "1") feedback.textContent = "Your listing has been added to this browser prototype.";
    if (feedback && params.get("request") === "demo") feedback.textContent = "Demo borrow request recorded in this browser only. No lender has been notified.";
    const container = document.querySelector("#listing-grid");
    if (!container) return;
    const search = document.querySelector("#listing-search");
    renderListings(container);
    search?.addEventListener("input", () => renderListings(container, search.value));
    container.addEventListener("click", event => {
      const button = event.target.closest("[data-borrow-id]");
      if (!button) return;
      const item = getListings().find(entry => entry.id === button.dataset.borrowId);
      if (!item) return;
      localStorage.setItem(PENDING_BORROW_KEY, JSON.stringify({ itemId: item.id, itemTitle: item.title, createdAt: new Date().toISOString() }));
      location.href = "login.html?intent=borrow";
    });
  });
})();