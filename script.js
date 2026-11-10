import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const themeButtons = document.querySelectorAll('.theme-button');
const viewButtons = document.querySelectorAll('.view-button');
const hotspots = document.querySelectorAll('.hotspot');
const magneticButtons = document.querySelectorAll('.magnetic');

const paletteMap = {
  teal: {
    '--primary': '#00e5c3',
    '--secondary': '#7de8ff',
    '--shadow': 'rgba(0, 229, 195, 0.38)',
  },
  blue: {
    '--primary': '#66b7ff',
    '--secondary': '#7ce4ff',
    '--shadow': 'rgba(102, 183, 255, 0.38)',
  },
  white: {
    '--primary': '#dfeefb',
    '--secondary': '#f3fbff',
    '--shadow': 'rgba(223, 238, 251, 0.35)',
  },
  dark: {
    '--primary': '#8af1da',
    '--secondary': '#45d8c8',
    '--shadow': 'rgba(138, 241, 218, 0.35)',
  }
};

function setTheme(theme) {
  const palette = paletteMap[theme] || paletteMap.teal;
  Object.entries(palette).forEach(([key, value]) => root.style.setProperty(key, value));
  themeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.theme === theme);
  });
}

themeButtons.forEach((button) => {
  button.addEventListener('click', () => setTheme(button.dataset.theme));
});

magneticButtons.forEach((button) => {
  button.addEventListener('pointermove', (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const dx = (x / rect.width - 0.5) * 12;
    const dy = (y / rect.height - 0.5) * 12;
    button.style.transform = `translate(${dx}px, ${dy}px)`;
  });

  button.addEventListener('pointerleave', () => {
    button.style.transform = 'translate(0, 0)';
  });
});

const revealItems = gsap.utils.toArray('.reveal');
revealItems.forEach((item) => {
  gsap.fromTo(
    item,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: item, start: 'top 82%' }
    }
  );
});

gsap.to('.hero-visual', {
  yPercent: 6,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  }
});

gsap.utils.toArray('.story-visual').forEach((panel, index) => {
  gsap.fromTo(
    panel,
    { opacity: 0.3, scale: 0.98, y: 20 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.2,
      ease: 'power2.out',
      delay: index * 0.12,
      scrollTrigger: { trigger: panel, start: 'top 80%' }
    }
  );
});

const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

window.addEventListener('pointermove', (event) => {
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
});

function createEarpieceMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0x0b0b0c,
    metalness: 0.22,
    roughness: 0.72,
    emissive: 0x050505,
  });
}

function createCaseMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0x0f1011,
    metalness: 0.4,
    roughness: 0.8,
    emissive: 0x050505,
  });
}

function createAccentMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0x00e5c3,
    emissive: 0x1dc8b5,
    metalness: 0.25,
    roughness: 0.42,
  });
}

function buildProductModel({ caseOpen = 0.45, leftSpread = -0.9, rightSpread = 0.9 } = {}) {
  const group = new THREE.Group();

  const caseMaterial = createCaseMaterial();
  const accentMaterial = createAccentMaterial();
  const blackMaterial = createEarpieceMaterial();

  const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.9, 3.3), caseMaterial);
  base.position.y = -0.5;
  group.add(base);

  const top = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.4, 3.1), caseMaterial);
  top.position.y = 0.55;
  group.add(top);

  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.82, 0);
  group.add(lidPivot);

  const lid = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.26, 3.1), caseMaterial);
  lid.position.y = 0.22;
  lid.rotation.x = -caseOpen;
  lidPivot.add(lid);

  const led = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 20), accentMaterial);
  led.position.set(0.92, 0.12, -0.72);
  lidPivot.add(led);

  const moonRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.9, 0.015, 10, 100),
    new THREE.MeshBasicMaterial({ color: 0x00e5c3, transparent: true, opacity: 0.3 })
  );
  moonRing.rotation.x = Math.PI / 2;
  moonRing.position.y = -1.35;
  group.add(moonRing);

  function makeEarbud() {
    const bud = new THREE.Group();

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 18), blackMaterial);
    stem.rotation.z = Math.PI / 2;
    stem.rotation.x = Math.PI / 2;
    stem.position.x = 0.95;
    bud.add(stem);

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 24), blackMaterial);
    body.scale.set(1.3, 1, 1.3);
    body.position.x = 0.52;
    body.rotation.z = Math.PI / 2;
    bud.add(body);

    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.7, 16), accentMaterial);
    tip.rotation.x = Math.PI / 2;
    tip.position.set(1.02, 0.12, 0);
    bud.add(tip);

    return bud;
  }

  const left = new THREE.Group();
  left.position.set(-0.78, 0.88, 0.05);
  left.rotation.y = leftSpread;
  const right = new THREE.Group();
  right.position.set(0.78, 0.88, 0.05);
  right.rotation.y = rightSpread;

  left.add(makeEarbud());
  right.add(makeEarbud());
  group.add(left, right);

  group.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return { group, lid, led, moonRing, left, right };
}

function makeScene(container, options = {}) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050505, 7, 18);

  const camera = new THREE.PerspectiveCamera(26, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0.8, 8.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xdff7ff, 2.2);
  key.position.set(3, 4, 6);
  scene.add(key);

  const rim = new THREE.PointLight(0x00e5c3, 18, 18, 2);
  rim.position.set(-3, 2, 4);
  scene.add(rim);

  const product = buildProductModel(options);
  scene.add(product.group);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(5, 64),
    new THREE.MeshBasicMaterial({ color: 0x050505, transparent: true, opacity: 0.38 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.9;
  scene.add(floor);

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  window.addEventListener('resize', resize);

  return {
    scene,
    camera,
    renderer,
    product,
    resize,
    animate(time) {
      product.group.rotation.y = time * 0.42;
      product.group.rotation.x = Math.sin(time * 0.8) * 0.1;
      product.group.position.y = Math.sin(time * 1.25) * 0.2;
      product.lid.rotation.x = -options.caseOpen + Math.sin(time * 1.5) * 0.08;
      product.led.material.emissiveIntensity = 0.8 + Math.sin(time * 5) * 0.6;
      product.moonRing.scale.setScalar(1 + Math.sin(time * 2.6) * 0.05);
    }
  };
}

const heroStage = document.querySelector('.hero-stage');
const heroScene = makeScene(heroStage, { caseOpen: 0.72, leftSpread: -0.9, rightSpread: 0.9 });
let heroTime = 0;
function renderHero() {
  heroTime += 0.016;
  heroScene.animate(heroTime);
  heroScene.camera.position.x = Math.sin(heroTime * 0.45) * 0.6;
  heroScene.camera.lookAt(0, 0.2, 0);
  heroScene.renderer.render(heroScene.scene, heroScene.camera);
  requestAnimationFrame(renderHero);
}
renderHero();

const explorerStage = document.querySelector('.explorer-stage');
const explorerScene = makeScene(explorerStage, { caseOpen: 0.95, leftSpread: -1.1, rightSpread: 1.1 });
const explorerState = { view: 'all' };

function setExplorerView(view) {
  explorerState.view = view;
  viewButtons.forEach((button) => button.classList.toggle('active', button.dataset.view === view));

  if (view === 'all') {
    explorerScene.product.group.rotation.y = 0.55;
    explorerScene.product.lid.rotation.x = -0.92;
  }
  if (view === 'case') {
    explorerScene.product.group.rotation.y = 0.85;
    explorerScene.product.lid.rotation.x = -0.38;
  }
  if (view === 'left') {
    explorerScene.product.group.rotation.y = -0.88;
    explorerScene.product.lid.rotation.x = -0.7;
  }
  if (view === 'right') {
    explorerScene.product.group.rotation.y = 0.88;
    explorerScene.product.lid.rotation.x = -0.7;
  }
}

viewButtons.forEach((button) => {
  button.addEventListener('click', () => setExplorerView(button.dataset.view));
});

hotspots.forEach((spot) => {
  spot.addEventListener('click', () => {
    const id = spot.dataset.hotspot;
    if (id === 'case') setExplorerView('case');
    if (id === 'stem') setExplorerView('left');
    if (id === 'tip') setExplorerView('right');
    if (id === 'led') setExplorerView('case');
  });
});

let explorerTime = 0;
function renderExplorer() {
  explorerTime += 0.016;
  const target =
    explorerState.view === 'all' ? 0.55 :
    explorerState.view === 'case' ? 0.85 :
    explorerState.view === 'left' ? -0.9 : 0.9;

  explorerScene.product.group.rotation.y += (target - explorerScene.product.group.rotation.y) * 0.04;
  explorerScene.product.group.rotation.x = Math.sin(explorerTime * 1.2) * 0.08;
  explorerScene.product.group.position.y = Math.sin(explorerTime * 1.5) * 0.18;
  explorerScene.product.lid.rotation.x = THREE.MathUtils.lerp(
    explorerScene.product.lid.rotation.x,
    explorerState.view === 'case' ? -0.4 : -0.78,
    0.05
  );
  explorerScene.product.led.material.emissiveIntensity = 1 + Math.sin(explorerTime * 4) * 0.5;
  explorerScene.camera.position.x = Math.sin(explorerTime * 0.9) * 0.45;
  explorerScene.camera.position.y = 0.65 + Math.sin(explorerTime * 1.1) * 0.12;
  explorerScene.camera.lookAt(0, 0.25, 0);
  explorerScene.renderer.render(explorerScene.scene, explorerScene.camera);
  requestAnimationFrame(renderExplorer);
}

setTheme('teal');
setExplorerView('all');
renderExplorer();

if (!window.WebGLRenderingContext) {
  heroStage.innerHTML = '<div class="fallback-message">WebGL is unavailable. Please open this page in a modern browser.</div>';
  explorerStage.innerHTML = '<div class="fallback-message">Interactive 3D is unavailable. Please open this page in a modern browser.</div>';
}
