
    (function () {
      const root = document.documentElement;
      const ctaPrimary = document.getElementById("cta_primary");
      const ctaSecondary = document.getElementById("cta_secondary");
      const confession = document.getElementById("confession");
      const content = document.getElementById("content");
      const modalLove = document.getElementById("modal_love");
      const modalGallery = document.getElementById("modal_gallery");
      const closeLove = document.getElementById("close_love");
      const closeGallery = document.getElementById("close_gallery");
      const photoGrid = document.getElementById("photo_grid");

      function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

      function isUninjected(s) {
        return typeof s === "string" && /{{\s*[a-z_]+\s*}}/.test(s);
      }

      function setTextById(id, value) {
        const nodes = document.querySelectorAll('[data_text="' + id + '"]');
        if (!nodes || !nodes.length) return;
        nodes.forEach(function (n) { n.textContent = value; });
      }

      function setCssVar(name, value) {
        root.style.setProperty(name, value);
      }

      // 本地预览默认值：保留 {{ }} 供平台注入，但直接打开也好看
      (function applyPreviewDefaultsIfNeeded() {
        const defaults = {
          page_title: "星空告白 · 浪漫空间",
          headline: "星空告白",
          subline: "把心事交给星光，把答案留给你。",
          to_name: "你",
          from_name: "我",
          date: "2026 · 05 · 20",
          location: "在同一片星空下",
          quote_1: "你抬头看星星的时候，我在想你。",
          quote_2: "在漫长宇宙里，我只偏爱你这一束光。",
          quote_3: "如果答案是你，那我愿意奔赴一万次。",
          confession_title: "写给 你 的告白",
          confession_body: "我想把所有温柔都讲给你听。\n不止今夜，不止星光。\n\n我喜欢你，认真且坚定。",
          promise_title: "我们的约定",
          promise_1: "把日常过成仪式，把拥抱当作答案。",
          promise_2: "每次争吵都记得靠近，每次快乐都记得分享。",
          promise_3: "走到哪里都牵手，走到最后也不放手。",
          cta_primary: "把答案给我",
          cta_secondary: "继续向下看",
          modal_love_title: "今夜想对你说",
          modal_love_body: "遇见你之后，星河都变得具体。\n\n想和你分享每一次日出、每一顿晚餐、每一个普通却闪亮的日子。\n\n你愿意，和我把喜欢写成以后吗？",
          modal_gallery_title: "甜蜜光影",
          modal_gallery_subline: "把我们的小宇宙，装进每一帧。",
          modal_gallery_images: "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg\nhttps://images.pexels.com/photos/1024992/pexels-photo-1024992.jpeg\nhttps://images.pexels.com/photos/556667/pexels-photo-556667.jpeg",
          footer_left: "写给 你 · 来自 我",
          footer_right: "浪漫空间 · RomanceSpace",
          main_color: "#a78bfa",
          secondary_color: "#60a5fa",
          accent_color: "#67e8c6",
          bg_star_density: "1.15"
        };

        const need = isUninjected(document.title) || isUninjected(document.body.textContent);
        if (!need) return;

        document.title = defaults.page_title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", defaults.subline);

        Object.keys(defaults).forEach(function (k) {
          if (k === "main_color" || k === "secondary_color" || k === "accent_color" || k === "bg_star_density" || k === "page_title") return;
          setTextById(k, defaults[k]);
        });

        setCssVar("--primary", defaults.main_color);
        setCssVar("--secondary", defaults.secondary_color);
        setCssVar("--accent", defaults.accent_color);

        // 动态生成 confession_title（避免平台注入时固定死）
        setTextById("confession_title", "写给 " + defaults.to_name + " 的告白");

        // 给星点密度一个可用默认值
        root.setAttribute("data_preview_star_density", defaults.bg_star_density);
      })();

      // 背景随滚动变化：更新 CSS 变量，驱动星云位置/色相/亮度
      let raf = 0;
      function onScroll() {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          const h = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const t = clamp(window.scrollY / h, 0, 1);
          root.style.setProperty("--scroll", String(t));
          root.style.setProperty("--hue", (t * 28).toFixed(2) + "deg");
          root.style.setProperty("--glow", (0.78 + t * 0.22).toFixed(3));
          root.style.setProperty("--nebula_x", (50 + Math.sin(t * Math.PI * 2) * 18).toFixed(2) + "%");
          root.style.setProperty("--nebula_y", (32 + Math.cos(t * Math.PI * 2) * 14).toFixed(2) + "%");
        });
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();

      // CTA：平滑滚动
      function scrollToEl(el) {
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 74;
        window.scrollTo({ top: top, behavior: "smooth" });
      }

      function openModal(el) {
        if (!el) return;
        el.classList.add("is_open");
      }
      function closeModal(el) {
        if (!el) return;
        el.classList.remove("is_open");
      }

      if (ctaPrimary) {
        ctaPrimary.addEventListener("click", function () {
          openModal(modalLove);
        });
      }
      if (ctaSecondary) {
        ctaSecondary.addEventListener("click", function () {
          openModal(modalGallery);
          scrollToEl(content);
        });
      }

      if (closeLove) closeLove.addEventListener("click", function () { closeModal(modalLove); });
      if (closeGallery) closeGallery.addEventListener("click", function () { closeModal(modalGallery); });

      [modalLove, modalGallery].forEach(function (m) {
        if (!m) return;
        m.addEventListener("click", function (e) {
          if (e.target === m) closeModal(m);
        });
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          closeModal(modalLove);
          closeModal(modalGallery);
        }
      });

      function parseImages(raw) {
        if (!raw) return [];
        return raw.split(/\r?\n|,/).map(function (s) { return s.trim(); }).filter(Boolean);
      }

      function buildPhotoGrid() {
        if (!photoGrid) return;
        const dataEl = document.getElementById("data_gallery_images");
        var raw = dataEl ? dataEl.textContent.trim() : "";
        if (!raw || isUninjected(raw)) {
          raw = "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg\nhttps://images.pexels.com/photos/1024992/pexels-photo-1024992.jpeg\nhttps://images.pexels.com/photos/556667/pexels-photo-556667.jpeg";
        }
        const urls = parseImages(raw);
        if (!urls.length) return;
        photoGrid.innerHTML = "";
        urls.forEach(function (url) {
          const div = document.createElement("div");
          div.className = "photo";
          div.style.backgroundImage = "url('" + url.replace(/'/g, "\\'") + "')";
          photoGrid.appendChild(div);
        });
      }
      buildPhotoGrid();

      // 星空：轻量 Canvas 星点（无外部库）
      const canvas = document.getElementById("stars");
      const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
      let stars = [];
      let last = 0;
      
      const densityEl = document.getElementById("data_star_density");
      let densityRaw = densityEl ? densityEl.textContent.trim() : "";
      let density = parseFloat(densityRaw);

      if (isNaN(density) || isUninjected(densityRaw)) {
        const preview = parseFloat(root.getAttribute("data_preview_star_density") || "");
        density = (isFinite(preview) && preview > 0) ? preview : 1.0;
      }
      if (!isFinite(density) || density <= 0) density = 1.0;

      function resize() {
        if (!canvas || !ctx) return;
        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = Math.floor((window.innerWidth * window.innerHeight) / 9000 * density);
        stars = new Array(count).fill(0).map(function () {
          return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: 0.6 + Math.random() * 1.4,
            a: 0.25 + Math.random() * 0.65,
            tw: 0.6 + Math.random() * 1.6,
            ph: Math.random() * Math.PI * 2
          };
        });
      }

      function draw(ts) {
        if (!canvas || !ctx) return;
        const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
        last = ts;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        const scroll = parseFloat(getComputedStyle(root).getPropertyValue("--scroll")) || 0;
        const base = 0.35 + scroll * 0.18;

        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          s.ph += dt * s.tw;
          const a = clamp(base + (Math.sin(s.ph) * 0.25 + 0.25) * s.a, 0, 1);
          ctx.globalAlpha = a;
          ctx.fillStyle = "rgba(255,255,255,1)";
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
      }

      resize();
      window.addEventListener("resize", resize);
      requestAnimationFrame(draw);
    })();
  
