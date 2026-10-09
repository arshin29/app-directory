import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calculator, 
  Zap, 
  Clock, 
  Wrench, 
  UserCheck, 
  DollarSign, 
  TrendingUp, 
  Copy, 
  Check, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import './CostCalculatorApp.css';

const MATERIAL_PRESETS = [
  { name: 'PLA (Standard)', spoolCost: 20, spoolWeightG: 1000, density: 1.24 },
  { name: 'PETG (Tough)', spoolCost: 24, spoolWeightG: 1000, density: 1.27 },
  { name: 'ABS (Heat Resistant)', spoolCost: 22, spoolWeightG: 1000, density: 1.04 },
  { name: 'TPU (Flexible 95A)', spoolCost: 32, spoolWeightG: 1000, density: 1.21 },
  { name: 'PA-CF (Carbon Fiber)', spoolCost: 65, spoolWeightG: 1000, density: 1.15 },
  { name: 'Standard UV Resin', spoolCost: 30, spoolWeightG: 1000, density: 1.10 }
];

const QUICK_JOB_PRESETS = [
  {
    name: 'Mechanical Bracket',
    materialIndex: 1, // PETG
    weightG: 145,
    hours: 4,
    minutes: 30,
    laborMins: 15,
    markupPct: 45
  },
  {
    name: 'Miniature Figurine',
    materialIndex: 5, // Resin
    weightG: 38,
    hours: 3,
    minutes: 15,
    laborMins: 25,
    markupPct: 60
  },
  {
    name: 'Large Prototype Enclosure',
    materialIndex: 0, // PLA
    weightG: 380,
    hours: 14,
    minutes: 0,
    laborMins: 20,
    markupPct: 40
  }
];

export default function CostCalculatorApp() {
  // Input states
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState(0);
  const [spoolPrice, setSpoolPrice] = useState(22);
  const [spoolWeight, setSpoolWeight] = useState(1000);
  const [partWeight, setPartWeight] = useState(120);

  const [printHours, setPrintHours] = useState(5);
  const [printMinutes, setPrintMinutes] = useState(30);

  const [printerWatts, setPrinterWatts] = useState(150);
  const [kwhRate, setKwhRate] = useState(0.16); // $0.16/kWh
  const [machineHourlyWear, setMachineHourlyWear] = useState(0.75); // $0.75/hr

  const [laborMinutes, setLaborMinutes] = useState(20);
  const [laborHourlyRate, setLaborHourlyRate] = useState(25); // $25/hr

  const [failureRatePct, setFailureRatePct] = useState(8); // 8% risk margin
  const [markupPct, setMarkupPct] = useState(50); // 50% profit margin

  const [copied, setCopied] = useState(false);

  // Handle preset material selection
  const handleMaterialSelect = (index) => {
    setSelectedMaterialIdx(index);
    const preset = MATERIAL_PRESETS[index];
    if (preset) {
      setSpoolPrice(preset.spoolCost);
      setSpoolWeight(preset.spoolWeightG);
    }
  };

  // Handle quick job preset
  const applyJobPreset = (job) => {
    setSelectedMaterialIdx(job.materialIndex);
    const preset = MATERIAL_PRESETS[job.materialIndex];
    if (preset) {
      setSpoolPrice(preset.spoolCost);
      setSpoolWeight(preset.spoolWeightG);
    }
    setPartWeight(job.weightG);
    setPrintHours(job.hours);
    setPrintMinutes(job.minutes);
    setLaborMinutes(job.laborMins);
    setMarkupPct(job.markupPct);
  };

  // Math Calculations
  const calculations = useMemo(() => {
    const totalPrintHours = (Number(printHours) || 0) + (Number(printMinutes) || 0) / 60;
    
    // 1. Material cost
    const costPerGram = (Number(spoolPrice) || 0) / (Number(spoolWeight) || 1000);
    const materialCost = (Number(partWeight) || 0) * costPerGram;

    // 2. Power cost
    // Watts / 1000 = kW * hours * $/kWh
    const kwhConsumed = ((Number(printerWatts) || 0) / 1000) * totalPrintHours;
    const powerCost = kwhConsumed * (Number(kwhRate) || 0);

    // 3. Machine Wear / Depreciation
    const machineWearCost = totalPrintHours * (Number(machineHourlyWear) || 0);

    // 4. Labor Cost
    const laborHours = (Number(laborMinutes) || 0) / 60;
    const laborCost = laborHours * (Number(laborHourlyRate) || 0);

    // 5. Subtotal direct cost
    const directCost = materialCost + powerCost + machineWearCost + laborCost;

    // 6. Failure contingency buffer
    const failureCost = directCost * ((Number(failureRatePct) || 0) / 100);

    // 7. Total Production Cost
    const totalProductionCost = directCost + failureCost;

    // 8. Recommended Selling Price
    // Price = Cost / (1 - Margin/100)
    const marginRatio = (Number(markupPct) || 0) / 100;
    const sellingPrice = marginRatio < 0.99 ? totalProductionCost / (1 - marginRatio) : totalProductionCost * 2;
    const netProfit = sellingPrice - totalProductionCost;
    const wholesalePrice = totalProductionCost * 1.35; // 35% standard wholesale markup

    return {
      costPerGram,
      totalPrintHours,
      materialCost,
      kwhConsumed,
      powerCost,
      machineWearCost,
      laborCost,
      failureCost,
      totalProductionCost,
      sellingPrice,
      netProfit,
      wholesalePrice
    };
  }, [
    spoolPrice, spoolWeight, partWeight,
    printHours, printMinutes,
    printerWatts, kwhRate, machineHourlyWear,
    laborMinutes, laborHourlyRate,
    failureRatePct, markupPct
  ]);

  const copySummary = () => {
    const text = `--- 3D PRINTING COST QUOTE ---
Job: ${MATERIAL_PRESETS[selectedMaterialIdx]?.name || 'Custom'} (${partWeight}g)
Print Time: ${printHours}h ${printMinutes}m

Direct Costs:
• Material: $${calculations.materialCost.toFixed(2)}
• Electricity (${calculations.kwhConsumed.toFixed(2)} kWh): $${calculations.powerCost.toFixed(2)}
• Machine Wear & Depreciation: $${calculations.machineWearCost.toFixed(2)}
• Labor (${laborMinutes} min): $${calculations.laborCost.toFixed(2)}
• Risk Buffer (${failureRatePct}%): $${calculations.failureCost.toFixed(2)}

Total Production Cost: $${calculations.totalProductionCost.toFixed(2)}
Target Profit Margin: ${markupPct}%
Net Profit: $${calculations.netProfit.toFixed(2)}

RECOMMENDED RETAIL PRICE: $${calculations.sellingPrice.toFixed(2)}
Wholesale Price: $${calculations.wholesalePrice.toFixed(2)}
Generated via 3D Apps Directory
-----------------------------`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="calc-app-page">
      {/* Top Header Bar */}
      <div className="calc-header-nav">
        <Link to="/" className="calc-back-btn">
          <ArrowLeft size={16} />
          <span>Back to 3D Apps</span>
        </Link>
        <StatusBadge status="Ready" size="normal" />
      </div>

      <div className="calc-hero">
        <h1 className="calc-hero-title">3D Printing Cost Calculator</h1>
        <p className="calc-hero-subtitle">
          Accurately calculate filament consumption, machine wear, energy rates, labor, and profitable selling price quotes.
        </p>

        {/* Preset Chips */}
        <div className="calc-presets-bar">
          <span className="presets-label">
            <Sparkles size={13} /> Quick Presets:
          </span>
          {QUICK_JOB_PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              className="preset-chip"
              onClick={() => applyJobPreset(p)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="calc-layout-grid">
        {/* Left Inputs Column */}
        <div className="calc-inputs-column">
          
          {/* Section 1: Material */}
          <div className="calc-card">
            <div className="calc-card-header">
              <div className="calc-icon-bubble">
                <Calculator size={18} />
              </div>
              <div>
                <h3 className="calc-card-title">Material & Filament</h3>
                <p className="calc-card-desc">Select material type or enter custom spool pricing</p>
              </div>
            </div>

            <div className="material-selector-chips">
              {MATERIAL_PRESETS.map((mat, idx) => (
                <button
                  key={mat.name}
                  type="button"
                  className={`mat-chip ${selectedMaterialIdx === idx ? 'active' : ''}`}
                  onClick={() => handleMaterialSelect(idx)}
                >
                  {mat.name}
                </button>
              ))}
            </div>

            <div className="input-row-grid">
              <div className="input-group">
                <label>Spool Price ($)</label>
                <div className="input-affix">
                  <span className="affix-prefix">$</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={spoolPrice}
                    onChange={(e) => setSpoolPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Spool Weight (g)</label>
                <div className="input-affix">
                  <input
                    type="number"
                    step="50"
                    min="100"
                    value={spoolWeight}
                    onChange={(e) => setSpoolWeight(e.target.value)}
                  />
                  <span className="affix-suffix">g</span>
                </div>
              </div>

              <div className="input-group">
                <label>Part Weight (g)</label>
                <div className="input-affix">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={partWeight}
                    onChange={(e) => setPartWeight(e.target.value)}
                  />
                  <span className="affix-suffix">g</span>
                </div>
              </div>
            </div>

            <div className="calc-inline-metric">
              <span>Filament Unit Rate:</span>
              <strong>${calculations.costPerGram.toFixed(4)} / gram</strong>
            </div>
          </div>

          {/* Section 2: Print Time & Power */}
          <div className="calc-card">
            <div className="calc-card-header">
              <div className="calc-icon-bubble">
                <Clock size={18} />
              </div>
              <div>
                <h3 className="calc-card-title">Print Time & Machine Run</h3>
                <p className="calc-card-desc">Duration and power drawn by the 3D printer</p>
              </div>
            </div>

            <div className="input-row-grid">
              <div className="input-group">
                <label>Print Hours</label>
                <div className="input-affix">
                  <input
                    type="number"
                    min="0"
                    value={printHours}
                    onChange={(e) => setPrintHours(e.target.value)}
                  />
                  <span className="affix-suffix">hrs</span>
                </div>
              </div>

              <div className="input-group">
                <label>Print Minutes</label>
                <div className="input-affix">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={printMinutes}
                    onChange={(e) => setPrintMinutes(e.target.value)}
                  />
                  <span className="affix-suffix">mins</span>
                </div>
              </div>

              <div className="input-group">
                <label>Printer Power (W)</label>
                <div className="input-affix">
                  <input
                    type="number"
                    step="10"
                    min="20"
                    value={printerWatts}
                    onChange={(e) => setPrinterWatts(e.target.value)}
                  />
                  <span className="affix-suffix">W</span>
                </div>
              </div>
            </div>

            <div className="input-row-grid" style={{ marginTop: '12px' }}>
              <div className="input-group">
                <label>Electricity Rate ($/kWh)</label>
                <div className="input-affix">
                  <span className="affix-prefix">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={kwhRate}
                    onChange={(e) => setKwhRate(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Machine Wear ($/hr)</label>
                <div className="input-affix">
                  <span className="affix-prefix">$</span>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={machineHourlyWear}
                    onChange={(e) => setMachineHourlyWear(e.target.value)}
                  />
                  <span className="affix-suffix">/hr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Labor & Margin */}
          <div className="calc-card">
            <div className="calc-card-header">
              <div className="calc-icon-bubble">
                <UserCheck size={18} />
              </div>
              <div>
                <h3 className="calc-card-title">Labor & Risk Buffer</h3>
                <p className="calc-card-desc">Slicing, bed prep, support removal, and failure allowance</p>
              </div>
            </div>

            <div className="input-row-grid">
              <div className="input-group">
                <label>Labor Time</label>
                <div className="input-affix">
                  <input
                    type="number"
                    step="5"
                    min="0"
                    value={laborMinutes}
                    onChange={(e) => setLaborMinutes(e.target.value)}
                  />
                  <span className="affix-suffix">mins</span>
                </div>
              </div>

              <div className="input-group">
                <label>Labor Rate ($/hr)</label>
                <div className="input-affix">
                  <span className="affix-prefix">$</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={laborHourlyRate}
                    onChange={(e) => setLaborHourlyRate(e.target.value)}
                  />
                  <span className="affix-suffix">/hr</span>
                </div>
              </div>

              <div className="input-group">
                <label>Failure Risk Buffer (%)</label>
                <div className="input-affix">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="50"
                    value={failureRatePct}
                    onChange={(e) => setFailureRatePct(e.target.value)}
                  />
                  <span className="affix-suffix">%</span>
                </div>
              </div>
            </div>

            {/* Target Profit Margin Slider */}
            <div className="slider-group">
              <div className="slider-header">
                <label>Target Profit Margin</label>
                <span className="slider-val">{markupPct}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="85"
                step="5"
                value={markupPct}
                onChange={(e) => setMarkupPct(Number(e.target.value))}
                className="apple-slider"
              />
              <div className="slider-ticks">
                <span>10% Low</span>
                <span>35% Standard</span>
                <span>50% Custom</span>
                <span>80% Art/High Value</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Summary Column */}
        <div className="calc-summary-column">
          <div className="summary-sticky-card">
            
            {/* Primary Selling Price Banner */}
            <div className="summary-price-hero">
              <span className="summary-price-tag">Recommended Selling Price</span>
              <div className="summary-price-figure">
                <span className="currency-symbol">$</span>
                <span className="amount">{calculations.sellingPrice.toFixed(2)}</span>
              </div>
              <div className="summary-profit-badge">
                <TrendingUp size={14} />
                <span>+${calculations.netProfit.toFixed(2)} Net Profit ({markupPct}% Margin)</span>
              </div>
            </div>

            {/* Detailed Cost Breakdown Table */}
            <div className="cost-breakdown-table">
              <h4 className="breakdown-heading">Cost Breakdown</h4>
              
              <div className="breakdown-row">
                <span className="breakdown-label">Material Cost ({partWeight}g)</span>
                <span className="breakdown-value">${calculations.materialCost.toFixed(2)}</span>
              </div>

              <div className="breakdown-row">
                <span className="breakdown-label">Electricity ({calculations.kwhConsumed.toFixed(2)} kWh)</span>
                <span className="breakdown-value">${calculations.powerCost.toFixed(2)}</span>
              </div>

              <div className="breakdown-row">
                <span className="breakdown-label">Machine Wear & Deprec.</span>
                <span className="breakdown-value">${calculations.machineWearCost.toFixed(2)}</span>
              </div>

              <div className="breakdown-row">
                <span className="breakdown-label">Operator Labor ({laborMinutes}m)</span>
                <span className="breakdown-value">${calculations.laborCost.toFixed(2)}</span>
              </div>

              <div className="breakdown-row">
                <span className="breakdown-label">Failure Margin ({failureRatePct}%)</span>
                <span className="breakdown-value">${calculations.failureCost.toFixed(2)}</span>
              </div>

              <div className="breakdown-divider" />

              <div className="breakdown-row total-row">
                <span className="breakdown-label">Total Production Cost</span>
                <span className="breakdown-value">${calculations.totalProductionCost.toFixed(2)}</span>
              </div>

              <div className="breakdown-row wholesale-row">
                <span className="breakdown-label">Suggested Wholesale (35% markup)</span>
                <span className="breakdown-value">${calculations.wholesalePrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="summary-actions">
              <button 
                type="button" 
                className="apple-button apple-button-primary copy-quote-btn"
                onClick={copySummary}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Quote Copied to Clipboard!' : 'Copy Quote Breakdown'}</span>
              </button>
            </div>

            <div className="summary-footer-note">
              <Info size={13} />
              <span>Quotes can be pasted directly into customer emails or invoices.</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
