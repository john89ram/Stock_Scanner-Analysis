const API_KEY = 'fuVGxxqcNJrnZiYL2dkZ7mmNrRZ2Aelh';
const themeToggle = document.getElementById('theme-toggle');
let isDarkTheme = false;

function toggleTheme() {
  isDarkTheme = !isDarkTheme;
  document.body.classList.toggle('dark-theme');
  themeToggle.textContent = isDarkTheme ? 'Light Theme' : 'Dark Theme';
}

async function scanStocks() {
  const marketCap = document.getElementById('market-cap').value;
  const peRatio = document.getElementById('pe-ratio').value;
  const dividendYield = document.getElementById('dividend-yield').value;
  const sector = document.getElementById('sector').value;
  const priceChange = document.getElementById('price-change').value;
  const volume = document.getElementById('volume').value;

  // Build the API URL based on the input parameters
  const apiUrl = `https://financialmodelingprep.com/api/v3/stock-screener?marketCapMoreThan=${marketCap*1e9}&sector=${sector}&apikey=${API_KEY}`;

  console.log('API URL:', apiUrl);

  try {
    const response = await fetch(apiUrl);
    const stocks = await response.json();
    
    console.log('API Response:', stocks);

    displayResults(stocks);
  } catch (error) {
    console.error('Error fetching stock data:', error);
  }
}

function displayResults(stocks) {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';

  if (stocks.length === 0) {
    resultsContainer.innerHTML = '<p>No results found</p>';
    return;
  }

  stocks.forEach(stock => {
    const stockCard = document.createElement('div');
    stockCard.className = 'stock-card';
    stockCard.innerHTML = `
      <div class="stock-symbol">${stock.symbol}</div>
      <div>${stock.companyName}</div>
      <div class="stock-price">$${stock.price ? stock.price.toFixed(2) : 'N/A'}</div>
      <div class="stock-metrics">
        <div class="metric">
          <div class="metric-value">$${(stock.marketCap / 1e9).toFixed(1)}B</div>
          <div class="metric-label">Market Cap</div>
        </div>
        <div class="metric">
          <div class="metric-value">${stock.peRatio ? stock.peRatio.toFixed(2) : 'N/A'}</div>
          <div class="metric-label">P/E Ratio</div>
        </div>
        <div class="metric">
          <div class="metric-value">${stock.dividendYield ? stock.dividendYield.toFixed(2) : 'N/A'}%</div>
          <div class="metric-label">Dividend Yield</div>
        </div>
        <div class="metric">
          <div class="metric-value">${stock.changesPercentage ? stock.changesPercentage.toFixed(2) : 'N/A'}%</div>
          <div class="metric-label">Price Change</div>
        </div>
        <div class="metric">
          <div class="metric-value">${stock.volAvg ? (stock.volAvg / 1e6).toFixed(1) : 'N/A'}M</div>
          <div class="metric-label">Volume</div>
        </div>
      </div>
    `;
    resultsContainer.appendChild(stockCard);
  });
}
