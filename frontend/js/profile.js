// Browser-only profile editor and listing management prototype.
(function () {
  const SESSION_KEY = "rentrelay_demo_session_v1", LISTINGS_KEY = "rentrelay_listings_v1";
  function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
  function escapeHtml(value) { return String(value || "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]); }
  function initials(name) { return String(name || "R").trim().split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase() || "R"; }
  function compress(file) { return new Promise((resolve,reject)=>{ const reader=new FileReader(); reader.onerror=()=>reject(new Error("Could not read the image.")); reader.onload=()=>{const img=new Image();img.onerror=()=>reject(new Error("Invalid image."));img.onload=()=>{const scale=Math.min(1,400/Math.max(img.width,img.height));const canvas=document.createElement("canvas");canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL("image/jpeg",.72));};img.src=reader.result;};reader.readAsDataURL(file);}); }
  function render() {
    const session=read(SESSION_KEY,null), grid=document.querySelector("#my-listings"), feedback=document.querySelector("#profile-feedback");
    if(!session){document.querySelector("#profile-edit-form").hidden=true;document.querySelector("#profile-display-name").textContent="You're browsing as a guest";document.querySelector("#profile-status").textContent="Create a profile to manage your listings.";grid.innerHTML='<div class="profile-empty">No profile session found. <a href="login.html">Create your profile</a>.</div>';return;}
    document.querySelector("#profile-display-name").textContent=session.name||"Utileo member";
    document.querySelector("#profile-email").textContent=session.email||"";
    document.querySelector("#profile-phone").textContent=session.phone||"";
    document.querySelector("#profile-name-input").value=session.name||"";
    const avatar=document.querySelector("#profile-avatar-preview");
    avatar.innerHTML=session.profilePicData?'<img src="'+session.profilePicData+'" alt="Your profile picture">':escapeHtml(initials(session.name));
    const mine=read(LISTINGS_KEY,[]).filter(item=>item.demoOwner===session.email);
    if(!mine.length){grid.innerHTML='<div class="profile-empty">You have not listed anything yet. <a href="create-listing.html">Create your first listing</a>.</div>';return;}
    grid.innerHTML=mine.map(item=>`<article class="listing-card">${item.photoData?`<img class="listing-photo" src="${item.photoData}" alt="Photo of ${escapeHtml(item.title)}">`:'<div class="listing-visual">▧</div>'}<div class="listing-content"><h3>${escapeHtml(item.title)}</h3><p class="listing-meta">${escapeHtml(item.category)} · ${escapeHtml(item.condition||"Condition not specified")}</p><p>${escapeHtml(item.description||"No description provided.")}</p><p class="listing-price">₹${Number(item.price).toFixed(0)} / day</p><div class="profile-listing-actions"><button class="delete-listing-button" type="button" data-delete-id="${escapeHtml(item.id)}">Delete listing</button></div></div></article>`).join("");
    grid.onclick=event=>{const button=event.target.closest("[data-delete-id]");if(!button)return;if(!confirm("Delete this listing? This cannot be undone in the prototype."))return;const current=read(SESSION_KEY,null),all=read(LISTINGS_KEY,[]),target=all.find(x=>x.id===button.dataset.deleteId);if(!current||!target||target.demoOwner!==current.email){feedback.textContent="You can only delete listings under your current profile.";return;}localStorage.setItem(LISTINGS_KEY,JSON.stringify(all.filter(x=>x.id!==target.id)));feedback.textContent="Listing deleted.";render();};
  }
  document.addEventListener("DOMContentLoaded",()=>{
    const form=document.querySelector("#profile-edit-form");
    if(form){form.addEventListener("submit",async event=>{event.preventDefault();const session=read(SESSION_KEY,null);if(!session)return;const name=document.querySelector("#profile-name-input").value.trim();const file=document.querySelector("#profile-photo-input").files[0];if(!name){return;}if(file){if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>8*1024*1024){document.querySelector("#profile-feedback").textContent="Choose a JPG, PNG or WebP image under 8 MB.";return;}try{session.profilePicData=await compress(file);}catch(error){document.querySelector("#profile-feedback").textContent=error.message;return;}}session.name=name;localStorage.setItem(SESSION_KEY,JSON.stringify(session));document.querySelector("#profile-feedback").textContent="Profile updated.";const navLink=document.querySelector("[data-account-link]");if(typeof updateUtileoAccountLink==="function")updateUtileoAccountLink(navLink);render();});}
    document.querySelector("#remove-profile-photo")?.addEventListener("click",()=>{const session=read(SESSION_KEY,null);if(!session)return;session.profilePicData="";localStorage.setItem(SESSION_KEY,JSON.stringify(session));document.querySelector("#profile-photo-input").value="";render();});
    render();
  });
})();