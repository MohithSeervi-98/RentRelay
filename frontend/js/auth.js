// Frontend-only progressive sign-in prototype. This is not secure authentication.
(function () {
  const LISTINGS_KEY = "rentrelay_listings_v1";
  const PENDING_LISTING_KEY = "rentrelay_pending_listing_v1";
  const PENDING_BORROW_KEY = "rentrelay_pending_borrow_v1";
  const DEMO_SESSION_KEY = "rentrelay_demo_session_v1";
  const CATALOGUE = {
  "Books & Study": [
    "Manga Volume",
    "Comic Book",
    "Textbook",
    "Reference Book",
    "Novel",
    "Academic Notes",
    "Previous Year Question Papers",
    "Scientific Calculator",
    "Geometry Box",
    "Drawing Instruments",
    "Lab Coat",
    "Clipboard"
  ],
  "Electronics": [
    "Laptop",
    "Laptop Cooling Pad",
    "Laptop Charger",
    "Phone Charger",
    "Power Bank",
    "Headphones",
    "Earphones",
    "USB Hub",
    "HDMI Cable",
    "Mouse",
    "Keyboard",
    "Webcam",
    "Tripod",
    "Ring Light"
  ],
  "Gaming": [
    "Game Controller",
    "PlayStation Controller",
    "Xbox Controller",
    "Nintendo Switch Controller",
    "Gaming Headset",
    "Gaming Mouse",
    "Gaming Keyboard",
    "Board Game",
    "Chess Set",
    "Playing Cards",
    "Video Game Disc"
  ],
  "Sports": [
    "Football",
    "Basketball",
    "Volleyball",
    "Badminton Racket",
    "Badminton Shuttlecock Set",
    "Tennis Racket",
    "Cricket Bat",
    "Cricket Kit",
    "Skipping Rope",
    "Yoga Mat",
    "Dumbbells",
    "Sports Shoes"
  ],
  "Kitchen & Hostel": [
    "Electric Kettle",
    "Induction Cooktop",
    "Cookware Set",
    "Frying Pan",
    "Pressure Cooker",
    "Plate Set",
    "Bowl Set",
    "Cutlery Set",
    "Knife Set",
    "Water Bottle",
    "Lunch Box",
    "Travel Mug",
    "Iron",
    "Extension Board",
    "Desk Lamp",
    "Laundry Basket"
  ],
  "Clothing": [
    "Blazer",
    "Formal Suit",
    "Ethnic Wear",
    "Kurta",
    "Saree",
    "Traditional Outfit",
    "Winter Jacket",
    "Tie",
    "Belt",
    "Formal Shoes",
    "Occasion Wear"
  ],
  "Other": [
    "Backpack",
    "Suitcase",
    "Umbrella",
    "Camera",
    "DSLR Lens",
    "Action Camera",
    "Microphone",
    "Bluetooth Speaker",
    "Projector",
    "Camping Tent",
    "Sleeping Bag",
    "Tool Kit"
  ]
};

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read this image."));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("This image could not be opened."));
        image.onload = () => {
          const scale = Math.min(1, 1000 / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.68));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const listingForm = document.querySelector("#listing-form");
    if (listingForm) {
      const category = document.querySelector("#category");
      const item = document.querySelector("#title");
      const photo = document.querySelector("#photo");
      const previewWrap = document.querySelector("#photo-preview-wrap");
      const preview = document.querySelector("#photo-preview");
      const removePhoto = document.querySelector("#remove-photo");
      const message = document.querySelector("#form-message");

      category.addEventListener("change", () => {
        item.innerHTML = '<option value="">Choose an item</option>';
        (CATALOGUE[category.value] || []).forEach(name => {
          const option = document.createElement("option");
          option.value = name;
          option.textContent = name;
          item.appendChild(option);
        });
        item.disabled = !CATALOGUE[category.value];
      });

      photo.addEventListener("change", () => {
        const file = photo.files[0];
        message.textContent = "";
        if (!file) { previewWrap.hidden = true; return; }
        if (!["image/jpeg","image/png","image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) {
          photo.value = "";
          previewWrap.hidden = true;
          message.textContent = "Choose a JPG, PNG or WebP image under 8 MB.";
          return;
        }
        preview.src = URL.createObjectURL(file);
        previewWrap.hidden = false;
      });
      removePhoto.addEventListener("click", () => {
        photo.value = "";
        preview.removeAttribute("src");
        previewWrap.hidden = true;
      });

      listingForm.addEventListener("submit", async event => {
        event.preventDefault();
        if (!listingForm.reportValidity()) return;
        const file = photo.files[0];
        if (!file) { message.textContent = "Please upload a photo of the actual item."; return; }
        const submit = listingForm.querySelector('[type="submit"]');
        submit.disabled = true;
        submit.textContent = "Preparing your listing...";
        try {
          const listing = Object.fromEntries(new FormData(listingForm).entries());
          listing.photoData = await compressImage(file);
          localStorage.setItem(PENDING_LISTING_KEY, JSON.stringify(listing));
          location.href = "login.html?intent=list";
        } catch (error) {
          message.textContent = error.message || "Could not prepare this photo. Try a smaller image.";
          submit.disabled = false;
          submit.textContent = "Continue to sign in";
        }
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
      const draft = JSON.parse(pendingListing);
      intro.textContent = "Your item and photo are saved temporarily. Sign in to continue the prototype.";
      context.hidden = false;
      context.textContent = "Listing: " + draft.title + " · " + draft.category;
    } else if (intent === "borrow" && pendingBorrow) {
      intro.textContent = "Sign in before sending a request to borrow this item.";
      context.hidden = false;
      context.textContent = "Item selected: " + pendingBorrow.itemTitle;
    }

    loginForm.addEventListener("submit", event => {
      event.preventDefault();
      if (!loginForm.reportValidity()) return;
      const email = new FormData(loginForm).get("email").trim();
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ email, demo: true, createdAt: new Date().toISOString() }));
      if (intent === "list" && pendingListing) {
        try {
          const listing = JSON.parse(pendingListing);
          const listings = JSON.parse(localStorage.getItem(LISTINGS_KEY) || "[]");
          listings.unshift({ ...listing, id: crypto.randomUUID(), createdAt: new Date().toISOString(), demoOwner: email });
          localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
          localStorage.removeItem(PENDING_LISTING_KEY);
          location.href = "explore.html?listed=1";
        } catch {
          document.querySelector("#auth-message").textContent = "Your draft could not be saved in browser storage. Try a smaller image.";
        }
      } else if (intent === "borrow" && pendingBorrow) {
        const requests = JSON.parse(localStorage.getItem("rentrelay_demo_borrow_requests_v1") || "[]");
        requests.unshift({ ...pendingBorrow, borrowerEmail: email, status: "demo-request", requestedAt: new Date().toISOString() });
        localStorage.setItem("rentrelay_demo_borrow_requests_v1", JSON.stringify(requests));
        localStorage.removeItem(PENDING_BORROW_KEY);
        location.href = "explore.html?request=demo";
      } else location.href = "explore.html";
    });
  });
})();