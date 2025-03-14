// Setup the canvas and SVG drawing
const canvasWidth = 1000;
const canvasHeight = 600;
const draw = SVG().addTo('#svg-container').size(canvasWidth, canvasHeight);

// Global variables for table and pumps
const tableWidth = canvasWidth - 500;
const tableHeight = 20;
const legWidth = 20;
const legHeight = 80;
const tableX = (canvasWidth - tableWidth) / 2;
const tableY = canvasHeight - legHeight - tableHeight;

let pump1 = null;
let pump2 = null;
let isRotatedPump1 = false;
let isRotatedPump2 = false;

let pump12 = null;
let pump22 = null;

let leftPipe = null;
let leftPipe2 = null;
let leftPipe3 = null;
let leftPipe4 = null;

let rightPipe = null;
let rightPipe2 = null;
let rightPipe3 = null;
let rightPipe4 = null;

// GLOBAL VARIABLES FOR TANK FILLING (in mL)
let extractTankVolume = 0;   // fills at 8.08 mL/s
let raffinateTankVolume = 0; // fills at 1.22 mL/s
const maxTankVolume = 1000;

const extractFillRate = 1.2;  // mL/s for extract tank
const raffinateFillRate = 8.1; // mL/s for raffinate tank

// Global variables to store drawn liquid elements so they can be updated.
let extractLiquidElement = null;
let raffinateLiquidElement = null;

// Global timers for filling:
let extractFillTimer = null;
let raffinateFillTimer = null;

// GLOBAL VARIABLES FOR DRAINING (in mL)
let feedTankVolume = maxTankVolume;      // Feed tank full initially
let solventTankVolume = maxTankVolume;   // Solvent tank full initially

const feedDrainRate = 5.6;   // mL/s for feed tank
const solventDrainRate = 3.2; // mL/s for solvent tank

let feedDrainTimer = null;
let solventDrainTimer = null;

// To hold the drawn liquid elements for feed and solvent tanks
let feedLiquidElement = null;
let solventLiquidElement = null;

// ***** MOLE FRACTION TOOLTIP SETUP WITH BACKGROUND & BORDER *****
const moleFractions = {
  "F":  { flow: 6.9, xAA: 0.52, xC: 0.43, xW: 0.05 },
  "S":  { flow: 3.2, xAA: 0.00, xC: 0.00, xW: 1.00 },
  "E2": { flow: 4.4, xAA: 0.13, xC: 0.03, xW: 0.84 },
  "R1": { flow: 2.9, xAA: 0.27, xC: 0.60, xW: 0.13 },
  "E1": { flow: 8.4, xAA: 0.39, xC: 0.16, xW: 0.45 },
  "E3": { flow: 3.4, xAA: 0.02, xC: 0.01, xW: 0.97 },
  "R2": { flow: 1.9, xAA: 0.09, xC: 0.87, xW: 0.05 },
  "R3": { flow: 1.8, xAA: 0.05, xC: 0.93, xW: 0.02 }
};

let moleFractionTooltip = draw.group().hide();

let tooltipRect = moleFractionTooltip
  .rect(1, 1)
  .fill({ color: '#fff' })
  .stroke({ color: '#000', width: 1 });

let tooltipText = moleFractionTooltip
  .text('')
  .font({ size: 12, family: 'Arial' })
  .fill('#000');

function showTooltip(label, event) {
  const data = moleFractions[label];
  if (!data) return;
  const textContent = `xAA = ${data.xAA}, xC = ${data.xC}, xW = ${data.xW}`;
  tooltipText.text(textContent);
  
  setTimeout(() => {
    let bbox = tooltipText.bbox();
    const padding = 5;
    tooltipRect.size(bbox.width + 2 * padding, bbox.height + 2 * padding);
    tooltipRect.move(bbox.x - padding, bbox.y - padding);
  }, 0);
  
  const pt = draw.node.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const svgP = pt.matrixTransform(draw.node.getScreenCTM().inverse());
  moleFractionTooltip.move(svgP.x + 10, svgP.y + 10).front().show();
}

function hideTooltip() {
  moleFractionTooltip.hide();
}
// ***** END MOLE FRACTION TOOLTIP SETUP *****

// DRAWING FUNCTIONS

function drawCanvas() {
  draw.clear();
  // Recreate the tooltip after clearing the canvas.
  moleFractionTooltip = draw.group();
  tooltipRect = moleFractionTooltip
    .rect(1, 1)
    .fill({ color: '#fff' })
    .stroke({ color: '#000', width: 1 });
  tooltipText = moleFractionTooltip
    .text('')
    .font({ size: 12, family: 'Arial' })
    .fill('#000');
  moleFractionTooltip.hide();

  drawRectangleWithThreeSquares(canvasWidth / 2, canvasHeight / 2 - 50, 150, 350);
  drawPipes();
  drawPumps();
  drawTanks();
  drawTexts();
  addOptionToDragAndZoom();
}

// Draw the four tanks (beakers).
function drawTanks() {
  feedLiquidElement = drawLiquidRectangle(100, canvasHeight, 125, 10, 125 - 2 * 10, 'red', 0.52);
  solventLiquidElement = drawLiquidRectangle(canvasWidth - 300, canvasHeight, 125, 10, 125 - 20);
  drawBracket(100, canvasHeight, 125, 125, 10, 20);
  drawBracket(475, canvasHeight, 125, 125, 10, 20);
  drawBracket(canvasWidth - 100, canvasHeight, 125, 125, 10, 20);
  drawBracket(canvasWidth - 300, canvasHeight, 125, 125, 10, 20);
}

function drawBracket(startX, startY, width, height, surfaceWidth, holderLength, liquidColor = '#c1c1ff', liquidColorOpacity = 0.5) {
  const d = holderLength / Math.sqrt(2);
  
  const P0 = { x: startX, y: startY };
  const P1 = { x: startX - width / 2, y: startY };
  const P2 = { x: P1.x, y: startY - height };
  const P3 = { x: P2.x - d, y: P2.y - d };
  const P4 = { x: P3.x + surfaceWidth, y: P3.y - surfaceWidth };
  const P5 = { x: P4.x + d, y: P4.y + d };
  const P6 = { x: P5.x, y: startY - surfaceWidth };
  const P7 = { x: startX, y: P6.y };
  
  const Q1 = { x: startX + width / 2, y: startY };
  const Q2 = { x: Q1.x, y: startY - height };
  const Q3 = { x: Q2.x + d, y: Q2.y - d };
  const Q4 = { x: Q3.x - surfaceWidth, y: Q3.y - surfaceWidth };
  const Q5 = { x: Q4.x - d, y: Q4.y + d };
  const Q6 = { x: Q5.x, y: startY - surfaceWidth };
  const Q7 = { x: startX, y: Q6.y };
  
  const points = [P0, P1, P2, P3, P4, P5, P6, P7, Q6, Q5, Q4, Q3, Q2, Q1, P0];
  const pointString = points.map(pt => `${pt.x},${pt.y}`).join(" ");
  
  draw.polyline(pointString)
    .fill('#e6e6e6')
    .stroke({ color: '#898989', width: 2 });
  
  const maxVolume = 1000;
  const tickInterval = 20; // 10 mL per tick
  const numTicks = maxVolume / tickInterval;
  const liquidMaxHeight = height - 2 * surfaceWidth;
  const bottomY = startY - surfaceWidth;
  const leftX = startX - (width - 2 * surfaceWidth) / 2;
  let tickLength = 3;
  
  for (let i = 0; i <= numTicks; i++) {
    const tickVolume = i * tickInterval;
    tickLength = tickVolume % 50 === 0 ? 20 : 10;
    const tickY = bottomY - (tickVolume / maxVolume) * liquidMaxHeight;
    draw.line(leftX, tickY, leftX + tickLength, tickY)
      .stroke({ color: '#000', width: 1 });
    if (tickVolume % 250 === 0) {
      if (tickVolume === 0) continue;
      const textLabel = draw.text(tickVolume.toString() + " ml")
        .font({ family: 'Arial', size: 10 })
        .move(leftX + tickLength + 2, tickY - 5);
      textLabel.attr({ 'text-anchor': 'start' });
    }
  }
}

function drawRectangleWithThreeSquares(centerX, centerY, rectWidth, rectHeight) {
  const startX = centerX - rectWidth / 2;
  const startYMain = centerY - rectHeight / 2;
  
  draw.rect(rectWidth, rectHeight)
    .move(startX, startYMain)
    .fill('none')
    .stroke({ color: '#000', width: 2 });
  
  const squareSize = rectWidth - 60;
  const gap = (rectHeight - 3 * squareSize) / 4;
  
  for (let i = 0; i < 3; i++) {
    const xPos = startX + (rectWidth - squareSize) / 2;
    const yPos = startYMain + gap + i * (squareSize + gap);
    draw.rect(squareSize, squareSize)
      .move(xPos, yPos)
      .fill('#ccc')
      .stroke({ color: '#000', width: 1 });
  }
}

function drawLiquidRectangle(startX, startY, width, surfaceWidth, liquidHeight, fillColor = '#c1c1ff', fillOpacity = 0.2) {
  const rectWidth = width - 2 * surfaceWidth;
  const rectX = startX - rectWidth / 2;
  const rectY = startY - surfaceWidth;
  
  const pathString = `
    M ${rectX} ${rectY}
    L ${rectX + rectWidth} ${rectY}
    L ${rectX + rectWidth} ${rectY - liquidHeight}
    L ${rectX} ${rectY - liquidHeight}
    Z
  `;
  
  return draw.path(pathString)
    .fill({ color: fillColor, opacity: fillOpacity });
}

function drawPipeWithCurves(pathString, pipeWidth = 15, strokeColor = '#f7f7f7', outlineColor = '#d5d5d5') {
  draw.path(pathString)
    .fill('none')
    .stroke({
      color: outlineColor,
      width: pipeWidth + 4,
      linejoin: 'round'
    });
  draw.path(pathString)
    .fill('none')
    .stroke({
      color: strokeColor,
      width: pipeWidth,
      linejoin: 'round'
    });
}

function drawPipes() {
  let startX = 100;
  let startY = canvasHeight - 30;
  
  // Left pipe segments
  leftPipe = `
    M ${startX} ${startY} 
    L ${startX} ${50} 
    L ${startX + 375} ${50} 
    L ${startX + 375} ${94.5} 
  `;
  drawPipeWithCurves(leftPipe);
  
  leftPipe2 = `
    M ${startX + 375} ${94.5 + 91} 
    L ${startX + 375} ${94.5 + 91 + 19} 
  `;
  drawPipeWithCurves(leftPipe2);
  
  leftPipe3 = `
    M ${startX + 375} ${94.5 + 91 + 19 + 91} 
    L ${startX + 375} ${94.5 + 91 + 19 + 91 + 19} 
  `;
  drawPipeWithCurves(leftPipe3);
  
  leftPipe4 = `
    M ${startX + 375} ${94.5 + 91 + 19 + 91 + 19 + 91} 
    L ${startX + 375} ${94.5 + 91 + 19 + 91 + 19 + 91 + 180} 
  `;
  drawPipeWithCurves(leftPipe4);
  
  // Right pipe segments
  startX = 700;
  rightPipe = `
    M ${startX} ${startY} 
    L ${startX} ${startY - 130} 
    L ${startX - 170} ${startY - 130} 
    L ${startX - 170} ${startY - 164}
  `;
  drawPipeWithCurves(rightPipe);
  
  rightPipe2 = `
    M ${startX - 170} ${94.5 + 91 + 19 + 91 + 19}
    L ${startX - 170} ${94.5 + 91 + 19 + 91}  
  `;
  drawPipeWithCurves(rightPipe2);
  
  rightPipe3 = `
    M ${startX - 170} ${94.5 + 91 + 19} 
    L ${startX - 170} ${94.5 + 91} 
  `;
  drawPipeWithCurves(rightPipe3);
  
  rightPipe4 = `
    M ${startX - 170} ${94.5} 
    L ${startX - 170} ${50} 
    L ${startX + 200} ${50}
    L ${startX + 200} ${startY + 15}
  `;
  drawPipeWithCurves(rightPipe4);
}

function drawPump(valveCenterX, valveCenterY, radius) {
  const valveGroup = draw.group();
  valveGroup.circle(40)
    .fill('#b4b4ff')
    .stroke({ color: 'black', width: 2 })
    .center(valveCenterX, valveCenterY)
    .front();
  valveGroup.rect(10, 44)
    .fill('#c8c8ff')
    .stroke({ color: 'black', width: 2, linecap: 'round' })
    .center(valveCenterX, valveCenterY)
    .front();
  return valveGroup;
}

function drawTexts() {
  // Tank labels
  drawCenteredText(canvasWidth / 2 - 50, canvasHeight - 35, "raffinate tank", 12);
  drawCenteredText(canvasWidth / 2 + 180, canvasHeight - 35, "solvent tank", 12);
  
  let startX = 310;
  let startY = 450;
  
  // Number labels
  drawCenteredText(startX - 55 + 179.5 - 5 + 65, startY - 320, "1", 20);
  drawCenteredText(startX - 55 + 179.5 - 5 + 65, startY - 210, "2", 20);
  drawCenteredText(startX - 55 + 179.5 - 5 + 65, startY - 100, "3", 20);
  
  // Left column stream labels with tooltip events
  let textF = drawCenteredText(startX - 55 + 179.5 - 5, startY - 375, "F", 16);
  textF.on('mouseover', (event) => showTooltip("F", event));
  textF.on('mouseout', hideTooltip);
  
  let textR1 = drawCenteredText(startX - 55 + 179.5 - 5, startY - 270, "R1", 16);
  textR1.on('mouseover', (event) => showTooltip("R1", event));
  textR1.on('mouseout', hideTooltip);
  
  let textR2 = drawCenteredText(startX - 55 + 179.5 - 5, startY - 160, "R2", 16);
  textR2.on('mouseover', (event) => showTooltip("R2", event));
  textR2.on('mouseout', hideTooltip);
  
  let textR3 = drawCenteredText(startX - 55 + 179.5 - 5, startY - 50, "R3", 16);
  textR3.on('mouseover', (event) => showTooltip("R3", event));
  textR3.on('mouseout', hideTooltip);
  
  // Right column stream labels with tooltip events
  let textE1 = drawCenteredText(startX - 55 + 179.5 - 5 + 120, startY - 375, "E1", 16);
  textE1.on('mouseover', (event) => showTooltip("E1", event));
  textE1.on('mouseout', hideTooltip);
  
  let textE2 = drawCenteredText(startX - 55 + 179.5 - 5 + 120, startY - 270, "E2", 16);
  textE2.on('mouseover', (event) => showTooltip("E2", event));
  textE2.on('mouseout', hideTooltip);
  
  let textE3 = drawCenteredText(startX - 55 + 179.5 - 5 + 120, startY - 160, "E3", 16);
  textE3.on('mouseover', (event) => showTooltip("E3", event));
  textE3.on('mouseout', hideTooltip);
  
  let textS = drawCenteredText(startX - 55 + 179.5 - 5 + 120, startY - 50, "S", 16);
  textS.on('mouseover', (event) => showTooltip("S", event));
  textS.on('mouseout', hideTooltip);
  
  // Tank names for feed and extract tanks
  drawCenteredText(80, canvasHeight - 35, "feed tank", 12);
  drawCenteredText(canvasWidth - 125, canvasHeight - 35, "extract tank", 12);
}

function drawCenteredText(centerX, centerY, text, fontSize = 16, fillColor = '#000', fontFamily = 'Arial', strokeColor = null, strokeWidth = 0) {
  const textElement = draw.text(text)
    .font({
      family: fontFamily,
      size: fontSize,
      anchor: 'middle',
      leading: '1em'
    })
    .move(centerX, centerY)
    .fill(fillColor);
  textElement.attr('dominant-baseline', 'middle');
  if (strokeColor && strokeWidth > 0) {
    textElement.stroke({ color: strokeColor, width: strokeWidth });
  }
  return textElement;
}

// ****************************************
// FLOW & FILLING FUNCTIONS
// ****************************************

// This function checks if any stop conditions are met.
function checkStopFlowConditions() {
  // Stop left flow if feed tank is empty.
  if (feedTankVolume <= 0 && leftWaterFlowing) {
    leftWaterFlowing = false;
    animateWaterStopForAllPipes(true, false);
  }
  // Stop right flow if solvent tank is empty.
  if (solventTankVolume <= 0 && rightWaterFlowing) {
    rightWaterFlowing = false;
    animateWaterStopForAllPipes(false, true);
  }
  // Stop all flows if either product tank is full.
  if ((extractTankVolume >= maxTankVolume || raffinateTankVolume >= maxTankVolume) &&
      (leftWaterFlowing || rightWaterFlowing)) {
    leftWaterFlowing = false;
    rightWaterFlowing = false;
    animateWaterStopForAllPipes(true, true);
  }
}

function animateWaterFlow(pipePath, delay = 0, duration = 1000, waterColor, waterWidth = 16, opacity = 0.5, side) {
  const water = draw.path(pipePath)
    .fill('none')
    .stroke({
      color: waterColor,
      opacity: opacity,
      width: waterWidth,
      linejoin: 'round'
    });
  const totalLength = water.node.getTotalLength();
  water.attr({
    'stroke-dasharray': totalLength,
    'stroke-dashoffset': totalLength
  });
  water.delay(delay).animate(duration).attr({ 'stroke-dashoffset': 0 });
  if (side) {
    water.attr('data-pipe-side', side);
  }
  pump1.front();
  pump2.front();
  return water;
}

function animateWaterFlowForAllPipes(left = false, right = false) {
  const flowRates = {
    rightPipe: 3.2,    
    rightPipe2: 3.27,  
    rightPipe3: 4.23,  
    rightPipe4: 8.08,
    leftPipe: 5.75,
    leftPipe2: 1.96,
    leftPipe3: 1.28,
    leftPipe4: 1.22
  };
  const opacities = {
    rightPipe: 0.2,    
    rightPipe2: 0.02,  
    rightPipe3: 0.13,  
    rightPipe4: 0.39,
    leftPipe: 0.52,
    leftPipe2: 0.27,
    leftPipe3: 0.09,
    leftPipe4: 0.05
  };
  const baseDuration = 800;
  const fastestFlowRate = Math.max(...Object.values(flowRates));
  const pipeSequence = {
    left: [
      { pipe: leftPipe, key: 'leftPipe' },
      { pipe: leftPipe2, key: 'leftPipe2' },
      { pipe: leftPipe3, key: 'leftPipe3' },
      { pipe: leftPipe4, key: 'leftPipe4' }
    ],
    right: [
      { pipe: rightPipe, key: 'rightPipe' },
      { pipe: rightPipe2, key: 'rightPipe2' },
      { pipe: rightPipe3, key: 'rightPipe3' },
      { pipe: rightPipe4, key: 'rightPipe4' }
    ]
  };
  let delay = 0;
  if (left) {
    pipeSequence.left.forEach(({ pipe, key }) => {
      const rate = flowRates[key];
      const opacity = opacities[key];
      const duration = Math.round((fastestFlowRate / rate) * baseDuration);
      animateWaterFlow(pipe, delay, duration, 'red', 16, opacity, 'left');
      delay += duration + 2000;
    });
    startDrainingFeed();
    setTimeout(startFillingExtract, delay);
  }
  if (right) {
    delay = 0;
    pipeSequence.right.forEach(({ pipe, key }) => {
      const rate = flowRates[key];
      const duration = Math.round((fastestFlowRate / rate) * baseDuration);
      const opacity = opacities[key];
      if (key === 'rightPipe') { 
        animateWaterFlow(pipe, delay, duration, '#c1c1ff', 16, 0.2, 'right');
      } else {
        animateWaterFlow(pipe, delay, duration, 'red', 16, opacity, 'right');
      }
      delay += duration + 2000;
    });
    startDrainingSolvent();
    setTimeout(startFillingRaffinate, delay);
  }
}

function animateWaterStopForAllPipes(left = false, right = false) {
  if (left) {
    draw.find('path')
      .filter(el => el.attr('data-pipe-side') === 'left')
      .forEach(el => el.remove());
    pump1.front();
    if (extractFillTimer) {
      clearInterval(extractFillTimer);
      extractFillTimer = null;
    }
  }
  if (right) {
    draw.find('path')
      .filter(el => el.attr('data-pipe-side') === 'right')
      .forEach(el => el.remove());
    pump2.front();
    if (raffinateFillTimer) {
      clearInterval(raffinateFillTimer);
      raffinateFillTimer = null;
    }
  }
}

// FILLING FUNCTIONS & DISPLAY UPDATES

function updateExtractTankDisplay() {
  const tankHeight = 125; 
  const surfaceWidth = 10;
  const maxHeightTank = tankHeight - 2 * surfaceWidth;
  const liquidHeight = (extractTankVolume / maxTankVolume) * maxHeightTank;
  if (extractLiquidElement) {
    extractLiquidElement.remove();
  }
  extractLiquidElement = drawLiquidRectangle(475, canvasHeight, 125, surfaceWidth, liquidHeight, 'red', 0.05);
  // Bring the liquid element to the front so it covers the pipes.
  extractLiquidElement.front();
  if (extractTankVolume >= maxTankVolume) {
    clearInterval(extractFillTimer);
    extractFillTimer = null;
  }
  checkStopFlowConditions();
}

function updateRaffinateTankDisplay() {
  const tankHeight = 125;
  const surfaceWidth = 10;
  const maxHeightTank = tankHeight - 2 * surfaceWidth;
  const liquidHeight = (raffinateTankVolume / maxTankVolume) * maxHeightTank;
  if (raffinateLiquidElement) {
    raffinateLiquidElement.remove();
  }
  raffinateLiquidElement = drawLiquidRectangle(canvasWidth - 100, canvasHeight, 125, surfaceWidth, liquidHeight, 'red', 0.39);
  // Bring the liquid element to the front.
  raffinateLiquidElement.front();
  if (raffinateTankVolume >= maxTankVolume) {
    clearInterval(raffinateFillTimer);
    raffinateFillTimer = null;
  }
  checkStopFlowConditions();
}

function updateFeedTankDisplay() {
  const tankHeight = 125; 
  const surfaceWidth = 10;
  const maxHeightTank = tankHeight - 2 * surfaceWidth;
  const liquidHeight = (feedTankVolume / maxTankVolume) * maxHeightTank;
  if (feedLiquidElement) {
    feedLiquidElement.remove();
  }
  feedLiquidElement = drawLiquidRectangle(100, canvasHeight, 125, surfaceWidth, liquidHeight, 'red', 0.52);
  // Bring the liquid element to the front.
  feedLiquidElement.front();
  if (feedTankVolume <= 0) {
    clearInterval(feedDrainTimer);
    feedDrainTimer = null;
  }
  checkStopFlowConditions();
}

function updateSolventTankDisplay() {
  const tankHeight = 125; 
  const surfaceWidth = 10;
  const maxHeightTank = tankHeight - 2 * surfaceWidth;
  const liquidHeight = (solventTankVolume / maxTankVolume) * maxHeightTank;
  if (solventLiquidElement) {
    solventLiquidElement.remove();
  }
  solventLiquidElement = drawLiquidRectangle(canvasWidth - 300, canvasHeight, 125, surfaceWidth, liquidHeight, '#c1c1ff', 0.2);
  // Bring the liquid element to the front.
  solventLiquidElement.front();
  if (solventTankVolume <= 0) {
    clearInterval(solventDrainTimer);
    solventDrainTimer = null;
  }
  checkStopFlowConditions();
}

function startFillingExtract() {
  if (extractFillTimer) clearInterval(extractFillTimer);
  extractFillTimer = setInterval(() => {
    extractTankVolume += extractFillRate * 0.1;
    if (extractTankVolume >= maxTankVolume) {
      extractTankVolume = maxTankVolume;
      clearInterval(extractFillTimer);
      extractFillTimer = null;
    }
    updateExtractTankDisplay();
  }, 100);
}

function startFillingRaffinate() {
  if (raffinateFillTimer) clearInterval(raffinateFillTimer);
  raffinateFillTimer = setInterval(() => {
    raffinateTankVolume += raffinateFillRate * 0.1;
    if (raffinateTankVolume >= maxTankVolume) {
      raffinateTankVolume = maxTankVolume;
      clearInterval(raffinateFillTimer);
      raffinateFillTimer = null;
    }
    updateRaffinateTankDisplay();
  }, 100);
}

function startDrainingFeed() {
  if (feedDrainTimer) clearInterval(feedDrainTimer);
  feedDrainTimer = setInterval(() => {
    feedTankVolume -= feedDrainRate * 0.1;
    if (feedTankVolume < 0) {
      feedTankVolume = 0;
    }
    updateFeedTankDisplay();
  }, 100);
}

function startDrainingSolvent() {
  if (solventDrainTimer) clearInterval(solventDrainTimer);
  solventDrainTimer = setInterval(() => {
    solventTankVolume -= solventDrainRate * 0.1;
    if (solventTankVolume < 0) {
      solventTankVolume = 0;
    }
    updateSolventTankDisplay();
  }, 100);
}

// PUMP SETUP & CLICK HANDLERS

let leftWaterFlowing = false;
let rightWaterFlowing = false;

function drawPumps() {
  const startX = 100;
  const startY = 450;
  drawLineBetweenPoints(draw, startX, startY - 125, startX + 60, startY - 130);
  pump1 = drawPump(startX, startY - 125, 30);
  pump1.rotate(90, startX, startY - 125);
  pump12 = createToggleWithTextRect(draw, startX + 50, startY - 150, 100, 40);
  pump12.isOn = false;
  
  const startXP2 = 700;
  drawLineBetweenPoints(draw, startXP2 - 100, startY - 10, startXP2 - 50, startY - 80);
  pump2 = drawPump(startXP2 - 100, startY - 10, 30);
  pump22 = createToggleWithTextRect(draw, startXP2 - 100, startY - 100, 100, 40);
  pump22.isOn = false;
  
  pump1.click(() => {
    isRotatedPump1 = !isRotatedPump1;
    if (isRotatedPump1) {
      pump1.animate(300).rotate(-90, startX, startY - 125);
    } else {
      pump1.animate(300).rotate(90, startX, startY - 125);
    }
    updateLeftWaterFlow();
  });
  
  pump2.click(() => {
    isRotatedPump2 = !isRotatedPump2;
    if (isRotatedPump2) {
      pump2.animate(300).rotate(90, startXP2 - 100, startY - 10);
    } else {
      pump2.animate(300).rotate(-90, startXP2 - 100, startY - 10);
    }
    updateRightWaterFlow();
  });
  
  pump12.click(() => { updateLeftWaterFlow(); });
  pump22.click(() => { updateRightWaterFlow(); });
  
  pump1.front();
  pump2.front();
}

function updateLeftWaterFlow() {
  if (isRotatedPump1 && pump12.isOn) {
    if (!leftWaterFlowing) {
      leftWaterFlowing = true;
      animateWaterFlowForAllPipes(true, false);
    }
  } else {
    if (leftWaterFlowing) {
      leftWaterFlowing = false;
      animateWaterStopForAllPipes(true, false);
    }
  }
}

function updateRightWaterFlow() {
  if (isRotatedPump2 && pump22.isOn) {
    if (!rightWaterFlowing) {
      rightWaterFlowing = true;
      animateWaterFlowForAllPipes(false, true);
    }
  } else {
    if (rightWaterFlowing) {
      rightWaterFlowing = false;
      animateWaterStopForAllPipes(false, true);
    }
  }
}

function resetAll() {
  animateWaterStopForAllPipes(true, true);
  extractTankVolume = 0;
  raffinateTankVolume = 0;
  feedTankVolume = maxTankVolume;
  solventTankVolume = maxTankVolume;
  if (extractFillTimer) {
    clearInterval(extractFillTimer);
    extractFillTimer = null;
  }
  if (raffinateFillTimer) {
    clearInterval(raffinateFillTimer);
    raffinateFillTimer = null;
  }
  if (feedDrainTimer) {
    clearInterval(feedDrainTimer);
    feedDrainTimer = null;
  }
  if (solventDrainTimer) {
    clearInterval(solventDrainTimer);
    solventDrainTimer = null;
  }
  if (extractLiquidElement) {
    extractLiquidElement.remove();
    extractLiquidElement = null;
  }
  if (raffinateLiquidElement) {
    raffinateLiquidElement.remove();
    raffinateLiquidElement = null;
  }
  if (feedLiquidElement) {
    feedLiquidElement.remove();
    feedLiquidElement = null;
  }
  if (solventLiquidElement) {
    solventLiquidElement.remove();
    solventLiquidElement = null;
  }
  isRotatedPump1 = false;
  isRotatedPump2 = false;
  updateExtractTankDisplay();
  updateRaffinateTankDisplay();
  updateFeedTankDisplay();
  updateSolventTankDisplay();
  drawCanvas();
}

document.getElementById('reset-button').addEventListener('click', resetAll);

// DRAG & ZOOM FUNCTIONALITY (with pump click disabling during pan)
let isPanning = false;
let panStart = { x: 0, y: 0 };

function addOptionToDragAndZoom() {
  draw.text("zoom with the scroll wheel")
    .move(canvasWidth / 2 - 100, 0)
    .font({ size: 16, anchor: 'left' });
  draw.text("After zooming, drag mouse to move image")
    .move(canvasWidth / 2 - 150, 15)
    .font({ size: 16, anchor: 'left' });
  const defaultViewbox = { x: 0, y: 0, width: canvasWidth, height: canvasHeight };
  draw.viewbox(defaultViewbox.x, defaultViewbox.y, defaultViewbox.width, defaultViewbox.height);
  
  const background = draw.rect(canvasWidth, canvasHeight)
    .fill({ color: '#fff', opacity: 0 });
  background.back();
  
  background.on('mousedown', function(event) {
    const vb = draw.viewbox();
    if (vb.width >= defaultViewbox.width) return;
    isPanning = true;
    panStart = { x: event.clientX, y: event.clientY };
    if (pump1) pump1.attr({ 'pointer-events': 'none' });
    if (pump2) pump2.attr({ 'pointer-events': 'none' });
  });
  
  background.on('mousemove', function(event) {
    if (!isPanning) return;
    event.preventDefault();
    const dx = event.clientX - panStart.x;
    const dy = event.clientY - panStart.y;
    const vb = draw.viewbox();
    if (vb.width < defaultViewbox.width) {
      draw.viewbox(vb.x - dx, vb.y - dy, vb.width, vb.height);
    }
    panStart = { x: event.clientX, y: event.clientY };
  });
  
  background.on('mouseup', function() {
    isPanning = false;
    if (pump1) pump1.attr({ 'pointer-events': 'all' });
    if (pump2) pump2.attr({ 'pointer-events': 'all' });
  });
  
  document.addEventListener('mouseup', () => {
    isPanning = false;
    if (pump1) pump1.attr({ 'pointer-events': 'all' });
    if (pump2) pump2.attr({ 'pointer-events': 'all' });
  });
  
  draw.on('wheel', function(event) {
    event.preventDefault();
    const zoomStep = 0.02;
    const zoomFactor = event.deltaY < 0 ? (1 - zoomStep) : (1 + zoomStep);
    const vb = draw.viewbox();
    let newWidth = vb.width * zoomFactor;
    let newHeight = vb.height * zoomFactor;
    if (newWidth >= defaultViewbox.width) {
      draw.viewbox(defaultViewbox.x, defaultViewbox.y, defaultViewbox.width, defaultViewbox.height);
      return;
    }
    const pt = draw.node.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const cursor = pt.matrixTransform(draw.node.getScreenCTM().inverse());
    let newX = cursor.x - (cursor.x - vb.x) * zoomFactor;
    let newY = cursor.y - (cursor.y - vb.y) * zoomFactor;
    newX = Math.max(0, Math.min(newX, canvasWidth - newWidth));
    newY = Math.max(0, Math.min(newY, canvasHeight - newHeight));
    draw.viewbox(newX, newY, newWidth, newHeight);
  });
}

drawCanvas();

function createToggleWithTextRect(draw, x, y, width, height) {
  const switchGroup = draw.group();
  switchGroup.isOn = false;
  const handleWidth = 5;
  const handleHeight = height * 0.8;
  const handle = switchGroup.rect(handleWidth, handleHeight)
    .fill('#aaa')
    .move(x + (width - handleWidth) / 2, y - (height) / 2);
  switchGroup.rect(width, height)
    .fill('#555')
    .radius(height / 5)
    .move(x, y);
  switchGroup.text('OFF')
    .font({ size: 12, anchor: 'middle', fill: '#fff' })
    .center(x + width * 0.25, y + height / 2);
  switchGroup.text('ON')
    .font({ size: 12, anchor: 'middle', fill: '#fff' })
    .center(x + width * 0.75, y + height / 2);
  let isOn = false;
  handle.rotate(-20, x + width / 2, y + height / 2);
  switchGroup.click(() => {
    isOn = !isOn;
    switchGroup.isOn = isOn;
    if (isOn) {
      handle.animate(200).rotate(40, x + width / 2, y + height / 2);
    } else {
      handle.animate(200).rotate(-40, x + width / 2, y + height / 2);
    }
  });
  return switchGroup;
}

function drawLineBetweenPoints(draw, x1, y1, x2, y2, color = '#000', width = 2) {
  return draw.line(x1, y1, x2, y2)
    .stroke({ color: color, width: width, linecap: 'round' });
}
