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
  const ka = 2.5e-4 || args.ka;
  const kd = 3e-3 || args.kd;
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
  const P = args.P;
  const T = args.T;
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
 * @param {number} args.m - The mass flow rate of the gas mixture in g/s.
 * @param {number} args.P - The total pressure of the gas mixture in bar.
 * @param {number} args.T - The temperature of the gas mixture in K.
 * @param {number} args.yCO2 - The mole fraction of CO2 in the gas mixture.
 * @returns {number} - The outlet mole fraction of CO2 in the gas mixture.
 */
export function yCO2_out(args) {
  const t = args.t;
  const tStep = args.tStep;
  const m = args.m;
  const P = args.P;
  const T = args.T;
  const y = args.yCO2;

  const MW_CO2 = 44.01; // g / mol
  const MW_N2 = 28.02; // g / mol

  const n = m / (y * MW_CO2 + (1 - y) * MW_N2); // total molar flow rate
  const nCO2 = n * y; // molar flow rate of CO2
  const nN2 = n * (1 - y); // molar flow rate of N2

  const mZeolite = 0.00018; // mass of zeolite, kg
  const nBinding = 6; // maximum adsorption capacity (6 mol / kg)
  const nMax = mZeolite * nBinding; // maximum number of moles of CO2 that can be adsorbed

  const C = cCO2({ P: P, T: T, yCO2: y }); // concentration of CO2 in mol / m^3
  const th0 = theta({ t: t, cCO2: C }); // initial amount adsorbed
  const th1 = theta({ t: t + tStep, cCO2: C }); // amount adsorbed after time tStep

  const amount_adsorbed = nMax * (th1 - th0); // moles of CO2 adsorbed in time tStep

  const amount_passed_through = Math.max(0, nCO2 * tStep - amount_adsorbed); // the amount of CO2 that did not adsorb in time tStep

  const yOut = (amount_passed_through / tStep) / (amount_passed_through / tStep + nN2);

  return yOut;
}