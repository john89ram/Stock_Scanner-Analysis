const API_KEY = 'fuVGxxqcNJrnZiYL2dkZ7mmNrRZ2Aelh';

async function fetchMarketData() {
  const apiUrl = `https://financialmodelingprep.com/api/v3/quotes/nyse?apikey=${API_KEY}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log('Market Data:', data);
    displayMarketMatrix(data);
  } catch (error) {
    console.error('Error fetching market data:', error);
  }
}

function displayMarketMatrix(data) {
  const marketMatrixContainer = document.getElementById('market-matrix');
  marketMatrixContainer.innerHTML = '';

  data.forEach(stock => {
    const block = document.createElement('div');
    block.className = 'market-block';
    block.innerHTML = `
      <div class="block-symbol">${stock.symbol}</div>
      <div class="block-price">$${stock.price.toFixed(2)}</div>
      <div class="block-change ${stock.change >= 0 ? 'positive' : 'negative'}">
        ${stock.change.toFixed(2)} (${stock.changesPercentage.toFixed(2)}%)
      </div>
    `;
    marketMatrixContainer.appendChild(block);
  });
}

fetchMarketData();
