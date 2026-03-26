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
