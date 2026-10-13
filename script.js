/* =========================================================================
   LLOYD & SHEEN — WEDDING INVITATION SCRIPT
   ========================================================================= */

/* This lets the CSS know JavaScript is running (so scroll animations work) */
document.documentElement.classList.add('js');

/* -------------------------------------------------------------------------
   SETTINGS YOU CAN EDIT (beginner-friendly)
   ------------------------------------------------------------------------- */

// SET YOUR WEDDING DATE AND TIME HERE  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// Format: "YYYY-MM-DDTHH:MM:SS"  (24-hour clock).  Example: 4:00 PM = "16:00:00"
// The date (Dec 25, 2026) is set. The time is a placeholder (midnight):
// CHANGE "00:00:00" TO YOUR CEREMONY TIME.
const WEDDING_DATE_TIME = "2026-12-25T00:00:00";

// TIME ZONE of the wedding. The Philippines (Asia/Manila) is always UTC+8.
// Guests anywhere in the world will count down to the same Manila moment.
const TIMEZONE_OFFSET = "+08:00";

// HOW LONG THE CHURCH SCENE PLAYS before the invitation appears (milliseconds).
// 1000 = 1 second. Guests can always tap "Skip".
const SCENE_DURATION_MS = 10000;

// BACKGROUND MUSIC VOLUME (0.0 = silent, 1.0 = full). Keep it gentle.
const MUSIC_VOLUME = 0.35;

// CONNECT THE RSVP FORM TO A REAL SERVICE HERE  <<<<<<<<<<<<<<<<<<<<<<<<<<
// Paste the link from Formspree, Web3Forms, a Google Apps Script web app, etc.
// Example: "https://formspree.io/f/your-form-id"
// While this is empty, the form will NOT send anything.
const RSVP_ENDPOINT = "";

// NUMBER OF FALLING PETALS (fewer on phones for smooth performance)
const PETALS_DESKTOP = 14;
const PETALS_MOBILE = 7;

/* -------------------------------------------------------------------------
   HELPERS
   ------------------------------------------------------------------------- */
const $ = (id) => document.getElementById(id);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const opening = $('opening');
const scene = $('scene');
const sceneVideo = $('sceneVideo');
const invitation = $('invitation');
const openBtn = $('openBtn');
const skipBtn = $('skipScene');
const music = $('bgMusic');
const musicBtn = $('musicBtn');

// Reads the fade time (in ms) from the CSS variable --scene-fade
function fadeMs() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--scene-fade').trim();
  const n = parseFloat(raw);
  if (isNaN(n)) return 1600;
  return raw.endsWith('ms') ? n : n * 1000;
}

/* -------------------------------------------------------------------------
   1) THE "OPEN OUR WEDDING INVITATION" BUTTON  →  CHURCH SCENE  →  INVITATION
   ------------------------------------------------------------------------- */
let started = false;       // stops duplicate animations if clicked many times
let sceneTimer = null;
let inviteShown = false;

openBtn.addEventListener('click', () => {
  if (started) return;     // ignore repeated clicks
  started = true;
  openBtn.disabled = true;

  tryPlayMusic();          // allowed because the guest just tapped a button

  // Fade the opening card away
  opening.classList.add('is-leaving');

  setTimeout(() => {
    opening.hidden = true;
    startScene();
  }, fadeMs() * 0.8);
});

function startScene() {
  scene.hidden = false;
  void scene.offsetWidth;                 // lets the browser register the change
  scene.classList.add('is-visible');

  // Start the looping video (muted so phones allow autoplay)
  if (sceneVideo) {
    sceneVideo.muted = true;
    const p = sceneVideo.play();
    if (p && p.catch) p.catch(() => { /* video missing or blocked: poster/gradient shows instead */ });
  }

  scene.classList.add('is-playing');      // starts walking + text animations

  // After the scene finishes, show the invitation
  const duration = prefersReducedMotion ? 3000 : SCENE_DURATION_MS;
  sceneTimer = setTimeout(showInvitation, duration);
}

skipBtn.addEventListener('click', () => {
  clearTimeout(sceneTimer);
  showInvitation();
});

function showInvitation() {
  if (inviteShown) return;
  inviteShown = true;

  invitation.hidden = false;
  window.scrollTo(0, 0);
  void invitation.offsetWidth;
  invitation.classList.add('is-visible');
  scene.classList.add('is-leaving');

  setTimeout(() => {
    scene.hidden = true;
    if (sceneVideo) sceneVideo.pause();   // saves battery
  }, fadeMs());

  setupScrollReveal();
  startPetals();
  startCountdown();
}

/* -------------------------------------------------------------------------
   2) SCROLL REVEAL (sections fade in as you scroll)
   ------------------------------------------------------------------------- */
function setupScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  items.forEach((el) => io.observe(el));
}

/* -------------------------------------------------------------------------
   3) FALLING PETALS (subtle; skipped for reduced motion)
   ------------------------------------------------------------------------- */
function startPetals() {
  if (prefersReducedMotion) return;
  const box = $('petals');
  const count = window.innerWidth < 700 ? PETALS_MOBILE : PETALS_DESKTOP;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    const size = 8 + Math.random() * 9;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.setProperty('--drift', (Math.random() * 120 - 40) + 'px');
    p.style.animationDuration = (11 + Math.random() * 12) + 's';   // PETAL FALL SPEED
    p.style.animationDelay = (-Math.random() * 20) + 's';
    box.appendChild(p);
  }
}

/* -------------------------------------------------------------------------
   4) LIVE COUNTDOWN
   ------------------------------------------------------------------------- */
let countdownTimer = null;

function startCountdown() {
  if (countdownTimer) return;

  const target = new Date(WEDDING_DATE_TIME + TIMEZONE_OFFSET).getTime();
  const els = { d: $('cdDays'), h: $('cdHours'), m: $('cdMinutes'), s: $('cdSeconds') };
  const msg = $('cdMessage');

  // Invalid date? Show a friendly note instead of "NaN"
  if (isNaN(target)) {
    Object.values(els).forEach((el) => (el.textContent = '--'));
    msg.textContent = 'Countdown coming soon.';
    console.warn('Countdown: WEDDING_DATE_TIME is not valid. Use the format YYYY-MM-DDTHH:MM:SS');
    return;
  }

  function setNum(el, value) {
    const text = String(value).padStart(2, '0');
    if (el.textContent !== text) {
      el.textContent = text;
      if (!prefersReducedMotion) {
        el.classList.remove('tick');
        void el.offsetWidth;
        el.classList.add('tick');
      }
    }
  }

  function update() {
    const diff = target - Date.now();

    if (diff <= 0) {
      setNum(els.d, 0); setNum(els.h, 0); setNum(els.m, 0); setNum(els.s, 0);
      msg.textContent = 'Today is our special day!';     // MESSAGE WHEN COUNTDOWN ENDS
      clearInterval(countdownTimer);
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    setNum(els.d, Math.floor(totalSeconds / 86400));
    setNum(els.h, Math.floor((totalSeconds % 86400) / 3600));
    setNum(els.m, Math.floor((totalSeconds % 3600) / 60));
    setNum(els.s, totalSeconds % 60);
  }

  update();
  countdownTimer = setInterval(update, 1000);
}

/* -------------------------------------------------------------------------
   5) BACKGROUND MUSIC (optional)
   Put your song at: assets/audio/wedding-song.mp3
   If the file is missing, the music button simply stays hidden.
   ------------------------------------------------------------------------- */
let musicAvailable = false;

if (music) {
  music.volume = MUSIC_VOLUME;

  const sourceEl = music.querySelector('source');
  if (sourceEl) sourceEl.addEventListener('error', () => { musicAvailable = false; musicBtn.hidden = true; });

  music.addEventListener('loadedmetadata', () => { musicAvailable = true; musicBtn.hidden = false; });
  music.addEventListener('error', () => { musicAvailable = false; musicBtn.hidden = true; });

  music.preload = 'metadata';
  music.load();

  music.addEventListener('play', () => setMusicState(true));
  music.addEventListener('pause', () => setMusicState(false));
}

function setMusicState(isPlaying) {
  musicBtn.classList.toggle('is-playing', isPlaying);
  musicBtn.setAttribute('aria-pressed', String(isPlaying));
  musicBtn.setAttribute('aria-label', isPlaying ? 'Pause background music' : 'Play background music');
}

// Music only starts after the guest taps something (never automatically).
function tryPlayMusic() {
  if (!music) return;
  const p = music.play();
  if (p && p.catch) p.catch(() => { /* no file or blocked: guest can use the music button */ });
}

if (musicBtn) {
  musicBtn.addEventListener('click', () => {
    if (!music) return;
    if (music.paused) tryPlayMusic(); else music.pause();
  });
}

/* -------------------------------------------------------------------------
   6) RSVP FORM
   ------------------------------------------------------------------------- */
const rsvpForm = $('rsvpForm');
const rsvpStatus = $('rsvpStatus');

if (rsvpForm) {
  rsvpForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = $('rsvpName').value.trim();
    const attending = $('rsvpAttend').value;

    if (!name || !attending) {
      rsvpStatus.textContent = 'Please enter your name and choose if you can attend.';
      return;
    }

    // Not connected yet: be honest so guests don't think it was sent.
    if (!RSVP_ENDPOINT) {
      rsvpStatus.textContent = 'RSVP is not connected yet. Please contact the couple directly.';
      console.warn('RSVP: set RSVP_ENDPOINT at the top of script.js to receive responses.');
      return;
    }

    const submitBtn = rsvpForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    rsvpStatus.textContent = 'Sending...';

    try {
      const response = await fetch(RSVP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(rsvpForm)))
      });
      if (!response.ok) throw new Error('Request failed');
      rsvpStatus.textContent = attending === 'yes'
        ? 'Thank you! We can’t wait to celebrate with you.'
        : 'Thank you for letting us know. You will be missed.';
      rsvpForm.reset();
    } catch (err) {
      rsvpStatus.textContent = 'Something went wrong. Please try again.';
    } finally {
      submitBtn.disabled = false;
    }
  });
}
