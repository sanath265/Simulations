// Global Canvas Setup
import { yCO2_out } from "./calc.js";

// This is an example for how to use the yCO2_out function.
// You can expect CO2 to start passing through after about 60 seconds
// and total adsorption to be reached after about 6 minutes.
(function example() {
  const y = 0.1; // mole fraction CO2 = 10%
  const P = 5; // pressure = 5 bar
  const T = 298; // temperature = 298 K
  const tStep = 0.1; // time step in seconds
  const m = 0.001; // mass flow rate of gas in g / s

  let t = 0;

  setInterval(() => {
    const outlet = yCO2_out({ t, tStep, m, P, T, yCO2: y });
    t = Math.round((t + tStep) * 100) / 100;

    if (t % 1 === 0) {
      console.log(`At time ${t}s, the outlet mole fraction of CO2 is ${outlet.toFixed(4)}`);
    }
  }, 1000 * tStep);
})();

// Size to fit the window
let windowWidth = window.innerWidth - 60;
let windowHeight = windowWidth * 600 / 1000;

const draw = SVG().addTo('#svg-container').size(windowWidth, windowHeight);

const canvasWidth = 1000;
const canvasHeight = 600;

// Change the viewport to 1000 x 600
document.getElementsByTagName('svg')[0].setAttribute('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);

// Resize the canvas width and height when the window is resized
window.addEventListener('resize', function() {
  let windowWidth = window.innerWidth - 60;
  let windowHeight = windowWidth * 600 / 1000;
  draw.size(windowWidth, windowHeight);
});

let pipeGroup = draw.group();

// ----------------------------
// Existing Global Dimensions
// ----------------------------
const mainCylWidth = 60;
const mainCylHeight = 250;
const nozzleRect1Width = 30;
const nozzleRect1Height = 12;
const nozzleRect2Width = 15;
const nozzleRect2Height = 20;
const nozzleRect3Width = 30;
const nozzleRect3Height = 12;

const gaugeSize = 30;
const gaugeStrokeWidth = 4;

const hexCircleSize = 30;
const hexSize = 12;
const hexInnerCircleSize = 10;

const connectedGaugeSize = 50;
const connectedGaugeSeparation = 0;
const connectedGaugeVerticalOffset = 30;

const valveBlockWidth = 20;
const valveBlockHeight = 40;
const valveBodyWidth = 60;
const valveBodyHeight = 40;
const valveStemWidth = 10;
const valveStemHeight = 20;
const valveTrapezoidHeight = 15;
const valveBottomWidth = 20;
const valveTopWidth = 30;

const verticalValveBlockWidth = 15;
const verticalValveBlockHeight = 7.5;
const verticalValveBodyWidth = 15;
const verticalValveBodyHeight = 20;
const verticalValveStemWidth = 5;
const verticalValveStemHeight = 10;
const verticalValveTrapezoidWidth = 5;
const verticalValveTopExtent = 15;

const interactiveValveRadius = 25;
const interactiveValveMarkerOffset = 3;
const interactiveValvePointerOffset = 5;

const tanksMarginX = 35;
const tanksGap = 40;

const pressureGaugeOffset = 150;

const valveOnGaugesGaugeOffset = 135;
const valveOnGaugesGapBetween = 20;
const valveOnGaugesValveWidth = 20;
const valveOnGaugesValveTotalHeight = 50;

const pipeWidth = 5;
const pipeStrokeColor = '#f7f7f7';
const pipeOutlineColor = '#d5d5d5';

// ----------------------------
// NEW: Transmitter Dimensions
// ----------------------------
const transmitterBodyWidth = 80; // Dark upper body width
const transmitterBodyHeight = 60; // Dark upper body height
const transmitterScreenMargin = 5; // Margin for the tan screen
const transmitterScreenHeight = 25; // Height of the tan screen
const transmitterBottomBlockHeight = 40; // Gray bottom block
const transmitterConnectorWidth = 12; // Left/right connectors
const transmitterConnectorHeight = 40;

// ----------------------------
// Component Functions
// ----------------------------

function createNozzle(group, x, y) {
  // First rectangle
  group.rect(nozzleRect1Width, nozzleRect1Height)
    .fill('#ebebeb')
    .stroke({ color: '#444', width: 1 })
    .move(x, y);
  // Second rectangle
  const secondRectX = x + (nozzleRect1Width - nozzleRect2Width) / 2;
  group.rect(nozzleRect2Width, nozzleRect2Height)
    .fill('#c69c6d')
    .stroke({ color: '#444', width: 1 })
    .move(secondRectX, y - nozzleRect2Height);
  // Third rectangle with rounded corners
  group.rect(nozzleRect3Width, nozzleRect3Height)
    .fill('#ebebeb')
    .radius(4)
    .stroke({ color: '#444', width: 1 })
    .move(x, y - nozzleRect2Height - nozzleRect3Height);
}

function createGasCylinder(x, y, label) {
  const group = draw.group();

  // Create gradient for cylinder body
  const cylinderGradient = draw.gradient('linear', function(add) {
    add.stop(0, '#a3a3a3');
    add.stop(0.5, '#666666');
    add.stop(1, '#a3a3a3');
  });
  cylinderGradient.from(0, 0).to(1, 0);

  group.path(`
    M ${x} ${y + 20}
    L ${x} ${y + mainCylHeight - 20}
    Q ${x} ${y + mainCylHeight} ${x + 20} ${y + mainCylHeight}
    L ${x + mainCylWidth - 20} ${y + mainCylHeight}
    Q ${x + mainCylWidth} ${y + mainCylHeight} ${x + mainCylWidth} ${y + mainCylHeight - 20}
    L ${x + mainCylWidth} ${y + 20}
    Q ${x + mainCylWidth} ${y} ${x + mainCylWidth - 20} ${y}
    L ${x + 20} ${y}
    Q ${x} ${y} ${x} ${y + 20}
    Z
  `)
    .fill(cylinderGradient)
    .stroke({ color: '#444', width: 1 });

  // Add nozzle (centered horizontally)
  const nozzleX = x + (mainCylWidth - nozzleRect3Width) / 2;
  createNozzle(group, nozzleX, y - 12);

  // Add vertical label on cylinder
  group.text(function(add) {
      add.tspan(label).dx(x + mainCylWidth / 2).dy(y + mainCylHeight / 2);
    })
    .font({
      family: 'Arial',
      size: 20,
      anchor: 'middle',
      weight: 'bold'
    })
    .fill('white')
    .transform({ rotate: -90, cx: x + mainCylWidth / 2, cy: y + mainCylHeight / 2 });

  return group;
}

function createPressureGaugeView(x, y) {
  const group = draw.group();

  group.circle(gaugeSize)
    .fill('white')
    .stroke({ color: '#888', width: gaugeStrokeWidth })
    .center(x, y);

  const radius = (gaugeSize / 2) - gaugeStrokeWidth - 2;
  const startAngle = 220;
  const endAngle = -40;
  const startRad = startAngle * Math.PI / 180;
  const endRad = endAngle * Math.PI / 180;
  const startX = x + radius * Math.cos(startRad);
  const startY = y + radius * Math.sin(startRad);
  const endX = x + radius * Math.cos(endRad);
  const endY = y + radius * Math.sin(endRad);
  const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 1 0 ${endX} ${endY}`;

  group.path(arcPath)
    .fill('none')
    .stroke({ color: 'black', width: 2 });

  const needleLength = radius - 2;
  const needleWidth = 4;
  group.path(`M ${x} ${y} 
              L ${x - needleWidth/2} ${y} 
              L ${x} ${y - needleLength}
              L ${x + needleWidth/2} ${y} Z`)
    .fill('black')
    .transform({ rotate: 45, cx: x, cy: y });

  return group;
}

function createHexagonalView(x, y) {
  const group = draw.group();

  group.circle(hexCircleSize)
    .fill('white')
    .stroke({ color: '#888', width: 4 })
    .center(x, y);

  const height = hexSize * Math.sqrt(3);
  const hexagonPath = `
    M ${x - hexSize} ${y}
    L ${x - hexSize/2} ${y - height/2}
    L ${x + hexSize/2} ${y - height/2}
    L ${x + hexSize} ${y}
    L ${x + hexSize/2} ${y + height/2}
    L ${x - hexSize/2} ${y + height/2}
    Z
  `;
  group.path(hexagonPath)
    .fill('black')
    .stroke({ color: 'black', width: 1 });

  group.circle(hexInnerCircleSize)
    .fill('white')
    .center(x, y);

  return group;
}

function createConnectedGauges(x, y) {
  const group = draw.group();

  const leftGaugeX = x;
  const rightGaugeX = x + connectedGaugeSize;
  const hexagonX = x + connectedGaugeSize / 2;
  const hexagonY = y + connectedGaugeVerticalOffset;

  createPressureGaugeView(leftGaugeX, y);
  createPressureGaugeView(rightGaugeX, y);
  createHexagonalView(hexagonX, hexagonY);

  group.line(hexagonX, hexagonY, leftGaugeX, y)
    .stroke({ color: '#666', width: 4 });
  group.line(hexagonX, hexagonY, rightGaugeX, y)
    .stroke({ color: '#666', width: 4 });

  return group;
}

function createValve(x, y) {
  const group = draw.group();

  group.rect(valveBlockWidth, valveBlockHeight)
    .fill('#ccc')
    .stroke({ color: '#444', width: 1 })
    .move(x, y);

  group.rect(valveBodyWidth, valveBodyHeight)
    .fill('#ddd')
    .stroke({ color: '#444', width: 1 })
    .radius(6)
    .move(x + valveBlockWidth, y);

  group.rect(valveBlockWidth, valveBlockHeight)
    .fill('#ccc')
    .stroke({ color: '#444', width: 1 })
    .move(x + valveBlockWidth + valveBodyWidth, y);

  const stemX = x + valveBlockWidth + (valveBodyWidth - valveStemWidth) / 2;
  const stemY = y - valveStemHeight;
  group.rect(valveStemWidth, valveStemHeight)
    .fill('#000')
    .move(stemX, stemY);

  const bottomLeftX = stemX - (valveBottomWidth - valveStemWidth) / 2;
  const bottomRightX = bottomLeftX + valveBottomWidth;
  const topLeftX = bottomLeftX + (valveBottomWidth - valveTopWidth) / 2;
  const topRightX = topLeftX + valveTopWidth;
  const topY = stemY - valveTrapezoidHeight;
  group.path(`
    M ${bottomLeftX} ${stemY}
    L ${topLeftX} ${topY}
    L ${topRightX} ${topY}
    L ${bottomRightX} ${stemY}
    Z
  `)
    .fill('#000')
    .stroke({ color: '#444', width: 1 });

  return group;
}

function createVerticalValve(x, y) {
  const group = draw.group();

  group.rect(verticalValveBlockWidth, verticalValveBlockHeight)
    .fill('#ccc')
    .stroke({ color: '#444', width: 1 })
    .move(x, y);

  group.rect(verticalValveBodyWidth, verticalValveBodyHeight)
    .fill('#ddd')
    .stroke({ color: '#444', width: 1 })
    .radius(6)
    .move(x, y + verticalValveBlockHeight);

  group.rect(verticalValveBlockWidth, verticalValveBlockHeight)
    .fill('#ccc')
    .stroke({ color: '#444', width: 1 })
    .move(x, y + verticalValveBlockHeight + verticalValveBodyHeight);

  const stemX = x - verticalValveStemWidth;
  const stemY = y + verticalValveBlockHeight + (verticalValveBodyHeight - verticalValveStemHeight) / 2;
  group.rect(verticalValveStemWidth, verticalValveStemHeight)
    .fill('#000')
    .move(stemX, stemY);

  const extra = (verticalValveTopExtent - verticalValveStemHeight) / 2;
  group.path(`
    M ${stemX} ${stemY} 
    L ${stemX - verticalValveTrapezoidWidth} ${stemY - extra} 
    L ${stemX - verticalValveTrapezoidWidth} ${stemY + verticalValveStemHeight + extra} 
    L ${stemX} ${stemY + verticalValveStemHeight} 
    Z
  `)
    .fill('#000')
    .stroke({ color: '#444', width: 1 });

  return group;
}

function createInteractiveValve(x, y, controller = true, isThreeValve = false) {
  const group = draw.group();
  const radius = interactiveValveRadius;

  // Define initial entry positions (in degrees)
  let entryAngles = [0, 90, 180, 270];

  // Draw markers for each entry.
  entryAngles.forEach(angle => {
    const rad = angle * Math.PI / 180;
    const markerDistance = radius + interactiveValveMarkerOffset;
    const markerX = x + markerDistance * Math.cos(rad);
    const markerY = y + markerDistance * Math.sin(rad);
    if (angle === 90) {
      if (!isThreeValve) {
        group.rect(20, 10).fill('black').center(markerX, markerY);
      }
    } else if (angle === 270) {
      group.rect(20, 10).fill('gray').center(markerX, markerY);
    } else {
      group.rect(10, 20).fill('black').center(markerX, markerY);
    }
  });

  // Draw valve circle (outer and inner)
  group.circle(radius * 2)
    .fill('#b4b4ff')
    .stroke({ color: '#444', width: 2 })
    .center(x, y);
  group.circle(radius)
    .fill('white')
    .stroke({ color: '#444', width: 2 })
    .center(x, y);

  if (controller) {
    // Create pointer group.
    const pointerGroup = group.group();
    const pointerLength = radius - interactiveValvePointerOffset;
    pointerGroup.polygon(`${pointerLength},0 0,-5 0,5`)
      .fill('red')
      .stroke({ color: '#444', width: 1 });
    pointerGroup.center(x, y);

    let currentAngleIndex = 0;
    pointerGroup.rotate(entryAngles[currentAngleIndex], x, y);

    // Redefine allowed angles (example: [180, 90, 90])
    entryAngles = [180, 90, 90];
    group.on('click', function() {
      currentAngleIndex = (currentAngleIndex + 1) % entryAngles.length;
      const targetAngle = entryAngles[currentAngleIndex];
      pointerGroup.animate(300).rotate(targetAngle, x, y);
    });
  }

  return group;
}

// ----------------------------
// NEW: Components with Labels
// ----------------------------

// Back Pressure Regulator (T-Valve) with Label
function createTValveFromImage(x, y) {
  const scale = 0.6;
  const group = draw.group(); // Work in group-local coordinates

  // --- Scaled Dimensions ---
  const sideKnobWidth = 20 * scale;
  const bodyX = sideKnobWidth;
  const bodyY = 20 * scale;
  const bodyWidth = 80 * scale;
  const bodyHeight = 30 * scale;

  // --- Red Gradient for the Body ---
  const redGradient = draw.gradient('linear', function(add) {
    add.stop(0, '#dd5555');
    add.stop(1, '#bb2222');
  });
  redGradient.from(0, 0).to(0, 1);

  // --- Main Horizontal Body ---
  group.rect(bodyWidth, bodyHeight)
    .fill(redGradient)
    .stroke({ color: '#444', width: 1 })
    .radius(15 * scale)
    .move(bodyX, bodyY);

  // Optional: Center logo circle on the main body
  const centerCircleDiameter = 10 * scale;
  group.circle(centerCircleDiameter)
    .fill('none')
    .stroke({ color: '#444', width: 1 })
    .center(bodyX + bodyWidth / 2, bodyY + bodyHeight / 2);

  // --- Top Port (Red Stub) ---
  const topPortWidth = 14 * scale;
  const topPortHeight = 15 * scale;
  group.rect(topPortWidth, topPortHeight)
    .fill(redGradient)
    .stroke({ color: '#444', width: 1 })
    .radius(topPortWidth / 2)
    .move(bodyX + (bodyWidth - topPortWidth) / 2, bodyY - topPortHeight);

  // --- Top Black Knob ---
  const knobWidth = 12 * scale;
  const knobHeight = 20 * scale;
  group.rect(knobWidth, knobHeight)
    .fill('#000')
    .stroke({ color: '#444', width: 1 })
    .radius(3 * scale)
    .move(bodyX + (bodyWidth - knobWidth) / 2, bodyY - topPortHeight - knobHeight);

  // Optional: Threaded rod under the knob
  const threadedRodWidth = 6 * scale;
  const threadedRodHeight = 8 * scale;
  group.rect(threadedRodWidth, threadedRodHeight)
    .fill('#000')
    .move(bodyX + (bodyWidth - threadedRodWidth) / 2, bodyY - topPortHeight - threadedRodHeight);

  // --- Left Side Port and Knob ---
  const sidePortWidth = 10 * scale;
  const sidePortHeight = 20 * scale;
  // Left port stub (forcing its x to 10)
  group.rect(sidePortWidth, sidePortHeight)
    .fill(redGradient)
    .stroke({ color: '#444', width: 1 })
    .radius(5 * scale)
    .move(10, bodyY + (bodyHeight - sidePortHeight) / 2);
  // Left black knob attached to the port (shifted to remove any gap)
  group.rect(sideKnobWidth, sideKnobWidth)
    .fill('#000')
    .stroke({ color: '#444', width: 1 })
    .radius(5 * scale)
    .move(10 - sideKnobWidth, bodyY + (bodyHeight - sideKnobWidth) / 2);

  // --- Right Side Port and Knob ---
  group.rect(sidePortWidth, sidePortHeight)
    .fill(redGradient)
    .stroke({ color: '#444', width: 1 })
    .radius(5 * scale)
    .move(bodyX + bodyWidth, bodyY + (bodyHeight - sidePortHeight) / 2);
  group.rect(sideKnobWidth, sideKnobWidth)
    .fill('#000')
    .stroke({ color: '#444', width: 1 })
    .radius(5 * scale)
    .move(bodyX + bodyWidth + sidePortWidth, bodyY + (bodyHeight - sideKnobWidth) / 2);

  // --- Label for Back Pressure Regulator ---
  group.text("Back Pressure Regulator")
    .font({ family: 'Arial', size: 12, anchor: 'middle' })
    .fill('#000')
    .center(bodyX + bodyWidth / 2, bodyY + bodyHeight + 10);

  // --- Finally, position the entire group at (x, y) ---
  group.move(x, y);
  return group;
}

// Mass Flow Controller with Label
function createMassFlowController(x, y) {
  const group = draw.group();

  // Dimensions / Settings
  const topWidth = 60;
  const topHeight = 80;
  const topCornerRadius = 5;

  const screenMargin = 5;
  const screenHeight = 25;
  const screenCornerRadius = 4;

  const buttonSize = 8;
  const buttonsYoffset = 10;

  const rectWidth = 20;
  const rectHeight = 14;

  const bottomHeight = 20;

  // Dark Gray Top Section
  group.rect(topWidth, topHeight)
    .fill('#4a4a4a')
    .stroke({ color: '#000', width: 1 })
    .radius(topCornerRadius)
    .move(x, y);

  // Tan Screen
  group.rect(topWidth - screenMargin * 2, screenHeight)
    .fill('#c69c6d')
    .stroke({ color: '#000', width: 1 })
    .radius(screenCornerRadius)
    .move(x + screenMargin, y + screenMargin);

  // Triangular Buttons and Black Rectangle
  const buttonsY = y + screenMargin + screenHeight + buttonsYoffset;

  // Down Triangle
  group.path(`
    M ${x + 10} ${buttonsY} 
    L ${x + 5}  ${buttonsY - buttonSize} 
    L ${x + 15} ${buttonsY - buttonSize} Z
  `)
    .fill('#00b7bd')
    .stroke({ color: '#000', width: 1 });

  // Up Triangle
  group.path(`
    M ${x + 25} ${buttonsY - buttonSize} 
    L ${x + 20} ${buttonsY} 
    L ${x + 30} ${buttonsY} Z
  `)
    .fill('#00b7bd')
    .stroke({ color: '#000', width: 1 });

  // Black Rectangle
  const rectX = x + 35;
  const rectY = buttonsY - buttonSize;
  group.rect(rectWidth, rectHeight)
    .fill('#000')
    .stroke({ color: '#000', width: 1 })
    .move(rectX, rectY);

  // Bottom Light Gray Section
  group.rect(topWidth, bottomHeight)
    .fill('#ccc')
    .stroke({ color: '#444', width: 1 })
    .move(x, y + topHeight);

  // --- Label for Mass Flow Controller ---
  group.text("Mass Flow Controller")
    .font({ family: 'Arial', size: 14, anchor: 'middle', weight: 'bold' })
    .fill('#000')
    .center(x + topWidth / 2, y + topHeight + bottomHeight + 15);

  return group;
}

// ----------------------------
// Pipe and Layout Functions
// ----------------------------
function drawPipeWithCurves(pathString, pipeW = pipeWidth, strokeC = pipeStrokeColor, outlineC = pipeOutlineColor) {
  let outline = draw.path(pathString)
    .fill('none')
    .stroke({
      color: outlineC,
      width: pipeW + 4,
      linejoin: 'round'
    });
  pipeGroup.add(outline);
  let pipe = draw.path(pathString)
    .fill('none')
    .stroke({
      color: strokeC,
      width: pipeW,
      linejoin: 'round'
    });
  pipeGroup.add(pipe);
}

function drawPipes() {
  // Example pipe path for Tank 1
  let startX = 62.5;
  let startY = canvasHeight - mainCylHeight - 42.5;
  const tank1PipePath1 = `
    M ${startX} ${startY} 
    L ${startX} ${startY - 17.5}
  `;
  drawPipeWithCurves(tank1PipePath1);

  const tank1PipePath2 = `
    M ${startX} ${startY - 53}
    L ${startX} ${startY - 63}
  `;
  drawPipeWithCurves(tank1PipePath2);

  const tank1PipePath3 = `
    M ${startX} ${startY - 92.5}
    L ${startX} ${startY - 130}
  `;
  drawPipeWithCurves(tank1PipePath3);

  const tank1PipePath4 = `
    M ${startX} ${startY - 162.5}
    L ${startX} ${startY - 207.5}
    L ${startX + 100} ${startY - 207.5}
  `;
  drawPipeWithCurves(tank1PipePath4);

  // Tank 2
  startX = 62.5 + mainCylWidth + tanksGap;
  startY = canvasHeight - mainCylHeight - 42.5;
  const tank2PipePath1 = `
    M ${startX} ${startY} 
    L ${startX} ${startY - 17.5}
  `;
  drawPipeWithCurves(tank2PipePath1);

  const tank2PipePath2 = `
    M ${startX} ${startY - 53}
    L ${startX} ${startY - 63}
  `;
  drawPipeWithCurves(tank2PipePath2);

  const tank2PipePath3 = `
    M ${startX} ${startY - 92.5}
    L ${startX} ${startY - 130}
  `;
  drawPipeWithCurves(tank2PipePath3);

  const tank2PipePath4 = `
    M ${startX} ${startY - 162.5}
    L ${startX} ${startY - 175}
  `;
  drawPipeWithCurves(tank2PipePath4);

  // Tank 3
  startX = 62.5 + 2 * mainCylWidth + 2 * tanksGap;
  startY = canvasHeight - mainCylHeight - 42.5;
  const tank3PipePath1 = `
    M ${startX} ${startY} 
    L ${startX} ${startY - 17.5}
  `;
  drawPipeWithCurves(tank3PipePath1);

  const tank3PipePath2 = `
    M ${startX} ${startY - 53}
    L ${startX} ${startY - 63}
  `;
  drawPipeWithCurves(tank3PipePath2);

  const tank3PipePath3 = `
    M ${startX} ${startY - 92.5}
    L ${startX} ${startY - 130}
  `;
  drawPipeWithCurves(tank3PipePath3);

  const tank3PipePath4 = `
    M ${startX} ${startY - 162.5}
    L ${startX} ${startY - 207.5}
    L ${startX - 100} ${startY - 207.5}
  `;
  drawPipeWithCurves(tank3PipePath4);

  // MFC Inlet and Outlet Paths and further connections (as per your design)
  startX = 62.5 + mainCylWidth + tanksGap;
  startY = canvasHeight - mainCylHeight - 42.5 - 240;

  const MFCInletPath = `
    M ${startX} ${startY}
    L ${startX} ${startY - 10}
    L ${startX + 150} ${startY - 10}
    L ${startX + 150} ${startY + 20}
    L ${startX + 187.5} ${startY + 20}
  `;
  drawPipeWithCurves(MFCInletPath);

  const MFCOutletPath = `
    M ${startX + 187.5 + 60} ${startY + 20}
    L ${startX + 187.5 + 60 + 32.5} ${startY + 20}
  `;
  drawPipeWithCurves(MFCOutletPath);

  const AdsorptionBedInletPath = `
    M ${startX + 187.5 + 60 + 32.5 + 65} ${startY + 20}
    L ${startX + 187.5 + 60 + 32.5 + 65 + 92.5} ${startY + 20}
    L ${startX + 187.5 + 60 + 32.5 + 65 + 92.5} ${startY + 20 + 62.5}
  `;
  drawPipeWithCurves(AdsorptionBedInletPath);

  const MFCValveOutletPath = `
    M ${startX + 187.5 + 60 + 32.5 + 32.5} ${startY + 52.5}
    L ${startX + 187.5 + 60 + 32.5 + 32.5} ${startY + 332.5}
    L ${startX + 187.5 + 60 + 32.5 + 32.5 + 95} ${startY + 332.5}
  `;
  drawPipeWithCurves(MFCValveOutletPath);

  const AdsorptionBedOutletPath = `
    M ${startX + 187.5 + 60 + 32.5 + 65 + 92.5} ${startY + 20 + 62.5 + 200}
    L ${startX + 187.5 + 60 + 32.5 + 65 + 92.5} ${startY + 20 + 62.5 + 200 + 17.5}
  `;
  drawPipeWithCurves(AdsorptionBedOutletPath);

  const AdsorptionBedValveOutletPath = `
    M ${startX + 187.5 + 60 + 32.5 + 32.5 + 95 + 62.5} ${startY + 332.5}
    L ${startX + 187.5 + 60 + 32.5 + 32.5 + 95 + 62.5 + 17.5} ${startY + 332.5}
  `;
  drawPipeWithCurves(AdsorptionBedValveOutletPath);

  const BPGValveOutletPath = `
    M ${startX + 187.5 + 60 + 32.5 + 32.5 + 95 + 62.5 + 95} ${startY + 332.5}
    L ${startX + 187.5 + 60 + 32.5 + 32.5 + 95 + 62.5 + 95 + 35} ${startY + 332.5}
    L ${startX + 187.5 + 60 + 32.5 + 32.5 + 95 + 62.5 + 95 + 35} ${startY + 332.5 + 50}
  `;
  drawPipeWithCurves(BPGValveOutletPath);

  const AnalyserOutletPath = `
    M ${startX + 187.5 + 60 + 32.5 + 32.5 + 95 + 62.5 + 95 + 35 + 50} ${startY + 332.5 + 50 + 40}
    L ${startX + 187.5 + 60 + 32.5 + 32.5 + 95 + 62.5 + 95 + 35 + 50 + 50} ${startY + 332.5 + 50 + 40}
  `;
  drawPipeWithCurves(AnalyserOutletPath);
}

function drawThreeTanks() {
  const y = canvasHeight - mainCylHeight;
  const margin = 2.5;
  createGasCylinder(tanksMarginX - margin, y, "CO2");
  createGasCylinder(tanksMarginX + mainCylWidth + tanksGap - margin, y, "10% CO2 / N2");
  createGasCylinder(tanksMarginX + 2 * (mainCylWidth + tanksGap) - margin, y, "N2");
}

function drawPressureGaugesAboveTanks() {
  const y = canvasHeight - mainCylHeight;
  const gaugeY = y - pressureGaugeOffset;
  const margin = 7.5;
  const gauge1X = mainCylWidth / 2 + margin;
  const gauge2X = mainCylWidth + tanksGap + mainCylWidth / 2 + margin;
  const gauge3X = 2 * (mainCylWidth + tanksGap) + mainCylWidth / 2 + margin;

  createConnectedGauges(gauge1X, gaugeY);
  createConnectedGauges(gauge2X, gaugeY);
  createConnectedGauges(gauge3X, gaugeY);
}

function drawValvesOnGauges(gOffset = valveOnGaugesGaugeOffset) {
  const y = canvasHeight - mainCylHeight;
  const gaugeY = y - gOffset;

  const gauge1X = tanksMarginX + mainCylWidth / 2;
  const gauge2X = tanksMarginX + mainCylWidth + tanksGap + mainCylWidth / 2;
  const gauge3X = tanksMarginX + 2 * (mainCylWidth + tanksGap) + mainCylWidth / 2;

  const valveWidth = valveOnGaugesValveWidth;
  const valveTotalHeight = valveOnGaugesValveTotalHeight;
  const gapBetween = valveOnGaugesGapBetween;

  const valve1X = gauge1X - valveWidth / 2;
  const valve1Y = gaugeY - gapBetween - valveTotalHeight;

  const valve2X = gauge2X - valveWidth / 2;
  const valve2Y = gaugeY - gapBetween - valveTotalHeight;

  const valve3X = gauge3X - valveWidth / 2;
  const valve3Y = gaugeY - gapBetween - valveTotalHeight;

  createVerticalValve(valve1X, valve1Y);
  createVerticalValve(valve2X, valve2Y);
  createVerticalValve(valve3X, valve3Y);
}

function drawInteractiveValveOnMiddleTank() {
  const x = tanksMarginX + mainCylWidth + tanksGap + (mainCylWidth / 2) - 2.5;
  const y = canvasHeight - mainCylHeight - 250;
  createInteractiveValve(x, y);
}

function createVerticalAdsorptionBedView(x, y) {
  const group = draw.group();

  // Define vertical bed dimensions
  const bedWidth = 104;
  const bedHeight = 200;

  // Draw the main bed rectangle
  group.rect(bedWidth, bedHeight)
    .fill('#d0e7f9')
    .stroke({ color: '#444', width: 2 })
    .move(x, y);

  // Create a pattern of small circles to mimic granular adsorbent
  const patternGroup = draw.group();
  const circleRadius = 3;
  const gap = 15;
  for (let cx = x + gap / 2; cx <= x + bedWidth; cx += gap) {
    for (let cy = y + gap / 2; cy <= y + bedHeight; cy += gap) {
      patternGroup.circle(circleRadius * 2)
        .fill('#89b3d1')
        .stroke({ color: '#567', width: 0.5 })
        .center(cx, cy);
    }
  }
  group.add(patternGroup);

  // Add centered labels for the adsorption bed
  group.text("Adsorption")
    .font({ family: 'Arial', size: 18, anchor: 'middle', weight: 'bold' })
    .fill('#000')
    .center(x + bedWidth / 2, y + bedHeight / 2);

  group.text("Bed")
    .font({ family: 'Arial', size: 18, anchor: 'middle', weight: 'bold' })
    .fill('#000')
    .center(x + bedWidth / 2, y + bedHeight / 2 + 20);

  return group;
}

// ----------------------------
// New: Digital Pressure Gauge and CO2 Gas Analyzer
// ----------------------------
function createDigitalPressureGauge(x, y, pressure = "75 psi") {
  const group = draw.group();
  const gaugeSize = 50;

  // Outer Circular Gauge
  group.circle(gaugeSize)
    .fill('#fff')
    .stroke({ color: '#888', width: gaugeStrokeWidth })
    .center(x, y);

  // Digital Display Rectangle
  const displayWidth = gaugeSize * 0.8;
  const displayHeight = gaugeSize * 0.3;
  const displayX = x - displayWidth / 2;
  const displayY = y - displayHeight / 2;
  group.rect(displayWidth, displayHeight)
    .fill('#e0e0e0')
    .stroke({ color: '#444', width: 1 })
    .move(displayX, displayY);

  // Pressure Text
  group.text(pressure)
    .font({ family: 'Arial', size: displayHeight * 0.5, anchor: 'middle', weight: 'bold' })
    .fill('#000')
    .center(x, y);

  // Bottom Connector
  const connectorWidth = 10;
  const connectorHeight = 5;
  const connectorX = x - connectorWidth / 2;
  const connectorY = y + (gaugeSize / 2);
  group.rect(connectorWidth, connectorHeight)
    .fill('#888')
    .stroke({ color: '#444', width: 1 })
    .move(connectorX, connectorY);

  return group;
}

function createCO2GasAnalyzer(x, y, concentration = "400 ppm") {
  const group = draw.group();

  // Analyzer Body Dimensions
  const analyzerWidth = 120;
  const analyzerHeight = 80;
  const cornerRadius = 5;

  // Main Analyzer Body
  group.rect(analyzerWidth, analyzerHeight)
    .fill('#f0f0f0')
    .stroke({ color: '#444', width: 2 })
    .radius(cornerRadius)
    .move(x, y);

  // Digital Display Area
  const displayMargin = 10;
  const displayWidth = analyzerWidth - 2 * displayMargin;
  const displayHeight = analyzerHeight * 0.5;
  const displayX = x + displayMargin;
  const displayY = y + displayMargin;

  group.rect(displayWidth, displayHeight)
    .fill('#000')
    .stroke({ color: '#444', width: 1 })
    .move(displayX, displayY);

  // CO₂ Concentration Text
  group.text(concentration)
    .font({ family: 'Digital-7, monospace', size: 24, anchor: 'middle', weight: 'bold' })
    .fill('#0f0')
    .center(displayX + displayWidth / 2, displayY + displayHeight / 2);

  // Label for the Analyzer
  group.text("CO₂ Analyzer")
    .font({ family: 'Arial', size: 12, anchor: 'middle', weight: 'bold' })
    .fill('#000')
    .center(x + analyzerWidth / 2, y + analyzerHeight - 15);

  // Bottom Connector
  const connectorWidth = 20;
  const connectorHeight = 5;
  const connectorX = x + analyzerWidth / 2 - connectorWidth / 2;
  const connectorY = y + analyzerHeight;
  group.rect(connectorWidth, connectorHeight)
    .fill('#888')
    .stroke({ color: '#444', width: 1 })
    .move(connectorX, connectorY);

  return group;
}

// ----------------------------
// New: Vent Arrow Function
// ----------------------------
function createVentArrow(x, y, angle, length) {
  const rad = angle * Math.PI / 180;

  // Arrow head parameters
  const arrowHeadLength = 10;
  const arrowHeadWidth = 8;

  const shaftLength = length - arrowHeadLength;
  const shaftEndX = shaftLength * Math.cos(rad);
  const shaftEndY = shaftLength * Math.sin(rad);

  const tipX = length * Math.cos(rad);
  const tipY = length * Math.sin(rad);

  const baseX = shaftEndX;
  const baseY = shaftEndY;

  const perpX = -Math.sin(rad);
  const perpY = Math.cos(rad);
  const halfWidth = arrowHeadWidth / 2;

  const leftX = baseX + halfWidth * perpX;
  const leftY = baseY + halfWidth * perpY;

  const rightX = baseX - halfWidth * perpX;
  const rightY = baseY - halfWidth * perpY;

  const group = draw.group();

  // Arrow Shaft
  group.line(0, 0, baseX, baseY)
    .stroke({ color: 'black', width: 2, linecap: 'round' });

  // Arrowhead
  group.polygon(`${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`)
    .fill('black');

  // "vent" Text beyond the arrow tip
  const textOffset = 12;
  const textX = tipX + textOffset * Math.cos(rad) - 10;
  const textY = tipY + textOffset * Math.sin(rad);

  group.text("vent")
    .font({ family: 'Arial', size: 14, anchor: 'start' })
    .move(textX, textY);

  group.move(x, y);

  return group;
}

// ----------------------------
// Main Draw Function
// ----------------------------
function drawCanvas() {
  drawPipes();
  drawThreeTanks();
  drawValvesOnGauges(25);
  drawPressureGaugesAboveTanks();
  drawValvesOnGauges();
  drawInteractiveValveOnMiddleTank();

  createMassFlowController(350, 0);
  createInteractiveValve(475, 87.5, false);
  createDigitalPressureGauge(550, 55, "100 psi");
  createVerticalAdsorptionBedView(550, 150);
  createInteractiveValve(600, 400, false, true);
  createCO2GasAnalyzer(700, 450, "425 ppm");
  createTValveFromImage(620, 370);
  createVentArrow(465, 5, 270, 40);
  createVentArrow(870, 485, 0, 40);
}

drawCanvas();