let currentInput = null;

function generateMatrix() {
    const n = parseInt(document.getElementById('size').value) || 3;
    updateMatrixColumnWidth(n);
    const container = document.getElementById('matrix-container');
    container.innerHTML = '';

    // Header: empty cell for row numbers, then x1..xn and b
    const header = document.createElement('div');
    header.className = 'matrix-row matrix-header';
    const headerLeft = document.createElement('div');
    headerLeft.className = 'row-number row-number-header';
    headerLeft.textContent = '';
    header.appendChild(headerLeft);
    for (let j = 0; j < n; j++) {
        const label = document.createElement('div');
        label.className = 'col-label';
        label.textContent = `x${j+1}`;
        header.appendChild(label);
    }
    const lastLabel = document.createElement('div');
    lastLabel.className = 'col-label';
    lastLabel.textContent = 'b';
    header.appendChild(lastLabel);
    container.appendChild(header);

    for (let i = 0; i < n; i++) {
        let row = document.createElement('div');
        row.className = 'matrix-row';

        // Row number on the left
        const rn = document.createElement('div');
        rn.className = 'row-number';
        rn.textContent = (i + 1);
        row.appendChild(rn);

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

    // Fokus otomatis ke kotak pertama setelah semua dibuat
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

    // Ambil nilai input
    let current = parseInt(size.value) || 2;

    // Tambahkan / kurangi
    let newVal = current + val;

    // Batas minimum dan maksimum
    if (newVal < 2) newVal = 2;
    if (newVal > 100) newVal = 100;

    // Update input
    size.value = newVal;
}

function validateSize() {
    let size = document.getElementById('size');

    let value = parseInt(size.value);

    if (isNaN(value) || value < 2) {
        size.value = 2;
    }

    if (value > 100) {
        size.value = 100;
    }
}

window.addEventListener('load', function() {
    initTheme();
    generateMatrix();
});

window.addEventListener('resize', function() {
    const size = parseInt(document.getElementById('size').value) || 3;
    updateMatrixColumnWidth(size);
});

function determineSolutionType(a, n) {
    // Cek apakah ada baris dengan semua koefisien 0 tetapi konstanta ≠ 0 (tidak ada solusi)
    for (let i = 0; i < n; i++) {
        let allZero = true;
        for (let j = 0; j < n; j++) {
            if (Math.abs(a[i][j]) > 1e-10) {
                allZero = false;
                break;
            }
        }
        if (allZero && Math.abs(a[i][n]) > 1e-10) {
            return "Tidak memiliki solusi (Sistem tidak konsisten)";
        }
    }

    // Hitung rank (jumlah baris non-zero)
    let rank = 0;
    for (let i = 0; i < n; i++) {
        let nonZero = false;
        for (let j = 0; j < n; j++) {
            if (Math.abs(a[i][j]) > 1e-10) {
                nonZero = true;
                break;
            }
        }
        if (nonZero) rank++;
    }

    if (rank < n) {
        return "Memiliki solusi tak hingga (Sistem underdetermined)";
    } else {
        return "Memiliki solusi tunggal (Sistem konsisten dan independen)";
    }
}

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

    // Tampilkan SPL awal
    let splDisplay = "<h3>📋 Sistem Persamaan Linear (SPL) Input:</h3>";
    for (let i = 0; i < n; i++) {
        let equation = "";
        for (let j = 0; j < n; j++) {
            let coeff = a[i][j];
            if (j === 0) {
                equation += `${coeff.toFixed(2)}x<sub>${j+1}</sub>`;
            } else {
                equation += coeff >= 0 ? ` + ${coeff.toFixed(2)}x<sub>${j+1}</sub>` : ` - ${Math.abs(coeff).toFixed(2)}x<sub>${j+1}</sub>`;
            }
        }
        let constant = a[i][n];
        equation += ` = ${constant.toFixed(2)}`;
        splDisplay += `<div class="spl-equation">${equation}</div>`;
    }

    // Lakukan Gauss-Jordan
    for (let i = 0; i < n; i++) {
        let pivot = a[i][i];
        
        if (Math.abs(pivot) < 1e-10) {
            // Cari baris dengan pivot non-zero
            let found = false;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(a[k][i]) > 1e-10) {
                    [a[i], a[k]] = [a[k], a[i]];
                    pivot = a[i][i];
                    found = true;
                    break;
                }
            }
            if (!found) continue;
        }
        
        // Simbol Normalisasi: Ri / pivot -> Ri
        steps += `<div class="step-box"><span class="notation">R<sub>${i+1}</sub> &divide; ${pivot.toFixed(2)} &rarr; R<sub>${i+1}</sub></span>`;
        
        for (let j = 0; j <= n; j++) a[i][j] /= pivot;
        steps += `<div class="matrix-display">${formatMatrix(a)}</div></div>`;

        for (let k = 0; k < n; k++) {
            if (k !== i) {
                let factor = a[k][i];
                if (Math.abs(factor) > 1e-10) {
                    // Simbol Eliminasi: Rk - (factor * Ri) -> Rk
                    steps += `<div class="step-box"><span class="notation">R<sub>${k+1}</sub> - (${factor.toFixed(2)} &times; R<sub>${i+1}</sub>) &rarr; R<sub>${k+1}</sub></span>`;
                    
                    for (let j = 0; j <= n; j++) a[k][j] -= factor * a[i][j];
                    steps += `<div class="matrix-display">${formatMatrix(a)}</div></div>`;
                }
            }
        }
    }
    
    let solutionType = determineSolutionType(a, n);
    let result = splDisplay;
    result += "<h2>🔢 Langkah-langkah Gauss-Jordan:</h2>" + steps;
    result += "<h3>✅ Solusi Akhir:</h3>";
    
    for (let i = 0; i < n; i++) {
        result += `<div class="solution">x<sub>${i+1}</sub> = ${a[i][n].toFixed(4)}</div>`;
    }
    
    result += `<div class="conclusion"><strong>📌 Kesimpulan:</strong> ${solutionType}</div>`;
    
    document.getElementById('steps-container').innerHTML = result;
}

function formatMatrix(m) {
    return m.map(row => "[" + row.map(val => val.toFixed(2).padStart(6)).join(", ") + "]").join("<br>");
}

function updateMatrixColumnWidth(n) {
    const matrixContainer = document.getElementById('matrix-container');
    const containerWidth = matrixContainer ? matrixContainer.clientWidth : window.innerWidth - 120;
    const rowNumberWidth = 36;
    const gap = 10;
    const columnCount = n + 1; // n variables + b
    const totalGaps = columnCount; // one gap after row number plus gaps between each input
    const availableWidth = Math.max(containerWidth - rowNumberWidth - gap * totalGaps, 180);
    const calculatedWidth = Math.floor(availableWidth / columnCount);
    const width = Math.max(36, Math.min(calculatedWidth, 140));
    document.documentElement.style.setProperty('--matrix-input-width', width + 'px');
}

/* ------------------ Theme (Dark Mode) ------------------ */
function applyTheme(theme) {
    if (theme === 'dark') document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    try { localStorage.setItem('theme', theme); } catch(e){}
}

function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved ? saved : (prefersDark ? 'dark' : 'light');
    applyTheme(theme);

    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌓';
    btn.addEventListener('click', function() {
        const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
        applyTheme(newTheme);
        btn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌓';
    });
}
