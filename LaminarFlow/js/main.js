const canvasWidth = 1000;
const canvasHeight = 600;
const draw = SVG().addTo('#svg-container').size(canvasWidth, canvasHeight);
const borderHexCode = '#b3b3b3';
const containerHeight = 450;
const containerWidth = 8 * containerHeight / 12;
const surfaceWidth = 8;
const innerMargin = 50;
const shaftLength = 200;
const shaftWidth = 20;
const connectingRodWidth = 25;
const connectingRodHeight = 60;
const knobWidth = 30;
const knobHeight = 40;
let isDragging = false;
const centerX = canvasWidth / 4;
const centerY = canvasHeight / 2;
const radius = shaftLength - knobWidth - 5;
const width = 20;
const height = shaftLength;
const cornerRadius = shaftWidth / 2;
let knob = null;
let shaft = null;
let currentAngle = 0;
let shaftFrontView = null;
let knobFrontView = null;
let connectingRod = null;

function drawCanvas() {
    drawFrontView();
    drawTopView();
}

function drawFrontView() {
    drawContainer();
    drawShaft();
    drawBottomSupport();
    createConnectingRod();
}

function drawTopView() {
    drawContainerTopView();
    createShaft();
    createKnob();
    setupDragHandlers();
}
function drawContainer() {
    draw.rect(containerWidth, containerHeight)
    .center( 3 * canvasWidth / 4, canvasHeight/2 )
    .fill('none')
    .stroke({ color: "#eeeeee", width: surfaceWidth});
    
    draw.rect(containerWidth - innerMargin, containerHeight - innerMargin)
    .center( 3 * canvasWidth / 4, canvasHeight/2 )
    .fill('none')
    .stroke({ color: '#000', width: surfaceWidth / 2 });
    
    connectingRod = draw.rect(connectingRodWidth, connectingRodHeight)
    .center( 3 * canvasWidth / 4, canvasHeight/2 - containerHeight / 2 + innerMargin / 2 - connectingRodHeight / 2)
    .fill('#eeeeee')
    .stroke({ color: borderHexCode, width: 1 });
}

function drawShaft() {
    shaftFrontView = draw.rect(shaftLength, 20)
    .move( 3 * canvasWidth / 4 - connectingRodWidth / 2, canvasHeight/2 - containerHeight / 2 + innerMargin / 2 - connectingRodHeight + 4)
    .fill('#000')
    .stroke({ color: 'black', width: 1 });
    
    knobFrontView = draw.rect(knobWidth, knobHeight)
    .move( 3 * canvasWidth / 4 - connectingRodWidth / 2 + shaftLength - knobWidth - 10, canvasHeight/2 - containerHeight / 2 + innerMargin / 2 - connectingRodHeight + 4 - 40)
    .fill('#989788')
    .stroke({ color: 'black', width: 1 });
}

function drawContainerTopView() {
    draw.circle(containerWidth)
    .center( 1 * canvasWidth / 4, canvasHeight/2 )
    .fill('none')
    .stroke({ color: "#eeeeee", width: surfaceWidth});
    
    draw.circle(containerWidth - innerMargin)
    .center( 1 * canvasWidth / 4, canvasHeight/2 )
    .fill('none')
    .stroke({ color: '#000', width: surfaceWidth / 2 });
}

function drawBottomSupport() {
    draw.rect(10, 10)
    .center(3 * canvasWidth / 4, canvasHeight/2 + containerHeight / 2 - 10)
    
    draw.circle((innerMargin - 10)/3)
    .center(3 * canvasWidth / 4, canvasHeight/2 + containerHeight / 2 - 14 + 10 - (innerMargin - 10)/3)
    .fill('#eeeeee');
}

drawCanvas();

function createShaft() {
    shaft = draw.rect(height, width)
    .move(centerX - 10, centerY - width/2)
    .radius(cornerRadius)
    .fill('black');
}

function createKnob() {
    knob = draw.circle(knobWidth)
    .center(canvasWidth / 4 + shaftLength - knobWidth - 5, canvasHeight/2)
    .fill(borderHexCode)
    .stroke({ color: 'black', width: 1 });
}

function createConnectingRod() {
    draw.circle(width)
    .center(canvasWidth / 4, canvasHeight/2)
    .fill('#eeeeee')
    .stroke({ color: borderHexCode, width: 1 });
}

function setupDragHandlers() {
    knob.on('mousedown', () => {
        isDragging = true;
    });
    
    document.addEventListener('mousemove', (event) => {
        if (!isDragging) { return };
        
        const pt = draw.node.createSVGPoint();
        pt.x = event.clientX;
        pt.y = event.clientY;
        const cursor = pt.matrixTransform(draw.node.getScreenCTM().inverse());
        
        const dx = cursor.x - centerX;
        const dy = cursor.y - centerY;
        const angle = Math.atan2(dy, dx);
        const angleDeg = angle * 180 / Math.PI;
        
        knob.center(
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
        );
        
        shaft.rotate(angleDeg - currentAngle, centerX, centerY);
        currentAngle = angleDeg;
        updateFrontView(angleDeg);
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function updateFrontView(angle) {
    let newShaftLength = 0;
    let newShaftMargin = 0;
    let newKnobMargin = 0;
    const fixedShaftX = 3 * canvasWidth / 4 - connectingRodWidth / 2;
    const fixedKnobX = 3 * canvasWidth / 4 - connectingRodWidth / 2 + shaftLength - knobWidth - 10
    
    const angleDeg = angle;
    if ((angle >= 0 && angle <= 90) || (angle < 0 && angle >= -90)) {
        angle = Math.abs(angle);
        newShaftLength = connectingRodWidth + (shaftLength - connectingRodWidth) * (1 - angle / 90); // Decreasing size
        newShaftMargin = fixedShaftX;
        newKnobMargin = fixedKnobX - shaftLength + knobWidth + 7.5 + (shaftLength - knobWidth - 7.5) * (1 - angle / 90);
    } else { 
        angle = Math.abs(angle);
        newShaftLength = connectingRodWidth + (shaftLength - connectingRodWidth) * ((angle - 90) / 90); // Increasing size in the opposite direction
        newShaftMargin = fixedShaftX - newShaftLength + connectingRodWidth;
        newKnobMargin = fixedKnobX - shaftLength + knobWidth + 7.5 - (shaftLength - knobWidth - 7.5) * ((angle - 90) / 90);
    }

    console.log(angleDeg);
    if (angleDeg >= 0) {
        redrawConnectingRod();
        redrawShaft(newShaftLength, newShaftMargin);
        redrawKnob(newKnobMargin)
    } else {
        redrawKnob(newKnobMargin);
        redrawConnectingRod();
        redrawShaft(newShaftLength, newShaftMargin);
    }
}

function redrawConnectingRod() {
    connectingRod.remove(); // Remove old element
    connectingRod = draw.rect(connectingRodWidth, connectingRodHeight) // Recreate element
        .center(3 * canvasWidth / 4, canvasHeight / 2 - containerHeight / 2 + innerMargin / 2 - connectingRodHeight / 2)
        .fill('#eeeeee')
        .stroke({ color: borderHexCode, width: 1 });
}

function redrawShaft(newShaftLength, newShaftMargin) {
    shaftFrontView.remove(); // Remove old element
    shaftFrontView = draw.rect(newShaftLength, 20) // Recreate element
        .move(newShaftMargin, canvasHeight / 2 - containerHeight / 2 + innerMargin / 2 - connectingRodHeight + 4)
        .fill('#000')
        .stroke({ color: 'black', width: 1 });;
}

function redrawKnob(newKnobMargin) {
    knobFrontView.remove(); // Remove old element
    knobFrontView = draw.rect(knobWidth, knobHeight) // Recreate element
        .move(newKnobMargin, canvasHeight / 2 - containerHeight / 2 + innerMargin / 2 - connectingRodHeight + 4 - 40)
        .fill('#989788')
        .stroke({ color: 'black', width: 1 });
}
