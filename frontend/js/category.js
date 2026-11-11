// Category-specific listing view. Uses the shared local prototype store.
(function () {
  const KEY = "rentrelay_listings_v1";
  const PENDING_BORROW_KEY = "rentrelay_pending_borrow_v1";
  const category = document.body.dataset.category || new URLSearchParams(location.search).get("category") || "";
  const title = document.querySelector("[data-category-title]");
  const description = document.querySelector("[data-category-description]");
  const grid = document.querySelector("#category-listings");
  const search = document.querySelector("#category-search");
  const categoryData = {
    "Books & Study": { title: "Make study easier.", description: "Find the academic essentials you need, shared by students around your campus.", icon: "✎", hint: "Search books, calculators, notes..." },
    "Electronics": { title: "Tech, when you need it.", description: "Discover useful gadgets and everyday electronics available to borrow.", icon: "⌁", hint: "Search gadgets, chargers, accessories..." },
    "Gaming": { title: "Game night, sorted.", description: "Find controllers, games and gaming accessories from fellow students.", icon: "✳", hint: "Search controllers, games, gear..." },
    "Sports": { title: "Get in the game.", description: "Find equipment for practice, matches and spontaneous campus games.", icon: "↗", hint: "Search sports equipment..." },
    "Kitchen & Hostel": { title: "The little things that help.", description: "Discover practical items for hostel routines and everyday campus living.", icon: "⌂", hint: "Search kitchen and hostel essentials..." },
    "Clothing": { title: "Wear it for the moment.", description: "Explore clothing and occasion pieces shared within your student community.", icon: "✦", hint: "Search clothing..." },
    "Other": { title: "You never know what you'll find.", description: "Browse useful things that don't fit into a single category.", icon: "＋", hint: "Search all other items..." }
  };
  const data = categoryData[category] || categoryData.Other;
  if (title) title.textContent = data.title;
  if (description) description.textContent = data.description;
  if (search) search.placeholder = data.hint;
  function getListings() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  }
  function safe(value) {
    return String(value || "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]);
  }
  function render() {
    if (!grid) return;
    const term = (search?.value || "").trim().toLowerCase();
    const items = getListings().filter(item => item.category === category &&
      [item.title,item.description,item.location].some(value => String(value || "").toLowerCase().includes(term)));
    grid.innerHTML = items.length ? items.map(item => `
      <article class="listing-card">
        <div class="listing-visual category-visual">${data.icon}</div>
        <div class="listing-content"><h3>${safe(item.title)}</h3>
          <p class="listing-meta">${safe(item.condition || "Condition not specified")} · ${safe(item.location)}</p>
          <p>${safe(item.description || "No description provided.")}</p>
          <p class="listing-price">₹${Number(item.price).toFixed(0)} / day</p>
          <button class="button primary borrow-button" type="button" data-borrow-id="${safe(item.id)}">Borrow this item</button>
        </div>
      </article>`).join("") : '<div class="empty-state">Nothing listed in this category yet. Check back soon or be the first to list something.</div>';
  }
  grid?.addEventListener("click", event => {
    const button = event.target.closest("[data-borrow-id]");
    if (!button) return;
    const item = getListings().find(entry => entry.id === button.dataset.borrowId);
    if (!item) return;
    localStorage.setItem(PENDING_BORROW_KEY, JSON.stringify({ itemId: item.id, itemTitle: item.title, createdAt: new Date().toISOString() }));
    location.href = "login.html?intent=borrow";
  });
  search?.addEventListener("input", render);
  render();
})();