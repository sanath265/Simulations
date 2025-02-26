const canvasWidth = 1000;
const canvasHeight = 600;
const draw = SVG().addTo('#svg-container').size(canvasWidth, canvasHeight);
const tableWidth = canvasWidth - 500;
const tableHeight = 20;
const legWidth = 20;
const legHeight = 80;

const tableX = (canvasWidth - tableWidth) / 2;
const tableY = canvasHeight - legHeight - tableHeight;
let pump1 = null;
let pump2 = null;
let isRotated = false;

let leftPipe = null;
let leftPipe2 = null;
let leftPipe3 = null;
let leftPipe4 = null;

let rightPipe = null;
let rightPipe2 = null;
let rightPipe3 = null;
let rightPipe4 = null;


function drawCanvas() {
    drawTable();
    drawPipes();
    drawPumps();
    drawFeedAndSolventTank();
    drawRectangleWithThreeSquares(canvasWidth / 2, canvasHeight / 2 - 100, 600, 150);
    drawBracket(tableX - 125, canvasHeight, 175, 175, 10, 20);
    drawBracket(tableX + tableWidth + 125, canvasHeight, 175, 175, 10, 20);
    drawTexts();
}

function drawTable() {
    // Draw the tabletop
    draw.rect(tableWidth, tableHeight)
    .move(tableX, tableY)
    .fill('black')
    .stroke({ color: '#000', width: 2 });
    
    // Draw the left leg
    draw.rect(legWidth, legHeight)
    .move(tableX + 40, tableY + tableHeight)
    .fill('#654321')
    .stroke({ color: '#000', width: 2 });
    
    // Draw the right leg
    draw.rect(legWidth, legHeight)
    .move(tableX + tableWidth - 60, tableY + tableHeight)
    .fill('#654321')
    .stroke({ color: '#000', width: 2 });
}

function drawFeedAndSolventTank() {
    drawBracket(tableX + 125 / 2, tableY, 125, 125, 10, 20, true);
    drawBracket(tableX + tableWidth - 125 / 2, tableY, 125, 125, 10, 20, true);
}


drawCanvas();


function drawBracket(startX, startY, width, height, surfaceWidth, holderLength, drawLiquid = false) {
    const d = holderLength / Math.sqrt(2);
    
    const P0 = { x: startX, y: startY };
    const P1 = { x: startX - width / 2, y: startY };
    const P2 = { x: P1.x, y: startY - height };
    const P3 = { x: P2.x - d, y: P2.y - d };
    const P4 = { x: P3.x + surfaceWidth, y: P3.y - surfaceWidth};
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
    
    const points = [
        P0,
        P1,
        P2,
        P3,
        P4,
        P5,
        P6,
        P7,
        Q6,
        Q5,
        Q4,
        Q3,
        Q2,
        Q1,
        P0
    ];
    
    const pointString = points.map(pt => `${pt.x},${pt.y}`).join(" ");
    
    draw.polyline(pointString)
    .fill('#e6e6e6')
    .stroke({ color: '#898989', width: 2 });
    
    if (drawLiquid) {
        drawLiquidRectangle(startX, startY, width, surfaceWidth, height - 2 * surfaceWidth);
    }
}


function drawRectangleWithThreeSquares(centerX, centerY, rectWidth, rectHeight) {
    const startX = centerX - rectWidth / 2;
    let startY = centerY - rectHeight / 2;
    
    draw.rect(rectWidth, rectHeight)
    .move(startX, startY)
    .fill('none')
    .stroke({ color: '#000', width: 2 });
    
    const squareSize = rectHeight - 20;
    
    const gap = (rectWidth - 3 * squareSize) / 4;
    
    startY = centerY - squareSize / 2;
    for (let i = 0; i < 3; i++) {
        const xPos = startX + gap + i * (squareSize + gap);
        const yPos = startY;
        
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
    
    draw.path(pathString)
    .fill({ color: fillColor, opacity: fillOpacity })
}

function drawPipes() {
    let startX = 310;
    let startY = 450;
    
    // Left pipe segments (pipe outline)
    leftPipe  = `
      M ${startX} ${startY} 
      L ${startX} ${startY - 125} 
      L ${startX - 125} ${startY - 125} 
      L ${startX - 125} ${startY - 225} 
      L ${startX - 58} ${startY - 225}
    `;
    drawPipeWithCurves(leftPipe);
    
    leftPipe2 = `
      M ${startX - 55 + 128} ${startY - 225} 
      L ${startX - 55 + 179.5} ${startY - 225} 
    `;
    drawPipeWithCurves(leftPipe2);
    
    leftPipe3 = `
      M ${startX - 55 + 179 + 132} ${startY - 225} 
      L ${startX - 55 + 179 + 183} ${startY - 225} 
    `;
    drawPipeWithCurves(leftPipe3);
    
    leftPipe4 = `
      M ${startX - 55 + 179 + 183 + 131} ${startY - 225}
      L ${startX - 55 + 179 + 183 + 132 + 125} ${startY - 225}
      L ${startX - 55 + 179 + 183 + 132 + 125} ${startY + 100} 
    `;
    drawPipeWithCurves(leftPipe4);
    
    // Right pipe segments (pipe outline)
    startX = 690;
    rightPipe = `
      M ${startX} ${startY} 
      L ${startX} ${startY - 125} 
      L ${startX + 125} ${startY - 125} 
      L ${startX + 125} ${startY - 275} 
      L ${startX + 58} ${startY - 275}
    `;
    drawPipeWithCurves(rightPipe);
    
    rightPipe2 = `
      M ${startX + 58 - 131} ${startY - 275}
      L ${startX + 58 - 182.5} ${startY - 275}
    `;
    drawPipeWithCurves(rightPipe2);
    
    rightPipe3 = `
      M ${startX + 58 - 182.5 - 131} ${startY - 275}
      L ${startX + 58 - 182.5 - 182.5} ${startY - 275}
    `;
    drawPipeWithCurves(rightPipe3);
    
    rightPipe4 = `
      M ${startX + 58 - 182.5 - 182.5 - 131} ${startY - 275}
      L ${startX + 58 - 182.5 - 182.5 - 131 - 125} ${startY - 275}
      L ${startX + 58 - 182.5 - 182.5 - 131 - 125} ${startY + 100}
    `;
    drawPipeWithCurves(rightPipe4);
}

function animateWaterFlow(pipePath, delay = 0, duration = 1000, waterColor, waterWidth = 16) {
    // Create the water path (it will overlay the pipe outline).
    const water = draw.path(pipePath)
    .fill('none')
    .stroke({
        color: waterColor,
        opacity: 0.5,
        width: waterWidth,
        linejoin: 'round'
    });
    
    // Get the total length of the path so we can animate its dash.
    const totalLength = water.node.getTotalLength();
    
    // Set up the dash so that the entire path is hidden.
    water.attr({
        'stroke-dasharray': totalLength,
        'stroke-dashoffset': totalLength
    });
    
    // Delay the start as needed, then animate the dash offset from full length to 0.
    water.delay(delay).animate(duration).attr({ 'stroke-dashoffset': 0 });

    // Ensure pumps remain on top
    pump1.front();
    pump2.front();
}

// Function to animate water flow in all pipes.
function animateWaterFlowForAllPipes() {
    let delay = 0;
    const leftSegments = [leftPipe, leftPipe2, leftPipe3, leftPipe4];
    leftSegments.forEach(segment => {
        animateWaterFlow(segment, delay, 1000, '#c1c1ff', 16);
        delay += 1100;
    });
    
    delay = 0;
    const rightSegments = [rightPipe, rightPipe2, rightPipe3, rightPipe4];
    rightSegments.forEach(segment => {
        animateWaterFlow(segment, delay, 1000, '#c1c1ff', 16);
        delay += 1100;
    });
}

// Function to completely remove water animations from all pipes.
function animateWaterStopForAllPipes() {
    draw.find('path').filter(el => el.stroke() === '#c1c1ff').forEach(el => el.remove());

    // Ensure pumps remain on top
    pump1.front();
    pump2.front();
}


function drawTexts() {
    drawCenteredText(tableX + 50 / 2, tableY - 35, "feed tank");
    drawCenteredText(tableX + tableWidth - 215 / 2, tableY - 35, "solvent tank");
    
    let startX = 310;
    let startY = 450;
    drawCenteredText(startX - 55 + 115 / 2, startY - 270, "1", 20);
    drawCenteredText(startX - 55 + 179.5 + 115 / 2, startY - 270, "2", 20);
    drawCenteredText(startX - 55 + 179 + 183 + 115 / 2, startY - 270, "3", 20);
    
    drawCenteredText(startX - 55 + 179.5 - 35, startY - 215, "R1", 16);
    drawCenteredText(startX - 55 + 179 + 183 - 35, startY - 215, "R2", 16);
    drawCenteredText(startX - 55 + 179 + 183 + 131 + 20, startY - 215, "R3", 16);
    
    drawCenteredText(startX - 55 - 35, startY - 315, "E1", 16);
    drawCenteredText(startX - 55 + 179.5 - 35, startY - 315, "E2", 16);
    drawCenteredText(startX - 55 + 179 + 183 - 35, startY - 315, "E3", 16);
    
    drawCenteredText(startX - 55 + 179 + 183 - 35, startY - 315, "E3", 16);
    drawCenteredText(startX - 55 + 179 + 183 - 35, startY - 315, "E3", 16);
    
    drawBracket(tableX - 125, canvasHeight, 175, 175, 10, 20);
    drawBracket(tableX + tableWidth + 125, canvasHeight, 175, 175, 10, 20);
    
    drawCenteredText(75, canvasHeight - 35, "extract tank", 16);
    drawCenteredText(canvasWidth - 175, canvasHeight - 35, "raffinate tank", 16);
}

function drawPumps() {
    const startX = 310;
    const startY = 450;
    pump1 = drawPump(startX - 75, startY - 125, 30);
    const startXP2 = 690;
    pump2 = drawPump(startXP2 + 75, startY - 125, 30);

    pump1.click(() => {
        isRotated = !isRotated;
        if (!isRotated) {
            pump1.animate(300).rotate(-90, startX - 75, startY - 125);
            pump2.animate(300).rotate(-90, startXP2 + 75, startY - 125);
            animateWaterStopForAllPipes();
        } else {
            pump1.animate(300).rotate(90, startX - 75, startY - 125);
            pump2.animate(300).rotate(90, startXP2 + 75, startY - 125);
            animateWaterFlowForAllPipes();
        }
    });

    pump1.front();
    pump2.front();
}
function drawPipeWithCurves(pathString, pipeWidth = 15, strokeColor = '#f7f7f7', outlineColor = '#d5d5d5') {
    const curveRadius = 25;
    const c = curveRadius * 0.552;
    
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

function drawPump(valveCenterX, valveCenterY, radius) {
    // Draw the circle (pump body)
    const valveGroup = draw.group();
    valveGroup.circle(40)
    .fill('#b4b4ff')
    .stroke({ color: 'black', width: 2 })
    .center(valveCenterX, valveCenterY)
    .front();
    const valve = valveGroup.rect(10, 44)
    .fill('#c8c8ff')
    .stroke({ color: 'black', width: 2, linecap: 'round' })
    .center(valveCenterX, valveCenterY)
    .front();
    return valveGroup;
}

function drawCenteredText(centerX,
    centerY, 
    text,
    fontSize = 16,
    fillColor = '#000', 
    fontFamily = 'Arial',
    strokeColor = null,
    strokeWidth = 0) {
        
        const textElement = draw.text(text)
        .font({
            family: fontFamily,
            size: fontSize,
            anchor: 'middle',
            leading: '1em'
        })
        .move(centerX, centerY)
        .fill(fillColor);
        
        // Vertical centering adjustment
        textElement.attr('dominant-baseline', 'middle');
        
        // Add stroke if specified
        if(strokeColor && strokeWidth > 0) {
            textElement.stroke({
                color: strokeColor,
                width: strokeWidth
            });
        }
        
        return textElement;
    }
    