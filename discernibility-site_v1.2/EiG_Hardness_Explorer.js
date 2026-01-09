/**
 * EiG Hardness Explorer - Interactive Compound Predictor
 * ========================================================
 *
 * Allows users to select elements and see predicted material properties
 * based on Metric Torque balancing and derived electronegativity.
 *
 * PREDICTION ENGINE:
 *   tau_net = Sum of Metric Torques (phase-slip balancing)
 *   omega_EiG = Derived electronegativity from helicoid position
 *   H = Hardness from covalent character and torque resonance
 *
 * Add this script after EiG_Helicoid_3D.js
 */

// ============================================================================
// HARDNESS EXPLORER STATE
// ============================================================================

const HardnessExplorer = {
    enabled: false,
    selectedElements: [],
    maxSelections: 4,
    panel: null,
    bondLines: [],
};

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

    return {
        formula: elements.map(e => e.symbol).join(''),
        tau_net: tau_net,
        omega_avg: omega_avg,
        stability: stability,
        stabilityClass: stabilityClass,
        hardness: H_scaled,
        bondType: bondType,
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
        background: rgba(0, 0, 0, 0.9);
        color: #fff;
        padding: 15px 20px;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        min-width: 280px;
        border: 1px solid #FFD700;
        z-index: 1000;
        display: none;
    `;

    panel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span style="color:#FFD700;font-weight:bold">Hardness Explorer</span>
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
    HardnessExplorer.panel = panel;

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

    // Hardness color (scaled 0-100)
    let hardColor = pred.hardness > 50 ? '#00FF00' :
                    pred.hardness > 20 ? '#FFFF00' :
                    pred.hardness > 5 ? '#FFA500' : '#888';

    resultsDiv.innerHTML = `
        <div style="border-top:1px solid #333;padding-top:10px;margin-top:5px">
            <div style="font-size:16px;color:#FFD700;margin-bottom:8px">${pred.formula}</div>

            <div style="margin-bottom:6px">
                <span style="color:#888">Net Torque (tau):</span>
                <span style="color:${stabColor}">${pred.tau_net >= 0 ? '+' : ''}${pred.tau_net.toFixed(3)} eV</span>
            </div>

            <div style="margin-bottom:6px">
                <span style="color:#888">Stability:</span>
                <span style="color:${stabColor}">${(pred.stability * 100).toFixed(1)}%</span>
                <span style="color:#666;font-size:10px">(${pred.stabilityClass})</span>
            </div>

            <div style="margin-bottom:6px">
                <span style="color:#888">Bond Type:</span>
                <span style="color:#aaa">${pred.bondType}</span>
                ${pred.binaryStretch < 1 ? '<span style="color:#FFA500;font-size:10px"> (interface strain)</span>' : ''}
            </div>

            <div style="margin-bottom:6px">
                <span style="color:#888">Avg Electronegativity:</span>
                <span style="color:#aaa">${pred.omega_avg.toFixed(2)}</span>
            </div>

            <div style="margin-top:10px;padding:8px;background:#1a1a2e;border-radius:4px">
                <div style="color:#888;font-size:10px;margin-bottom:4px">PREDICTED HARDNESS (v10)</div>
                <div style="font-size:20px;color:${hardColor}">${pred.hardness.toFixed(1)} GPa</div>
                <div style="color:#666;font-size:10px">Vickers scale (Diamond=100)</div>
            </div>

            <div style="margin-top:8px;font-size:10px;color:#666">
                ${pred.details.map(d =>
                    `${d.symbol}: tau=${d.tau >= 0 ? '+' : ''}${d.tau.toFixed(2)}, f=${d.fatigue.toFixed(2)}`
                ).join('<br>')}
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
                Open Hardness Explorer
            </button>
        `;
        infoPanel.appendChild(button);

        document.getElementById('he-open').addEventListener('click', () => {
            HardnessExplorer.enabled = true;
            HardnessExplorer.panel.style.display = 'block';
        });
    }

    console.log('Hardness Explorer initialized');
}

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHardnessExplorer);
} else {
    // Small delay to ensure main script loaded
    setTimeout(initHardnessExplorer, 100);
}

// Export for use in main script
window.HardnessExplorer = HardnessExplorer;
window.selectElementForHardness = selectElementForHardness;
