const canvas = document.getElementById('mathCanvas');
const ctx = canvas.getContext('2d');
const slider = document.getElementById('angleSlider');
const angleLabel = document.getElementById('angleValue');
const animateBtn = document.getElementById('btn-animate');
const cards = document.querySelectorAll('.card');

// Colors matching CSS variables
const colors = {
    bg: '#0d1117',
    text: '#c9d1d9',
    axis: 'rgba(201, 209, 217, 0.5)',
    blue: '#58a6ff',
    pink: '#ff7b72',
    green: '#3fb950',
    purple: '#bc8cff',
    orange: '#e3b341',
    circle: 'rgba(255, 255, 255, 0.2)'
};

// Canvas Resolution scaling for Retina
function resizeCanvas() {
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth, container.clientHeight);

    // Set logical size
    // canvas.style.width = size + 'px';
    // canvas.style.height = size + 'px';

    // High-DPI support
    const scale = window.devicePixelRatio || 1;
    canvas.width = size * scale;
    canvas.height = size * scale;
    ctx.scale(scale, scale);

    return size;
}

let size = resizeCanvas();
let center = size / 2;
// Adjust radius to leave room for labels
let radius = size * 0.35;

// State
let angleDeg = parseInt(slider.value, 10);
let targetAngle = angleDeg;
let isAnimatingWave = false;
let waveData = [];

// Format Pi fraction
function formatPiFraction(deg) {
    if (deg === 0) return "0";
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const num = deg;
    const den = 180;
    const divisor = gcd(num, den);
    const n = num / divisor;
    const d = den / divisor;

    if (n === 1 && d === 1) return "π";
    if (n === 1) return `1/${d}π`;
    if (d === 1) return `${n}π`;
    return `${n}/${d}π`;
}

function updateLabels() {
    angleLabel.innerHTML = `<span class="badge-deg">${Math.round(angleDeg)}°</span> / <span class="badge-rad">${formatPiFraction(Math.round(angleDeg))}</span>`;

    const calcAngle = document.getElementById('calc-angle');
    const calcSinOut = document.getElementById('calc-sin-out');
    const calcHeight = document.getElementById('calc-height');
    const calcAsinOut = document.getElementById('calc-asin-out');

    if (calcAngle && calcHeight) {
        // Calculate current Sine value
        let s = Math.sin(angleDeg * (Math.PI / 180));

        // Update displays if not actively typed in
        if (document.activeElement !== calcAngle) calcAngle.value = Math.round(angleDeg);
        calcSinOut.innerText = s.toFixed(2);

        if (document.activeElement !== calcHeight) calcHeight.value = s.toFixed(2);

        // Calculate arcsin of whatever is in the height input
        let hVal = parseFloat(calcHeight.value);
        if (!isNaN(hVal) && hVal >= -1 && hVal <= 1) {
            let as = Math.asin(hVal) * (180 / Math.PI);
            calcAsinOut.innerText = as.toFixed(2) + '°';
        }
    }
}

// Convert deg to rad
const toRad = (deg) => deg * (Math.PI / 180);

// Draw loop
function draw() {
    ctx.clearRect(0, 0, size, size);

    if (document.querySelector('.card[data-step="7"]').classList.contains('active')) {
        drawDifferenceQuotientExample();
        requestAnimationFrame(draw);
        return;
    }

    if (document.querySelector('.card[data-step="8"]').classList.contains('active')) {
        drawGeneralSineFunction();
        requestAnimationFrame(draw);
        return;
    }

    if (document.querySelector('.card[data-step="9"]').classList.contains('active')) {
        drawFamilies();
        requestAnimationFrame(draw);
        return;
    }

    // Animate towards target
    if (!isAnimatingWave) {
        angleDeg += (targetAngle - angleDeg) * 0.1;
        slider.value = Math.round(angleDeg);
    } else {
        angleDeg += 2; // Speed of auto animation
        slider.value = Math.round(angleDeg);
        if (angleDeg >= 720) {
            isAnimatingWave = false;
            angleDeg = 720;
            slider.value = 720;
            targetAngle = 720;
        }
    }

    updateLabels();

    // Set origin to center for circle
    // If animating wave, shift origin left
    let originX = center;
    let waveScale = radius * 0.8;

    if (isAnimatingWave ||
        document.querySelector('.card[data-step="5"]').classList.contains('active') ||
        document.querySelector('.card[data-step="6"]').classList.contains('active') ||
        document.querySelector('.card[data-step="7"]').classList.contains('active')) {
        // Shift left to make room for wave
        originX = size * 0.25;
        radius = size * 0.2; // smaller circle
    } else {
        originX = center;
        radius = size * 0.35;
    }

    const originY = center;

    // 1. Draw Axis
    ctx.beginPath();
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1.5;
    // X axis
    ctx.moveTo(0, originY);
    ctx.lineTo(size, originY);
    // Y axis
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, size);
    ctx.stroke();

    // 2. Draw Unit Circle
    ctx.beginPath();
    ctx.arc(originX, originY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = colors.circle;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Current angle rad
    const rad = toRad(angleDeg);

    // Calculate point on circle (remember Y is inverted on Canvas)
    const px = originX + Math.cos(rad) * radius;
    const py = originY - Math.sin(rad) * radius;

    // 3. Draw Triangle (Cos/Sin)
    // Kosinus (X-Ankathete)
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(px, originY);
    ctx.strokeStyle = colors.pink;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Sinus (Y-Gegenkathete)
    ctx.beginPath();
    ctx.moveTo(px, originY);
    ctx.lineTo(px, py);
    ctx.strokeStyle = colors.green;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hypotenuse (Radius/1)
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(px, py);
    ctx.strokeStyle = colors.blue;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw point
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, 2 * Math.PI);
    ctx.fillStyle = colors.blue;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Arc for angle
    ctx.beginPath();
    ctx.arc(originX, originY, radius * 0.2, 0, -rad, rad > 0);
    ctx.strokeStyle = colors.purple;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw OUTER Arc for Bogenlänge (proportional to angle)
    if (rad > 0.01) {
        ctx.beginPath();
        // Determine how many full revolutions to draw as background
        let radMod = rad % (2 * Math.PI);
        if (rad >= 2 * Math.PI) {
            ctx.arc(originX, originY, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = colors.orange;
            ctx.lineWidth = 4;
            ctx.stroke();
            // Start a new path for the remainder with a slightly offset radius or just overlap it.
            // A shadow effect makes it pop
            ctx.beginPath();
            ctx.arc(originX, originY, radius + 2, 0, -radMod, true);
        } else {
            ctx.arc(originX, originY, radius, 0, -radMod, true);
        }
        ctx.strokeStyle = colors.orange;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Label the arc midway
        if (radMod > 0.1) {
            let midRad = radMod / 2;
            let lx = originX + Math.cos(-midRad) * (radius + 20);
            let ly = originY + Math.sin(-midRad) * (radius + 20);
            ctx.fillStyle = colors.orange;
            ctx.font = 'bold 14px Outfit';
            ctx.fillText('b', lx, ly);
        }
    }

    // Draw Wave if requested or active
    if (isAnimatingWave ||
        document.querySelector('.card[data-step="5"]').classList.contains('active') ||
        document.querySelector('.card[data-step="6"]').classList.contains('active') ||
        document.querySelector('.card[data-step="7"]').classList.contains('active')) {
        // Collect wave data
        if (isAnimatingWave) {
            waveData.push({ a: rad, y: py });
        }

        // Draw the wave
        ctx.beginPath();
        ctx.strokeStyle = colors.green;
        ctx.lineWidth = 3;

        let startX = originX + radius + 20; // Start wave slightly right of circle
        let pointSpacing = (size - startX - 20) / (4 * Math.PI); // Map width to 2 periods

        // Draw connection line from circle point to wave
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(px, py);
        ctx.lineTo(startX + rad * pointSpacing, py);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw the actual sine curve
        ctx.beginPath();
        for (let a = 0; a <= rad; a += 0.05) {
            let wx = startX + a * pointSpacing;
            let wy = originY - Math.sin(a) * radius;
            if (a === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
        }
        ctx.strokeStyle = colors.green;
        ctx.stroke();

        // Draw point on wave
        let currentWx = startX + rad * pointSpacing;
        ctx.beginPath();
        ctx.arc(currentWx, py, 5, 0, 2 * Math.PI);
        ctx.fillStyle = colors.green;
        ctx.fill();
    }

    // Labels
    ctx.font = '14px Outfit';
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';

    // Label for 1
    ctx.fillText('x = 1', originX + radius + 15, originY + 15);
    ctx.fillText('y = 1', originX - 20, originY - radius - 10);
    ctx.fillText('-1', originX - radius - 15, originY + 15);
    ctx.fillText('-1', originX - 15, originY + radius + 20);

    requestAnimationFrame(draw);
}

// Event Listeners
slider.addEventListener('input', (e) => {
    targetAngle = parseInt(e.target.value, 10);
    isAnimatingWave = false;
});

animateBtn.addEventListener('click', () => {
    isAnimatingWave = true;
    angleDeg = 0;
    targetAngle = 720;
    waveData = [];
    cards.forEach(c => c.classList.remove('active'));
    document.querySelector('.card[data-step="5"]').classList.add('active');
});

cards.forEach(card => {
    card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        // Contextual changes based on card
        let step = card.getAttribute('data-step');
        if (step === '0') targetAngle = 45;
        if (step === '1') targetAngle = 60;
        if (step === '2') targetAngle = 90;
        if (step === '3') targetAngle = 90;
        if (step === '4') targetAngle = 30; // Calculator
        if (step === '5') targetAngle = 180;
        if (step === '6') targetAngle = 405; // >360 to show period
        if (step === '7') targetAngle = 90; // difference quotient
    });
});

window.addEventListener('resize', () => {
    size = resizeCanvas();
});

// Conversion Logic
const inputDeg = document.getElementById('input-deg');
const inputRad = document.getElementById('input-rad');

inputDeg.addEventListener('input', (e) => {
    let deg = parseFloat(e.target.value);
    if (!isNaN(deg)) {
        let rad = deg * (Math.PI / 180);
        inputRad.value = rad.toFixed(2);
        targetAngle = deg;
    }
});

inputRad.addEventListener('input', (e) => {
    let rad = parseFloat(e.target.value);
    if (!isNaN(rad)) {
        let deg = rad * (180 / Math.PI);
        inputDeg.value = Math.round(deg);
        targetAngle = Math.round(deg);
    }
});

// Calculator events
const calcAngle = document.getElementById('calc-angle');
const calcHeight = document.getElementById('calc-height');

if (calcAngle) calcAngle.addEventListener('input', (e) => {
    let a = parseFloat(e.target.value);
    if (!isNaN(a)) targetAngle = a;
});

if (calcHeight) calcHeight.addEventListener('input', (e) => {
    let h = parseFloat(e.target.value);
    if (!isNaN(h) && h >= -1 && h <= 1) {
        let a = Math.asin(h) * (180 / Math.PI);
        targetAngle = a >= 0 ? a : 360 + a;
    }
});

// Start loop
draw();

function evaluateFunction(funcStr, x) {
    try {
        let safeStr = funcStr.replace(/\^/g, '**');
        // Support common functions
        safeStr = safeStr.replace(/sin/g, 'Math.sin')
                         .replace(/cos/g, 'Math.cos')
                         .replace(/tan/g, 'Math.tan')
                         .replace(/sqrt/g, 'Math.sqrt');
        let f = new Function('x', 'return ' + safeStr);
        let val = f(x);
        return isNaN(val) ? 0 : val;
    } catch(e) {
        return 0;
    }
}

function drawDifferenceQuotientExample() {
    let funcInput = document.getElementById('dq-func');
    let x1Input = document.getElementById('dq-x1');
    let x2Input = document.getElementById('dq-x2');
    
    if(!funcInput || !x1Input || !x2Input) return;
    
    let funcStr = funcInput.value || "x**2 - 3*x";
    let dqX1 = parseFloat(x1Input.value);
    let dqX2 = parseFloat(x2Input.value);
    
    if(isNaN(dqX1)) dqX1 = 1;
    if(isNaN(dqX2)) dqX2 = 3;
    
    let y1 = evaluateFunction(funcStr, dqX1);
    let y2 = evaluateFunction(funcStr, dqX2);
    
    // Update HTML outputs
    document.getElementById('dq-y1').innerText = y1.toFixed(2);
    document.getElementById('dq-y2').innerText = y2.toFixed(2);
    document.getElementById('dq-dy').innerText = (y2 - y1).toFixed(2);
    document.getElementById('dq-dx').innerText = (dqX2 - dqX1).toFixed(2);
    
    let m = (dqX2 - dqX1) !== 0 ? (y2 - y1) / (dqX2 - dqX1) : 0;
    document.getElementById('dq-m').innerText = m.toFixed(2);
    
    // Canvas mapping logic
    let padding = 40;
    let drawW = size - 2 * padding;
    let drawH = size - 2 * padding;

    let minX = Math.min(dqX1, dqX2) - 2;
    let maxX = Math.max(dqX1, dqX2) + 2;

    let minY = Math.min(y1, y2);
    let maxY = Math.max(y1, y2);
    
    // Sample to find actual min/max Y
    let sampleStep = (maxX - minX) / 100;
    for(let x = minX; x <= maxX; x += sampleStep) {
        let y = evaluateFunction(funcStr, x);
        if(y < minY) minY = y;
        if(y > Math.max(maxY, -1000000) && y < 1000000) maxY = y; // limit infinities
    }
    
    // Pad
    let padY = Math.abs(maxY - minY) * 0.2;
    if (padY === 0) padY = 2; // default pad
    minY -= padY; maxY += padY;
    
    let rangeX = maxX - minX || 1;
    let rangeY = maxY - minY || 1;
    
    // Flip Y axis since JS Canvas is upside down
    function mapX(x) { return padding + ((x - minX) / rangeX) * drawW; }
    function mapY(y) { return size - padding - ((y - minY) / rangeY) * drawH; }

    // Draw Axes (clamped to area)
    ctx.beginPath();
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1.5;
    let zeroY = mapY(0);
    let zeroX = mapX(0);
    if(0 >= minY && 0 <= maxY) { ctx.moveTo(padding, zeroY); ctx.lineTo(size - padding, zeroY); ctx.stroke(); }
    if(0 >= minX && 0 <= maxX) { ctx.beginPath(); ctx.moveTo(zeroX, padding); ctx.lineTo(zeroX, size - padding); ctx.stroke(); }

    // Draw the curve
    ctx.beginPath();
    let started = false;
    for(let x = minX; x <= maxX; x += sampleStep) {
        let y = evaluateFunction(funcStr, x);
        if (!started) { ctx.moveTo(mapX(x), mapY(y)); started = true; }
        else ctx.lineTo(mapX(x), mapY(y));
    }
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Map Points
    let p1x = mapX(dqX1), p1y = mapY(y1);
    let p2x = mapX(dqX2), p2y = mapY(y2);

    // Secant line
    ctx.beginPath();
    // extend line beyond the two points visually
    let dx = p2x - p1x; let dy = p2y - p1y;
    ctx.moveTo(p1x - dx, p1y - dy); 
    ctx.lineTo(p2x + dx, p2y + dy);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Delta triangle (Steigungsdreieck)
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(p1x, p1y);
    // Draw horizontally then vertically
    ctx.lineTo(p2x, p1y); // dx
    ctx.lineTo(p2x, p2y); // dy
    ctx.strokeStyle = 'cyan';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Highlight points
    ctx.beginPath(); ctx.arc(p1x, p1y, 6, 0, Math.PI*2); ctx.fillStyle = colors.blue; ctx.fill();
    ctx.beginPath(); ctx.arc(p2x, p2y, 6, 0, Math.PI*2); ctx.fillStyle = colors.pink; ctx.fill();
    
    // Labels
    ctx.font = 'bold 12px Outfit';
    ctx.fillStyle = 'cyan';
    ctx.fillText('Δx', (p1x+p2x)/2, p1y + (p1y < p2y ? -8 : 16));
    ctx.fillText('Δy', p2x + (p1x < p2x ? 12 : -18), (p1y+p2y)/2);
}

function drawGeneralSineFunction() {
    let elA = document.getElementById('param-a');
    let elB = document.getElementById('param-b');
    let elC = document.getElementById('param-c');
    let elD = document.getElementById('param-d');
    if(!elA) return;
    
    let a = parseFloat(elA.value);
    let b = parseFloat(elB.value);
    let c = parseFloat(elC.value);
    let d = parseFloat(elD.value);
    
    document.getElementById('val-a').innerText = a.toFixed(1);
    document.getElementById('val-b').innerText = b.toFixed(1);
    document.getElementById('val-c').innerText = c.toFixed(2);
    document.getElementById('val-d').innerText = d.toFixed(1);

    // Update HTML Calculations for algebraic representation
    if (document.getElementById('val-max')) {
        let vMax = d + Math.abs(a);
        let vMin = d - Math.abs(a);
        let formatWrap = (n) => n < 0 ? "(" + n.toFixed(2) + ")" : n.toFixed(2);
        
        document.getElementById('val-max').innerText = vMax.toFixed(2);
        document.getElementById('val-min').innerText = vMin.toFixed(2);
        
        document.getElementById('calc-d-max').innerText = vMax.toFixed(2);
        document.getElementById('calc-d-min').innerText = formatWrap(vMin);
        document.getElementById('calc-d-res').innerText = ((vMax + vMin) / 2).toFixed(2);
        
        document.getElementById('calc-a-max').innerText = vMax.toFixed(2);
        document.getElementById('calc-a-min').innerText = formatWrap(vMin);
        document.getElementById('calc-a-res').innerText = ((vMax - vMin) / 2).toFixed(2);
    }

    let ox = size * 0.15; // padding left
    let oy = size * 0.5; // middle y axis
    let scaleY = size * 0.08; // pixels per unit y
    let scaleX = size * 0.05; // pixels per rad x
    
    // Draw Axes (x from -PI to 3PI, y from -5 to 5)
    ctx.beginPath();
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1.5;
    ctx.moveTo(ox, 20); ctx.lineTo(ox, size - 20); // Y axis
    ctx.moveTo(0, oy); ctx.lineTo(size, oy); // X axis
    ctx.stroke();

    // Axis labels Pi marks
    ctx.fillStyle = colors.text;
    ctx.font = '12px Outfit';
    ctx.fillText('π', ox + Math.PI*scaleX, oy + 15);
    ctx.fillText('2π', ox + 2*Math.PI*scaleX, oy + 15);
    ctx.fillText('3π', ox + 3*Math.PI*scaleX, oy + 15);

    // Base Sine Curve (faint grey/white)
    ctx.beginPath();
    for (let x = -2; x <= 5*Math.PI; x += 0.1) {
        let px = ox + x * scaleX;
        let py = oy - Math.sin(x) * scaleY;
        if(x === -2) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Transformed Curve
    ctx.beginPath();
    let started = false;
    for (let x = -2; x <= 5*Math.PI; x += 0.05) {
        let px = ox + x * scaleX;
        let y = a * Math.sin(b * (x - c)) + d;
        let py = oy - y * scaleY;
        if(!started && py < size+100 && py > -100) { ctx.moveTo(px, py); started = true; }
        else if (started) ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'white'; 
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Visual Guides
    let vMax = d + Math.abs(a);
    let vMin = d - Math.abs(a);

    // Max & Min
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([3, 7]);
    ctx.moveTo(0, oy - vMax * scaleY); ctx.lineTo(size, oy - vMax * scaleY);
    ctx.moveTo(0, oy - vMin * scaleY); ctx.lineTo(size, oy - vMin * scaleY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('Max', size - 40, oy - vMax * scaleY - 5);
    ctx.fillText('Min', size - 40, oy - vMin * scaleY + 12);

    // d: mittellinie
    ctx.beginPath();
    ctx.moveTo(0, oy - d * scaleY);
    ctx.lineTo(size, oy - d * scaleY);
    ctx.strokeStyle = colors.orange;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = colors.orange;
    ctx.fillText('d', 15, oy - d * scaleY - 5);

    // a: amplitude helper (arrow from midline up)
    // draw at x = c + (PI/2)/b which is a peak
    let peakX = c + (Math.PI/2)/Math.abs(b);
    let ppx = ox + peakX * scaleX;
    let midY = oy - d * scaleY;
    let peakY = oy - (Math.abs(a) + d) * scaleY; // draw to peak regardless of sign for simplicity visually or follow sign
    if (a < 0) peakY = oy - (-Math.abs(a) + d) * scaleY;

    if (ppx > ox && ppx < size) {
        ctx.beginPath();
        ctx.moveTo(ppx, midY);
        ctx.lineTo(ppx, peakY);
        ctx.strokeStyle = colors.pink;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = colors.pink;
        ctx.fillRect(ppx - 3, peakY - Math.sign(a)*3, 6, 6); // simple arrow head
        ctx.font = 'bold 12px Outfit';
        ctx.fillText('a', ppx + 10, (midY + peakY)/2 + 5);
    }
    
    // c: phase shift (distance from 0 to c on x axis)
    if (Math.abs(c) > 0.05) {
        ctx.beginPath();
        ctx.moveTo(ox, oy); // origin
        ctx.lineTo(ox + c * scaleX, oy);
        ctx.strokeStyle = colors.green;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.fillStyle = colors.green;
        ctx.fillText('c', ox + c * scaleX / 2, oy - 8);
    }

    // b: mark exactly one period from c to c + 2PI/b
    let startPx = ox + c * scaleX;
    let period = (2*Math.PI) / Math.abs(b);
    let endPx = ox + (c + period) * scaleX;
    if (startPx > -20 && endPx < size + 50) {
        let perY = oy - d * scaleY + 30; // draw below the mid curve
        if (d < -1) perY = oy + 30;
        ctx.beginPath();
        ctx.moveTo(startPx, perY);
        ctx.lineTo(endPx, perY);
        ctx.moveTo(startPx, perY - 5); ctx.lineTo(startPx, perY + 5);
        ctx.moveTo(endPx, perY - 5); ctx.lineTo(endPx, perY + 5);
        ctx.strokeStyle = colors.blue;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = colors.blue;
        ctx.fillText('p = 2π/b', (startPx + endPx)/2, perY + 15);
    }
}

function drawFamilies() {
    let typeSel = document.getElementById('func-family-select');
    if(!typeSel) return;
    let type = typeSel.value;
    
    // Toggle active pane display
    document.querySelectorAll('.config-pane').forEach(el => el.style.display = 'none');
    document.getElementById('cfg-' + type).style.display = 'block';

    let f = (x) => 0; 
    let drawGuides = () => {};

    let ox = size / 2;
    let oy = size / 2;
    let scaleX = size * 0.08; 
    let scaleY = size * 0.08;
    
    if (type === 'linear') {
        let m = parseFloat(document.getElementById('param-lin-m').value);
        let b = parseFloat(document.getElementById('param-lin-b').value);
        document.getElementById('val-lin-m').innerText = m.toFixed(1);
        document.getElementById('val-lin-b').innerText = b.toFixed(1);
        f = (x) => m * x + b;
        drawGuides = () => {
            ctx.beginPath(); ctx.arc(ox, oy - b * scaleY, 6, 0, Math.PI*2); ctx.fillStyle = colors.orange; ctx.fill();
            ctx.fillStyle = 'white'; ctx.fillText('b (Start)', ox + 15, oy - b * scaleY - 5);
        };
    } else if (type === 'quad') {
        let a = parseFloat(document.getElementById('param-qd-a').value);
        let dVal = parseFloat(document.getElementById('param-qd-d').value);
        let e = parseFloat(document.getElementById('param-qd-e').value);
        document.getElementById('val-qd-a').innerText = a.toFixed(1);
        document.getElementById('val-qd-d').innerText = dVal.toFixed(1);
        document.getElementById('val-qd-e').innerText = e.toFixed(1);
        f = (x) => a * Math.pow(x - dVal, 2) + e;
        drawGuides = () => {
            let vpx = ox + dVal * scaleX;
            let vpy = oy - e * scaleY;
            ctx.beginPath(); ctx.arc(vpx, vpy, 6, 0, Math.PI*2); ctx.fillStyle = colors.green; ctx.fill();
            ctx.fillStyle = 'white'; ctx.fillText('S(' + dVal.toFixed(1) + '|' + e.toFixed(1) + ')', vpx + 10, vpy - 10);
        };
    } else if (type === 'trig') {
        let a = parseFloat(document.getElementById('param-tr-a').value);
        let dVal = parseFloat(document.getElementById('param-tr-d').value);
        document.getElementById('val-tr-a').innerText = a.toFixed(1);
        document.getElementById('val-tr-d').innerText = dVal.toFixed(1);
        f = (x) => a * Math.sin(x) + dVal;
        drawGuides = () => {
            ctx.beginPath(); ctx.setLineDash([5,5]); ctx.moveTo(0, oy - dVal * scaleY); ctx.lineTo(size, oy - dVal * scaleY); ctx.strokeStyle = colors.orange; ctx.stroke(); ctx.setLineDash([]);
        };
    } else if (type === 'exp') {
        let a = parseFloat(document.getElementById('param-ex-a').value);
        let c = parseFloat(document.getElementById('param-ex-c').value);
        document.getElementById('val-ex-a').innerText = a.toFixed(1);
        document.getElementById('val-ex-c').innerText = c.toFixed(1);
        f = (x) => a * Math.pow(c, x);
        drawGuides = () => {
            ctx.beginPath(); ctx.arc(ox, oy - a * scaleY, 6, 0, Math.PI*2); ctx.fillStyle = colors.orange; ctx.fill();
            ctx.fillStyle = 'white'; ctx.fillText('a (Start)', ox + 15, oy - a * scaleY - 5);
        };
    }
    
    // Draw Grid
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for(let i = -10; i <= 10; i++) {
        ctx.moveTo(ox + i * scaleX, 0); ctx.lineTo(ox + i * scaleX, size);
        ctx.moveTo(0, oy - i * scaleY); ctx.lineTo(size, oy - i * scaleY);
    }
    ctx.stroke();

    // Axes
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = colors.axis;
    ctx.moveTo(ox, 0); ctx.lineTo(ox, size); // Y axis
    ctx.moveTo(0, oy); ctx.lineTo(size, oy); // X axis
    ctx.stroke();

    // Draw Function Curve
    ctx.beginPath();
    let started = false;
    for(let x = -8; x <= 8; x += 0.05) {
        let y = f(x);
        let px = ox + x * scaleX;
        let py = oy - y * scaleY;
        if(py < size+200 && py > -200) {
            if(!started) { ctx.moveTo(px, py); started = true; }
            else ctx.lineTo(px, py);
        } else {
            started = false; // separate disjointed bounds (exp shoots off)
        }
    }
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Param Guides
    drawGuides();
}
