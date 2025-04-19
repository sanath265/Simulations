// Global Canvas Setup
import { yCO2_out } from "./calc.js";

// Global state for tracking valve states
const valveStates = {
  // Will store valve states as: { valveId: { isOpen: boolean, position: {x, y} } }
};

// Add these global variables at the top
let currentMultiValvePosition = 270; // Initial position
let mfcFlowSpeed = 50; // Default flow speed in ms
const flowPaths = {}; // Store flow animation paths for cleanup
let moleFractionTimer = null;
let startTime = null;
let desorbing = false;
let timeOfDesorption = 0;
let co2Analyzer = null;

// Add these global variables at the top with other globals
let isHeating = false;
let heatingInterval = null;

// This is an example for how to use the yCO2_out function.
// You can expect CO2 to start passing through after about 60 seconds
// and total adsorption to be reached after about 6 minutes.
(function calculateMoleFraction(y = 0.9, P = 0.1, m_controller = 15.0) {
  const tStep = 0.1; // time step in seconds. This can be any arbitrary value and 
  const m = m_controller * 1e-3 / 60; // mass flow rate in g / s
  const T = 298; // Temperature in K
  
  let t = 0;
  let timeSpeedMultiplier = 8;
  let desorbing = true; // when the CO2 is turned off and pure N2 is fed, change this to "true"
  let timeOfDesorption = 0; // and set this to the time when CO2 is turned off
  
  setInterval(() => {
    const outlet = yCO2_out({ t, tStep, m, P, T, yCO2: y, desorbing, timeOfDesorption });
    t = Math.round((t + tStep) * 100) / 100;
    
    // if (t === 60) {
    //   desorbing = true;
    //   timeOfDesorption = t;
    // }
    // Students will take measurements every 5 seconds, so this is what the plot will look like
    if (t % 5 === 0) {
      // console.log(`At time ${t}s, the outlet mole fraction of CO2 is ${outlet.toFixed(4)}`);
    }
  }, 100 * tStep / timeSpeedMultiplier);
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

// Add this near the top of the file with other global variables
let mfcValue = 15.0; // Default MFC value in mg/min

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
let prevTankNum = null;
let timeWhenAdsorptionStopped = null;
let interactiveValveKnob = null;
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
    
    // ----------------------------
    // UPDATED: createConnectedGauges with simpler click->screen coords
    // ----------------------------
    function createConnectedGauges(x, y, gaugeId) {
      const group = draw.group().attr({ id: gaugeId });
      
      const leftGaugeX = x;
      const rightGaugeX = x + connectedGaugeSize;
      const hexagonX = x + connectedGaugeSize / 2;
      const hexagonY = y + connectedGaugeVerticalOffset;
      
      // Create gauges and store them in variables
      const leftGauge = createPressureGaugeView(leftGaugeX, y);
      const rightGauge = createPressureGaugeView(rightGaugeX, y);
      const hexagon = createHexagonalView(hexagonX, hexagonY);
      
      // Add click handlers to each component
      const clickHandler = event => {
        const screenX = event.clientX;
        const screenY = event.clientY;
        showGaugeInput(screenX, screenY, gaugeId);
        console.log(`Gauge ${gaugeId} clicked at screen coords (${screenX}, ${screenY})`);
      };
      
      leftGauge.on('click', clickHandler);
      rightGauge.on('click', clickHandler);
      hexagon.on('click', clickHandler);
      group.on('click', clickHandler);
      
      group.line(hexagonX, hexagonY, leftGaugeX, y)
      .stroke({ color: '#666', width: 4 });
      group.line(hexagonX, hexagonY, rightGaugeX, y)
      .stroke({ color: '#666', width: 4 });
      
      return group;
    }
    
    function createVerticalValve(x, y, valveId) {
      const group = draw.group();
      
      // Initialize valve state in global object
      valveStates[valveId] = {
        isOpen: false,
        position: { x, y }
      };
      
      // Create valve body parts
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
      const knob = group.path(`
    M ${stemX} ${stemY} 
    L ${stemX - verticalValveTrapezoidWidth} ${stemY - extra} 
    L ${stemX - verticalValveTrapezoidWidth} ${stemY + verticalValveStemHeight + extra} 
    L ${stemX} ${stemY + verticalValveStemHeight} 
    Z
  `)
        .fill('#000')
        .stroke({ color: '#444', width: 1 });
        
        // Store the knob reference in the valve state
        valveStates[valveId].knob = knob;
        
        // Add click handler to toggle valve state
        group.on('click', function() {
          const isOpen = !valveStates[valveId].isOpen;
          valveStates[valveId].isOpen = isOpen;
          
          // Update knob color based on valve state
          if (isOpen) {
            knob.animate(300).fill('#ffa500'); // Orange when open
          } else {
            knob.animate(300).fill('#000000'); // Black when closed
          }
          
          if (isOpen) {
            // Handle different valve types
            if (valveId.startsWith('tankValve')) {
              const tankNum = valveId.replace('tankValve', '');
              const color = tankNum === '1' ? '#ff0000' : (tankNum === '2' ? '#ff0000' : 'blue');
              const opacity = tankNum === '1' ? 0.9 : 0.5;
              
              // Check if multi-valve is pointing to this tank
              const currentTank = getTankFromMultiValvePosition(currentMultiValvePosition);
              if (currentTank === tankNum) {
                // Start MFC flow immediately
                checkAndStartMFCFlow();
              }
              
              // Animate segments sequentially
              animateGasFlow(`tank${tankNum}_seg2`, color, opacity, () => {
                // Start seg3 after seg2 completes
                animateGasFlow(`tank${tankNum}_seg3`, color, opacity, () => {
                  // Check if pressure valve is open to start seg4 after seg3 completes
                  const pressureValveId = `pressureValve${tankNum}`;
                  if (valveStates[pressureValveId] && valveStates[pressureValveId].isOpen) {
                    animateGasFlow(`tank${tankNum}_seg4`, color, opacity);
                  }
                });
              });
            } else if (valveId.startsWith('pressureValve')) {
              const tankNum = valveId.replace('pressureValve', '');
              const tankValveId = `tankValve${tankNum}`;
              
              // Check if multi-valve is pointing to this tank
              const currentTank = getTankFromMultiValvePosition(currentMultiValvePosition);
              if (currentTank === tankNum) {
                // Start MFC flow immediately
                checkAndStartMFCFlow();
              }
              
              // Only animate seg4 if corresponding tank valve is also open
              if (valveStates[tankValveId] && valveStates[tankValveId].isOpen) {
                const color = tankNum === '1' ? '#ff0000' : (tankNum === '2' ? '#ff0000' : 'blue');
                const opacity = tankNum === '1' ? 0.9 : 0.5;
                animateGasFlow(`tank${tankNum}_seg4`, color, opacity);
              }
            }
          } else {
            // Stop animations when valve closes
            if (valveId.startsWith('tankValve')) {
              const tankNum = valveId.replace('tankValve', '');
              // Remove flow paths for segments 2, 3, and 4
              ['seg2', 'seg3', 'seg4'].forEach(seg => {
                const segmentId = `tank${tankNum}_${seg}`;
                if (flowPaths && flowPaths[segmentId]) {
                  flowPaths[segmentId].remove();
                  delete flowPaths[segmentId];
                }
              });
              
              // Check if multi-valve is pointing to this tank
              const currentTank = getTankFromMultiValvePosition(currentMultiValvePosition);
              if (currentTank === tankNum) {
                // Stop MFC flow
                checkAndStartMFCFlow();
              }
            } else if (valveId.startsWith('pressureValve')) {
              const tankNum = valveId.replace('pressureValve', '');
              const segmentId = `tank${tankNum}_seg4`;
              if (flowPaths && flowPaths[segmentId]) {
                flowPaths[segmentId].remove();
                delete flowPaths[segmentId];
              }
              
              // Check if multi-valve is pointing to this tank
              const currentTank = getTankFromMultiValvePosition(currentMultiValvePosition);
              if (currentTank === tankNum) {
                // Stop MFC flow
                checkAndStartMFCFlow();
              }
            }
          }
        });
        
        return group;
      }
      
      function createInteractiveValve(x, y, controller = true, isThreeValve = false) {
        const group = draw.group();
        const radius = interactiveValveRadius;
        
        // Define initial entry positions (in degrees)
        const entryAngles = [270, 0, 90, 180]; // Tank positions: 1 at 180°, 2 at 90°, 3 at 0°
        
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
          // Create pointer group
          const pointerGroup = group.group();
          const pointerLength = radius - interactiveValvePointerOffset;
          pointerGroup.polygon(`${pointerLength},0 0,-5 0,5`)
          .fill('green')
          .stroke({ color: '#444', width: 1 });
          pointerGroup.center(x, y);
          
          let currentAngleIndex = 0;
          pointerGroup.rotate(270, x, y); // Initialize to 270 degrees
          
          const entryAngles1 = [90, 90, 90, 90];
          group.on('click', function() {
            currentAngleIndex = (currentAngleIndex + 1) % entryAngles.length;
            const targetAngle = entryAngles[currentAngleIndex];
            currentMultiValvePosition = targetAngle;
            pointerGroup.animate(300).rotate(entryAngles1[currentAngleIndex], x, y);
            
            // Check if we should start MFC flow for the new position
            checkAndStartMFCFlow();
          });
        }
        
        return group;
      }
      
      function stopAllFlows() {
        // Stop and remove all active flow animations
        Object.keys(flowPaths).forEach(segmentId => {
          if (flowPaths[segmentId]) {
            // Remove the flow path from the SVG
            flowPaths[segmentId].remove();
            // Remove from our tracking object
            delete flowPaths[segmentId];
          }
        });
      }
      
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
            
            // Add click handler
            group.on('click', () => {
              showMFCZoomedView();
            });
            
            return group;
          }
          
          function showMFCZoomedView() {
            // Remove any existing MFC view
            document.querySelectorAll('.mfc-zoomed-view').forEach(el => el.remove());
            document.querySelectorAll('.magnifying-glass').forEach(el => el.remove());
            
            // Create magnifying glass
            const magnifyingGlass = document.createElement('div');
            magnifyingGlass.className = 'magnifying-glass';
            document.body.appendChild(magnifyingGlass);
            
            // Create container
            const container = document.createElement('div');
            container.className = 'mfc-zoomed-view';
            
            // Create close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-btn';
            closeBtn.innerHTML = '×';
            closeBtn.onclick = () => {
              container.remove();
              magnifyingGlass.remove();
            };
            
            // Create display
            const display = document.createElement('div');
            display.className = 'mfc-display';
            display.textContent = mfcValue.toFixed(1);
            
            // Create controls container
            const controls = document.createElement('div');
            controls.className = 'mfc-controls';
            
            // Create up triangle
            const upTriangle = document.createElement('div');
            upTriangle.className = 'triangle-btn triangle-up';
            upTriangle.onclick = () => {
              if (mfcValue < 100) {
                mfcValue = Math.min(100, mfcValue + 1);
                display.textContent = mfcValue.toFixed(1);
                input.value = mfcValue.toFixed(1);
                errorMsg.textContent = '';
              }
            };
            
            // Create down triangle
            const downTriangle = document.createElement('div');
            downTriangle.className = 'triangle-btn triangle-down';
            downTriangle.onclick = () => {
              if (mfcValue > 1) {
                mfcValue = Math.max(1, mfcValue - 1);
                display.textContent = mfcValue.toFixed(1);
                input.value = mfcValue.toFixed(1);
                errorMsg.textContent = '';
              }
            };
            
            // Create input container
            const inputContainer = document.createElement('div');
            inputContainer.className = 'input-container';
            
            // Create input field
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.max = '100';
            input.step = '0.1';
            input.value = mfcValue.toFixed(1);
            
            // Create error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-msg';
            errorMsg.style.color = 'red';
            errorMsg.style.marginTop = '5px';
            errorMsg.style.textAlign = 'center';
            
            // Create set button
            const setButton = document.createElement('button');
            setButton.textContent = 'Set';
            setButton.onclick = () => {
              const newValue = parseFloat(input.value);
              if (isNaN(newValue)) {
                errorMsg.textContent = 'Please enter a valid number';
              } else if (newValue < 1 || newValue > 100) {
                errorMsg.textContent = 'Value must be between 1 and 100 mg/min';
              } else {
                mfcValue = newValue;
                // Update flow speed based on MFC value (inverse relationship)
                const newSpeed = Math.max(10, Math.min(100, 100 - (newValue / 2)));
                updateMFCFlowSpeed(newSpeed);
                display.textContent = mfcValue.toFixed(1);
                errorMsg.textContent = '';
              }
            };
            
            // Create unit label
            const unitLabel = document.createElement('div');
            unitLabel.className = 'unit-label';
            unitLabel.textContent = 'mg/min';
            
            // Assemble input container
            inputContainer.append(input, setButton);
            
            // Assemble controls
            controls.append(upTriangle, inputContainer, downTriangle);
            
            // Assemble container
            container.append(closeBtn, display, controls, errorMsg, unitLabel);
            document.body.appendChild(container);
            
            // Position magnifying glass in the center of the view
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            magnifyingGlass.style.left = `${viewportWidth / 2}px`;
            magnifyingGlass.style.top = `${viewportHeight / 2}px`;
            
            // Close on outside click
            const outside = e => {
              if (!container.contains(e.target)) {
                container.remove();
                magnifyingGlass.remove();
                document.removeEventListener('click', outside);
              }
            };
            setTimeout(() => document.addEventListener('click', outside), 0);
          }
          
          const pipeSegments = {};
          
          // 2. Replace your old drawPipeWithCurves with this:
          function drawPipeWithCurves(pathString, segmentId, pipeW = pipeWidth, strokeC = pipeStrokeColor, outlineC = pipeOutlineColor) {
            // draw the "shadow" outline
            let outline = draw.path(pathString)
            .fill('none')
            .stroke({ color: outlineC, width: pipeW + 4, linejoin: 'round' });
            pipeGroup.add(outline);
            
            // draw the actual pipe
            let pipe = draw.path(pathString)
            .fill('none')
            .stroke({ color: strokeC, width: pipeW, linejoin: 'round' });
            pipeGroup.add(pipe);
            
            // register it so we can animate later
            if (segmentId) {
              pipeSegments[segmentId] = pipe;
            }
            
            return pipe;
          }
          
          
          function drawPipes() {
            // Clear existing pipe group
            pipeGroup.clear();
            
            // Example pipe path for Tank 1
            let startX = 62.5;
            let startY = canvasHeight - mainCylHeight - 42.5;
            const tank1PipePath1 = `
    M ${startX} ${startY} 
    L ${startX} ${startY - 17.5}
  `;
            drawPipeWithCurves(tank1PipePath1, 'tank1_seg1', pipeWidth, '#ff0000', pipeOutlineColor)
            .stroke({ opacity: 0.9 });
            
            const tank1PipePath2 = `
    M ${startX} ${startY - 53}
    L ${startX} ${startY - 63}
  `;
            drawPipeWithCurves(tank1PipePath2, 'tank1_seg2');
            
            const tank1PipePath3 = `
    M ${startX} ${startY - 92.5}
    L ${startX} ${startY - 130}
  `;
            drawPipeWithCurves(tank1PipePath3, 'tank1_seg3');
            
            const tank1PipePath4 = `
    M ${startX} ${startY - 162.5}
    L ${startX} ${startY - 207.5}
    L ${startX + 100} ${startY - 207.5}
  `;
            drawPipeWithCurves(tank1PipePath4, 'tank1_seg4');
            
            // Tank 2
            startX = 62.5 + mainCylWidth + tanksGap;
            startY = canvasHeight - mainCylHeight - 42.5;
            const tank2PipePath1 = `
    M ${startX} ${startY} 
    L ${startX} ${startY - 17.5}
  `;
            drawPipeWithCurves(tank2PipePath1, 'tank2_seg1', pipeWidth, '#ff0000', pipeOutlineColor).stroke({ opacity: 0.5 });;
            
            const tank2PipePath2 = `
    M ${startX} ${startY - 53}
    L ${startX} ${startY - 63}
  `;
            drawPipeWithCurves(tank2PipePath2, 'tank2_seg2');
            
            const tank2PipePath3 = `
    M ${startX} ${startY - 92.5}
    L ${startX} ${startY - 130}
  `;
            drawPipeWithCurves(tank2PipePath3, 'tank2_seg3');
            
            const tank2PipePath4 = `
    M ${startX} ${startY - 162.5}
    L ${startX} ${startY - 175}
  `;
            drawPipeWithCurves(tank2PipePath4, 'tank2_seg4');
            
            // Tank 3
            startX = 62.5 + 2 * mainCylWidth + 2 * tanksGap;
            startY = canvasHeight - mainCylHeight - 42.5;
            const tank3PipePath1 = `
    M ${startX} ${startY} 
    L ${startX} ${startY - 17.5}
  `;
            drawPipeWithCurves(tank3PipePath1, 'tank3_seg1', pipeWidth, 'blue', pipeOutlineColor).stroke({ opacity: 0.5 });;;
            
            const tank3PipePath2 = `
    M ${startX} ${startY - 53}
    L ${startX} ${startY - 63}
  `;
            drawPipeWithCurves(tank3PipePath2, 'tank3_seg2');
            
            const tank3PipePath3 = `
    M ${startX} ${startY - 92.5}
    L ${startX} ${startY - 130}
  `;
            drawPipeWithCurves(tank3PipePath3, 'tank3_seg3');
            
            const tank3PipePath4 = `
    M ${startX} ${startY - 162.5}
    L ${startX} ${startY - 207.5}
    L ${startX - 100} ${startY - 207.5}
  `;
            drawPipeWithCurves(tank3PipePath4, 'tank3_seg4');
            
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
            drawPipeWithCurves(MFCInletPath, 'mfc_inlet');
            
            const MFCOutletPath = `
    M ${startX + 187.5 + 60} ${startY + 20}
    L ${startX + 187.5 + 60 + 32.5} ${startY + 20}
  `;
            drawPipeWithCurves(MFCOutletPath, 'mfc_outlet');
            
            const AdsorptionBedInletPath = `
    M ${startX + 187.5 + 60 + 32.5 + 65} ${startY + 20}
    L ${startX + 187.5 + 60 + 32.5 + 65 + 92.5} ${startY + 20}
    L ${startX + 187.5 + 60 + 32.5 + 65 + 92.5} ${startY + 20 + 62.5}
  `;
            drawPipeWithCurves(AdsorptionBedInletPath, 'adsorption_bed_inlet');
            
            const MFCValveOutletPath = `
    M ${startX + 187.5 + 60 + 32.5 + 32.5} ${startY + 52.5}
    L ${startX + 187.5 + 60 + 32.5 + 32.5} ${startY + 332.5}
    L ${startX + 187.5 + 60 + 32.5 + 32.5 + 95} ${startY + 332.5}
  `;
            drawPipeWithCurves(MFCValveOutletPath, 'mfc_valve_outlet');
            
            const AdsorptionBedOutletPath = `
    M ${startX + 187.5 + 60 + 32.5 + 65 + 92.5} ${startY + 20 + 62.5 + 200}
    L ${startX + 187.5 + 60 + 32.5 + 65 + 92.5} ${startY + 20 + 62.5 + 200 + 17.5}
  `;
            drawPipeWithCurves(AdsorptionBedOutletPath, 'adsorption_bed_outlet');
            
            const AdsorptionBedValveOutletPath = `
    M ${startX + 187.5 + 60 + 32.5 + 32.5 + 95 + 62.5} ${startY + 332.5}
    L ${startX + 187.5 + 60 + 32.5 + 32.5 + 95 + 62.5 + 17.5} ${startY + 332.5}
  `;
            drawPipeWithCurves(AdsorptionBedValveOutletPath, 'adsorption_bed_valve_outlet');
            
            const BPGValveOutletPath = `
    M ${startX + 187.5 + 60 + 32.5 + 32.5 + 95 + 62.5 + 95} ${startY + 332.5}
    L ${startX + 187.5 + 60 + 32.5 + 32.5 + 95 + 62.5 + 95 + 35} ${startY + 332.5}
    L ${startX + 187.5 + 60 + 32.5 + 32.5 + 95 + 62.5 + 95 + 35} ${startY + 332.5 + 50}
  `;
            drawPipeWithCurves(BPGValveOutletPath, 'bpg_valve_outlet');
            
            const AnalyserOutletPath = `
    M ${startX + 187.5 + 60 + 32.5 + 32.5 + 95 + 62.5 + 95 + 35 + 50} ${startY + 332.5 + 50 + 40}
    L ${startX + 187.5 + 60 + 32.5 + 32.5 + 95 + 62.5 + 95 + 35 + 50 + 50} ${startY + 332.5 + 50 + 40}
  `;
            drawPipeWithCurves(AnalyserOutletPath, 'analyser_outlet');
          }
          
          function animateGasFlow(segmentId, color, opacity, onComplete = null, isMFCControlled = false) {
            const path = pipeSegments[segmentId];
            if (!path) return;
            
            // Get the path string from the existing segment
            const pathString = path.node.getAttribute('d');
            
            // Create a new path for the flow animation
            const flowPath = draw.path(pathString)
            .fill('none')
            .stroke({
              color: color,
              opacity: opacity,
              width: pipeWidth,
              linejoin: 'round'
            });
            
            // Add to pipe group
            pipeGroup.add(flowPath);
            
            // Get total length for animation
            const totalLength = flowPath.node.getTotalLength();
            
            // Set initial dash array and offset
            flowPath.attr({
              'stroke-dasharray': totalLength,
              'stroke-dashoffset': totalLength
            });
            
            // Store MFC control flag and color/opacity
            flowPath.isMFCControlled = isMFCControlled;
            flowPath.color = color;
            flowPath.opacity = opacity;
            
            // Animate the flow with completion callback
            const speed = isMFCControlled ? mfcFlowSpeed : 50;
            flowPath.animate(speed).attr({ 'stroke-dashoffset': 0 }).after(() => {
              if (onComplete) {
                onComplete();
              }
            });
            
            // Store the flow path for later removal
            flowPaths[segmentId] = flowPath;
          }
          
          function drawThreeTanks() {
            const y = canvasHeight - mainCylHeight;
            const margin = 2.5;
            createGasCylinder(tanksMarginX - margin, y, "90% CO2 / N2");
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
            
            createConnectedGauges(gauge1X, gaugeY, 'gauge1');
            createConnectedGauges(gauge2X, gaugeY, 'gauge2');
            createConnectedGauges(gauge3X, gaugeY, 'gauge3');
          }
          
          function drawValvesOnGauges(gOffset = valveOnGaugesGaugeOffset, valvePrefix = 'valve') {
            const y = canvasHeight - mainCylHeight;
            const gaugeY = y - gOffset;
            
            const gauge1X = tanksMarginX + mainCylWidth / 2;
            const gauge2X = tanksMarginX + mainCylWidth + tanksGap + mainCylWidth / 2;
            const gauge3X = tanksMarginX + 2 * (mainCylWidth + tanksGap) + mainCylWidth / 2;
            
            const gaugeWidth = valveOnGaugesValveWidth;
            const gaugeTotalHeight = valveOnGaugesValveTotalHeight;
            const gapBetween = valveOnGaugesGapBetween;
            
            const gauge1Y = gaugeY - gapBetween - gaugeTotalHeight;
            const gauge2Y = gaugeY - gapBetween - gaugeTotalHeight;
            const gauge3Y = gaugeY - gapBetween - gaugeTotalHeight;
            
            createVerticalValve(gauge1X - gaugeWidth / 2, gauge1Y, `${valvePrefix}1`);
            createVerticalValve(gauge2X - gaugeWidth / 2, gauge2Y, `${valvePrefix}2`);
            createVerticalValve(gauge3X - gaugeWidth / 2, gauge3Y, `${valvePrefix}3`);
          }
          
          function drawInteractiveValveOnMiddleTank() {
            const x = tanksMarginX + mainCylWidth + tanksGap + (mainCylWidth / 2) - 2.5;
            const y = canvasHeight - mainCylHeight - 250;
            interactiveValveKnob = createInteractiveValve(x, y);
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
            
            // Create heating elements on both sides
            const heaterWidth = 20;
            const heaterHeight = bedHeight;
            const defaultGradient = draw.gradient('linear', function(add) {
              add.stop(0, '#0000ff');
              add.stop(0.5, '#6666ff');
              add.stop(1, '#0000ff');
            });
            defaultGradient.from(0, 0).to(0, 1);
            
            // Left heater
            group.rect(heaterWidth, heaterHeight)
              .fill(defaultGradient)
              .stroke({ color: '#444', width: 2 })
              .move(x - heaterWidth - 5, y)
              .addClass('heater');
            
            // Right heater
            group.rect(heaterWidth, heaterHeight)
              .fill(defaultGradient)
              .stroke({ color: '#444', width: 2 })
              .move(x + bedWidth + 5, y)
              .addClass('heater');
            
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
            group.addClass('co2-analyzer');
            
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
            
            const displayRect = group.rect(displayWidth, displayHeight)
            .fill('#000')
            .stroke({ color: '#444', width: 1 })
            .move(displayX, displayY);
            
            // CO₂ Concentration Text
            const concentrationText = group.text(concentration)
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
            
            // Store the text element for later updates
            group.concentrationText = concentrationText;
            
            // Store the analyzer in the global variable
            co2Analyzer = group;
            
            return group;
          }
          
          function updateCO2AnalyzerDisplay(value) {
            if (co2Analyzer && co2Analyzer.concentrationText) {
              co2Analyzer.concentrationText.text(`${(value * 100).toFixed(2)}%`);
            }
          }
          
          function startMoleFractionCalculation(tankNum) {
            // Set initial conditions based on tank
            let y; // Initial mole fraction
            if (tankNum === '1') {
              y = 0.9; // 90% CO2 for Tank 1
              // If this is a resume from a previous stop, continue from that time
              if (prevTankNum === '1' && timeWhenAdsorptionStopped) {
                startTime = Date.now() - (timeWhenAdsorptionStopped * 1000);
              } else {
                startTime = Date.now();
              }
              desorbing = false;
              timeOfDesorption = 0;
              stopHeating();
            } else if (tankNum === '2') {
              y = 0.1; // 10% CO2 for Tank 2
              // If this is a resume from a previous stop, continue from that time
              if (prevTankNum === '2' && timeWhenAdsorptionStopped) {
                startTime = Date.now() - (timeWhenAdsorptionStopped * 1000);
              } else {
                startTime = Date.now();
              }
              desorbing = false;
              timeOfDesorption = 0;
              stopHeating();
            } else if (tankNum === '3') {
              y = prevTankNum === '1' ? 0.9 : 0.1; // Use previous tank's mole fraction
              desorbing = true;
              if (timeWhenAdsorptionStopped) {
                timeOfDesorption = timeWhenAdsorptionStopped; // Time in seconds
              }
              startTime = Date.now() - timeWhenAdsorptionStopped * 1000;
              startHeating();
            }
            
            const P = gaugeValues[`gauge${tankNum}`] || 0.1; // Pressure from gauge
            const m_controller = mfcValue; // MFC value in mg/min
            const T = 298; // Temperature in K
            
            // Convert m_controller from mg/min to g/s
            const m = m_controller * 1e-3 / 60;
            
            console.log('Starting calculation for tank:', tankNum, {
              y,
              P,
              m_controller,
              desorbing,
              timeOfDesorption,
              timeWhenAdsorptionStopped,
              prevTankNum
            });
            
            // Start timer to update every second
            moleFractionTimer = setInterval(() => {
              const t = (Date.now() - startTime) / 1000;
              const outlet = yCO2_out({ 
                t, 
                tStep: 0.1, 
                m, 
                P, 
                T, 
                yCO2: y, 
                desorbing, 
                timeOfDesorption,
                m_controller: mfcValue
              });
              
              // Update the analyzer display
              updateCO2AnalyzerDisplay(outlet);
              console.log('Current state:', { 
                t, 
                desorbing, 
                timeOfDesorption, 
                outlet,
                m_controller: mfcValue,
                P,
                y,
                tankNum
              });
            }, 1000);
          }
          
          function stopMoleFractionCalculation() {
            if (moleFractionTimer) {
              clearInterval(moleFractionTimer);
              moleFractionTimer = null;
              // Record the time when adsorption stopped
              timeWhenAdsorptionStopped = (Date.now() - startTime) / 1000;
              console.log('Adsorption stopped at time:', timeWhenAdsorptionStopped);
            }
          }
          
          function checkAndStartMFCFlow() {
            // Check if multi-valve is pointing to a tank and both its valves are open
            const tankNum = getTankFromMultiValvePosition(currentMultiValvePosition);
            if (tankNum) {
              const tankValveId = `tankValve${tankNum}`;
              const pressureValveId = `pressureValve${tankNum}`;
              
              // Only start flow if both valves are open
              if (valveStates[tankValveId]?.isOpen && valveStates[pressureValveId]?.isOpen) {
                // Set color and opacity based on tank number
                let color, opacity;
                switch(tankNum) {
                  case '1':
                    color = '#ff0000';  // Red for tank 1
                    opacity = 0.9;      // 0.9 opacity for tank 1
                    break;
                  case '2':
                    color = '#ff0000';  // Red for tank 2
                    opacity = 0.5;      // 0.5 opacity for tank 2
                    break;
                  case '3':
                    color = 'blue';     // Blue for tank 3
                    opacity = 0.5;      // 0.5 opacity for tank 3
                    break;
                }
                
                // Stop only MFC-related flows
                const mfcSegments = ['mfc_inlet', 'mfc_outlet', 'adsorption_bed_inlet', 
                  'mfc_valve_outlet', 'adsorption_bed_outlet', 
                  'adsorption_bed_valve_outlet', 'bpg_valve_outlet', 
                  'analyser_outlet'];
                  mfcSegments.forEach(segmentId => {
                    if (flowPaths[segmentId]) {
                      flowPaths[segmentId].remove();
                      delete flowPaths[segmentId];
                    }
                  });
                  
                  // Start MFC inlet path
                  animateGasFlow('mfc_inlet', color, opacity, () => {
                    // After MFC inlet completes, start MFC outlet and other paths
                    animateGasFlow('mfc_outlet', color, opacity, null, true);
                    
                    // Start these paths simultaneously
                    animateGasFlow('adsorption_bed_inlet', color, opacity, () => {
                      // Start mole fraction calculation when adsorption bed inlet completes
                      startMoleFractionCalculation(tankNum);
                      if (tankNum === '1' || tankNum === '2') {
                        prevTankNum = tankNum;
                      }
                    }, true);
                    
                    animateGasFlow('mfc_valve_outlet', color, opacity, () => {
                      // After MFC valve outlet completes, start adsorption bed outlet
                      animateGasFlow('adsorption_bed_outlet', color, opacity, () => {
                        // After adsorption bed outlet completes, start remaining paths
                        animateGasFlow('adsorption_bed_valve_outlet', color, opacity, null, true);
                        animateGasFlow('bpg_valve_outlet', color, opacity, null, true);
                        animateGasFlow('analyser_outlet', color, opacity, null, true);
                      }, true);
                    }, true);
                  });
                } else {
                  // If either valve is closed, stop only MFC-related flows
                  const mfcSegments = ['mfc_inlet', 'mfc_outlet', 'adsorption_bed_inlet', 
                    'mfc_valve_outlet', 'adsorption_bed_outlet', 
                    'adsorption_bed_valve_outlet', 'bpg_valve_outlet', 
                    'analyser_outlet'];
                    mfcSegments.forEach(segmentId => {
                      if (flowPaths[segmentId]) {
                        flowPaths[segmentId].remove();
                        delete flowPaths[segmentId];
                      }
                    });
                    
                    // Stop mole fraction calculation
                    stopMoleFractionCalculation();
                  }
                } else {
                  // If no tank is selected, stop only MFC-related flows
                  const mfcSegments = ['mfc_inlet', 'mfc_outlet', 'adsorption_bed_inlet', 
                    'mfc_valve_outlet', 'adsorption_bed_outlet', 
                    'adsorption_bed_valve_outlet', 'bpg_valve_outlet', 
                    'analyser_outlet'];
                    mfcSegments.forEach(segmentId => {
                      if (flowPaths[segmentId]) {
                        flowPaths[segmentId].remove();
                        delete flowPaths[segmentId];
                      }
                    });
                    
                    // Stop mole fraction calculation
                    stopMoleFractionCalculation();
                  }
                }
                
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
                  drawValvesOnGauges(25, 'tankValve');
                  drawPressureGaugesAboveTanks();
                  drawValvesOnGauges(undefined, 'pressureValve');
                  drawInteractiveValveOnMiddleTank();
                  
                  createMassFlowController(350, 0);
                  createInteractiveValve(475, 87.5, false);
                  createDigitalPressureGauge(550, 55, "100 psi");
                  createVerticalAdsorptionBedView(550, 150);
                  createInteractiveValve(600, 400, false, true);
                  createCO2GasAnalyzer(700, 450, "00.00%");
                  createTValveFromImage(620, 370);
                  createVentArrow(465, 5, 270, 40);
                  createVentArrow(870, 485, 0, 40);
                }
                
                // store current pressures
                const gaugeValues = {};
                
                // ----------------------------
                // UPDATED: showGaugeInput with absolute positioning & styling
                // ----------------------------
                function showGaugeInput(screenX, screenY, gaugeId) {
                  // Remove any existing popup
                  document.querySelectorAll('.gauge-input-container').forEach(el => el.remove());
                  
                  // Create container
                  const container = document.createElement('div');
                  container.className = 'gauge-input-container';
                  
                  // Position the popup to the right of the click point
                  Object.assign(container.style, {
                    position: 'fixed',
                    left: `${screenX + 20}px`, // Position to the right of the click point
                    top: `${screenY - 25}px`,  // Center vertically with the click point
                  });
                  
                  // Create input row
                  const inputRow = document.createElement('div');
                  inputRow.className = 'input-row';
                  
                  // Input field
                  const input = document.createElement('input');
                  input.type = 'number';
                  input.min = '0.1';
                  input.max = '10';
                  input.step = '0.1';
                  input.value = gaugeValues[gaugeId] ?? '0.1';
                  input.style.width = '60px';
                  
                  // Unit label
                  const unitLabel = document.createElement('span');
                  unitLabel.className = 'unit';
                  unitLabel.textContent = 'bar';
                  
                  const button = document.createElement('button');
                  button.textContent = 'Set';
                  
                  const errorMsg = document.createElement('div');
                  errorMsg.className = 'error';
                  
                  // Assemble the input row
                  inputRow.append(input, unitLabel, button);
                  
                  // Assemble the container
                  container.append(inputRow, errorMsg);
                  document.body.appendChild(container);
                  
                  button.addEventListener('click', () => {
                    const val = parseFloat(input.value);
                    if (isNaN(val) || val < 0.1 || val > 10) {
                      errorMsg.textContent = 'Enter a value between 0.1–10 bar';
                    } else {
                      gaugeValues[gaugeId] = val;
                      container.remove();
                      // TODO: update gauge visuals here
                    }
                  });
                  
                  // Close on outside click
                  const outside = e => {
                    if (!container.contains(e.target)) {
                      container.remove();
                      document.removeEventListener('click', outside);
                    }
                  };
                  setTimeout(() => document.addEventListener('click', outside), 0);
                }
                
                function updateMFCFlowSpeed(value) {
                  mfcFlowSpeed = value;
                  // Update any active flows
                  Object.values(flowPaths).forEach(path => {
                    if (path.isMFCControlled) {
                      // Remove the old path
                      path.remove();
                      // Create a new path with updated speed
                      const segmentId = Object.keys(flowPaths).find(key => flowPaths[key] === path);
                      if (segmentId) {
                        animateGasFlow(segmentId, path.color, path.opacity, null, true);
                      }
                    }
                  });
                }
                
                function getTankFromMultiValvePosition(position) {
                  switch(position) {
                    case 180: return '1';  // Tank 1 at 180 degrees
                    case 90: return '2';   // Tank 2 at 90 degrees
                    case 0: return '3';    // Tank 3 at 0 degrees
                    default: return null;  // No tank selected
                  }
                }
                
                // Add these functions after the global variables
                function startHeating() {
                  if (!isHeating) {
                    isHeating = true;
                    heatingInterval = setInterval(() => {
                      // Update heater gradients based on current tank
                      const currentTank = getTankFromMultiValvePosition(currentMultiValvePosition);
                      const gradient = draw.gradient('linear', function(add) {
                        if (currentTank === '3') {
                          // Red gradient for Tank 3
                          add.stop(0, '#ff0000');
                          add.stop(0.5, '#ff6600');
                          add.stop(1, '#ff0000');
                        } else {
                          // Blue gradient for other tanks
                          add.stop(0, '#0000ff');
                          add.stop(0.5, '#6666ff');
                          add.stop(1, '#0000ff');
                        }
                      });
                      gradient.from(0, 0).to(0, 1);
                      
                      // Update both heaters
                      const heaters = draw.find('.heater');
                      heaters.forEach(heater => {
                        heater.fill(gradient);
                      });
                    }, 1000);
                  }
                }
                
                function stopHeating() {
                  if (isHeating) {
                    isHeating = false;
                    clearInterval(heatingInterval);
                    
                    // Reset heater gradients to blue
                    const gradient = draw.gradient('linear', function(add) {
                      add.stop(0, '#0000ff');
                      add.stop(0.5, '#6666ff');
                      add.stop(1, '#0000ff');
                    });
                    gradient.from(0, 0).to(0, 1);
                    
                    // Reset all heaters
                    const heaters = draw.find('.heater');
                    heaters.forEach(heater => {
                      heater.fill(gradient);
                    });
                  }
                }
                
                // Finally draw everything
                drawCanvas();

// Add this function after the global variables
function resetEverything() {
  // Stop all timers
  if (moleFractionTimer) {
    clearInterval(moleFractionTimer);
    moleFractionTimer = null;
  }
  
  // Reset all global variables
  currentMultiValvePosition = 270; // Initial position
  mfcValue = 15.0; // Default MFC value
  startTime = null;
  desorbing = false;
  timeOfDesorption = 0;
  timeWhenAdsorptionStopped = null;
  prevTankNum = null;
  
  // Stop heating
  stopHeating();
  
  // Clear the canvas
  draw.clear();
  
  // Recreate the pipe group
  pipeGroup = draw.group();
  
  // Redraw all components
  drawPipes();
  drawThreeTanks();
  drawValvesOnGauges(25, 'tankValve');
  drawPressureGaugesAboveTanks();
  drawValvesOnGauges(undefined, 'pressureValve');
  
  // Create the interactive valve on middle tank
  const x = tanksMarginX + mainCylWidth + tanksGap + (mainCylWidth / 2) - 2.5;
  const y = canvasHeight - mainCylHeight - 250;
  interactiveValveKnob = createInteractiveValve(x, y);
  
  // Create other components with proper positioning
  createMassFlowController(350, 0);
  createInteractiveValve(475, 87.5, false);
  createDigitalPressureGauge(550, 55, "100 psi");
  createVerticalAdsorptionBedView(550, 150);
  createInteractiveValve(600, 400, false, true);
  createCO2GasAnalyzer(700, 450, "00.00%");
  createTValveFromImage(620, 370);
  createVentArrow(465, 5, 270, 40);
  createVentArrow(870, 485, 0, 40);
  
  // Reset all gauge values
  Object.keys(gaugeValues).forEach(gaugeId => {
    gaugeValues[gaugeId] = 0.1; // Reset to default pressure
  });
  
  // Reset valve states
  Object.keys(valveStates).forEach(valveId => {
    valveStates[valveId].isOpen = false;
  });
  
  // Reset flow paths
  Object.keys(flowPaths).forEach(segmentId => {
    if (flowPaths[segmentId]) {
      flowPaths[segmentId].remove();
      delete flowPaths[segmentId];
    }
  });
  
  console.log('System reset to initial state');
}

// Add this to your existing code where you set up the reset button
document.getElementById('reset-button').addEventListener('click', resetEverything);
