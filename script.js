const $ = id => document.getElementById(id);
const TIME_ZONE = 'America/Denver';
const MONTH = 8;
const DAY = 12;
let target = getNextBirthday();
let celebrationRunning = false;
let audioCtx;
const AudioContextClass = window.AudioContext || window.webkitAudioContext;

function getMountainYear() {
  return Number(new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric'
  }).format(new Date()));
}

// Convert a Mountain-Time date to the correct instant without relying on
// the visitor's own time zone. August 12 is MDT (UTC-6).
function birthdayTimestamp(year) {
  return Date.UTC(year, MONTH - 1, DAY, 6, 0, 0);
}

function getNextBirthday() {
  const year = getMountainYear();
  const thisBirthday = birthdayTimestamp(year);
  return Date.now() < thisBirthday ? thisBirthday : birthdayTimestamp(year + 1);
}

function update() {
  const diff = target - Date.now();

  if (diff <= 0) {
    if (!celebrationRunning) {
      celebrationRunning = true;
      celebration();
    }
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  $("days").textContent = Math.floor(totalSeconds / 86400);
  $("hours").textContent = Math.floor((totalSeconds % 86400) / 3600);
  $("minutes").textContent = Math.floor((totalSeconds % 3600) / 60);
  $("seconds").textContent = totalSeconds % 60;
}

function resetCountdown() {
  // Always calculate a fresh target. This makes the timer repeat every year.
  target = getNextBirthday();
  celebrationRunning = false;
  $("count").style.display = "flex";
  $("celebrate").style.display = "none";
  $("title").textContent = "Birthday Countdown!";
  $("subtitle").textContent = "Counting down to August 12 at midnight 🎈";
  update();
}

function celebration() {
  $("title").textContent = '🎉 HAPPY BIRTHDAY! 🎉';
  $("subtitle").textContent = 'IT’S MIDNIGHT IN MOUNTAIN TIME! 🎂🔊';
  $("count").style.display = 'none';
  $("celebrate").style.display = 'block';
  confetti(220);
  balloons();
  birthdaySound();
  setTimeout(cheerSound, 700);
  setTimeout(birthdaySound, 1500);

  // Show the birthday celebration for 10 seconds, then start
  // the next yearly countdown automatically.
  setTimeout(resetCountdown, 10000);
}

function beep(freq, duration, type = 'sine', volume = .12, delay = 0) {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(.001, audioCtx.currentTime + delay);
  g.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + delay + .02);
  g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + delay + duration);
  o.connect(g).connect(audioCtx.destination);
  o.start(audioCtx.currentTime + delay);
  o.stop(audioCtx.currentTime + delay + duration + .03);
}

function birthdaySound() {
  if (!audioCtx) return;
  [523, 659, 784, 1047, 1319].forEach((f, i) => beep(f, .25, 'triangle', .13, i * .13));
}

function cheerSound() {
  if (!audioCtx) return;
  [440, 554, 659, 880].forEach((f, i) => beep(f, .16, 'sawtooth', .07, i * .12));
}

function confetti(n = 100) {
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = `hsl(${Math.random() * 360},100%,65%)`;
    c.style.animationDelay = Math.random() * 1.5 + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4500);
  }
}

function balloons() {
  for (let i = 0; i < 7; i++) {
    const e = document.createElement('div');
    e.className = 'balloon';
    e.textContent = '🎈';
    e.style.left = Math.random() * 100 + 'vw';
    e.style.animationDuration = (5 + Math.random() * 6) + 's';
    document.body.appendChild(e);
    setTimeout(() => e.remove(), 12000);
  }
}

function startAudio() {
  if (!AudioContextClass) return;
  if (!audioCtx) audioCtx = new AudioContextClass();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

$("airhorn").onclick = () => {
  startAudio();
  beep(220, .35, 'sawtooth', .16);
  beep(330, .45, 'sawtooth', .14, .25);
};
$("tada").onclick = () => { startAudio(); birthdaySound(); };
$("cheer").onclick = () => { startAudio(); cheerSound(); };
$("party").onclick = () => {
  startAudio();
  confetti(150);
  balloons();
  cheerSound();
};

update();
setInterval(update, 250);