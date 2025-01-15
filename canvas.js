// Select the canvas element

const liquidHeightSlider = document.getElementById('liquidHeight');
const drainDiameterSlider = document.getElementById('drainDiameter');
const liquidDensitySlider = document.getElementById('liquidDensity');
const dischargeCoefficientSlider = document.getElementById('dischargeCoefficient');

const liquidHeightValue = document.getElementById('liquidHeightValue');
const drainDiameterValue = document.getElementById('drainDiameterValue');
const liquidDensityValue = document.getElementById('liquidDensityValue');
const dischargeCoefficientValue = document.getElementById('dischargeCoefficientValue');
const canvas = document.getElementById('centeredCanvas');
const ctx = canvas.getContext('2d');

liquidHeightSlider.oninput = function() {
    liquidHeightValue.textContent = (liquidHeightSlider.value);
    drawCanvas();
    updateGraph();
};
drainDiameterSlider.oninput = function() {
    drainDiameterValue.textContent = (drainDiameterSlider.value);
    drawCanvas();
    updateGraph();
};
liquidDensitySlider.oninput = function() {
    liquidDensityValue.textContent = (liquidDensitySlider.value);
    drawCanvas();
    updateGraph();
};
dischargeCoefficientSlider.oninput = function() {
    dischargeCoefficientValue.textContent = (dischargeCoefficientSlider.value);
    drawCanvas();
    updateGraph();
};


function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgb(35, 137, 218)';
    ctx.lineWidth = 2;
    
    const startPoint = {x: 20, y: 75};
    
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(startPoint.x + 90, startPoint.y);
    ctx.lineTo(startPoint.x + 90, startPoint.y + 20);
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y + 8);
    ctx.lineTo(startPoint.x + 80, startPoint.y + 8);
    ctx.lineTo(startPoint.x + 80, startPoint.y + 20);
    ctx.moveTo(startPoint.x, startPoint.y + 8);
    ctx.closePath();
    ctx.stroke();

    const containerHeight = 235;
    const containerWidth = 135;

    ctx.beginPath();
    ctx.moveTo(startPoint.x + 63, startPoint.y + 6 + 8);
    ctx.lineTo(startPoint.x + 63, startPoint.y + containerHeight);
    ctx.closePath();
    ctx.stroke();

    const currentPoint = {x: startPoint.x + 63, y: startPoint.y + containerHeight};
    ctx.beginPath();
    ctx.moveTo(currentPoint.x, currentPoint.y)
    ctx.quadraticCurveTo(currentPoint.x + 30, currentPoint.y + 11, currentPoint.x + 65, currentPoint.y + 14);
    
    const diameter = (parseFloat(drainDiameterSlider.value) / 7) * 20;
    const point1 = {x: currentPoint.x + 65, y: currentPoint.y + 14};
    ctx.lineTo(point1.x, point1.y + 28);
    ctx.lineTo(point1.x + 75, point1.y + 28);
    ctx.moveTo(point1.x + 75, point1.y + 28 - diameter);
    ctx.lineTo(point1.x + diameter, point1.y + 28 - diameter);
    ctx.lineTo(point1.x + diameter, currentPoint.y + 14);
    ctx.moveTo(point1.x + diameter, point1.y + 28 - diameter);
    ctx.closePath();
    ctx.stroke();

    const point2 = {x: point1.x + diameter, y: currentPoint.y + 14};
    ctx.beginPath();
    ctx.moveTo(point2.x, point2.y)
    ctx.quadraticCurveTo(point2.x + 30, point2.y - 3, startPoint.x + 63 + containerWidth, point2.y - 14);
    ctx.lineTo(startPoint.x + 63 + containerWidth, startPoint.y + 14);
    ctx.moveTo(point2.x, point2.y)
    ctx.closePath();
    ctx.stroke();

    
    ctx.beginPath();
    ctx.lineTo(startPoint.x, startPoint.y);
    ctx.lineTo(startPoint.x + 90, startPoint.y);
    ctx.lineTo(startPoint.x + 90, startPoint.y + containerHeight);
    ctx.lineTo(startPoint.x + 80, startPoint.y + containerHeight);
    ctx.lineTo(startPoint.x + 80, startPoint.y + 8);
    ctx.lineTo(startPoint.x, startPoint.y + 8);
    ctx.lineTo(startPoint.x, startPoint.y);
    ctx.closePath();
    ctx.fill();

    const centerX = (startPoint.x + 80 + startPoint.x + 90) / 2;
    const centerY = (startPoint.y + 20 + startPoint.y + 20) / 2;
    const radiusX = Math.abs(startPoint.x + 90 - startPoint.x - 80) / 2;
    const radiusY = 0;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();

    const fillPoint1 = {x: currentPoint.x + 65, y: currentPoint.y + 14};
    ctx.beginPath();
    ctx.moveTo(fillPoint1.x, fillPoint1.y); 
    ctx.lineTo(fillPoint1.x, fillPoint1.y + 28);
    ctx.lineTo(fillPoint1.x + 75, fillPoint1.y + 28);
    ctx.lineTo(fillPoint1.x + 75, fillPoint1.y + 28 - diameter);
    ctx.lineTo(fillPoint1.x + diameter, fillPoint1.y + 28 - diameter);
    ctx.lineTo(fillPoint1.x + diameter, fillPoint1.y);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(currentPoint.x, currentPoint.y);
    ctx.quadraticCurveTo(currentPoint.x + 30, currentPoint.y + 11, currentPoint.x + 65, currentPoint.y + 14);
    const fillpoint2 = {x: point1.x + diameter, y: currentPoint.y + 14};
    ctx.lineTo(fillpoint2.x, fillpoint2.y);
    ctx.lineTo(point2.x, point2.y)
    ctx.quadraticCurveTo(point2.x + 30, point2.y - 3, startPoint.x + 63 + containerWidth, point2.y - 14);
    ctx.closePath();
    ctx.fill();

    const tapDistance = 40;
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

    const tapKnobHeight = 7.5
    ctx.beginPath();
    ctx.moveTo(point1.x + tapDistance + 10, point1.y + 28 - diameter);
    ctx.lineTo(point1.x + tapDistance + 10, point1.y + 28 - diameter - tapKnobHeight);
    ctx.lineTo(point1.x + tapDistance + 5, point1.y + 28 - diameter - tapKnobHeight);
    ctx.moveTo(point1.x + tapDistance + 10, point1.y + 28 - diameter);
    ctx.moveTo(point1.x + tapDistance + 15, point1.y + 28 - diameter - tapKnobHeight);
    ctx.lineTo(point1.x + tapDistance + 5, point1.y + 28 - diameter - tapKnobHeight);
    ctx.closePath();
    ctx.stroke();

    ctx.font = '16px Arial';
    ctx.fillStyle = 'black'; // Set text color
    drawText(point1.x + tapDistance + 10, point1.y + 28 + 15, 'c₀')
    ctx.fillStyle = 'rgb(35, 137, 218)';

    const waterHeight = (parseFloat(liquidHeightSlider.value) / 0.9) * 205;
    const waterStartPoint = {x: startPoint.x + 63, y: startPoint.y + 14 + 235};
    ctx.beginPath();
    ctx.lineTo(waterStartPoint.x + containerWidth, startPoint.y + 235);
    ctx.lineTo(waterStartPoint.x + containerWidth, startPoint.y + 235 - waterHeight);
    ctx.lineTo(waterStartPoint.x, startPoint.y + 235 - waterHeight);
    ctx.lineTo(waterStartPoint.x, startPoint.y + 235);
    ctx.closePath();
    ctx.fill();

    drawDashedLine(startPoint.x + 63 + 65, startPoint.y + 235 + 28 + 14, startPoint.x + 10, startPoint.y + 235 + 28 + 14);
    drawDashedLine(startPoint.x + 63, startPoint.y + 235 - waterHeight, startPoint.x + 10, startPoint.y + 235 - waterHeight);
  
    drawDoubleArrowLine(startPoint.x + 5, startPoint.y + 235 - waterHeight, startPoint.x + 5, startPoint.y + 235 + 28 + 14);
    drawText(startPoint.x + 15, startPoint.y + 235 + 28 + 14 - waterHeight, 'h');

    drawDashedLine(point1.x + 75, point1.y + 28, point1.x + 105, point1.y + 28)
    drawDashedLine(point1.x + 75, point1.y + 28 - diameter, point1.x + 105, point1.y + 28 - diameter)
    drawDoubleArrowLineOutward(point1.x + 105, point1.y + 28, point1.x + 105, point1.y + 28 - diameter, 'd');


}


function drawDoubleArrowLine(startX, startY, endX, endY, arrowSize = 10) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.fillStyle = 'black'
    ctx.stroke();

    const angle = Math.atan2(endY - startY, endX - startX);

    drawArrowhead(startX, startY, angle + Math.PI, arrowSize);

    drawArrowhead(endX, endY, angle, arrowSize);
}

function drawArrowhead(x, y, angle, size) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size * Math.cos(angle - Math.PI / 6), y - size * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - size * Math.cos(angle + Math.PI / 6), y - size * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

function drawText(x, y, text) {
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(text, x, y);
}

function drawDashedLine(startX, startY, endX, endY, dashPattern = [5, 5]) {
    ctx.setLineDash(dashPattern);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.setLineDash([]);
}


function drawDoubleArrowLineOutward(x1, y1, x2, y2, label = '', arrowSize = 10) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1, y1 + 20);
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2, y2 - 20);
    ctx.stroke();

    drawArrowhead(x2, y2, Math.PI / 2, arrowSize);

    drawArrowhead(x1, y1, -Math.PI / 2, arrowSize);

    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    const labelY = (y1 + y2) / 2; 
    ctx.fillText(label, x1 + 20, labelY);
}

drawCanvas()
const g = 9.81;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const graphStartX = 350;
const graphWidth = 254;
const graphMargin = (canvasHeight - graphWidth) / 2

function updateGraph() {
    const hMax = parseFloat(liquidHeightSlider.max);
    const h = parseFloat(liquidHeightSlider.value);
    const d = parseFloat(drainDiameterSlider.value) / 100;
    const c0 = parseFloat(dischargeCoefficientSlider.value);
    const density = parseFloat(liquidDensitySlider.value);

    drawAxes(hMax);

    const points = [];
    for (let i = 0; i <= 1; i += 0.01) {
        const Q = calculateFlowRate(i, d, c0);
        points.push({ x: i, y: Q });
    }
    drawGraph(points);

    const currentQ = calculateFlowRate(h, d, c0);
    drawCurrentPoint(h, currentQ);
    drawText(graphStartX + (canvasWidth - graphStartX)/2, (canvasHeight - graphWidth - 60)/2, 'volumetric flow rate = ' + calculateFlowRate(h, d, c0).toFixed(2) + ' L/s');
    drawText(graphStartX + (canvasWidth - graphStartX)/2, (canvasHeight - graphWidth - 15)/2, 'mass flow rate = ' + (calculateFlowRate(h, d, c0) * density).toFixed(2) + ' kg/s');
}

function calculateFlowRate(h, d, c0) {
    return c0 * Math.PI * Math.pow(d, 2) / 4 * Math.sqrt(2 * g * h) * 1000; // Q = c₀π(d²/4)√(2gh)
}

function drawAxes(hMax) {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(graphStartX, canvasHeight - graphMargin);
    ctx.lineTo(graphStartX + graphWidth, canvasHeight - graphMargin);
    ctx.lineTo(graphStartX + graphWidth, canvasHeight - graphMargin - graphWidth);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(graphStartX, canvasHeight - graphMargin);
    ctx.lineTo(graphStartX, canvasHeight - graphMargin - graphWidth);
    ctx.lineTo(graphStartX + graphWidth, canvasHeight - graphMargin - graphWidth);
    ctx.stroke();

    // Labels and ticks
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    // X-axis labels and ticks
    for (let i = 0; i <= 1; i += 0.2) {
        const x = graphStartX + (i) * graphWidth;
        ctx.beginPath();
        ctx.moveTo(x, canvasHeight - graphMargin);
        ctx.lineTo(x, canvasHeight - graphMargin + 5);
        ctx.stroke();
        ctx.fillText(i.toFixed(1), x, canvasHeight - graphMargin + 20);
    }

    // Y-axis labels and ticks
    ctx.textAlign = 'right';
    for (let i = 0; i <= 20; i += 5) {
        const y = canvasHeight - graphMargin - (i / 20) * graphWidth;
        ctx.beginPath();
        ctx.moveTo(graphStartX, y);
        ctx.lineTo(graphStartX - 5, y);
        ctx.stroke();
        ctx.fillText(i.toFixed(0), graphStartX - 10, y + 4);
    }

    // Axis titles
    ctx.textAlign = 'center';
    ctx.fillText("Liquid Height (m)", graphStartX + graphWidth / 2, canvasHeight - graphMargin + 40);
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Volumetric Flow Rate (L/s)", -canvasHeight / 2, graphStartX - 30);
    ctx.restore();
}

// Draw graph
function drawGraph(points) {
    ctx.strokeStyle = 'purple';
    ctx.lineWidth = 2;

    ctx.beginPath();
    points.forEach((point, index) => {
        const x = graphStartX + (point.x) * graphWidth;
        const y = canvasHeight - graphMargin - (point.y / 20) * graphWidth; // Scale Q for visibility
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.strokeStyle = 'black';
}

// Draw current point
function drawCurrentPoint(h, Q) {
    const x = graphStartX + (h) * graphWidth;
    const y = canvasHeight - graphMargin - (Q / 20) * graphWidth; // Scale Q for visibility

    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
}

// Initialize graph
updateGraph();
