// RentRelay prototype listings. Data is stored only in this browser until the database is connected.
(function () {
  const STORAGE_KEY = "rentrelay_listings_v1";

  function getListings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveListing(listing) {
    const listings = getListings();
    listings.unshift({ ...listing, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  }

  function renderListings(container, searchTerm = "") {
    const listings = getListings();
    const term = searchTerm.trim().toLowerCase();
    const filtered = listings.filter(item =>
      [item.title, item.category, item.description, item.location]
        .some(value => String(value || "").toLowerCase().includes(term))
    );

    if (!filtered.length) {
      container.innerHTML = '<div class="empty-state">No listings found yet. Be the first to list an item.</div>';
      return;
    }

    container.innerHTML = filtered.map(item => `
      <article class="listing-card">
        <div class="listing-visual" aria-hidden="true">▧</div>
        <div class="listing-content">
          <h3>${escapeHtml(item.title)}</h3>
          <p class="listing-meta">${escapeHtml(item.category)} · ${escapeHtml(item.location)}</p>
          <p>${escapeHtml(item.description || "No description provided.")}</p>
          <p class="listing-price">₹${Number(item.price).toFixed(0)} / day</p>
        </div>
      </article>
    `).join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#listing-form");
    if (form) {
      form.addEventListener("submit", event => {
        event.preventDefault();
        const data = new FormData(form);
        const listing = Object.fromEntries(data.entries());
        if (!listing.title || !listing.category || !listing.price || !listing.location) return;
        saveListing(listing);
        form.reset();
        const message = document.querySelector("#form-message");
        if (message) message.textContent = "Listing saved in this browser. It is not visible to other students yet.";
      });
    }

    const container = document.querySelector("#listing-grid");
    if (container) {
      const search = document.querySelector("#listing-search");
      renderListings(container);
      search?.addEventListener("input", () => renderListings(container, search.value));
    }
  });
})();
