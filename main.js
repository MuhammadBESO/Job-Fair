const customerTableBody = document.getElementById('customerBody');
const customerFilter = document.getElementById('customerFilter');
const amountFilter = document.getElementById('amountFilter');
const ctx = document.getElementById('transactionChart').getContext('2d');
let customers = [];
let transactions = [];
let chart; // Declare chart variable globally

// Fetch data from the JSON file
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        customers = data.customers;
        transactions = data.transactions;
        populateTable(customers);
    });

// Populate customer table
function populateTable(customers) {
    customerTableBody.innerHTML = '';
    customers.forEach(customer => {
        const customerTransactions = transactions.filter(t => t.customer_id === customer.id);
        const totalTransactions = customerTransactions.length;
        const totalAmount = customerTransactions.reduce((sum, t) => sum + t.amount, 0);
        const transactionDates = customerTransactions.map(t => t.date).join(' / ');

        const row = `
            <tr>
                <td class="text-center">${customer.name}</td>
                <td class="text-center">${totalTransactions}</td>
                <td class="text-center">${totalAmount}</td>
                <td class="text-center">${transactionDates || 'No transactions'}</td>
                <td class="text-center"><button class="btn btn-outline-primary" onclick="showCustomerTransactions(${customer.id})">View</button></td>
            </tr>
        `;
        customerTableBody.insertAdjacentHTML('beforeend', row);
    });
}

// Filter customers
customerFilter.addEventListener('input', filterTable);
amountFilter.addEventListener('input', filterTable);

function filterTable() {
    const nameFilter = customerFilter.value.toLowerCase();
    const amountFilterValue = parseFloat(amountFilter.value);
    const filteredCustomers = customers.filter(customer => {
        const customerTransactions = transactions.filter(t => t.customer_id === customer.id);
        const totalAmount = customerTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        return (
            customer.name.toLowerCase().includes(nameFilter) &&
            (isNaN(amountFilterValue) || totalAmount >= amountFilterValue)
        );
    });
    populateTable(filteredCustomers);
}

// Show customer transactions
function showCustomerTransactions(customerId) {
    const filteredTransactions = transactions.filter(t => t.customer_id === customerId);
    const dailyTotals = {};

    filteredTransactions.forEach(t => {
        dailyTotals[t.date] = (dailyTotals[t.date] || 0) + t.amount;
    });

    renderChart(dailyTotals);
}

// Render chart
function renderChart(dailyTotals) {
    const labels = Object.keys(dailyTotals);
    const data = Object.values(dailyTotals);

    // Destroy existing chart if it exists
    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Transaction Amount',
                data: data,
                backgroundColor: '#4A90E2',
                borderColor: '#4A90E2',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
