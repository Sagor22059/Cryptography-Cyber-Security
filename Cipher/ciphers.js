/**
 * Cryptographic Ciphers Library
 * Includes: Caesar, Playfair, Monoalphabetic, One-Time Pad (OTP), and Hill Ciphers.
 * Each cipher returns { result: string, trace: Array<Object>, error?: string }
 */

// Helper: check if character is letter
function isLetter(char) {
    return /[a-zA-Z]/.test(char);
}

// Helper: modular arithmetic (handles negative numbers correctly in JS)
function mod(n, m) {
    return ((n % m) + m) % m;
}

// Helper: find modular multiplicative inverse of a mod 26
function modInverse(a, m) {
    a = mod(a, m);
    for (let x = 1; x < m; x++) {
        if (mod(a * x, m) === 1) {
            return x;
        }
    }
    return null;
}

// Helper: compute greatest common divisor
function gcd(a, b) {
    while (b) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

// ==========================================
// 1. CAESAR CIPHER
// ==========================================
export const Caesar = {
    encrypt(text, shift) {
        shift = mod(parseInt(shift) || 0, 26);
        let result = "";
        let trace = [];
        
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            if (isLetter(char)) {
                let code = char.charCodeAt(0);
                let isUpper = char === char.toUpperCase();
                let base = isUpper ? 65 : 97;
                let originalIdx = code - base;
                let newIdx = mod(originalIdx + shift, 26);
                let newChar = String.fromCharCode(base + newIdx);
                result += newChar;
                
                if (trace.length < 15) { // Limit trace to first 15 characters to avoid bloat
                    trace.push({
                        idx: i,
                        char: char,
                        origVal: originalIdx,
                        operation: `(${originalIdx} + ${shift}) mod 26`,
                        newVal: newIdx,
                        newChar: newChar
                    });
                }
            } else {
                result += char;
            }
        }
        return { result, trace };
    },
    
    decrypt(text, shift) {
        shift = mod(parseInt(shift) || 0, 26);
        return this.encrypt(text, -shift);
    }
};

// ==========================================
// 2. PLAYFAIR CIPHER
// ==========================================
export const Playfair = {
    // Generate 5x5 grid from key
    generateGrid(key) {
        key = key.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
        let alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // No 'J'
        let used = new Set();
        let grid = [];
        
        // Populate key characters
        for (let char of key) {
            if (!used.has(char)) {
                used.add(char);
                grid.push(char);
            }
        }
        // Populate remaining alphabet
        for (let char of alphabet) {
            if (!used.has(char)) {
                used.add(char);
                grid.push(char);
            }
        }
        
        // Chunk grid into 5x5 matrix
        let matrix = [];
        for (let i = 0; i < 5; i++) {
            matrix.push(grid.slice(i * 5, i * 5 + 5));
        }
        return { matrix, flat: grid };
    },
    
    // Format text into digraphs (pairs of letters, replacing J with I, inserting X for duplicates)
    prepareText(text) {
        let cleanText = text.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
        let pairs = [];
        let i = 0;
        while (i < cleanText.length) {
            let a = cleanText[i];
            let b = cleanText[i + 1];
            
            if (!b) {
                pairs.push([a, 'X']);
                i++;
            } else if (a === b) {
                pairs.push([a, 'X']);
                i++;
            } else {
                pairs.push([a, b]);
                i += 2;
            }
        }
        return pairs;
    },
    
    // Find coords of a char in 5x5 flat grid
    findCoords(char, flatGrid) {
        let idx = flatGrid.indexOf(char);
        if (idx === -1) return [0, 0];
        let r = Math.floor(idx / 5);
        let c = idx % 5;
        return [r, c];
    },
    
    encrypt(text, key) {
        let { matrix, flat } = this.generateGrid(key);
        let pairs = this.prepareText(text);
        let result = "";
        let trace = [];
        
        for (let pair of pairs) {
            let [a, b] = pair;
            let [r1, c1] = this.findCoords(a, flat);
            let [r2, c2] = this.findCoords(b, flat);
            let na, nb, rule;
            
            if (r1 === r2) {
                // Same Row: shift right
                na = matrix[r1][mod(c1 + 1, 5)];
                nb = matrix[r2][mod(c2 + 1, 5)];
                rule = "Same Row (Shift Right)";
            } else if (c1 === c2) {
                // Same Column: shift down
                na = matrix[mod(r1 + 1, 5)][c1];
                nb = matrix[mod(r2 + 1, 5)][c2];
                rule = "Same Column (Shift Down)";
            } else {
                // Rectangle swap corners
                na = matrix[r1][c2];
                nb = matrix[r2][c1];
                rule = "Rectangle Corners Swap";
            }
            
            result += na + nb;
            if (trace.length < 10) {
                trace.push({
                    original: a + b,
                    encoded: na + nb,
                    r1, c1, r2, c2,
                    rule,
                    details: `${a}@[${r1},${c1}], ${b}@[${r2},${c2}] -> ${na}@[${r1},${c2 === c1 ? mod(c1+1,5) : c2}], ${nb}@[${r2},${c2 === c1 ? mod(c2+1,5) : c1}]`
                });
            }
        }
        
        return { result, trace, grid: matrix };
    },
    
    decrypt(text, key) {
        let { matrix, flat } = this.generateGrid(key);
        let cleanText = text.toUpperCase().replace(/[^A-Z]/g, "");
        let pairs = [];
        
        for (let i = 0; i < cleanText.length; i += 2) {
            let a = cleanText[i];
            let b = cleanText[i + 1] || 'X';
            pairs.push([a, b]);
        }
        
        let result = "";
        let trace = [];
        
        for (let pair of pairs) {
            let [a, b] = pair;
            let [r1, c1] = this.findCoords(a, flat);
            let [r2, c2] = this.findCoords(b, flat);
            let na, nb, rule;
            
            if (r1 === r2) {
                // Same Row: shift left
                na = matrix[r1][mod(c1 - 1, 5)];
                nb = matrix[r2][mod(c2 - 1, 5)];
                rule = "Same Row (Shift Left)";
            } else if (c1 === c2) {
                // Same Column: shift up
                na = matrix[mod(r1 - 1, 5)][c1];
                nb = matrix[mod(r2 - 1, 5)][c2];
                rule = "Same Column (Shift Up)";
            } else {
                // Rectangle swap corners
                na = matrix[r1][c2];
                nb = matrix[r2][c1];
                rule = "Rectangle Corners Swap";
            }
            
            result += na + nb;
            if (trace.length < 10) {
                trace.push({
                    original: a + b,
                    encoded: na + nb,
                    r1, c1, r2, c2,
                    rule
                });
            }
        }
        
        return { result, trace, grid: matrix };
    }
};

// ==========================================
// 3. MONOALPHABETIC CIPHER
// ==========================================
export const Monoalphabetic = {
    encrypt(text, keyAlphabet) {
        keyAlphabet = keyAlphabet.toUpperCase().replace(/[^A-Z]/g, "");
        if (keyAlphabet.length !== 26) {
            return { result: "", trace: [], error: "Substitution key alphabet must be exactly 26 letters." };
        }
        
        let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let result = "";
        let trace = [];
        
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            if (isLetter(char)) {
                let isUpper = char === char.toUpperCase();
                let upperChar = char.toUpperCase();
                let idx = alphabet.indexOf(upperChar);
                let replacement = keyAlphabet[idx];
                let newChar = isUpper ? replacement : replacement.toLowerCase();
                result += newChar;
                
                if (trace.length < 15) {
                    trace.push({
                        char: char,
                        originalIdx: idx,
                        newChar: newChar,
                        mapping: `${upperChar} -> ${replacement}`
                    });
                }
            } else {
                result += char;
            }
        }
        return { result, trace };
    },
    
    decrypt(text, keyAlphabet) {
        keyAlphabet = keyAlphabet.toUpperCase().replace(/[^A-Z]/g, "");
        if (keyAlphabet.length !== 26) {
            return { result: "", trace: [], error: "Substitution key alphabet must be exactly 26 letters." };
        }
        
        let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let result = "";
        let trace = [];
        
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            if (isLetter(char)) {
                let isUpper = char === char.toUpperCase();
                let upperChar = char.toUpperCase();
                let idx = keyAlphabet.indexOf(upperChar);
                let replacement = alphabet[idx];
                let newChar = isUpper ? replacement : replacement.toLowerCase();
                result += newChar;
                
                if (trace.length < 15) {
                    trace.push({
                        char: char,
                        originalIdx: idx,
                        newChar: newChar,
                        mapping: `${upperChar} -> ${replacement}`
                    });
                }
            } else {
                result += char;
            }
        }
        return { result, trace };
    }
};

// ==========================================
// 4. ONE-TIME PAD (OTP) CIPHER
// ==========================================
export const OTP = {
    encrypt(text, key) {
        let cleanTextLetters = text.toUpperCase().replace(/[^A-Z]/g, "");
        let cleanKey = key.toUpperCase().replace(/[^A-Z]/g, "");
        
        if (cleanKey.length < cleanTextLetters.length) {
            return { 
                result: "", 
                trace: [], 
                error: `Key must be at least as long as the plaintext alphabetic characters (${cleanTextLetters.length} letters needed, key only has ${cleanKey.length} letters).` 
            };
        }
        
        let result = "";
        let trace = [];
        let keyIdx = 0;
        
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            if (isLetter(char)) {
                let isUpper = char === char.toUpperCase();
                let base = isUpper ? 65 : 97;
                let pVal = char.toUpperCase().charCodeAt(0) - 65;
                let kVal = cleanKey[keyIdx].charCodeAt(0) - 65;
                let cVal = mod(pVal + kVal, 26);
                let newChar = String.fromCharCode(base + cVal);
                
                result += newChar;
                
                if (trace.length < 15) {
                    trace.push({
                        char: char,
                        pVal,
                        kChar: cleanKey[keyIdx],
                        kVal,
                        cVal,
                        newChar,
                        operation: `(${pVal} + ${kVal}) mod 26 = ${cVal}`
                    });
                }
                keyIdx++;
            } else {
                result += char;
            }
        }
        return { result, trace };
    },
    
    decrypt(text, key) {
        let cleanTextLetters = text.toUpperCase().replace(/[^A-Z]/g, "");
        let cleanKey = key.toUpperCase().replace(/[^A-Z]/g, "");
        
        if (cleanKey.length < cleanTextLetters.length) {
            return { 
                result: "", 
                trace: [], 
                error: `Key must be at least as long as the ciphertext alphabetic characters (${cleanTextLetters.length} letters needed, key only has ${cleanKey.length} letters).` 
            };
        }
        
        let result = "";
        let trace = [];
        let keyIdx = 0;
        
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            if (isLetter(char)) {
                let isUpper = char === char.toUpperCase();
                let base = isUpper ? 65 : 97;
                let cVal = char.toUpperCase().charCodeAt(0) - 65;
                let kVal = cleanKey[keyIdx].charCodeAt(0) - 65;
                let pVal = mod(cVal - kVal, 26);
                let newChar = String.fromCharCode(base + pVal);
                
                result += newChar;
                
                if (trace.length < 15) {
                    trace.push({
                        char: char,
                        cVal,
                        kChar: cleanKey[keyIdx],
                        kVal,
                        pVal,
                        newChar,
                        operation: `(${cVal} - ${kVal} + 26) mod 26 = ${pVal}`
                    });
                }
                keyIdx++;
            } else {
                result += char;
            }
        }
        return { result, trace };
    }
};

// ==========================================
// 5. HILL CIPHER (2x2 Matrix)
// ==========================================
export const Hill = {
    validateKey(a, b, c, d) {
        let det = mod(a * d - b * c, 26);
        let g = gcd(det, 26);
        let hasInverse = g === 1;
        return {
            det,
            isValid: hasInverse,
            error: hasInverse ? null : `Determinant (${det}) is not invertible mod 26 (gcd(${det}, 26) = ${g} != 1). Choose integers such that det has no common factors with 26 (i.e. odd determinant and not a multiple of 13).`
        };
    },
    
    encrypt(text, matrix) {
        // matrix = [a, b, c, d] for [[a, b], [c, d]]
        let [a, b, c, d] = matrix.map(v => parseInt(v) || 0);
        let validation = this.validateKey(a, b, c, d);
        if (!validation.isValid) {
            return { result: "", trace: [], error: validation.error };
        }
        
        let cleanText = text.toUpperCase().replace(/[^A-Z]/g, "");
        // Pad with 'X' if odd length
        if (cleanText.length % 2 !== 0) {
            cleanText += "X";
        }
        
        let result = "";
        let trace = [];
        
        for (let i = 0; i < cleanText.length; i += 2) {
            let p1 = cleanText[i].charCodeAt(0) - 65;
            let p2 = cleanText[i+1].charCodeAt(0) - 65;
            
            let c1 = mod(a * p1 + b * p2, 26);
            let c2 = mod(c * p1 + d * p2, 26);
            
            let ch1 = String.fromCharCode(c1 + 65);
            let ch2 = String.fromCharCode(c2 + 65);
            
            result += ch1 + ch2;
            
            if (trace.length < 8) {
                trace.push({
                    pPair: cleanText[i] + cleanText[i+1],
                    cPair: ch1 + ch2,
                    p1, p2,
                    c1, c2,
                    math: [
                        `(${a}*${p1} + ${b}*${p2}) mod 26 = ${c1}`,
                        `(${c}*${p1} + ${d}*${p2}) mod 26 = ${c2}`
                    ]
                });
            }
        }
        
        return { result, trace };
    },
    
    decrypt(text, matrix) {
        let [a, b, c, d] = matrix.map(v => parseInt(v) || 0);
        let validation = this.validateKey(a, b, c, d);
        if (!validation.isValid) {
            return { result: "", trace: [], error: validation.error };
        }
        
        let det = validation.det;
        let detInv = modInverse(det, 26);
        if (!detInv) {
            return { result: "", trace: [], error: "Determinant modular inverse doesn't exist." };
        }
        
        // Decryption matrix K^-1 = detInv * [d, -b, -c, a] mod 26
        let da = mod(d * detInv, 26);
        let db = mod(-b * detInv, 26);
        let dc = mod(-c * detInv, 26);
        let dd = mod(a * detInv, 26);
        
        let cleanText = text.toUpperCase().replace(/[^A-Z]/g, "");
        if (cleanText.length % 2 !== 0) {
            cleanText += "X"; // Standard fallback
        }
        
        let result = "";
        let trace = [];
        
        for (let i = 0; i < cleanText.length; i += 2) {
            let c1 = cleanText[i].charCodeAt(0) - 65;
            let c2 = cleanText[i+1].charCodeAt(0) - 65;
            
            let p1 = mod(da * c1 + db * c2, 26);
            let p2 = mod(dc * c1 + dd * c2, 26);
            
            let ch1 = String.fromCharCode(p1 + 65);
            let ch2 = String.fromCharCode(p2 + 65);
            
            result += ch1 + ch2;
            
            if (trace.length < 8) {
                trace.push({
                    pPair: ch1 + ch2,
                    cPair: cleanText[i] + cleanText[i+1],
                    p1, p2,
                    c1, c2,
                    math: [
                        `(${da}*${c1} + ${db}*${c2}) mod 26 = ${p1}`,
                        `(${dc}*${c1} + ${dd}*${c2}) mod 26 = ${p2}`
                    ]
                });
            }
        }
        
        return { 
            result, 
            trace,
            decryptMatrix: [da, db, dc, dd],
            detInv,
            det
        };
    }
};
