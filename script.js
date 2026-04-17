let currentInput = null;

function generateMatrix() {
    const n = document.getElementById('size').value;
    const container = document.getElementById('matrix-container');
    container.innerHTML = '';

    for (let i = 0; i < n; i++) {
        let row = document.createElement('div');
        row.className = 'matrix-row';
        for (let j = 0; j <= n; j++) {
            let input = document.createElement('input'); // 1. Buat elemen
            input.type = 'text';
            input.id = `c-${i}-${j}`;
            
            // 2. Atur properti di dalam loop agar berlaku untuk semua kotak
            input.readOnly = false; 
            input.onfocus = function() { currentInput = this; };
            input.onclick = function() { currentInput = this; };
            
            row.appendChild(input);
        }
        container.appendChild(row);
    }
    
    // 3. Fokus otomatis ke kotak pertama setelah semua dibuat
    currentInput = document.getElementById('c-0-0');
    if (currentInput) currentInput.focus();
}


function pressKey(key) {
    if (!currentInput) return;
    
    if (key === 'clear') {
        currentInput.value = '';
    } else if (key === 'backspace') {
        // Menghapus satu karakter terakhir
        currentInput.value = currentInput.value.slice(0, -1);
    } else {
        currentInput.value += key;
    }
    // Kembalikan fokus ke input agar kursor tetap di sana
    currentInput.focus();
}

function changeSize(val) {
    let size = document.getElementById('size');
    let newVal = parseInt(size.value) + val;
    if (newVal >= 2 && newVal <= 5) size.value = newVal;
}

function solveGaussJordan() {
    const n = parseInt(document.getElementById('size').value);
    let a = [];
    for (let i = 0; i < n; i++) {
        a[i] = [];
        for (let j = 0; j <= n; j++) {
            a[i][j] = parseFloat(document.getElementById(`c-${i}-${j}`).value) || 0;
        }
    }

    for (let i = 0; i < n; i++) {
        let pivot = a[i][i];
        if (Math.abs(pivot) < 1e-10) continue;
        for (let j = 0; j <= n; j++) a[i][j] /= pivot;
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                let factor = a[k][i];
                for (let j = 0; j <= n; j++) a[k][j] -= factor * a[i][j];
            }
        }
    }

    let resHTML = "<h3>Hasil:</h3>";
    a.forEach((r, i) => resHTML += `x${i+1} = ${r[n].toFixed(2)}<br>`);
    document.getElementById('result').innerHTML = resHTML;
}

window.onload = generateMatrix;
// ... (Fungsi pressKey, changeSize, generateMatrix sama seperti sebelumnya) ...

function solveGaussJordan() {
    const n = parseInt(document.getElementById('size').value);
    let a = [];
    let steps = "";

    for (let i = 0; i < n; i++) {
        a[i] = [];
        for (let j = 0; j <= n; j++) {
            a[i][j] = parseFloat(document.getElementById(`c-${i}-${j}`).value) || 0;
        }
    }

    for (let i = 0; i < n; i++) {
        let pivot = a[i][i];
        
        // Simbol Normalisasi: Ri / pivot -> Ri
        steps += `<div class="step-box"><span class="notation">R<sub>${i+1}</sub> &divide; ${pivot.toFixed(2)} &rarr; R<sub>${i+1}</sub></span>`;
        
        for (let j = 0; j <= n; j++) a[i][j] /= pivot;
        steps += `<div class="matrix-display">${formatMatrix(a)}</div></div>`;

        for (let k = 0; k < n; k++) {
            if (k !== i) {
                let factor = a[k][i];
                // Simbol Eliminasi: Rk - (factor * Ri) -> Rk
                steps += `<div class="step-box"><span class="notation">R<sub>${k+1}</sub> - (${factor.toFixed(2)} &times; R<sub>${i+1}</sub>) &rarr; R<sub>${k+1}</sub></span>`;
                
                for (let j = 0; j <= n; j++) a[k][j] -= factor * a[i][j];
                steps += `<div class="matrix-display">${formatMatrix(a)}</div></div>`;
            }
        }
    }
    document.getElementById('steps-container').innerHTML = "<h2>Langkah-langkah:</h2>" + steps;
}

function formatMatrix(m) {
    return m.map(row => "[" + row.map(val => val.toFixed(2).padStart(6)).join(", ") + "]").join("<br>");
}
