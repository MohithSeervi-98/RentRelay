// RentRelay shared frontend helpers.
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".site-header nav");
  if (!nav || nav.querySelector("[data-account-link]")) return;
  const link = document.createElement("a");
  link.dataset.accountLink = "true";
  nav.appendChild(link);
  updateRentRelayAccountLink(link, false);
});
