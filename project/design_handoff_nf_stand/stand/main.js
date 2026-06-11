/* Viewer: renderer, orbit controls, camera presets, toggles. */

(async function () {
  const canvasHost = document.getElementById('viewport');
  const loadingEl = document.getElementById('loading');

  try {
    await StandTextures.load();
  } catch (e) {
    loadingEl.textContent = 'Could not load brand assets: ' + e.message;
    return;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcfdce4);
  scene.fog = new THREE.Fog(0xcfdce4, 14, 26);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 60);
  camera.position.set(3.2, 2.0, 5.6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  canvasHost.appendChild(renderer.domElement);

  // lights
  scene.add(new THREE.HemisphereLight(0xeaf2ff, 0x9a8f66, 0.95));
  const sun = new THREE.DirectionalLight(0xfff1da, 1.0);
  sun.position.set(5, 7, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -5; sun.shadow.camera.right = 5;
  sun.shadow.camera.top = 6; sun.shadow.camera.bottom = -5;
  scene.add(sun);
  const fill = new THREE.PointLight(0xfff4e0, 0.35, 8);
  fill.position.set(0, 2.0, 0.6);
  scene.add(fill);

  const refs = buildStand(scene);
  loadingEl.style.display = 'none';

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.0, 0.2);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = 1.53;
  controls.minDistance = 0.6;
  controls.maxDistance = 16;

  /* ---------- camera presets ---------- */
  const PRESETS = {
    visitor: { pos: [1.0, 1.55, 5.4], tgt: [-0.1, 1.15, -0.4], roof: true },
    inside: { pos: [0.85, 1.5, 1.25], tgt: [-0.2, 1.2, -1.5], roof: true },
    plan: { pos: [0.0, 8.5, 0.6], tgt: [0, 0, 0.18], roof: false },
    staff: { pos: [1.28, 1.5, -0.62], tgt: [-0.4, 0.45, -1.2], roof: true },
    orbit: { pos: [3.6, 2.2, 5.2], tgt: [0, 1.0, 0.2], roof: true }
  };

  let anim = null;
  function flyTo(name) {
    const p = PRESETS[name];
    anim = {
      t0: performance.now(), dur: 1000,
      fromPos: camera.position.clone(), toPos: new THREE.Vector3(...p.pos),
      fromTgt: controls.target.clone(), toTgt: new THREE.Vector3(...p.tgt)
    };
    if (roofToggle.checked !== p.roof) { roofToggle.checked = p.roof; applyRoof(); }
    document.querySelectorAll('[data-preset]').forEach(b => b.classList.toggle('active', b.dataset.preset === name));
  }
  document.querySelectorAll('[data-preset]').forEach(b => {
    b.addEventListener('click', () => flyTo(b.dataset.preset));
  });

  /* ---------- toggles ---------- */
  const fbToggle = document.getElementById('toggle-falseback');
  const labelToggle = document.getElementById('toggle-labels');
  const roofToggle = document.getElementById('toggle-roof');

  function applyFalseBack() {
    const on = fbToggle.checked;
    refs.falseBackGroup.visible = on;
    refs.displayGroup.position.z = on ? -0.5 : -1.42;
    refs.staffProps.visible = on;
    document.getElementById('legend-8').classList.toggle('dim', !on);
  }
  function applyLabels() {
    const on = labelToggle.checked;
    refs.labels.forEach(l => { l.visible = on; });
    if (refs.dimGroup) refs.dimGroup.visible = on;
  }
  function applyRoof() {
    refs.roofGroup.visible = roofToggle.checked;
  }
  fbToggle.addEventListener('change', applyFalseBack);
  labelToggle.addEventListener('change', applyLabels);
  roofToggle.addEventListener('change', applyRoof);
  applyFalseBack(); applyLabels(); applyRoof();

  /* ---------- front curtain dressing ---------- */
  const curtainBtns = document.querySelectorAll('[data-curtain]');
  const openingReadout = document.getElementById('opening-readout');
  function applyCurtain(kind) {
    const metres = refs.setCurtain(kind);
    curtainBtns.forEach(b => b.classList.toggle('active', b.dataset.curtain === kind));
    openingReadout.textContent = metres.toFixed(2) + ' m';
    document.getElementById('opening-note').textContent = kind === 'off'
      ? 'cream tie-backs only'
      : 'with ' + kind + ' cover drape';
  }
  curtainBtns.forEach(b => b.addEventListener('click', () => applyCurtain(b.dataset.curtain)));
  applyCurtain('purple');

  /* ---------- panel collapse ---------- */
  const panel = document.getElementById('panel');
  document.getElementById('panel-collapse').addEventListener('click', () => {
    panel.classList.toggle('collapsed');
  });

  /* ---------- resize + loop ---------- */
  function resize() {
    const w = canvasHost.clientWidth, h = canvasHost.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', resize);
  resize();

  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const _dir = new THREE.Vector3();
  function tick(now) {
    if (anim) {
      const t = Math.min(1, (now - anim.t0) / anim.dur);
      const k = ease(t);
      camera.position.lerpVectors(anim.fromPos, anim.toPos, k);
      controls.target.lerpVectors(anim.fromTgt, anim.toTgt, k);
      if (t >= 1) anim = null;
    }
    controls.update();
    // auto-lift the roof off when looking steeply down, so the plan reads
    _dir.subVectors(controls.target, camera.position).normalize();
    refs.roofGroup.visible = roofToggle.checked && _dir.y > -0.78;
    renderer.render(scene, camera);
  }
  function loop(now) {
    requestAnimationFrame(loop);
    tick(now);
  }
  requestAnimationFrame(loop);
  // fallback: keep rendering even when rAF is throttled (hidden iframes, captures)
  setInterval(() => tick(performance.now()), 200);

  flyTo('visitor');
  // jump straight there and paint one frame synchronously (rAF may be
  // throttled in hidden iframes / screenshot tools)
  anim = null;
  camera.position.set(...PRESETS.visitor.pos);
  controls.target.set(...PRESETS.visitor.tgt);
  controls.update();
  renderer.render(scene, camera);
  window.__renderOnce = () => { controls.update(); renderer.render(scene, camera); };
})();
