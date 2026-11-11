// Category-specific listing view. Uses the shared local prototype store.
(function () {
  const KEY = "rentrelay_listings_v1", PENDING = "rentrelay_pending_borrow_v1";
  const category = document.body.dataset.category || new URLSearchParams(location.search).get("category") || "";
  const title = document.querySelector("[data-category-title]"), description = document.querySelector("[data-category-description]");
  const grid = document.querySelector("#category-listings"), search = document.querySelector("#category-search");
  const data = {
    "Books & Study":{title:"Make study easier.",description:"Find academic essentials shared by students around campus.",icon:"✎",hint:"Search books, calculators, notes..."},
    "Electronics":{title:"Tech, when you need it.",description:"Discover useful gadgets and everyday electronics available to borrow.",icon:"⌁",hint:"Search gadgets and accessories..."},
    "Gaming":{title:"Game night, sorted.",description:"Find controllers, games and gaming accessories.",icon:"✳",hint:"Search controllers, games, gear..."},
    "Sports":{title:"Get in the game.",description:"Find equipment for practice, matches and campus games.",icon:"↗",hint:"Search sports equipment..."},
    "Kitchen & Hostel":{title:"The little things that help.",description:"Discover practical items for hostel routines and campus living.",icon:"⌂",hint:"Search kitchen and hostel essentials..."},
    "Clothing":{title:"Wear it for the moment.",description:"Explore clothing and occasion pieces shared by students.",icon:"✦",hint:"Search clothing..."},
    "Other":{title:"You never know what you'll find.",description:"Browse useful things that don't fit into a single category.",icon:"＋",hint:"Search other items..."}
  }[category] || {title:"Discover something useful.",description:"Browse items shared by students.",icon:"＋",hint:"Search items..."};
  if(title) title.textContent=data.title; if(description) description.textContent=data.description; if(search) search.placeholder=data.hint;
  function getListings(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
  function safe(v){return String(v||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function render(){
    if(!grid)return;
    const term=(search?.value||"").trim().toLowerCase();
    const items=getListings().filter(x=>x.category===category&&[x.title,x.description,x.location].some(v=>String(v||"").toLowerCase().includes(term)));
    grid.innerHTML=items.length?items.map(x=>`<article class="listing-card">${x.photoData?`<img class="listing-photo" src="${x.photoData}" alt="Photo of ${safe(x.title)}">`:`<div class="listing-visual category-visual">${data.icon}</div>`}<div class="listing-content"><h3>${safe(x.title)}</h3><p class="listing-meta">${safe(x.condition||"Condition not specified")} · ${safe(x.location)}</p><p>${safe(x.description||"No description provided.")}</p><p class="listing-price">₹${Number(x.price).toFixed(0)} / day</p><button class="button primary borrow-button" type="button" data-borrow-id="${safe(x.id)}">Borrow this item</button></div></article>`).join(""):'<div class="empty-state">Nothing listed in this category yet. Check back soon or be the first to list something.</div>';
  }
  grid?.addEventListener("click",e=>{const b=e.target.closest("[data-borrow-id]");if(!b)return;const x=getListings().find(v=>v.id===b.dataset.borrowId);if(!x)return;localStorage.setItem(PENDING,JSON.stringify({itemId:x.id,itemTitle:x.title,createdAt:new Date().toISOString()}));location.href="login.html?intent=borrow"});
  search?.addEventListener("input",render);render();
})();