import { addOptionToDragAndZoom } from './zoom.js';
import * as config from './config.js';

let windowWidth = window.innerWidth - 60;
let windowHeight = windowWidth * config.canvasHeight / config.canvasWidth;

const draw = SVG().addTo('#svg-container').size(windowWidth, windowHeight);
window.svgDraw = draw; // Make global if needed by other modules like simulation/reset

draw.viewbox(0, 0, config.canvasWidth, config.canvasHeight);
draw.attr('preserveAspectRatio', 'xMidYMid meet');

window.addEventListener('resize', function() {
    windowWidth = window.innerWidth - 60;
    // Ensure height calculation respects potential container limits if needed
    windowHeight = windowWidth * config.canvasHeight / config.canvasWidth;
    draw.size(windowWidth, windowHeight);
    // You might not need to explicitly set viewbox again if preserveAspectRatio is working
    // draw.viewbox(0, 0, config.canvasWidth, config.canvasHeight);
});

addOptionToDragAndZoom(draw);