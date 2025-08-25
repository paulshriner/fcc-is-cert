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
          .catch(err => {
            console.log(err);
          });

          res.redirect('/b/' + req.body.board);
        } else {
          res.json({"error": "missing required information"});
        }
      });
    
  app.route('/api/replies/:board');
};
