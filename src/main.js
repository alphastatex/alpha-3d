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
    e.preventDefault();
    const target = this.getAttribute('href');
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

// --- ВЗРЫВ ОТ КЛИКА ---
let clickExplodeProgress = 0;
const explosionOffsets = new Float32Array(count * 3);
for (let i = 0; i < count * 3; i++) { explosionOffsets[i] = (Math.random() - 0.5) * 10; }

window.addEventListener('click', () => {
  gsap.to({ value: 0 }, {
    value: 1, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.inOut",
    onUpdate: function() { clickExplodeProgress = this.targets()[0].value; }
  });
});

// --- ВЗРЫВ ОТ СКРОЛЛА ---
let scrollExplodeProgress = 0;
ScrollTrigger.create({
  trigger: ".content", start: "top top", end: "bottom top", scrub: 1.5,
  onUpdate: (self) => { scrollExplodeProgress = self.progress * 3.5; }
});

// --- МЫШЬ ---
let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

window.addEventListener('mousemove', (event) => {
  if (!isMobile) {
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;
  }
});

// --- СКРОЛЛ АНИМАЦИИ ---
gsap.to(".content", { opacity: 0, scrollTrigger: { trigger: ".section-2", start: "top bottom", end: "top center", scrub: 1 } });
gsap.to(".service-card", { y: 0, opacity: 1, duration: 1, stagger: 0.2, scrollTrigger: { trigger: ".services-grid", start: "top 85%", toggleActions: "play none none none" } });
gsap.to(".work-card", { y: 0, opacity: 1, duration: 1, stagger: 0.2, scrollTrigger: { trigger: ".works-grid", start: "top 85%", toggleActions: "play none none none" } });
gsap.to(".section-title", { y: 0, duration: 1.2, ease: "power4.out", stagger: 0.2, scrollTrigger: { trigger: ".title-mask", start: "top 85%", toggleActions: "play none none none" } });

gsap.utils.toArray('.work-image-wrapper').forEach(wrapper => {
  gsap.to(wrapper, { clipPath: "inset(0 0 0% 0)", duration: 1.5, ease: "power4.inOut", scrollTrigger: { trigger: wrapper, start: "top 85%", toggleActions: "play none none none" } });
});

gsap.utils.toArray('.work-image').forEach(image => {
  gsap.to(image, { y: 40, ease: "none", scrollTrigger: { trigger: image.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
});

gsap.to(".about-text p", { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out", scrollTrigger: { trigger: ".section-about", start: "top 70%", toggleActions: "play none none none" } });
gsap.from(".about-title", { y: 50, opacity: 0, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: ".section-about", start: "top 70%", toggleActions: "play none none none" } });
gsap.from(".about-image-wrapper", { clipPath: "inset(100% 0 0 0)", duration: 1.5, ease: "power4.inOut", scrollTrigger: { trigger: ".section-about", start: "top 70%", toggleActions: "play none none none" } });

// --- МАГИЯ РЕДАКТОРА КОДА (СО ЗВУКОМ) ---
const codeToType = "import * as THREE from 'three'; // Создаем сцену... const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100); camera.position.z = 5; // Рендерим... const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); renderer.setSize(window.innerWidth, window.innerHeight); container.appendChild(renderer.domElement); // Анимация... function animate() { requestAnimationFrame(animate); composer.render(); }";
const codeContent = document.getElementById('code-content');
const editorBody = document.getElementById('editor-body');
let charIndex = 0;
let isDeleting = false;
let isTypingStarted = false;

// --- ЗВУК ПЕЧАТНОЙ МАШИНКИ (СНИЖЕННАЯ ЧАСТОТА) ---
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
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    masterFilter = audioCtx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.value = 1800; 
    masterFilter.connect(audioCtx.destination);
  }
}, { once: true });

function playClickSound() {
  if (isMuted || !audioCtx || audioCtx.state === 'suspended' || !noiseBuffer) return;
  
  const now = audioCtx.currentTime;

  const noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = noiseBuffer;

  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'bandpass'; 
  noiseFilter.frequency.value = 800 + Math.random() * 200; 

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.02, now); 
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02); 

  noiseNode.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterFilter);
  noiseNode.start(now);

  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(90 + Math.random() * 20, now); 
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);

  const oscGain = audioCtx.createGain();
  oscGain.gain.setValueAtTime(0.02, now); 
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(oscGain);
  oscGain.connect(masterFilter);
  osc.start(now);
  osc.stop(now + 0.04);
}

// --- ЛОГИКА КНОПКИ MUTE ---
const soundToggle = document.getElementById('soundToggle');
const soundOnIcon = document.getElementById('soundOnIcon');
const soundOffIcon = document.getElementById('soundOffIcon');

soundToggle.addEventListener('click', (e) => {
  e.preventDefault();
  isMuted = !isMuted;

  if (isMuted) {
    soundOnIcon.style.display = 'none';
    soundOffIcon.style.display = 'block';
    soundToggle.style.color = '#ff3d00';
  } else {
    soundOnIcon.style.display = 'block';
    soundOffIcon.style.display = 'none';
    soundToggle.style.color = '#888';
    
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }
});

ScrollTrigger.create({
  trigger: ".code-editor-wrapper", start: "top 90%", once: true,
  onEnter: () => {
    gsap.to(".code-editor-wrapper", { clipPath: "inset(0 0% 0 0%)", duration: 1.5, ease: "power4.inOut", onComplete: () => { isTypingStarted = true; typeCode(); } });
  }
});

function typeCode() {
  if (!isTypingStarted) return;
  const currentString = codeToType.substring(0, charIndex);
  codeContent.textContent = currentString;
  editorBody.scrollLeft = editorBody.scrollWidth;

  if (!isDeleting && charIndex < codeToType.length) {
    charIndex++;
    playClickSound(); 
    if (charIndex >= 300 || charIndex === codeToType.length) { isDeleting = true; setTimeout(typeCode, 1500); return; }
    setTimeout(typeCode, 40);
  } 
  else if (isDeleting && charIndex > 0) { charIndex--; setTimeout(typeCode, 15); } 
  else if (isDeleting && charIndex === 0) { isDeleting = false; setTimeout(typeCode, 800); } 
  else { setTimeout(typeCode, 40); }
}

window.addEventListener("load", () => { ScrollTrigger.refresh(); });

// --- РЕНДЕР ---
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