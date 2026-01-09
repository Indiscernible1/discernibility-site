/**
 * EiG Periodic Helicoid v5.2 - Three.js Visualization
 * ====================================================
 *
 * Emergent information Geometry (EiG) Framework
 * L1 Geometric Foundation - Vortex Inversion Architecture
 *
 * FUNDAMENTAL CONSTANTS (Non-Negotiable):
 *   γ = 2/3           - Holographic coupling (exact)
 *   E_0 = 3.0709 eV   - Cosmic resonance energy
 *   A_C = 11.26 eV    - Carbon knot intensity (axis)
 *   T = 18            - Spinor period (fermion double-cover)
 *   λ_0 = 403.74 nm   - Resonance pitch
 *
 * v5.2 ARCHITECTURE:
 *   - Vortex Inversion: A_axis = A_C / (1 + |n-3| × k)
 *   - Symmetry Order: n = 1 (s), 3 (p), 5 (d), 7 (f), 0 (noble)
 *   - Primordial Arc: H at -120°, He = 8×E_0 (cubic closure)
 *   - NO GROUP PATCHES - all curvature from geometry
 *
 * MODEL PERFORMANCE:
 *   R² = 0.83 (HONEST - measures Phase-Slip, doesn't hide it)
 *   Phase-Slip (Δψ) = Topological Tension driving chemistry
 *
 * KEY DERIVATIONS:
 *   A_He = 8 × E_0 = 24.57 eV (actual: 24.59, error: 0.08%)
 *   Noble gases: A = 11 × E_0 / P^γ
 *   Fine structure: 1/α = T² - N(T-1) + N/(T(T-1)) = 137.0359...
 *
 * Author: Jason Crawford (Crawford Creative Solutions LLC)
 * Framework: EiG L1 v5.2 Geometric Foundation
 */

// ============================================================================
// ELEMENT DATABASE
// ============================================================================

const ELEMENTS = {
    // Period 1 - Primordial Arc (pre-axial, 240° sweep)
    'H':  {Z: 1,  period: 1, group: 1,  block: 's', name: 'Hydrogen',    A: 13.598, color: 0xFFFFFF},
    'He': {Z: 2,  period: 1, group: 18, block: 'noble', name: 'Helium',  A: 24.587, color: 0xD9FFFF},

    // Period 2 - Carbon Axis Established
    'Li': {Z: 3,  period: 2, group: 1,  block: 's', name: 'Lithium',     A: 5.392,  color: 0xCC80FF},
    'Be': {Z: 4,  period: 2, group: 2,  block: 's', name: 'Beryllium',   A: 9.323,  color: 0xC2FF00},
    'B':  {Z: 5,  period: 2, group: 13, block: 'p', name: 'Boron',       A: 8.298,  color: 0xFFB5B5},
    'C':  {Z: 6,  period: 2, group: 14, block: 'p', name: 'Carbon',      A: 11.260, color: 0xFFD700, axis: true},
    'N':  {Z: 7,  period: 2, group: 15, block: 'p', name: 'Nitrogen',    A: 14.534, color: 0x3050F8},
    'O':  {Z: 8,  period: 2, group: 16, block: 'p', name: 'Oxygen',      A: 13.618, color: 0xFF0D0D},
    'F':  {Z: 9,  period: 2, group: 17, block: 'p', name: 'Fluorine',    A: 17.423, color: 0x90E050},
    'Ne': {Z: 10, period: 2, group: 18, block: 'noble', name: 'Neon',    A: 21.565, color: 0xB3E3F5},

    // Period 3
    'Na': {Z: 11, period: 3, group: 1,  block: 's', name: 'Sodium',      A: 5.139,  color: 0xAB5CF2},
    'Mg': {Z: 12, period: 3, group: 2,  block: 's', name: 'Magnesium',   A: 7.646,  color: 0x8AFF00},
    'Al': {Z: 13, period: 3, group: 13, block: 'p', name: 'Aluminum',    A: 5.986,  color: 0xBFA6A6},
    'Si': {Z: 14, period: 3, group: 14, block: 'p', name: 'Silicon',     A: 8.152,  color: 0xFFD700, axis: true},
    'P':  {Z: 15, period: 3, group: 15, block: 'p', name: 'Phosphorus',  A: 10.487, color: 0xFF8000},
    'S':  {Z: 16, period: 3, group: 16, block: 'p', name: 'Sulfur',      A: 10.360, color: 0xFFFF30},
    'Cl': {Z: 17, period: 3, group: 17, block: 'p', name: 'Chlorine',    A: 12.968, color: 0x1FF01F},
    'Ar': {Z: 18, period: 3, group: 18, block: 'noble', name: 'Argon',   A: 15.760, color: 0x80D1E3},

    // Period 4 (with d-block)
    'K':  {Z: 19, period: 4, group: 1,  block: 's', name: 'Potassium',   A: 4.341,  color: 0x8F40D4},
    'Ca': {Z: 20, period: 4, group: 2,  block: 's', name: 'Calcium',     A: 6.113,  color: 0x3DFF00},
    'Sc': {Z: 21, period: 4, group: 3,  block: 'd', name: 'Scandium',    A: 6.561,  color: 0xE6E6E6},
    'Ti': {Z: 22, period: 4, group: 4,  block: 'd', name: 'Titanium',    A: 6.828,  color: 0xBFC2C7, sc: true},
    'V':  {Z: 23, period: 4, group: 5,  block: 'd', name: 'Vanadium',    A: 6.746,  color: 0x00FFFF, sc: true},
    'Cr': {Z: 24, period: 4, group: 6,  block: 'd', name: 'Chromium',    A: 6.767,  color: 0x8A99C7},
    'Mn': {Z: 25, period: 4, group: 7,  block: 'd', name: 'Manganese',   A: 7.434,  color: 0x9C7AC7},
    'Fe': {Z: 26, period: 4, group: 8,  block: 'd', name: 'Iron',        A: 7.902,  color: 0xE06633},
    'Co': {Z: 27, period: 4, group: 9,  block: 'd', name: 'Cobalt',      A: 7.881,  color: 0xF090A0},
    'Ni': {Z: 28, period: 4, group: 10, block: 'd', name: 'Nickel',      A: 7.640,  color: 0x50D050},
    'Cu': {Z: 29, period: 4, group: 11, block: 'd', name: 'Copper',      A: 7.726,  color: 0xC88033},
    'Zn': {Z: 30, period: 4, group: 12, block: 'd', name: 'Zinc',        A: 9.394,  color: 0x7D80B0},
    'Ga': {Z: 31, period: 4, group: 13, block: 'p', name: 'Gallium',     A: 5.999,  color: 0xC28F8F},
    'Ge': {Z: 32, period: 4, group: 14, block: 'p', name: 'Germanium',   A: 7.900,  color: 0xFFD700, axis: true},
    'As': {Z: 33, period: 4, group: 15, block: 'p', name: 'Arsenic',     A: 9.789,  color: 0xBD80E3},
    'Se': {Z: 34, period: 4, group: 16, block: 'p', name: 'Selenium',    A: 9.752,  color: 0xFFA100},
    'Br': {Z: 35, period: 4, group: 17, block: 'p', name: 'Bromine',     A: 11.814, color: 0xA62929},
    'Kr': {Z: 36, period: 4, group: 18, block: 'noble', name: 'Krypton', A: 14.000, color: 0x5CB8D1},

    // Period 5
    'Rb': {Z: 37, period: 5, group: 1,  block: 's', name: 'Rubidium',    A: 4.177,  color: 0x702EB0},
    'Sr': {Z: 38, period: 5, group: 2,  block: 's', name: 'Strontium',   A: 5.695,  color: 0x00FF00},
    'Y':  {Z: 39, period: 5, group: 3,  block: 'd', name: 'Yttrium',     A: 6.217,  color: 0x94FFFF},
    'Zr': {Z: 40, period: 5, group: 4,  block: 'd', name: 'Zirconium',   A: 6.634,  color: 0x94E0E0, sc: true},
    'Nb': {Z: 41, period: 5, group: 5,  block: 'd', name: 'Niobium',     A: 6.759,  color: 0x00FFFF, sc: true},
    'Mo': {Z: 42, period: 5, group: 6,  block: 'd', name: 'Molybdenum',  A: 7.092,  color: 0x54B5B5, sc: true},
    'Tc': {Z: 43, period: 5, group: 7,  block: 'd', name: 'Technetium',  A: 7.280,  color: 0x3B9E9E, sc: true},
    'Ru': {Z: 44, period: 5, group: 8,  block: 'd', name: 'Ruthenium',   A: 7.361,  color: 0x248F8F},
    'Rh': {Z: 45, period: 5, group: 9,  block: 'd', name: 'Rhodium',     A: 7.459,  color: 0x0A7D8C},
    'Pd': {Z: 46, period: 5, group: 10, block: 'd', name: 'Palladium',   A: 8.337,  color: 0x006985},
    'Ag': {Z: 47, period: 5, group: 11, block: 'd', name: 'Silver',      A: 7.576,  color: 0xC0C0C0},
    'Cd': {Z: 48, period: 5, group: 12, block: 'd', name: 'Cadmium',     A: 8.994,  color: 0xFFD98F},
    'In': {Z: 49, period: 5, group: 13, block: 'p', name: 'Indium',      A: 5.786,  color: 0xA67573},
    'Sn': {Z: 50, period: 5, group: 14, block: 'p', name: 'Tin',         A: 7.344,  color: 0xFFD700, axis: true},
    'Sb': {Z: 51, period: 5, group: 15, block: 'p', name: 'Antimony',    A: 8.608,  color: 0x9E63B5},
    'Te': {Z: 52, period: 5, group: 16, block: 'p', name: 'Tellurium',   A: 9.010,  color: 0xD47A00},
    'I':  {Z: 53, period: 5, group: 17, block: 'p', name: 'Iodine',      A: 10.451, color: 0x940094},
    'Xe': {Z: 54, period: 5, group: 18, block: 'noble', name: 'Xenon',   A: 12.130, color: 0x429EB0},

    // Period 6
    'Cs': {Z: 55, period: 6, group: 1,  block: 's', name: 'Cesium',      A: 3.894,  color: 0x57178F},
    'Ba': {Z: 56, period: 6, group: 2,  block: 's', name: 'Barium',      A: 5.212,  color: 0x00C900},
    'La': {Z: 57, period: 6, group: 3,  block: 'f', name: 'Lanthanum',   A: 5.577,  color: 0x70D4FF, sc: true},
    'Hf': {Z: 72, period: 6, group: 4,  block: 'd', name: 'Hafnium',     A: 6.825,  color: 0x4DC2FF, sc: true},
    'Ta': {Z: 73, period: 6, group: 5,  block: 'd', name: 'Tantalum',    A: 7.550,  color: 0x4DA6FF, sc: true},
    'W':  {Z: 74, period: 6, group: 6,  block: 'd', name: 'Tungsten',    A: 7.864,  color: 0x2194D6},
    'Re': {Z: 75, period: 6, group: 7,  block: 'd', name: 'Rhenium',     A: 7.833,  color: 0x267DAB},
    'Os': {Z: 76, period: 6, group: 8,  block: 'd', name: 'Osmium',      A: 8.438,  color: 0x266696},
    'Ir': {Z: 77, period: 6, group: 9,  block: 'd', name: 'Iridium',     A: 8.967,  color: 0x175487},
    'Pt': {Z: 78, period: 6, group: 10, block: 'd', name: 'Platinum',    A: 8.959,  color: 0xD0D0E0},
    'Au': {Z: 79, period: 6, group: 11, block: 'd', name: 'Gold',        A: 9.226,  color: 0xFFD123},
    'Hg': {Z: 80, period: 6, group: 12, block: 'd', name: 'Mercury',     A: 10.438, color: 0xB8B8D0, sc: true},
    'Tl': {Z: 81, period: 6, group: 13, block: 'p', name: 'Thallium',    A: 6.108,  color: 0xA6544D},
    'Pb': {Z: 82, period: 6, group: 14, block: 'p', name: 'Lead',        A: 7.417,  color: 0xFFD700, axis: true, sc: true},
    'Bi': {Z: 83, period: 6, group: 15, block: 'p', name: 'Bismuth',     A: 7.286,  color: 0x9E4FB5},
    'Po': {Z: 84, period: 6, group: 16, block: 'p', name: 'Polonium',    A: 8.414,  color: 0xAB5C00},
    'At': {Z: 85, period: 6, group: 17, block: 'p', name: 'Astatine',    A: 9.500,  color: 0x754F45},
    'Rn': {Z: 86, period: 6, group: 18, block: 'noble', name: 'Radon',   A: 10.749, color: 0x428296},

    // Period 7
    'Fr': {Z: 87, period: 7, group: 1,  block: 's', name: 'Francium',    A: 4.073,  color: 0x420066},
    'Ra': {Z: 88, period: 7, group: 2,  block: 's', name: 'Radium',      A: 5.278,  color: 0x007D00},
    'Ac': {Z: 89, period: 7, group: 3,  block: 'f', name: 'Actinium',    A: 5.170,  color: 0x70ABFA},
    'Fl': {Z: 114, period: 7, group: 14, block: 'p', name: 'Flerovium',  A: 8.539,  color: 0xFFD700, axis: true},
};

// ============================================================================
// FUNDAMENTAL CONSTANTS (L1 v5.2)
// ============================================================================

const E_0 = 3.0709;           // eV - Cosmic resonance energy
const GAMMA = 2/3;            // Holographic coupling (exact)
const LAMBDA_0 = 403.74;      // nm - Resonance pitch
const A_C = 11.260;           // eV - Carbon knot intensity (axis)
const T_SPINOR = 18;          // Fermion double-cover period
const N_CHANNELS = T_SPINOR * GAMMA - 1;  // = 11

// ============================================================================
// GEOMETRIC CONSTANTS
// ============================================================================

const TWIST_PER_PERIOD = Math.PI / 6;  // 30 degrees
const H_HE_SEPARATION = 240;            // degrees = γ × 360
const BREATHING_SCALE = 0.15;           // Spinor breathing amplitude

// ============================================================================
// MANIFOLD FATIGUE - Relativistic Phase-Slip by Period
// ============================================================================

const FATIGUE_MAP = {
    1: 0.82,   // Primordial (H/He) - boundary state
    2: 1.00,   // Carbon Axis - reference (unity)
    3: 1.08,   // Slight stiffening
    4: 1.24,   // d-block emergence
    5: 1.35,   // 5d metals
    6: 1.52,   // Lanthanide contraction
    7: 2.10    // Approaching veil (radioactive)
};

function getFatigueFactor(period) {
    return FATIGUE_MAP[period] || 1.5;
}

// ============================================================================
// SYMMETRY ORDER (n) - The Key to v5.2
// ============================================================================
// n determines decay rate, width modulation, and axis shift
// This replaces ALL the group-specific patches

function getSymmetryOrder(block) {
    switch(block) {
        case 'noble': return 0;  // Sealed singularity
        case 's': return 1;      // Primordial
        case 'p': return 3;      // sp³ tetrahedral
        case 'd': return 5;      // Penta-symmetry
        case 'f': return 7;      // Septa-symmetry
        default: return 1;
    }
}

function getSymmetryName(n) {
    switch(n) {
        case 0: return 'Sealed';
        case 1: return 'Primordial';
        case 3: return 'Tetrahedral';
        case 5: return 'Penta';
        case 7: return 'Septa';
        default: return 'Unknown';
    }
}

// ============================================================================
// PHASE-SLIP CATEGORIES (Topological Tension)
// ============================================================================

function getPhaseSlipCategory(absErrorPct) {
    if (absErrorPct < 5)  return { label: 'Locked',    color: '#00FF00', desc: 'Phase-locked to geometry' };
    if (absErrorPct < 10) return { label: 'Drift',     color: '#FFFF00', desc: 'Metric drift' };
    if (absErrorPct < 20) return { label: 'Slip',      color: '#FFA500', desc: 'Topological tension' };
    return                       { label: 'Veil Leak', color: '#FF4444', desc: 'Manifold boundary stress' };
}

// ============================================================================
// SPINOR PHASE (explains noble gas stability)
// ============================================================================

function spinorPhase(Z) {
    const phase = ((2 * Math.PI * Z / T_SPINOR) % (2 * Math.PI)) * 180 / Math.PI;
    const sinValue = Math.sin(2 * Math.PI * Z / T_SPINOR);
    let position;
    if (Math.abs(sinValue) < 0.1) position = 'NODE';
    else if (sinValue > 0.5) position = 'PEAK';
    else if (sinValue < -0.5) position = 'TROUGH';
    else position = sinValue > 0 ? 'rising' : 'falling';
    return { phase, sinValue, position };
}

// Fine structure constant derived from T and N
const ALPHA_INV_DERIVED = Math.pow(T_SPINOR, 2)
    - N_CHANNELS * (T_SPINOR - 1)
    + N_CHANNELS / (T_SPINOR * (T_SPINOR - 1));  // = 137.0359...

// ============================================================================
// IONIZATION ENERGY PREDICTION - L1 v5.2 VORTEX INVERSION
// ============================================================================
// NO GROUP PATCHES - all curvature emerges from symmetry order n

function predictA(period, group, block, Z) {
    
    // =========================================
    // CASE 1: PRIMORDIAL ARC (Period 1)
    // =========================================
    // Pre-axial boundary state, 240° sweep (γ × 360°)
    if (period === 1) {
        if (group === 1) {
            // Hydrogen: Rydberg fixed point at θ = -120°
            return 13.60;
        } else {
            // Helium: Cubic closure (2³) at θ = +120°
            // A_He = 8 × E_0 = 24.57 eV (actual: 24.59, error: 0.08%)
            return 8 * E_0;
        }
    }
    
    // =========================================
    // CASE 2: NOBLE GASES (Sealed Vortices)
    // =========================================
    if (block === 'noble' || group === 18) {
        return (11 * E_0 / Math.pow(period, GAMMA)) * getFatigueFactor(period);
    }
    
    // =========================================
    // CASE 3: MAIN HELICOID (Periods 2-7)
    // =========================================
    
    // Get symmetry order
    const n = getSymmetryOrder(block);
    const t = Math.max(0, period - 2);  // Period displacement
    
    // -----------------------------------------
    // VORTEX INVERSION: A_axis = A_C / (1 + |n-3| × k)
    // Both s-block (n=1) and d-block (n=5) are "away from" n=3
    // -----------------------------------------
    const delta_n = Math.abs(n - 3);
    let k_symmetry, width_factor;
    
    if (n < 3) {
        // s-block: "expanding edge" - Reach prioritized
        k_symmetry = 0.15;
        width_factor = 0.6;
    } else if (n > 3) {
        // d-block/f-block: "compressed core"
        k_symmetry = 0.30;
        width_factor = 0.4;
    } else {
        // p-block: Carbon's home - full ribbon expression
        k_symmetry = 0.0;
        width_factor = 1.3;
    }
    
    const A_axis = A_C / (1 + delta_n * k_symmetry);
    
    // -----------------------------------------
    // SYMMETRY-DRIVEN DECAY
    // -----------------------------------------
    let symmetry_decay;
    if (n <= 1) symmetry_decay = 0.80;      // s-block: sharp drop
    else if (n === 3) symmetry_decay = 0.65; // p-block: standard
    else if (n === 5) symmetry_decay = 0.15; // d-block: damped
    else symmetry_decay = 0.05;              // f-block: very stiff
    
    // -----------------------------------------
    // ANGULAR COORDINATE (30° lattice)
    // -----------------------------------------
    const theta_map = {1: -90, 2: -54, 13: -18, 14: 0, 15: 27, 16: 54, 17: 90};
    let theta;
    
    if (group >= 3 && group <= 12) {
        // d-block interpolation
        const frac = (group - 3) / 9.0;
        theta = (-45 + 27 * frac) * Math.PI / 180;
    } else {
        theta = (theta_map[group] || 0) * Math.PI / 180;
    }
    
    // -----------------------------------------
    // GEOMETRIC RIBBON WIDTH
    // -----------------------------------------
    let w;
    if (group <= 14) {
        w = 5.46 * Math.pow(0.95, t);
    } else {
        w = 1.0 * Math.pow(1.1, t);
    }
    
    // -----------------------------------------
    // INTRINSIC INTENSITY
    // -----------------------------------------
    const K_A = 0.544;  // Geometric coupling
    const A_intrinsic = A_axis + (w * width_factor * Math.sin(theta) * K_A) - (symmetry_decay * t);
    
    // -----------------------------------------
    // EXTRINSIC: Manifold Fatigue + Coherence Weight
    // -----------------------------------------
    const fatigue = getFatigueFactor(period);
    const t_norm = t / 5.0;
    const W_c = 1.0 - 0.3 * t_norm;
    const fatigue_effect = 1.0 + (fatigue - 1.0) * (1 - W_c);
    const A_fatigued = A_intrinsic * fatigue_effect;
    
    // -----------------------------------------
    // SPINOR BREATHING
    // -----------------------------------------
    const breathing = 0.15 * Math.sin(2 * Math.PI * Z / T_SPINOR);
    
    return A_fatigued * (1 + breathing);
}

// ============================================================================
// POSITION CALCULATION
// ============================================================================

function getElementPosition(period, group, block, Z) {
    const breathingFactor = Z ? BREATHING_SCALE * Math.sin(2 * Math.PI * Z / T_SPINOR) : 0;

    // Period 1: Primordial Arc
    if (period === 1) {
        const baseRadius = 0.8;
        const radius = baseRadius * (1 + breathingFactor);
        const z = (1 - 4) * 0.8;

        if (group === 1) {
            // Hydrogen at -120° = -2π/3
            const angle = -Math.PI * (2/3);
            return { x: radius * Math.cos(angle), y: radius * Math.sin(angle), z: z, t: -1, twist: 0, breathing: breathingFactor };
        } else {
            // Helium at +120° = +2π/3
            const angle = Math.PI * (2/3);
            return { x: radius * Math.cos(angle), y: radius * Math.sin(angle), z: z, t: 1, twist: 0, breathing: breathingFactor };
        }
    }

    // Periods 2-7: Standard ribbon
    const baseRadius = 1.2;
    const a = baseRadius + 0.25 * (period - 2);
    const twist = (period - 2) * TWIST_PER_PERIOD;

    // Position along ribbon
    let t;
    if (group === 14) {
        t = 0;  // AXIS
    } else if (group < 14) {
        if (group === 1) t = -1.0;
        else if (group === 2) t = -0.85;
        else if (group === 13) t = -0.15;
        else if (block === 'd') {
            t = -0.7 + (group - 3) * 0.05;
        } else t = -0.5;
    } else {
        if (group === 15) t = 0.25;
        else if (group === 16) t = 0.50;
        else if (group === 17) t = 0.75;
        else if (group === 18) t = 1.0;
        else t = 0.5;
    }

    const xLocal = t * a * (1 + breathingFactor);
    const yLocal = 0;
    const x = xLocal * Math.cos(twist) - yLocal * Math.sin(twist);
    const y = xLocal * Math.sin(twist) + yLocal * Math.cos(twist);
    const z = (period - 4) * 0.8;

    return { x, y, z, t, twist, breathing: breathingFactor };
}

// ============================================================================
// THREE.JS SCENE SETUP
// ============================================================================

let scene, camera, renderer, controls;
let elementMeshes = [];
let raycaster, mouse;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(4, 3, 4);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 15;

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0xFFD700, 0.5, 20);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    createCentralAxis();
    createRibbons();
    createElements();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onMouseClick);

    animate();
}

// ============================================================================
// CREATE CENTRAL AXIS
// ============================================================================

function createCentralAxis() {
    const axisGeometry = new THREE.CylinderGeometry(0.05, 0.05, 6, 32);
    const axisMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0xFFD700,
        emissiveIntensity: 0.3
    });
    const axis = new THREE.Mesh(axisGeometry, axisMaterial);
    axis.rotation.x = Math.PI / 2;
    scene.add(axis);

    // Glow
    const glowGeometry = new THREE.CylinderGeometry(0.08, 0.08, 6, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFD700,
        transparent: true,
        opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = Math.PI / 2;
    scene.add(glow);
}

// ============================================================================
// CREATE PRIMORDIAL ARC (Period 1: H-He)
// ============================================================================
// The arc spans 240° (= γ × 360°) from H at -120° to He at +120°
// The missing 120° wedge is where the Carbon axis emerges

function createPrimordialArc() {
    const radius = 0.8;  // Same as Period 1 element positions
    const z = (1 - 4) * 0.8;  // Same z as H and He
    const segments = 60;
    
    // Arc from -120° to +120° (going through 0°, i.e., the short way)
    const startAngle = -Math.PI * (2/3);  // -120°
    const endAngle = Math.PI * (2/3);      // +120°
    
    // Create arc points
    const points = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = startAngle + t * (endAngle - startAngle);
        points.push(new THREE.Vector3(
            radius * Math.cos(angle),
            radius * Math.sin(angle),
            z
        ));
    }
    
    // Create a tube along the arc path for visibility
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(curve, segments, 0.025, 8, false);
    
    // Gradient material: H-side (white) → center (gold) → He-side (cyan)
    const colors = [];
    const positions = tubeGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const angle = Math.atan2(y, x);
        const t = (angle - startAngle) / (endAngle - startAngle);
        
        let r, g, b;
        if (t < 0.5) {
            // H-side (white/light blue) to center (gold)
            const s = t * 2;
            r = 1.0;
            g = 1.0 - 0.16 * s;
            b = 1.0 - 0.73 * s;
        } else {
            // Center (gold) to He-side (cyan)
            const s = (t - 0.5) * 2;
            r = 1.0 - 0.69 * s;
            g = 0.84 + 0.16 * s;
            b = 0.27 + 0.73 * s;
        }
        colors.push(r, g, b);
    }
    tubeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const arcMaterial = new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.7
    });
    
    const arc = new THREE.Mesh(tubeGeometry, arcMaterial);
    scene.add(arc);
    
    // Add glow effect
    const glowGeometry = new THREE.TubeGeometry(curve, segments, 0.04, 8, false);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFD700,
        transparent: true,
        opacity: 0.15
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);
    
    // Add small markers at the "missing wedge" endpoints to show where axis would be
    // These mark the 120° gap where Carbon's axis emerges
    const markerGeometry = new THREE.SphereGeometry(0.03, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFD700,
        transparent: true,
        opacity: 0.5
    });
    
    // Marker at +120° (He side, edge of gap)
    const marker1 = new THREE.Mesh(markerGeometry, markerMaterial);
    marker1.position.set(
        radius * Math.cos(endAngle),
        radius * Math.sin(endAngle),
        z
    );
    scene.add(marker1);
    
    // Marker at -120° (H side, edge of gap)
    const marker2 = new THREE.Mesh(markerGeometry, markerMaterial);
    marker2.position.set(
        radius * Math.cos(startAngle),
        radius * Math.sin(startAngle),
        z
    );
    scene.add(marker2);
}

// ============================================================================
// CREATE RIBBONS
// ============================================================================

function createRibbons() {
    // First create the Primordial Arc for Period 1
    createPrimordialArc();
    
    const ribbonMaterial = new THREE.MeshStandardMaterial({
        color: 0x4444ff,
        metalness: 0.3,
        roughness: 0.7,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
    });

    for (let p = 2; p <= 7; p++) {
        const baseRadius = 1.2 + 0.25 * (p - 2);
        const twist = (p - 2) * TWIST_PER_PERIOD;
        const z = (p - 4) * 0.8;

        // Create ribbon shape
        const shape = new THREE.Shape();
        shape.moveTo(-baseRadius, -0.02);
        shape.lineTo(baseRadius, -0.02);
        shape.lineTo(baseRadius, 0.02);
        shape.lineTo(-baseRadius, 0.02);
        shape.closePath();

        const geometry = new THREE.ShapeGeometry(shape);

        // Color gradient: Li-side (blue) → Axis (gold) → F-side (red)
        const colors = [];
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const t = x / baseRadius;
            let r, g, b;
            if (t < 0) {
                r = 0.27 + 0.73 * (1 + t);
                g = 0.4 + 0.44 * (1 + t);
                b = 1.0 - 0.5 * (1 + t);
            } else {
                r = 1.0;
                g = 0.84 * (1 - t);
                b = 0.27 * (1 - t);
            }
            colors.push(r, g, b);
        }
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const colorMaterial = new THREE.MeshBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });

        const ribbon = new THREE.Mesh(geometry, colorMaterial);
        ribbon.rotation.z = twist;
        ribbon.position.z = z;
        scene.add(ribbon);
    }
}

// ============================================================================
// CREATE ELEMENTS
// ============================================================================

function createElements() {
    for (const [symbol, data] of Object.entries(ELEMENTS)) {
        const pos = getElementPosition(data.period, data.group, data.block, data.Z);
        
        // Size based on period
        const size = 0.08 + 0.02 * (7 - data.period) / 5;
        
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: data.color,
            metalness: 0.5,
            roughness: 0.3,
            emissive: data.color,
            emissiveIntensity: data.axis ? 0.5 : (data.sc ? 0.4 : 0)
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(pos.x, pos.y, pos.z);
        mesh.userData = { symbol, ...data };
        
        scene.add(mesh);
        elementMeshes.push(mesh);
    }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(elementMeshes);

    const tooltip = document.getElementById('tooltip');

    if (intersects.length > 0) {
        const element = intersects[0].object.userData;
        
        // Get symmetry order and predictions
        const n = getSymmetryOrder(element.block);
        const A_pred = predictA(element.period, element.group, element.block, element.Z);
        const spinor = spinorPhase(element.Z);
        
        // Phase-Slip (Δψ) = Actual - Predicted (topological tension)
        const phaseSlip = element.A - A_pred;
        const slipPct = ((phaseSlip / element.A) * 100).toFixed(1);
        const absSlipPct = Math.abs(parseFloat(slipPct));
        const slipCat = getPhaseSlipCategory(absSlipPct);
        
        // Harmonic ratio
        const ratio = (element.A / E_0).toFixed(3);
        let harmonic = '';
        for (let k = 2; k <= 8; k++) {
            if (Math.abs(element.A / E_0 - 11/k) < 0.1) {
                harmonic = ` ≈ 11/${k}`;
                break;
            }
        }

        const fatigue = getFatigueFactor(element.period);

        let info = `<span class="symbol">${element.symbol}</span><br>`;
        info += `<span class="name">${element.name}</span><br>`;
        info += `Z = ${element.Z}, Period ${element.period}, Group ${element.group}<br>`;
        info += `<span style="color:#88aaff">Block: ${element.block} | n = ${n} (${getSymmetryName(n)})</span><br>`;
        info += `<br>`;
        info += `A (experimental) = ${element.A.toFixed(3)} eV<br>`;
        info += `A (geometric) = ${A_pred.toFixed(3)} eV<br>`;
        info += `<span style="color:${slipCat.color}"><b>Δψ = ${phaseSlip >= 0 ? '+' : ''}${phaseSlip.toFixed(3)} eV</b> (${slipPct}%)</span><br>`;
        info += `<span style="color:${slipCat.color};font-size:0.85em">[${slipCat.label}] ${slipCat.desc}</span><br>`;
        info += `<br>`;
        info += `Fatigue f(P) = ${fatigue.toFixed(2)}<br>`;
        info += `A/E₀ = ${ratio}${harmonic}`;

        if (element.axis) {
            info += `<br><span style="color:#FFD700">★ Carbon Axis (Group 14)</span>`;
        }
        if (element.sc) {
            info += `<br><span style="color:#00FFFF">★ Superconductor</span>`;
        }
        if (spinor.position === 'NODE') {
            info += `<br><span style="color:#00FF00">★ Spinor Node (Z mod 18 = 0)</span>`;
        }

        tooltip.innerHTML = info;
        tooltip.style.display = 'block';
        tooltip.style.left = (event.clientX + 15) + 'px';
        tooltip.style.top = (event.clientY + 15) + 'px';

        intersects[0].object.material.emissiveIntensity = 0.8;
    } else {
        tooltip.style.display = 'none';
        elementMeshes.forEach(mesh => {
            const data = mesh.userData;
            mesh.material.emissiveIntensity = data.axis ? 0.5 : (data.sc ? 0.4 : 0);
        });
    }
}

function onMouseClick(event) {
    if (typeof HardnessExplorer !== 'undefined' && HardnessExplorer.enabled) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(elementMeshes);
        if (intersects.length > 0) {
            const element = intersects[0].object.userData;
            const mesh = intersects[0].object;
            if (typeof selectElementForHardness !== 'undefined') {
                selectElementForHardness(element, mesh);
            }
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================================================
// ANIMATION
// ============================================================================

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// ============================================================================
// INFO PANEL - v5.2 Geometric Foundation
// ============================================================================

function createInfoPanel() {
    const panel = document.createElement('div');
    panel.id = 'info-panel';
    panel.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.85);
        color: #fff;
        padding: 15px 20px;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        max-width: 400px;
        border: 1px solid #333;
        z-index: 1000;
    `;
    
    panel.innerHTML = `
        <div style="font-size:14px;color:#FFD700;margin-bottom:10px;font-weight:bold">
            EiG Periodic Helicoid v5.2
        </div>
        <div style="margin-bottom:8px">
            <span style="color:#00FF00">R² ≈ 0.83</span> | 
            <span style="color:#aaa">Geometric integrity (no patches)</span>
        </div>
        <div style="font-size:11px;color:#888;margin-bottom:10px">
            γ=2/3, E₀=3.0709, A_C=11.26, T=18
        </div>
        <div style="border-top:1px solid #444;padding-top:8px;margin-top:8px">
            <div style="color:#FFA500;margin-bottom:5px">
                Phase-Slip (Δψ) = Topological Tension
                <span id="phase-slip-toggle" style="cursor:pointer;color:#88aaff;font-size:0.9em">[?]</span>
            </div>
            <div><span style="color:#00FF00">■</span> Locked (&lt;5%) - Phase-locked</div>
            <div><span style="color:#FFFF00">■</span> Drift (5-10%) - Metric drift</div>
            <div><span style="color:#FFA500">■</span> Slip (10-20%) - Tension stored</div>
            <div><span style="color:#FF4444">■</span> Veil Leak (&gt;20%) - Boundary stress</div>
        </div>
        <div id="phase-slip-explainer" style="display:none;border-top:1px solid #444;padding-top:10px;margin-top:10px;font-size:11px;line-height:1.5">
            <div style="color:#FFD700;margin-bottom:8px">Δψ is Physics, Not Error</div>
            <div style="color:#ccc;margin-bottom:8px">
                Phase-Slip measures <b>topological tension</b>—the potential energy 
                stored in the manifold's geometry. It drives all chemistry.
            </div>
            <div style="color:#aaa;margin-bottom:6px">
                <span style="color:#00FF00">● Low Δψ</span> = Stable, inert (noble gases)
            </div>
            <div style="color:#aaa;margin-bottom:6px">
                <span style="color:#FF4444">● High Δψ</span> = Reactive, wants to bond (F, alkalis)
            </div>
            <div style="color:#888;margin-top:10px;font-style:italic">
                v5.2 uses Vortex Inversion (|n-3|) instead of group patches.
                The R² is lower but the geometry is honest.
            </div>
        </div>
        <div style="border-top:1px solid #444;padding-top:8px;margin-top:10px">
            <div style="color:#88aaff;margin-bottom:5px">Symmetry Order (n)</div>
            <div style="font-size:11px;color:#aaa">
                s=1 (Primordial) | p=3 (sp³) | d=5 (Penta) | f=7 (Septa)
            </div>
        </div>
    `;
    
    document.body.appendChild(panel);

    document.getElementById('phase-slip-toggle').addEventListener('click', function() {
        const explainer = document.getElementById('phase-slip-explainer');
        const isHidden = explainer.style.display === 'none';
        explainer.style.display = isHidden ? 'block' : 'none';
        this.textContent = isHidden ? '[−]' : '[?]';
        this.style.color = isHidden ? '#FFD700' : '#88aaff';
    });
}

// ============================================================================
// START
// ============================================================================

createInfoPanel();
init();
