// import * as state from './state.js';

// /**
//  * The function `updateDigitalPressureGauge` updates a digital pressure gauge based on current pressure
//  * values and multi-valve position.
//  * @returns The `updateDigitalPressureGauge` function is returning the total pressure value calculated
//  * based on the current gauge position and values of gauge1, gauge2, and gauge3. The pressure value is
//  * then updated in the text element of the digital pressure gauge.
//  */
// export function updateDigitalPressureGauge() {
//   const gauge = document.querySelector('.digital-pressure-gauge');
//   if (!gauge) return;

//   // Get current pressure values and calculate sum
//   const gauge1Value = state.getGaugeValue('gauge1', 0.1);
//   const gauge2Value = state.getGaugeValue('gauge2', 0.1);
//   const gauge3Value = state.getGaugeValue('gauge3', 0.1);

//   const gaugePosition = state.getCurrentMultiValvePosition();
//   let pressure;

//   if (gaugePosition === 270) {
//     pressure = `0.0`;
//   } else if (gaugePosition === 0) {
//     pressure = gauge3Value.toFixed(1)
//   } else if (gaugePosition = 90) {
//     pressure = gauge2Value.toFixed(1);
//   } else {
//     pressure = gauge1Value.toFixed(1);
//   }

//   // Update the text element with the total pressure
//   const textElements = gauge.querySelectorAll('text');
//   if (textElements.length > 0) {
//     textElements[0].textContent = pressure;
//   }
// }