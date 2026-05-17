// --- CONFIGURATION ---
const CREPE_MODEL_URL = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
const PIANO_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// --- STATE ---
let audioContext;
let pitch;
let stream;
let notesHistory = [];
let lastNote = null;
let framesSinceChange = 0;

// --- DOM ---
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('startBtn');
const statusMsg = document.getElementById('loading-status');
const notDiv = document.getElementById('notation');
const wrapper = document.getElementById('scroll-wrapper');

// --- 1. SECURITY CHECK (Runs Immediately) ---
(function checkHTTPS() {
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const isSecure = location.protocol === 'https:';
    
    if (!isLocalhost && !isSecure) {
        document.getElementById('https-guard').style.display = 'flex';
        startScreen.style.display = 'none';
        throw new Error("Insecure Context Blocked");
    }
})();

// --- 2. INITIALIZATION ---
startBtn.addEventListener('click', initApp);
document.getElementById('clearBtn').addEventListener('click', clearMusic);

generatePiano();
renderSheetMusic();

async function initApp() {
    startBtn.disabled = true;
    statusMsg.innerText = "Requesting Microphone Permission...";

    try {
        // A. WAKE UP AUDIO ENGINE
        // Must happen strictly inside the click event
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        await audioContext.resume();

        // B. GET PERMISSION
        // This triggers the browser popup
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        
        // C. LOAD MODEL
        statusMsg.innerText = "Downloading AI Brain (10s)...";
        // Slight delay to allow UI to update
        setTimeout(() => {
            pitch = ml5.pitchDetection(CREPE_MODEL_URL, audioContext, stream, modelLoaded);
        }, 100);

    } catch (err) {
        console.error(err);
        statusMsg.innerText = "Error: " + err.message;
        startBtn.innerText = "Retry";
        startBtn.disabled = false;
        alert("Mic Access Failed. Ensure you are on HTTPS and clicked 'Allow'.");
    }
}

function modelLoaded() {
    startScreen.style.display = 'none';
    listenLoop();
}

// --- 3. MAIN LOOP ---
function listenLoop() {
    pitch.getPitch((err, frequency) => {
        if (frequency) {
            const note = frequencyToNote(frequency);
            
            // DEBOUNCE LOGIC (Prevents flickering)
            if (note === lastNote) {
                framesSinceChange++;
            } else {
                framesSinceChange = 0;
            }

            // Note must be held for 3 frames (approx 100ms) to register
            if (framesSinceChange > 2 && note !== notesHistory[notesHistory.length - 1]) {
                handleNewNote(note);
                framesSinceChange = 0;
            }
            lastNote = note;
        }
        requestAnimationFrame(listenLoop);
    });
}

function handleNewNote(note) {
    notesHistory.push(note);
    updatePiano(note);
    renderSheetMusic();
    
    // FORCE SCROLL RIGHT
    setTimeout(() => {
        wrapper.scrollLeft = wrapper.scrollWidth;
    }, 10);
}

// --- 4. VEXFLOW RENDERING ---
function renderSheetMusic() {
    notDiv.innerHTML = '';
    
    // Dynamic Width: Starts at screen width, grows by 50px per note
    const width = Math.max(wrapper.clientWidth, notesHistory.length * 50 + 100);
    
    const { Renderer, Stave, StaveNote, Voice, Formatter } = Vex.Flow;
    const renderer = new Renderer(notDiv, Renderer.Backends.SVG);
    renderer.resize(width, 150);
    
    const context = renderer.getContext();
    const stave = new Stave(10, 40, width - 20);
    stave.addClef("treble").addTimeSignature("4/4").setContext(context).draw();

    if (notesHistory.length === 0) return;

    const notes = notesHistory.map(n => {
        const parts = n.match(/([A-G]#?)(\d)/);
        if(!parts) return null;
        
        const vfNote = new StaveNote({ keys: [`${parts[1]}/${parts[2]}`], duration: "q" });
        if (parts[1].includes('#')) vfNote.addModifier(new Vex.Flow.Accidental("#"));
        
        return vfNote;
    }).filter(n => n);

    const voice = new Voice({ num_beats: notes.length, beat_value: 4 });
    voice.addTickables(notes);
    
    new Formatter().joinVoices([voice]).format([voice], width - 50);
    voice.draw(context, stave);
}

// --- 5. UI HELPERS ---
function updatePiano(note) {
    document.getElementById('note-display').innerText = note;
    
    // Clear old active keys
    document.querySelectorAll('.key').forEach(k => k.classList.remove('active'));
    
    // Activate new key
    const key = document.querySelector(`.key[data-note="${note}"]`);
    if (key) {
        key.classList.add('active');
        key.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        
        // Finger Algorithm (Heuristic)
        const base = note.slice(0, -1);
        const fingers = { 'C':1, 'D':2, 'E':3, 'F':1, 'G':2, 'A':3, 'B':4 };
        document.getElementById('finger-display').innerText = fingers[base] || 2;
    }
}

function generatePiano() {
    const piano = document.getElementById('piano');
    // Generate octaves 2-6
    for (let o = 2; o <= 6; o++) {
        PIANO_KEYS.forEach(n => {
            const div = document.createElement('div');
            div.className = `key ${n.includes('#') ? 'black' : 'white'}`;
            div.dataset.note = `${n}${o}`;
            piano.appendChild(div);
        });
    }
}

function clearMusic() {
    notesHistory = [];
    renderSheetMusic();
    document.getElementById('note-display').innerText = '-';
    document.getElementById('finger-display').innerText = '-';
}

function frequencyToNote(freq) {
    const noteNum = 12 * (Math.log(freq / 440) / Math.log(2)) + 69;
    const r = Math.round(noteNum);
    const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    return `${names[r % 12]}${Math.floor(r / 12) - 1}`;
}
