const canvasWidth = 800;
const canvasHeight = 596;
const tableWidth = 500;
const tableHeight = 75;
const tableX = (canvasWidth - tableWidth) / 2;
const tableY = canvasHeight - tableHeight;
const legWidth = 20;
const drainDiameterDropdown = document.getElementById('drainDiameter');
const liquidHeightDropdown = document.getElementById('liquidHeight');
const ratio = 475 / 85;
let waterHeight = (parseFloat(liquidHeightDropdown.value)) * ratio;
let diameter = parseFloat(drainDiameterDropdown.value) * ratio;
const containerWidth = 20 * ratio;
const length = 475;
const surfaceWidth = 10;
let isRotated = false;
const borderHexCode = '#b3b3b3'
const valveCenterX = canvasWidth / 2 + containerWidth / 2 + 50;
const valveCenterY = tableY - legWidth - surfaceWidth - diameter / 2;
let fillTankPath;
let valveGroup;
let fillTankPathData;

const draw = SVG().addTo('#svg-container')
.size(canvasWidth, canvasHeight)

function addEventListener() {
  drainDiameterDropdown.addEventListener('change', () => {
    diameter = parseFloat(drainDiameterDropdown.value) * ratio;
    drawCanvas();
  });
  
  liquidHeightDropdown.addEventListener('change', () => {
    waterHeight = (parseFloat(liquidHeightDropdown.value) * ratio);
    drawCanvas();
  });
}
addEventListener();

function drawTable() {
  // Draw left leg
  draw.rect(legWidth, tableHeight)
  .move(tableX, tableY - 4)
  .fill('#C1BDB3')
  .stroke({ color: '#000', width: 1});
  
  // Draw right leg
  draw.rect(legWidth, tableHeight)
  .move(tableX + tableWidth - legWidth, tableY - 4)
  .fill('#C1BDB3')
  .stroke({ color: '#000', width: 1});
  
  draw.rect(tableWidth + legWidth, legWidth)
  .move(tableX - 10, tableY)
  .fill('#1E1A1D')
  .stroke({ color: '#000', width: 1});
  
  draw.rect(100, legWidth)
  .move((canvasWidth - 100) / 2, tableY - 20)
  .fill('#646464');
}

function drawContainer() {
  // Parameters
  const startX = (canvasWidth - containerWidth - 40) / 2;
  const startY = tableY - 20 - 10 - length;
  
  // Draw the container
  const pathData = `
            M ${startX},${startY}
            h 20 
            v ${length}
            h ${containerWidth}
            h 100
            v ${surfaceWidth / 2}
            h -${(100 - surfaceWidth)}
            v ${surfaceWidth / 2}
            h  -${containerWidth + surfaceWidth + surfaceWidth}
            v -${length}
            h -${20 - surfaceWidth}
            v -${surfaceWidth}
  
        `;
  
  const pathData1 = `
  M ${startX + containerWidth + 20 + 20},${startY}
  h -20
  v ${length - diameter}
  h 100
  v -${surfaceWidth / 2}
  h -${100 - surfaceWidth}
  v -${length - diameter - surfaceWidth - surfaceWidth / 2}
  h ${20 - surfaceWidth}
  v -${surfaceWidth}
  `;
  
  draw.path([pathData, pathData1].join(''))
  .fill('#eeeeee')
  .stroke({ color: borderHexCode, width: 2});
}

function drawValve() { 
  
  valveGroup = draw.group();
  valveGroup.circle(30)
  .fill('#b4b4ff')
  .stroke({color: borderHexCode, width: 2})
  .center(valveCenterX, valveCenterY)
  .front();
  const valve = valveGroup.rect(34, 10)
  .fill('#c8c8ff')
  .stroke({color: '#b4b4ff', width: 2})
  .center(valveCenterX, valveCenterY)
  .front();
  
  // Reattach the click event listener every time drawValve is called
  (valveGroup).click(() => {
    isRotated = !isRotated;
    drainDiameterDropdown.disabled = true;
    liquidHeightDropdown.disabled = true;
    if (!isRotated) {
          valve.animate(300).rotate(-90, valveCenterX, valveCenterY);
          stopTimer();
          stopDropletAnimation();
          calculateHeightWithTime();
        } else {
          valve.animate(300).rotate(90, valveCenterX, valveCenterY);
          createDroplets();
          startTimer();
          startDropletAnimation();
        }
    console.log('Valve clicked, current state:', isRotated);
  });
}

function fillTank() {
  const startX = valveCenterX;
  const startY = tableY - legWidth - surfaceWidth;
  if (!isRotated) {
    
    if (waterHeight > diameter) {
      fillTankPathData = `
                      M ${startX},${startY}
                      h -${containerWidth + 50}
                      v -${waterHeight}
                      h ${containerWidth}
                      v ${waterHeight - diameter}
                      h 50
                      v ${diameter}
  `;
    } else {
      fillTankPathData = `
                      M ${startX},${startY}
                      h -${containerWidth + 50}
                      v -${waterHeight}
                      h ${containerWidth + 50}
                      v -${waterHeight}
  `;
    } 
  } else {
    if (waterHeight > diameter) {
      fillTankPathData = `
                      M ${startX + 50},${startY}
                      h -${containerWidth + 100}
                      v -${waterHeight}
                      h ${containerWidth}
                      v ${waterHeight - diameter}
                      h 100
                      v ${diameter}
    `;
    } else {
      fillTankPathData = `
                      M ${startX + 50},${startY}
                      h -${containerWidth + 100}
                      v -${waterHeight}
                      h ${containerWidth + 100}
                      v -${waterHeight}
                      `;
    }
  }
  
  if (fillTankPath) {
    fillTankPath.remove();
  }
  
  // Draw the new fill tank path and store the reference
  fillTankPath = draw.path(fillTankPathData)
  .fill('rgb(35, 137, 218)');
  
  if (valveGroup) {
    fillTankPath.insertBefore(valveGroup);
  }
}

let timerInterval;
let elapsedTime = 0;
const timerDisplay = document.getElementById('timer');

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const milliseconds = String(ms % 1000).padStart(3, '0');
  return `${minutes}:${seconds}.${milliseconds}`;
}
function startTimer() {
  const startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(() => {
    elapsedTime = Date.now() - startTime;
    calculateHeightWithTime();
  }, 1);
}
function calculateHeightWithTime() {
  const g = 981;
  const time = elapsedTime / 1000;
  const numerator = Math.sqrt(g / 2) * time;
  const denominator = Math.sqrt(Math.pow(20 * ratio/diameter, 4) + 209);
  const sqrtHeight = Math.sqrt(parseFloat(liquidHeightDropdown.value)) - (numerator / denominator)
  let heightCalculation = Math.pow(sqrtHeight, 2);
  waterHeight = heightCalculation * ratio;  
  if (sqrtHeight <= 0) {
    waterHeight = 0;
    stopTimer();
    stopDropletAnimation();
  }   
  fillTank();
}

function stopTimer() {
  clearInterval(timerInterval);
}

// Add these variables at the top with other constants
let droplets = [];
let animationFrameId;
const dropletCount = 300;
const gravityPixels = 9.8 * 20; // 9.8 m/s² * pixelsPerMeter
const initialVelocityX = 50;

// Add these functions after fillTank()
function createDroplets() {
  // Clear existing droplets
  droplets.forEach(d => d.element.remove());
  droplets = [];

  const startX = canvasWidth / 2 + containerWidth / 2 + 100;
  const startY = tableY - legWidth - surfaceWidth - diameter / 2;

  for (let i = 0; i < dropletCount; i++) {
    const element = draw.circle(diameter * 0.3).fill('rgb(35, 137, 218)');
    droplets.push({
      element,
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * initialVelocityX,
      vy: 0,
      active: false,
      delay: Math.random() * 2
    });
  }
}

let lastTime = performance.now();
function startDropletAnimation() {
  animationFrameId = requestAnimationFrame(animate);
}

function animate(timestamp) {
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  
  droplets.forEach(droplet => {
    if (droplet.delay > 0) {
      droplet.delay -= deltaTime;
      return;
    }
    
    if (!droplet.active) {
      droplet.active = true;
    }
    
    // Apply physics
    droplet.vy += gravityPixels * deltaTime;
    droplet.y += droplet.vy * deltaTime;
    droplet.x += droplet.vx * deltaTime;
    
    droplet.element.center(droplet.x, droplet.y);
    
    // Reset when hitting table or going off-screen
    if (droplet.y >= tableY || droplet.x < 0 || droplet.x > canvasWidth) {
      resetDroplet(droplet);
    }
  });
  
  if (isRotated) {
    animationFrameId = requestAnimationFrame(animate);
  }
}

function resetDroplet(droplet) {
  const startX = canvasWidth / 2 + containerWidth/2 + 100;
  const startY = tableY - legWidth - surfaceWidth - diameter / 2;
  
  droplet.x = startX;
  droplet.y = startY;
  droplet.vx = (Math.random() - 0.5) * initialVelocityX;
  droplet.vy = 0;
  droplet.delay = Math.random() * 2;
  droplet.active = false;
  droplet.element.center(droplet.x, droplet.y);
}

function animateDropletRemoval(droplet, duration = 500) {
  const startTime = performance.now();
  const initialScale = 1;
  const finalScale = 0;
  const initialOpacity = 1;
  const finalOpacity = 0;

  function animateFrame(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    const scale = initialScale + (finalScale - initialScale) * progress;
    const opacity = initialOpacity + (finalOpacity - initialOpacity) * progress;

    droplet.element.scale(scale);
    droplet.element.opacity(opacity);

    if (progress < 1) {
      requestAnimationFrame(animateFrame);
    } else {
      resetDroplet(droplet);
      droplet.element.opacity(1); // Reset opacity for next use
      droplet.element.scale(1); // Reset scale for next use
    }
  }

  requestAnimationFrame(animateFrame);
}

function stopDropletAnimation() {
  cancelAnimationFrame(animationFrameId);
  droplets.forEach(animateDropletRemoval);
}

function drawCanvas() {
  draw.clear();
  drawTable();
  drawContainer();
  drawValve();
  fillTank();
  drawInstructions();
  drawRuler(); 
  
  // Recreate droplets if animation was running
  if (isRotated) {
    createDroplets();
    startDropletAnimation();
  }
}

drawCanvas();


function resetCanvas() {
  console.log('Reset button clicked');
  // Reset dropdown values
  const resetButton = document.getElementById('reset-button')
  resetButton.addEventListener('click', () => {
    isRotated = false;
    waterHeight = parseFloat(liquidHeightDropdown.value) * ratio;
    diameter = parseFloat(drainDiameterDropdown.value) * ratio;
    drawCanvas();
    stopTimer();
    stopDropletAnimation();
    elapsedTime = 0;
    drainDiameterDropdown.disabled = false;
    liquidHeightDropdown.disabled = false;
  });

}

function drawInstructions() {
  draw.rect(150, 100)
  .center(canvasWidth - 100, canvasHeight / 2 + 30)
  .fill('none')
  .stroke({color: 'black', width: 2})
  let valveGroup1 = draw.group();
  valveGroup1.circle(30)
  .fill('#b4b4ff')
  .stroke({color: borderHexCode, width: 2})
  .center(canvasWidth - 140, canvasHeight / 2)
  const valve = valveGroup1.rect(34, 10)
  .fill('#c8c8ff')
  .stroke({color: '#b4b4ff', width: 2})
  .center(canvasWidth - 140, canvasHeight / 2)

  draw.text(' = Closed').move(canvasWidth - 120, canvasHeight / 2 - 10);

  valveGroup1.circle(30)
  .fill('#b4b4ff')
  .stroke({color: borderHexCode, width: 2})
  .center(canvasWidth - 140, canvasHeight / 2 + 50)
  const valve1 = valveGroup1.rect(10, 34)
  .fill('#c8c8ff')
  .stroke({color: '#b4b4ff', width: 2})
  .center(canvasWidth - 140, canvasHeight / 2 + 50)

  draw.text(' = Opened').move(canvasWidth - 120, canvasHeight / 2 - 10 + 50);

}

function drawRuler() {
  const startPoint = { x: canvasWidth / 2 - containerWidth / 2 - surfaceWidth - 2, y: tableY - legWidth - surfaceWidth};
  draw.rect(30, length - 4)
  .move(canvasWidth / 2 - containerWidth / 2 - surfaceWidth - 32, tableY - legWidth - surfaceWidth - length + 12)
  .fill('#deb887');

  for (let i = 0; i <= 80; i += 0.25) {
    const x = startPoint.x;
    const y = startPoint.y - i * ratio;
    const tickLength = i % 5 == 0 ? 15 : 10; // Longer ticks for multiples of 50
    
    draw.line(x, y, x - tickLength, y).stroke({ width: 0.5, color: '#000' });
    if (i % 5 === 0) {
      draw.text(i.toString()).move(x - tickLength - 5, y - 1)
  .attr({ 'text-anchor': 'end' }) // Align text to the right
  .font({
    size: 7,
    family: 'Arial',
    fill: '#000'
  });

  draw.text('cm').move(canvasWidth / 2 - containerWidth / 2 - surfaceWidth - 24, tableY - legWidth - surfaceWidth - length + 12)
  .font({
    size: 12,
    family: 'Arial',
    fill: '#000'
  });

}
  }
}

resetCanvas();