const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

// Thanks https://stockanalysis.com/list/nasdaq-stocks/ for stock names
// NOTE: You will need to ensure the stocks used in the tests do not exist in the db before running, 
// otherwise the tests will fail (specifcally with liking stocks)
// Price is simply checked that it exists, since the actual values can change
suite('Functional Tests', () => {
    // #1
    test('Viewing one stock: GET request to /api/stock-prices/', done => {
        chai
            .request(server)
            .keepOpen()
            .get('/api/stock-prices?stock=AAPL')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData.stock, 'AAPL');
                assert.equal(res.body.stockData.likes, 0);
                assert.exists(res.body.stockData.price);
            });
            done();
    });

    // #2
    test('Viewing one stock and liking it: GET request to /api/stock-prices/', done => {
        chai
            .request(server)
            .keepOpen()
            .get('/api/stock-prices?stock=MSFT')
            .end((err, res) => {
                chai
                    .request(server)
                    .keepOpen()
                    .get('/api/stock-prices?stock=MSFT&like=true')
                    .end((err1, res1) => {
                        assert.equal(res.status, 200);
                        assert.equal(res1.status, 200);
                        assert.equal(res.body.stockData.stock, 'MSFT');
                        assert.equal(res1.body.stockData.stock, 'MSFT');
                        assert.equal(res.body.stockData.likes, 0);
                        assert.equal(res1.body.stockData.likes, 1);
                        assert.exists(res.body.stockData.price);
                        assert.exists(res1.body.stockData.price);
                    });
            });
            done();
    });

    // #3
    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', done => {
        chai
            .request(server)
            .get('/api/stock-prices?stock=GOOG')
            .end((err, res) => {
                chai
                    .request(server)
                    .keepOpen()
                    .get('/api/stock-prices?stock=GOOG&like=true')
                    .end((err1, res1) => {
                        chai
                            .request(server)
                            .keepOpen()
                            .get('/api/stock-prices?stock=GOOG&like=true')
                            .end((err2, res2) => {
                                assert.equal(res.status, 200);
                                assert.equal(res1.status, 200);
                                assert.equal(res2.status, 200);
                                assert.equal(res.body.stockData.stock, 'GOOG');
                                assert.equal(res1.body.stockData.stock, 'GOOG');
                                assert.equal(res2.body.stockData.stock, 'GOOG');
                                assert.equal(res.body.stockData.likes, 0);
                                assert.equal(res1.body.stockData.likes, 1);
                                assert.equal(res2.body.stockData.likes, 1);
                                assert.exists(res.body.stockData.price);
                                assert.exists(res1.body.stockData.price);
                                assert.exists(res2.body.stockData.price);
                            });
                    });
            });
            done();
    });

    // #4
    test('Viewing two stocks: GET request to /api/stock-prices/', done => {
        chai
            .request(server)
            .keepOpen()
            .get('/api/stock-prices?stock=NVDA&stock=AMZN')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData[0].stock, 'NVDA');
                assert.equal(res.body.stockData[1].stock, 'AMZN');
                assert.exists(res.body.stockData[0].price);
                assert.exists(res.body.stockData[1].price);
                assert.equal(res.body.stockData[0].rel_likes, 0);
                assert.equal(res.body.stockData[1].rel_likes, 0);
            });
            done();
    });

    // #5
    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', done => {
        chai
            .request(server)
            .keepOpen()
            .get('/api/stock-prices?stock=META&stock=TSLA')
            .end((err, res) => {
                chai
                    .request(server)
                    .keepOpen()
                    .get('/api/stock-prices?stock=META&stock=TSLA&like=true')
                    .end((err1, res1) => {
                        assert.equal(res.status, 200);
                        assert.equal(res1.status, 200);
                        assert.equal(res.body.stockData[0].stock, 'META');
                        assert.equal(res.body.stockData[1].stock, 'TSLA');
                        assert.equal(res1.body.stockData[0].stock, 'META');
                        assert.equal(res1.body.stockData[1].stock, 'TSLA');
                        assert.exists(res.body.stockData[0].price);
                        assert.exists(res.body.stockData[1].price);
                        assert.exists(res1.body.stockData[0].price);
                        assert.exists(res1.body.stockData[1].price);
                        assert.equal(res.body.stockData[0].rel_likes, 0);
                        assert.equal(res.body.stockData[1].rel_likes, 0);
                        assert.equal(res1.body.stockData[0].rel_likes, 0);
                        assert.equal(res1.body.stockData[1].rel_likes, 0);
                    });
            });
            done();
    });
});
