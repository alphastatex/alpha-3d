import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

gsap.registerPlugin(ScrollTrigger);

// --- LENIS SMOOTH SCROLL ---
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true, smoothTouch: false,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = this.getAttribute('href');
    if (!target || target === '#' || !target.startsWith('#')) return; 
    e.preventDefault();
    lenis.scrollTo(target, { offset: 0, duration: 1.5 });
  });
});

// --- КНОПКА НАВЕРХ ---
const scrollTopBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
  if (window.scrollY > 500) { scrollTopBtn.classList.add('visible'); } 
  else { scrollTopBtn.classList.remove('visible'); }
});
scrollTopBtn.addEventListener('click', (e) => {
  e.preventDefault();
  lenis.scrollTo(0, { duration: 1.5 });
});

// --- СКРОЛЛ ПРОГРЕСС ---
gsap.to(".scroll-progress", {
  width: "100%", ease: "none",
  scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 0.3 }
});

// --- ПРЕЛОАДЕР ---
const preloaderTl = gsap.timeline();
preloaderTl.to({ value: 0 }, {
  value: 100, duration: 2, ease: "power2.inOut",
  onUpdate: function() { document.querySelector('.preloader-counter').textContent = Math.round(this.targets()[0].value) + '%'; }
})
.to('.preloader', { yPercent: -100, duration: 1, ease: "power4.inOut", delay: 0.2 })
.to('.letter', { y: 0, duration: 1.2, stagger: 0.05, ease: "power4.out" }, "-=0.5")
.to('.content p', { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.8")
.to('.hint', { opacity: 0.5, duration: 1, ease: "power3.out" }, "-=0.5");

setTimeout(() => { document.querySelector('.hint').style.animation = 'pulse 2s infinite'; }, 3500);

// --- КАСТОМНЫЙ КУРСОР ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const cursorText = document.querySelector('.cursor-text');
const hoverTargets = document.querySelectorAll('.hover-target, a, button');
const workCards = document.querySelectorAll('.hover-work');

gsap.set([cursorDot, cursorRing, cursorText], { xPercent: -50, yPercent: -50 });

const xToDot = gsap.quickTo(cursorDot, "x", {duration: 0.1, ease: "power3"});
const yToDot = gsap.quickTo(cursorDot, "y", {duration: 0.1, ease: "power3"});
const xToRing = gsap.quickTo(cursorRing, "x", {duration: 0.4, ease: "power3"});
const yToRing = gsap.quickTo(cursorRing, "y", {duration: 0.4, ease: "power3"});
const xToText = gsap.quickTo(cursorText, "x", {duration: 0.4, ease: "power3"});
const yToText = gsap.quickTo(cursorText, "y", {duration: 0.4, ease: "power3"});

window.addEventListener('mousemove', (e) => {
  xToDot(e.clientX); yToDot(e.clientY);
  xToRing(e.clientX); yToRing(e.clientY);
  xToText(e.clientX); yToText(e.clientY);
});

hoverTargets.forEach(target => {
  target.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
  target.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
});

workCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    cursorRing.style.display = 'none';
    gsap.to(cursorText, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" });
  });
  card.addEventListener('mouseleave', () => {
    cursorRing.style.display = 'block';
    gsap.to(cursorText, { opacity: 0, scale: 0, duration: 0.3 });
  });
});

// МАГНИТНЫЕ КНОПКИ
const magneticElements = document.querySelectorAll('.magnetic');
magneticElements.forEach((el) => {
  const xTo = gsap.quickTo(el, "x", {duration: 0.8, ease: "elastic.out(1, 0.3)"});
  const yTo = gsap.quickTo(el, "y", {duration: 0.8, ease: "elastic.out(1, 0.3)"});

  el.addEventListener("mousemove", (e) => {
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = e.clientX - (left + width / 2);
    const y = e.clientY - (top + height / 2);
    xTo(x * 0.4); yTo(y * 0.4);
  });
  el.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
});

// --- THREE.JS ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const isMobile = window.innerWidth < 768;
camera.position.z = isMobile ? 11 : 5;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const particlesGeometry = new THREE.BufferGeometry();
const count = 7000; 
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

const color1 = new THREE.Color('#ff3d00');
const color2 = new THREE.Color('#7a00ff');
const color3 = new THREE.Color('#00e5ff');

for (let i = 0; i < count; i++) {
  const r = 2 + Math.random() * 0.5; 
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);

  positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = r * Math.cos(phi);

  const mixedColor = color1.clone().lerp(color2, Math.random()).lerp(color3, Math.random() * 0.5);
  colors[i * 3] = mixedColor.r;
  colors[i * 3 + 1] = mixedColor.g;
  colors[i * 3 + 2] = mixedColor.b;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const originalPositions = positions.slice();
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.03, vertexColors: true, transparent: true,
  opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false,
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

let clickExplodeProgress = 0;
const explosionOffsets = new Float32Array(count * 3);
for (let i = 0; i < count * 3; i++) { explosionOffsets[i] = (Math.random() - 0.5) * 10; }

window.addEventListener('click', () => {
  gsap.to({ value: 0 }, {
    value: 1, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.inOut",
    onUpdate: function() { clickExplodeProgress = this.targets()[0].value; }
  });
});

let scrollExplodeProgress = 0;
ScrollTrigger.create({
  trigger: ".content", start: "top top", end: "bottom top", scrub: 1.5,
  onUpdate: (self) => { scrollExplodeProgress = self.progress * 3.5; }
});

let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

window.addEventListener('mousemove', (event) => {
  if (!isMobile) {
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;
  }
});

// --- БАЗОВЫЕ АНИМАЦИИ ---
gsap.to(".content", { opacity: 0, scrollTrigger: { trigger: ".section-2", start: "top bottom", end: "top center", scrub: 1 } });
gsap.to(".service-card", { y: 0, opacity: 1, duration: 1, stagger: 0.2, scrollTrigger: { trigger: ".services-grid", start: "top 85%", toggleActions: "play none none none" } });
gsap.to(".section-title", { y: 0, duration: 1.2, ease: "power4.out", stagger: 0.2, scrollTrigger: { trigger: ".title-mask", start: "top 85%", toggleActions: "play none none none" } });
gsap.to(".about-text p", { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out", scrollTrigger: { trigger: ".section-about", start: "top 70%", toggleActions: "play none none none" } });
gsap.from(".about-title", { y: 50, opacity: 0, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: ".section-about", start: "top 70%", toggleActions: "play none none none" } });
gsap.from(".about-image-wrapper", { clipPath: "inset(100% 0 0 0)", duration: 1.5, ease: "power4.inOut", scrollTrigger: { trigger: ".section-about", start: "top 70%", toggleActions: "play none none none" } });

// --- ЛОГИКА ПОРТФОЛИО (DRAG & SNAP & ARROWS) ---
const worksWrapper = document.getElementById('worksWrapper');
const slides = document.querySelectorAll('.work-slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currentIndex = 0;
let isDragging = false;
let startX;
let scrollLeft;
let lastX;
let velocity = 0;
let animation = null; 

document.querySelectorAll('img').forEach(img => img.addEventListener('dragstart', e => e.preventDefault()));

gsap.from(".work-slide", {
  y: 100, opacity: 0, duration: 1, stagger: 0.2,
  scrollTrigger: { trigger: ".section-3", start: "top 80%", toggleActions: "play none none none" }
});

if (window.innerWidth > 900) {
  worksWrapper.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = false;
    worksWrapper.classList.add('active');
    startX = e.pageX - worksWrapper.offsetLeft;
    scrollLeft = worksWrapper.scrollLeft;
    lastX = e.pageX;
    velocity = 0;
    if (animation) animation.kill();
  });

  worksWrapper.addEventListener('mouseleave', () => {
    if (worksWrapper.classList.contains('active')) {
      worksWrapper.classList.remove('active');
      snapToNearest();
    }
  });

  worksWrapper.addEventListener('mouseup', () => {
    if (worksWrapper.classList.contains('active')) {
      worksWrapper.classList.remove('active');
      snapToNearest();
    }
  });

  worksWrapper.addEventListener('mousemove', (e) => {
    if (!worksWrapper.classList.contains('active')) return;
    e.preventDefault();
    const x = e.pageX - worksWrapper.offsetLeft;
    const walk = (x - startX) * 2;
    
    if (Math.abs(walk) > 10) isDragging = true;
    worksWrapper.scrollLeft = scrollLeft - walk;

    velocity = e.pageX - lastX;
    lastX = e.pageX;
  });
}

function snapToNearest() {
  const centerPos = worksWrapper.scrollLeft + worksWrapper.offsetWidth / 2;
  let closestIndex = 0;
  let minDistance = Infinity;

  slides.forEach((slide, i) => {
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
    const distance = Math.abs(centerPos - slideCenter);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  });

  if (Math.abs(velocity) > 15) {
    if (velocity < 0 && closestIndex < slides.length - 1) closestIndex++;
    if (velocity > 0 && closestIndex > 0) closestIndex--;
  }

  scrollToSlide(closestIndex);
}

function scrollToSlide(index) {
  if (index < 0) index = 0;
  if (index >= slides.length) index = slides.length - 1;
  currentIndex = index;

  const slide = slides[index];
  const scrollTarget = slide.offsetLeft - (worksWrapper.offsetWidth / 2) + (slide.offsetWidth / 2);

  if (animation) animation.kill();

  animation = gsap.to(worksWrapper, {
    scrollLeft: scrollTarget,
    duration: 0.8,
    ease: "power3.out"
  });
}

nextBtn.addEventListener('click', () => scrollToSlide(currentIndex + 1));
prevBtn.addEventListener('click', () => scrollToSlide(currentIndex - 1));

worksWrapper.addEventListener('scroll', () => {
  if (isDragging) return;
  const centerPos = worksWrapper.scrollLeft + worksWrapper.offsetWidth / 2;
  slides.forEach((slide, i) => {
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
    if (Math.abs(centerPos - slideCenter) < slide.offsetWidth / 2) {
      currentIndex = i;
    }
  });
});

// --- КЛИК ПО КАРТИНКЕ ---
const workImages = document.querySelectorAll('.work-image-wrapper');
workImages.forEach(img => {
  img.addEventListener('click', () => {
    if (isDragging) return; 
    const projectId = img.closest('.work-slide').getAttribute('data-project');
    openModal(projectId);
  });
});

// --- МОДАЛЬНОЕ ОКНО ---
const base = import.meta.env.BASE_URL;

const projectData = {
  ombre: {
    title: "Ombre Coffee",
    desc: "Полноценная система бронирования для кофейни с Telegram-ботом и защищённой CRM-админкой (Zero Trust).",
    stack: ["Vanilla JS", "Cloudflare Workers", "Turnstile", "Telegram API"],
    link: "https://alphastatex.github.io/ombre-coffee/",
    image: `${base}images/ombre.png`
  },
  brutal: {
    title: "Brutal Style",
    desc: "Бруталистичный лендинг с 12 мастерами, Telegram Mini App и защитой форм от спама.",
    stack: ["HTML/CSS", "Vanilla JS", "Cloudflare Workers", "Telegram API"],
    link: "https://alphastatex.github.io/barbershop/",
    image: `${base}images/brutal.png`
  },
  neon: {
    title: "Neon Arena",
    desc: "Продающий лендинг киберспортивного клуба. Премиум-интерактив на Vite + Vanilla JS: Canvas 2D частицы, Web Audio API, кастомный курсор.",
    stack: ["Vite", "Vanilla JS", "GSAP", "Canvas 2D", "Web Audio API"],
    link: "https://alphastatex.github.io/neon-arena/",
    image: `${base}images/neon-arena-hero.png`
  }
};

const modal = document.getElementById('projectModal');
const modalClose = document.getElementById('modalClose');
const btnsCase = document.querySelectorAll('.btn-case');

function openModal(id) {
  const data = projectData[id];
  if (!data) return;

  document.getElementById('modalTitle').textContent = data.title;
  document.getElementById('modalDesc').textContent = data.desc;
  document.getElementById('modalLink').href = data.link;
  document.getElementById('modalImage').src = data.image;
  
  const stackUl = document.getElementById('modalStack');
  stackUl.innerHTML = '';
  data.stack.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    stackUl.appendChild(li);
  });

  modal.classList.add('active');
  lenis.stop();
}

btnsCase.forEach(btn => {
  btn.addEventListener('click', () => {
    openModal(btn.getAttribute('data-project'));
  });
});

modalClose.addEventListener('click', () => {
  modal.classList.remove('active');
  lenis.start();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    modal.classList.remove('active');
    lenis.start();
  }
});

// --- МАГИЯ РЕДАКТОРА КОДА (С ПОДСВЕТКОЙ И НЕРОВНЫМ РИТМОМ) ---
const codeToType = "import * as THREE from 'three'; // Создаем сцену... const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100); camera.position.z = 5; // Рендерим... const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); renderer.setSize(window.innerWidth, window.innerHeight); container.appendChild(renderer.domElement); // Анимация... function animate() { requestAnimationFrame(animate); composer.render(); }";
const codeContent = document.getElementById('code-content');
const editorBody = document.getElementById('editor-body');
let charIndex = 0;
let isDeleting = false;
let isTypingStarted = false;

let audioCtx;
let isMuted = false; 
let noiseBuffer;
let masterFilter; 

window.addEventListener('click', () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = audioCtx.sampleRate * 0.02; 
    noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
    
    masterFilter = audioCtx.createBiquadFilter();
    masterFilter.type = 'highpass';
    masterFilter.frequency.value = 1200; 
    masterFilter.connect(audioCtx.destination);
  }
}, { once: true });

// ЗВУК ПЕЧАТИ (ТИШЕ, ЧАСТОТЫ РАЗНЫЕ)
function playClickSound() {
  if (isMuted || !audioCtx || audioCtx.state === 'suspended' || !noiseBuffer) return;
  const now = audioCtx.currentTime;

  // 1. Шум (пластик). Добавили рандомный фильтр для "сухости/мягкости"
  const noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = noiseBuffer;
  
  const noiseGain = audioCtx.createGain(); 
  const clickVol = 0.005 + Math.random() * 0.01; // Стало тише
  noiseGain.gain.setValueAtTime(clickVol, now); 
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015); 

  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 1500 + Math.random() * 2500; // Разный шум
  noiseFilter.Q.value = 1.5;
  
  noiseNode.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterFilter);
  noiseNode.start(now);

  // 2. Резкий тон (механика). Сделали разброс частот больше (60-140 Гц)
  const osc = audioCtx.createOscillator(); 
  osc.type = 'triangle'; 
  
  const baseFreq = 60 + Math.random() * 80; 
  osc.frequency.setValueAtTime(baseFreq, now); 
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + 0.04);
  
  const oscGain = audioCtx.createGain(); 
  const toneVol = 0.005 + Math.random() * 0.015; // Рандомная громкость (сильнее/слабее нажатие)
  oscGain.gain.setValueAtTime(toneVol, now); 
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  
  osc.connect(oscGain);
  oscGain.connect(audioCtx.destination); 
  osc.start(now);
  osc.stop(now + 0.04);
}

// УЛУЧШЕННАЯ ПОДСВЕТКА (С ЗАГЛУШКАМИ, БЕЗ ВЫЛЕЗАЮЩЕГО HTML)
function syntaxHighlight(code) {
  // Экранируем HTML
  let text = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // 1. Вырезаем комментарии
  text = text.replace(/(\/\/.*)/g, '___COMMENT_START___$1___COMMENT_END___');
  
  // 2. Строки (закрываем даже если кавычка не закрыта до конца)
  text = text.replace(/(['"`])(.*?)(\1|$)/gm, '___STRING_START___$1$2$3___STRING_END___');
  
  // 3. Ключевые слова
  text = text.replace(/\b(import|from|const|let|var|function|return|new|class|extends)\b/g, '___KEYWORD_START___$1___KEYWORD_END___');
  
  // 4. Классы (THREE, Scene)
  text = text.replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, '___CLASS_START___$1___CLASS_END___');
  
  // 5. Цифры
  text = text.replace(/\b(\d+)\b/g, '___NUMBER_START___$1___NUMBER_END___');

  // В самом конце меняем заглушки на реальные HTML-теги
  text = text.replace(/___COMMENT_START___/g, '<span class="token comment">').replace(/___COMMENT_END___/g, '</span>');
  text = text.replace(/___STRING_START___/g, '<span class="token string">').replace(/___STRING_END___/g, '</span>');
  text = text.replace(/___KEYWORD_START___/g, '<span class="token keyword">').replace(/___KEYWORD_END___/g, '</span>');
  text = text.replace(/___CLASS_START___/g, '<span class="token class-name">').replace(/___CLASS_END___/g, '</span>');
  text = text.replace(/___NUMBER_START___/g, '<span class="token number">').replace(/___NUMBER_END___/g, '</span>');

  return text;
}

ScrollTrigger.create({
  trigger: ".code-editor-wrapper", start: "top 90%", once: true,
  onEnter: () => {
    gsap.to(".code-editor-wrapper", { clipPath: "inset(0 0% 0 0%)", duration: 1.5, ease: "power4.inOut", onComplete: () => { isTypingStarted = true; typeCode(); } });
  }
});

// ЛОГИКА ПЕЧАТИ
function typeCode() {
  if (!isTypingStarted) return;
  
  const currentString = codeToType.substring(0, charIndex);
  const currentChar = codeToType[charIndex - 1];
  
  codeContent.innerHTML = syntaxHighlight(currentString);
  
  // Скролл без GSAP (без микро-фризов)
  if (editorBody.scrollWidth > editorBody.offsetWidth) {
    editorBody.scrollLeft = editorBody.scrollWidth;
  }

  if (!isDeleting && charIndex < codeToType.length) {
    charIndex++;
    playClickSound(); 
    
    let delay = 70 + Math.random() * 70; 
    
    if (currentChar === ' ') {
      delay += 50 + Math.random() * 50; 
    } else if (currentChar === ';' || currentChar === ',') {
      delay += 150 + Math.random() * 100; 
    } else if (Math.random() < 0.05) {
      delay += 200; 
    }

    if (charIndex >= 300 || charIndex === codeToType.length) { 
      isDeleting = true; 
      setTimeout(typeCode, 1500); 
      return; 
    }
    
    setTimeout(typeCode, delay);
  } 
  else if (isDeleting && charIndex > 0) { 
    charIndex--; 
    setTimeout(typeCode, 15); 
  } 
  else if (isDeleting && charIndex === 0) { 
    isDeleting = false; 
    setTimeout(typeCode, 800); 
  } 
  else { 
    setTimeout(typeCode, 40); 
  }
}

window.addEventListener("load", () => { ScrollTrigger.refresh(); });

// --- РЕНДЕР THREE.JS ---
const clock = new THREE.Clock();
const positionAttribute = particlesGeometry.attributes.position;

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  if (!isMobile) {
    targetX = mouseX * 0.5; targetY = mouseY * 0.5;
    particlesMesh.rotation.y += 0.001 + (targetX - particlesMesh.rotation.y) * 0.05;
    particlesMesh.rotation.x += 0.0005 + (targetY - particlesMesh.rotation.x) * 0.05;
  } else {
    particlesMesh.rotation.y += 0.001;
    particlesMesh.rotation.x += 0.0005;
  }

  const totalExplode = clickExplodeProgress + scrollExplodeProgress;

  if (totalExplode > 0) {
    const array = positionAttribute.array;
    for (let i = 0; i < count * 3; i++) { array[i] = originalPositions[i] + explosionOffsets[i] * totalExplode; }
    positionAttribute.needsUpdate = true;

    particlesMaterial.opacity = Math.max(0, 0.9 - scrollExplodeProgress * 0.4);
    particlesMesh.position.z = -scrollExplodeProgress * 5;
  } else if (totalExplode === 0 && positionAttribute.array[0] !== originalPositions[0]) {
    for (let i = 0; i < count * 3; i++) { positionAttribute.array[i] = originalPositions[i]; }
    positionAttribute.needsUpdate = true;
    particlesMaterial.opacity = 0.9;
    particlesMesh.position.z = 0;
  }

  const scale = 1 + Math.sin(elapsedTime * 2) * 0.02;
  particlesMesh.scale.set(scale, scale, scale);

  composer.render();
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  if (window.innerWidth < 768) { camera.position.z = 11; } else { camera.position.z = 5; }
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  windowHalfX = window.innerWidth / 2; 
  windowHalfY = window.innerHeight / 2;
});