// DOM elements
const loanAmount = document.getElementById("loanAmount");
const interestRate = document.getElementById("interestRate");
const loanTenure = document.getElementById("loanTenure");

const loanAmountValue = document.getElementById("loanAmountValue");
const interestRateValue = document.getElementById("interestRateValue");
const loanTenureValue = document.getElementById("loanTenureValue");

const emiResult = document.getElementById("emiResult");
const amortizationTable = document.getElementById("amortizationTable").querySelector("tbody");

let chart;

// Update slider values in real-time
loanAmount.oninput = () => {
  loanAmountValue.textContent = loanAmount.value;
  calculateEMI();
};
interestRate.oninput = () => {
  interestRateValue.textContent = interestRate.value;
  calculateEMI();
};
loanTenure.oninput = () => {
  loanTenureValue.textContent = loanTenure.value;
  calculateEMI();
};

// EMI Calculation Function
function calculateEMI() {
  const principal = parseFloat(loanAmount.value);
  const annualRate = parseFloat(interestRate.value);
  const years = parseInt(loanTenure.value);

  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;

  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
              (Math.pow(1 + monthlyRate, months) - 1);

  if (!isNaN(emi)) {
    emiResult.textContent = `EMI: ₹${emi.toFixed(2)} per month`;
    generateChart(principal, emi, months, monthlyRate);
    updateAmortization();
  }
}

// Chart.js Function
function generateChart(principal, emi, months, monthlyRate) {
  let totalPayment = emi * months;
  let totalInterest = totalPayment - principal;

  const ctx = document.getElementById("emiChart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Principal", "Interest"],
      datasets: [{
        data: [principal, totalInterest],
        backgroundColor: ["#27ae60", "#e74c3c"]
      }]
    }
  });
}

// Amortization Table Function
function updateAmortization() {
  const principal = parseFloat(loanAmount.value);
  const annualRate = parseFloat(interestRate.value);
  const years = parseInt(loanTenure.value);

  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
              (Math.pow(1 + monthlyRate, months) - 1);

  amortizationTable.innerHTML = "";
  let balance = principal;

  const viewType = document.querySelector('input[name="view"]:checked').value;

  if (viewType === "monthly") {
    for (let i = 1; i <= months; i++) {
      let interest = balance * monthlyRate;
      let principalComponent = emi - interest;
      balance -= principalComponent;

      let row = `<tr>
        <td>Month ${i}</td>
        <td>₹${principalComponent.toFixed(2)}</td>
        <td>₹${interest.toFixed(2)}</td>
        <td>₹${balance > 0 ? balance.toFixed(2) : 0}</td>
      </tr>`;
      amortizationTable.innerHTML += row;
    }
  } else if (viewType === "yearly") {
    for (let y = 1; y <= years; y++) {
      let yearlyPrincipal = 0, yearlyInterest = 0;
      for (let m = 1; m <= 12; m++) {
        let interest = balance * monthlyRate;
        let principalComponent = emi - interest;
        balance -= principalComponent;
        yearlyPrincipal += principalComponent;
        yearlyInterest += interest;
      }

      let row = `<tr>
        <td>Year ${y}</td>
        <td>₹${yearlyPrincipal.toFixed(2)}</td>
        <td>₹${yearlyInterest.toFixed(2)}</td>
        <td>₹${balance > 0 ? balance.toFixed(2) : 0}</td>
      </tr>`;
      amortizationTable.innerHTML += row;
    }
  }
}

// Dark/Light Theme Toggle
function toggleTheme() {
  document.body.classList.toggle("dark");
}

// ====================== Export PDF ======================
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Dinesh Bank - Loan EMI Report", 65, 20);

  // Loan Inputs
  const principal = parseFloat(loanAmount.value);
  const annualRate = parseFloat(interestRate.value);
  const years = parseInt(loanTenure.value);
  const months = years * 12;
  const monthlyRate = annualRate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
              (Math.pow(1 + monthlyRate, months) - 1);

  // Loan Details Table
  doc.autoTable({
    startY: 30,
    head: [['Loan Amount', `₹${principal.toLocaleString()}`]],
    body: [
      ['Annual Interest Rate', `${annualRate}%`],
      ['Loan Tenure', `${years} Years (${months} Months)`],
      ['Monthly EMI', `₹${emi.toFixed(2)}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [0, 51, 153], textColor: [255, 255, 255], halign: "center" },
    bodyStyles: { halign: "center" },
    columnStyles: { 0: { halign: "left" } }
  });

  // Repayment Schedule
  let balance = principal;
  let rows = [];
  for (let i = 1; i <= months; i++) {
    let interest = balance * monthlyRate;
    let principalComp = emi - interest;
    balance -= principalComp;
    rows.push([i, principalComp.toFixed(2), interest.toFixed(2), emi.toFixed(2), balance.toFixed(2)]);
  }

  let shortSchedule = [
    rows[0],
    rows[1],
    rows[2],
    ["...", "...", "...", "...", "..."],
    rows[rows.length - 1]
  ];

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 15,
    head: [["Month", "Principal (₹)", "Interest (₹)", "Total EMI (₹)", "Outstanding (₹)"]],
    body: shortSchedule,
    theme: 'grid',
    headStyles: { fillColor: [0, 51, 153], textColor: [255, 255, 255], halign: "center" },
    bodyStyles: { halign: "center" }
  });

  // Conclusion
  let y = doc.lastAutoTable.finalY + 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Conclusion", 14, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    "This loan will be repaid through fixed EMIs. Each EMI has both interest and principal components. Over time, the interest reduces and the principal portion increases.",
    14,
    y + 8,
    { maxWidth: 180 }
  );

  // ================= Prepayment Suggestion =================
  let balance2 = principal;
  let totalInterest = 0;
  let actualMonths = 0;

  for (let i = 1; i <= months; i++) {
    let interest = balance2 * monthlyRate;
    let principalComp = emi - interest;
    balance2 -= principalComp;
    totalInterest += interest;
    actualMonths++;

    if (i === 12) balance2 -= emi;     // Year 1 extra EMI
    if (i === 24) balance2 -= emi;     // Year 2 extra EMI
    if (i === 36) balance2 -= 2 * emi; // Year 3 extra 2 EMI

    if (balance2 <= 0) break;
  }

  let savedMonths = months - actualMonths;
  let interestWithoutPrepay = rows.reduce((sum, r) => sum + parseFloat(r[2]), 0);
  let interestSaved = interestWithoutPrepay - totalInterest;

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 25,
    head: [["Year", "Extra EMI Paid", "Loan Closed Early (Months)", "Interest Saved (₹)"]],
    body: [
      ["1st Year", "1 EMI", "", ""],
      ["2nd Year", "1 EMI", "", ""],
      ["3rd Year", "2 EMI", `~${savedMonths}`, `₹${interestSaved.toFixed(2)}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255], halign: "center" },
    bodyStyles: { halign: "center" }
  });

  // Save File
  doc.save("Dinesh_Bank_Loan_EMI_Report.pdf");
}

// Initial Calculation
calculateEMI();
