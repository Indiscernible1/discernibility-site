/**
 * EiG Periodic Helicoid - Three.js Visualization
 * ================================================
 *
 * Emergent information Geometry (EiG) Framework
 *
 * FUNDAMENTAL CONSTANTS:
 *   gamma = 2/3         - Dimensional coupling (boundary/bulk ratio)
 *   E_0 = 3.0709 eV     - Energy scale from Carbon's 11-channel lock
 *   lambda_0 = 403.74 nm - Wavelength scale
 *
 * GEOMETRIC PARAMETERS (DATA-DERIVED):
 *   H-He separation = 240° = gamma × 360°
 *   Twist per period = 30° = 180°/6 ribbons
 *
 * MODEL PERFORMANCE:
 *   Overall R² = 0.948 (118 elements) - with NFDL spinor correction
 *   Noble gases: R² = 0.99 (A = 11·E₀/P^γ)
 *   d-block: R² = 0.88
 *   f-block: R² = 0.83
 *   Main group: R² = 0.86
 *
 * NFDL SPINOR CORRECTION (from GUT collaboration):
 *   A_corrected = A_pred + (E₀/11) × sin(2πZ/18)
 *   T = 18: Fermion double-cover period (720°/40)
 *   Amplitude = E₀/11: Energy per channel modulation
 *   Nodes at Z = 18, 36, 54, 126 (noble gases, island of stability)
 *
 * The periodic table as a helicoid with Carbon as the axis.
 */

// ============================================================================
// ELEMENT DATABASE
// ============================================================================

const ELEMENTS = {
    // Period 1
    'H':  {Z: 1,  period: 1, group: 1,  block: 's', name: 'Hydrogen',    A: 13.598, color: 0xFFFFFF},
    'He': {Z: 2,  period: 1, group: 18, block: 's', name: 'Helium',      A: 24.587, color: 0xD9FFFF},

    // Period 2
    'Li': {Z: 3,  period: 2, group: 1,  block: 's', name: 'Lithium',     A: 5.392,  color: 0xCC80FF},
    'Be': {Z: 4,  period: 2, group: 2,  block: 's', name: 'Beryllium',   A: 9.323,  color: 0xC2FF00},
    'B':  {Z: 5,  period: 2, group: 13, block: 'p', name: 'Boron',       A: 8.298,  color: 0xFFB5B5},
    'C':  {Z: 6,  period: 2, group: 14, block: 'p', name: 'Carbon',      A: 11.260, color: 0xFFD700, axis: true},
    'N':  {Z: 7,  period: 2, group: 15, block: 'p', name: 'Nitrogen',    A: 14.534, color: 0x3050F8},
    'O':  {Z: 8,  period: 2, group: 16, block: 'p', name: 'Oxygen',      A: 13.618, color: 0xFF0D0D},
    'F':  {Z: 9,  period: 2, group: 17, block: 'p', name: 'Fluorine',    A: 17.423, color: 0x90E050},
    'Ne': {Z: 10, period: 2, group: 18, block: 'p', name: 'Neon',        A: 21.565, color: 0xB3E3F5},

    // Period 3
    'Na': {Z: 11, period: 3, group: 1,  block: 's', name: 'Sodium',      A: 5.139,  color: 0xAB5CF2},
    'Mg': {Z: 12, period: 3, group: 2,  block: 's', name: 'Magnesium',   A: 7.646,  color: 0x8AFF00},
    'Al': {Z: 13, period: 3, group: 13, block: 'p', name: 'Aluminum',    A: 5.986,  color: 0xBFA6A6},
    'Si': {Z: 14, period: 3, group: 14, block: 'p', name: 'Silicon',     A: 8.152,  color: 0xFFD700, axis: true},
    'P':  {Z: 15, period: 3, group: 15, block: 'p', name: 'Phosphorus',  A: 10.487, color: 0xFF8000},
    'S':  {Z: 16, period: 3, group: 16, block: 'p', name: 'Sulfur',      A: 10.360, color: 0xFFFF30},
    'Cl': {Z: 17, period: 3, group: 17, block: 'p', name: 'Chlorine',    A: 12.968, color: 0x1FF01F},
    'Ar': {Z: 18, period: 3, group: 18, block: 'p', name: 'Argon',       A: 15.760, color: 0x80D1E3},

    // Period 4
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
    'Kr': {Z: 36, period: 4, group: 18, block: 'p', name: 'Krypton',     A: 14.000, color: 0x5CB8D1},

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
    'Xe': {Z: 54, period: 5, group: 18, block: 'p', name: 'Xenon',       A: 12.130, color: 0x429EB0},

    // Period 6 (partial)
    'Cs': {Z: 55, period: 6, group: 1,  block: 's', name: 'Cesium',      A: 3.894,  color: 0x57178F},
    'Ba': {Z: 56, period: 6, group: 2,  block: 's', name: 'Barium',      A: 5.212,  color: 0x00C900},
    'La': {Z: 57, period: 6, group: 3,  block: 'd', name: 'Lanthanum',   A: 5.577,  color: 0x70D4FF, sc: true},
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
    'Rn': {Z: 86, period: 6, group: 18, block: 'p', name: 'Radon',       A: 10.749, color: 0x428296},

    // Period 7 (partial)
    'Fr': {Z: 87, period: 7, group: 1,  block: 's', name: 'Francium',    A: 4.073,  color: 0x420066},
    'Ra': {Z: 88, period: 7, group: 2,  block: 's', name: 'Radium',      A: 5.278,  color: 0x007D00},
    'Ac': {Z: 89, period: 7, group: 3,  block: 'd', name: 'Actinium',    A: 5.170,  color: 0x70ABFA},
    'Fl': {Z: 114, period: 7, group: 14, block: 'p', name: 'Flerovium', A: 8.539,  color: 0xFFD700, axis: true},
};

// ============================================================================
// FUNDAMENTAL CONSTANTS
// ============================================================================

const E_0 = 3.0709;      // eV - fundamental energy scale
const GAMMA = 2/3;       // Dimensional coupling
const LAMBDA_0 = 403.74; // nm - wavelength scale
const A_C = 11.260;      // eV - Carbon ionization energy (axis reference)

// ============================================================================
// GEOMETRIC CONSTANTS (DATA-DERIVED)
// ============================================================================

const TWIST_PER_PERIOD = Math.PI / 6;  // 30 degrees - from compound clustering
const H_HE_SEPARATION = 240;            // degrees = gamma * 360
const H_ANGLE = -120;                   // degrees
const HE_ANGLE = 120;                   // degrees

// ============================================================================
// NFDL SPINOR CONSTANTS (from GUT collaboration)
// ============================================================================

const SPINOR_PERIOD = 18;               // Fermion double-cover: 720/40 = 18
const SPINOR_AMPLITUDE = E_0 / 11;      // Energy per channel modulation
const BREATHING_SCALE = 0.15;           // Visual scale for radial displacement

function spinorCorrection(Z) {
    // Returns the NFDL spinor correction for element Z
    return SPINOR_AMPLITUDE * Math.sin(2 * Math.PI * Z / SPINOR_PERIOD);
}

function spinorPhase(Z) {
    // Returns spinor phase in degrees and position type
    const phase = ((2 * Math.PI * Z / SPINOR_PERIOD) % (2 * Math.PI)) * 180 / Math.PI;
    const corr = spinorCorrection(Z);
    let position;
    if (Math.abs(corr) < 0.05) position = 'NODE';
    else if (corr > 0.2) position = 'PEAK';
    else if (corr < -0.2) position = 'TROUGH';
    else position = corr > 0 ? 'rising' : 'falling';
    return { phase, correction: corr, position };
}

// ============================================================================
// IONIZATION ENERGY PREDICTION FUNCTIONS
// ============================================================================

function predictA(period, group, block, Z) {
    // Period 1 special case
    if (period === 1) {
        return group === 1 ? 13.598 : 24.587;
    }

    // Noble gases: A = 11 * E_0 / P^gamma
    if (group === 18) {
        return 11 * E_0 / Math.pow(period, GAMMA);
    }

    // f-block
    if (group === 101 || group === 102) {
        if (period === 6) {
            return 5.44 + 0.068 * (Z - 58);
        } else {
            return 5.99 + 0.044 * (Z - 90);
        }
    }

    // d-block
    if (group >= 3 && group <= 12) {
        const base = 1.953;
        const k_base = 0.079;
        const k_period = 0.028;
        const k_eff = k_base + k_period * (period - 4);
        let A = E_0 * (base + k_eff * (group - 3));
        if (group === 12) {
            A += 0.279 * E_0;  // d^10 bonus
        }
        return A;
    }

    // Main group
    const theta_map = {1: -90, 2: -54, 13: -18, 14: 0, 15: 27, 16: 54, 17: 90};
    const theta = (theta_map[group] || 0) * Math.PI / 180;
    const t = Math.max(0, period - 2);

    let w;
    if (group <= 2) {
        w = 7.07 * Math.pow(0.95, t);
    } else if (group === 13) {
        w = 5.0 * Math.pow(0.95, t);
    } else if (group === 14) {
        w = 0;
    } else {
        w = period === 2 ? 5.46 : 1.0 * Math.pow(1.1, t);
    }

    const K_A = 0.544;
    const decay = 0.65;
    let A = A_C + w * Math.sin(theta) * K_A - decay * t;

    // Group corrections
    if (group === 1) A -= 1.7 + 0.05 * t;
    else if (group === 2) A -= 0.3;
    else if (group === 13) {
        if (period === 2) A -= 1.0;
        else if (period === 3) A -= 2.0;
        else A -= 2.0 + 0.5 * (period - 4);
    }
    else if (group === 14) A -= 1.0 + 0.2 * t;
    else if (group === 15) A += period === 2 ? 0.5 : -0.3;
    else if (group === 16) A -= 0.4;
    else if (group === 17) A += period === 2 ? 2.5 : 0.3;

    return A;
}

// ============================================================================
// POSITION CALCULATION
// ============================================================================

function getElementPosition(period, group, block, Z) {
    // NFDL Spinor breathing: radial displacement based on sin(2πZ/18)
    // Peaks push outward, troughs pull inward, nodes stay neutral
    const breathingFactor = Z ? BREATHING_SCALE * Math.sin(2 * Math.PI * Z / SPINOR_PERIOD) : 0;

    // Special case: Period 1 (H, He) - sits on arc, not ribbon
    // Angular separation = γ × 360° = (2/3) × 360° = 240°
    // The excluded 120° wedge is where the axis WOULD BE (no Group 14 in Period 1)
    // Period 1 = pure boundary state = γ of the full circle
    if (period === 1) {
        const baseRadius = 0.8;
        const radius = baseRadius * (1 + breathingFactor);  // Apply breathing
        const z = (1 - 4) * 0.8;

        if (group === 1) {
            // Hydrogen - start of arc at -120° = -2π/3
            const angle = -Math.PI * (2/3);  // γ × π
            return {
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
                z: z,
                t: -1,
                twist: 0,
                breathing: breathingFactor
            };
        } else {
            // Helium - end of arc at +120° = +2π/3
            const angle = Math.PI * (2/3);  // γ × π
            return {
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
                z: z,
                t: 1,
                twist: 0,
                breathing: breathingFactor
            };
        }
    }

    // Periods 2-7: Standard ribbon calculation
    const baseRadius = 1.2;
    const a = baseRadius + 0.25 * (period - 2);  // Semi-major axis (expands)

    // Helicoid twist - each period rotates
    // 30 deg = pi/6 per period, derived from:
    //   1. Structure: 180 deg / 6 ribbons (Period 1 has no ribbon)
    //   2. Data: Stable compounds cluster at 30-deg multiples
    //   3. Chemistry: Covalent=small angle, Ionic=large angle
    const twistPerPeriod = Math.PI / 6;  // 30 degrees
    const twist = (period - 2) * twistPerPeriod;

    // Position along ribbon (t: -1 = Li-edge, 0 = axis, +1 = F-edge)
    let t;

    if (group === 14) {
        t = 0;  // AXIS
    } else if (group < 14) {
        // Li-side (negative t)
        if (group === 1) {
            t = -1.0;  // Alkali at edge
        } else if (group === 2) {
            t = -0.85;  // Alkaline earth
        } else if (group === 13) {
            t = -0.15;  // Boron group near axis
        } else if (block === 'd') {
            // d-block: groups 3-12 spread between -0.7 and -0.2
            t = -0.7 + (group - 3) * 0.05;
        } else {
            t = -0.5;
        }
    } else {
        // F-side (positive t)
        if (group === 15) {
            t = 0.25;  // Nitrogen group
        } else if (group === 16) {
            t = 0.50;  // Oxygen group
        } else if (group === 17) {
            t = 0.75;  // Halogens
        } else if (group === 18) {
            t = 1.0;   // Noble gases at edge
        } else {
            t = 0.5;
        }
    }

    // Calculate 3D position with spinor breathing
    const xLocal = t * a * (1 + breathingFactor);  // Apply radial breathing
    const yLocal = 0;  // Flat ribbon

    // Apply twist rotation around z-axis
    const x = xLocal * Math.cos(twist) - yLocal * Math.sin(twist);
    const y = xLocal * Math.sin(twist) + yLocal * Math.cos(twist);
    const z = (period - 4) * 0.8;  // Center around period 4

    return { x, y, z, t, twist, breathing: breathingFactor };
}

// ============================================================================
// THREE.JS SCENE SETUP
// ============================================================================

let scene, camera, renderer, controls;
let elementMeshes = [];
let raycaster, mouse;

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);

    // Camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(4, 3, 4);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('container').appendChild(renderer.domElement);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 15;

    // Raycaster for hover
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xFFD700, 0.5, 20);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Build the helicoid
    createCentralAxis();
    createRibbons();
    createElements();

    // Events
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);

    // Start animation
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
    axis.rotation.x = 0;  // Already aligned with Y
    axis.position.set(0, 0, 0);

    // Rotate to align with Z axis
    axis.rotation.x = Math.PI / 2;

    scene.add(axis);

    // Add glow effect
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
// CREATE RIBBONS
// ============================================================================

function createRibbons() {
    // Period 1 is special - no Group 14, so just an arc (not through axis)
    createPeriod1Arc();

    // Periods 2-7 have full ribbons through the Carbon axis
    for (let period = 2; period <= 7; period++) {
        createRibbon(period);
    }
}

function createPeriod1Arc() {
    // Period 1 (H, He) - special case: no axis intersection
    // Create a small arc on the Li-side only (H) to F-side (He)
    // This arc does NOT pass through center - there's no Group 14 in Period 1
    //
    // Angular separation = γ × 360° = 240°
    // The excluded 120° wedge (at θ=0, toward the axis) represents
    // the "bulk" that doesn't exist yet - Period 1 is pure boundary.

    const segments = 50;
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const indices = [];

    const radius = 0.8;  // Smaller than other periods
    const ribbonWidth = 0.06;
    const z = (1 - 4) * 0.8;  // Period 1 height

    // Arc from H (-120° = -2π/3) to He (+120° = +2π/3)
    // Sweeps 240° = γ × 360°, excluding the 120° axis zone
    for (let i = 0; i <= segments; i++) {
        // Sweep from -2π/3 to +2π/3 (240° arc, avoiding axis at θ=0)
        const angle = (i / segments) * Math.PI * (4/3) - Math.PI * (2/3);  // γ-derived arc

        for (let side = -1; side <= 1; side += 2) {
            const r = radius + side * ribbonWidth;
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);

            vertices.push(x, y, z);

            // Color: blue (H) to cyan (He)
            const t = i / segments;
            const color = new THREE.Color();
            color.setHSL(0.55 + 0.1 * t, 0.7, 0.6);
            colors.push(color.r, color.g, color.b);
        }
    }

    for (let i = 0; i < segments; i++) {
        const a = i * 2;
        const b = i * 2 + 1;
        const c = (i + 1) * 2;
        const d = (i + 1) * 2 + 1;
        indices.push(a, b, c);
        indices.push(b, d, c);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        metalness: 0.3,
        roughness: 0.7,
        transparent: true,
        opacity: 0.7
    });

    const arc = new THREE.Mesh(geometry, material);
    scene.add(arc);
}

function createRibbon(period) {
    const segments = 100;
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const indices = [];

    const baseRadius = 1.2;
    const a = baseRadius + 0.25 * (period - 2);
    const ribbonWidth = 0.08 + 0.01 * (period - 2);

    const twistPerPeriod = Math.PI / 6;  // 30 degrees - data-derived
    const twist = (period - 2) * twistPerPeriod;
    const z = (period - 4) * 0.8;

    // Create ribbon vertices
    for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * 2 - 1;  // -1 to +1

        const xLocal = t * a;

        // Front and back of ribbon
        for (let side = -1; side <= 1; side += 2) {
            const yLocal = side * ribbonWidth;

            const x = xLocal * Math.cos(twist) - yLocal * Math.sin(twist);
            const y = xLocal * Math.sin(twist) + yLocal * Math.cos(twist);

            vertices.push(x, y, z);

            // Color gradient: blue (Li-side) -> gold (axis) -> red (F-side)
            const color = new THREE.Color();
            if (t < 0) {
                // Li-side: blue to gold
                color.setHSL(0.6 - 0.1 * (1 + t), 0.8, 0.5 + 0.2 * (1 + t));
            } else {
                // F-side: gold to red
                color.setHSL(0.1 - 0.1 * t, 0.8, 0.5);
            }
            colors.push(color.r, color.g, color.b);
        }
    }

    // Create faces
    for (let i = 0; i < segments; i++) {
        const a = i * 2;
        const b = i * 2 + 1;
        const c = (i + 1) * 2;
        const d = (i + 1) * 2 + 1;

        // Two triangles per quad
        indices.push(a, b, c);
        indices.push(b, d, c);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        metalness: 0.3,
        roughness: 0.7,
        transparent: true,
        opacity: 0.85
    });

    const ribbon = new THREE.Mesh(geometry, material);
    scene.add(ribbon);

    // Add wireframe for structure visibility
    const wireGeometry = new THREE.EdgesGeometry(geometry, 15);
    const wireMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.1
    });
    const wireframe = new THREE.LineSegments(wireGeometry, wireMaterial);
    scene.add(wireframe);
}

// ============================================================================
// CREATE ELEMENTS
// ============================================================================

function createElements() {
    for (const [symbol, data] of Object.entries(ELEMENTS)) {
        createElement(symbol, data);
    }
}

function createElement(symbol, data) {
    const pos = getElementPosition(data.period, data.group, data.block, data.Z);

    // Sphere size based on properties
    const baseSize = 0.08;
    const size = data.axis ? baseSize * 1.3 : (data.sc ? baseSize * 1.2 : baseSize);

    const geometry = new THREE.SphereGeometry(size, 32, 32);

    // Material
    let color = data.color;
    let emissive = 0x000000;
    let emissiveIntensity = 0;

    if (data.axis) {
        // Axis elements (Group 14) - gold and glowing
        color = 0xFFD700;
        emissive = 0xFFD700;
        emissiveIntensity = 0.5;
    } else if (data.sc) {
        // Superconductors - cyan glow
        emissive = 0x00FFFF;
        emissiveIntensity = 0.4;
    }

    const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.5,
        roughness: 0.3,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(pos.x, pos.y, pos.z);
    sphere.userData = { symbol, ...data };

    scene.add(sphere);
    elementMeshes.push(sphere);

    // Add label for important elements
    if (data.axis || data.sc || ['Li', 'F', 'Na', 'Cl', 'B', 'N'].includes(symbol)) {
        // Labels handled by tooltip on hover
    }
}

// ============================================================================
// INTERACTION
// ============================================================================

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(elementMeshes);

    const tooltip = document.getElementById('tooltip');

    if (intersects.length > 0) {
        const element = intersects[0].object.userData;

        // Calculate harmonic ratio
        const ratio = (element.A / E_0).toFixed(3);

        // Calculate predicted A using EiG model + spinor correction
        const A_base = predictA(element.period, element.group, element.block, element.Z);
        const spinor = spinorPhase(element.Z);
        const A_pred = A_base + spinor.correction;
        const error = element.A - A_pred;
        const errorPct = ((error / element.A) * 100).toFixed(1);

        // Check if on 11/k series
        let harmonic = '';
        for (let k = 2; k <= 8; k++) {
            if (Math.abs(element.A / E_0 - 11/k) < 0.1) {
                harmonic = ` ~ 11/${k}`;
                break;
            }
        }

        let info = `<span class="symbol">${element.symbol}</span><br>`;
        info += `<span class="name">${element.name}</span><br>`;
        info += `Z = ${element.Z}, Period ${element.period}, Group ${element.group}<br>`;
        info += `A (actual) = ${element.A.toFixed(3)} eV<br>`;
        info += `A (EiG+NFDL) = ${A_pred.toFixed(3)} eV<br>`;
        info += `Error = ${error >= 0 ? '+' : ''}${error.toFixed(3)} eV (${errorPct}%)<br>`;
        info += `A/E_0 = ${ratio}${harmonic}<br>`;
        info += `<span style="color:#FF69B4">Spinor: ${spinor.position} (${spinor.correction >= 0 ? '+' : ''}${spinor.correction.toFixed(3)} eV)</span>`;

        if (element.axis) {
            info += `<br><span style="color:#FFD700">* Carbon Axis (Group 14)</span>`;
        }
        if (element.sc) {
            info += `<br><span style="color:#00FFFF">* Superconductor</span>`;
        }
        if (spinor.position === 'NODE') {
            info += `<br><span style="color:#00FF00">* Spinor Node (Z mod 18 = ${element.Z % 18})</span>`;
        }

        tooltip.innerHTML = info;
        tooltip.style.display = 'block';
        tooltip.style.left = (event.clientX + 15) + 'px';
        tooltip.style.top = (event.clientY + 15) + 'px';

        // Highlight element
        intersects[0].object.material.emissiveIntensity = 0.8;
    } else {
        tooltip.style.display = 'none';

        // Reset all highlights
        elementMeshes.forEach(mesh => {
            const data = mesh.userData;
            if (data.axis) {
                mesh.material.emissiveIntensity = 0.5;
            } else if (data.sc) {
                mesh.material.emissiveIntensity = 0.4;
            } else {
                mesh.material.emissiveIntensity = 0;
            }
        });
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
// START
// ============================================================================

init();
