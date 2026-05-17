// --- CONFIGURATION ---
const PIANO_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = 3; // How many octaves to render
const START_OCTAVE = 3; // Start at C3

let audioContext;
let pitch;
let mic;
let isListening = false;
let currentNote = null;

// --- DOM ELEMENTS ---
const startBtn = document.getElementById('startBtn');
const statusDiv = document.getElementById('status');
const pianoDiv = document.getElementById('piano');
const fingerDisplay = document.getElementById('finger-display');
const notationDiv = document.getElementById('notation');

// --- INITIALIZATION ---
startBtn.addEventListener('click', startListening);
generatePiano();
initVexFlow();

// --- PIANO GENERATION ---
function generatePiano() {
    for (let o = 0; o < OCTAVES; o++) {
        const octaveNum = START_OCTAVE + o;
        PIANO_KEYS.forEach(note => {
            const key = document.createElement('div');
            const isBlack = note.includes('#');
            key.className = `key ${isBlack ? 'black' : 'white'}`;
            key.dataset.note = `${note}${octaveNum}`; // e.g., C4
            pianoDiv.appendChild(key);
        });
    }
}

// --- VEXFLOW SETUP ---
const { Renderer, Stave, StaveNote, Voice, Formatter } = Vex.Flow;
let vfContext, vfStave, vfGroup;

function initVexFlow() {
    // Clear previous
    notationDiv.innerHTML = '';
    const renderer = new Renderer(notationDiv, Renderer.Backends.SVG);
    renderer.resize(350, 150);
    vfContext = renderer.getContext();
    vfGroup = vfContext.openGroup();
    
    // Draw Stave
    vfStave = new Stave(10, 40, 300);
    vfStave.addClef("treble").addTimeSignature("4/4");
    vfStave.setContext(vfContext).draw();
    vfContext.closeGroup();
}

function renderNote(noteName) {
    // Format note for VexFlow (e.g., "C#4" -> "c#/4")
    if(!noteName) return;
    
    const parts = noteName.match(/([A-G]#?)(\d)/);
    if (!parts) return;
    
    const key = parts[1].toLowerCase();
    const octave = parts[2];
    const vfKey = `${key}/${octave}`;

    // Clear previous notes (simple clear rect strategy for demo)
    const group = vfContext.openGroup();
    vfContext.rect(0, 0, 350, 150, { fill: 'white' }); // Hacky clear
    vfStave.draw(); // Redraw stave lines

    const notes = [
        new StaveNote({ keys: [vfKey], duration: "q" })
    ];

    if (key.includes('#')) notes[0].addModifier(new Vex.Flow.Accidental("#"));

    const voice = new Voice({num_beats: 1,  beat_value: 4});
    voice.addTickables(notes);
    new Formatter().joinVoices([voice]).format([voice], 200);
    voice.draw(vfContext, vfStave);
    vfContext.closeGroup();
}


// --- AUDIO & ML LOGIC ---
async function startListening() {
    if (isListening) return;
    
    statusDiv.innerText = "Initializing Audio Context...";
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    
    // Initialize ML5 Pitch Detection
    statusDiv.innerText = "Loading Model...";
    pitch = ml5.pitchDetection(
        './model/', // NOTE: ML5 usually needs a model path, but modern versions handle default 'CREPE'
        audioContext,
        stream,
        modelLoaded
    );
}

function modelLoaded() {
    statusDiv.innerText = "Listening... Sing or Play a note!";
    isListening = true;
    startBtn.style.display = 'none';
    getPitch();
}

function getPitch() {
    pitch.getPitch(function(err, frequency) {
        if (frequency) {
            const note = frequencyToNote(frequency);
            if (note && note !== currentNote) {
                currentNote = note;
                updateUI(note);
            }
        }
        getPitch(); // Recursive loop
    });
}

// --- HELPERS ---
function frequencyToNote(freq) {
    // Simple formula to get MIDI note number
    const noteNum = 12 * (Math.log(freq / 440) / Math.log(2)) + 69;
    const rounded = Math.round(noteNum);
    
    // Map MIDI number to Note Name
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const noteIndex = rounded % 12;
    const octave = Math.floor(rounded / 12) - 1;
    
    return `${noteNames[noteIndex]}${octave}`;
}

function updateUI(note) {
    statusDiv.innerText = `Detected: ${note}`;
    
    // 1. Highlight Piano
    document.querySelectorAll('.key').forEach(k => k.classList.remove('active'));
    const keyEl = document.querySelector(`.key[data-note="${note}"]`);
    
    if (keyEl) {
        keyEl.classList.add('active');
        // Auto scroll to key on mobile
        keyEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        
        // 2. Suggest Finger (Heuristic)
        // Basic Logic: thumb (1) for C, index (2) for D...
        const baseNote = note.slice(0, -1); // Remove octave
        const fingerMap = { 'C': 1, 'D': 2, 'E': 3, 'F': 1, 'G': 2, 'A': 3, 'B': 4 };
        const finger = fingerMap[baseNote] || (baseNote.includes('#') ? 2 : 1);
        fingerDisplay.innerText = finger;
        
        // 3. Render Sheet Music
        renderNote(note);
    }
}
