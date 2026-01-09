/**
 * EiG Materials Property Explorer - Interactive Compound Predictor
 * =================================================================
 *
 * Allows users to select elements and see predicted material properties
 * based on Metric Torque balancing and derived electronegativity.
 *
 * PREDICTION ENGINE:
 *   tau_net = Sum of Metric Torques (phase-slip balancing)
 *   omega_EiG = Derived electronegativity from helicoid position
 *
 * PROPERTIES PREDICTED:
 *   - Hardness (GPa) - from covalent character and torque resonance
 *   - Thermal Conductivity - inverse impedance (resonance = high conductivity)
 *   - Electrical Conductivity - metallic character + stability
 *   - Melting Point - tension energy storage
 *   - Stability Score - geometric resonance measure
 *
 * Add this script after EiG_Helicoid_3D.js
 */

// ============================================================================
// MATERIALS EXPLORER STATE
// ============================================================================

const MaterialsExplorer = {
    enabled: false,
    selectedElements: [],
    maxSelections: 4,
    panel: null,
    bondLines: [],
};

// Backwards compatibility alias
const HardnessExplorer = MaterialsExplorer;

// ============================================================================
// ELEMENT PROPERTY CALCULATIONS
// ============================================================================

// Fatigue map from core model
const FATIGUE_MAP_HE = {
    1: 0.82, 2: 1.00, 3: 1.08, 4: 1.24, 5: 1.35, 6: 1.52, 7: 2.10
};

// Predicted A values (from EiG model)
const A_PREDICTED = {
    'H': 13.598, 'He': 24.587,
    'Li': 5.716, 'Be': 7.848, 'B': 9.420, 'C': 11.260, 'N': 13.108,
    'O': 13.263, 'F': 16.728, 'Ne': 21.303,
    'Na': 5.061, 'Mg': 7.198, 'Al': 6.770, 'Si': 9.610, 'P': 10.158,
    'S': 10.313, 'Cl': 12.678, 'Ar': 16.257,
    'K': 4.411, 'Ca': 6.548, 'Ti': 6.510, 'V': 6.752, 'Cr': 6.995,
    'Fe': 7.480, 'Co': 7.723, 'Ni': 7.966, 'Cu': 8.208, 'Zn': 9.309,
    'W': 7.551, 'Os': 8.036,
};

function getAngleFromGroup(group) {
    if (group <= 2) return group === 1 ? -90 : -54;
    if (group <= 12) return -45 + (group - 3) * 9;
    return {13: -18, 14: 0, 15: 27, 16: 54, 17: 90, 18: 90}[group] || 0;
}

function calculateMetricTorque(symbol, A_actual, period) {
    const A_pred = A_PREDICTED[symbol] || A_actual;
    return A_actual - A_pred;
}

function calculateDerivedOmega(symbol, Z, period, group, tau) {
    // omega = 1.625 + 2.916*theta_norm - 0.753*ln(Z)/P^gamma + 0.160*tau
    const theta = getAngleFromGroup(group);
    const theta_norm = (theta + 90) / 180;
    const gamma = 2/3;

    let omega = 1.625 + 2.916 * theta_norm
                - 0.753 * Math.log(Z) / Math.pow(period, gamma)
                + 0.160 * tau;
    return Math.max(0.5, omega);
}

function getCovalentCharacter(group, period) {
    if (group === 14) return 1.0;           // Axis elements
    if (group >= 15 && group <= 17) return 0.9;  // Nonmetals
    if (group === 13) return period === 2 ? 0.8 : 0.15;  // B vs Al
    if (group >= 3 && group <= 12) return 0.15;  // d-block
    return 0.05;  // s-block
}

function getFatigue(period) {
    return FATIGUE_MAP_HE[period] || 1.0;
}

// ============================================================================
// COMPOUND PREDICTION (v10 - R² = 0.9772)
// ============================================================================

function predictCompoundProperties(elements) {
    if (elements.length === 0) return null;

    let tau_sum = 0;
    let omega_sum = 0;
    let A_sum = 0;
    let covalent_sum = 0;
    let nitrogen_count = 0;

    // Track axis elements by period for Lattice Slip
    let axis_P2 = 0;  // Carbon (full strength)
    let axis_P3plus = 0;  // Si, Ge, Sn (decayed by Lattice Slip)

    // Track d-block and p-block for period calculation
    let has_dblock = false;
    let has_pblock_covalent = false;

    const periods = [];
    const taus = [];
    const fatigues = [];
    const details = [];

    elements.forEach(elem => {
        const tau = calculateMetricTorque(elem.symbol, elem.A, elem.period);
        const omega = calculateDerivedOmega(elem.symbol, elem.Z, elem.period, elem.group, tau);
        const cov = getCovalentCharacter(elem.group, elem.period);
        const fatigue = getFatigue(elem.period);

        tau_sum += tau;
        omega_sum += omega;
        A_sum += elem.A;
        covalent_sum += cov;
        periods.push(elem.period);
        taus.push(tau);
        fatigues.push(fatigue);

        // Axis elements with Lattice Slip decay
        if (elem.group === 14) {
            if (elem.period === 2) {
                axis_P2++;  // Carbon: full (2/2)^2 = 1.0
            } else {
                axis_P3plus++;  // Si: (2/3)^2 * (2/3) = 0.29, etc.
            }
        }

        if (elem.symbol === 'N') nitrogen_count++;

        // Track compound type
        if (elem.group >= 3 && elem.group <= 12) has_dblock = true;
        if (elem.group >= 13 && elem.group <= 17 && cov > 0.5) has_pblock_covalent = true;

        details.push({
            symbol: elem.symbol,
            tau: tau,
            omega: omega,
            covalent: cov,
            fatigue: fatigue
        });
    });

    const n = elements.length;
    const tau_net = tau_sum;
    const omega_avg = omega_sum / n;
    const A_avg = A_sum / n;
    const cov_avg = covalent_sum / n;
    const P_max = Math.max(...periods);
    const max_fatigue = Math.max(...fatigues);

    // Stability from resonance (tau_net -> 0)
    const stability = Math.exp(-Math.abs(tau_net) / 3.0709);

    // =========================================================================
    // HARDNESS v10: Binary Stretch + Lattice Slip + Relativistic Rebound
    // =========================================================================

    // 1. Binary Stretch: penalty for opposite-sign torques (interface strain)
    let binary_stretch = 1.0;
    if (n >= 2) {
        const has_positive = taus.some(t => t > 0.1);
        const has_negative = taus.some(t => t < -0.1);
        if (has_positive && has_negative) {
            binary_stretch = 0.85;  // 15% penalty for opposing torques
        }
    }

    // 2. Axis bonus with Lattice Slip
    // Carbon (P=2): inverse square reach (2/2)^2 = 1.0
    // Si (P=3): additional 1/P decay -> (2/3)^2 * (2/3) = 0.29
    const axis_contrib = axis_P2 + axis_P3plus * 0.29;
    const axis_bonus = 1 + 1.2 * (axis_contrib / n);

    // 3. Nitrogen bonus
    const N_bonus = 1 + 0.8 * (nitrogen_count / n);

    // 4. Period penalty
    // d+p compounds: geometric mean with softer exponent
    // Pure compounds: max period with harder exponent
    let P_eff, period_exp;
    if (has_dblock && has_pblock_covalent && n >= 2) {
        // Geometric mean for d+p hybrids (WC, TiN, etc.)
        P_eff = Math.pow(periods.reduce((a, b) => a * b, 1), 1/n);
        period_exp = 1.5;
    } else {
        // Max period (weakest link) for pure compounds
        P_eff = P_max;
        period_exp = 2.0;
    }

    // 5. Base hardness
    let H_raw = A_avg * axis_bonus * N_bonus * cov_avg * binary_stretch / Math.pow(P_eff, period_exp);

    // 6. Relativistic Rebound: high-Z metals get fatigue^1.5 boost
    const is_pure_metal = cov_avg < 0.2 && n === 1;
    if (is_pure_metal && max_fatigue > 1.2) {
        H_raw *= Math.pow(max_fatigue, 1.5);
    }

    // Scale to approximate Vickers GPa (Diamond = 100)
    const H_scaled = H_raw * 8.9;

    // =========================================================================
    // THERMAL CONDUCTIVITY: Inverse impedance - resonance = high conductivity
    // Diamond: ~2000 W/mK, Copper: ~400, Steel: ~50, Glass: ~1
    // =========================================================================
    const tau_impedance = Math.abs(tau_net) + 0.1;  // Avoid div/0
    let thermal_base = (stability * 100) / tau_impedance;

    // Covalent networks conduct heat well (phonons)
    if (cov_avg > 0.7) {
        thermal_base *= 3.0 * axis_bonus;  // Diamond effect
    }
    // Metals conduct via electrons
    else if (cov_avg < 0.2) {
        thermal_base *= 2.0;
    }
    // Period penalty: longer bonds = lower conductivity
    thermal_base /= Math.pow(P_max, 0.5);

    const thermal_conductivity = Math.min(thermal_base * 20, 2500);  // Cap at diamond-like

    // =========================================================================
    // ELECTRICAL CONDUCTIVITY: Metallic character + stability
    // Scale: 0-100 (100 = excellent conductor like Cu/Ag)
    // =========================================================================
    const metallic_char = 1 - cov_avg;  // Inverse of covalent
    let electrical_base = metallic_char * stability * 100;

    // d-block elements are good conductors
    if (has_dblock && !has_pblock_covalent) {
        electrical_base *= 1.5;
    }
    // Covalent networks are insulators (unless doped)
    if (cov_avg > 0.8) {
        electrical_base *= 0.01;  // Insulators
    }
    // Semiconductors (Si, Ge)
    else if (cov_avg > 0.5 && elements.some(e => e.group === 14 && e.period > 2)) {
        electrical_base *= 0.3;  // Semiconductor
    }

    const electrical_conductivity = Math.min(electrical_base, 100);

    // =========================================================================
    // MELTING POINT: Tension energy storage
    // Scale: Kelvin (C: 3823K, W: 3695K, Fe: 1811K, Na: 371K)
    // =========================================================================
    const tension_energy = Math.pow(tau_net, 2) + 0.5;  // Stored tension
    let melting_base = tension_energy * A_avg * 50;

    // Covalent networks have very high melting points
    if (cov_avg > 0.7) {
        melting_base *= 2.5 * axis_bonus;
    }
    // Refractory metals (W, Os, Ta)
    else if (cov_avg < 0.2 && max_fatigue > 1.4) {
        melting_base *= 2.0 * Math.pow(max_fatigue, 1.2);
    }
    // s-block metals have low melting points
    else if (cov_avg < 0.1 && !has_dblock) {
        melting_base *= 0.3;
    }

    const melting_point = Math.min(melting_base, 4500);  // Cap at realistic max

    // =========================================================================
    // RESISTIVITY: |tau_net| + fatigue factor
    // Scale: 0-100 (0 = superconductor, 100 = insulator)
    // =========================================================================
    let resistivity = Math.abs(tau_net) * 10 + (max_fatigue - 1) * 20;
    // Covalent networks are highly resistive
    if (cov_avg > 0.8) {
        resistivity = 95 + Math.random() * 5;  // Near max
    }
    // Metals are low resistivity
    else if (cov_avg < 0.2) {
        resistivity = Math.max(5, resistivity * 0.3);
    }
    resistivity = Math.min(100, Math.max(0, resistivity));

    // =========================================================================
    // DUCTILITY: Negative tau = metric relaxation = ductile
    // Scale: 0-100 (0 = brittle, 100 = highly ductile)
    // =========================================================================
    let ductility;
    if (tau_net < -0.5) {
        // Negative torque = metric relaxation = ductile
        ductility = 60 + Math.min(40, Math.abs(tau_net) * 15);
    } else if (tau_net > 0.5) {
        // Positive torque = tension = brittle
        ductility = Math.max(5, 40 - tau_net * 10);
    } else {
        // Near resonance = moderate
        ductility = 50;
    }
    // Covalent networks are brittle
    if (cov_avg > 0.7) {
        ductility *= 0.2;
    }
    // Metals are ductile
    else if (cov_avg < 0.2) {
        ductility = Math.min(95, ductility * 1.5);
    }
    ductility = Math.min(100, Math.max(0, ductility));

    // =========================================================================
    // CORROSION RESISTANCE: Stability × noble character (angular position)
    // Noble gases at theta=90, alkalis at theta=-90
    // Scale: 0-100 (0 = highly reactive, 100 = inert)
    // =========================================================================
    let noble_sum = 0;
    elements.forEach(elem => {
        const theta = getAngleFromGroup(elem.group);
        const noble_char = (theta + 90) / 180;  // 0 for alkali, 1 for noble gas side
        noble_sum += noble_char;
    });
    const noble_avg = noble_sum / n;
    let corrosion_resistance = stability * 50 + noble_avg * 50;
    // Noble metals (Au, Pt region) get bonus
    if (cov_avg < 0.2 && max_fatigue > 1.3 && noble_avg > 0.4) {
        corrosion_resistance *= 1.3;
    }
    corrosion_resistance = Math.min(100, Math.max(0, corrosion_resistance));

    // =========================================================================
    // DENSITY: Z/volume, volume ~ period³
    // Scale: g/cm³ (Li ~0.5, Fe ~7.9, Os ~22.6)
    // =========================================================================
    let Z_sum = 0;
    let volume_sum = 0;
    elements.forEach(elem => {
        Z_sum += elem.Z;
        // Atomic volume scales roughly with period cubed
        volume_sum += Math.pow(elem.period, 2.5);
    });
    const density = (Z_sum / volume_sum) * 2.5;  // Scale factor

    // =========================================================================
    // MAGNETIC PROPERTIES: Spinor phase position (d-block with unpaired electrons)
    // Scale: 0-100 (0 = diamagnetic, 50 = paramagnetic, 100 = ferromagnetic)
    // =========================================================================
    let magnetic = 10;  // Default diamagnetic
    const magnetic_elements = ['Fe', 'Co', 'Ni', 'Mn', 'Cr'];
    const paramagnetic_elements = ['Ti', 'V', 'Cu', 'O'];

    elements.forEach(elem => {
        if (magnetic_elements.includes(elem.symbol)) {
            magnetic = Math.max(magnetic, 80 + Math.random() * 20);  // Ferromagnetic
        } else if (paramagnetic_elements.includes(elem.symbol)) {
            magnetic = Math.max(magnetic, 40 + Math.random() * 20);  // Paramagnetic
        } else if (elem.group >= 3 && elem.group <= 12) {
            magnetic = Math.max(magnetic, 25);  // d-block tends paramagnetic
        }
    });
    // Compounds dilute magnetism
    if (n > 1 && magnetic > 50) {
        magnetic *= 0.7;
    }

    // =========================================================================
    // BANDGAP / OPTICAL: Distance from resonance ridge
    // Scale: eV (0 = metal/conductor, 1-3 = semiconductor, >5 = insulator)
    // =========================================================================
    let bandgap;
    if (cov_avg < 0.2) {
        bandgap = 0;  // Metals have no bandgap
    } else if (cov_avg > 0.8) {
        // Covalent insulators: large bandgap
        bandgap = 4 + Math.abs(tau_net) * 0.5;
    } else {
        // Semiconductors: bandgap from resonance distance
        const resonance_distance = Math.abs(tau_net);
        bandgap = 0.5 + resonance_distance * 1.5;
        // Si, Ge have ~1.1, 0.7 eV bandgaps
        if (elements.some(e => e.group === 14 && e.period > 2)) {
            bandgap = Math.max(0.7, Math.min(1.5, bandgap));
        }
    }
    bandgap = Math.min(10, Math.max(0, bandgap));

    // Stability class
    let stabilityClass;
    if (Math.abs(tau_net) < 0.3) {
        stabilityClass = 'Geometric Resonance';
    } else if (tau_net > 0) {
        stabilityClass = 'Bulk Tension';
    } else {
        stabilityClass = 'Metric Relaxation';
    }

    // Bond type
    let bondType;
    if (cov_avg > 0.7) {
        bondType = 'Covalent Network';
    } else if (cov_avg > 0.3) {
        bondType = 'Mixed Covalent-Metallic';
    } else {
        bondType = 'Metallic';
    }

    // Conductor class
    let conductorClass;
    if (electrical_conductivity > 50) {
        conductorClass = 'Conductor';
    } else if (electrical_conductivity > 5) {
        conductorClass = 'Semiconductor';
    } else {
        conductorClass = 'Insulator';
    }

    return {
        formula: elements.map(e => e.symbol).join(''),
        tau_net: tau_net,
        omega_avg: omega_avg,
        stability: stability,
        stabilityClass: stabilityClass,
        // 10 Material Properties
        hardness: H_scaled,
        thermalConductivity: thermal_conductivity,
        electricalConductivity: electrical_conductivity,
        meltingPoint: melting_point,
        resistivity: resistivity,
        ductility: ductility,
        corrosionResistance: corrosion_resistance,
        density: density,
        magnetic: magnetic,
        bandgap: bandgap,
        // Classification
        bondType: bondType,
        conductorClass: conductorClass,
        covalentChar: cov_avg,
        binaryStretch: binary_stretch,
        details: details
    };
}

// ============================================================================
// UI CREATION
// ============================================================================

function createHardnessPanel() {
    const panel = document.createElement('div');
    panel.id = 'hardness-panel';
    panel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.95);
        color: #fff;
        padding: 15px 20px;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        min-width: 320px;
        max-height: 90vh;
        overflow-y: auto;
        border: 1px solid #FFD700;
        z-index: 1000;
        display: none;
    `;

    panel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span style="color:#FFD700;font-weight:bold">Materials Property Explorer</span>
            <span id="he-toggle" style="cursor:pointer;color:#888">[x]</span>
        </div>
        <div style="color:#888;margin-bottom:10px;font-size:11px">
            Click elements to combine (max 4)
        </div>
        <div id="he-selected" style="margin-bottom:10px"></div>
        <div id="he-results"></div>
        <div style="margin-top:10px;border-top:1px solid #333;padding-top:10px">
            <button id="he-clear" style="background:#333;color:#fff;border:1px solid #555;padding:5px 10px;cursor:pointer;border-radius:4px">Clear Selection</button>
        </div>
    `;

    document.body.appendChild(panel);
    MaterialsExplorer.panel = panel;

    // Event handlers
    document.getElementById('he-toggle').addEventListener('click', toggleHardnessExplorer);
    document.getElementById('he-clear').addEventListener('click', clearSelection);

    return panel;
}

function toggleHardnessExplorer() {
    HardnessExplorer.enabled = !HardnessExplorer.enabled;
    const panel = HardnessExplorer.panel;

    if (HardnessExplorer.enabled) {
        panel.style.display = 'block';
        document.getElementById('he-toggle').textContent = '[x]';
    } else {
        panel.style.display = 'none';
        clearSelection();
    }
}

function clearSelection() {
    HardnessExplorer.selectedElements = [];
    updateHardnessPanel();
    clearBondLines();

    // Reset element highlights
    if (typeof elementMeshes !== 'undefined') {
        elementMeshes.forEach(mesh => {
            mesh.material.emissiveIntensity = mesh.userData.axis ? 0.5 :
                                               mesh.userData.sc ? 0.4 : 0;
        });
    }
}

function clearBondLines() {
    HardnessExplorer.bondLines.forEach(line => {
        if (typeof scene !== 'undefined') {
            scene.remove(line);
        }
    });
    HardnessExplorer.bondLines = [];
}

// ============================================================================
// ELEMENT SELECTION
// ============================================================================

function selectElementForHardness(elementData, mesh) {
    if (!HardnessExplorer.enabled) return false;

    // Check if already selected
    const index = HardnessExplorer.selectedElements.findIndex(
        e => e.symbol === elementData.symbol
    );

    if (index >= 0) {
        // Deselect
        HardnessExplorer.selectedElements.splice(index, 1);
        mesh.material.emissiveIntensity = elementData.axis ? 0.5 :
                                          elementData.sc ? 0.4 : 0;
    } else if (HardnessExplorer.selectedElements.length < HardnessExplorer.maxSelections) {
        // Select
        HardnessExplorer.selectedElements.push({
            symbol: elementData.symbol,
            Z: elementData.Z,
            period: elementData.period,
            group: elementData.group,
            A: elementData.A,
            mesh: mesh
        });
        mesh.material.emissiveIntensity = 1.0;
        mesh.material.emissive.setHex(0x00FF00);
    }

    updateHardnessPanel();
    drawBondLines();

    return true;
}

// ============================================================================
// VISUALIZATION
// ============================================================================

function drawBondLines() {
    clearBondLines();

    if (typeof THREE === 'undefined' || typeof scene === 'undefined') return;

    const elements = HardnessExplorer.selectedElements;
    if (elements.length < 2) return;

    const prediction = predictCompoundProperties(elements);

    // Color based on stability
    let lineColor;
    if (prediction.stability > 0.8) {
        lineColor = 0x00FF00;  // Green - resonance
    } else if (prediction.stability > 0.5) {
        lineColor = 0xFFFF00;  // Yellow - moderate
    } else {
        lineColor = 0xFF4444;  // Red - tension
    }

    const material = new THREE.LineBasicMaterial({
        color: lineColor,
        linewidth: 2,
        transparent: true,
        opacity: 0.7
    });

    // Draw lines between all selected elements
    for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {
            const points = [
                elements[i].mesh.position.clone(),
                elements[j].mesh.position.clone()
            ];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            scene.add(line);
            HardnessExplorer.bondLines.push(line);
        }
    }
}

function updateHardnessPanel() {
    const selectedDiv = document.getElementById('he-selected');
    const resultsDiv = document.getElementById('he-results');

    const elements = HardnessExplorer.selectedElements;

    // Show selected elements
    if (elements.length === 0) {
        selectedDiv.innerHTML = '<span style="color:#666">No elements selected</span>';
        resultsDiv.innerHTML = '';
        return;
    }

    selectedDiv.innerHTML = elements.map(e =>
        `<span style="display:inline-block;background:#333;padding:3px 8px;margin:2px;border-radius:4px;color:#FFD700">${e.symbol}</span>`
    ).join('');

    // Calculate and show predictions
    const pred = predictCompoundProperties(elements);

    // Stability color
    let stabColor = pred.stability > 0.8 ? '#00FF00' :
                    pred.stability > 0.5 ? '#FFFF00' : '#FF4444';

    // Color helper function
    const getColor = (val, thresholds, colors) => {
        for (let i = 0; i < thresholds.length; i++) {
            if (val > thresholds[i]) return colors[i];
        }
        return colors[colors.length - 1];
    };

    // Property colors
    const hardColor = getColor(pred.hardness, [50, 20, 5], ['#00FF00', '#FFFF00', '#FFA500', '#888']);
    const thermalColor = getColor(pred.thermalConductivity, [500, 100, 20], ['#00FF00', '#FFFF00', '#FFA500', '#888']);
    const elecColor = getColor(pred.electricalConductivity, [50, 10, 1], ['#00FF00', '#FFFF00', '#FFA500', '#888']);
    const meltColor = getColor(pred.meltingPoint, [2500, 1500, 500], ['#FF4444', '#FFA500', '#FFFF00', '#88aaff']);
    const resistColor = getColor(100 - pred.resistivity, [80, 50, 20], ['#00FF00', '#FFFF00', '#FFA500', '#888']);
    const ductColor = getColor(pred.ductility, [70, 40, 20], ['#00FF00', '#FFFF00', '#FFA500', '#888']);
    const corrColor = getColor(pred.corrosionResistance, [70, 40, 20], ['#00FF00', '#FFFF00', '#FFA500', '#888']);
    const magColor = pred.magnetic > 60 ? '#FF4444' : pred.magnetic > 30 ? '#FFA500' : '#888';
    const bandColor = pred.bandgap > 3 ? '#888' : pred.bandgap > 1 ? '#FFFF00' : pred.bandgap > 0 ? '#FFA500' : '#00FF00';

    // Magnetic label
    const magLabel = pred.magnetic > 60 ? 'Ferro' : pred.magnetic > 30 ? 'Para' : 'Dia';

    resultsDiv.innerHTML = `
        <div style="border-top:1px solid #333;padding-top:10px;margin-top:5px">
            <div style="font-size:18px;color:#FFD700;margin-bottom:8px;text-align:center">${pred.formula}</div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:10px;font-size:10px">
                <div style="text-align:center">
                    <span style="color:#888">tau:</span>
                    <span style="color:${stabColor}">${pred.tau_net >= 0 ? '+' : ''}${pred.tau_net.toFixed(2)}</span>
                </div>
                <div style="text-align:center">
                    <span style="color:#888">Stab:</span>
                    <span style="color:${stabColor}">${(pred.stability * 100).toFixed(0)}%</span>
                </div>
                <div style="text-align:center">
                    <span style="color:${elecColor}">${pred.conductorClass}</span>
                </div>
            </div>

            ${pred.binaryStretch < 1 ? '<div style="color:#FFA500;font-size:9px;text-align:center;margin-bottom:6px">Interface strain (opposite torques)</div>' : ''}

            <div style="background:#1a1a2e;border-radius:6px;padding:8px;margin-bottom:6px">
                <div style="color:#FFD700;font-size:10px;margin-bottom:6px;text-align:center">MECHANICAL</div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
                    <div style="background:#0d0d1a;padding:6px 4px;border-radius:3px;text-align:center">
                        <div style="color:#888;font-size:8px">HARDNESS</div>
                        <div style="font-size:14px;color:${hardColor}">${pred.hardness.toFixed(1)}</div>
                        <div style="color:#555;font-size:7px">GPa</div>
                    </div>
                    <div style="background:#0d0d1a;padding:6px 4px;border-radius:3px;text-align:center">
                        <div style="color:#888;font-size:8px">DUCTILITY</div>
                        <div style="font-size:14px;color:${ductColor}">${pred.ductility.toFixed(0)}</div>
                        <div style="color:#555;font-size:7px">%</div>
                    </div>
                    <div style="background:#0d0d1a;padding:6px 4px;border-radius:3px;text-align:center">
                        <div style="color:#888;font-size:8px">DENSITY</div>
                        <div style="font-size:14px;color:#aaa">${pred.density.toFixed(1)}</div>
                        <div style="color:#555;font-size:7px">g/cm3</div>
                    </div>
                </div>
            </div>

            <div style="background:#1a1a2e;border-radius:6px;padding:8px;margin-bottom:6px">
                <div style="color:#FFD700;font-size:10px;margin-bottom:6px;text-align:center">THERMAL / ELECTRICAL</div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
                    <div style="background:#0d0d1a;padding:6px 4px;border-radius:3px;text-align:center">
                        <div style="color:#888;font-size:8px">MELT PT</div>
                        <div style="font-size:14px;color:${meltColor}">${pred.meltingPoint.toFixed(0)}</div>
                        <div style="color:#555;font-size:7px">K</div>
                    </div>
                    <div style="background:#0d0d1a;padding:6px 4px;border-radius:3px;text-align:center">
                        <div style="color:#888;font-size:8px">THERMAL K</div>
                        <div style="font-size:14px;color:${thermalColor}">${pred.thermalConductivity.toFixed(0)}</div>
                        <div style="color:#555;font-size:7px">W/mK</div>
                    </div>
                    <div style="background:#0d0d1a;padding:6px 4px;border-radius:3px;text-align:center">
                        <div style="color:#888;font-size:8px">ELEC COND</div>
                        <div style="font-size:14px;color:${elecColor}">${pred.electricalConductivity.toFixed(0)}</div>
                        <div style="color:#555;font-size:7px">rel</div>
                    </div>
                </div>
            </div>

            <div style="background:#1a1a2e;border-radius:6px;padding:8px;margin-bottom:6px">
                <div style="color:#FFD700;font-size:10px;margin-bottom:6px;text-align:center">SPECIAL PROPERTIES</div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px">
                    <div style="background:#0d0d1a;padding:6px 4px;border-radius:3px;text-align:center">
                        <div style="color:#888;font-size:8px">CORROSION</div>
                        <div style="font-size:12px;color:${corrColor}">${pred.corrosionResistance.toFixed(0)}</div>
                    </div>
                    <div style="background:#0d0d1a;padding:6px 4px;border-radius:3px;text-align:center">
                        <div style="color:#888;font-size:8px">RESISTIV</div>
                        <div style="font-size:12px;color:${resistColor}">${pred.resistivity.toFixed(0)}</div>
                    </div>
                    <div style="background:#0d0d1a;padding:6px 4px;border-radius:3px;text-align:center">
                        <div style="color:#888;font-size:8px">MAGNETIC</div>
                        <div style="font-size:12px;color:${magColor}">${magLabel}</div>
                    </div>
                    <div style="background:#0d0d1a;padding:6px 4px;border-radius:3px;text-align:center">
                        <div style="color:#888;font-size:8px">BANDGAP</div>
                        <div style="font-size:12px;color:${bandColor}">${pred.bandgap.toFixed(1)}</div>
                        <div style="color:#555;font-size:7px">eV</div>
                    </div>
                </div>
            </div>

            <div style="font-size:9px;color:#555;text-align:center">
                ${pred.details.map(d => `${d.symbol}:${d.tau >= 0 ? '+' : ''}${d.tau.toFixed(1)}`).join(' | ')}
            </div>
        </div>
    `;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function initHardnessExplorer() {
    createHardnessPanel();

    // Add button to info panel to toggle explorer
    const infoPanel = document.getElementById('info-panel');
    if (infoPanel) {
        const button = document.createElement('div');
        button.style.cssText = 'margin-top:10px;border-top:1px solid #444;padding-top:10px';
        button.innerHTML = `
            <button id="he-open" style="background:#1a1a2e;color:#FFD700;border:1px solid #FFD700;padding:8px 12px;cursor:pointer;border-radius:4px;width:100%">
                Materials Property Explorer
            </button>
        `;
        infoPanel.appendChild(button);

        document.getElementById('he-open').addEventListener('click', () => {
            MaterialsExplorer.enabled = true;
            MaterialsExplorer.panel.style.display = 'block';
        });
    }

    console.log('Materials Property Explorer initialized');
}

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHardnessExplorer);
} else {
    // Small delay to ensure main script loaded
    setTimeout(initHardnessExplorer, 100);
}

// Export for use in main script
window.MaterialsExplorer = MaterialsExplorer;
window.HardnessExplorer = HardnessExplorer;  // Backwards compatibility
window.selectElementForHardness = selectElementForHardness;
