// Smooth scroll for same-page anchors
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || id === "#" || id.startsWith("#!") ) return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Reveal on scroll
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  }
}, { threshold: 0.15 });
revealEls.forEach((el) => io.observe(el));

// Back to top
const toTop = document.getElementById("toTop");
window.addEventListener("scroll", () => {
  if (window.scrollY > 500) toTop.classList.add("show");
  else toTop.classList.remove("show");
});
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Phone input helper
const phoneInput = document.getElementById("phone");
if (phoneInput) {
  phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value
      .replace(/[^\d+()\-\s]/g, "")
      .replace(/^\d/, "+7 $&"); // quick helper for RU format
  });
}

// Lead form
const form = document.getElementById("lead-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submitBtn");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Отправляем…";

    const payload = {
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      message: document.getElementById("message").value.trim(),
      consent: document.getElementById("consent").checked
    };

    if (!payload.name || !payload.phone) {
      statusEl.textContent = "Пожалуйста, заполните имя и телефон.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Отправить";
      return;
    }
    if (!payload.consent) {
      statusEl.textContent = "Подтвердите согласие на обработку персональных данных.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Отправить";
      return;
    }

    try {
      const res = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Ошибка отправки. Попробуйте позже.");
      }
      statusEl.style.color = "#1a7f37";
      statusEl.textContent = "Заявка отправлена! Мы свяжемся с вами.";
      form.reset();
    } catch (err) {
      statusEl.style.color = "#bb2d3b";
      statusEl.textContent = err.message || "Не удалось отправить заявку.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Отправить";
    }
  });
}




