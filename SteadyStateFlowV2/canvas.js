// Select the canvas element
import ReusableMethods from '../reusableMethods.js';

const canvas = document.getElementById('centeredCanvas');
const ctx = canvas.getContext('2d');
const globalFunctions = new ReusableMethods(ctx);

const liquidHeightSlider = document.getElementById('liquidHeight');
const drainDiameterSlider = document.getElementById('drainDiameter');
const liquidDensitySlider = document.getElementById('liquidDensity');
const dischargeCoefficientSlider = document.getElementById('dischargeCoefficient');

const liquidHeightValue = document.getElementById('liquidHeightValue');
const drainDiameterValue = document.getElementById('drainDiameterValue');
const liquidDensityValue = document.getElementById('liquidDensityValue');
const dischargeCoefficientValue = document.getElementById('dischargeCoefficientValue');

const containerHeight = 235;
const containerWidth = 135;
const startPoint = {x: (canvas.width - containerWidth) / 2 - 60, y: 75};
var waterHeight = (parseFloat(liquidHeightSlider.value) / 0.9) * 205;
var diameter = (parseFloat(drainDiameterSlider.value) / 7) * 20;
const currentPoint = {x: startPoint.x + 63, y: startPoint.y + containerHeight};
const point1 = {x: currentPoint.x + 65, y: currentPoint.y + 14};
var point2 = {x: point1.x + diameter, y: currentPoint.y + 14};
const tapDistance = 40;
const tapKnobHeight = 7.5
const waterStartPoint = {x: startPoint.x + 63, y: startPoint.y + 14 + 235};

setupSliders();


function setupSliders() {
    liquidHeightSlider.oninput = function() {
        liquidHeightValue.textContent = (liquidHeightSlider.value);
        drawCanvas();
    };
    drainDiameterSlider.oninput = function() {
        drainDiameterValue.textContent = (drainDiameterSlider.value);
        drawCanvas();
    };
    liquidDensitySlider.oninput = function() {
        liquidDensityValue.textContent = (liquidDensitySlider.value);
        drawCanvas();
    };
    dischargeCoefficientSlider.oninput = function() {
        dischargeCoefficientValue.textContent = (dischargeCoefficientSlider.value);
        drawCanvas();
    };
}

function setupValues() {
    waterHeight = (parseFloat(liquidHeightSlider.value) / 0.9) * 205;
    diameter = (parseFloat(drainDiameterSlider.value) / 7) * 20;
    point2 = {x: point1.x + diameter, y: currentPoint.y + 14};
}
function setupCanvasSpace() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.resetTransform()
    ctx.textAlign = 'center'
    ctx.font = '16px Arial'
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2
    ctx.fillStyle = 'rgb(35, 137, 218)';
}

function drawTank() {
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

    ctx.beginPath();
    ctx.moveTo(startPoint.x + 63, startPoint.y + 6 + 8);
    ctx.lineTo(startPoint.x + 63, startPoint.y + containerHeight);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(currentPoint.x, currentPoint.y)
    ctx.quadraticCurveTo(currentPoint.x + 30, currentPoint.y + 11, currentPoint.x + 65, currentPoint.y + 14);
    
    ctx.lineTo(point1.x, point1.y + 28);
    ctx.lineTo(point1.x + 75, point1.y + 28);
    ctx.moveTo(point1.x + 75, point1.y + 28 - diameter);
    ctx.lineTo(point1.x + diameter, point1.y + 28 - diameter);
    ctx.lineTo(point1.x + diameter, currentPoint.y + 14);
    ctx.moveTo(point1.x + diameter, point1.y + 28 - diameter);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(point2.x, point2.y)
    ctx.quadraticCurveTo(point2.x + 30, point2.y - 3, startPoint.x + 63 + containerWidth, point2.y - 14);
    ctx.lineTo(startPoint.x + 63 + containerWidth, startPoint.y + 14);
    ctx.moveTo(point2.x, point2.y)
    ctx.closePath();
    ctx.stroke();
}

function drawWaterFlowFromTap() {
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
}

function fillTank() {
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

    ctx.beginPath();
    ctx.lineTo(waterStartPoint.x + containerWidth, startPoint.y + 235);
    ctx.lineTo(waterStartPoint.x + containerWidth, startPoint.y + 235 - waterHeight);
    ctx.lineTo(waterStartPoint.x, startPoint.y + 235 - waterHeight);
    ctx.lineTo(waterStartPoint.x, startPoint.y + 235);
    ctx.closePath();
    ctx.fill();
    
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
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black'; // Set text color
    globalFunctions.drawText(point1.x + tapDistance + 10, point1.y + 28 + 15, 'c₀')
    ctx.fillStyle = 'rgb(35, 137, 218)';

    globalFunctions.drawDashedLine(startPoint.x + 63 + 65, startPoint.y + 235 + 28 + 14, startPoint.x + 10, startPoint.y + 235 + 28 + 14);
    globalFunctions.drawDashedLine(startPoint.x + 63, startPoint.y + 235 - waterHeight, startPoint.x + 10, startPoint.y + 235 - waterHeight);
  
    globalFunctions.drawDoubleArrowLine(startPoint.x + 5, startPoint.y + 235 - waterHeight, startPoint.x + 5, startPoint.y + 235 + 28 + 14);
    globalFunctions.drawText(startPoint.x + 15, startPoint.y + 235 + 28 + 14 - waterHeight, 'h');

    globalFunctions.drawDashedLine(point1.x + 75, point1.y + 28, point1.x + 105, point1.y + 28)
    globalFunctions.drawDashedLine(point1.x + 75, point1.y + 28 - diameter, point1.x + 105, point1.y + 28 - diameter)
    globalFunctions.drawDoubleArrowLineOutward(point1.x + 105, point1.y + 28, point1.x + 105, point1.y + 28 - diameter, 'd');
}

function drawCanvas() {
    setupCanvasSpace();
    setupValues();
    drawWaterFlowFromTap();
    drawTank();
    fillTank();
    drawTap();
    drawArrows();
}

drawCanvas();