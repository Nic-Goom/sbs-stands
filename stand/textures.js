/* Step by Step — New Forest Show stand: canvas texture factory.
   Draws all printed graphics (banners, wall panel, screen UI) using brand
   assets + Veneer, returns THREE textures. */

const StandTextures = (() => {
  const BRAND = {
    purple: '#412576',
    lime: '#b3d12b',
    pink: '#e60d8c',
    yellow: '#f4e600',
    black: '#111111',
    white: '#ffffff',
    green: '#1d7d5c',     // show marquee green
    wood: '#b08a5a',
    grass: '#a89a62'      // late-July show grass
  };

  const IMG = {};
  const IMG_SRC = {
    splashPink: 'assets/splash-pink.png',
    splashLime: 'assets/splash-lime.png',
    splashPurple: 'assets/splash-purple.png',
    splashYellow: 'assets/splash-yellow.png',
    strokeWhite: 'assets/stroke-white.png',
    strokePink: 'assets/stroke-pink.png',
    dotsYellow: 'assets/dots-yellow.png',
    dotsPurple: 'assets/dots-purple.png',
    logoWhite: 'assets/logo-primary-white.png',
    logoWideWhite: 'assets/logo-secondary-white.png',
    bthLogo: 'assets/bth-logo.png',
    heroes: 'assets/heroes.png',
    cooking: 'assets/cooking.png',
    mediaWall: 'assets/mediawall.png',
    banner1: 'assets/banner1.png',
    banner2: 'assets/banner2.png',
    rockley: 'assets/rockley.jpg'
  };

  function loadImage(src) {
    return new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error('img failed: ' + src));
      im.src = src;
    });
  }

  const OPTIONAL_IMGS = new Set(['cooking', 'mediaWall', 'banner1', 'banner2', 'rockley']);

  async function load() {
    const font = new FontFace('Veneer', "url('fonts/Veneer.otf')");
    const loaded = await Promise.all([
      font.load(),
      ...Object.entries(IMG_SRC).map(async ([k, src]) => {
        if (OPTIONAL_IMGS.has(k)) return [k, await loadImage(src).catch(() => null)];
        return [k, await loadImage(src)];
      })
    ]);
    document.fonts.add(loaded[0]);
    loaded.slice(1).forEach(([k, im]) => { if (im) IMG[k] = im; });
  }

  function cv(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return [c, c.getContext('2d')];
  }

  function tex(canvas) {
    const t = new THREE.CanvasTexture(canvas);
    t.anisotropy = 8;
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  function veneer(ctx, text, x, y, px, color, align = 'center') {
    ctx.font = px + 'px Veneer, Impact, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }

  function body(ctx, text, x, y, px, color, align = 'center', bold = false) {
    ctx.font = (bold ? 'bold ' : '') + px + 'px Verdana, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }

  // brand staircase mark (steps grow left→right)
  function staircase(ctx, x, y, w, h, c1, c2) {
    const steps = 4;
    const sw = w / steps;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      ctx.fillStyle = mix(c1, c2, t);
      const sh = h * ((i + 1) / steps);
      ctx.fillRect(x + i * sw, y + h - sh, sw * 0.82, sh);
    }
  }

  function mix(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
    const g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
    const bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  }

  /* ---------- Front hoisted banner (2.0 x 0.72 m) ---------- */
  function makeFrontBanner() {
    const [c, x] = cv(2048, 740);
    x.fillStyle = BRAND.white; x.fillRect(0, 0, 2048, 740);
    x.globalAlpha = 0.95;
    x.drawImage(IMG.splashPink, -260, -300, 760, 760);
    x.drawImage(IMG.splashLime, 1620, 220, 700, 700);
    x.drawImage(IMG.dotsYellow, 1450, -160, 520, 520);
    x.globalAlpha = 1;
    // purple splash patch + white logo, left
    x.drawImage(IMG.splashPurple, 30, 120, 480, 480);
    x.drawImage(IMG.logoWhite, 130, 230, 280, 260);
    veneer(x, 'TAKE A STAND AGAINST', 1230, 215, 170, BRAND.purple);
    // pink stroke behind second line
    x.drawImage(IMG.strokePink, 430, 290, 1510, 230);
    veneer(x, 'YOUTH HOMELESSNESS', 1230, 408, 180, BRAND.white);
    body(x, 'SUPPORTED LODGINGS  //  FOSTERING  //  COUNSELLING  //  YOUTH SUPPORT', 1230, 580, 40, BRAND.purple, 'center', true);
    body(x, 'stepbystep.org.uk', 1230, 665, 44, BRAND.pink, 'center', true);
    return tex(c);
  }

  /* ---------- Header banner on fascia (2.6 x 0.45 m) ---------- */
  function makeHeaderBanner() {
    const [c, x] = cv(2300, 400);
    x.fillStyle = BRAND.white; x.fillRect(0, 0, 2300, 400);
    x.drawImage(IMG.splashPurple, -210, -180, 560, 560);
    x.drawImage(IMG.splashPink, 1960, 20, 520, 520);
    x.drawImage(IMG.dotsYellow, 60, 190, 380, 380);
    staircase(x, 360, 80, 300, 220, BRAND.lime, BRAND.yellow);
    veneer(x, 'STEP BY STEP', 1330, 165, 210, BRAND.purple);
    body(x, 'Young People. Hard Times. Bright Futures.', 1330, 320, 52, BRAND.pink, 'center', true);
    return tex(c);
  }

  /* ---------- Back display wall (2.4 x 1.5 m) ---------- */
  // screen cut-out zone (canvas px) so the real screen mesh sits in a framed hole
  const WALL = { w: 1920, h: 1200, screen: { cx: 1456, cy: 560, w: 380, h: 540 } };

  function makeDisplayWall() {
    const [c, x] = cv(WALL.w, WALL.h);
    x.fillStyle = BRAND.purple; x.fillRect(0, 0, WALL.w, WALL.h);
    x.globalAlpha = 0.9;
    x.drawImage(IMG.splashPink, -240, -260, 880, 880);
    x.drawImage(IMG.splashLime, 1480, 760, 720, 720);
    x.drawImage(IMG.dotsYellow, 1560, -120, 460, 460);
    x.drawImage(IMG.dotsPurple, 60, 860, 420, 420);
    x.globalAlpha = 1;

    // Be The Hero mark
    x.drawImage(IMG.bthLogo, 60, 40, 460, 460 * (IMG.bthLogo.height / IMG.bthLogo.width));

    // headline
    x.drawImage(IMG.strokeWhite, 40, 420, 1080, 200);
    veneer(x, 'TAKE A STAND AGAINST', 580, 508, 96, BRAND.purple);
    veneer(x, 'YOUTH HOMELESSNESS', 580, 660, 124, BRAND.white);
    veneer(x, 'IN THE NEW FOREST', 580, 790, 96, BRAND.yellow);

    // hero photo, bottom-left
    const hw = 520, hh = hw * (IMG.heroes.height / IMG.heroes.width);
    x.drawImage(IMG.heroes, 60, 1130 - hh, hw, hh);

    // stat
    body(x, '1,481 young people supported last year', 1170, 1060, 42, BRAND.white, 'center', true);
    x.drawImage(IMG.logoWideWhite, 700, 1100, 560, 560 * (IMG.logoWideWhite.height / IMG.logoWideWhite.width));

    // screen frame: lime surround + callout
    const s = WALL.screen;
    x.strokeStyle = BRAND.lime; x.lineWidth = 22;
    x.strokeRect(s.cx - s.w / 2 - 26, s.cy - s.h / 2 - 26, s.w + 52, s.h + 52);
    x.fillStyle = BRAND.black;
    x.fillRect(s.cx - s.w / 2, s.cy - s.h / 2, s.w, s.h);
    x.drawImage(IMG.strokePink, s.cx - 300, s.cy - s.h / 2 - 170, 600, 120);
    veneer(x, 'TAP ME!', s.cx, s.cy - s.h / 2 - 112, 80, BRAND.white);
    body(x, 'Meet the young people you could help', s.cx, s.cy + s.h / 2 + 80, 36, BRAND.white, 'center', true);
    return tex(c);
  }

  /* ---------- Mobile Pixels screen UI (portrait) ---------- */
  function makeScreenUI() {
    const [c, x] = cv(560, 840);
    x.fillStyle = BRAND.white; x.fillRect(0, 0, 560, 840);
    x.fillStyle = BRAND.purple; x.fillRect(0, 0, 560, 130);
    veneer(x, 'BE THE HERO', 280, 52, 64, BRAND.white);
    body(x, 'Tap a story to explore', 280, 102, 24, BRAND.lime, 'center', true);
    const tiles = [BRAND.pink, BRAND.lime, BRAND.yellow, BRAND.purple, BRAND.lime, BRAND.pink];
    tiles.forEach((col, i) => {
      const tx = 30 + (i % 2) * 260, ty = 160 + Math.floor(i / 2) * 190;
      x.fillStyle = col; x.fillRect(tx, ty, 240, 170);
      x.fillStyle = 'rgba(17,17,17,.78)'; x.fillRect(tx, ty + 122, 240, 48);
      body(x, ['Ben\u2019s story', 'Foster with us', 'Quiz: myth or fact?', 'A host\u2019s home', 'Donate \u00a33', 'Volunteer'][i], tx + 120, ty + 146, 21, BRAND.white, 'center', true);
    });
    x.fillStyle = BRAND.black; x.fillRect(0, 740, 560, 100);
    body(x, 'stepbystep.org.uk  //  01252 346100', 280, 790, 24, BRAND.white, 'center', true);
    return tex(c);
  }

  /* ---------- Trio of pull-up banners (the real artwork) ---------- */
  function rollBase(x, top, bottom) {
    // pink top / purple skyline bottom — the brand roll-up template
    x.fillStyle = top; x.fillRect(0, 0, 512, 1280);
    x.fillStyle = bottom; x.fillRect(0, 760, 512, 520);
    x.globalAlpha = 0.9;
    x.drawImage(IMG.splashLime, -90, 560, 320, 320);
    x.drawImage(IMG.splashYellow, 360, 700, 260, 260);
    x.globalAlpha = 1;
    // skyline silhouette suggestion
    x.fillStyle = 'rgba(20,10,50,.55)';
    for (let i = 0; i < 16; i++) {
      const bw = 26 + Math.random() * 18;
      x.fillRect(i * 32, 1170 - Math.random() * 90, bw, 110);
    }
  }
  function findOutMore(x, y) {
    x.fillStyle = BRAND.white;
    roundRect(x, 150, y, 210, 78, 39); x.fill();
    body(x, 'FIND OUT MORE', 255, y + 30, 21, BRAND.purple, 'center', true);
    body(x, 'SCAN THE QR CODE', 255, y + 56, 14, BRAND.purple, 'center', true);
    x.fillStyle = BRAND.purple; x.fillRect(372, y + 2, 74, 74);
    x.fillStyle = BRAND.white;
    for (let i = 0; i < 36; i++) if (Math.random() > 0.45) x.fillRect(378 + (i % 6) * 11, y + 8 + Math.floor(i / 6) * 11, 9, 9);
  }
  function roundRect(x, rx, ry, w, h, r) {
    x.beginPath();
    x.moveTo(rx + r, ry); x.arcTo(rx + w, ry, rx + w, ry + h, r);
    x.arcTo(rx + w, ry + h, rx, ry + h, r); x.arcTo(rx, ry + h, rx, ry, r);
    x.arcTo(rx, ry, rx + w, ry, r); x.closePath();
  }
  function makeRollups() {
    const out = [];
    // 1 — BEHIND EVERY HERO IS SOMEONE WHO CARES
    {
      const [c, x] = cv(512, 1280);
      rollBase(x, BRAND.pink, BRAND.purple);
      veneer(x, 'BEHIND EVERY', 256, 150, 64, BRAND.white);
      x.fillStyle = BRAND.yellow; roundRect(x, 150, 188, 130, 64, 8); x.fill();
      veneer(x, 'HERO', 215, 222, 58, BRAND.purple);
      veneer(x, 'IS SOMEONE', 300, 222, 58, BRAND.white, 'left');
      veneer(x, 'WHO CARES', 256, 290, 64, BRAND.white);
      body(x, 'Can you make a difference', 256, 360, 26, BRAND.lime, 'center', true);
      body(x, "in a young person's life?", 256, 392, 26, BRAND.lime, 'center', true);
      // host/fostering photo placeholder
      x.fillStyle = 'rgba(255,255,255,.12)';
      roundRect(x, 120, 460, 280, 250, 14); x.fill();
      x.drawImage(IMG.heroes, 130, 470, 260, 260 * (IMG.heroes.height / IMG.heroes.width));
      x.drawImage(IMG.logoWhite, 40, 980, 150, 142);
      findOutMore(x, 1010);
      body(x, 'stepbystep.org.uk', 256, 1180, 26, BRAND.white, 'center', true);
      out.push(tex(c));
    }
    // 2 — TAKE A STAND AGAINST YOUTH HOMELESSNESS + service tags
    {
      const [c, x] = cv(512, 1280);
      rollBase(x, BRAND.pink, BRAND.purple);
      body(x, '#BE THE HERO', 256, 110, 30, BRAND.white, 'center', true);
      veneer(x, 'TAKE A STAND', 256, 175, 62, BRAND.white);
      veneer(x, 'AGAINST YOUTH', 256, 235, 56, BRAND.yellow);
      veneer(x, 'HOMELESSNESS', 256, 295, 56, BRAND.white);
      const tags = ['FOSTERING', 'SUPPORTED ACCOMMODATION', 'YOUTH SUPPORT & WELLBEING', 'COUNSELLING'];
      tags.forEach((t, i) => {
        const ty = 380 + i * 78;
        x.fillStyle = BRAND.white; roundRect(x, 90, ty, 332, 56, 28); x.fill();
        body(x, t, 256, ty + 30, t.length > 18 ? 18 : 22, BRAND.purple, 'center', true);
      });
      x.drawImage(IMG.logoWhite, 40, 980, 150, 142);
      findOutMore(x, 1010);
      body(x, 'stepbystep.org.uk', 256, 1180, 26, BRAND.white, 'center', true);
      out.push(tex(c));
    }
    // 3 — BE THE HERO OF YOUR OWN STORY (youth-facing, black)
    {
      const [c, x] = cv(512, 1280);
      x.fillStyle = BRAND.black; x.fillRect(0, 0, 512, 480);
      x.fillStyle = BRAND.pink; x.fillRect(0, 480, 512, 800);
      x.globalAlpha = 0.9; x.drawImage(IMG.splashLime, 300, 360, 280, 280);
      x.drawImage(IMG.dotsYellow, 360, 40, 200, 200); x.globalAlpha = 1;
      x.fillStyle = BRAND.purple; x.fillRect(0, 760, 512, 520);
      veneer(x, 'BE THE', 256, 110, 70, BRAND.white);
      x.fillStyle = BRAND.yellow; roundRect(x, 175, 140, 162, 70, 8); x.fill();
      veneer(x, 'HERO', 256, 178, 64, BRAND.black);
      veneer(x, 'OF YOUR', 256, 250, 64, BRAND.white);
      veneer(x, 'OWN STORY', 256, 315, 64, BRAND.lime);
      body(x, 'Free, confidential advice for', 256, 392, 22, BRAND.white, 'center', true);
      body(x, 'young people who need a hand.', 256, 422, 22, BRAND.white, 'center', true);
      body(x, 'HOUSING // WELLBEING // BENEFITS', 256, 560, 18, BRAND.white, 'center', true);
      body(x, 'MENTAL HEALTH // WORK & EDUCATION', 256, 590, 18, BRAND.white, 'center', true);
      x.drawImage(IMG.logoWhite, 40, 980, 150, 142);
      findOutMore(x, 1010);
      body(x, 'stepbystep.org.uk', 256, 1180, 26, BRAND.white, 'center', true);
      out.push(tex(c));
    }
    // Override drawn designs with flat artwork files when uploaded
    function flatBanner(img) { const [c, x] = cv(img.width, img.height); x.drawImage(img, 0, 0); return tex(c); }
    if (IMG.banner1) out[0] = flatBanner(IMG.banner1);
    if (IMG.banner2) out[2] = flatBanner(IMG.banner2);
    return out;
  }

  /* ---------- Tension-fabric media wall — "Open Your Home" fostering design ---------- */
  function makeMediaWall() {
    const [c, x] = cv(2000, 1250);

    // If the full poster image has been uploaded, use it directly (scale to fill)
    if (IMG.mediaWall) {
      const sc = Math.max(2000 / IMG.mediaWall.width, 1250 / IMG.mediaWall.height);
      const dw = IMG.mediaWall.width * sc, dh = IMG.mediaWall.height * sc;
      x.drawImage(IMG.mediaWall, (2000 - dw) / 2, (1250 - dh) / 2, dw, dh);
      return tex(c);
    }

    // Fallback: recreate the brand design from scratch
    // Hot pink / magenta base (matches the reference poster)
    x.fillStyle = BRAND.pink; x.fillRect(0, 0, 2000, 1250);

    // Large purple blob — right-centre, creates the purple coverage in the reference
    x.globalAlpha = 0.88; x.drawImage(IMG.splashPurple, 560, -300, 1700, 1700);
    // Second purple blob — lower left
    x.globalAlpha = 0.65; x.drawImage(IMG.splashPurple, -280, 530, 1150, 1150);
    x.globalAlpha = 1;

    // Lime / yellow accent splashes, lower left (like the reference)
    x.globalAlpha = 0.75;
    x.drawImage(IMG.splashYellow, 50, 920, 440, 440);
    x.drawImage(IMG.splashLime, 0, 1060, 350, 350);
    x.globalAlpha = 1;

    // Large halftone dots — right side
    x.globalAlpha = 0.55;
    x.drawImage(IMG.dotsPurple, 1280, 360, 760, 760);
    x.drawImage(IMG.dotsYellow, 1680, 800, 420, 420);
    x.globalAlpha = 1;

    // Step by Step logo — top right corner
    const logoW = 270 * (IMG.logoWhite.width / IMG.logoWhite.height);
    x.drawImage(IMG.logoWhite, 2000 - logoW - 28, 26, logoW, 270);

    // Main headline — large white Veneer, left-aligned
    veneer(x, 'OPEN YOUR HOME', 62, 136, 164, BRAND.white, 'left');
    veneer(x, 'TO A YOUNG PERSON', 62, 302, 164, BRAND.white, 'left');

    // Service tags
    body(x, 'SUPPORTED LODGINGS  |  FOSTERING', 62, 390, 40, BRAND.white, 'left', true);

    // White paint stroke background for SPARE ROOM? (matches reference)
    x.drawImage(IMG.strokeWhite, -30, 406, 1020, 178);
    veneer(x, 'SPARE ROOM?', 66, 496, 88, BRAND.purple, 'left');

    // CTA line — pink on purple area (clearly visible)
    body(x, "YOU CAN MAKE A DIFFERENCE IN A YOUNG PERSON'S LIFE", 62, 608, 36, BRAND.pink, 'left', true);

    // Photo — bottom area; uses cooking.png when available, falls back to heroes.png
    const photoImg = IMG.cooking || IMG.heroes;
    const ph = 820;
    const pw = ph * (photoImg.width / photoImg.height);
    // Position: centred around x=1100, sitting on the bottom edge
    x.drawImage(photoImg, Math.max(600, 1100 - pw / 2), 1250 - ph, pw, ph);

    return tex(c);
  }

  /* ---------- Screen totem panel (freestanding, removable) ---------- */
  // screen recess location on the totem (canvas px) — 700x1700 canvas
  const TOTEM = { w: 700, h: 1700, screen: { cx: 350, cy: 760, w: 300, h: 470 } };
  function makeTotem() {
    const [c, x] = cv(TOTEM.w, TOTEM.h);
    x.fillStyle = BRAND.purple; x.fillRect(0, 0, TOTEM.w, TOTEM.h);
    x.globalAlpha = 0.92;
    x.drawImage(IMG.splashPink, -160, -120, 520, 520);
    x.drawImage(IMG.splashLime, 360, 1320, 460, 460);
    x.drawImage(IMG.dotsYellow, 420, 40, 320, 320);
    x.globalAlpha = 1;
    x.drawImage(IMG.bthLogo, 110, 90, 480, 480 * (IMG.bthLogo.height / IMG.bthLogo.width));
    x.drawImage(IMG.strokePink, 70, 360, 560, 130);
    veneer(x, 'TAP TO MEET', 350, 426, 84, BRAND.white);
    // screen recess: lime frame + black hole (the real screen mesh sits proud here)
    const s = TOTEM.screen;
    x.fillStyle = BRAND.lime;
    roundRect(x, s.cx - s.w / 2 - 26, s.cy - s.h / 2 - 26, s.w + 52, s.h + 52, 18); x.fill();
    x.fillStyle = BRAND.black;
    roundRect(x, s.cx - s.w / 2, s.cy - s.h / 2, s.w, s.h, 10); x.fill();
    body(x, 'the young people you could help', 350, s.cy + s.h / 2 + 70, 30, BRAND.white, 'center', true);
    x.drawImage(IMG.logoWhite, 275, 1470, 150, 142);
    body(x, 'stepbystep.org.uk', 350, 1640, 30, BRAND.lime, 'center', true);
    return tex(c);
  }

  /* ---------- A-frame pavement board ---------- */
  function makeAFrame() {
    const [c, x] = cv(800, 1100);
    x.fillStyle = BRAND.purple; x.fillRect(0, 0, 800, 1100);
    x.globalAlpha = 0.15; x.drawImage(IMG.dotsPurple, 420, 700, 420, 420); x.globalAlpha = 1;
    // pink splash top-right — clear of the F
    x.drawImage(IMG.splashPink, 510, -110, 370, 370);

    // --- TOP SECTION: FREE GAME ---
    veneer(x, 'FREE', 400, 155, 165, BRAND.lime);
    veneer(x, 'GAME!', 400, 300, 165, BRAND.pink);
    body(x, 'Play our Step Up Challenge', 400, 360, 30, BRAND.white, 'center', true);

    // divider
    x.drawImage(IMG.strokeWhite, 60, 390, 680, 90);

    // --- BOTTOM SECTION: competition ---
    veneer(x, 'COMPETITION', 400, 510, 58, BRAND.lime);
    veneer(x, 'WIN!', 400, 600, 105, BRAND.yellow);
    body(x, 'A FREE family holiday', 400, 655, 33, BRAND.white, 'center', true);
    veneer(x, 'ROCKLEY PARK', 400, 715, 66, BRAND.pink);
    body(x, 'Poole, Dorset  •  See us for details', 400, 753, 24, BRAND.white, 'center', true);

    // Rockley Park photo
    if (IMG.rockley) {
      const iw = 580, ih = 200, ix = 110, iy = 778;
      x.save();
      roundRect(x, ix, iy, iw, ih, 14); x.clip();
      const sc = Math.max(iw / IMG.rockley.width, ih / IMG.rockley.height);
      const dw = IMG.rockley.width * sc, dh = IMG.rockley.height * sc;
      x.drawImage(IMG.rockley, ix + (iw - dw) / 2, iy + (ih - dh) / 2, dw, dh);
      x.restore();
    }

    // logo
    x.drawImage(IMG.logoWhite, 320, 1000, 160, 80);
    return tex(c);
  }

  /* ---------- "Step Up" hole-in-the-board game ---------- */
  function wrapLines(text, maxChars) {
    const words = text.split(' ');
    const lines = []; let cur = '';
    words.forEach(w => {
      if ((cur + ' ' + w).trim().length > maxChars) { if (cur) lines.push(cur.trim()); cur = w; }
      else cur = (cur + ' ' + w).trim();
    });
    if (cur) lines.push(cur);
    return lines;
  }
  function labelPill(x, text, cx, cy, fs, maxChars) {
    const lines = wrapLines(text, maxChars);
    const longest = Math.max.apply(null, lines.map(l => l.length));
    const w = longest * fs * 0.62 + 30;
    const h = lines.length * fs * 1.24 + 16;
    cx = Math.max(w / 2 + 8, Math.min(900 - w / 2 - 8, cx));
    x.fillStyle = BRAND.white;
    roundRect(x, cx - w / 2, cy - h / 2, w, h, 12); x.fill();
    lines.forEach((l, i) => body(x, l, cx, cy - h / 2 + 8 + fs * 0.7 + i * fs * 1.24, fs, BRAND.purple, 'center', true));
  }
  function drawHole(x, cx, cy, r) {
    x.fillStyle = 'rgba(0,0,0,.22)'; x.beginPath(); x.arc(cx, cy + 7, r + 14, 0, 7); x.fill();
    x.fillStyle = BRAND.white; x.beginPath(); x.arc(cx, cy, r + 12, 0, 7); x.fill();
    x.fillStyle = '#0a0a0a'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
    x.fillStyle = 'rgba(255,255,255,.08)'; x.beginPath(); x.arc(cx - r * 0.3, cy - r * 0.3, r * 0.5, 0, 7); x.fill();
  }
  function drawDoor(x, dx, dy, w, h) {
    x.fillStyle = BRAND.lime;
    x.beginPath();
    x.moveTo(dx, dy + h); x.lineTo(dx, dy + 34);
    x.quadraticCurveTo(dx, dy, dx + w / 2, dy);
    x.quadraticCurveTo(dx + w, dy, dx + w, dy + 34);
    x.lineTo(dx + w, dy + h); x.closePath(); x.fill();
    x.lineWidth = 8; x.strokeStyle = BRAND.white; x.stroke();
    x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(dx + 18, dy + 48, w - 36, h - 72);
    x.fillStyle = BRAND.white; x.beginPath(); x.arc(dx + w - 28, dy + h / 2 + 22, 9, 0, 7); x.fill();
  }
  function makeGameBoard() {
    const [c, x] = cv(900, 1400);
    const headerH = 240, bandH = 290;
    // header with front door
    x.fillStyle = BRAND.black; x.fillRect(0, 0, 900, headerH);
    drawDoor(x, 120, 42, 150, 162);
    veneer(x, 'YOUR OWN', 580, 100, 76, BRAND.lime);
    veneer(x, 'FRONT DOOR', 580, 178, 76, BRAND.white);
    // bands drawn top→bottom (Money, Cooking, Counselling, Safe)
    const bands = [
      { col: BRAND.pink, tcol: BRAND.white, title: ['MONEY &', 'BUDGETING'], holes: [{ x: 540, label: 'No money for interview clothes' }, { x: 772, label: 'Need a rent guarantor' }] },
      { col: BRAND.lime, tcol: BRAND.purple, title: ['COOKING &', 'LIFE SKILLS'], holes: [{ x: 540, label: 'Turning 18, funding stops' }, { x: 772, label: 'Can\u2019t afford a laptop for college' }] },
      { col: BRAND.yellow, tcol: BRAND.purple, title: ['COUNSELLING', '& SUPPORT'], holes: [{ x: 660, label: 'Trauma, no one to talk to' }] },
      { col: BRAND.purple, tcol: BRAND.white, title: ['SAFE PLACE', 'TO STAY'], holes: [{ x: 660, label: 'Sofa-surfing, nowhere safe' }] }
    ];
    bands.forEach((b, i) => {
      const by = headerH + i * bandH;
      x.fillStyle = b.col; x.fillRect(0, by, 900, bandH);
      x.fillStyle = 'rgba(0,0,0,.13)'; x.fillRect(0, by, 900, 5);
      // step number chip
      x.fillStyle = 'rgba(255,255,255,.85)';
      roundRect(x, 30, by + bandH / 2 - 78, 64, 64, 12); x.fill();
      veneer(x, String(4 - i), 62, by + bandH / 2 - 44, 52, BRAND.pink);
      // band title
      veneer(x, b.title[0], 116, by + bandH / 2 - 36, 52, b.tcol, 'left');
      veneer(x, b.title[1], 116, by + bandH / 2 + 26, 52, b.tcol, 'left');
      // holes + hurdle labels
      b.holes.forEach(h => {
        const cy = by + bandH / 2 - 30;
        drawHole(x, h.x, cy, 56);
        labelPill(x, h.label, h.x, cy + 116, 21, 18);
      });
    });
    return tex(c);
  }

  /* ---------- Single-column leaflet pocket ---------- */
  function makeLeafletOne() {
    const [c, x] = cv(360, 512);
    x.fillStyle = BRAND.purple; x.fillRect(0, 0, 360, 512);
    x.globalAlpha = 0.9;
    x.drawImage(IMG.splashPink, -60, -70, 260, 260);
    x.drawImage(IMG.splashLime, 200, 360, 220, 220);
    x.globalAlpha = 1;
    staircase(x, 120, 60, 120, 84, BRAND.lime, BRAND.yellow);
    veneer(x, 'BE THE', 180, 232, 50, BRAND.white);
    veneer(x, 'HERO', 180, 288, 56, BRAND.yellow);
    body(x, 'How you can help', 180, 352, 21, BRAND.white, 'center', true);
    x.drawImage(IMG.logoWhite, 120, 392, 120, 114);
    return tex(c);
  }
  // window = where the real screen mesh sits; board is printed brand, window is the hole
  const BOARD = { w: 900, h: 1180, win: { cx: 450, cy: 720, w: 360, h: 500 } };
  function makeScreenBoard() {
    const [c, x] = cv(BOARD.w, BOARD.h);
    x.fillStyle = BRAND.purple; x.fillRect(0, 0, BOARD.w, BOARD.h);
    x.globalAlpha = 0.92;
    x.drawImage(IMG.splashPink, -180, -150, 540, 540);
    x.drawImage(IMG.splashLime, 580, 860, 500, 500);
    x.drawImage(IMG.dotsYellow, 620, -110, 340, 340);
    x.globalAlpha = 1;
    // headline above the tablet — white, as requested
    veneer(x, 'TAKE A STAND AGAINST', 450, 175, 80, BRAND.white);
    veneer(x, 'YOUTH HOMELESSNESS', 450, 282, 94, BRAND.white);
    x.fillStyle = BRAND.lime; x.fillRect(250, 348, 400, 8);
    // the cut-out window: lime inner border + black hole (real screen sits in it)
    const w = BOARD.win;
    x.fillStyle = BRAND.lime;
    roundRect(x, w.cx - w.w / 2 - 22, w.cy - w.h / 2 - 22, w.w + 44, w.h + 44, 16); x.fill();
    x.fillStyle = BRAND.black;
    roundRect(x, w.cx - w.w / 2, w.cy - w.h / 2, w.w, w.h, 10); x.fill();
    body(x, 'TAP TO MEET THE YOUNG PEOPLE YOU COULD HELP', 450, w.cy + w.h / 2 + 58, 25, BRAND.white, 'center', true);
    x.drawImage(IMG.logoWhite, 375, 1035, 150, 142);
    return tex(c);
  }

  /* ---------- White shimmery softening fabric (left wall) ---------- */
  function makeShimmerFabric() {
    const [c, x] = cv(1024, 700);
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, 1024, 700);
    // soft vertical folds
    const folds = 22;
    for (let i = 0; i < folds; i++) {
      const fx = (i / folds) * 1024;
      const g = x.createLinearGradient(fx, 0, fx + 1024 / folds, 0);
      g.addColorStop(0, 'rgba(214,224,232,0.55)');
      g.addColorStop(0.5, 'rgba(255,255,255,0)');
      g.addColorStop(1, 'rgba(214,224,232,0.55)');
      x.fillStyle = g;
      x.fillRect(fx, 0, 1024 / folds, 700);
    }
    // subtle sheen sparkle
    for (let i = 0; i < 400; i++) {
      x.fillStyle = 'rgba(255,255,255,' + (0.3 + Math.random() * 0.5) + ')';
      x.fillRect(Math.random() * 1024, Math.random() * 700, 2, 2);
    }
    const t = tex(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1.6, 1);
    return t;
  }

  /* ---------- Closed camping shelving unit (staff area) ---------- */
  function makeShelfUnit() {
    const [c, x] = cv(512, 820);
    x.fillStyle = '#37414f'; x.fillRect(0, 0, 512, 820);   // grey camping fabric
    // two zip-up door panels
    x.strokeStyle = 'rgba(20,26,34,.8)'; x.lineWidth = 5;
    x.strokeRect(24, 24, 464, 772);
    x.beginPath(); x.moveTo(256, 24); x.lineTo(256, 796); x.stroke();   // centre zip
    // shelf seams
    x.strokeStyle = 'rgba(15,20,28,.55)'; x.lineWidth = 3;
    [205, 410, 615].forEach(yy => { x.beginPath(); x.moveTo(24, yy); x.lineTo(488, yy); x.stroke(); });
    // zip pulls
    x.fillStyle = '#9aa6b2';
    [150, 360, 560].forEach(yy => x.fillRect(248, yy, 16, 30));
    // small step-by-step tab
    x.fillStyle = BRAND.purple; roundRect(x, 176, 360, 160, 70, 8); x.fill();
    body(x, 'STORAGE', 256, 396, 24, BRAND.white, 'center', true);
    return tex(c);
  }

  /* ---------- Step by Step table cloth ---------- */
  function makeTablecloth() {
    const [c, x] = cv(900, 700);
    x.fillStyle = BRAND.purple; x.fillRect(0, 0, 900, 700);
    x.globalAlpha = 0.16;
    x.drawImage(IMG.dotsYellow, 40, 360, 320, 320);
    x.drawImage(IMG.dotsPurple, 600, 380, 320, 320);
    x.globalAlpha = 1;
    x.drawImage(IMG.logoWideWhite, 230, 470, 440, 440 * (IMG.logoWideWhite.height / IMG.logoWideWhite.width));
    return tex(c);
  }

  /* ---------- Side-wall backdrop (for traffic from the other direction) ---------- */
  function makeSideBackdrop() {
    const [c, x] = cv(2000, 1250);
    x.fillStyle = BRAND.pink; x.fillRect(0, 0, 2000, 1250);
    x.fillStyle = BRAND.purple; x.fillRect(0, 720, 2000, 530);
    x.globalAlpha = 0.92;
    x.drawImage(IMG.splashLime, -240, 560, 720, 720);
    x.drawImage(IMG.splashYellow, 1480, -180, 640, 640);
    x.drawImage(IMG.dotsPurple, 1500, 760, 460, 460);
    x.globalAlpha = 1;
    veneer(x, 'YOUNG PEOPLE.', 1000, 250, 150, BRAND.white);
    veneer(x, 'HARD TIMES.', 1000, 430, 150, BRAND.yellow);
    veneer(x, 'BRIGHT FUTURES.', 1000, 610, 150, BRAND.white);
    x.drawImage(IMG.strokeWhite, 560, 800, 900, 180);
    veneer(x, 'BE THE HERO', 1010, 895, 110, BRAND.purple);
    x.drawImage(IMG.logoWideWhite, 700, 1030, 600, 600 * (IMG.logoWideWhite.height / IMG.logoWideWhite.width));
    return tex(c);
  }
  function makeDeskWrap() {
    const [c, x] = cv(1400, 700);
    x.fillStyle = BRAND.purple; x.fillRect(0, 0, 1400, 700);
    x.globalAlpha = 0.9;
    x.drawImage(IMG.dotsPurple, 60, 30, 360, 360);
    x.drawImage(IMG.splashLime, 1080, 420, 420, 420);
    x.drawImage(IMG.splashPink, 980, -200, 460, 460);
    x.globalAlpha = 1;
    x.drawImage(IMG.logoWhite, 280, 90, 240, 230);
    x.drawImage(IMG.strokePink, 240, 360, 920, 130);
    veneer(x, 'SAY HELLO', 700, 420, 96, BRAND.white);
    body(x, 'Grab a sticker \u2022 play the game \u2022 ask us anything', 700, 560, 36, BRAND.white, 'center', true);
    // repeat motif so the wrap reads from all angles
    x.drawImage(IMG.logoWhite, 980, 90, 200, 190);
    return tex(c);
  }

  /* ---------- Donation bucket wrap ---------- */
  function makeBucketWrap() {
    const [c, x] = cv(600, 280);
    x.fillStyle = BRAND.purple; x.fillRect(0, 0, 600, 280);
    x.fillStyle = BRAND.white; x.fillRect(0, 95, 600, 95);
    veneer(x, 'DONATE', 300, 142, 72, BRAND.pink);
    body(x, '\u00a31 = \u00a36.80 of social value', 300, 235, 26, BRAND.white, 'center', true);
    return tex(c);
  }

  /* ---------- Game sign ---------- */
  function makeGameSign() {
    const [c, x] = cv(900, 460);
    x.fillStyle = BRAND.lime; x.fillRect(0, 0, 900, 460);
    x.drawImage(IMG.dotsPurple, 600, 240, 300, 300);
    veneer(x, 'STEP UP', 450, 120, 150, BRAND.purple);
    veneer(x, 'CHALLENGE', 450, 260, 110, BRAND.black);
    body(x, 'Land a beanbag on the top step to win!', 450, 380, 38, BRAND.purple, 'center', true);
    return tex(c);
  }

  /* ---------- Leaflet rack front ---------- */
  function makeLeafletRow() {
    const [c, x] = cv(512, 380);
    const cols = [BRAND.pink, BRAND.purple, BRAND.lime, BRAND.yellow];
    cols.forEach((col, i) => {
      const lx = 14 + i * 124;
      x.fillStyle = col; x.fillRect(lx, 20, 108, 340);
      x.fillStyle = 'rgba(255,255,255,.92)'; x.fillRect(lx + 10, 50, 88, 60);
      staircase(x, lx + 32, 60, 44, 40, BRAND.lime, BRAND.yellow);
    });
    return tex(c);
  }

  /* ---------- Pennant bunting strand (alpha) ---------- */
  function makePennants() {
    const [c, x] = cv(1800, 140);
    const cols = [BRAND.purple, BRAND.lime, BRAND.pink, BRAND.yellow];
    for (let i = 0; i < 15; i++) {
      const px0 = i * 120;
      x.fillStyle = cols[i % 4];
      x.beginPath();
      x.moveTo(px0 + 6, 8); x.lineTo(px0 + 114, 8); x.lineTo(px0 + 60, 134);
      x.closePath(); x.fill();
    }
    x.fillStyle = 'rgba(255,255,255,.9)'; x.fillRect(0, 0, 1800, 9);
    const t = tex(c);
    return t;
  }

  /* ---------- Grass + wood + planks ---------- */
  function noiseFill(x, w, h, base, vary, n) {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) {
      x.fillStyle = 'rgba(' + vary + ',' + (0.04 + Math.random() * 0.1) + ')';
      x.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 5, 2 + Math.random() * 12);
    }
  }

  function makeGrass() {
    const [c, x] = cv(512, 512);
    noiseFill(x, 512, 512, '#96a058', '55,80,30', 2600);
    const t = tex(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(10, 10);
    return t;
  }

  function makePlanks() {
    const [c, x] = cv(512, 256);
    x.fillStyle = '#8a6a42'; x.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 4; i++) {
      x.fillStyle = i % 2 ? '#94734a' : '#83653f';
      x.fillRect(0, i * 64, 512, 60);
    }
    x.fillStyle = 'rgba(60,40,20,.5)';
    for (let i = 0; i < 60; i++) x.fillRect(Math.random() * 512, Math.random() * 256, 30, 1.5);
    return tex(c);
  }

  /* ---------- Numbered label sprite ---------- */
  function makeLabel(n) {
    const [c, x] = cv(192, 192);
    x.fillStyle = 'rgba(17,17,17,.25)';
    x.beginPath(); x.arc(100, 104, 82, 0, 7); x.fill();
    x.fillStyle = BRAND.lime;
    x.beginPath(); x.arc(96, 96, 80, 0, 7); x.fill();
    x.strokeStyle = BRAND.white; x.lineWidth = 10;
    x.beginPath(); x.arc(96, 96, 75, 0, 7); x.stroke();
    veneer(x, String(n), 96, 102, 104, BRAND.purple);
    return tex(c);
  }

  /* ---------- Curtain fabric (pleat shading), kind = cream | white | purple ---------- */
  function makeCurtainFabric(kind) {
    const [c, x] = cv(256, 640);
    const base = kind === 'purple' ? '#412576' : kind === 'cream' ? '#d9cfbb' : '#f3f1ea';
    x.fillStyle = base; x.fillRect(0, 0, 256, 640);
    const bands = 7;
    for (let i = 0; i < 256; i++) {
      const t = Math.cos((i / 256) * Math.PI * 2 * bands);   // -1..1 across pleats
      const s = t * (kind === 'purple' ? 0.22 : 0.16);
      x.fillStyle = s > 0 ? 'rgba(255,255,255,' + s + ')' : 'rgba(0,0,0,' + (-s) + ')';
      x.fillRect(i, 0, 1, 640);
    }
    // faint vertical seams at pleat troughs
    x.fillStyle = 'rgba(0,0,0,.12)';
    for (let b = 0; b < bands; b++) x.fillRect((b + 0.5) * 256 / bands, 0, 1, 640);
    const t = tex(c);
    return t;
  }

  /* ---------- Dimension label (the clear-opening readout in 3D) ---------- */
  function makeDimLabel(text) {
    const [c, x] = cv(440, 150);
    x.fillStyle = 'rgba(17,17,17,.28)';
    roundRect(x, 14, 36, 412, 92, 20); x.fill();
    x.fillStyle = BRAND.lime;
    roundRect(x, 8, 28, 412, 88, 18); x.fill();
    x.fillStyle = BRAND.purple; x.fillRect(8, 28, 412, 9);
    veneer(x, text, 214, 76, 58, BRAND.purple);
    return tex(c);
  }

  return { load, BRAND, WALL, TOTEM, BOARD, makeFrontBanner, makeHeaderBanner, makeDisplayWall, makeMediaWall, makeTotem, makeScreenBoard, makeShimmerFabric, makeShelfUnit, makeTablecloth, makeSideBackdrop, makeAFrame, makeCurtainFabric, makeDimLabel, makeScreenUI, makeRollups, makeDeskWrap, makeBucketWrap, makeGameSign, makeLeafletRow, makeLeafletOne, makeGameBoard, makePennants, makeGrass, makePlanks, makeLabel };
})();
