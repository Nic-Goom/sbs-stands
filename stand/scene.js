/* Builds the 3D stand. Units = metres. Origin = centre of the 3x3 m pitch,
   +z faces the visitors' walkway. Returns refs for toggles & labels. */

function buildStand(scene) {
  const B = StandTextures.BRAND;
  const refs = { labels: [], roofGroup: new THREE.Group(), falseBackGroup: new THREE.Group(), displayGroup: new THREE.Group(), staffProps: new THREE.Group() };

  const mat = {
    white: new THREE.MeshStandardMaterial({ color: 0xf4f1ea, side: THREE.DoubleSide, roughness: 0.95 }),
    canvasWhite: new THREE.MeshStandardMaterial({ color: 0xede9df, side: THREE.DoubleSide, roughness: 1 }),
    green: new THREE.MeshStandardMaterial({ color: 0x1d7d5c, roughness: 0.8 }),
    wood: new THREE.MeshStandardMaterial({ color: 0xb08a5a, roughness: 0.85 }),
    darkGrey: new THREE.MeshStandardMaterial({ color: 0x3a3a3e, roughness: 0.6 }),
    black: new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.5 }),
    purple: new THREE.MeshStandardMaterial({ color: 0x412576, roughness: 0.8 }),
    lime: new THREE.MeshStandardMaterial({ color: 0xb3d12b, roughness: 0.8 }),
    yellow: new THREE.MeshStandardMaterial({ color: 0xf4e600, roughness: 0.8 }),
    pink: new THREE.MeshStandardMaterial({ color: 0xe60d8c, roughness: 0.8 }),
    deskTop: new THREE.MeshStandardMaterial({ color: 0xc9a36a, roughness: 0.7 })
  };

  function box(w, h, d, m, x, y, z, ry = 0, parent = scene, shadow = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z); mesh.rotation.y = ry;
    mesh.castShadow = shadow; mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function plane(w, h, texture, x, y, z, ry = 0, parent = scene, opts = {}) {
    const m = new THREE.MeshStandardMaterial(Object.assign({ map: texture, side: THREE.DoubleSide, roughness: 0.9 }, opts));
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    mesh.position.set(x, y, z); mesh.rotation.y = ry;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  /* ---------- ground ---------- */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(26, 26),
    new THREE.MeshStandardMaterial({ map: StandTextures.makeGrass(), roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  /* ---------- marquee shell ---------- */
  const H = 2.2;
  plane(3.1, H + 0.15, null, 0, (H + 0.15) / 2, -1.52, 0, scene, { map: null, color: 0xf4f1ea });
  // use boxes for crisper walls
  box(3.14, H + 0.1, 0.04, mat.canvasWhite, 0, (H + 0.1) / 2, -1.54, 0, scene, false);
  box(0.04, H + 0.1, 3.1, mat.canvasWhite, -1.54, (H + 0.1) / 2, 0, 0, scene, false);
  box(0.04, H + 0.1, 3.1, mat.canvasWhite, 1.54, (H + 0.1) / 2, 0, 0, scene, false);

  // roof (toggleable)
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 3.5), mat.canvasWhite);
  roof.position.set(0, 2.46, -0.05);
  roof.rotation.x = Math.PI / 2 - 0.18;
  refs.roofGroup.add(roof);
  // corner poles
  [-1.6, 1.6].forEach(px => {
    box(0.06, 2.25, 0.06, mat.darkGrey, px, 1.12, 1.52, 0, scene);
  });
  scene.add(refs.roofGroup);

  // pennant bunting strand — hung across the front, just inside the opening
  const pennants = plane(3.0, 0.24, StandTextures.makePennants(), 0, 1.98, 1.42, 0, scene, { transparent: true, alphaTest: 0.4 });
  refs.pennants = pennants;

  // fairy lights — a string swagged inside the gazebo, behind the bunting
  const fairy = new THREE.Group();
  const bulbGeo = new THREE.SphereGeometry(0.018, 8, 8);
  const bulbMat = new THREE.MeshStandardMaterial({ color: 0xfff2c2, emissive: 0xffe9a8, emissiveIntensity: 1.4 });
  const span = 2.9, n = 26;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const bx = -span / 2 + t * span;
    const sag = Math.sin(t * Math.PI) * 0.12;            // gentle swag
    const b = new THREE.Mesh(bulbGeo, bulbMat);
    b.position.set(bx, 2.02 - sag, 1.33);
    fairy.add(b);
  }
  const fairyGlow = new THREE.PointLight(0xffe9a8, 0.5, 4);
  fairyGlow.position.set(0, 1.95, 1.1);
  fairy.add(fairyGlow);
  scene.add(fairy);
  refs.fairy = fairy;

  /* ---------- front corner curtains + toggleable cover drape + opening dimension ---------- */
  // The marquee's cream tie-back curtains can't be removed; they gather at each
  // front corner. We can hang a brand drape (white or purple) in front to hide them.
  // Opening between corner posts ≈ 3.00 m (x: -1.50 … +1.50).
  function pleatedCurtain(w, h, folds, depth, texture, x, y, z, parent, tieback = false, gatherSide = 0) {
    const segsX = Math.max(10, folds * 6);
    const segsY = tieback ? 28 : 1;
    const geo = new THREE.PlaneGeometry(w, h, segsX, segsY);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const py = pos.getY(i);
      pos.setZ(i, Math.sin((px / w + 0.5) * Math.PI * 2 * folds) * depth);
      if (tieback) {
        // gather toward gatherSide wall (+1 right, -1 left) at mid-height
        const t = (py + h / 2) / h;   // 0 = bottom, 1 = top
        const squeeze = 0.72 * Math.exp(-14 * Math.pow(t - 0.5, 2));
        pos.setX(i, px + (gatherSide * w / 2 - px) * squeeze);
      }
    }
    geo.computeVertexNormals();
    const m = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide, roughness: 0.93 });
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  // (a) original cream tie-back curtains — always present, gathered at the corners (~0.30 m each)
  const creamTex = StandTextures.makeCurtainFabric('cream');
  [-1, 1].forEach(side => {
    const cx = side * 1.35;                       // centre 0.15 m in from the post → inner edge ∓1.20
    pleatedCurtain(0.30, 1.98, 4, 0.05, creamTex, cx, 1.03, 1.42, scene, true, side);
    // tie-band pinching it at mid height
    box(0.34, 0.05, 0.12, mat.darkGrey, cx, 1.0, 1.45, 0, scene, false);
  });

  // (b) cover drape in front (Off / White / Purple) — wider (~0.45 m each), hides the cream
  const coverGroup = new THREE.Group();
  const coverTex = { white: StandTextures.makeCurtainFabric('white'), purple: StandTextures.makeCurtainFabric('purple') };
  const coverMeshes = [];
  [-1, 1].forEach(side => {
    const cx = side * 1.275;                      // inner edge ∓1.05
    const d = pleatedCurtain(0.45, 2.02, 5, 0.05, coverTex.purple, cx, 1.04, 1.47, coverGroup, true, side);
    coverMeshes.push(d);
    // curtain pole header
    box(0.49, 0.05, 0.06, mat.darkGrey, cx, 2.05, 1.47, 0, coverGroup, false);
  });
  scene.add(coverGroup);

  // (c) clear-opening dimension annotation on the floor of the entrance
  const dim = new THREE.Group();
  const dimLine = box(1, 0.012, 0.012, mat.lime, 0, 0.04, 1.62, 0, dim, false);
  const dimTickL = box(0.012, 0.16, 0.012, mat.lime, -0.5, 0.08, 1.62, 0, dim, false);
  const dimTickR = box(0.012, 0.16, 0.012, mat.lime, 0.5, 0.08, 1.62, 0, dim, false);
  const dimSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: StandTextures.makeDimLabel('2.10 m'), depthTest: false, transparent: true }));
  dimSprite.scale.set(0.6, 0.205, 1);
  dimSprite.position.set(0, 0.34, 1.62);
  dimSprite.renderOrder = 99;
  dim.add(dimSprite);
  dim.visible = false;
  scene.add(dim);

  // expose setter: kind = 'off' | 'white' | 'purple' → returns clear-opening metres
  refs.setCurtain = function (kind) {
    const on = kind !== 'off';
    coverGroup.visible = on;
    if (on) { coverMeshes.forEach(m => { m.material.map = coverTex[kind]; m.material.needsUpdate = true; }); }
    const metres = on ? 2.10 : 2.40;              // cover drapes vs cream tie-backs alone
    dimLine.scale.x = metres;
    dimTickL.position.x = -metres / 2;
    dimTickR.position.x = metres / 2;
    dimSprite.material.map = StandTextures.makeDimLabel(metres.toFixed(2) + ' m');
    return metres;
  };

  /* ---------- entry-gap corner posts (show frontage uprights) ---------- */
  box(0.07, 0.42, 0.07, mat.wood, -1.51, 0.21, 1.5);

  /* ---------- 1. tall timber frame: main banner hoisted above the bunting ---------- */
  // free-standing goalpost frame at the front — nothing fixed to the tent, no barrier across the opening
  const frame = new THREE.Group();
  [-1.6, 1.6].forEach(px => {
    box(0.07, 2.66, 0.07, mat.wood, px, 1.33, 0, 0, frame);            // upright — attaches to corner pole
  });
  box(3.26, 0.07, 0.07, mat.wood, 0, 2.64, 0, 0, frame);              // top crossbar (full width)
  plane(3.14, 0.62, StandTextures.makeFrontBanner(), 0, 2.34, -0.055, 0, frame); // banner
  frame.position.set(0, 0, 1.52);   // flush with the corner poles
  scene.add(frame);

  /* ---------- 2. tension-fabric media wall (printed) + LED spotlights ---------- */
  // This is also the divider / false back. Toggle moves it between the real
  // back wall and the 2 m line; staff work behind it either way.
  const dg = refs.displayGroup;
  // wall is 2400 mm wide, sitting to the LEFT so there's a 600 mm access gap on the right
  box(2.46, 1.96, 0.05, mat.darkGrey, -0.3, 0.98, -0.03, 0, dg, false);
  plane(2.4, 1.9, StandTextures.makeMediaWall(), -0.3, 0.95, 0.005, 0, dg);
  // two LED spotlight arms across the top (give light in the tent + on brand)
  refs.spots = [];
  [-1.05, 0.45].forEach(lx => {
    box(0.04, 0.04, 0.32, mat.darkGrey, lx, 2.12, 0.16, 0, dg, false);   // arm
    const head = box(0.13, 0.09, 0.16, mat.black, lx, 2.12, 0.32, 0, dg, false);
    head.rotation.x = 0.5;
    const lens = plane(0.1, 0.1, null, lx, 2.09, 0.4, 0, dg, { map: null, color: 0xfff6df });
    lens.rotation.x = -Math.PI / 2 + 0.5;
    lens.material.emissive = new THREE.Color(0xfff0cf);
    lens.material.emissiveIntensity = 1;
    const spot = new THREE.SpotLight(0xfff2da, 0.9, 5, 0.7, 0.5, 1.2);
    spot.position.set(lx, 2.1, 0.35);
    spot.target.position.set(lx * 0.6 - 0.2, 0.4, 1.6);
    dg.add(spot); dg.add(spot.target);
    refs.spots.push(spot);
  });
  dg.position.set(0, 0, -1.42);   // default = real back wall (full depth)
  scene.add(dg);

  /* ---------- 3. Mobile Pixels on a 700x700 cloth-covered table, framed by a cut-out surround ---------- */
  // Screen sits on a 700 x 700 mm table dressed with a floor-length brand tablecloth.
  // A printed board is cut to wrap the screen and hide the case; lifts off nightly.
  const kiosk = new THREE.Group();
  const clothMat = new THREE.MeshStandardMaterial({ map: StandTextures.makeTablecloth(), roughness: 0.95 });
  const tableTop = 0.70;
  // floor-length tablecloth (covers the 700x700 table down to the ground)
  box(0.72, tableTop, 0.72, clothMat, 0, tableTop / 2, 0, 0, kiosk);
  box(0.74, 0.03, 0.74, mat.deskTop, 0, tableTop + 0.015, 0, 0, kiosk, false);   // table top edge
  // printed cut-out surround board standing on the table
  const Bd = StandTextures.BOARD;
  const boardW = 0.66, boardH = boardW * (Bd.h / Bd.w);
  const boardCY = tableTop + 0.03 + boardH / 2;
  box(0.68, boardH + 0.02, 0.05, mat.purple, 0, boardCY, -0.2, 0, kiosk);          // backing slab, rear of table
  plane(boardW, boardH, StandTextures.makeScreenBoard(), 0, boardCY, -0.172, 0, kiosk);
  // the screen, sitting proud in the board's cut-out window
  const winY = boardCY + boardH / 2 - (Bd.win.cy / Bd.h) * boardH;
  const swM = (Bd.win.w / Bd.w) * boardW, shM = (Bd.win.h / Bd.h) * boardH;
  box(swM + 0.03, shM + 0.03, 0.04, mat.black, 0, winY, -0.155, 0, kiosk);          // bezel
  const screen = plane(swM, shM, StandTextures.makeScreenUI(), 0, winY, -0.133, 0, kiosk, { roughness: 0.3 });
  screen.material.emissive = new THREE.Color(0xffffff);
  screen.material.emissiveMap = screen.material.map;
  screen.material.emissiveIntensity = 0.6;
  kiosk.position.set(0.62, 0, 0.42);
  kiosk.rotation.y = -0.55;
  scene.add(kiosk);
  refs.kiosk = kiosk;

  /* ---------- right side-wall backdrop (for traffic from the other direction) ---------- */
  plane(2.9, 1.85, StandTextures.makeSideBackdrop(), 1.525, 1.0, -0.05, -Math.PI / 2, scene);

  /* ---------- left side-wall: white shimmery softening fabric ---------- */
  plane(2.9, 1.95, StandTextures.makeShimmerFabric(), -1.515, 1.0, -0.05, Math.PI / 2, scene, { roughness: 0.42, metalness: 0.05 });

  /* ---------- 8. staff area (screened by the media wall divider) ---------- */
  const fb = refs.falseBackGroup;   // kept for ref compatibility; media wall is the divider now
  fb.position.set(0, 0, -0.5);
  scene.add(fb);

  // staff props behind the divider — 700x700 table + closed camping shelving unit
  const sp = refs.staffProps;
  // 700 x 700 mm table, top at 0.70 m
  box(0.7, 0.04, 0.7, mat.deskTop, 0.05, 0.70, -1.05, 0, sp);
  [[-0.26, -1.36], [0.36, -1.36], [-0.26, -0.74], [0.36, -0.74]].forEach(([lx, lz]) => {
    box(0.04, 0.70, 0.04, mat.darkGrey, lx, 0.35, lz, 0, sp);
  });
  // laptop on the table
  box(0.3, 0.015, 0.22, mat.darkGrey, 0.05, 0.73, -1.05, 0.15, sp);
  const lid = box(0.3, 0.19, 0.012, mat.darkGrey, 0.02, 0.81, -1.15, 0.15, sp);
  lid.rotation.x = -0.32;
  // closed camping shelving unit — 600w x 970h x 530d — in the back-LEFT corner, beyond the table
  box(0.6, 0.97, 0.53, mat.darkGrey, -1.16, 0.485, -1.18, 0, sp);
  plane(0.6, 0.97, StandTextures.makeShelfUnit(), -1.16, 0.485, -0.915, 0, sp);
  // folding chair to the RIGHT side of the table, facing the table
  box(0.42, 0.04, 0.42, mat.darkGrey, 0.66, 0.45, -1.05, 0, sp);           // seat
  box(0.04, 0.42, 0.42, mat.darkGrey, 0.85, 0.66, -1.05, 0, sp);           // back (rotated 90°)
  [[0.81, -0.86], [0.51, -0.86], [0.81, -1.24], [0.51, -1.24]].forEach(([lx, lz]) => {
    box(0.035, 0.45, 0.035, mat.darkGrey, lx, 0.22, lz, 0, sp);
  });
  scene.add(sp);

  /* ---------- 4. two pull-up banners (850 mm each), left wall, towards the front ---------- */
  // keep "Behind every hero is someone who cares" (0) + "Be the hero of your own story" (2)
  // both sit forward of the tension-fabric wall, with a small gap between them
  const rollTex = StandTextures.makeRollups();
  [[rollTex[0], 1.0], [rollTex[2], 0.1]].forEach(([rt, rz], i) => {
    const g = new THREE.Group();
    box(0.88, 0.06, 0.1, mat.darkGrey, 0, 0.03, 0, 0, g);
    plane(0.85, 1.95, rt, 0, 1.02, 0.02, 0, g);
    box(0.86, 0.03, 0.03, mat.darkGrey, 0, 2.0, 0.02, 0, g);
    g.position.set(-1.44, 0, rz);
    g.rotation.y = Math.PI / 2;
    scene.add(g);
  });

  /* ---------- 5. pop-up desk + bucket, at the entry gap ---------- */
  const desk = new THREE.Group();
  const deskBody = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.92, 28),
    new THREE.MeshStandardMaterial({ map: StandTextures.makeDeskWrap(), roughness: 0.85 }));
  deskBody.scale.z = 0.75; deskBody.position.y = 0.46;
  deskBody.castShadow = true;
  desk.add(deskBody);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 28), mat.deskTop);
  top.scale.z = 0.78; top.position.y = 0.94; top.castShadow = true;
  desk.add(top);
  // donation bucket
  const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.085, 0.24, 20),
    new THREE.MeshStandardMaterial({ map: StandTextures.makeBucketWrap(), roughness: 0.7 }));
  bucket.position.set(-0.12, 1.08, 0.05); bucket.castShadow = true;
  desk.add(bucket);
  // leaflets on top
  box(0.15, 0.012, 0.21, mat.pink, 0.14, 0.97, 0.04, 0.3, desk);
  box(0.15, 0.012, 0.21, mat.purple, 0.18, 0.985, -0.06, 0.55, desk);
  desk.position.set(1.2, 0, 1.2);
  desk.rotation.y = -0.2;
  scene.add(desk);

  /* ---------- 6. single-column leaflet stand, out front before the A-frame ---------- */
  const rack = new THREE.Group();
  const oneTex = StandTextures.makeLeafletOne();
  box(0.4, 0.04, 0.34, mat.darkGrey, 0, 0.02, 0, 0, rack);            // base
  box(0.045, 1.55, 0.045, mat.darkGrey, 0, 0.78, -0.07, 0, rack);    // pole
  [0.5, 0.82, 1.14, 1.46].forEach(py => {
    const pocket = plane(0.26, 0.36, oneTex, 0, py, 0.04, 0, rack);
    pocket.rotation.x = -0.34;
    box(0.28, 0.02, 0.05, mat.darkGrey, 0, py - 0.17, 0.11, 0, rack);  // pocket lip
  });
  rack.position.set(1.18, 0, 1.95);
  rack.rotation.y = -0.25;
  scene.add(rack);

  /* ---------- 7. Step Up game (physical staircase) ---------- */
  const game = new THREE.Group();
  const stepCols = [mat.lime, mat.yellow, mat.lime, mat.yellow];
  for (let i = 0; i < 4; i++) {
    box(0.8, 0.11 * (i + 1), 0.21, stepCols[i], 0, 0.055 * (i + 1), -0.21 * i, 0, game);
  }
  // sign on a post at the back of the steps
  box(0.04, 1.15, 0.04, mat.wood, 0, 0.57, -0.95, 0, game);
  plane(0.62, 0.32, StandTextures.makeGameSign(), 0, 1.05, -0.92, 0, game);
  // beanbags
  [[0.18, 0.13, 0.05, mat.pink], [-0.2, 0.24, -0.2, mat.purple], [0.05, 0.46, -0.62, mat.pink]].forEach(([bx, by, bz, bm]) => {
    const bag = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), bm);
    bag.scale.y = 0.55; bag.position.set(bx, by, bz); bag.castShadow = true;
    game.add(bag);
  });
  // throw line
  box(0.5, 0.005, 0.05, mat.pink, 0, 0.004, 0.5, 0, game, scene, false);
  game.position.set(-0.85, 0, 2.5);    // spills out in FRONT of the tent to pull people in
  game.rotation.y = 0.5;
  scene.add(game);

  /* ---------- 9. A-frame pavement board out front ---------- */
  const aframe = new THREE.Group();
  const aTex = StandTextures.makeAFrame();
  [-1, 1].forEach(side => {
    const board = plane(0.62, 0.86, aTex, 0, 0.5, side * 0.11, 0, aframe);
    board.rotation.x = -side * 0.16;
  });
  box(0.64, 0.04, 0.06, mat.wood, 0, 0.92, 0, 0, aframe, false);
  aframe.position.set(1.98, 0, 2.78);
  aframe.rotation.y = -0.6;
  scene.add(aframe);

  /* ---------- numbered labels ---------- */
  function label(n, x, y, z, parent = scene) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: StandTextures.makeLabel(n), depthTest: false, transparent: true }));
    sprite.scale.set(0.22, 0.22, 1);
    sprite.position.set(x, y, z);
    sprite.renderOrder = 99;
    parent.add(sprite);
    refs.labels.push(sprite);
    return sprite;
  }
  label(1, 0, 2.62, 1.52);                     // hoisted front banner
  label(2, -1.05, 2.12, 0.12, refs.displayGroup); // media wall (moves with it)
  label(3, 0.62, 1.95, 0.42);                   // screen on cloth table
  label(4, -1.25, 2.15, 0.55);                 // two banners
  label(5, 1.2, 1.5, 1.2);                     // desk
  label(6, 1.18, 1.78, 1.95);                  // leaflet column (out front)
  label(7, -0.85, 1.0, 2.5);                   // game (out front)
  label(8, 0.05, 0.95, -1.05);                 // staff area
  label(9, 1.98, 1.05, 2.78);                  // A-frame

  return refs;
}
