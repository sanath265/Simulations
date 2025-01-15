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
    liquidHeightValue.textContent = liquidHeightSlider.value;
    drawCanvas(); // Redraw the canvas when the value changes
};
drainDiameterSlider.oninput = function() {
    drainDiameterValue.textContent = drainDiameterSlider.value;
    drawCanvas(); // Redraw the canvas when the value changes
};
liquidDensitySlider.oninput = function() {
    liquidDensityValue.textContent = liquidDensitySlider.value;
    drawCanvas(); // Redraw the canvas when the value changes
};
dischargeCoefficientSlider.oninput = function() {
    dischargeCoefficientValue.textContent = dischargeCoefficientSlider.value;
    drawCanvas(); // Redraw the canvas when the value changes
};

function drawCanvas() {
    // Clear the entire canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background color and redraw the background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgb(35, 137, 218)';
    ctx.lineWidth = 2;
    
    // Define start point
    const startPoint = {x: 20, y: 75};
    
    // Draw the first shape
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(startPoint.x + 90, startPoint.y);
    ctx.lineTo(startPoint.x + 90, startPoint.y + 20);
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.closePath();
    ctx.stroke();

    // Draw the second shape (above the first one)
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y + 8);
    ctx.lineTo(startPoint.x + 80, startPoint.y + 8);
    ctx.lineTo(startPoint.x + 80, startPoint.y + 20);
    ctx.moveTo(startPoint.x, startPoint.y + 8);
    ctx.closePath();
    ctx.stroke();

    // Define container dimensions
    const containerHeight = 235;
    const containerWidth = 135;

    // Draw the container's vertical line
    ctx.beginPath();
    ctx.moveTo(startPoint.x + 63, startPoint.y + 6 + 8);
    ctx.lineTo(startPoint.x + 63, startPoint.y + containerHeight);
    ctx.closePath();
    ctx.stroke();

    // Draw the quadratic curve
    const currentPoint = {x: startPoint.x + 63, y: startPoint.y + containerHeight};
    ctx.beginPath();
    ctx.moveTo(currentPoint.x, currentPoint.y)
    ctx.quadraticCurveTo(currentPoint.x + 30, currentPoint.y + 11, currentPoint.x + 65, currentPoint.y + 14);
    
    // Draw the diameter-related part
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

    // Draw the second quadratic curve and container curve
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

    // Calculate center and radii for ellipse
    const centerX = (startPoint.x + 80 + startPoint.x + 90) / 2;
    const centerY = (startPoint.y + 20 + startPoint.y + 20) / 2;
    const radiusX = Math.abs(startPoint.x + 90 - startPoint.x - 80) / 2;
    const radiusY = 0;

    // Draw the ellipse
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();

    // Fill the bottom part of the container
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

    // Draw the final quadratic curve
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
    // Draw the main line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.fillStyle = 'black'
    ctx.stroke();

    // Calculate the angle of the line
    const angle = Math.atan2(endY - startY, endX - startX);

    // Draw arrowhead at the start
    drawArrowhead(startX, startY, angle + Math.PI, arrowSize);

    // Draw arrowhead at the end
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
    ctx.fillStyle = 'black'; // Set text color
    ctx.fillText(text, x, y);
}

function drawDashedLine(startX, startY, endX, endY, dashPattern = [5, 5]) {
    // Set the dash pattern
    ctx.setLineDash(dashPattern); // [dash length, gap length]
    ctx.beginPath();
    ctx.moveTo(startX, startY); // Start point of the line
    ctx.lineTo(endX, endY); // End point of the line
    ctx.stroke();

    // Reset the line dash to solid
    ctx.setLineDash([]);
}


function drawDoubleArrowLineOutward(x1, y1, x2, y2, label = '', arrowSize = 10) {
    // Draw the line between the two points
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1, y1 + 20);
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2, y2 - 20);
    ctx.stroke();

    // Draw the top arrowhead (pointing down)
    drawArrowhead(x2, y2, Math.PI / 2, arrowSize);

    // Draw the bottom arrowhead (pointing up)
    drawArrowhead(x1, y1, -Math.PI / 2, arrowSize);

    // Draw the label
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    const labelY = (y1 + y2) / 2; 
    ctx.fillText(label, x1 + 20, labelY);
}

drawCanvas()
// Initial drawing on the canvas when the page loads
