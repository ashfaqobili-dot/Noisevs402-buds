import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const envButtons = document.querySelectorAll('[data-theme]');
const themeButtons = document.querySelectorAll('.theme-button');
const viewButtons = document.querySelectorAll('.view-button');
const hotspots = document.querySelectorAll('.hotspot');
const magneticButtons = document.querySelectorAll('.magnetic, .magnet');

const themaMap = {
  teal: {
    '--primary': '#00e5c3',
    '--secondary': '#7de8ff',
    '--shadow': 'rgba(0, 229, 195, 0.38)',
  },
  blue: {
    '--primary': '#69aeff',
    '--secondary': '#8be4ff',
    '--shadow': 'rgba(105, 174, 255, 0.38)',
  },
  white: {
    '--primary': '#ecf6ff',
    '--secondary': '#d9f2ff',
    '--shadow': 'rgba(236, 246, 255, 0.38)',
  },
  dark: {
    '--primary': '#8ae7d5',
    '--secondary': '#3edcc8',
    '--shadow': 'rgba(138, 231, 213, 0.3)',
  },
};

function setTheme(theme) {
  const palette = themaMap[theme] || themaMap.teal;
  Object.entries(palette).forEach(([key, value]) => root.style.setProperty(key, value));
  themeButtons.forEach((button) => {
    const active = button.dataset.theme === theme;
    button.classList.toggle('active', active);
  });
}

envButtons.forEach((button) => {
  button.addEventListener('click', () => setTheme(button.dataset.theme));
});

function addMagneticEffect(button) {
  const handleMove = (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const offsetX = (x / rect.width - 0.5) * 10;
    const offsetY = (y / rect.height - 0.5) * 10;
    button.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  };

  const reset = () => {
    button.style.transform = 'translate(0px, 0px)';
  };

  button.addEventListener('pointermove', handleMove);
  button.addEventListener('pointerleave', reset);
}

magneticButtons.forEach(addMagneticEffect);

const revealItems = gsap.utils.toArray('.reveal');
revealItems.forEach((item) => {
  gsap.fromTo(
    item,
    { opacity: 0, y: 34 },
    {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 82%',
      },
    }
  );
});

gsap.to('.hero-visual', {
  yPercent: 10,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  },
});

function buildProductModel({ caseOpen = 0.4, leftEar = -0.5, rightEar = 0.5, detail = 'all' } = {}) {
  const group = new THREE.Group();

  const caseMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f0f10,
    metalness: 0.35,
    roughness: 0.82,
    emissive: 0x050505,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x00e5c3,
    emissive: 0x00a393,
    metalness: 0.2,
    roughness: 0.4,
  });

  const blackMaterial = new THREE.MeshStandardMaterial({
    color: 0x090909,
    metalness: 0.22,
    roughness: 0.74,
  });

  const topBody = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.5, 3.3), caseMaterial);
  topBody.position.y = 0.5;
  group.add(topBody);

  const baseBody = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.9, 3.3), caseMaterial);
  baseBody.position.y = -0.55;
  group.add(baseBody);

  const lidPivot = new THREE.Group();
  lidPivot.position.y = 0.8;
  group.add(lidPivot);

  const caseLid = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.25, 3.2), caseMaterial);
  caseLid.position.y = 0.25;
  caseLid.rotation.x = -caseOpen;
  lidPivot.add(caseLid);

  const indicator = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), accentMaterial);
  indicator.position.set(1.05, -0.05, -0.7);
  lidPivot.add(indicator);

  const earbudGroupLeft = new THREE.Group();
  earbudGroupLeft.position.set(-0.7, 0.9, 0.3);
  earbudGroupLeft.rotation.y = leftEar;
  group.add(earbudGroupLeft);

  const earbudGroupRight = new THREE.Group();
  earbudGroupRight.position.set(0.7, 0.9, 0.3);
  earbudGroupRight.rotation.y = rightEar;
  group.add(earbudGroupRight);

  function createEarbud() {
    const bud = new THREE.Group();

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 20), blackMaterial);
    stem.rotation.z = Math.PI / 2;
    stem.rotation.x = Math.PI / 2;
    stem.position.x = 0.9;
    bud.add(stem);

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.52, 24, 24), blackMaterial);
    body.scale.set(1.2, 1, 1.2);
    body.position.x = 0.45;
    body.rotation.z = Math.PI / 2;
    bud.add(body);

    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.7, 20), accentMaterial);
    tip.rotation.x = Math.PI / 2;
    tip.position.set(0.96, 0.12, 0.0);
    bud.add(tip);

    return bud;
  }

  const leftBud = createEarbud();
  const rightBud = createEarbud();
  earbudGroupLeft.add(leftBud);
  earbudGroupRight.add(rightBud);

  group.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  const pulseRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.012, 8, 100),
    new THREE.MeshBasicMaterial({ color: 0x00e5c3, transparent: true, opacity: 0.25 })
  );
  pulseRing.rotation.x = Math.PI / 2;
  pulseRing.position.y = -1.2;
  group.add(pulseRing);

  return { group, caseLid, indicator, leftBud, rightBud, pulseRing };
}

function makeScene(container, options = {}) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050505, 6, 18);

  const camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0.8, 8.6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 1.25);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xbfefff, 2.1);
  keyLight.position.set(2.5, 3.5, 6);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0x00e5c3, 14, 18, 2);
  rimLight.position.set(-3, 2, 4);
  scene.add(rimLight);

  const product = buildProductModel(options);
  scene.add(product.group);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(5, 64),
    new THREE.MeshBasicMaterial({ color: 0x050505, transparent: true, opacity: 0.38 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2;
  scene.add(floor);

  function resize() {
    const { clientWidth, clientHeight } = container;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight, false);
  }

  window.addEventListener('resize', resize);

  return {
    scene,
    camera,
    renderer,
    product,
    resize,
    update: (time) => {
      product.group.rotation.y = time * 0.35;
      product.group.rotation.x = Math.sin(time * 0.8) * 0.12;
      product.group.position.y = Math.sin(time * 1.3) * 0.28;
      product.caseLid.rotation.x = -options.caseOpen + Math.sin(time * 1.1) * 0.08;
      product.indicator.material.emissiveIntensity = 0.7 + Math.sin(time * 3) * 0.3;
      product.pulseRing.scale.setScalar(1 + Math.sin(time * 2.6) * 0.08);
      product.leftBud.rotation.z = Math.sin(time * 1.4) * 0.18;
      product.rightBud.rotation.z = -Math.sin(time * 1.4) * 0.18;
    },
  };
}

const heroContainer = document.querySelector('.hero-viewport');
const heroScene = makeScene(heroContainer, { caseOpen: 0.55, leftEar: -0.8, rightEar: 0.8 });

let heroTime = 0;
function animateHero() {
  heroTime += 0.016;
  heroScene.update(heroTime);
  heroScene.camera.position.x = Math.sin(heroTime * 0.5) * 0.3;
  heroScene.camera.lookAt(0, 0.4, 0);
  heroScene.renderer.render(heroScene.scene, heroScene.camera);
  requestAnimationFrame(animateHero);
}
animateHero();

const explorerContainer = document.querySelector('.explorer-viewport');
const explorerScene = makeScene(explorerContainer, {
  caseOpen: 0.9,
  leftEar: -1.1,
  rightEar: 1.1,
});

const explorerState = {
  view: 'all',
};

function setExplorerView(view) {
  explorerState.view = view;
  viewButtons.forEach((button) => button.classList.toggle('active', button.dataset.view === view));

  if (view === 'all') {
    explorerScene.product.group.rotation.y = 0.5;
    explorerScene.product.caseLid.rotation.x = -0.85;
    explorerScene.product.leftBud.rotation.y = -0.75;
    explorerScene.product.rightBud.rotation.y = 0.75;
  }
  if (view === 'case') {
    explorerScene.product.group.rotation.y = 0.8;
    explorerScene.product.caseLid.rotation.x = -0.45;
  }
  if (view === 'left') {
    explorerScene.product.group.rotation.y = -0.75;
    explorerScene.product.leftBud.rotation.y = 0.5;
    explorerScene.product.caseLid.rotation.x = -0.7;
  }
  if (view === 'right') {
    explorerScene.product.group.rotation.y = 0.75;
    explorerScene.product.rightBud.rotation.y = -0.5;
    explorerScene.product.caseLid.rotation.x = -0.7;
  }
}

viewButtons.forEach((button) => {
  button.addEventListener('click', () => setExplorerView(button.dataset.view));
});

hotspots.forEach((hotspot) => {
  hotspot.addEventListener('click', () => {
    const type = hotspot.dataset.hotspot;
    if (type === 'case') setExplorerView('case');
    if (type === 'stem') setExplorerView('left');
    if (type === 'tip') setExplorerView('right');
    if (type === 'light') setExplorerView('case');
  });
});

let explorerTime = 0;
function animateExplorer() {
  explorerTime += 0.016;
  const { product } = explorerScene;
  const target = explorerState.view === 'all' ? 0.5 : explorerState.view === 'case' ? 0.8 : explorerState.view === 'left' ? -0.75 : 0.75;

  product.group.rotation.y += (target - product.group.rotation.y) * 0.05;
  product.group.position.y = Math.sin(explorerTime * 1.2) * 0.2;
  product.caseLid.rotation.x = THREE.MathUtils.lerp(product.caseLid.rotation.x, explorerState.view === 'case' ? -0.35 : -0.7, 0.05);
  product.leftBud.rotation.y = THREE.MathUtils.lerp(product.leftBud.rotation.y, explorerState.view === 'left' ? 0.5 : -0.4, 0.05);
  product.rightBud.rotation.y = THREE.MathUtils.lerp(product.rightBud.rotation.y, explorerState.view === 'right' ? -0.5 : 0.4, 0.05);
  product.indicator.material.emissiveIntensity = 1.2 + Math.sin(explorerTime * 4) * 0.4;
  exploreScene();
}

function exploreScene() {
  explorerScene.camera.position.x = Math.sin(explorerTime * 0.8) * 0.5;
  explorerScene.camera.position.y = 0.6 + Math.sin(explorerTime * 1.1) * 0.15;
  explorerScene.camera.lookAt(0, 0.4, 0);
  explorerScene.renderer.render(explorerScene.scene, explorerScene.camera);
}

setTheme('teal');
setExplorerView('all');

requestAnimationFrame(function orbitExplorer() {
  animateExplorer();
  requestAnimationFrame(orbitExplorer);
});

if (!window.WebGLRenderingContext) {
  heroContainer.innerHTML = '<div class="fallback-message">WebGL is unavailable. Please open this page in a modern browser.</div>';
  explorerContainer.innerHTML = '<div class="fallback-message">Interactive 3D is unavailable. Please open this page in a modern browser.</div>';
}
