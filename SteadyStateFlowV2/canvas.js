// Select the canvas element
import ReusableMethods from '../reusableMethods.js';

const canvas = document.getElementById('centeredCanvas');
const ctx = canvas.getContext('2d');
const globalFunctions = new ReusableMethods(ctx);

const drainDiameterDropdown = document.getElementById('drainDiameter');
const liquidHeightDropdown = document.getElementById('liquidHeight');

const startPoint = {x: canvas.width / 2 - 125, y: 75};
const containerHeight = 235;
const containerWidth = 135;
const fixedWaterHeight = 205;
let waterHeight = (parseFloat(liquidHeightDropdown.value) / 80) * fixedWaterHeight;
let diameter = parseFloat(drainDiameterDropdown.value) * 20;
const currentPoint = {x: startPoint.x + 63, y: startPoint.y + containerHeight - 28};
const point1 = {x: currentPoint.x + 65, y: currentPoint.y + 14};
let point2 = {x: point1.x + diameter, y: currentPoint.y + 14};
const tapDistance = 40;
const tapKnobHeight = 7.5
const waterStartPoint = {x: startPoint.x + 63, y: startPoint.y + 14 + containerHeight};

function setupCanvasSpace() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.resetTransform()
    ctx.textAlign = 'center'
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2
    ctx.fillStyle = 'rgb(35, 137, 218)';
}

function addEventListener() {
    drainDiameterDropdown.addEventListener('change', () => {
        diameter = parseFloat(drainDiameterDropdown.value) * 20;
        drawCanvas();
    });
    
    liquidHeightDropdown.addEventListener('change', () => {
        waterHeight = (parseFloat(liquidHeightDropdown.value) / 80) * fixedWaterHeight;
        drawCanvas();
    });
}
addEventListener();

function drawTank() {
    const radius = (Math.pow(14,2) + Math.pow(135/2, 2))/28
    const center = {x: 250+135/2, y: 282 - radius + 14}
    ctx.beginPath();
    ctx.moveTo(startPoint.x + 63, startPoint.y + 6 + 8);
    ctx.lineTo(startPoint.x + 63, startPoint.y + containerHeight - 28);
    drawArc(center.x, center.y, startPoint.x + 63, startPoint.y + containerHeight - 28, currentPoint.x + 65, currentPoint.y + 14, radius);
    // ctx.quadraticCurveTo(currentPoint.x + 30, currentPoint.y + 11, currentPoint.x + 65, currentPoint.y + 14);
    ctx.lineTo(point1.x, point1.y + 28);
    ctx.lineTo(point1.x + 75, point1.y + 28);
    ctx.moveTo(point1.x + 75, point1.y + 28 - diameter);
    ctx.lineTo(point1.x + diameter, point1.y + 28 - diameter);
    ctx.lineTo(point1.x + diameter, currentPoint.y + 14);
    drawArc(center.x, center.y, point1.x + diameter, currentPoint.y + 14, startPoint.x + 63 + containerWidth, point2.y - 14, radius);
    ctx.lineTo(startPoint.x + 63 + containerWidth, startPoint.y + 14);
    ctx.moveTo(startPoint.x + 63, startPoint.y + 6 + 8);
    ctx.closePath();
    ctx.stroke();
}

function drawArc(centerX, centerY, startX, startY, endX, endY, radius, direction = true) {
    let startAngle = Math.atan2(startY - centerY, startX - centerX);
    let endAngle = Math.atan2(endY - centerY, endX - centerX);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, direction);
}

function findX(centerX, centerY, radius, y) {
    // Calculate the difference between the given y and centerY
    var diff = y - centerY;
    
    // Calculate the value inside the square root
    var xSquare = radius * radius - diff * diff;
    
    // Check if the point lies on the circle (xSquare must be non-negative)
    if (xSquare < 0) {
        console.error("No solution: The point is outside the circle");
        return null;  // No solution if xSquare is negative
    }
    
    // Calculate the corresponding x values (positive and negative roots)
    let x1 = centerX + Math.sqrt(xSquare);
    let x2 = centerX - Math.sqrt(xSquare);
    
    // Return both possible x values (because a circle has two points for a given y)
    return [x1, x2];
}

function fillTank() {
    const newStartPoint = {x: startPoint.x + 63 + containerWidth, y: startPoint.y + 14 + containerHeight}
    const radius = (Math.pow(14,2) + Math.pow(135/2, 2))/28
    const center = {x: 250+135/2, y: 282 - radius + 14}
    if (waterHeight <= diameter) {
        ctx.beginPath();
        ctx.moveTo(newStartPoint.x , newStartPoint.y)
        ctx.lineTo(newStartPoint.x - containerWidth + 65, newStartPoint.y);
        ctx.lineTo(newStartPoint.x - containerWidth + 65, newStartPoint.y - waterHeight);
        ctx.lineTo(newStartPoint.x, newStartPoint.y - waterHeight);
        ctx.lineTo(newStartPoint.x, newStartPoint.y);
        ctx.closePath();
        ctx.fill();
    } else if (waterHeight <= 28) {
        ctx.beginPath();
        ctx.moveTo(newStartPoint.x , newStartPoint.y)
        ctx.lineTo(newStartPoint.x - containerWidth + 65, newStartPoint.y);
        ctx.lineTo(newStartPoint.x - containerWidth + 65, newStartPoint.y - waterHeight);
        ctx.lineTo(newStartPoint.x - containerWidth + 65 + diameter, newStartPoint.y - waterHeight);
        ctx.lineTo(newStartPoint.x - containerWidth + 65 + diameter, newStartPoint.y - diameter);
        ctx.lineTo(newStartPoint.x, newStartPoint.y - diameter);
        ctx.lineTo(newStartPoint.x, newStartPoint.y);
        ctx.closePath();
        ctx.fill();
    } else if (waterHeight <= 42) {
        let x = findX(center.x, center.y, radius, newStartPoint.y - waterHeight)
        if (x[0] > 340) {
            ctx.beginPath();
            ctx.moveTo(newStartPoint.x , newStartPoint.y)
            ctx.lineTo(newStartPoint.x - containerWidth + 65, newStartPoint.y);
            ctx.lineTo(newStartPoint.x - containerWidth + 65, newStartPoint.y - 28);
            drawArc(center.x, center.y, newStartPoint.x - containerWidth + 65, newStartPoint.y - 28, x[1], newStartPoint.y - waterHeight, radius, false)
            ctx.lineTo(x[0], newStartPoint.y - waterHeight)
            drawArc(center.x, center.y, x[0], newStartPoint.y - waterHeight, newStartPoint.x - containerWidth + 65 + diameter, newStartPoint.y - 28, radius, false)
            // ctx.lineTo(newStartPoint.x - containerWidth + 65 + diameter, newStartPoint.y - 28);
            ctx.lineTo(newStartPoint.x - containerWidth + 65 + diameter, newStartPoint.y - diameter);
            ctx.lineTo(newStartPoint.x, newStartPoint.y - diameter);
            ctx.lineTo(newStartPoint.x, newStartPoint.y);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(newStartPoint.x , newStartPoint.y)
            ctx.lineTo(newStartPoint.x - containerWidth + 65, newStartPoint.y);
            ctx.lineTo(newStartPoint.x - containerWidth + 65, newStartPoint.y - waterHeight);
            ctx.lineTo(newStartPoint.x - containerWidth + 65 + diameter, newStartPoint.y - waterHeight);
            ctx.lineTo(newStartPoint.x - containerWidth + 65 + diameter, newStartPoint.y - diameter);
            ctx.lineTo(newStartPoint.x, newStartPoint.y - diameter);
            ctx.lineTo(newStartPoint.x, newStartPoint.y);
            ctx.closePath();
            ctx.fill();
        }
    } else {
        ctx.beginPath();
        const startError = containerHeight - 28 - waterHeight;
        const currentPoint = {x: startPoint.x + 63, y: startPoint.y + startError + waterHeight};
        const point1 = {x: currentPoint.x + 65, y: currentPoint.y + 14};
        const point2 = {x: point1.x + diameter, y: currentPoint.y + 14};
        ctx.moveTo(startPoint.x + 63, startPoint.y + 6 + 8 + startError);
        ctx.lineTo(startPoint.x + 63, startPoint.y  + startError + waterHeight);
        drawArc(center.x, center.y, startPoint.x + 63, startPoint.y + containerHeight - 28, currentPoint.x + 65, currentPoint.y + 14, radius);
        ctx.lineTo(point1.x, point1.y + 28);
        ctx.lineTo(point1.x + 75, point1.y + 28);
        ctx.lineTo(point1.x + 75, point1.y + 28 - diameter);
        ctx.lineTo(point1.x + diameter, point1.y + 28 - diameter);
        ctx.lineTo(point1.x + diameter, currentPoint.y + 14);
        drawArc(center.x, center.y, point1.x + diameter, currentPoint.y + 14, startPoint.x + 63 + containerWidth, point2.y - 14, radius);
        ctx.lineTo(startPoint.x + 63 + containerWidth, startPoint.y + 14 + containerHeight - waterHeight);
        ctx.lineTo(startPoint.x + 63, startPoint.y + 6 + 8 + containerHeight - waterHeight);
        ctx.closePath();
        ctx.fill();
    }
}

function drawTap() {
    ctx.beginPath();
    ctx.moveTo(point1.x + tapDistance, point1.y + 28 - diameter);
    ctx.lineTo(point1.x + tapDistance, point1.y + 28);
    ctx.lineTo(point1.x + tapDistance + 20, point1.y + 28);
    ctx.closePath();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(point1.x + tapDistance + 20, point1.y + 28);
    ctx.lineTo(point1.x + tapDistance + 20, point1.y + 28 - diameter);
    ctx.lineTo(point1.x + tapDistance, point1.y + 28 - diameter);
    ctx.moveTo(point1.x + tapDistance, point1.y + 28);
    ctx.lineTo(point1.x + tapDistance + 20, point1.y + 28 - diameter);
    ctx.closePath();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(point1.x + tapDistance + 10, point1.y + 28 - diameter);
    ctx.lineTo(point1.x + tapDistance + 10, point1.y + 28 - diameter - tapKnobHeight);
    ctx.lineTo(point1.x + tapDistance + 5, point1.y + 28 - diameter - tapKnobHeight);
    ctx.moveTo(point1.x + tapDistance + 10, point1.y + 28 - diameter);
    ctx.moveTo(point1.x + tapDistance + 15, point1.y + 28 - diameter - tapKnobHeight);
    ctx.lineTo(point1.x + tapDistance + 5, point1.y + 28 - diameter - tapKnobHeight);
    ctx.closePath();
    ctx.stroke();
}

function drawArrows() {
    ctx.fillStyle = 'black'; // Set text color
    globalFunctions.drawTextWithSubscript(point1.x + tapDistance + 10, point1.y + 15 + 28, 'c', '0');
    ctx.fillStyle = 'rgb(35, 137, 218)';
    
    globalFunctions.drawDashedLine(startPoint.x + 63 + containerWidth, startPoint.y + containerHeight + 14, startPoint.x + containerWidth + 200, startPoint.y + containerHeight + 14);
    globalFunctions.drawDashedLine(startPoint.x + 63 + containerWidth, startPoint.y + 14 + containerHeight - waterHeight, startPoint.x + containerWidth + 200, startPoint.y + 14 + containerHeight - waterHeight);
    
    globalFunctions.drawDoubleArrowLine(startPoint.x + containerWidth + 200, startPoint.y + 14 + containerHeight - waterHeight, startPoint.x + containerWidth + 200, startPoint.y + containerHeight + 14);
    globalFunctions.drawText(startPoint.x + containerWidth + 215, startPoint.y + containerHeight + 14 - waterHeight + (waterHeight - 28) / 2, 'h');
    
    globalFunctions.drawDashedLine(point1.x + 75, point1.y + 28, point1.x + 105, point1.y + 28)
    globalFunctions.drawDashedLine(point1.x + 75, point1.y - diameter + 28, point1.x + 105, point1.y - diameter + 28)
    globalFunctions.drawDoubleArrowLineOutward(point1.x + 105, point1.y + 28, point1.x + 105, point1.y - diameter + 28, 'd');
    
    globalFunctions.drawDoubleArrowLine(startPoint.x + 63, startPoint.y - 20, startPoint.x + 63 + containerWidth, startPoint.y - 20);
    globalFunctions.drawDashedLine(startPoint.x + 63, startPoint.y - 20, startPoint.x + 63, startPoint.y + 14)
    globalFunctions.drawDashedLine(startPoint.x + 63 + containerWidth, startPoint.y - 20, startPoint.x + 63 + containerWidth, startPoint.y + 14)
    globalFunctions.drawText(startPoint.x + 63 + containerWidth / 2, startPoint.y - 26, 'D = 20 cm');
}

function drawCanvas() {
    setupCanvasSpace();
    drawTank();
    fillTank();
    drawTap();
    drawArrows();
    drawRuler();
}

drawCanvas();



let timerInterval;
let elapsedTime = 0;
let isRunning = false;
let isMeasuring = false;

const timerDisplay = document.getElementById('timer');
const startStopButton = document.getElementById('startStopButton');
const openValveButton = document.getElementById('openValveButton');
const openValveButtonIcon = document.getElementById('buttonIcon');
const measureLengthButton = document.getElementById('measureLengthButton');

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    const milliseconds = String(ms % 1000).padStart(3, '0');
    return `${minutes}:${seconds}.${milliseconds}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(elapsedTime);
}

function startTimer() {
    const startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime;
        updateTimerDisplay();
        calculateHeightWithTime();
    }, 1);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function enableButton(button, enabled) {
    button.disabled = !enabled;
}

function buttonListeners() {
    
    openValveButton.addEventListener('click', () => {
        enableButton(startStopButton, true);
        if (isRunning) {
            stopTimer();
            startStopButton.textContent = 'Start Timer';
            startStopButton.className = 'btn btn-success';
            openValveButton.textContent = 'open valve';
            openValveButton.className = 'btn btn-success';
            openValveButtonIcon.className = 'fas fa-play';
            enableButton(measureLengthButton, true);
        } else {
            startTimer();
            startStopButton.textContent = 'Stop Timer';
            startStopButton.className = 'btn btn-danger';
            openValveButton.textContent = 'close valve';
            openValveButton.className = 'btn btn-danger';
            openValveButtonIcon.className = 'fas fa-pause';
            enableButton(measureLengthButton, false);
        }
        isRunning = !isRunning;
    });
    
    startStopButton.addEventListener('click', () => {
        if (isRunning) {
            stopTimer();
            startStopButton.textContent = 'Start Timer';
            startStopButton.className = 'btn btn-success';
            openValveButton.textContent = 'open valve';
            openValveButton.className = 'btn btn-success';
            openValveButtonIcon.className = 'fas fa-play';
            enableButton(measureLengthButton, true);
        } else {
            startTimer();
            startStopButton.textContent = 'Stop Timer';
            startStopButton.className = 'btn btn-danger';
            openValveButton.textContent = 'close valve';
            openValveButton.className = 'btn btn-danger';
            openValveButtonIcon.className = 'fas fa-pause';
            enableButton(measureLengthButton, false);
        }
        isRunning = !isRunning;
    });
    
    measureLengthButton.addEventListener('click', () => {
        isMeasuring = !isMeasuring;
        if (isMeasuring) {
            drawRuler();
        }
    });
    
    const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener('click', () => {
        reset();
    });
}

function reset() {
    stopTimer();
    elapsedTime = 0;
    updateTimerDisplay();
    isRunning = false;
    startStopButton.textContent = 'Start Timer';
    startStopButton.className = 'btn btn-success';
    openValveButton.textContent = 'open valve';
    openValveButton.className = 'btn btn-success';
    openValveButtonIcon.className = 'fas fa-play';
    enableButton(measureLengthButton, true);
    waterHeight = (parseFloat(liquidHeightDropdown.value) / 80) * fixedWaterHeight;
    drawCanvas();
}

function calculateHeightWithTime() {
    const g = 981;
    const time = elapsedTime / 1000;
    const numerator = Math.sqrt(g / 2) * time;
    const denominator = Math.sqrt(Math.pow(20 * 20/diameter, 4) + 209);
    const sqrtHeight = Math.sqrt(parseFloat(liquidHeightDropdown.value)) - (numerator / denominator)
    let heightCalculation = Math.pow(sqrtHeight, 2);
    waterHeight = ((fixedWaterHeight / 80) * parseFloat(liquidHeightDropdown.value)) * (heightCalculation / parseFloat(liquidHeightDropdown.value));  
    if (sqrtHeight <= 0) {
        waterHeight = 0;
        stopTimer();
    }    
    drawCanvas();
}

function drawRuler() {
    const maxRulerSize = 235;
    ctx.fillStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startPoint.x + 20, startPoint.y + 14);
    ctx.lineTo(startPoint.x + 20 + 35, startPoint.y + 14);
    ctx.lineTo(startPoint.x + 20 + 35, startPoint.y + 14 + containerHeight);
    ctx.lineTo(startPoint.x + 20, startPoint.y + 14 + containerHeight);
    ctx.lineTo(startPoint.x + 20, startPoint.y + 14);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    
    // Draw the ruler ticks and labels
    for (let i = 0; i <= 90; i += 1) {
        const x = startPoint.x + 20 + 35;
        const y = startPoint.y + 14 + containerHeight - (i / 80) * (fixedWaterHeight);
        const tickLength = i % 5 == 0 ? 15 : 10; // Longer ticks for multiples of 50
        ctx.moveTo(x, y);
        ctx.lineTo(x - tickLength, y);
        ctx.stroke();
        if (i % 10 === 0 && i !== 90) {
            ctx.font = '12px Arial';
            ctx.fillText(i.toString(), x - tickLength - 10, y);
            globalFunctions.drawText(ctx, x - tickLength - 10, y, i.toString()); // Pass i as the text
        }
    }
}

buttonListeners();
updateTimerDisplay();