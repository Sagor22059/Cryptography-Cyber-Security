import { Caesar, Playfair, Monoalphabetic, OTP, Hill } from './ciphers.js';

// Educational Content Database
const educationalInfo = {
    caesar: {
        history: "The Caesar Cipher is one of the earliest and simplest known ciphers, named after Julius Caesar, who used it to communicate private military correspondence. It is a type of substitution cipher where each letter in the plaintext is shifted a fixed number of positions down the alphabet.",
        math: "Mathematically, the encryption of a letter $p$ with shift $k$ is defined as:<br><code>E(p) = (p + k) mod 26</code><br>Decryption is defined as:<br><code>D(c) = (c - k) mod 26</code>",
        strengths: [
            "Extremely easy to compute and understand.",
            "Weakness: Has only 25 possible keys (excluding shift 0). Can be easily brute-forced in fractions of a second.",
            "Weakness: Vulnerable to frequency analysis since single-letter mapping patterns remain identical."
        ]
    },
    playfair: {
        history: "Invented in 1854 by Charles Wheatstone, the Playfair Cipher was the first practical symmetric digraph substitution cipher. It was rejected by the British Foreign Office for being 'too complex', but was later used by British forces in the Second Boer War and World War I for tactical communications.",
        math: "The cipher encrypts pairs of letters (digraphs) using a 5x5 grid containing a keyword. Letters 'I' and 'J' share a cell. The grid rules are:<br>1. If letters are in the same row, shift right.<br>2. If in the same column, shift down.<br>3. If they form a rectangle, swap corners.",
        strengths: [
            "More secure than simple monoalphabetic ciphers since frequency analysis must analyze 676 digraph pairs instead of 26 single letters.",
            "Weakness: Still vulnerable to double-letter frequency analysis.",
            "Weakness: Leaves clues (e.g. word structure patterns, reverse pair relationships)."
        ]
    },
    monoalphabetic: {
        history: "A Monoalphabetic Substitution Cipher replaces each letter of the alphabet with a corresponding letter from a shuffled alphabet key. It was widely used in ancient and medieval times before the development of frequency analysis by Arab mathematician Al-Kindi in the 9th century.",
        math: "Encryption is a bijection mapping $f$ of the alphabet $\\Sigma$ to a permutation alphabet $\\Sigma'$:<br><code>E(p) = f(p)</code><br>Decryption uses the inverse mapping:<br><code>D(c) = f⁻¹(c)</code>",
        strengths: [
            "Provides $26! \\approx 4 \times 10^{26}$ possible keys, making brute-force search impossible by hand.",
            "Weakness: Highly vulnerable to frequency analysis, as standard letter frequencies (e.g., 'E', 'T', 'A' being common in English) are preserved in the ciphertext."
        ]
    },
    otp: {
        history: "The One-Time Pad (OTP) was invented by Gilbert Vernam and Joseph Mauborgne in 1917. It is a cryptographic algorithm where the plaintext is combined with a random key (the pad) of the exact same length. If the key is truly random, never reused, and kept secret, it is mathematically impossible to break.",
        math: "For an alphabet of 0-25, addition modulo 26 is used character-by-character:<br><code>E(pᵢ) = (pᵢ + kᵢ) mod 26</code><br>Decryption subtracts the key:<br><code>D(cᵢ) = (cᵢ - kᵢ + 26) mod 26</code>",
        strengths: [
            "Information-theoretically secure: possesses 'perfect secrecy'. Knowing the ciphertext gives no information about the plaintext.",
            "Weakness: Key distribution is difficult, as the key must be as long as the message and safely shared beforehand.",
            "Weakness: Keys must never be reused (reuse allows simple frequency attacks)."
        ]
    },
    hill: {
        history: "Invented by Lester S. Hill in 1929, the Hill Cipher was the first polyalphabetic cipher that made it practical to operate on more than three symbols at once. It uses linear algebra and matrix arithmetic to achieve diffusion and confusion, laying early concepts for block ciphers.",
        math: "Operating on digraphs (2 letters at a time), plaintext pairs $P = \\begin{pmatrix} p_1 \\\\ p_2 \\end{pmatrix}$ are multiplied by a 2x2 key matrix $K$ mod 26:<br><code>C = K · P mod 26</code><br>Decryption multiplies by the matrix inverse mod 26:<br><code>P = K⁻¹ · C mod 26</code> where $\\gcd(\\det(K), 26) = 1$.",
        strengths: [
            "Greatly obscures single-letter and double-letter frequencies by mixing blocks.",
            "Highly vulnerable to a Known-Plaintext Attack (KPA) using simple linear algebra (solving system of linear equations)."
        ]
    }
};

// UI State Management
let currentCipher = 'caesar';
let currentMode = 'encrypt'; // 'encrypt' or 'decrypt'

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const cipherTitle = document.getElementById('cipher-title');
const cipherSubtitle = document.getElementById('cipher-subtitle');
const cipherTypeBadge = document.getElementById('cipher-type-badge');

const modeEncrypt = document.getElementById('mode-encrypt');
const modeDecrypt = document.getElementById('mode-decrypt');
const labelInputText = document.getElementById('label-input-text');
const labelOutputText = document.getElementById('label-output-text');
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const btnClearAll = document.getElementById('btn-clear-all');
const btnCopyOutput = document.getElementById('btn-copy-output');
const alertContainer = document.getElementById('alert-container');

// Config and Visual Wrappers
const configSections = document.querySelectorAll('.cipher-config');
const visualWrappers = document.querySelectorAll('.visual-wrapper');
const traceContainer = document.getElementById('trace-output-container');
const educationalContent = document.getElementById('educational-content');

// Caesar DOM elements
const caesarShift = document.getElementById('caesar-shift');
const caesarShiftVal = document.getElementById('caesar-shift-val');
const caesarVisualMapping = document.getElementById('caesar-visual-mapping');

// Playfair DOM elements
const playfairKey = document.getElementById('playfair-key');
const playfairGridVisual = document.getElementById('playfair-grid-visual');

// Monoalphabetic DOM elements
const monoKey = document.getElementById('mono-key');
const btnRandomMono = document.getElementById('btn-random-mono');
const monoVisualMapping = document.getElementById('mono-visual-mapping');

// OTP DOM elements
const otpKey = document.getElementById('otp-key');
const btnGenerateOtp = document.getElementById('btn-generate-otp');
const otpLengthStatus = document.getElementById('otp-length-status');

// Hill DOM elements
const hillK00 = document.getElementById('hill-k00');
const hillK01 = document.getElementById('hill-k01');
const hillK10 = document.getElementById('hill-k10');
const hillK11 = document.getElementById('hill-k11');
const hillDetVal = document.getElementById('hill-det-val');
const hillStatusBadge = document.getElementById('hill-status-badge');
const btnRandomHill = document.getElementById('btn-random-hill');
const hillDecryptMatrixDisplay = document.getElementById('hill-decrypt-matrix-display');
const hillDecryptMatrixGrid = document.getElementById('hill-decrypt-matrix-grid');

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    switchCipher('caesar');
    updateEducationalInfo('caesar');
    setupEventListeners();
    runCipher();
});

// ==========================================
// Setup Listeners
// ==========================================
function setupEventListeners() {
    // Navigation Menu
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const cipher = item.getAttribute('data-cipher');
            switchCipher(cipher);
        });
    });

    // Encrypt / Decrypt Toggle
    modeEncrypt.addEventListener('click', () => {
        if (currentMode !== 'encrypt') {
            currentMode = 'encrypt';
            modeEncrypt.classList.add('active');
            modeDecrypt.classList.remove('active');
            labelInputText.textContent = "Plaintext Input";
            labelOutputText.textContent = "Ciphertext Output";
            inputText.placeholder = "Type message to encrypt...";
            runCipher();
        }
    });

    modeDecrypt.addEventListener('click', () => {
        if (currentMode !== 'decrypt') {
            currentMode = 'decrypt';
            modeDecrypt.classList.add('active');
            modeEncrypt.classList.remove('active');
            labelInputText.textContent = "Ciphertext Input";
            labelOutputText.textContent = "Plaintext Output";
            inputText.placeholder = "Type message to decrypt...";
            runCipher();
        }
    });

    // Clear All button
    btnClearAll.addEventListener('click', () => {
        inputText.value = "";
        outputText.value = "";
        runCipher();
    });

    // Copy Output button
    btnCopyOutput.addEventListener('click', () => {
        if (outputText.value) {
            navigator.clipboard.writeText(outputText.value).then(() => {
                const icon = btnCopyOutput.querySelector('i');
                icon.className = "fa-solid fa-check";
                icon.style.color = "var(--accent-emerald)";
                setTimeout(() => {
                    icon.className = "fa-solid fa-copy";
                    icon.style.color = "";
                }, 2000);
            });
        }
    });

    // Text Input typing
    inputText.addEventListener('input', () => {
        runCipher();
    });

    // Caesar Shift Slider
    caesarShift.addEventListener('input', (e) => {
        caesarShiftVal.textContent = e.target.value;
        runCipher();
    });

    // Playfair Key
    playfairKey.addEventListener('input', () => {
        runCipher();
    });

    // Monoalphabetic Key
    monoKey.addEventListener('input', () => {
        runCipher();
    });

    btnRandomMono.addEventListener('click', () => {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        // Shuffle using Fisher-Yates
        for (let i = alphabet.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
        }
        monoKey.value = alphabet.join("");
        runCipher();
    });

    // OTP Key
    otpKey.addEventListener('input', () => {
        runCipher();
    });

    btnGenerateOtp.addEventListener('click', () => {
        const cleanInput = inputText.value.toUpperCase().replace(/[^A-Z]/g, "");
        const length = cleanInput.length || 15; // default to 15 if empty
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let generated = "";
        for (let i = 0; i < length; i++) {
            generated += alphabet[Math.floor(Math.random() * 26)];
        }
        otpKey.value = generated;
        runCipher();
    });

    // Hill Matrix Inputs
    [hillK00, hillK01, hillK10, hillK11].forEach(input => {
        input.addEventListener('input', () => {
            validateAndCalculateHillMatrix();
            runCipher();
        });
    });

    btnRandomHill.addEventListener('click', () => {
        generateRandomValidHillMatrix();
    });
}

// ==========================================
// View Switcher (Tab logic)
// ==========================================
function switchCipher(cipher) {
    currentCipher = cipher;
    
    // Update labels and titles
    let title = "";
    let subtitle = "";
    let badge = "";

    switch (cipher) {
        case 'caesar':
            title = "Caesar Cipher";
            subtitle = "A simple substitution cipher shifting alphabet characters by a fixed value.";
            badge = "Substitution Cipher";
            break;
        case 'playfair':
            title = "Playfair Cipher";
            subtitle = "A symmetric digraph substitution cipher utilizing a 5x5 grid keyword mapping.";
            badge = "Digraph Substitution";
            break;
        case 'monoalphabetic':
            title = "Monoalphabetic Substitution";
            subtitle = "A cipher mapping each letter of the alphabet to a unique replacement letter.";
            badge = "Substitution Cipher";
            break;
        case 'otp':
            title = "One-Time Pad (OTP)";
            subtitle = "A symmetric cipher combining plaintext characters with a key of equal length.";
            badge = "Perfect Secrecy";
            break;
        case 'hill':
            title = "Hill Cipher";
            subtitle = "A polyalphabetic substitution block cipher applying matrix multiplication mod 26.";
            badge = "Polyalphabetic Block";
            break;
    }

    cipherTitle.textContent = title;
    cipherSubtitle.textContent = subtitle;
    cipherTypeBadge.textContent = badge;

    // Toggle configuration panels
    configSections.forEach(section => {
        if (section.id === `config-${cipher}`) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });

    // Toggle visualizer panels
    visualWrappers.forEach(wrapper => {
        if (wrapper.id === `visual-${cipher}-wrapper`) {
            wrapper.style.display = 'block';
        } else {
            wrapper.style.display = 'none';
        }
    });

    // Hide error alert
    hideAlert();

    // Specific cipher setup actions
    if (cipher === 'hill') {
        validateAndCalculateHillMatrix();
    }

    // Refresh educational instructions
    updateEducationalInfo(cipher);

    // Re-run computation
    runCipher();
}

// ==========================================
// Educational panel rendering
// ==========================================
function updateEducationalInfo(cipher) {
    const data = educationalInfo[cipher];
    if (!data) return;

    let strengthsHTML = data.strengths.map(s => `<li><i class="fa-solid fa-circle-chevron-right"></i> <span>${s}</span></li>`).join("");

    educationalContent.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 0.5rem;">
            <div>
                <h4 style="font-size: 1.05rem; font-weight: 600; color: var(--accent-indigo); margin-bottom: 0.5rem;">Historical Significance</h4>
                <p class="info-text">${data.history}</p>
                
                <h4 style="font-size: 1.05rem; font-weight: 600; color: var(--accent-indigo); margin-top: 1.5rem; margin-bottom: 0.5rem;">Cryptanalysis & Security</h4>
                <ul class="info-list">
                    ${strengthsHTML}
                </ul>
            </div>
            <div style="background-color: rgba(0, 0, 0, 0.2); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; justify-content: center;">
                <h4 style="font-size: 1.05rem; font-weight: 600; color: var(--accent-violet); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-square-root-variable"></i> Mathematical Foundation
                </h4>
                <div class="info-text" style="font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.7; color: var(--text-primary);">
                    ${data.math}
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// Alert Handler
// ==========================================
function showAlert(message) {
    alertContainer.className = "alert-message alert-danger";
    alertContainer.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <div>${message}</div>`;
    alertContainer.style.display = 'flex';
}

function hideAlert() {
    alertContainer.style.display = 'none';
}

// ==========================================
// Hill Matrix Validators
// ==========================================
function validateAndCalculateHillMatrix() {
    const a = parseInt(hillK00.value) || 0;
    const b = parseInt(hillK01.value) || 0;
    const c = parseInt(hillK10.value) || 0;
    const d = parseInt(hillK11.value) || 0;

    const validation = Hill.validateKey(a, b, c, d);

    hillDetVal.textContent = validation.det;

    if (validation.isValid) {
        hillStatusBadge.textContent = "Valid Matrix";
        hillStatusBadge.style.color = "var(--accent-emerald)";
        hideAlert();

        // Calculate decryption matrix to display in visualizer
        const detInv = modInverse(validation.det, 26);
        if (detInv) {
            const da = ((d * detInv) % 26 + 26) % 26;
            const db = ((-b * detInv) % 26 + 26) % 26;
            const dc = ((-c * detInv) % 26 + 26) % 26;
            const dd = ((a * detInv) % 26 + 26) % 26;

            hillDecryptMatrixDisplay.style.display = 'block';
            const cells = hillDecryptMatrixGrid.querySelectorAll('.hill-matrix-input');
            cells[0].textContent = da;
            cells[1].textContent = db;
            cells[2].textContent = dc;
            cells[3].textContent = dd;
        }
    } else {
        hillStatusBadge.textContent = "Invalid Matrix";
        hillStatusBadge.style.color = "var(--accent-rose)";
        hillDecryptMatrixDisplay.style.display = 'none';
        showAlert(validation.error);
    }
}

function modInverse(a, m) {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
        if (((a * x) % m) === 1) {
            return x;
        }
    }
    return null;
}

function gcd(a, b) {
    while (b) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

function generateRandomValidHillMatrix() {
    let attempts = 0;
    while (attempts < 1000) {
        const a = Math.floor(Math.random() * 25) + 1;
        const b = Math.floor(Math.random() * 25) + 1;
        const c = Math.floor(Math.random() * 25) + 1;
        const d = Math.floor(Math.random() * 25) + 1;

        const det = ((a * d - b * c) % 26 + 26) % 26;
        if (gcd(det, 26) === 1) {
            hillK00.value = a;
            hillK01.value = b;
            hillK10.value = c;
            hillK11.value = d;
            validateAndCalculateHillMatrix();
            runCipher();
            return;
        }
        attempts++;
    }
}

// ==========================================
// CORE COMPUTATION ROUTINE
// ==========================================
function runCipher() {
    const text = inputText.value;
    if (!text) {
        outputText.value = "";
        renderTrace([]);
        updateKeyVisualizer();
        return;
    }

    let response = { result: "", trace: [] };

    hideAlert();

    try {
        if (currentCipher === 'caesar') {
            const shift = parseInt(caesarShift.value) || 0;
            if (currentMode === 'encrypt') {
                response = Caesar.encrypt(text, shift);
            } else {
                response = Caesar.decrypt(text, shift);
            }
        } 
        else if (currentCipher === 'playfair') {
            const key = playfairKey.value;
            if (currentMode === 'encrypt') {
                response = Playfair.encrypt(text, key);
            } else {
                response = Playfair.decrypt(text, key);
            }
        } 
        else if (currentCipher === 'monoalphabetic') {
            const key = monoKey.value;
            if (currentMode === 'encrypt') {
                response = Monoalphabetic.encrypt(text, key);
            } else {
                response = Monoalphabetic.decrypt(text, key);
            }
        } 
        else if (currentCipher === 'otp') {
            const key = otpKey.value;
            if (currentMode === 'encrypt') {
                response = OTP.encrypt(text, key);
            } else {
                response = OTP.decrypt(text, key);
            }
            
            // Render OTP key length display status
            const lettersCount = text.toUpperCase().replace(/[^A-Z]/g, "").length;
            const keyLettersCount = key.toUpperCase().replace(/[^A-Z]/g, "").length;
            otpLengthStatus.textContent = `${keyLettersCount} / ${lettersCount} letters`;
            if (keyLettersCount < lettersCount) {
                otpLengthStatus.style.color = "var(--accent-rose)";
            } else {
                otpLengthStatus.style.color = "var(--accent-emerald)";
            }
        } 
        else if (currentCipher === 'hill') {
            const matrix = [
                parseInt(hillK00.value) || 0,
                parseInt(hillK01.value) || 0,
                parseInt(hillK10.value) || 0,
                parseInt(hillK11.value) || 0
            ];
            if (currentMode === 'encrypt') {
                response = Hill.encrypt(text, matrix);
            } else {
                response = Hill.decrypt(text, matrix);
            }
        }

        if (response.error) {
            showAlert(response.error);
            outputText.value = "";
            renderTrace([]);
        } else {
            outputText.value = response.result;
            renderTrace(response.trace);
        }

    } catch (e) {
        console.error(e);
        showAlert("An execution error occurred inside the cipher runner: " + e.message);
        outputText.value = "";
        renderTrace([]);
    }

    updateKeyVisualizer();
}

// ==========================================
// Render static Visual Keys (Grid / Tables)
// ==========================================
function updateKeyVisualizer() {
    if (currentCipher === 'caesar') {
        const shift = parseInt(caesarShift.value) || 0;
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        let html = "";
        for (let i = 0; i < alphabet.length; i++) {
            const orig = alphabet[i];
            const modVal = (i + (currentMode === 'encrypt' ? shift : -shift) + 26) % 26;
            const sub = alphabet[modVal];
            html += `
                <div class="mono-pair">
                    <span class="mono-orig">${orig}</span>
                    <span class="mono-sub">${sub}</span>
                </div>
            `;
        }
        caesarVisualMapping.innerHTML = html;
    } 
    else if (currentCipher === 'playfair') {
        const key = playfairKey.value;
        const { matrix } = Playfair.generateGrid(key);
        let html = "";
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const char = matrix[r][c];
                // Check if this letter was in the original keyphrase
                const keyClean = key.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
                const isFromKey = keyClean.indexOf(char) !== -1;
                const cellClass = isFromKey ? 'playfair-cell active-key' : 'playfair-cell';
                html += `<div class="${cellClass}" id="cell-${r}-${c}">${char}</div>`;
            }
        }
        playfairGridVisual.innerHTML = html;
    } 
    else if (currentCipher === 'monoalphabetic') {
        const key = monoKey.value.toUpperCase();
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        let html = "";
        for (let i = 0; i < alphabet.length; i++) {
            const orig = alphabet[i];
            const sub = key[i] || "-";
            html += `
                <div class="mono-pair">
                    <span class="mono-orig">${orig}</span>
                    <span class="mono-sub" style="color: ${currentMode === 'encrypt' ? 'var(--accent-indigo)' : 'var(--accent-emerald)'}">${sub}</span>
                </div>
            `;
        }
        monoVisualMapping.innerHTML = html;
    }
}

// ==========================================
// Trace Renderer (Step-by-Step logs)
// ==========================================
function renderTrace(trace) {
    if (!trace || trace.length === 0) {
        traceContainer.innerHTML = `
            <div class="no-trace">
                ${inputText.value ? 'Correct errors to see trace data...' : 'Type standard letters in the input box to see live mathematical tracing steps...'}
            </div>
        `;
        return;
    }

    let html = "";
    trace.forEach((step, idx) => {
        if (currentCipher === 'caesar') {
            html += `
                <div class="trace-item">
                    <div class="trace-step-header">
                        <span>Step ${idx + 1}</span>
                        <span>Shift ${caesarShift.value}</span>
                    </div>
                    <div class="trace-step-body">
                        <div class="trace-letter-map">
                            <div class="trace-l-box l-orig">${step.char}</div>
                            <div class="l-arrow"><i class="fa-solid fa-arrow-right"></i></div>
                            <div class="trace-l-box l-new">${step.newChar}</div>
                        </div>
                        <div class="trace-math-expr">
                            Index: ${step.origVal} &rarr; ${step.operation} = ${step.newVal}
                        </div>
                    </div>
                </div>
            `;
        } 
        else if (currentCipher === 'playfair') {
            html += `
                <div class="trace-item playfair-trace-item" 
                     data-r1="${step.r1}" data-c1="${step.c1}" 
                     data-r2="${step.r2}" data-c2="${step.c2}">
                    <div class="trace-step-header">
                        <span>Step ${idx + 1} &bull; ${step.rule}</span>
                        <span>Digraph</span>
                    </div>
                    <div class="trace-step-body">
                        <div class="trace-letter-map">
                            <div class="trace-l-box l-orig">${step.original[0]}</div>
                            <div class="trace-l-box l-orig">${step.original[1]}</div>
                            <div class="l-arrow"><i class="fa-solid fa-arrow-right"></i></div>
                            <div class="trace-l-box l-new">${step.encoded[0]}</div>
                            <div class="trace-l-box l-new">${step.encoded[1]}</div>
                        </div>
                        <div class="trace-math-expr" style="font-size: 0.75rem;">
                            ${step.details || ""}
                        </div>
                    </div>
                </div>
            `;
        } 
        else if (currentCipher === 'monoalphabetic') {
            html += `
                <div class="trace-item">
                    <div class="trace-step-header">
                        <span>Step ${idx + 1}</span>
                        <span>Substitution</span>
                    </div>
                    <div class="trace-step-body">
                        <div class="trace-letter-map">
                            <div class="trace-l-box l-orig">${step.char}</div>
                            <div class="l-arrow"><i class="fa-solid fa-arrow-right"></i></div>
                            <div class="trace-l-box l-new">${step.newChar}</div>
                        </div>
                        <div class="trace-math-expr">
                            Map: ${step.mapping} (alphabet index ${step.originalIdx})
                        </div>
                    </div>
                </div>
            `;
        } 
        else if (currentCipher === 'otp') {
            html += `
                <div class="trace-item">
                    <div class="trace-step-header">
                        <span>Step ${idx + 1}</span>
                        <span>Key letter: ${step.kChar} (${step.kVal})</span>
                    </div>
                    <div class="trace-step-body">
                        <div class="trace-letter-map">
                            <div class="trace-l-box l-orig">${step.char}</div>
                            <div class="l-arrow"><i class="fa-solid fa-arrow-right"></i></div>
                            <div class="trace-l-box l-new">${step.newChar}</div>
                        </div>
                        <div class="trace-math-expr">
                            ${step.operation}
                        </div>
                    </div>
                </div>
            `;
        } 
        else if (currentCipher === 'hill') {
            html += `
                <div class="trace-item">
                    <div class="trace-step-header">
                        <span>Step ${idx + 1} &bull; Vector: [${step.p1}, ${step.p2}]</span>
                        <span>Matrix Block</span>
                    </div>
                    <div class="trace-step-body" style="align-items: flex-start;">
                        <div class="trace-letter-map" style="margin-top: 5px;">
                            <div class="trace-l-box l-orig">${step.pPair[0]}</div>
                            <div class="trace-l-box l-orig">${step.pPair[1]}</div>
                            <div class="l-arrow"><i class="fa-solid fa-arrow-right"></i></div>
                            <div class="trace-l-box l-new">${step.cPair[0]}</div>
                            <div class="trace-l-box l-new">${step.cPair[1]}</div>
                        </div>
                        <div class="trace-math-expr" style="text-align: left; font-size: 0.75rem; padding: 0.5rem; line-height: 1.5;">
                            ${step.math[0]}<br>${step.math[1]}
                        </div>
                    </div>
                </div>
            `;
        }
    });

    if (trace.length < (currentCipher === 'hill' ? Math.ceil(inputText.value.replace(/[^A-Z]/gi, "").length / 2) : inputText.value.replace(/[^A-Z]/gi, "").length)) {
        html += `
            <div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding-top: 0.5rem;">
                ... and ${currentCipher === 'hill' ? 'digraphs' : 'letters'} beyond are calculated using the same logic.
            </div>
        `;
    }

    traceContainer.innerHTML = html;

    // Apply Playfair highlights on trace items mouseenter / mouseleave
    if (currentCipher === 'playfair') {
        const traceItems = traceContainer.querySelectorAll('.playfair-trace-item');
        traceItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const r1 = item.getAttribute('data-r1');
                const c1 = item.getAttribute('data-c1');
                const r2 = item.getAttribute('data-r2');
                const c2 = item.getAttribute('data-c2');

                const cell1 = document.getElementById(`cell-${r1}-${c1}`);
                const cell2 = document.getElementById(`cell-${r2}-${c2}`);

                if (cell1) cell1.classList.add('highlight-p1');
                if (cell2) cell2.classList.add('highlight-p2');
            });

            item.addEventListener('mouseleave', () => {
                const r1 = item.getAttribute('data-r1');
                const c1 = item.getAttribute('data-c1');
                const r2 = item.getAttribute('data-r2');
                const c2 = item.getAttribute('data-c2');

                const cell1 = document.getElementById(`cell-${r1}-${c1}`);
                const cell2 = document.getElementById(`cell-${r2}-${c2}`);

                if (cell1) cell1.classList.remove('highlight-p1');
                if (cell2) cell2.classList.remove('highlight-p2');
            });
        });
    }
}
