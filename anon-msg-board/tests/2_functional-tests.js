const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const threadLimit = 10;
const replyLimit = 3;

suite('Functional Tests', () => {
    // #1
    // Create a new thread, then verify if it is there by looking at the first thread
    // from a GET request to the same board
    // (There may be multiple threads but each should have the same text)
    test('Creating a new thread: POST request to /api/threads/{board}', done => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/threads/testThread1')
            .send({
                board: "testThread1",
                text: "This is a test!",
                delete_password: "test"
            })
            .end((err, res) => {
                chai
                    .request(server)
                    .keepOpen()
                    .get('/api/threads/testThread1')
                    .end((err1, res1) => {
                        assert.equal(res.status, 200);
                        assert.equal(res1.status, 200);
                        assert.exists(res1._body[0]._id);
                        assert.equal(res1._body[0].text, "This is a test!");
                        assert.exists(res1._body[0].created_on);
                        assert.exists(res1._body[0].bumped_on);
                        assert.isEmpty(res1._body[0].replies);
                        assert.equal(res1._body[0].replycount, 0);
                    });
            });
            done();
    });

    // #2
    // First create a thread
    // Then check thread length for that board and reply length for the first thread
    test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', done => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/threads/testThread2')
            .send({
                board: "testThread2",
                text: "This is a test!",
                delete_password: "test"
            })
            .end((err, res) => {
                chai
                    .request(server)
                    .keepOpen()
                    .get('/api/threads/testThread2')
                    .end((err1, res1) => {
                        assert.equal(res.status, 200);
                        assert.equal(res1.status, 200);
                        assert.isAtMost(res1._body.length, threadLimit);
                        assert.isAtMost(res1._body[0].replies.length, replyLimit);
                    });
            });
            done();
    });

    // #3
    // First create a thread
    // Then do a GET request of the board to get current threads
    // Then try to delete the first thread using the wrong password
    test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', done => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/threads/testThread3')
            .send({
                board: "testThread3",
                text: "This is a test!",
                delete_password: "test"
            })
            .end((err, res) => {
                chai
                    .request(server)
                    .keepOpen()
                    .get('/api/threads/testThread3')
                    .end((err1, res1) => {
                        chai
                            .request(server)
                            .keepOpen()
                            .delete('/api/threads/testThread3')
                            .send({
                                thread_id: res1._body[0]._id,
                                delete_password: "wrong"
                            })
                            .end((err2, res2) => {
                                assert.equal(res.status, 200);
                                assert.equal(res1.status, 200);
                                assert.equal(res2.status, 200);
                                assert.equal(res2.text, "incorrect password");
                            });
                    });
            });
            done();
    });

    // #4
    // First create a thread
    // Then do a GET request of the board to get current threads
    // Then try to delete the first thread using the correct password
    test('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', done => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/threads/testThread4')
            .send({
                board: "testThread4",
                text: "This is a test!",
                delete_password: "test"
            })
            .end((err, res) => {
                chai
                    .request(server)
                    .keepOpen()
                    .get('/api/threads/testThread4')
                    .end((err1, res1) => {
                        chai
                            .request(server)
                            .keepOpen()
                            .delete('/api/threads/testThread4')
                            .send({
                                thread_id: res1._body[0]._id,
                                delete_password: "test"
                            })
                            .end((err2, res2) => {
                                assert.equal(res.status, 200);
                                assert.equal(res1.status, 200);
                                assert.equal(res2.status, 200);
                                assert.equal(res2.text, "success");
                            });
                    });
            });
            done();
    });

    // #5
    // First create a thread
    // Then do a GET request of the board to get current threads
    // Then try to report the first thread
    test('Reporting a thread: PUT request to /api/threads/{board}', done => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/threads/testThread5')
            .send({
                board: "testThread5",
                text: "This is a test!",
                delete_password: "test"
            })
            .end((err, res) => {
                chai
                    .request(server)
                    .keepOpen()
                    .get('/api/threads/testThread5')
                    .end((err1, res1) => {
                        chai
                            .request(server)
                            .keepOpen()
                            .put('/api/threads/testThread5')
                            .send({
                                thread_id: res1._body[0]._id
                            })
                            .end((err2, res2) => {
                                assert.equal(res.status, 200);
                                assert.equal(res1.status, 200);
                                assert.equal(res2.status, 200);
                                assert.equal(res2.text, "reported");
                            });
                    });
            });
            done();
    });

    // #6
    // First create a thread
    // Then get all threads, and reply to the first thread
    // Finally do a get request and check the first reply
    test('Creating a new reply: POST request to /api/replies/{board}', done => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/threads/testThread6')
            .send({
                board: "testThread6",
                text: "This is a test!",
                delete_password: "test"
            })
            .end((err, res) => {
                chai
                    .request(server)
                    .keepOpen()
                    .get('/api/threads/testThread6')
                    .end((err1, res1) => {
                        chai
                            .request(server)
                            .keepOpen()
                            .post('/api/replies/testThread6')
                            .send({
                                text: "test",
                                delete_password: "test",
                                thread_id: res1._body[0]._id
                            })
                            .end((err2, res2) => {
                                chai
                                    .request(server)
                                    .keepOpen()
                                    .get('/api/threads/testThread6')
                                    .end((err3, res3) => {
                                        assert.equal(res.status, 200);
                                        assert.equal(res1.status, 200);
                                        assert.equal(res2.status, 200);
                                        assert.equal(res3.status, 200);
                                        assert.equal(res3._body[0].replies[0].text, "test");
                                        assert.exists(res3._body[0].replies[0]._id);
                                        assert.exists(res3._body[0].replies[0].created_on);
                                        assert.equal(res3._body[0].replycount, 1);
                                    });
                            });
                    });
            });
            done();
    });

    // #7
    // First create a new thread
    // Then get all threads, then do a GET request for the first thread
    test('Viewing a single thread with all replies: GET request to /api/replies/{board}', done => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/threads/testThread7')
            .send({
                board: "testThread7",
                text: "This is a test!",
                delete_password: "test"
            })
            .end((err, res) => {
                chai
                    .request(server)
                    .keepOpen()
                    .get('/api/threads/testThread7')
                    .end((err1, res1) => {
                        chai
                            .request(server)
                            .keepOpen()
                            .get('/api/replies/testThread7?thread_id=' + res1._body[0]._id)
                            .end((err2, res2) => {
                                assert.equal(res.status, 200);
                                assert.equal(res1.status, 200);
                                assert.equal(res2.status, 200);
                                assert.exists(res2._body._id);
                                assert.equal(res2._body.text, "This is a test!");
                                assert.exists(res2._body.created_on);
                                assert.exists(res2._body.bumped_on);
                                assert.isArray(res2._body.replies);
                            });
                    });
            });
            done();
    });

    // #8
    // First create a thread, then get the first thread's id
    // Create a reply, do another GET reqeust to get the reply's id
    // Attempt to delete the reply using the wrong password
    test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', done => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/threads/testThread8')
            .send({
                board: "testThread8",
                text: "This is a test!",
                delete_password: "test"
            })
            .end((err, res) => {
                chai
                    .request(server)
                    .keepOpen()
                    .get('/api/threads/testThread8')
                    .end((err1, res1) => {
                        chai
                            .request(server)
                            .keepOpen()
                            .post('/api/replies/testThread8')
                            .send({
                                text: "test",
                                delete_password: "test",
                                thread_id: res1._body[0]._id
                            })
                            .end((err2, res2) => {
                                chai
                                    .request(server)
                                    .keepOpen()
                                    .get('/api/threads/testThread8')
                                    .end((err3, res3) => {
                                        chai
                                            .request(server)
                                            .keepOpen()
                                            .delete('/api/replies/testThread8')
                                            .send({
                                                reply_id: res3._body[0].replies[0]._id,
                                                delete_password: "wrong"
                                            })
                                            .end((err4, res4) => {
                                                assert.equal(res.status, 200);
                                                assert.equal(res1.status, 200);
                                                assert.equal(res2.status, 200);
                                                assert.equal(res3.status, 200);
                                                assert.equal(res4.status, 200);
                                                assert.equal(res4.text, "incorrect password");
                                            });
                                    });
                            });
                    });
            });
            done();
    });

    // #9
    // First create a thread, then get the first thread's id
    // Create a reply, do another GET reqeust to get the reply's id
    // Delete the thread using the correct password
    test('Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', done => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/threads/testThread9')
            .send({
                board: "testThread9",
                text: "This is a test!",
                delete_password: "test"
            })
            .end((err, res) => {
                chai
                    .request(server)
                    .keepOpen()
                    .get('/api/threads/testThread9')
                    .end((err1, res1) => {
                        chai
                            .request(server)
                            .keepOpen()
                            .post('/api/replies/testThread9')
                            .send({
                                text: "test",
                                delete_password: "test",
                                thread_id: res1._body[0]._id
                            })
                            .end((err2, res2) => {
                                chai
                                    .request(server)
                                    .keepOpen()
                                    .get('/api/threads/testThread9')
                                    .end((err3, res3) => {
                                        chai
                                            .request(server)
                                            .keepOpen()
                                            .delete('/api/replies/testThread9')
                                            .send({
                                                reply_id: res3._body[0].replies[0]._id,
                                                delete_password: "test"
                                            })
                                            .end((err4, res4) => {
                                                assert.equal(res.status, 200);
                                                assert.equal(res1.status, 200);
                                                assert.equal(res2.status, 200);
                                                assert.equal(res3.status, 200);
                                                assert.equal(res4.status, 200);
                                                assert.equal(res4.text, "success");
                                            });
                                    });
                            });
                    });
            });
            done();
    });

    // #10
    // Create thread, get id, create reply, get reply's id
    // Then try reporting the reply
    test('Reporting a reply: PUT request to /api/replies/{board}', done => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/threads/testThread10')
            .send({
                board: "testThread10",
                text: "This is a test!",
                delete_password: "test"
            })
            .end((err, res) => {
                chai
                    .request(server)
                    .keepOpen()
                    .get('/api/threads/testThread10')
                    .end((err1, res1) => {
                        chai
                            .request(server)
                            .keepOpen()
                            .post('/api/replies/testThread10')
                            .send({
                                text: "test",
                                delete_password: "test",
                                thread_id: res1._body[0]._id
                            })
                            .end((err2, res2) => {
                                chai
                                    .request(server)
                                    .keepOpen()
                                    .get('/api/threads/testThread10')
                                    .end((err3, res3) => {
                                        chai
                                            .request(server)
                                            .keepOpen()
                                            .put('/api/replies/testThread10')
                                            .send({
                                                reply_id: res3._body[0].replies[0]._id
                                            })
                                            .end((err4, res4) => {
                                                assert.equal(res.status, 200);
                                                assert.equal(res1.status, 200);
                                                assert.equal(res2.status, 200);
                                                assert.equal(res3.status, 200);
                                                assert.equal(res4.status, 200);
                                                assert.equal(res4.text, "reported");
                                            });
                                    });
                            });
                    });
            });
            done();
    });
});
