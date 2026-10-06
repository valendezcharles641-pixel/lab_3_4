// ======== LAB 3: AUTHENTICATION SYSTEM ========
const validUser = {
  username: 'admin',
  password: 'coffee123'
};

// Login Page Logic
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (username === validUser.username && password === validUser.password) {
      localStorage.setItem('currentUser', username);
      localStorage.setItem('isLoggedIn', 'true');
      window.location.href = 'dashboard.html';
    } else {
      const alertBox = document.getElementById('alertBox');
      alertBox.textContent = 'Invalid username or password';
      alertBox.classList.remove('d-none');
    }
  });
}

// ======== LAB 4: DASHBOARD & DATA SYSTEM ========
const isDashboardPage = window.location.pathname.includes('dashboard.html');

if (isDashboardPage) {
  // Auth Guard
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
  }

  // UI Updates
  const user = localStorage.getItem('currentUser');
  const welcomeUser = document.getElementById('welcomeUser');
  const greeting = document.getElementById('dashboardGreeting');
  if (welcomeUser) welcomeUser.textContent = `Welcome, ${user}`;
  if (greeting) {
    const h = new Date().getHours();
    greeting.textContent = h < 12 ? 'Good Morning! ☀️' : h < 18 ? 'Good Afternoon! 🌤️' : 'Good Evening! 🌙';
  }

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', e => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = 'index.html';
  });

  // ========== INVENTORY DATA & STATE ==========
  const defaultInventory = [
    { id: 1, name: 'Premium Arabica Beans', category: 'coffee', price: 850, stock: 12, minStock: 5 },
    { id: 2, name: 'House Blend Ground', category: 'coffee', price: 420, stock: 3, minStock: 5 },
    { id: 3, name: 'Vanilla Syrup', category: 'supplies', price: 180, stock: 2, minStock: 4 },
    { id: 4, name: 'Fresh Whole Milk (L)', category: 'milk', price: 95, stock: 18, minStock: 10 },
    { id: 5, name: 'Oat Milk (L)', category: 'milk', price: 145, stock: 4, minStock: 6 },
    { id: 6, name: 'Chocolate Croissant', category: 'pastry', price: 65, stock: 0, minStock: 8 },
    { id: 7, name: 'Almond Croissant', category: 'pastry', price: 75, stock: 6, minStock: 5 },
    { id: 8, name: 'Disposable Cups (50s)', category: 'supplies', price: 220, stock: 8, minStock: 3 },
    { id: 9, name: 'Espresso Roast', category: 'coffee', price: 480, stock: 15, minStock: 5 },
    { id: 10, name: 'Caramel Syrup', category: 'supplies', price: 190, stock: 5, minStock: 4 }
  ];

  // Sales trend data
  const salesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [4200, 5800, 5100, 6400, 7200, 9500, 8100]
  };

  // Load from localStorage or use default
  let inventory = JSON.parse(localStorage.getItem('inventoryData')) || [...defaultInventory];
  const saveInventory = () => localStorage.setItem('inventoryData', JSON.stringify(inventory));

  // ========== STATE ==========
  let searchTerm = '';
  let catFilter = 'all';
  let stockFilter = 'all';
  let sortBy = 'name';

  // ========== CHART SETUP ==========
  const colorPalette = {
    coffee: '#D4621A',
    milk: '#F4AE52',
    pastry: '#2A1A0E',
    supplies: '#8B5A2B',
    inStock: '#198754',
    lowStock: '#d97706',
    outOfStock: '#dc2626'
  };

  let salesChart, catChart, stockChart;

  function initCharts() {
    // Sales Line Chart
    salesChart = new Chart(document.getElementById('salesChart'), {
      type: 'line',
      data: {
        labels: salesData.labels,
        datasets: [{
          label: 'Sales ₱',
          data: salesData.values,
          borderColor: '#D4621A',
          backgroundColor: 'rgba(212, 98, 26, 0.15)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#2A1A0E',
          pointRadius: 5
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // Category Bar Chart
    const catCounts = { coffee: 0, milk: 0, pastry: 0, supplies: 0 };
    inventory.forEach(i => catCounts[i.category]++);
    catChart = new Chart(document.getElementById('categoryChart'), {
      type: 'bar',
      data: {
        labels: ['Coffee', 'Milk', 'Pastry', 'Supplies'],
        datasets: [{
          label: 'Items',
          data: [catCounts.coffee, catCounts.milk, catCounts.pastry, catCounts.supplies],
          backgroundColor: [colorPalette.coffee, colorPalette.milk, colorPalette.pastry, colorPalette.supplies]
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // Stock Doughnut
    renderStockChart();
  }

  function renderStockChart() {
    const inStock = inventory.filter(i => i.stock >= i.minStock).length;
    const lowStock = inventory.filter(i => i.stock > 0 && i.stock < i.minStock).length;
    const outStock = inventory.filter(i => i.stock === 0).length;

    if (stockChart) stockChart.destroy();
    stockChart = new Chart(document.getElementById('stockDoughnut'), {
      type: 'doughnut',
      data: {
        labels: ['In Stock', 'Low Stock', 'Out of Stock'],
        datasets: [{
          data: [inStock, lowStock, outStock],
          backgroundColor: [colorPalette.inStock, colorPalette.lowStock, colorPalette.outOfStock]
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  // ========== FILTER, SORT & RENDER ==========
  function getStatus(item) {
    if (item.stock === 0) return 'outofstock';
    if (item.stock < item.minStock) return 'lowstock';
    return 'instock';
  }

  function renderInventory() {
    let filtered = [...inventory];

    // Search
    if (searchTerm) {
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Category
    if (catFilter !== 'all') {
      filtered = filtered.filter(i => i.category === catFilter);
    }
    // Stock status
    if (stockFilter !== 'all') {
      filtered = filtered.filter(i => getStatus(i) === stockFilter);
    }
    // Sort
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'stock') {
      filtered.sort((a, b) => a.stock - b.stock);
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => a.price - b.price);
    }

    // Render table
    const tbody = document.getElementById('inventoryBody');
    tbody.innerHTML = filtered.map(item => {
      const status = getStatus(item);
      const badgeClass = {
        instock: 'badge-instock',
        lowstock: 'badge-lowstock',
        outofstock: 'badge-outofstock'
      }[status];
      const statusText = { instock: 'In Stock', lowstock: 'Low Stock', outofstock: 'Out of Stock' }[status];

      return `
        <tr data-id="${item.id}">
          <td><strong>${item.name}</strong></td>
          <td>${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</td>
          <td>₱${item.price.toFixed(2)}</td>
          <td>${item.stock}</td>
          <td><span class="badge ${badgeClass}">${statusText}</span></td>
          <td>
            <button class="btn btn-sm btn-outline-success add-stock" data-id="${item.id}">+</button>
            <button class="btn btn-sm btn-outline-danger minus-stock" data-id="${item.id}">−</button>
          </td>
        </tr>
      `;
    }).join('');

    document.getElementById('resultCount').textContent = `Showing ${filtered.length} of ${inventory.length} items`;
    updateStats();
    renderAlerts();
  }

  function updateStats() {
    document.getElementById('totalProducts').textContent = inventory.length;
    const lowCount = inventory.filter(i => getStatus(i) === 'lowstock' || getStatus(i) === 'outofstock').length;
    document.getElementById('lowStockCount').textContent = lowCount;
    const totalVal = inventory.reduce((s, i) => s + (i.price * i.stock), 0);
    document.getElementById('totalValue').textContent = `₱${totalVal.toLocaleString()}`;
    const todayTotal = salesData.values.at(-1);
    document.getElementById('todaySales').textContent = `₱${todayTotal.toLocaleString()}`;
  }

  function renderAlerts() {
    const alertContainer = document.getElementById('alertContainer');
    const critical = inventory.filter(i => i.stock === 0 || i.stock < i.minStock);

    if (critical.length === 0) {
      alertContainer.innerHTML = '';
      return;
    }

    alertContainer.innerHTML = `
      <div class="low-stock-alert">
        <strong>⚠️ Attention Required — Low Stock Alert</strong>
        <ul class="mb-0 mt-1">
          ${critical.map(i => `<li>${i.name}: ${i.stock}/${i.minStock} ${i.stock === 0 ? '(OUT OF STOCK)' : ''}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // ========== CSV EXPORT ==========
  function exportCSV() {
    const headers = ['Name', 'Category', 'Price', 'Stock', 'Min Stock', 'Status'];
    const rows = inventory.map(i => [
      `"${i.name}"`,
      i.category,
      i.price.toFixed(2),
      i.stock,
      i.minStock,
      getStatus(i)
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coffee-inventory-${new Date().toLocaleDateString().replaceAll('/', '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ========== SIMULATED REAL-TIME UPDATES ==========
  function simulateUpdates() {
    setInterval(() => {
      // Random stock fluctuation
      const idx = Math.floor(Math.random() * inventory.length);
      const change = Math.random() > 0.5 ? 1 : -1;
      if (inventory[idx].stock + change >= 0) {
        inventory[idx].stock += change;
        saveInventory();
        renderInventory();
        renderStockChart();
      }
    }, 8000); // every 8 seconds
  }

  // ========== EVENT BINDINGS ==========
  document.getElementById('searchInput').addEventListener('input', e => {
    searchTerm = e.target.value;
    renderInventory();
  });
  document.getElementById('catFilter').addEventListener('change', e => {
    catFilter = e.target.value;
    renderInventory();
  });
  document.getElementById('stockFilter').addEventListener('change', e => {
    stockFilter = e.target.value;
    renderInventory();
  });
  document.getElementById('sortBy').addEventListener('change', e => {
    sortBy = e.target.value;
    renderInventory();
  });
  document.getElementById('exportBtn').addEventListener('click', exportCSV);

  // Stock adjust buttons (event delegation)
  document.getElementById('inventoryBody').addEventListener('click', e => {
    const target = e.target;
    if (!target.classList.contains('add-stock') && !target.classList.contains('minus-stock')) return;

    const id = parseInt(target.dataset.id);
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    if (target.classList.contains('add-stock')) item.stock += 1;
    else if (item.stock > 0) item.stock -= 1;

    saveInventory();
    renderInventory();
    renderStockChart();
  });

  // ========== INITIALIZE ==========
  document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    renderInventory();
    simulateUpdates();
  });
}