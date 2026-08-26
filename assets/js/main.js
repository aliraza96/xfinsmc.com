/* XFinCom Apps — site behaviour */
(function () {
  "use strict";

  /* Contact address used by the contact form. Change it here and in the
     legal pages (privacy-policy.html, terms-and-conditions.html). */
  var CONTACT_EMAIL = "info@xfinsmc.com";

  /* ---- Mobile navigation ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- Contact form ----
     No backend is attached, so the form hands off to the visitor's mail
     client. To use a real endpoint instead, give the <form> an action and
     method and delete this handler. */
  var form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var message = form.elements.message.value.trim();

    if (!name || !email || !message) {
      showNote("Please fill in your name, email and message.");
      return;
    }

    var subject = "Website enquiry from " + name;
    var body = "Name: " + name + "\nEmail: " + email + "\n\n" + message;

    window.location.href =
      "mailto:" +
      CONTACT_EMAIL +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);

    showNote("Opening your email app… If nothing happens, write to " + CONTACT_EMAIL + ".");
  });

  function showNote(text) {
    var note = form.querySelector(".form-note");
    if (!note) {
      note = document.createElement("p");
      note.className = "form-note";
      note.setAttribute("role", "status");
      form.appendChild(note);
    }
    note.textContent = text;
  }
})();
