/**
 * PEOPLE CEYLON PRIVATE LIMITED
 * OFFICIAL LEASING APPLICATION ENGINE & FINANCIAL CALCULATOR
 */

// Application State
const state = {
  vehicleCategory: 'car',
  vehicleValue: 8500000,
  downPaymentPct: 20,
  tenureMonths: 60,
  annualInterestRate: 11.45,
  rateScheme: 'promotional',
  monthlyInstallment: 0,
  loanPrincipal: 0,
  totalInterest: 0,
  totalPayable: 0,
  amortView: 'yearly',
};

// Rate Schemes definition
const rateSchemes = {
  promotional: 11.45, // Prime Launch Rate
  commercial: 12.25,  // Commercial & Fleet
  speed: 13.50,       // Speed Draft / Cash against Logbook
};

// Vehicle Type Presets
const vehiclePresets = {
  car: { name: 'Cars & Sedans', value: 8500000, downPct: 20, tenure: 60, scheme: 'promotional' },
  sedan: { name: 'Executive Sedan', value: 14200000, downPct: 20, tenure: 60, scheme: 'promotional' },
  suv: { name: 'SUVs & 4x4', value: 17500000, downPct: 20, tenure: 60, scheme: 'promotional' },
  commercial: { name: 'Commercial & Trucks', value: 12800000, downPct: 25, tenure: 48, scheme: 'commercial' },
  hybrid: { name: 'Hybrid & EV Eco-Lease', value: 8200000, downPct: 20, tenure: 60, scheme: 'promotional' },
  tractor: { name: 'Agri & Machinery', value: 5500000, downPct: 20, tenure: 60, scheme: 'commercial' },
  dual: { name: 'Vans & Dual-Purpose', value: 9500000, downPct: 20, tenure: 60, scheme: 'promotional' },
  tuktuk: { name: 'Bikes & Tuk-Tuks', value: 1800000, downPct: 15, tenure: 36, scheme: 'speed' },
  bike: { name: 'Three-Wheelers & Bikes', value: 1400000, downPct: 15, tenure: 36, scheme: 'speed' },
};

const setVehicleCategory = (cat) => setCalcVehicleCategory(cat);


// Helper: Format LKR
function formatLKR(num) {
  if (isNaN(num) || num === null || num === undefined) return '0';
  return Math.round(num).toLocaleString('en-US');
}

function parseLKR(str) {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  return Number(str.replace(/[^0-9]/g, '')) || 0;
}

document.addEventListener('DOMContentLoaded', () => {
  initCalculator();
  initMobileMenu();
});

/* ==========================================================================
   CALCULATOR CORE ENGINE
   ========================================================================== */
function initCalculator() {
  updateCalculator();
}

function setCalcVehicleCategory(category) {
  if (!vehiclePresets[category]) return;
  state.vehicleCategory = category;

  document.querySelectorAll('.calc-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-type') === category);
  });

  const preset = vehiclePresets[category];
  state.vehicleValue = preset.value;
  state.downPaymentPct = preset.downPct;
  state.tenureMonths = preset.tenure;

  const priceSlider = document.getElementById('priceRange');
  const priceInput = document.getElementById('vehiclePriceInput');
  const downSlider = document.getElementById('downPaymentRange');

  if (priceSlider) priceSlider.value = state.vehicleValue;
  if (priceInput) priceInput.value = formatLKR(state.vehicleValue);
  if (downSlider) downSlider.value = state.downPaymentPct;

  setTenure(state.tenureMonths, false);
  if (preset.scheme) {
    setRateScheme(preset.scheme);
  } else {
    updateCalculator();
  }
}

function handleDirectPriceInput(val) {
  const num = parseLKR(val);
  const clamped = Math.max(500000, Math.min(50000000, num));
  state.vehicleValue = clamped;

  const priceSlider = document.getElementById('priceRange');
  const priceInput = document.getElementById('vehiclePriceInput');

  if (priceSlider) priceSlider.value = clamped;
  if (priceInput) priceInput.value = formatLKR(clamped);

  updateCalculator();
}

function setQuickPrice(val) {
  state.vehicleValue = val;
  const priceSlider = document.getElementById('priceRange');
  const priceInput = document.getElementById('vehiclePriceInput');

  if (priceSlider) priceSlider.value = val;
  if (priceInput) priceInput.value = formatLKR(val);

  updateCalculator();
}

function setQuickDownPct(pct) {
  state.downPaymentPct = pct;
  const downSlider = document.getElementById('downPaymentRange');
  if (downSlider) downSlider.value = pct;
  updateCalculator();
}

function setTenure(months, triggerUpdate = true) {
  state.tenureMonths = Number(months);
  const years = state.tenureMonths / 12;

  const badge = document.getElementById('tenureBadge');
  if (badge) {
    badge.textContent = `${years} Year${years > 1 ? 's' : ''} (${months} Months)`;
  }

  document.querySelectorAll('.tenure-pill').forEach(btn => {
    btn.classList.toggle('active', Number(btn.getAttribute('data-months')) === months);
  });

  if (triggerUpdate) {
    updateCalculator();
  }
}

function setRateScheme(scheme) {
  state.rateScheme = scheme;
  state.annualInterestRate = rateSchemes[scheme] || 11.45;

  const radio = document.querySelector(`input[name="rateScheme"][value="${scheme}"]`);
  if (radio) radio.checked = true;

  const display = document.getElementById('rateDisplay');
  if (display) display.textContent = `${state.annualInterestRate.toFixed(2)}% p.a.`;

  updateCalculator();
}

function updateCalculator() {
  const priceSlider = document.getElementById('priceRange');
  const downSlider = document.getElementById('downPaymentRange');
  const priceInput = document.getElementById('vehiclePriceInput');

  if (priceSlider) state.vehicleValue = Number(priceSlider.value);
  if (priceInput && document.activeElement !== priceInput) {
    priceInput.value = formatLKR(state.vehicleValue);
  }

  if (downSlider) state.downPaymentPct = Number(downSlider.value);

  // Down Payment Amount
  const downPaymentAmt = state.vehicleValue * (state.downPaymentPct / 100);
  const downAmtDisplay = document.getElementById('downPaymentAmountDisplay');
  const downPctDisplay = document.getElementById('downPaymentPctDisplay');

  if (downAmtDisplay) downAmtDisplay.textContent = `Rs. ${formatLKR(downPaymentAmt)}`;
  if (downPctDisplay) downPctDisplay.textContent = `(${state.downPaymentPct}%)`;

  // Financed Principal
  const principal = state.vehicleValue - downPaymentAmt;
  state.loanPrincipal = principal;

  // Declining Balance Equated Lease Rental
  const r = (state.annualInterestRate / 100) / 12;
  const n = state.tenureMonths;

  let installment = 0;
  if (r > 0 && n > 0) {
    installment = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  } else if (n > 0) {
    installment = principal / n;
  }

  state.monthlyInstallment = installment;
  state.totalPayable = installment * n;
  state.totalInterest = state.totalPayable - principal;

  // Update UI Elements
  const instElem = document.getElementById('calculatedMonthlyInstallment');
  if (instElem) instElem.textContent = formatLKR(installment);

  const princElem = document.getElementById('displayLoanPrincipal');
  if (princElem) princElem.textContent = `Rs. ${formatLKR(principal)}`;

  const intElem = document.getElementById('displayTotalInterest');
  if (intElem) intElem.textContent = `Rs. ${formatLKR(state.totalInterest)}`;

  const totElem = document.getElementById('displayTotalPayable');
  if (totElem) totElem.textContent = `Rs. ${formatLKR(state.totalPayable)}`;

  // Update Donut Chart
  updateDonutChart(principal, state.totalInterest);

  // Update Comparison Cards
  renderComparisonMatrix();
}

/* ==========================================================================
   DONUT CHART SVG ANIMATION
   ========================================================================== */
function updateDonutChart(principal, interest) {
  const total = principal + interest;
  if (total <= 0) return;

  const princPct = (principal / total) * 100;
  const intPct = 100 - princPct;

  const circ = 251.327;
  const princStroke = (princPct / 100) * circ;
  const intStroke = (intPct / 100) * circ;

  const princSegment = document.getElementById('donutPrincipal');
  const intSegment = document.getElementById('donutInterest');
  const pctDisplay = document.getElementById('donutPrincipalPct');

  if (princSegment) {
    princSegment.style.strokeDasharray = `${princStroke} ${circ}`;
    princSegment.style.strokeDashoffset = '0';
  }

  if (intSegment) {
    intSegment.style.strokeDasharray = `${intStroke} ${circ}`;
    intSegment.style.strokeDashoffset = `-${princStroke}`;
  }

  if (pctDisplay) {
    pctDisplay.textContent = `${Math.round(princPct)}%`;
  }
}

/* ==========================================================================
   4-TENURE COMPARISON MATRIX
   ========================================================================== */
function renderComparisonMatrix() {
  const container = document.getElementById('comparisonCards');
  if (!container) return;

  const tenures = [
    { years: 3, months: 36, label: '3 Years', badge: 'Fastest Payoff' },
    { years: 4, months: 48, label: '4 Years', badge: 'Balanced' },
    { years: 5, months: 60, label: '5 Years', badge: 'Most Popular' },
    { years: 7, months: 84, label: '7 Years', badge: 'Lowest Monthly' },
  ];

  const principal = state.loanPrincipal;
  const r = (state.annualInterestRate / 100) / 12;

  let html = '';

  tenures.forEach(item => {
    const n = item.months;
    let inst = 0;
    if (r > 0 && n > 0) {
      inst = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      inst = principal / n;
    }

    const totalPayable = inst * n;
    const totalInterest = totalPayable - principal;
    const isSelected = state.tenureMonths === item.months;

    html += `
      <div class="comp-box ${isSelected ? 'is-selected' : ''}">
        <div class="comp-box-header">
          <span class="comp-tenure-label">${item.label}</span>
          <span class="badge-tag ${isSelected ? 'badge-gold' : ''}">
            ${isSelected ? 'ACTIVE' : item.badge}
          </span>
        </div>
        <div style="margin: 8px 0;">
          <div class="comp-inst-val">Rs. ${formatLKR(inst)}</div>
          <div style="font-size: 0.72rem; color: #64748B;">/ month (${item.months} rentals)</div>
        </div>
        <div style="font-size: 0.78rem; color: #64748B; border-top: 1px dashed #E2E8F0; padding-top: 8px;">
          <div>Total Interest: <strong>Rs. ${formatLKR(totalInterest)}</strong></div>
          <div>Total Repayment: <strong>Rs. ${formatLKR(totalPayable)}</strong></div>
        </div>
        ${
          !isSelected
            ? `<button type="button" class="btn btn-outline-red btn-sm btn-block" style="margin-top: 10px;" onclick="setTenure(${item.months})">Select ${item.label}</button>`
            : `<div style="margin-top: 10px; font-size: 0.75rem; text-align: center; color: var(--pc-red); font-weight: bold;">Current Selection</div>`
        }
      </div>
    `;
  });

  container.innerHTML = html;
}

/* ==========================================================================
   AMORTIZATION MODAL
   ========================================================================== */
function openAmortizationModal() {
  renderAmortizationTable();
  const modal = document.getElementById('amortizationModal');
  if (modal) modal.classList.add('open');
}

function closeAmortizationModal() {
  const modal = document.getElementById('amortizationModal');
  if (modal) modal.classList.remove('open');
}

function renderAmortizationTable() {
  const tbody = document.getElementById('amortizationTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const principal = state.loanPrincipal;
  const monthlyRate = (state.annualInterestRate / 100) / 12;
  const monthlyInstallment = state.monthlyInstallment;
  const totalMonths = state.tenureMonths;
  const totalYears = Math.ceil(totalMonths / 12);

  let currentBalance = principal;

  for (let year = 1; year <= totalYears; year++) {
    let yearPrincipalPaid = 0;
    let yearInterestPaid = 0;
    const monthsInYear = Math.min(12, totalMonths - (year - 1) * 12);

    for (let m = 1; m <= monthsInYear; m++) {
      const interestForMonth = currentBalance * monthlyRate;
      const principalForMonth = monthlyInstallment - interestForMonth;
      yearInterestPaid += interestForMonth;
      yearPrincipalPaid += principalForMonth;
      currentBalance -= principalForMonth;
      if (currentBalance < 0) currentBalance = 0;
    }

    const totalAnnualPaid = yearPrincipalPaid + yearInterestPaid;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>Year ${year}</strong></td>
      <td>Rs. ${formatLKR(yearPrincipalPaid)}</td>
      <td>Rs. ${formatLKR(yearInterestPaid)}</td>
      <td>Rs. ${formatLKR(totalAnnualPaid)}</td>
      <td><strong>Rs. ${formatLKR(currentBalance)}</strong></td>
    `;
    tbody.appendChild(tr);
  }
}

function exportAmortizationCSV() {
  const principal = state.loanPrincipal;
  const monthlyRate = (state.annualInterestRate / 100) / 12;
  const monthlyInstallment = state.monthlyInstallment;
  const totalMonths = state.tenureMonths;

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "People Ceylon Private Limited - Amortization Schedule\r\n";
  csvContent += `Vehicle Market Value,${state.vehicleValue}\r\n`;
  csvContent += `Down Payment,${state.vehicleValue * (state.downPaymentPct / 100)}\r\n`;
  csvContent += `Financed Principal,${principal}\r\n`;
  csvContent += `Tenure Months,${totalMonths}\r\n`;
  csvContent += `Interest Rate,${state.annualInterestRate}%\r\n`;
  csvContent += `Monthly Installment,${Math.round(monthlyInstallment)}\r\n\r\n`;
  csvContent += "Month,Installment,Principal Paid,Interest Paid,Remaining Balance\r\n";

  let currentBalance = principal;
  for (let m = 1; m <= totalMonths; m++) {
    const interest = currentBalance * monthlyRate;
    const princ = monthlyInstallment - interest;
    currentBalance -= princ;
    if (currentBalance < 0) currentBalance = 0;

    csvContent += `${m},${Math.round(monthlyInstallment)},${Math.round(princ)},${Math.round(interest)},${Math.round(currentBalance)}\r\n`;
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `People_Ceylon_Lease_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ==========================================================================
   WHATSAPP INSTANT QUOTE GENERATOR
   ========================================================================== */
function shareViaWhatsAppQuote() {
  const categoryName = vehiclePresets[state.vehicleCategory]?.name || 'Vehicle';
  const val = formatLKR(state.vehicleValue);
  const down = formatLKR(state.vehicleValue * (state.downPaymentPct / 100));
  const principal = formatLKR(state.loanPrincipal);
  const tenure = `${state.tenureMonths / 12} Years (${state.tenureMonths} Months)`;
  const installment = formatLKR(state.monthlyInstallment);
  const totalPayable = formatLKR(state.totalPayable);

  const text = encodeURIComponent(
    `*People Ceylon Private Limited - Official Quotation*\n` +
    `=========================================\n` +
    `🚗 Vehicle Type: ${categoryName}\n` +
    `💰 Vehicle Valuation: Rs. ${val}\n` +
    `💵 Down Payment: Rs. ${down} (${state.downPaymentPct}%)\n` +
    `🏦 Financed Capital: Rs. ${principal}\n` +
    `📅 Facility Tenure: ${tenure}\n` +
    `📊 Interest Rate: ${state.annualInterestRate.toFixed(2)}% p.a.\n` +
    `-----------------------------------------\n` +
    `🔥 Calculated Monthly Installment: Rs. ${installment} / month\n` +
    `💳 Total Repayment: Rs. ${totalPayable}\n` +
    `=========================================\n` +
    `Hello People Ceylon Private Limited! Please connect me with a Senior Credit Manager to proceed with this facility.`
  );

  const url = `https://wa.me/94770000000?text=${text}`;
  window.open(url, '_blank');
}

/* ==========================================================================
   MODAL CONTROLS
   ========================================================================== */
function openApplyModal(facility = 'Vehicle Lease') {
  const modal = document.getElementById('applyModal');
  const title = document.getElementById('modalProductTitle');
  if (title) title.textContent = facility;
  if (modal) modal.classList.add('open');
}

function closeApplyModal() {
  const modal = document.getElementById('applyModal');
  if (modal) modal.classList.remove('open');
}

function handleApplySubmit(e) {
  e.preventDefault();
  const ref = `PCL-REF-${Math.floor(100000 + Math.random() * 900000)}`;
  alert(`Congratulations! Your lease request has been logged with People Ceylon Private Limited.\nReference ID: ${ref}\nA Senior Credit Officer will call your mobile within 15 to 30 minutes to confirm vehicle inspection.`);
  closeApplyModal();
}

function initMobileMenu() {
  const toggle = document.getElementById('mobileMenuToggle');
  const nav = document.getElementById('navbarMenu');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
      nav.style.flexDirection = 'column';
      nav.style.position = 'absolute';
      nav.style.top = '100%';
      nav.style.left = '0';
      nav.style.right = '0';
      nav.style.background = '#fff';
      nav.style.padding = '16px';
      nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
    });
  }
}

/* ==========================================================================
   VIDEO CONTROLS FOR FLEET EXPERIENCE
   ========================================================================== */
function toggleHeroVideo() {
  const video = document.getElementById('leasingHeroVideo');
  const text = document.getElementById('playPauseText');
  const icon = document.getElementById('playPauseIcon');
  if (!video) return;

  if (video.paused) {
    video.play();
    if (text) text.textContent = 'Pause';
    if (icon) icon.innerHTML = '<path d="M6 4h4v16H6zm8 0h4v16h-4z"/>';
  } else {
    video.pause();
    if (text) text.textContent = 'Play';
    if (icon) icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
  }
}

function toggleHeroMute() {
  const video = document.getElementById('leasingHeroVideo');
  const text = document.getElementById('muteText');
  const icon = document.getElementById('muteIcon');
  if (!video) return;

  video.muted = !video.muted;
  if (video.muted) {
    if (text) text.textContent = 'Sound On';
    if (icon) icon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
  } else {
    if (text) text.textContent = 'Mute';
    if (icon) icon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
  }
}

// Check for query parameters on load
(function checkQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const price = params.get('price');

  if (price && document.getElementById('priceRange')) {
    const val = parseInt(price, 10);
    if (!isNaN(val)) {
      state.vehicleValue = val;
      const slider = document.getElementById('priceRange');
      if (slider) slider.value = val;
    }
  }

  if (type && typeof setVehicleCategory === 'function') {
    setVehicleCategory(type);
  } else if (typeof updateCalculator === 'function') {
    updateCalculator();
  }
})();

/* ==========================================================================
   FULL-WIDTH PROMOTIONAL BANNER SLIDER
   ========================================================================== */
let currentBannerIdx = 0;
let bannerInterval = null;

function showBannerSlide(idx) {
  const slides = document.querySelectorAll('.banner-slide');
  const dots = document.querySelectorAll('.banner-dot');
  if (!slides.length) return;

  if (idx >= slides.length) currentBannerIdx = 0;
  else if (idx < 0) currentBannerIdx = slides.length - 1;
  else currentBannerIdx = idx;

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === currentBannerIdx);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentBannerIdx);
  });
}

function nextBannerSlide() {
  showBannerSlide(currentBannerIdx + 1);
  resetBannerTimer();
}

function prevBannerSlide() {
  showBannerSlide(currentBannerIdx - 1);
  resetBannerTimer();
}

function goToBannerSlide(idx) {
  showBannerSlide(idx);
  resetBannerTimer();
}

function resetBannerTimer() {
  if (bannerInterval) clearInterval(bannerInterval);
  bannerInterval = setInterval(() => {
    showBannerSlide(currentBannerIdx + 1);
  }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelectorAll('.banner-slide').length > 0) {
    resetBannerTimer();
  }
});


