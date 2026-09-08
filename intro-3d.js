/**
 * Metra Innovations — Immersive 3D Onboarding
 *
 * Auto-playing, full-screen welcome experience powered by Three.js + GSAP.
 * Lives on onboarding.html and shows to first-time visitors before entering
 * the main site (index.html).
 *
 * Scenes advance automatically on timed transitions (no scrolling):
 *   0  Matrix-style binary rain fills the screen
 *   1  The binary converges into a spinning black hole made of code
 *   2  "Metra Innovations" pops out
 *   3  Tagline: "Software Engineers & Web Developers in South Africa"
 *   4  CTA — "Explore Metra" enters the main site (with Skip intro)
 *
 * Reduced-motion: skips straight to the main site.
 */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;

  /* ── wait for libs ────────────────────────────────────────────── */
  function whenReady(cb) {
    if (typeof THREE !== 'undefined' && typeof gsap !== 'undefined') {
      cb();
    } else {
      window.addEventListener('load', function retry() {
        if (typeof THREE !== 'undefined' && typeof gsap !== 'undefined') {
          cb();
        }
      });
    }
  }

  /* ── finish onboarding → flag + navigate to main site ──────────── */
  function finishOnboarding() {
    try { localStorage.setItem('metra_onboarded', '1'); } catch (e) { /* ignore */ }
    window.location.replace('index.html');
  }

  /* ── reduced-motion fallback ──────────────────────────────────── */
  function skipIntro() {
    finishOnboarding();
  }

  /* ── main ─────────────────────────────────────────────────────── */
  whenReady(function () {
    if (prefersReducedMotion) { skipIntro(); return; }

    var canvas = document.getElementById('intro-canvas');
    var intro = document.getElementById('intro-3d');
    var codeContainer = document.getElementById('codeLines');
    if (!canvas || !intro) return;

    /* ── Three.js setup ─────────────────────────────────────────── */
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !isMobile, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    var scene3d = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 30);

    /* ── binary rain points (used for the "code black hole") ────── */
    var BIN = isMobile ? 650 : 1600;
    var binPos = new Float32Array(BIN * 3);
    var binSpiralTarget = new Float32Array(BIN * 3);
    var binAngles = new Float32Array(BIN);
    var binRadii = new Float32Array(BIN);
    var binSpeeds = new Float32Array(BIN);

    for (var i = 0; i < BIN; i++) {
      var ang = Math.random() * Math.PI * 2;
      var rad = 2 + Math.random() * 24;
      binAngles[i] = ang;
      binRadii[i] = rad;
      binSpeeds[i] = 0.003 + Math.random() * 0.006;
      binPos[i * 3]     = (Math.random() - 0.5) * 70;
      binPos[i * 3 + 1] = (Math.random() - 0.5) * 70;
      binPos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      binSpiralTarget[i * 3]     = Math.cos(ang) * rad;
      binSpiralTarget[i * 3 + 1] = Math.sin(ang) * rad;
      binSpiralTarget[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }

    var binGeo = new THREE.BufferGeometry();
    binGeo.setAttribute('position', new THREE.BufferAttribute(binPos, 3));
    var binMat = new THREE.PointsMaterial({
      color: 0x00ff66,
      size: isMobile ? 0.12 : 0.1,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true
    });
    var binPoints = new THREE.Points(binGeo, binMat);
    scene3d.add(binPoints);

    /* ── the black hole nucleus (dark event horizon) ────────────── */
    var nucleusGeo = new THREE.SphereGeometry(4.2, 48, 48);
    var nucleusMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    var nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    nucleus.visible = false;
    scene3d.add(nucleus);

    /* ── glowing accretion ring around the hole ─────────────────── */
    var ringGeo = new THREE.RingGeometry(4.4, 6.4, 90);
    var ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ff66,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.4;
    ring.visible = false;
    scene3d.add(ring);

    /* ── scattered crimson tech-particles backdrop ──────────────── */
    var pGeo = new THREE.BufferGeometry();
    var BACK = isMobile ? 120 : 300;
    var pPos = new Float32Array(BACK * 3);
    for (var b = 0; b < BACK; b++) {
      pPos[b * 3]     = (Math.random() - 0.5) * 80;
      pPos[b * 3 + 1] = (Math.random() - 0.5) * 80;
      pPos[b * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    var pMat = new THREE.PointsMaterial({ color: 0xDC143C, size: 0.12, transparent: true, opacity: 0.5, sizeAttenuation: true });
    var backdrop = new THREE.Points(pGeo, pMat);
    scene3d.add(backdrop);

    /* ── build the binary/Matrix rain in DOM over scene 0 ───────── */
    function buildBinaryRain() {
      if (!codeContainer) return;
      var chars = '10';
      var count = isMobile ? 90 : 160;
      for (var c = 0; c < count; c++) {
        var col = document.createElement('div');
        col.className = 'binary-col';
        var bits = '';
        var len = 4 + Math.floor(Math.random() * 14);
        for (var k = 0; k < len; k++) bits += chars[Math.floor(Math.random() * 2)];
        col.textContent = bits;
        col.style.left = (Math.random() * 100) + '%';
        col.style.animationDelay = (Math.random() * 4) + 's';
        col.style.animationDuration = (2.5 + Math.random() * 4) + 's';
        col.style.setProperty('--bright', Math.random() > 0.85 ? '1' : '0');
        col.style.setProperty('--len', len);
        codeContainer.appendChild(col);
      }
    }
    buildBinaryRain();

    /* ── scene references ───────────────────────────────────────── */
    var s0 = document.getElementById('intro-scene-0');
    var s1 = document.getElementById('intro-scene-1');
    var s2 = document.getElementById('intro-scene-2');
    var s3 = document.getElementById('intro-scene-3');
    var s4 = document.getElementById('intro-scene-4');
    var logoBig = document.querySelector('#intro-scene-2 .intro-logo-big');
    var tagline = document.querySelector('#intro-scene-3 .intro-tagline');
    var scrollPrompt = document.getElementById('scrollPrompt');
    if (scrollPrompt) scrollPrompt.style.display = 'none';

    /* ── timeline: auto-advancing timed scenes ──────────────────── */
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    /* Scene 0 → 1: binary rain, then morph into the black hole */
    tl.to(s0, { autoAlpha: 1, duration: 0.5 }, 0.2);
    tl.to(binMat, { opacity: 0.25, duration: 0.6 }, 0.6);          // dots fade in as code-matter
    tl.to(s0, { autoAlpha: 0, duration: 0.9 }, 3.1);               // rain recedes
    tl.to(binMat, { opacity: 0.95, duration: 1.1 }, 3.2);          // converge brightens
    tl.to(backdrop.material, { opacity: 0.15, duration: 1.2 }, 3.2);
    tl.add(function () { nucleus.visible = true; ring.visible = true; }, 4.5);
    tl.fromTo(nucleus.scale, { x: 0.01, y: 0.01, z: 0.01 }, { x: 1, y: 1, z: 1, duration: 1.4, ease: 'power3.out' }, 4.5);
    tl.to(ringMat, { opacity: 0.85, duration: 1.2 }, 4.6);
    tl.add(function () { s1.classList.add('active-show'); }, 5.6); // "black hole" label/halo cue
    tl.to(s1, { autoAlpha: 1, duration: 0.8 }, 5.8);

    /* hold on the black hole while it spins */
    tl.to({}, { duration: 1.0 }, 6.8);

    /* Scene 2: "Metra Innovations" pops out */
    tl.to(s1, { autoAlpha: 0, duration: 0.6 }, 7.9);
    tl.to(ringMat, { opacity: 0, duration: 0.5 }, 8.0);
    tl.to(binMat, { opacity: 0, duration: 0.6 }, 8.0);
    tl.add(function () { nucleus.visible = false; ring.visible = false; }, 8.0);
    tl.to(s2, { autoAlpha: 1, duration: 0.4 }, 8.2);
    tl.fromTo(logoBig, { opacity: 0, scale: 0.4, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 1.0, ease: 'back.out(1.7)' }, 8.35);

    /* Scene 3: tagline slides up under the logo */
    tl.to(s2, { autoAlpha: 0, duration: 0.5 }, 10.4);
    tl.to(s3, { autoAlpha: 1, duration: 0.4 }, 10.7);
    tl.fromTo(tagline, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9 }, 10.9);

    /* Scene 4: CTA */
    tl.to(s3, { autoAlpha: 0, duration: 0.5 }, 13.0);
    tl.to(s4, { autoAlpha: 1, duration: 0.4 }, 13.3);
    tl.fromTo('#intro-scene-4 .intro-cta-block', { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.6)' }, 13.5);

    /* ── "Explore Metra" button ──────────────────────────────────── */
    var enterBtn = document.getElementById('enterSiteBtn');
    if (enterBtn) {
      enterBtn.addEventListener('click', function (e) { e.preventDefault(); finishOnboarding(); });
    }
    /* ── "Skip intro" link ───────────────────────────────────────── */
    var skipBtn = document.getElementById('introSkipBtn');
    if (skipBtn) {
      skipBtn.addEventListener('click', function (e) { e.preventDefault(); finishOnboarding(); });
    }

    /* ── render loop ─────────────────────────────────────────────── */
    var time = 0;
    var fadeIn = gsap.timeline(); // handles per-frame spiral convergence below
    fadeIn.pause();

    function animate() {
      requestAnimationFrame(animate);
      time += 0.016;

      /* spiral the binary points into the black-hole disk (continuous) */
      var pos = binGeo.attributes.position.array;
      var spiralAmount = Math.min(1, Math.max(0, (time - 3.0) / 2.5)); // converge during scene1
      for (var i = 0; i < BIN; i++) {
        binAngles[i] += binSpeeds[i];
        var targetR = binRadii[i] * (1 - spiralAmount * 0.82);
        var tx = Math.cos(binAngles[i]) * targetR;
        var ty = Math.sin(binAngles[i]) * targetR;
        // ease current point toward the spiral position
        pos[i*3]   += (tx - pos[i*3])   * 0.06;
        pos[i*3+1] += (ty - pos[i*3+1]) * 0.06;
        pos[i*3+2] += (binSpiralTarget[i*3+2] - pos[i*3+2]) * 0.04;
      }
      binGeo.attributes.position.needsUpdate = true;

      ring.rotation.z += 0.006;
      ring.rotation.x = Math.PI / 2.4 + Math.sin(time * 0.5) * 0.25;
      nucleus.rotation.y += 0.004;

      /* gentle drift + spin for the crimson backdrop */
      var bp = backdrop.geometry.attributes.position.array;
      for (var b = 0; b < BACK; b++) {
        bp[b*3]   += Math.cos(time * 0.7 + b) * 0.001;
        bp[b*3+1] += Math.sin(time * 0.5 + b) * 0.001;
      }
      backdrop.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene3d, camera);
    }
    animate();

    /* ── resize handler ─────────────────────────────────────────── */
    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  });
})();
