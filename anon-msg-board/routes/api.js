'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const saltRounds = 12;

// Schema for a thread
const threadSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  created_on: {
    type: Date,
    required: true,
    // Thanks https://github.com/Automattic/mongoose/issues/3675#issuecomment-411798850 for Date.now, which creates a new date each time
    default: Date.now
  },
  bumped_on: {
    type: Date,
    required: true,
    default: Date.now
  },
  reported: {
    type: Boolean,
    required: true,
    default: false
  },
  delete_password: {
    type: String,
    required: true
  },
  board: {
    type: String,
    required: true
  },
  replies: {
    type: [String]
  }
});

// Schema for a reply
const replySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  created_on: {
    type: Date,
    required: true,
    default: Date.now
  },
  delete_password: {
    type: String,
    required: true
  },
  reported: {
    type: Boolean,
    required: true,
    default: false
  }  
});

const threadLimit = 10;
const replyLimit = 3;

const Thread = mongoose.model('Thread', threadSchema);
const Reply = mongoose.model('Reply', replySchema);

module.exports = app => {
   app.route('/api/threads/:board')
      // route for creating a new thread   
      .post(async (req, res) => {
        if ((req.body.board || req.params.board) && req.body.text && req.body.delete_password) {
          // board could be passed via form box or by url
          const board = req.body.board ? req.body.board : req.params.board;
          
          // add the thread to the board
          // (boards aren't created, a board with no threads would just be empty)
          Thread.insertOne({
            "text": req.body.text,
            "delete_password": await bcrypt.hash(req.body.delete_password, saltRounds),
            "board": board
          })
          .then(u => {
            res.redirect('/b/' + req.body.board);
          })
          .catch(err => {
            console.log(err);
          });
        } else {
          res.json({"error": "missing required information"});
        }
      })
      // route for retrieving thread information
      .get(async (req, res) => {
        if (req.params.board) {
          await Thread.find({"board": req.params.board})
                // Thanks https://stackoverflow.com/a/15081087 for sort syntax
                .sort({"bumped_on": -1})
                .then(async u => {
                  let threads = [];

                  // extract needed information from db records
                  for (const thread in u) {
                    if (thread >= threadLimit) {
                      break;
                    }
                    
                    // if replies exist, extract and sort them
                    let replies = [];
                    if (u[thread].replies) {
                      // Thanks https://kb.objectrocket.com/mongo-db/the-mongoose-in-operator-1015 for $in operator
                      await Reply.find({"_id": {"$in": u[thread].replies}})
                           .sort({"created_on": -1})
                           .then(v => {
                            for (const reply in v) {
                              if (reply >= replyLimit) {
                                break;
                              }
                              
                              replies.push({
                                "_id": v[reply]._id,
                                "text": v[reply].text,
                                "created_on": v[reply].created_on
                              });
                             }
                           })
                           .catch(err => {
                             console.log(err);
                           });
                    }
                    
                    threads.push({
                      "_id": u[thread]._id,
                      "text": u[thread].text,
                      "created_on": u[thread].created_on,
                      "bumped_on": u[thread].bumped_on,
                      "replies": replies,
                      "replycount": u[thread].replies.length
                    });
                  }

                  res.json(threads);
                })
                .catch(err => {
                  console.log(err);
                });
        } else {
          res.json({"error": "missing required information"});
        }
      })
      // route for deleting a thread
      .delete((req, res) => {
        if (req.body.thread_id && req.body.delete_password) {
          // find the thread, if it exists check password
          // if password valid delete the thread
          Thread.findOne({"_id": req.body.thread_id})
                .then(async u => {
                  if (u !== null) {
                    if (await bcrypt.compare(req.body.delete_password, u.delete_password)) {
                      Thread.deleteOne({"_id": req.body.thread_id})
                            .then(v => {
                              res.send("success");
                            })
                            .catch(err => {
                              res.send("Error deleting thread.");
                            })
                    } else {
                      res.send("incorrect password");
                    }
                  } else {
                    res.send("Invalid or non-existant ID.");
                  }
                })
                .catch(err => {
                  res.send("Invalid or non-existant ID.");
                });
        } else {
          res.send("Invalid or missing information.");
        }
      })
      // route for reporting a thread
      .put((req, res) => {
        if (req.body.thread_id) {
          // find the thread, update its reported value
          Thread.findOneAndUpdate({"_id": req.body.thread_id}, {"reported": true})
                .then(u => {
                  if (u !== null) {
                    res.send("reported");
                  } else {
                    res.send("Invalid or non-existant ID.");
                  }
                })
                .catch(err => {
                  res.send("Error reporting thread.");
                })
        } else {
          res.send("Invalid or missing information.");
        }
      });
    
   app.route('/api/replies/:board')
      // route for replying to a thread
      .post(async (req, res) => {
        if (req.body.text && req.body.delete_password && req.body.thread_id) {
          // create a new reply
          Reply.insertOne({
            "text": req.body.text,
            "delete_password": await bcrypt.hash(req.body.delete_password, saltRounds)
          })
          .then(u => {
            // add the reply to the thread by appending its id
            Thread.findOneAndUpdate({"_id": req.body.thread_id}, {
              "bumped_on": u.created_on,
              // Thanks https://stackoverflow.com/a/52347322 for push syntax
              "$push": {"replies": u._id}
            })
            .then(u => {
              res.redirect('/b/' + (req.body.board ? req.body.board : req.params.board) + '/' + req.body.thread_id);
            })
            .catch(err => {
              console.log(err);
            })
          })
          .catch(err => {
            console.log(err);
          })
        } else {
          res.json({"error": "missing required information"});
        }
      })
      // route for retrieving replies associated with thread
      .get(async (req, res) => {
        if (req.query.thread_id) {
          // find the thread from the id
          await Thread.findOne({"_id": req.query.thread_id})
                .then(async u => {
                  // if replies exist, extract and sort them
                  let replies = [];
                  if (u.replies) {
                    await Reply.find({"_id": {"$in": u.replies}})
                          .sort({"created_on": -1})
                          .then(v => {
                            for (const reply in v) {
                              if (reply >= replyLimit) {
                                break;
                              }
                              
                              replies.push({
                                "_id": v[reply]._id,
                                "text": v[reply].text,
                                "created_on": v[reply].created_on
                              });
                            }
                          })
                          .catch(err => {
                            console.log(err);
                          });
                  }
                  
                  // extract needed information from the thread
                  let thread = {
                    "_id": u._id,
                    "text": u.text,
                    "created_on": u.created_on,
                    "bumped_on": u.bumped_on,
                    "replies": replies
                  };

                  res.json(thread);
                })
                .catch(err => {
                  console.log(err);
                })
        } else {
          res.json({"error": "missing required information"});
        }
      });
};
