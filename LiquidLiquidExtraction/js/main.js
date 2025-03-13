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

const extractFillRate = 8.08;  // mL/s for extract tank
const raffinateFillRate = 1.22; // mL/s for raffinate tank

// Global variables to store drawn liquid elements so they can be updated.
let extractLiquidElement = null;
let raffinateLiquidElement = null;

// Global timers for filling:
let extractFillTimer = null;
let raffinateFillTimer = null;

// DRAWING FUNCTIONS

function drawCanvas() {
    draw.clear();
    drawRectangleWithThreeSquares(canvasWidth / 2, canvasHeight / 2 - 50, 150, 350);
    drawPipes();
    drawPumps();
    drawTanks();
    drawTexts();
    addOptionToDragAndZoom();
}

// Draw the four tanks (beakers).
function drawTanks() {
    drawBracket(100, canvasHeight, 125, 125, 10, 20, true, '#c1c1ff', 0.9);
    drawBracket(475, canvasHeight, 125, 125, 10, 20);
    drawBracket(canvasWidth - 100, canvasHeight, 125, 125, 10, 20);
    drawBracket(canvasWidth - 300, canvasHeight, 125, 125, 10, 20, true);
}

function drawBracket(startX, startY, width, height, surfaceWidth, holderLength, drawLiquid = false, liquidColor = '#c1c1ff', liquidColorOpacity = 0.5) {
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
    
    if (drawLiquid) {
        // Draw the liquid area (initially empty; later updated via filling functions)
        drawLiquidRectangle(startX, startY, width, surfaceWidth, height - 2 * surfaceWidth, liquidColor, liquidColorOpacity);
    }
    
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
        draw.line(leftX, tickY, leftX + tickLength, tickY).stroke({ color: '#000', width: 1 });
        if (tickVolume % 250 === 0) {
            if (tickVolume === 0) continue;
            const textLabel = draw.text(tickVolume.toString())
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

function drawLiquidRectangle(startX, startY, width, surfaceWidth, liquidHeight, fillColor = '#c1c1ff', fillOpacity = 0.5) {
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
            linejoin: 'round',
        });
    
    draw.path(pathString)
        .fill('none')
        .stroke({
            color: strokeColor,
            width: pipeWidth,
            linejoin: 'round',
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
    drawCenteredText(canvasWidth / 2 - 50, canvasHeight - 35, "extract tank", 12);
    drawCenteredText(canvasWidth / 2 + 180, canvasHeight - 35, "solvent tank", 12);
    
    let startX = 310;
    let startY = 450;
    
    drawCenteredText(startX - 55 + 179.5 - 5 + 65, startY - 320, "1", 20);
    drawCenteredText(startX - 55 + 179.5 - 5 + 65, startY - 210, "2", 20);
    drawCenteredText(startX - 55 + 179.5 - 5 + 65, startY - 100, "3", 20);
    
    drawCenteredText(startX - 55 + 179.5 - 5, startY - 270, "R1", 16);
    drawCenteredText(startX - 55 + 179.5 - 5, startY - 160, "R2", 16);
    drawCenteredText(startX - 55 + 179.5 - 5, startY - 50, "R3", 16);
    
    drawCenteredText(startX - 55 + 179.5 - 5 + 120, startY - 375, "E1", 16);
    drawCenteredText(startX - 55 + 179.5 - 5 + 120, startY - 270, "E2", 16);
    drawCenteredText(startX - 55 + 179.5 - 5 + 120, startY - 160, "E3", 16);
    
    drawCenteredText(80, canvasHeight - 35, "feed tank", 12);
    drawCenteredText(canvasWidth - 125, canvasHeight - 35, "raffinate tank", 12);
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
        textElement.stroke({
            color: strokeColor,
            width: strokeWidth
        });
    }
    
    return textElement;
}

// WATER FLOW & FILLING FUNCTIONS

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
        leftPipe: 3.2,    
        leftPipe2: 3.27,  
        leftPipe3: 4.23,  
        leftPipe4: 8.08,
        rightPipe: 5.75,
        rightPipe2: 1.96,
        rightPipe3: 1.28,
        rightPipe4: 1.22
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
    let i = 0;
    if (left) {
        pipeSequence.left.forEach(({ pipe, key }) => {
            const rate = flowRates[key];
            const duration = Math.round((fastestFlowRate / rate) * baseDuration);
            animateWaterFlow(pipe, delay, duration, '#c1c1ff', 16, 0.9 - (i * 0.4) / 3, 'left');
            i++;
            delay += duration + 2000;
        });
        setTimeout(startFillingExtract, delay);
    }
    
    if (right) {
        delay = 0;
        i = 0;
        pipeSequence.right.forEach(({ pipe, key }) => {
            const rate = flowRates[key];
            const duration = Math.round((fastestFlowRate / rate) * baseDuration);
            animateWaterFlow(pipe, delay, duration, '#c1c1ff', 16, 0.5 + (i * 0.4) / 3, 'right');
            i++;
            delay += duration + 2000;
        });
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
    console.log("Extract Tank Volume:", extractTankVolume.toFixed(1), "Liquid Height:", liquidHeight.toFixed(1));
    if (extractLiquidElement) {
        extractLiquidElement.remove();
    }
    extractLiquidElement = drawLiquidRectangle(475, canvasHeight, 125, surfaceWidth, liquidHeight, '#c1c1ff', 0.9);
    extractLiquidElement.back();
    
    if (extractTankVolume >= maxTankVolume) {
        if (extractFillTimer) {
            clearInterval(extractFillTimer);
            extractFillTimer = null;
        }
    }
}

function updateRaffinateTankDisplay() {
    const tankHeight = 125;
    const surfaceWidth = 10;
    const maxHeightTank = tankHeight - 2 * surfaceWidth;
    const liquidHeight = (raffinateTankVolume / maxTankVolume) * maxHeightTank;
    console.log("Raffinate Tank Volume:", raffinateTankVolume.toFixed(1), "Liquid Height:", liquidHeight.toFixed(1));
    if (raffinateLiquidElement) {
        raffinateLiquidElement.remove();
    }
    raffinateLiquidElement = drawLiquidRectangle(canvasWidth - 100, canvasHeight, 125, surfaceWidth, liquidHeight, '#c1c1ff', 0.9);
    raffinateLiquidElement.back();
    if (raffinateTankVolume >= maxTankVolume) {
        if (raffinateFillTimer) {
            clearInterval(raffinateFillTimer);
            raffinateFillTimer = null;
        }
    }
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

// PUMP SETUP & CLICK HANDLERS

function drawPumps() {
    const startX = 100;
    const startY = 450;
    pump1 = drawPump(startX, startY - 125, 30);
    const startXP2 = 900;
    pump2 = drawPump(startXP2, startY - 125, 30);
    
    pump1.click(() => {
        isRotatedPump1 = !isRotatedPump1;
        if (!isRotatedPump1) {
            pump1.animate(300).rotate(-90, startX, startY - 125);
            animateWaterStopForAllPipes(true, false);
        } else {
            pump1.animate(300).rotate(90, startX, startY - 125);
            animateWaterFlowForAllPipes(true, false);
        }
    });
    
    pump2.click(() => {
        isRotatedPump2 = !isRotatedPump2;
        if (!isRotatedPump2) {
            pump2.animate(300).rotate(-90, startXP2, startY - 125);
            animateWaterStopForAllPipes(false, true);
        } else {
            pump2.animate(300).rotate(90, startXP2, startY - 125);
            animateWaterFlowForAllPipes(false, true);
        }
    });
    
    pump1.front();
    pump2.front();
}

function resetAll() {
    animateWaterStopForAllPipes(true, true);
    extractTankVolume = 0;
    raffinateTankVolume = 0;
    if (extractFillTimer) {
        clearInterval(extractFillTimer);
        extractFillTimer = null;
    }
    if (raffinateFillTimer) {
        clearInterval(raffinateFillTimer);
        raffinateFillTimer = null;
    }
    if (extractLiquidElement) {
        extractLiquidElement.remove();
        extractLiquidElement = null;
    }
    if (raffinateLiquidElement) {
        raffinateLiquidElement.remove();
        raffinateLiquidElement = null;
    }
    isRotatedPump1 = false;
    isRotatedPump2 = false;
    updateExtractTankDisplay();
    updateRaffinateTankDisplay();
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
    
    // Create a transparent background that captures pan events
    const background = draw.rect(canvasWidth, canvasHeight)
        .fill({ color: '#fff', opacity: 0 });
    // Move the background to the back so pumps and other interactive elements are on top.
    background.back();
    
    background.on('mousedown', function(event) {
        const vb = draw.viewbox();
        if (vb.width >= defaultViewbox.width) return;
        isPanning = true;
        panStart = { x: event.clientX, y: event.clientY };
        // Disable pump pointer events during panning
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
        
        const zoomFactor = event.deltaY < 0 ? 0.9 : 1.1;
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

// Initialize the simulation and the drag/zoom functionality.
drawCanvas();
