/**
 * Metra Innovations — Immersive 3D Onboarding
 *
 * Full-screen, scroll-driven welcome experience powered by Three.js + GSAP
 * ScrollTrigger. Lives on onboarding.html and shows to first-time visitors
 * before entering the main site (index.html).
 *
 * Five scenes animate in sequence as the user scrolls:
 *   0  Code rain converges into the Metra logo
 *   1  "We Build Digital Experiences"
 *   2  "Code. Create. Innovate."
 *   3  "Your Vision, Our Code"
 *   4  CTA — "Explore Metra" button enters the main site
 *
 * Reduced-motion: skips the intro and sends the visitor to the main site.
 */

(function () {
  'use strict';

  /* ── helpers ──────────────────────────────────────────────────── */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
  var PARTICLE_COUNT = isMobile ? 120 : 350;
  var SHAPE_COUNT = isMobile ? 6 : 14;

  /* ── wait for libs ────────────────────────────────────────────── */
  function whenReady(cb) {
    if (typeof THREE !== 'undefined' && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      cb();
    } else {
      window.addEventListener('load', function retry() {
        if (typeof THREE !== 'undefined' && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
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

    gsap.registerPlugin(ScrollTrigger);
if (typeof ScrollToPlugin !== 'undefined') gsap.registerPlugin(ScrollToPlugin);

    var canvas = document.getElementById('intro-canvas');
    var intro = document.getElementById('intro-3d');
    if (!canvas || !intro) return;

    /* ── Three.js setup ─────────────────────────────────────────── */
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !isMobile, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 30);

    /* ── particles ──────────────────────────────────────────────── */
    var pGeo = new THREE.BufferGeometry();
    var pPositions = new Float32Array(PARTICLE_COUNT * 3);
    var pSpeeds = new Float32Array(PARTICLE_COUNT);
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      pPositions[i * 3]     = (Math.random() - 0.5) * 60;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      pSpeeds[i] = 0.3 + Math.random() * 0.7;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    var pMat = new THREE.PointsMaterial({ color: 0xDC143C, size: 0.15, transparent: true, opacity: 0.8, sizeAttenuation: true });
    var particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    /* ── floating shapes ────────────────────────────────────────── */
    var shapes = [];
    var shapeGeo = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.OctahedronGeometry(0.8),
      new THREE.TetrahedronGeometry(0.9),
      new THREE.TorusGeometry(0.6, 0.25, 8, 16),
      new THREE.IcosahedronGeometry(0.7),
      new THREE.ConeGeometry(0.5, 1.2, 4)
    ];
    var shapeMat = new THREE.MeshBasicMaterial({ color: 0xDC143C, wireframe: true, transparent: true, opacity: 0.35 });
    var shapeMat2 = new THREE.MeshBasicMaterial({ color: 0xF5E6D3, wireframe: true, transparent: true, opacity: 0.25 });

    for (var s = 0; s < SHAPE_COUNT; s++) {
      var geo = shapeGeo[s % shapeGeo.length];
      var mesh = new THREE.Mesh(geo, s % 3 === 0 ? shapeMat : shapeMat2);
      mesh.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20 - 5);
      mesh.userData = { rotSpeed: (Math.random() - 0.5) * 0.02, floatPhase: Math.random() * Math.PI * 2 };
      scene.add(mesh);
      shapes.push(mesh);
    }

    /* ── connection lines ───────────────────────────────────────── */
    var lineGeo = new THREE.BufferGeometry();
    var lineCount = isMobile ? 20 : 60;
    var linePos = new Float32Array(lineCount * 6);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    var lineMat = new THREE.LineBasicMaterial({ color: 0xDC143C, transparent: true, opacity: 0.08 });
    var lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    /* ── update lines between nearby particles ──────────────────── */
    function updateLines() {
      var pos = particles.geometry.attributes.position.array;
      var lp = lines.geometry.attributes.position.array;
      var idx = 0;
      var maxDist = 6;
      for (var a = 0; a < PARTICLE_COUNT && idx < lineCount * 6; a += (isMobile ? 3 : 2)) {
        for (var b = a + (isMobile ? 3 : 2); b < PARTICLE_COUNT && idx < lineCount * 6; b += (isMobile ? 3 : 2)) {
          var dx = pos[a * 3] - pos[b * 3];
          var dy = pos[a * 3 + 1] - pos[b * 3 + 1];
          var dz = pos[a * 3 + 2] - pos[b * 3 + 2];
          var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < maxDist) {
            lp[idx++] = pos[a * 3];
            lp[idx++] = pos[a * 3 + 1];
            lp[idx++] = pos[a * 3 + 2];
            lp[idx++] = pos[b * 3];
            lp[idx++] = pos[b * 3 + 1];
            lp[idx++] = pos[b * 3 + 2];
          }
        }
      }
      for (; idx < lineCount * 6; idx++) lp[idx] = 0;
      lines.geometry.attributes.position.needsUpdate = true;
    }

    /* ── code rain effect (scene 0) ─────────────────────────────── */
    var codeContainer = document.getElementById('codeLines');
    if (codeContainer) {
      var codeSnippets = [
        'const app = new Metra();', 'function buildUI() {}', 'import { Innovation } from "metra";',
        'class Developer extends Engineer {', 'async deployToProduction() {', 'npm run build && npm run deploy',
        '<div class="container">', 'SELECT * FROM projects;', 'docker-compose up -d',
        'git push origin main', 'export default MetraEngine;', 'const solution = innovate(problem);',
        'CREATE TABLE innovation (', 'kubectl apply -f deploy.yaml', 'pipeline { agent { any } }',
        'terraform apply -auto-approve', 'app.use(cors());', 'res.json({ status: "ok" });',
        'interface IProject {', 'export default function Metra() {}', 'from metra import Innovate',
        'return <MetraComponent />;', '@Component({ selector: "metra" })', 'scrapy crawl innovations',
        'rails new metra_app', 'SELECT count(*) FROM solutions;', 'aws s3 sync ./dist s3://metra',
        'firebase deploy --only hosting', 'python -m metra.server', 'cargo build --release'
      ];
      for (var c = 0; c < (isMobile ? 8 : 16); c++) {
        var el = document.createElement('div');
        el.className = 'code-line';
        el.textContent = codeSnippets[c % codeSnippets.length];
        el.style.left = Math.random() * 100 + '%';
        el.style.animationDelay = (Math.random() * 4) + 's';
        el.style.animationDuration = (3 + Math.random() * 4) + 's';
        codeContainer.appendChild(el);
      }
    }

    /* ── GSAP ScrollTrigger: pinned intro with 5 scenes ─────────── */
    var scenes = gsap.utils.toArray('.intro-scene');
    var scrollPrompt = document.getElementById('scrollPrompt');

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: intro,
        start: 'top top',
        end: '+=400%',
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    /* scene 0: code rain + logo fade-in */
    var scene0 = document.getElementById('intro-scene-0');
    var logoLockup = document.querySelector('#intro-scene-0 .intro-logo-lockup');
    tl.fromTo(scene0, { opacity: 0 }, { opacity: 1, duration: 0.8 });
    tl.fromTo(logoLockup, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, '-=0.4');
    tl.to(scene0, { opacity: 0, duration: 0.8 }, '+=0.6');

    /* scene 1 */
    var scene1 = document.getElementById('intro-scene-1');
    tl.fromTo(scene1, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' }, '+=0.3');
    tl.to(scene1, { opacity: 0, y: -40, duration: 0.8 });

    /* scene 2 */
    var scene2 = document.getElementById('intro-scene-2');
    tl.fromTo(scene2, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' }, '+=0.3');
    tl.to(scene2, { opacity: 0, y: -40, duration: 0.8 });

    /* scene 3 */
    var scene3 = document.getElementById('intro-scene-3');
    tl.fromTo(scene3, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' }, '+=0.3');
    tl.to(scene3, { opacity: 0, y: -40, duration: 0.8 });

    /* scene 4: CTA */
    var scene4 = document.getElementById('intro-scene-4');
    tl.fromTo(scene4, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 2, ease: 'power2.out' }, '+=0.3');

    /* scroll prompt fade-out */
    tl.to(scrollPrompt, { opacity: 0, duration: 0.5 }, 0);

    /* ── Three.js scene darkens as we progress ───────────────────── */
    tl.to(pMat, { opacity: 0.15, duration: 1 }, 2);
    tl.to(shapeMat, { opacity: 0.15, duration: 1 }, 2);
    tl.to(shapeMat2, { opacity: 0.1, duration: 1 }, 2);
    tl.to(lineMat, { opacity: 0.03, duration: 1 }, 2);

    /* ── camera movement tied to scroll ─────────────────────────── */
    tl.to(camera.position, { z: 18, y: 2, duration: scenes.length * 2, ease: 'none' }, 0);

    /* ── "Explore Metra" button ──────────────────────────────────── */
    var enterBtn = document.getElementById('enterSiteBtn');
    if (enterBtn) {
      enterBtn.addEventListener('click', function (e) {
        e.preventDefault();
        finishOnboarding();
      });
    }

    /* ── "Skip intro" link ───────────────────────────────────────── */
    var skipBtn = document.getElementById('introSkipBtn');
    if (skipBtn) {
      skipBtn.addEventListener('click', function (e) {
        e.preventDefault();
        finishOnboarding();
      });
    }

    /* ── animation loop ─────────────────────────────────────────── */
    var time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.005;

      var pos = particles.geometry.attributes.position.array;
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        pos[i * 3 + 1] += Math.sin(time + i * 0.1) * 0.003 * pSpeeds[i];
        pos[i * 3] += Math.cos(time * 0.7 + i * 0.15) * 0.002 * pSpeeds[i];
        /* gentle drift back to center */
        pos[i * 3]     += (0 - pos[i * 3]) * 0.0003;
        pos[i * 3 + 1] += (0 - pos[i * 3 + 1]) * 0.0003;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      for (var s = 0; s < shapes.length; s++) {
        var sh = shapes[s];
        sh.rotation.x += sh.userData.rotSpeed;
        sh.rotation.y += sh.userData.rotSpeed * 0.6;
        sh.position.y += Math.sin(time * 1.5 + sh.userData.floatPhase) * 0.004;
      }

      /* update connection lines every few frames */
      if (Math.floor(time * 200) % 3 === 0) updateLines();

      renderer.render(scene, camera);
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
