const baseCurrencySelect = document.getElementById("base-currency");
const exchangeRatesDiv = document.getElementById("exchange-rates");
let chartInstance = null;

async function fetchExchangeRates(base = "TRY") {
  exchangeRatesDiv.innerHTML = "<p>Veriler yükleniyor...</p>";

  try {
    const response = await fetch(`https://api.exchangerate.host/latest?base=${base}`);
    const data = await response.json();

    const rates = data.rates;
    const displayCurrencies = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD"];

    let html = `<h2>${base} Bazlı Kurlar</h2>`;
    displayCurrencies.forEach((currency) => {
      html += `
        <div class="exchange-row">
          <span>1 ${base} =</span>
          <span>${rates[currency].toFixed(4)} ${currency}</span>
        </div>
      `;
    });

    exchangeRatesDiv.innerHTML = html;

    // Grafik çizimi
    drawChart(base, "USD");

  } catch (error) {
    exchangeRatesDiv.innerHTML = "<p>Veriler alınırken hata oluştu.</p>";
    console.error("Hata:", error);
  }
}

async function drawChart(base, target) {
  const response = await fetch(`https://api.exchangerate.host/timeseries?start_date=2024-05-01&end_date=2024-05-29&base=${base}&symbols=${target}`);
  const data = await response.json();

  const labels = Object.keys(data.rates);
  const values = labels.map(date => data.rates[date][target]);

  const ctx = document.getElementById("exchangeChart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `${base} / ${target} (30 Günlük)`,
        data: values,
        borderColor: "blue",
        tension: 0.3,
        fill: false
      }]
    }
  });
}

baseCurrencySelect.addEventListener("change", () => {
  const selectedCurrency = baseCurrencySelect.value;
  fetchExchangeRates(selectedCurrency);
});

window.addEventListener("load", () => {
  fetchExchangeRates(baseCurrencySelect.value);
});

// Her 60 saniyede bir güncelle
setInterval(() => {
  fetchExchangeRates(baseCurrencySelect.value);
}, 60000);
