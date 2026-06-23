/**
 * theme-3d.js — Supply Chain & Inventory Tracker
 * ============================================
 * Part 1: Three.js 3D animated background
 *         Floating "crates" (boxes) drifting in space with
 *         faint connecting lines — a subtle logistics-network feel.
 * Part 2: Day / Night theme toggle
 *         Switches <html data-theme="light|dark">, persists choice
 *         in localStorage, and recolors the 3D scene to match.
 *
 * Requires Three.js to be loaded BEFORE this file:
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
 */


/* ================================================================
   PART 1 — 3D BACKGROUND
   ================================================================ */
(function initInventory3DBackground() {

  if (typeof THREE === 'undefined') {
    console.warn('Three.js not found — skipping 3D background. Check the CDN <script> tag in base.html.');
    return;
  }

  const canvas = document.getElementById('bg3d');
  if (!canvas) {
    console.warn('No <canvas id="bg3d"> found — add it right after <body> in base.html.');
    return;
  }

  /* ---- Scene, camera, renderer ---- */
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050d1a, 0.045);

  const camera = new THREE.PerspectiveCamera(
    55, window.innerWidth / window.innerHeight, 0.1, 100
  );
  camera.position.set(0, 0, 22);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,        // transparent — lets the page's own background show through
    antialias: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  /* ---- Color palette (night vs day) ---- */
  const NIGHT_COLOR = 0x00d4ff;   // cyan glow — matches dark theme
  const DAY_COLOR   = 0x1d5fd6;   // deeper blue — reads well on light bg

  /* ---- Build floating crates ---- */
  const group = new THREE.Group();
  scene.add(group);

  const boxes = [];
  const BOX_COUNT = 24;

  function createCrate() {
    const size = 0.6 + Math.random() * 1.0;
    const geometry = new THREE.BoxGeometry(size, size, size);

    // Wireframe edges (the visible "crate outline")
    const edges = new THREE.EdgesGeometry(geometry);
    const wireMaterial = new THREE.LineBasicMaterial({
      color: NIGHT_COLOR,
      transparent: true,
      opacity: 0.55
    });
    const wireframe = new THREE.LineSegments(edges, wireMaterial);

    // Very faint solid fill so the crate reads as a volume, not just lines
    const fillMaterial = new THREE.MeshBasicMaterial({
      color: NIGHT_COLOR,
      transparent: true,
      opacity: 0.04
    });
    const fillMesh = new THREE.Mesh(geometry, fillMaterial);

    const holder = new THREE.Group();
    holder.add(fillMesh);
    holder.add(wireframe);

    // Scatter randomly within a box-shaped volume in front of the camera
    holder.position.set(
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 18,
      (Math.random() - 0.5) * 18
    );

    holder.userData = {
      baseY: holder.position.y,
      bobSpeed: 0.2 + Math.random() * 0.4,
      bobPhase: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.01,
      wireMaterial: wireMaterial,
      fillMaterial: fillMaterial
    };

    return holder;
  }

  for (let i = 0; i < BOX_COUNT; i++) {
    const crate = createCrate();
    boxes.push(crate);
    group.add(crate);
  }

  /* ---- Faint connecting lines between nearby crates (network feel) ---- */
  const lineMaterial = new THREE.LineBasicMaterial({
    color: NIGHT_COLOR,
    transparent: true,
    opacity: 0.08
  });
  const lineGeometry = new THREE.BufferGeometry();
  const networkLines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(networkLines);

  const MAX_LINK_DISTANCE = 9;

  function rebuildConnections() {
    const positions = [];
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i].position;
        const b = boxes[j].position;
        if (a.distanceTo(b) < MAX_LINK_DISTANCE) {
          positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }
    }
    lineGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
  }
  rebuildConnections();

  /* ---- Theme color switch (called by ThemeManager below) ---- */
  function setSceneTheme(isLight) {
    const color = isLight ? DAY_COLOR : NIGHT_COLOR;
    boxes.forEach(function (b) {
      b.userData.wireMaterial.color.setHex(color);
      b.userData.fillMaterial.color.setHex(color);
    });
    lineMaterial.color.setHex(color);
    scene.fog.color.setHex(isLight ? 0xdce8f7 : 0x050d1a);
  }
  window.__set3DTheme = setSceneTheme;

  /* ---- Animation loop ---- */
  const clock = new THREE.Clock();
  let frameCount = 0;

  function animate() {
    const t = clock.getElapsedTime();

    boxes.forEach(function (b) {
      // Gentle up/down drift, like crates bobbing on a conveyor
      b.position.y = b.userData.baseY + Math.sin(t * b.userData.bobSpeed + b.userData.bobPhase) * 1.1;
      b.rotation.x += b.userData.rotSpeed;
      b.rotation.y += b.userData.rotSpeed * 1.4;
    });

    // Slow overall parallax sway of the whole scene
    group.rotation.y = Math.sin(t * 0.05) * 0.15;
    group.rotation.x = Math.cos(t * 0.04) * 0.05;

    // Recompute connections occasionally (not every frame — keeps it cheap)
    frameCount++;
    if (frameCount % 50 === 0) rebuildConnections();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  /* ---- Resize handling ---- */
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

})();


/* ================================================================
   PART 2 — DAY / NIGHT THEME TOGGLE
   ================================================================ */
const ThemeManager = (function () {

  const STORAGE_KEY = 'supplyChainTheme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Recolor the 3D scene to match (if it loaded successfully)
    if (typeof window.__set3DTheme === 'function') {
      window.__set3DTheme(theme === 'light');
    }

    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.setAttribute(
        'aria-label',
        theme === 'light' ? 'Switch to night mode' : 'Switch to day mode'
      );
    }
  }

  function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function init() {
    // Default to dark (matches the original dashboard design) unless saved otherwise
    const saved = getSavedTheme();
    applyTheme(saved || 'dark');

    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', toggle);
    } else {
      console.warn('No #themeToggle button found — add the toggle markup to the navbar in base.html.');
    }
  }

  return { init: init, toggle: toggle };
})();

document.addEventListener('DOMContentLoaded', ThemeManager.init);
