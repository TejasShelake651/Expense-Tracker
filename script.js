let expenses = [];
let deleteTargetId = null;
let currentUser = null;

const STORAGE_KEY = 'expenseTrackerData';
const USER_KEY = 'expenseTrackerUser';

const categoryEmojis = {
    'Food': '🍔',
    'Travel': '✈️',
    'Shopping': '🛍️',
    'Bills': '📄',
    'Entertainment': '🎬',
    'Other': '📌'
};

const loginSection = document.getElementById('loginSection');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const welcomeUser = document.getElementById('welcomeUser');
const logoutBtn = document.getElementById('logoutBtn');
const expenseForm = document.getElementById('expenseForm');
const expenseNameInput = document.getElementById('expenseName');
const expenseAmountInput = document.getElementById('expenseAmount');
const expenseCategorySelect = document.getElementById('expenseCategory');
const expenseDateInput = document.getElementById('expenseDate');
const addBtn = document.querySelector('.add-btn');
const expensesList = document.getElementById('expensesList');
const emptyState = document.getElementById('emptyState');
const totalAmountDisplay = document.getElementById('totalAmount');
const transactionCountDisplay = document.getElementById('transactionCount');
const highestAmountDisplay = document.getElementById('highestAmount');
const deleteModal = document.getElementById('deleteModal');
const cancelBtn = document.getElementById('cancelBtn');
const confirmBtn = document.getElementById('confirmBtn');
const successToast = document.getElementById('successToast');
const viewChartBtn = document.getElementById('viewChartBtn');
const viewCategoryBtn = document.getElementById('viewCategoryBtn');
const viewReportBtn = document.getElementById('viewReportBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const chartView = document.getElementById('chartView');
const categoryView = document.getElementById('categoryView');
const reportView = document.getElementById('reportView');
const reportType = document.getElementById('reportType');

function login(username, password) {
    currentUser = username.trim();
    localStorage.setItem(USER_KEY, currentUser);
    loginSection.style.display = 'none';
    mainApp.style.display = 'block';
    welcomeUser.textContent = `Welcome, ${currentUser}!`;
    loadFromLocalStorage();
    renderExpenses();
    updateStats();
    console.log(`👤 Logged in as: ${currentUser}`);
}

function logout() {
    currentUser = null;
    localStorage.removeItem(USER_KEY);
    expenses = [];
    mainApp.style.display = 'none';
    loginSection.style.display = 'flex';
    loginForm.reset();
    console.log('👋 Logged out successfully');
}

function checkAuth() {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
        currentUser = savedUser;
        loginSection.style.display = 'none';
        mainApp.style.display = 'block';
        welcomeUser.textContent = `Welcome, ${currentUser}!`;
        loadFromLocalStorage();
        renderExpenses();
        updateStats();
        console.log(`👤 Auto-logged in as: ${currentUser}`);
    }
}

function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function showToast(message) {
    successToast.textContent = message;
    successToast.classList.add('show');
    setTimeout(() => {
        successToast.classList.remove('show');
    }, 3000);
}

function validateForm() {
    let isValid = true;
    const nameError = document.getElementById('nameError');
    const amountError = document.getElementById('amountError');
    nameError.textContent = '';
    amountError.textContent = '';
    nameError.classList.remove('show');
    amountError.classList.remove('show');

    if (!expenseNameInput.value.trim()) {
        nameError.textContent = 'Please enter an expense name';
        nameError.classList.add('show');
        isValid = false;
    } else if (expenseNameInput.value.trim().length < 2) {
        nameError.textContent = 'Expense name must be at least 2 characters';
        nameError.classList.add('show');
        isValid = false;
    }

    if (!expenseAmountInput.value) {
        amountError.textContent = 'Please enter an amount';
        amountError.classList.add('show');
        isValid = false;
    } else if (parseFloat(expenseAmountInput.value) <= 0) {
        amountError.textContent = 'Amount must be greater than 0';
        amountError.classList.add('show');
        isValid = false;
    }

    if (!expenseCategorySelect.value) {
        isValid = false;
    }

    if (!expenseDateInput.value) {
        isValid = false;
    }

    return isValid;
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    expenseDateInput.value = today;
}

function saveToLocalStorage() {
    if (!currentUser) return;
    try {
        const userStorageKey = `${STORAGE_KEY}_${currentUser}`;
        localStorage.setItem(userStorageKey, JSON.stringify(expenses));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage() {
    if (!currentUser) {
        expenses = [];
        return;
    }
    try {
        const userStorageKey = `${STORAGE_KEY}_${currentUser}`;
        const data = localStorage.getItem(userStorageKey);
        if (data) {
            expenses = JSON.parse(data);
        } else {
            expenses = [];
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        expenses = [];
    }
}

function addExpense(e) {
    e.preventDefault();
    if (!validateForm()) {
        return;
    }

    const newExpense = {
        id: generateId(),
        name: expenseNameInput.value.trim(),
        amount: parseFloat(expenseAmountInput.value),
        category: expenseCategorySelect.value,
        date: expenseDateInput.value,
        timestamp: Date.now()
    };

    expenses.push(newExpense);
    saveToLocalStorage();
    showToast('✅ Expense added successfully!');
    expenseForm.reset();
    setDefaultDate();
    renderExpenses();
    updateStats();
}

function showDeleteConfirmation(expenseId) {
    deleteTargetId = expenseId;
    deleteModal.classList.add('show');
}

function hideDeleteModal() {
    deleteModal.classList.remove('show');
    deleteTargetId = null;
}

function deleteExpense() {
    if (deleteTargetId === null) return;

    const expenseIndex = expenses.findIndex(exp => exp.id === deleteTargetId);
    if (expenseIndex > -1) {
        const deletedExpense = expenses[expenseIndex];
        expenses.splice(expenseIndex, 1);
        saveToLocalStorage();
        showToast(`🗑️ "${deletedExpense.name}" deleted!`);
        hideDeleteModal();
        renderExpenses();
        updateStats();
    }
}

function updateStats() {
    if (expenses.length === 0) {
        totalAmountDisplay.textContent = '₹0.00';
        transactionCountDisplay.textContent = '0';
        highestAmountDisplay.textContent = '₹0.00';
        return;
    }

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    totalAmountDisplay.textContent = formatCurrency(total);
    transactionCountDisplay.textContent = expenses.length.toString();
    const highest = Math.max(...expenses.map(exp => exp.amount));
    highestAmountDisplay.textContent = formatCurrency(highest);
}

function renderExpenses() {
    expensesList.innerHTML = '';

    if (expenses.length === 0) {
        emptyState.style.display = 'block';
        expensesList.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    expensesList.style.display = 'grid';

    const highestAmount = Math.max(...expenses.map(exp => exp.amount));

    const sortedExpenses = [...expenses].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    sortedExpenses.forEach((expense) => {
        const isHighest = expense.amount === highestAmount;
        const expenseElement = createExpenseElement(expense, isHighest);
        expensesList.appendChild(expenseElement);
    });
}

function createExpenseElement(expense, isHighest) {
    const div = document.createElement('div');
    div.className = `expense-item ${isHighest ? 'highest-expense' : ''}`;
    div.innerHTML = `
        <div class="expense-details">
            <div class="expense-icon">${categoryEmojis[expense.category] || '📌'}</div>
            <div class="expense-info">
                <h3>${escapeHtml(expense.name)}</h3>
                <p>${formatDate(expense.date)}</p>
            </div>
        </div>
        <div class="expense-amount">${formatCurrency(expense.amount)}</div>
        <div class="expense-category">${expense.category}</div>
        <button class="delete-btn" title="Delete expense" data-id="${expense.id}">🗑️</button>
    `;

    const deleteBtn = div.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        showDeleteConfirmation(expense.id);
    });

    return div;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== ADVANCED FEATURES ==========

// Category-wise Summary
function getCategorySummary() {
    const summary = {};
    expenses.forEach(exp => {
        if (!summary[exp.category]) {
            summary[exp.category] = 0;
        }
        summary[exp.category] += exp.amount;
    });
    return summary;
}

function renderCategoryView() {
    if (expenses.length === 0) {
        document.getElementById('categoryContainer').innerHTML = '<p class="no-data">No expenses to display</p>';
        return;
    }

    const summary = getCategorySummary();
    const total = Object.values(summary).reduce((a, b) => a + b, 0);
    
    let html = '<div class="category-list">';
    Object.entries(summary).sort((a, b) => b[1] - a[1]).forEach(([category, amount]) => {
        const percentage = ((amount / total) * 100).toFixed(1);
        const barWidth = percentage;
        html += `
            <div class="category-item">
                <div class="category-header">
                    <span class="category-name">${categoryEmojis[category] || '📌'} ${category}</span>
                    <span class="category-amount">${formatCurrency(amount)}</span>
                </div>
                <div class="category-bar">
                    <div class="category-bar-fill" style="width: ${barWidth}%"></div>
                </div>
                <div class="category-percent">${percentage}% of total</div>
            </div>
        `;
    });
    html += '</div>';
    document.getElementById('categoryContainer').innerHTML = html;
}

// Text-based Chart
function renderTextChart() {
    if (expenses.length === 0) {
        document.getElementById('asciiChart').textContent = 'No expenses to display';
        return;
    }

    const summary = getCategorySummary();
    const maxAmount = Math.max(...Object.values(summary));
    const maxBarLength = 30;
    
    let chart = '📊 EXPENSE DISTRIBUTION CHART\n';
    chart += '═'.repeat(50) + '\n\n';
    
    Object.entries(summary).sort((a, b) => b[1] - a[1]).forEach(([category, amount]) => {
        const barLength = Math.round((amount / maxAmount) * maxBarLength);
        const bar = '█'.repeat(barLength);
        const percentage = ((amount / Object.values(summary).reduce((a, b) => a + b)) * 100).toFixed(1);
        const padding = category.padEnd(15);
        chart += `${categoryEmojis[category] || '📌'} ${padding} ${bar} ${formatCurrency(amount)} (${percentage}%)\n`;
    });
    
    chart += '\n' + '═'.repeat(50) + '\n';
    chart += `💰 Total: ${formatCurrency(Object.values(summary).reduce((a, b) => a + b))}\n`;
    chart += `📈 Transactions: ${expenses.length}\n`;
    
    document.getElementById('asciiChart').textContent = chart;
}

// Daily/Weekly Report
function getDailyReport() {
    const dailyData = {};
    expenses.forEach(exp => {
        const date = exp.date;
        if (!dailyData[date]) {
            dailyData[date] = { total: 0, count: 0, transactions: [] };
        }
        dailyData[date].total += exp.amount;
        dailyData[date].count += 1;
        dailyData[date].transactions.push(exp);
    });
    return dailyData;
}

function getWeeklyReport() {
    const weeklyData = {};
    expenses.forEach(exp => {
        const date = new Date(exp.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = { total: 0, count: 0, transactions: [] };
        }
        weeklyData[weekKey].total += exp.amount;
        weeklyData[weekKey].count += 1;
        weeklyData[weekKey].transactions.push(exp);
    });
    return weeklyData;
}

function renderReport(type) {
    if (expenses.length === 0) {
        document.getElementById('reportContainer').innerHTML = '<p class="no-data">No expenses to display</p>';
        return;
    }

    const data = type === 'daily' ? getDailyReport() : getWeeklyReport();
    const dates = Object.keys(data).sort().reverse();
    
    let html = `<div class="report-list"><h4>${type === 'daily' ? 'Daily Report' : 'Weekly Report'}</h4>`;
    
    dates.forEach(date => {
        const report = data[date];
        const displayDate = type === 'daily' ? 
            formatDate(date) : 
            `Week of ${formatDate(date)}`;
        
        html += `
            <div class="report-item">
                <div class="report-header">
                    <span class="report-date">${displayDate}</span>
                    <span class="report-summary">${report.count} transaction${report.count > 1 ? 's' : ''} • ${formatCurrency(report.total)}</span>
                </div>
                <div class="report-transactions">
        `;
        
        report.transactions.forEach(trans => {
            html += `
                    <div class="report-transaction">
                        <span>${categoryEmojis[trans.category] || '📌'} ${trans.name}</span>
                        <span>${formatCurrency(trans.amount)}</span>
                    </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    document.getElementById('reportContainer').innerHTML = html;
}

// CSV Export
function generateCSV() {
    if (expenses.length === 0) {
        showToast('⚠️ No expenses to export');
        return;
    }

    let csv = 'Date,Name,Category,Amount (₹)\n';
    
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedExpenses.forEach(exp => {
        csv += `${exp.date},"${exp.name}",${exp.category},${exp.amount.toFixed(2)}\n`;
    });
    
    // Add summary section
    csv += '\n\n--- SUMMARY ---\n';
    const summary = getCategorySummary();
    Object.entries(summary).forEach(([cat, amount]) => {
        csv += `${cat},${Object.keys(expenses.filter(e => e.category === cat)).length},${amount.toFixed(2)}\n`;
    });
    
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    csv += `\nTotal Expenses,${expenses.length},${total.toFixed(2)}\n`;
    
    // Download
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `expense_report_${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    showToast('✅ CSV exported successfully!');
}

// Toggle Views
function hideAllViews() {
    chartView.style.display = 'none';
    categoryView.style.display = 'none';
    reportView.style.display = 'none';
}

function showChartView() {
    hideAllViews();
    renderTextChart();
    chartView.style.display = 'block';
}

function showCategoryView() {
    hideAllViews();
    renderCategoryView();
    categoryView.style.display = 'block';
}

function showReportView() {
    hideAllViews();
    const type = reportType.value;
    renderReport(type);
    reportView.style.display = 'block';
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    if (username && password) {
        login(username, password);
    }
});

logoutBtn.addEventListener('click', logout);
expenseForm.addEventListener('submit', addExpense);
cancelBtn.addEventListener('click', hideDeleteModal);
confirmBtn.addEventListener('click', deleteExpense);

// Advanced Features Event Listeners
viewChartBtn.addEventListener('click', showChartView);
viewCategoryBtn.addEventListener('click', showCategoryView);
viewReportBtn.addEventListener('click', showReportView);
exportCsvBtn.addEventListener('click', generateCSV);
reportType.addEventListener('change', () => {
    if (reportView.style.display !== 'none') {
        showReportView();
    }
});

deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
        hideDeleteModal();
    }
});

expenseNameInput.addEventListener('blur', () => {
    const nameError = document.getElementById('nameError');
    if (!expenseNameInput.value.trim()) {
        nameError.textContent = 'Please enter an expense name';
        nameError.classList.add('show');
    } else if (expenseNameInput.value.trim().length < 2) {
        nameError.textContent = 'Expense name must be at least 2 characters';
        nameError.classList.add('show');
    } else {
        nameError.textContent = '';
        nameError.classList.remove('show');
    }
});

expenseAmountInput.addEventListener('blur', () => {
    const amountError = document.getElementById('amountError');
    if (!expenseAmountInput.value) {
        amountError.textContent = 'Please enter an amount';
        amountError.classList.add('show');
    } else if (parseFloat(expenseAmountInput.value) <= 0) {
        amountError.textContent = 'Amount must be greater than 0';
        amountError.classList.add('show');
    } else {
        amountError.textContent = '';
        amountError.classList.remove('show');
    }
});

expenseNameInput.addEventListener('focus', () => {
    document.getElementById('nameError').classList.remove('show');
});

expenseAmountInput.addEventListener('focus', () => {
    document.getElementById('amountError').classList.remove('show');
});

function init() {
    checkAuth();
    if (!currentUser) {
        loginSection.style.display = 'flex';
        mainApp.style.display = 'none';
    }

    if (currentUser) {
        setDefaultDate();
    }

    console.log('💰 Expense Tracker initialized successfully!');
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && currentUser) {
        loadFromLocalStorage();
        renderExpenses();
        updateStats();
    }
});
