'use strict';

const stockApi = 'https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/'

module.exports = app => {
  app.route('/api/stock-prices')
    .get(async (req, res) => {
      let stockData = {};
      if (req.query.stock != undefined && req.query.stock != "") {
        // Ensure input is an array
        let stocks = Array.isArray(req.query.stock) ? req.query.stock : [req.query.stock];

        // Go through each stock name, try to query API
        // If success, get stock name and price
        // Else just do nothing
        for (const i in stocks) {
          try {
            const res = await fetch(stockApi + stocks[i] + '/quote');
            const data = await res.json();
            stockData[i] = {
              "stock": data.symbol,
              "price": data.latestPrice
            }
          } catch (err) {}
        }

        // With only one stock stockData solely contains that stock's data
        if (stocks.length === 1) {
          stockData = stockData[0]
        }
      }

      res.json({stockData});
    });
};
