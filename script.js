const monthSelect = document.getElementById('monthSelect');
const budgetInput = document.getElementById('budgetInput');
const setBudgetBtn = document.getElementById('setBudgetBtn');
const budgetAlert = document.getElementById('budgetAlert');

const expenseForm = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');
const saveAllBtn = document.getElementById('saveAllBtn');
const clearBtn = document.getElementById('clearBtn');

// Debug: Check if save button is found
console.log('Save button found:', saveAllBtn);

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let budgets = JSON.parse(localStorage.getItem('budgets')) || {}; // budgets stored as { '2025-01': 5000, ... }

// Add January sample data if none exists
if (expenses.length === 0) {
  console.log('Adding January sample data...');
  
  const januaryExpenses = [
    { month: '2025-01', memberName: 'Dinesh', category: 'Food', amount: 2500, date: '1/15/2025' },
    { month: '2025-01', memberName: 'Hrishikesh', category: 'Travel', amount: 1800, date: '1/20/2025' },
    { month: '2025-01', memberName: 'Yash', category: 'Education', amount: 3200, date: '1/10/2025' },
    { month: '2025-01', memberName: 'Suraj', category: 'Shopping', amount: 1500, date: '1/25/2025' },
    { month: '2025-01', memberName: 'Vicky', category: 'Healthcare', amount: 800, date: '1/30/2025' }
  ];
  
  expenses = januaryExpenses;
  localStorage.setItem('expenses', JSON.stringify(expenses));
  
  // Add January budget
  budgets['2025-01'] = 10000;
  localStorage.setItem('budgets', JSON.stringify(budgets));
  
  console.log('January data added successfully!');
}




  budgets = sampleBudgets;
  localStorage.setItem('budgets', JSON.stringify(budgets));
  console.log('Sample data added successfully!');
  console.log('Total expenses:', expenses.length);
  console.log('Total budgets:', Object.keys(budgets).length);


let chart;

// When user changes month selection, show budget for that month
monthSelect.addEventListener('change', () => {
  renderExpenses();
  updateChart();
  updateBudgetAlert(monthSelect.value);
  budgetInput.value = budgets[monthSelect.value] || '';
  updateSummaryBox();
});

// Set budget for selected month
setBudgetBtn.addEventListener('click', () => {
  const month = monthSelect.value;
  const value = parseFloat(budgetInput.value);
  if (!month) {
    budgetAlert.textContent = "Please select a month!";
    budgetAlert.style.color = "#dc3545";
    return;
  }
  if (isNaN(value) || value <= 0) {
    budgetAlert.textContent = "Please enter a valid budget amount!";
    budgetAlert.style.color = "#dc3545";
    return;
  }
  budgets[month] = value;
  localStorage.setItem('budgets', JSON.stringify(budgets));
  updateBudgetAlert(month);
  budgetAlert.textContent = "Budget set successfully!";
  budgetAlert.style.color = "#007bff";
  updateSummaryBox();
});

// Add new expense
expenseForm.addEventListener('submit', e => {
  e.preventDefault();
  const month = monthSelect.value;
  if (!month) {
    budgetAlert.textContent = "Please select a month first!";
    budgetAlert.style.color = "#dc3545";
    return;
  }
  const memberName = document.getElementById('memberName').value.trim();
  const category = document.getElementById('expenseCategory').value;
  const amount = parseFloat(document.getElementById('expenseAmount').value);

  if (!memberName || !category || isNaN(amount) || amount <= 0) {
    budgetAlert.textContent = "Please fill all expense fields correctly!";
    budgetAlert.style.color = "#dc3545";
    return;
  }

  // Create new expense object
  const newExpense = {
    month,
    memberName,
    category,
    amount,
    date: new Date().toLocaleDateString()
  };

  // Add to expenses array
  expenses.push(newExpense);
  
  // Save to localStorage
  localStorage.setItem('expenses', JSON.stringify(expenses));
  
  // Show success message
  budgetAlert.textContent = `Expense added successfully! ${memberName} - ${category} - ₹${amount}`;
  budgetAlert.style.color = "#28a745";
  
  // Reset form and update UI
  expenseForm.reset();
  renderExpenses();
  updateChart();
  updateBudgetAlert(month);
  updateSummaryBox();
  
  // Debug: Log to console
  console.log('Expense added:', newExpense);
  console.log('All expenses:', expenses);
});

// Render expense list
function renderExpenses() {
  const month = monthSelect.value;
  expenseList.innerHTML = '';
  const filtered = expenses.filter(e => e.month === month);
  if (filtered.length === 0) {
    expenseList.innerHTML = '<li class="list-group-item text-muted">No expenses for this month.</li>';
    return;
  }
  filtered.forEach((e, i) => {
    expenseList.innerHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>
          <strong>${e.memberName}</strong> - ${e.category} <span class="text-secondary">(${e.date})</span>
        </span>
        <span>
          ₹${e.amount}
          <button class="btn btn-sm btn-outline-danger ms-2" onclick="deleteExpense(${i})">Delete</button>
        </span>
      </li>
    `;
  });
}

// Delete expense
window.deleteExpense = function(index) {
  const month = monthSelect.value;
  const filtered = expenses.filter(e => e.month === month);
  const globalIndex = expenses.indexOf(filtered[index]);
  if (globalIndex > -1) {
    expenses.splice(globalIndex, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
    updateChart();
    updateBudgetAlert(month);
    updateSummaryBox();
  }
};





// Format month string
function formatMonth(monthStr) {
  const [year, month] = monthStr.split('-');
  return `${year} ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })}`;
}

// Update budget alert for selected month
function updateBudgetAlert(month) {
  const budget = budgets[month] || 0;
  const total = expenses.filter(e => e.month === month).reduce((sum, e) => sum + e.amount, 0);
  if (!budget) {
    budgetAlert.textContent = "No budget set for this month.";
    budgetAlert.style.color = "#6c757d";
    return;
  }
  if (total > budget) {
    budgetAlert.textContent = `Budget Exceeded! (Budget: ₹${budget}, Spent: ₹${total})`;
    budgetAlert.style.color = "#dc3545";
  } else {
    budgetAlert.textContent = `Budget: ₹${budget}, Spent: ₹${total}`;
    budgetAlert.style.color = "#007bff";
  }
}

// Monthly expenses chart
function updateChart() {
  // Check if the chart element exists before running chart code
  const monthlyChartCanvas = document.getElementById('monthlyChart');
  if (!monthlyChartCanvas) {
    return; 
  }

  const monthlyChartCtx = monthlyChartCanvas.getContext('2d');
  const month = monthSelect.value;
  const filtered = expenses.filter(e => e.month === month);
  const categories = {};
  filtered.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + e.amount;
  });
  const data = {
    labels: Object.keys(categories),
    datasets: [{
      label: 'Expenses',
      data: Object.values(categories),
      backgroundColor: [
        '#007bff', '#28a745', '#ffc107', '#17a2b8', '#6f42c1'
      ]
    }]
  };
  if (chart) chart.destroy();
  chart = new Chart(monthlyChartCtx, {
    type: 'doughnut',
    data,
    options: {
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

// Save all expenses
saveAllBtn.addEventListener('click', () => {
  console.log('Save button clicked!');
  
  const month = monthSelect.value;
  console.log('Current month:', month);
  
  const monthExpenses = expenses.filter(e => e.month === month);
  console.log('Month expenses:', monthExpenses);
  
  if (monthExpenses.length === 0) {
    budgetAlert.textContent = "No expenses to save for this month!";
    budgetAlert.style.color = "#ffc107";
    console.log('No expenses to save');
    return;
  }
  
  // Save to localStorage
  localStorage.setItem('expenses', JSON.stringify(expenses));
  
  // Clear the expense form
  expenseForm.reset();
  
  // Clear the expense list on home page
  expenseList.innerHTML = '<li class="list-group-item text-muted">Expenses saved! Check graphs for details.</li>';
  
  // Show success message
  budgetAlert.textContent = `✅ All ${monthExpenses.length} expenses saved successfully for ${formatMonth(month)}! Check graphs to view.`;
  budgetAlert.style.color = "#28a745";
  
  // Update budget alert and summary
  updateBudgetAlert(month);
  updateSummaryBox();
  
  console.log(`Saved ${monthExpenses.length} expenses for ${month}:`, monthExpenses);
  
  // Show confirmation
  setTimeout(() => {
    if (confirm(`✅ ${monthExpenses.length} expenses saved! Do you want to view them in graphs?`)) {
      window.open('monthly-graphs.html', '_blank');
    }
  }, 1000);
});

// Clear all expenses
clearBtn.addEventListener('click', () => {
  if (confirm("Are you sure you want to clear all expenses for this month?")) {
    const month = monthSelect.value;
    expenses = expenses.filter(e => e.month !== month);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
    updateChart();
    updateBudgetAlert(month);
    updateSummaryBox();
  }
});

// Summary box
function updateSummaryBox() {
  const month = monthSelect.value;
  const budget = budgets[month] || 0;
  const total = expenses.filter(e => e.month === month).reduce((sum, e) => sum + e.amount, 0);
  const summaryBox = document.getElementById('summaryBox');
  if (!month) { summaryBox.style.display = 'none'; return; }
  summaryBox.style.display = 'block';
  let remaining = budget - total;
  let color = remaining < 0 ? "#dc3545" : "#007bff";
  summaryBox.innerHTML = `
    <strong>Total Spent:</strong> ₹${total} &nbsp; | &nbsp;
    <strong>Remaining:</strong> ₹${remaining} 
    ${remaining < 0 ? '<span class="text-danger ms-2">Budget Exceeded!</span>' : ''}
  `;
  summaryBox.style.color = color;
}



// Initial render
monthSelect.value = Object.keys(budgets)[0] || "2025-01";
renderExpenses();
updateChart();
updateBudgetAlert(monthSelect.value);
updateSummaryBox();

const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const chatHistory = document.getElementById('chatHistory');

chatSendBtn.addEventListener('click', () => {
  const question = chatInput.value.trim();
  if (!question) return;

  addChatMessage('You', question);
  chatInput.value = '';

  // Get current month, budget, expenses
  const month = monthSelect.value;
  const budget = budgets[month] || 0;
  const filteredExpenses = expenses.filter(e => e.month === month);
  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = budget - totalSpent;

  let answer = "Sorry, I didn't understand that. Try asking about budget, spent, remaining.";

  const lowerQ = question.toLowerCase();
  if (lowerQ.includes('budget')) {
    answer = budget ? `Your budget for ${formatMonth(month)} is ₹${budget}.` : "No budget set for this month.";
  } else if (lowerQ.includes('spent') || lowerQ.includes('expense') || lowerQ.includes('kharcha')) {
    answer = `You have spent ₹${totalSpent} so far this month.`;
  } else if (lowerQ.includes('remaining') || lowerQ.includes('left') || lowerQ.includes('bacha')) {
    if (!budget) answer = "No budget set for this month.";
    else answer = remaining >= 0
      ? `You have ₹${remaining} remaining in your budget.`
      : `You have exceeded your budget by ₹${Math.abs(remaining)}!`;
  } else if (lowerQ.includes('most') || lowerQ.includes('maximum') || lowerQ.includes('jyada')) {
    if (filteredExpenses.length === 0) answer = "No expenses recorded this month.";
    else {
      const categories = {};
      filteredExpenses.forEach(e => {
        categories[e.category] = (categories[e.category] || 0) + e.amount;
      });
      const maxCat = Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b);
      answer = `You spent the most on '${maxCat}' (₹${categories[maxCat]}).`;
    }
  } else if (lowerQ.includes('help')) {
    answer = "Ask me about your budget, spent amount, remaining budget, or most spent category for the selected month.";
  }

  setTimeout(() => addChatMessage('Bot', answer), 400);
});

chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') chatSendBtn.click();
});

function addChatMessage(sender, message) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${sender.toLowerCase()}`;
  
  const senderDiv = document.createElement('div');
  senderDiv.className = 'sender';
  senderDiv.textContent = sender === 'You' ? 'You' : 'AI Assistant';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'content';
  contentDiv.textContent = message;
  
  msgDiv.appendChild(senderDiv);
  msgDiv.appendChild(contentDiv);
  chatHistory.appendChild(msgDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Minimize/Maximize chatbot
const minimizeChat = document.getElementById('minimizeChat');
minimizeChat.addEventListener('click', () => {
  const chatbotBox = document.getElementById('chatbotBox');
  const cardBody = chatbotBox.querySelector('.card-body');
  
  if (chatbotBox.classList.contains('chatbot-minimized')) {
    chatbotBox.classList.remove('chatbot-minimized');
    cardBody.style.display = 'block';
    minimizeChat.textContent = '−';
  } else {
    chatbotBox.classList.add('chatbot-minimized');
    cardBody.style.display = 'none';
    minimizeChat.textContent = '+';
  }
});





function exportMonthSheet(month) {
  const filtered = expenses.filter(e => e.month === month);
  let table = `
    <html><head><title>${month} Expenses</title></head><body>
    <h2>${month} Expenses</h2>
    <table border="1" cellpadding="5">
      <tr>
        <th>Date</th>
        <th>Member</th>
        <th>Category</th>
        <th>Amount</th>
      </tr>
  `;
  filtered.forEach(e => {
    table += `<tr>
      <td>${e.date}</td>
      <td>${e.memberName}</td>
      <td>${e.category}</td>
      <td>₹${e.amount}</td>
    </tr>`;
  });
  table += `</table></body></html>`;

  const blob = new Blob([table], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${month}-expenses.html`;
  link.click();
}
