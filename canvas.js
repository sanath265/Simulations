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
    liquidHeightValue.textContent = liquidHeightSlider.value;
    drawCanvas();
    updateGraph();
};
drainDiameterSlider.oninput = function() {
    drainDiameterValue.textContent = drainDiameterSlider.value;
    drawCanvas();
    updateGraph();
};
liquidDensitySlider.oninput = function() {
    liquidDensityValue.textContent = liquidDensitySlider.value;
    drawCanvas();
    updateGraph();
};
dischargeCoefficientSlider.oninput = function() {
    dischargeCoefficientValue.textContent = dischargeCoefficientSlider.value;
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
    ctx.fillStyle = 'black';
    drawText(point1.x + tapDistance + 10, point1.y + 28 + 15, 'c₀');
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
}

function drawText(x, y, text) {
    ctx.fillText(text, x, y);
}

function updateGraph() {
    const flowRate = getFlowRate();
    graph.clearRect(0, 0, graph.width, graph.height);

    const h = parseFloat(liquidHeightSlider.value);
    const heightInterval = (parseFloat(liquidHeightSlider.max) - parseFloat(liquidHeightSlider.min)) / 100;

    graph.beginPath();
    for (let i = 0; i <= 100; i++) {
        const height = parseFloat(liquidHeightSlider.min) + heightInterval * i;
        const flowRate = getFlowRate(height);
        graph.lineTo(i, flowRate);
    }
    graph.stroke();

    graph.beginPath();
    graph.arc(flowRate, 0, 4, 0, Math.PI * 2, true);
    graph.fill();
}

function getFlowRate() {
    const c0 = parseFloat(dischargeCoefficientSlider.value);
    const d = parseFloat(drainDiameterSlider.value);
    const h = parseFloat(liquidHeightSlider.value);
    return c0 * Math.PI * (Math.pow(d / 2, 2)) * Math.sqrt(2 * 9.81 * h);
}
