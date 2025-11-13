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

// Image modal for carousels
(function setupImageModal() {
  const modal = document.getElementById('imageModal');
  if (!modal) return;
  const modalImg = modal.querySelector('img');
  const closeBtn = modal.querySelector('.img-modal__close');
  const prevBtn = modal.querySelector('.img-modal__prev');
  const nextBtn = modal.querySelector('.img-modal__next');
  
  let allImages = [];
  let currentIndex = 0;

  // Собираем все изображения из всех каруселей
  function collectAllImages() {
    allImages = Array.from(document.querySelectorAll('.carousel-item img')).map(img => ({
      src: img.src,
      alt: img.alt || ''
    }));
  }

  function open(index) {
    if (allImages.length === 0) collectAllImages();
    if (index < 0) index = allImages.length - 1;
    if (index >= allImages.length) index = 0;
    currentIndex = index;
    const img = allImages[currentIndex];
    modalImg.src = img.src;
    modalImg.alt = img.alt;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
    document.body.classList.remove('no-scroll');
  }

  function next() {
    if (allImages.length > 0) open(currentIndex + 1);
  }

  function prev() {
    if (allImages.length > 0) open(currentIndex - 1);
  }

  document.addEventListener('click', (e) => {
    const img = e.target.closest('.carousel-item img');
    if (img) {
      e.preventDefault();
      collectAllImages();
      const index = allImages.findIndex(item => item.src === img.src);
      open(index >= 0 ? index : 0);
    }
    if (e.target === modal) close();
  });

  closeBtn && closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });
  
  prevBtn && prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    prev();
  });
  
  nextBtn && nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    next();
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
})();


