:root {
    --primary: #6200ea;
    --accent: #00e676;
    --bg: #f8f9fa;
}

body {
    margin: 0;
    font-family: system-ui, -apple-system, sans-serif;
    background: var(--bg);
    height: 100vh; /* Full viewport height */
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Prevent body scroll */
}

.app-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    background: white;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

/* Header */
header {
    padding: 15px;
    background: var(--primary);
    color: white;
    text-align: center;
    flex-shrink: 0; /* Don't shrink */
    z-index: 10;
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

h1 { margin: 0; font-size: 1.2rem; }

button {
    padding: 12px 24px;
    border: none;
    background: var(--accent);
    color: #000;
    font-weight: bold;
    border-radius: 30px;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
}

.secondary-btn {
    background: rgba(255,255,255,0.2);
    color: white;
    padding: 5px 15px;
    font-size: 0.8rem;
}

#status {
    margin-top: 10px;
    font-size: 0.8rem;
    opacity: 0.9;
}

/* Sheet Music Area */
#scroll-wrapper {
    flex-grow: 1; /* Takes all available space */
    overflow-x: auto; /* Scroll horizontally */
    overflow-y: hidden;
    background: white;
    display: flex;
    align-items: center;
    position: relative;
    border-bottom: 1px solid #ddd;
}

#notation {
    min-width: 100%; /* Ensure it starts full width */
    height: 150px;
}

/* Finger Guide */
.finger-guide {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding: 10px;
    background: #fff;
    border-bottom: 1px solid #eee;
    flex-shrink: 0;
}

.finger-box {
    text-align: center;
}

.label {
    display: block;
    font-size: 0.7rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.big-num {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary);
}

/* Piano */
.piano-container {
    height: 180px; /* Fixed height */
    background: #222;
    overflow-x: auto; /* Scroll keys */
    flex-shrink: 0; /* Don't shrink */
    border-top: 4px solid #000;
}

.piano {
    display: flex;
    height: 100%;
    padding: 0 10px;
    width: max-content;
    position: relative;
}

.key {
    width: 42px;
    height: 100%;
    background: white;
    border: 1px solid #ccc;
    border-radius: 0 0 4px 4px;
    flex-shrink: 0;
    margin-right: 2px;
    position: relative;
}

.key.black {
    background: #111;
    height: 60%;
    width: 32px;
    margin-left: -17px;
    margin-right: -15px;
    z-index: 2;
    border: 1px solid black;
}

.key.active {
    background: var(--accent) !important;
    transform: translateY(2px);
    box-shadow: inset 0 -5px 0 rgba(0,0,0,0.2);
}
