/**
 * Calculate the amount of CO2 adsorbed on a surface
 * as a function of time using a first-order rate equation.
 * 
 * @param {Object} args - The arguments object.
 * @param {number} args.t - The time in seconds.
 * @param {number} args.ka - The adsorption rate constant in m^3/(mol*s).
 * @param {number} args.kd - The desorption rate constant in s^-1.
 * @param {number} args.cCO2 - The concentration of CO2 in mol/m^3.
 * @returns {number} - The amount of CO2 adsorbed on the surface.
 */
function theta(args) {
  const t = args.t
    // These constants were chosen to achieve adsorption specified in OneNote.
  const ka = args.ka || 9.120e-6;
  const kd = args.kd || 4.365e-4;
  const cCO2 = args.cCO2;

  const p = ka * cCO2 + kd;
  const q = ka * cCO2;

  const theta0 = 0; // initial amount adsorbed

  const thetaEq = q / p;
  const d = theta0 - thetaEq;

  const exp = Math.exp(-p * t);

  const theta = thetaEq + d * exp;

  return theta;
}

/**
 * Calculate the concentration of CO2 in a gas mixture
 * using the ideal gas law.
 * 
 * @param {Object} args - The arguments object.
 * @param {number} args.P - The total pressure of the gas mixture in bar.
 * @param {number} args.T - The temperature of the gas mixture in K.
 * @param {number} args.yCO2 - The mole fraction of CO2 in the gas mixture.
 * @returns {number} - The concentration of CO2 in mol/m^3.
 */
function cCO2(args) {
  const P = args.P ** 0.79; // adjusted to fit experimental data
  const T = 250 + 532 * ((args.T - 273) / (348 - 273)); // adjusted to fit experimental data
  const yCO2 = args.yCO2;

  const PCO2 = P * yCO2; // partial pressure of CO2

  const R = 0.08314; // L * bar / (K * mol)

  // Ideal gas law: PV = nRT => n/V = P/RT
  return 1000 * PCO2 / (R * T); // (converted to mol / m^3)
}

/**
 * Calculate the outlet mole fraction of CO2 in a gas mixture
 * after passing through a zeolite membrane.
 * 
 * @param {Object} args - The arguments object.
 * @param {number} args.t - The time in seconds.
 * @param {number} args.tStep - The time step in seconds.
 * @param {number} args.V - The volume of the gas mixture in m^3.
 * @param {number} args.P - The total pressure of the gas mixture in bar.
 * @param {number} args.T - The temperature of the gas mixture in K.
 * @param {number} args.yCO2 - The mole fraction of CO2 in the gas mixture.
 * @returns {number} - The outlet mole fraction of CO2 in the gas mixture.
 */
export function yCO2_out(args) {
  const t = args.t * 20;
  const tStep = args.tStep * 20;
  const V = args.V;
  const P = args.P;
  const T = args.T;
  const y = Math.min(args.yCO2, 0.99);

  const R = 0.08314; // L * bar / (K * mol)
  const n = P * V / (R * T); // total number of moles in the gas mixture

  const nCO2 = n * y; // molar flow rate of CO2
  const nN2 = n * (1 - y); // molar flow rate of N2

  const mZeolite = 1.4; // mass of zeolite, kg
  const nBinding = 12; // maximum adsorption capacity (12 mmol / g)
  const nMax = mZeolite * nBinding; // maximum number of moles of CO2 that can be adsorbed

  const C = cCO2({ P: P, T: T, yCO2: y }); // concentration of CO2 in mol / m^3
  const th0 = theta({ t: t, cCO2: C }); // initial amount adsorbed
  const th1 = theta({ t: t + tStep, cCO2: C }); // amount adsorbed after time tStep

  const amount_adsorbed = nMax * (th1 - th0); // moles of CO2 adsorbed in time tStep

  const amount_passed_through = Math.max(0, nCO2 * tStep - amount_adsorbed); // the amount of CO2 that did not adsorb in time tStep

  const yOut = (amount_passed_through / tStep) / (amount_passed_through / tStep + nN2) || 0;

  return yOut;
}

// (function testTheta() {
//   const P = 5.0;
//   const T = 273;
//   const t = 1e9;
//   const C = cCO2({
//     P: P,
//     T: T,
//     yCO2: 1
//   });

//   const thTheor = theta({
//     t: t,
//     cCO2: C
//   }) * 12;

//   console.log({ P, T, thTheor });
// })()

// (function findKa_Kd() {
//   const data = [
//     [0.1, 273, 1.50],
//     [0.1, 298, 1.20],
//     [0.1, 323, 0.95],
//     [0.1, 348, 0.75],
//     [0.5, 273, 3.75],
//     [0.5, 298, 3.00],
//     [0.5, 323, 2.45],
//     [0.5, 348, 2.00],
//     [1.0, 273, 5.90],
//     [1.0, 298, 4.80],
//     [1.0, 323, 3.90],
//     [1.0, 348, 3.10],
//     [2.0, 273, 7.80],
//     [2.0, 298, 6.50],
//     [2.0, 323, 5.40],
//     [2.0, 348, 4.50],
//     [5.0, 273, 10.20],
//     [5.0, 298, 8.50],
//     [5.0, 323, 7.00],
//     [5.0, 348, 5.90],
//     [10.0, 273, 12.00],
//     [10.0, 298, 10.10],
//     [10.0, 323, 8.50],
//     [10.0, 348, 7.20]
//   ];
//   const t = 1e5;

//   let err = 1e9;
//   let kaBest, kdBest;
//   let iterations = 0;
//   const kaStart = 1e-6;
//   const kaEnd = 1e-3;
//   const kaStep = Math.pow(kaEnd / kaStart, 1 / 1e2);
//   const kdStart = 1e-4;
//   const kdEnd = 1;
//   const kdStep = Math.pow(kdEnd / kdStart, 1 / 1e2);
//   for (let ka = kaStart; ka < kaEnd; ka *= kaStep) {
//     for (let kd = kdStart; kd < kdEnd; kd *= kdStep) {
//       let diff = 0;
//       for (let i = 0; i < data.length; i++) {
//         const P = data[i][0];
//         const T = data[i][1];
//         const thExp = data[i][2] / 12;

//         const C = cCO2({
//           P: P,
//           T: T,
//           yCO2: 1
//         });

//         const thTheor = theta({
//           t: t,
//           ka: ka,
//           kd: kd,
//           cCO2: C
//         });
//         const thDiff = Math.abs(thExp - thTheor);
//         diff += thDiff;
//         iterations++;
//       }
//       if (diff < err) {
//         err = diff;
//         kaBest = ka;
//         kdBest = kd;
//       }
//     }
//   }

//   console.log(iterations);
//   console.log(`Best ka: ${kaBest.toExponential(3)}, Best kd: ${kdBest.toExponential(3)}, Error: ${err}`);
// })()