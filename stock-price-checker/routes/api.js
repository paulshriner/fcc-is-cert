'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const stockApi = 'https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/'
const saltRounds = 12;

// Schema for a stock
const stockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  likes: {
    type: [String],
    required: true
  }
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = app => {
  app.route('/api/stock-prices')
    .get(async (req, res) => {
      let stockData = [];
      if (req.query.stock != undefined && req.query.stock != "") {
        // Ensure input is an array
        let stocks = Array.isArray(req.query.stock) ? req.query.stock : [req.query.stock];
        stocks.length = 2;  // since we're only comparing 2 stocks

        // Go through each stock name, try to query API
        // If success, get stock name and price
        // Else inform user error occured
        for (const i in stocks) {
          try {
            const res = await fetch(stockApi + stocks[i] + '/quote');
            const data = await res.json();
            if (data.symbol != undefined && data.symbol != "" && data.latestPrice != undefined && data.latestPrice != "") {
              stockData.push({
                "stock": data.symbol,
                "price": data.latestPrice
              })
            } else {
              stockData.push({
                "error": "invalid symbol",
              })
            }
          } catch (err) {
            stockData.push({
              "error": "invalid symbol",
            })           
          }

          // Insert stock into database, update likes
          let curName = stockData[i].stock === undefined ? stockData[i].error : stockData[i].stock;
          // Thanks https://www.npmjs.com/package/bcrypt for bcrypt syntax
          let hashedIP = await bcrypt.hash(req.ip, saltRounds);
          // Thanks https://mongoosejs.com/docs/async-await.html for async Mongoose queries
          await Stock.findOne({name: curName})
                     .then(async u => {
                       if (u === null) {
                         // Here, no record was found, so one is prepared and inserted
                         try {
                           const e = await Stock.insertOne({
                             name: curName,
                             likes: req.query.like ? [hashedIP] : []
                           });
                           stockData[i] = {
                             ...stockData[i],
                             "likes": e.likes.length
                           };
                         } catch (err) {
                           console.log(err);
                         }
                       } else {
                         // Record was found, so likes are updated
                         if (req.query.like) {
                          let found = false;
                          // if hash compare is true, then ip already liked
                          for (const i in u.likes) {
                            if (await bcrypt.compare(req.ip, u.likes[i])) {
                             found = true;
                             break;
                            }
                          }

                          !found && u.likes.push(hashedIP);
                         }
                         try {
                           const e = await Stock.findOneAndUpdate({ name: curName }, { likes: u.likes });
                           stockData[i] = {
                             ...stockData[i],
                             "likes": e.likes.length
                           };
                         } catch (err) {
                           console.log(err);
                         }
                       }
                     })
                     .catch(err => {
                       console.log(err);
                     });
        }

        // With only one stock stockData solely contains that stock's data
        if (stocks[1] === undefined) {
          stockData = stockData[0]
        } else {
          stockData[0] = {
            ...stockData[0],
            "rel_likes": stockData[0].likes - stockData[1].likes
          }
          stockData[1] = {
            ...stockData[1],
            "rel_likes": stockData[1].likes - stockData[0].likes
          }
          stockData[0].likes = undefined;
          stockData[1].likes = undefined;
        }
      }

      res.json({stockData});
    });
};
