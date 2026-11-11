// Frontend-only demonstration of RentRelay's progressive sign-in flow.
// This is NOT real authentication. A backend and institutional email verification are required.
(function () {
  const LISTINGS_KEY = "rentrelay_listings_v1";
  const PENDING_LISTING_KEY = "rentrelay_pending_listing_v1";
  const PENDING_BORROW_KEY = "rentrelay_pending_borrow_v1";
  const DEMO_SESSION_KEY = "rentrelay_demo_session_v1";

  document.addEventListener("DOMContentLoaded", () => {
    const listingForm = document.querySelector("#listing-form");
    if (listingForm) {
      listingForm.addEventListener("submit", event => {
        event.preventDefault();
        if (!listingForm.reportValidity()) return;
        const listing = Object.fromEntries(new FormData(listingForm).entries());
        localStorage.setItem(PENDING_LISTING_KEY, JSON.stringify(listing));
        location.href = "login.html?intent=list";
      });
    }

    const loginForm = document.querySelector("#demo-login-form");
    if (!loginForm) return;
    const params = new URLSearchParams(location.search);
    const intent = params.get("intent");
    const pendingListing = localStorage.getItem(PENDING_LISTING_KEY);
    const pendingBorrow = JSON.parse(localStorage.getItem(PENDING_BORROW_KEY) || "null");
    const intro = document.querySelector("#auth-intro");
    const context = document.querySelector("#auth-context");
    if (intent === "list" && pendingListing) {
      intro.textContent = "Your listing details are saved temporarily. Continue the prototype sign-in to see the next step.";
      context.hidden = false;
      context.textContent = "You're preparing to publish an item.";
    } else if (intent === "borrow" && pendingBorrow) {
      intro.textContent = "Sign in before sending a request to borrow this item.";
      context.hidden = false;
      context.textContent = "Item selected: " + pendingBorrow.itemTitle;
    }

    loginForm.addEventListener("submit", event => {
      event.preventDefault();
      if (!loginForm.reportValidity()) return;
      const email = new FormData(loginForm).get("email").trim();
      // Demo-only marker. This does not verify ownership of the email address.
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ email, demo: true, createdAt: new Date().toISOString() }));
      if (intent === "list" && pendingListing) {
        const listing = JSON.parse(pendingListing);
        const listings = JSON.parse(localStorage.getItem(LISTINGS_KEY) || "[]");
        listings.unshift({ ...listing, id: crypto.randomUUID(), createdAt: new Date().toISOString(), demoOwner: email });
        localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
        localStorage.removeItem(PENDING_LISTING_KEY);
        location.href = "explore.html?listed=1";
      } else if (intent === "borrow" && pendingBorrow) {
        const requests = JSON.parse(localStorage.getItem("rentrelay_demo_borrow_requests_v1") || "[]");
        requests.unshift({ ...pendingBorrow, borrowerEmail: email, status: "demo-request", requestedAt: new Date().toISOString() });
        localStorage.setItem("rentrelay_demo_borrow_requests_v1", JSON.stringify(requests));
        localStorage.removeItem(PENDING_BORROW_KEY);
        location.href = "explore.html?request=demo";
      } else {
        location.href = "explore.html";
      }
    });
  });
})();