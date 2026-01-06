// Constants
const CURRENT_USER_KEY = 'fintrack_current_user';
const USERS_KEY = 'fintrack_users';

// State
let currentUser = null;
let appData = null;
let currentTransType = 'expense';
let charts = {};

// Categories
const categories = {
    expense: ['Food', 'Rent', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Other'],
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
});

function checkSession() {
    const userId = localStorage.getItem(CURRENT_USER_KEY);
    if (!userId) {
        window.location.href = 'Dhruvik.html';
        return;
    }

    // Load User Data
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    currentUser = users.find(u => u.id === userId);

    if (!currentUser) {
        // ID exists but user doesn't? Corrupt state.
        localStorage.removeItem(CURRENT_USER_KEY);
        window.location.href = 'Dhruvik.html';
        return;
    }

    // Load App Data for this user
    loadAppData(userId);

    // Initialize UI
    updateUI();
    setupCharts();
    setupEventListeners();
    updateDashboardTranslations();
}

// Update Dashboard Text with Translations
function updateDashboardTranslations() {
    // Sidebar
    document.querySelector('.sidebar-header h2').innerHTML = `<i class="fa-solid fa-wallet"></i> ${t('dashboardBrand')}`;

    // Navigation
    const navItems = [
        { selector: '.nav-links li:nth-child(1) span', key: 'overview' },
        { selector: '.nav-links li:nth-child(2) span', key: 'income' },
        { selector: '.nav-links li:nth-child(3) span', key: 'expenses' },
        { selector: '.nav-links li:nth-child(4) span', key: 'reports' },
        { selector: '.nav-links li:nth-child(5) span', key: 'settings' }
    ];
    navItems.forEach(item => {
        const el = document.querySelector(item.selector);
        if (el) el.textContent = t(item.key);
    });

    const logoutSpan = document.querySelector('.sidebar-footer span');
    if (logoutSpan) logoutSpan.textContent = t('logout');
}

function loadAppData(userId) {
    const key = `fintrack_data_${userId}`;
    const stored = localStorage.getItem(key);

    if (stored) {
        appData = JSON.parse(stored);
    } else {
        // Fallback (Should be created during signup, but just in case)
        appData = {
            user: { name: currentUser.name, currency: '$', joined: new Date().toISOString() },
            transactions: []
        };
        saveAppData();
    }
}

function saveAppData() {
    if (!currentUser || !appData) return;
    const key = `fintrack_data_${currentUser.id}`;
    localStorage.setItem(key, JSON.stringify(appData));
}

function setupEventListeners() {
    // Mobile Menu
    const menuBtn = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Close Modal on Outside Click
    window.onclick = function (event) {
        const modal = document.getElementById('transactionModal');
        if (event.target == modal) {
            closeModal('transactionModal');
        }
    }
}

// Navigation Logic
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    const activeLink = Array.from(document.querySelectorAll('.nav-links li')).find(li => li.getAttribute('onclick').includes(sectionId));
    if (activeLink) activeLink.classList.add('active');

    document.getElementById('page-title').innerText = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);

    if (sectionId === 'reports' || sectionId === 'overview') {
        updateCharts();
    }

    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
}

// Data Operations
function getBalance() {
    let income = appData.transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    let expense = appData.transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    return { income, expense, balance: income - expense };
}

function saveTransaction(transaction) {
    appData.transactions.unshift(transaction);
    saveAppData();
    updateUI();
    updateCharts();
}

function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        appData.transactions = appData.transactions.filter(t => t.id !== id);
        saveAppData();
        updateUI();
        updateCharts();
    }
}

function updateUI() {
    const { income, expense, balance } = getBalance();
    const currency = appData.user.currency;

    // Overview Cards
    document.getElementById('total-income').innerText = `${currency}${income.toFixed(2)}`;
    document.getElementById('total-expense').innerText = `${currency}${expense.toFixed(2)}`;
    document.getElementById('current-balance').innerText = `${currency}${balance.toFixed(2)}`;
    if (document.getElementById('savings-val')) {
        document.getElementById('savings-val').innerText = `${currency}${balance.toFixed(2)}`;
    }

    // User Info
    document.querySelector('.user-name').innerText = `Welcome, ${appData.user.name}`;

    // Settings Placeholders
    document.getElementById('setting-name').value = appData.user.name;
    document.getElementById('setting-currency').value = appData.user.currency;

    // Recent Transactions (Limit 5)
    renderTransactionList(appData.transactions.slice(0, 5), 'recent-list', true);

    // Income Table
    renderTable(appData.transactions.filter(t => t.type === 'income'), 'income-table-body');

    // Expense Table
    renderTable(appData.transactions.filter(t => t.type === 'expense'), 'expense-table-body');
}

// Render Functions
function renderTransactionList(transactions, elementId, minimal = false) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';

    if (transactions.length === 0) {
        container.innerHTML = '<div class="empty-state">No transactions yet.</div>';
        return;
    }

    transactions.forEach(t => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        const colorClass = t.type === 'income' ? 'income' : 'expense';
        const sign = t.type === 'income' ? '+' : '-';

        item.innerHTML = `
            <div class="trans-info">
                <span class="trans-title">${t.desc}</span>
                <span class="trans-date">${t.date} • ${t.category}</span>
            </div>
            <div class="trans-amount ${colorClass}">
                ${sign}${appData.user.currency}${t.amount.toFixed(2)}
            </div>
        `;
        container.appendChild(item);
    });
}

function renderTable(transactions, elementId) {
    const tbody = document.getElementById(elementId);
    tbody.innerHTML = '';

    transactions.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.date}</td>
            <td>${t.category} <br> <small class="text-muted">${t.desc}</small></td>
            <td>${appData.user.currency}${t.amount.toFixed(2)}</td>
            <td>
                <button class="btn-sm btn-danger" onclick="deleteTransaction(${t.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Modal Logic
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
    document.getElementById('transactionForm').reset();
    document.getElementById('trans-date').valueAsDate = new Date();
    updateCategoryOptions();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function openAddIncome() {
    setTransType('income');
    openModal('transactionModal');
}

function openAddExpense() {
    setTransType('expense');
    openModal('transactionModal');
}

function setTransType(type) {
    currentTransType = type;
    document.getElementById('trans-type').value = type;

    if (type === 'income') {
        document.getElementById('btn-income').classList.add('active');
        document.getElementById('btn-expense').classList.remove('active');
        document.getElementById('modal-title').innerText = 'Add Income';
    } else {
        document.getElementById('btn-expense').classList.add('active');
        document.getElementById('btn-income').classList.remove('active');
        document.getElementById('modal-title').innerText = 'Add Expense';
    }
    updateCategoryOptions();
}

function updateCategoryOptions() {
    const select = document.getElementById('trans-category');
    select.innerHTML = '';
    const opts = categories[currentTransType];
    opts.forEach(c => {
        const option = document.createElement('option');
        option.value = c;
        option.innerText = c;
        select.appendChild(option);
    });
}

// Form Handlers
function handleTransactionSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('trans-type').value;
    const desc = document.getElementById('trans-desc').value;
    const amount = parseFloat(document.getElementById('trans-amount').value);
    const category = document.getElementById('trans-category').value;
    const date = document.getElementById('trans-date').value;

    if (!desc || !amount || !date) return;

    const newTrans = {
        id: Date.now(),
        type,
        desc,
        amount,
        category,
        date
    };

    saveTransaction(newTrans);
    closeModal('transactionModal');
}

function saveSettings(e) {
    e.preventDefault();
    appData.user.name = document.getElementById('setting-name').value;
    appData.user.currency = document.getElementById('setting-currency').value;
    saveAppData();
    updateUI();
    alert('Settings Saved!');
}

function clearAllData() {
    if (confirm('WARNING: This will delete ALL your data associated with this account. Are you sure?')) {
        const key = `fintrack_data_${currentUser.id}`;
        localStorage.removeItem(key);
        // Re-init
        loadAppData(currentUser.id);
        updateUI();
        updateCharts();
        alert('Data reset successfully.');
    }
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'Dhruvik.html';
}

function exportData(format = 'csv') {
    const { income, expense, balance } = getBalance();
    const currency = appData.user.currency;
    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
        exportCSV(timestamp);
    } else if (format === 'pdf') {
        exportPDF(timestamp, income, expense, balance, currency);
    } else if (format === 'excel') {
        exportExcel(timestamp, income, expense, balance, currency);
    }
}

// CSV Export
function exportCSV(timestamp) {
    let csv = 'Date,Type,Category,Description,Amount\n';

    appData.transactions.forEach(t => {
        const row = [
            t.date,
            t.type.toUpperCase(),
            t.category,
            `"${t.desc}"`, // Quoted to handle commas in description
            t.amount
        ].join(',');
        csv += row + '\n';
    });

    // Add summary
    const { income, expense, balance } = getBalance();
    csv += '\n\nSUMMARY\n';
    csv += `Total Income,${income}\n`;
    csv += `Total Expenses,${expense}\n`;
    csv += `Balance,${balance}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FinancialReport_${timestamp}.csv`;
    link.click();
}

// PDF Export
function exportPDF(timestamp, income, expense, balance, currency) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(108, 92, 231);
    doc.text('Financial Report', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });
    doc.text(`User: ${appData.user.name}`, 105, 34, { align: 'center' });

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Summary', 14, 45);

    doc.setFontSize(11);
    doc.text(`Total Income: ${currency}${income.toFixed(2)}`, 14, 55);
    doc.text(`Total Expenses: ${currency}${expense.toFixed(2)}`, 14, 62);
    doc.text(`Current Balance: ${currency}${balance.toFixed(2)}`, 14, 69);

    // Transactions Table
    doc.setFontSize(14);
    doc.text('Transaction History', 14, 82);

    const tableData = appData.transactions.map(t => [
        t.date,
        t.type.toUpperCase(),
        t.category,
        t.desc,
        `${currency}${t.amount.toFixed(2)}`
    ]);

    doc.autoTable({
        startY: 88,
        head: [['Date', 'Type', 'Category', 'Description', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [108, 92, 231] },
        styles: { fontSize: 9 }
    });

    doc.save(`FinancialReport_${timestamp}.pdf`);
}

// Excel Export
function exportExcel(timestamp, income, expense, balance, currency) {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
        ['Financial Summary'],
        [''],
        ['Total Income', `${currency}${income.toFixed(2)}`],
        ['Total Expenses', `${currency}${expense.toFixed(2)}`],
        ['Current Balance', `${currency}${balance.toFixed(2)}`],
        [''],
        ['Generated On', new Date().toLocaleString()],
        ['User', appData.user.name]
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

    // Transactions Sheet
    const transData = [['Date', 'Type', 'Category', 'Description', 'Amount']];
    appData.transactions.forEach(t => {
        transData.push([
            t.date,
            t.type.toUpperCase(),
            t.category,
            t.desc,
            t.amount
        ]);
    });
    const ws2 = XLSX.utils.aoa_to_sheet(transData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Transactions');

    // Income Sheet
    const incomeData = [['Date', 'Source', 'Amount']];
    appData.transactions.filter(t => t.type === 'income').forEach(t => {
        incomeData.push([t.date, t.category, t.amount]);
    });
    const ws3 = XLSX.utils.aoa_to_sheet(incomeData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Income');

    // Expense Sheet
    const expenseData = [['Date', 'Category', 'Amount']];
    appData.transactions.filter(t => t.type === 'expense').forEach(t => {
        expenseData.push([t.date, t.category, t.amount]);
    });
    const ws4 = XLSX.utils.aoa_to_sheet(expenseData);
    XLSX.utils.book_append_sheet(wb, ws4, 'Expenses');

    // Download
    XLSX.writeFile(wb, `FinancialReport_${timestamp}.xlsx`);
}

// Charts (Mock Implementation with Chart.js)
function setupCharts() {
    const ctx1 = document.getElementById('overviewChart');
    if (ctx1) {
        charts.overview = new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: ['#ff7675', '#74b9ff', '#55efc4', '#a29bfe', '#dfe6e9']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    const ctx2 = document.getElementById('comparisonChart');
    if (ctx2) {
        charts.comparison = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expense'],
                datasets: [{
                    label: 'Amount',
                    data: [0, 0],
                    backgroundColor: ['#00b894', '#d63031']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // Initial update
    updateCharts();
}

function updateCharts() {
    if (!charts.overview || !charts.comparison || !appData) return;

    // 1. Overview Chart (Expenses by Category)
    const expenses = appData.transactions.filter(t => t.type === 'expense');
    const catMap = {};
    if (expenses.length > 0) {
        expenses.forEach(t => {
            catMap[t.category] = (catMap[t.category] || 0) + t.amount;
        });
    } else {
        // Empty state for chart?
    }

    charts.overview.data.labels = Object.keys(catMap);
    charts.overview.data.datasets[0].data = Object.values(catMap);
    charts.overview.update();

    // 2. Comparison Chart
    const { income, expense } = getBalance();
    charts.comparison.data.datasets[0].data = [income, expense];
    charts.comparison.update();
}
