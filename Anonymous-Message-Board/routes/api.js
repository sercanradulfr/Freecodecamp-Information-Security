/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const sanitizeHtml = require('sanitize-html');

module.exports = function (app) {

	app.route('/api/threads/:board')
		.get(function (req, res) {
			var board = req.params.board;

			let limit = (req.query.limit !== undefined && req.query.limit !== '' ? parseInt(req.query.limit) : 10);

			MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
				if (err) {
					// console.log('Database error: ' + err);
					return res.json({ error: 'error' });
				} else {
					db.db().collection('messageboard').find(
						{
							board
						},
						{
							sort: {
								bumped_on: -1
							},
							limit: limit,
							projection: {
								delete_password: 0,
								reported: 0,
								'replies.delete_password': 0,
								'replies.reported': 0
							}
						}
					).toArray(function (err, docs) {
						docs.forEach(function (doc) {
							doc.replycount = doc.replies.length;

							if (doc.replycount > 3) {
								doc.replies = doc.replies.slice(-3);
							}
						});

						return res.json(docs);
					});
				}
			});
		})
		.post(function (req, res) {
			var board = req.params.board;

			if (req.body.text === undefined || req.body.text === '') {
				return res.json({ error: 'Text is required' });
			}

			let text = sanitizeHtml(req.body.text).trim();

			if (req.body.delete_password === undefined || req.body.delete_password === '') {
				return res.json({ error: 'Delete password is required' });
			}

			let delete_password = req.body.delete_password;

			let date = new Date();

			MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
				if (err) {
					// console.log('Database error: ' + err);
					return res.json({ error: 'error' });
				} else {
					db.db().collection('messageboard').insertOne(
						{
							board: board,
							text: text,
							delete_password: delete_password,
							created_on: date,
							bumped_on: date,
							reported: false,
							replies: []
						}, function (err, doc) {
							return res.redirect('/b/' + board);
						}
					);
				}
			});
		})
		.put(function (req, res) {
			var board = req.params.board;
			let thread_id = '';

			if (req.body.thread_id !== undefined) {
				thread_id = req.body.thread_id;
			} else if (req.body.report_id !== undefined) {
				thread_id = req.body.report_id;
			}

			if (thread_id === '') {
				return res.send('Thread ID is required');
			}

			MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
				if (err) {
					// console.log('Database error: ' + err);
					return res.json({ error: 'error' });
				} else {
					db.db().collection('messageboard').findOneAndUpdate(
						{
							board: board,
							_id: new ObjectId(thread_id)
						},
						{
							$set: {
								reported: true
							}
						},
						{ returnDocument: 'after' }, // Return the updated document
						function (error, result) {
							if (result.ok === 1 && result.value !== null) {
								return res.send('reported');
							} else {
								return res.send('failure');
							}
						}
					);
				}
			});
		})
		.delete(function (req, res) {
			var board = req.params.board;

			if (req.body.thread_id === undefined || req.body.thread_id === '') {
				return res.json({ error: 'Thread ID is required' });
			}

			let thread_id = req.body.thread_id;

			if (req.body.delete_password === undefined || req.body.delete_password === '') {
				return res.json({ error: 'Delete password is required' });
			}

			let delete_password = req.body.delete_password;

			MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
				if (err) {
					// console.log('Database error: ' + err);
					return res.json({ error: 'error' });
				} else {
					db.db().collection('messageboard').findOneAndDelete(
						{
							board: board,
							_id: new ObjectId(thread_id),
							delete_password
						},
						function (error, result) {
							if (result.ok === 1 && result.value !== null) {
								return res.send('success');
							} else {
								return res.send('incorrect password'); // or it no longer exists (delete unsuccessful)
							}
						}
					);
				}
			});
		});

	app.route('/api/replies/:board')
		.get(function (req, res) {
			var board = req.params.board;

			if (req.query.thread_id === undefined || req.query.thread_id === '') {
				return res.json({ error: 'Thread ID is required' });
			}

			let thread_id = req.query.thread_id;

			MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
				if (err) {
					// console.log('Database error: ' + err);
					return res.json({ error: 'error' });
				} else {
					db.db().collection('messageboard').find(
						{
							board,
							_id: new ObjectId(thread_id)
						},
						{
							sort: {
								created_on: -1
							},
							projection: {
								delete_password: 0,
								reported: 0,
								'replies.delete_password': 0,
								'replies.reported': 0
							}
						}
					).toArray(function (err, docs) {
						return res.json(docs[0]);
					});
				}
			});
		})
		.post(function (req, res) {
			var board = req.params.board;

			if (req.body.thread_id === undefined || req.body.thread_id === '') {
				return res.json({ error: 'Thread ID is required' });
			}

			let thread_id = req.body.thread_id;

			if (req.body.text === undefined || req.body.text === '') {
				return res.json({ error: 'Text is required' });
			}

			let text = sanitizeHtml(req.body.text).trim();

			if (req.body.delete_password === undefined || req.body.delete_password === '') {
				return res.json({ error: 'Delete password is required' });
			}

			let delete_password = req.body.delete_password;

			let date = new Date();

			MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
				if (err) {
					// console.log('Database error: ' + err);
					return res.json({ error: 'error' });
				} else {
					db.db().collection('messageboard').findOneAndUpdate(
						{
							board: board,
							_id: new ObjectId(thread_id)
						},
						{
							$set: {
								bumped_on: date
							},
							$push: {
								replies: {
									_id: new ObjectId(),
									text: text,
									delete_password: delete_password,
									created_on: date,
									reported: false
								}
							}
						},
						{ returnDocument: 'after' }, // Return the updated document
						function (err, doc) {
							return res.redirect('/b/' + board + '/' + thread_id);
						}
					);
				}
			});
		})
		.put(function (req, res) {
			var board = req.params.board;

			if (req.body.thread_id === undefined || req.body.thread_id === '') {
				return res.send('Thread ID is required');
			}

			let thread_id = req.body.thread_id;

			if (req.body.reply_id === undefined || req.body.reply_id === '') {
				return res.send('Reply ID is required');
			}

			let reply_id = req.body.reply_id;

			MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
				if (err) {
					// console.log('Database error: ' + err);
					return res.json({ error: 'error' });
				} else {
					db.db().collection('messageboard').findOneAndUpdate(
						{
							board: board,
							_id: new ObjectId(thread_id),
							replies: {
								$elemMatch: {
									_id: new ObjectId(reply_id)
								}
							}
						},
						{
							$set: {
								'replies.$.reported': true
							}
						},
						{ returnDocument: 'after' }, // Return the updated document
						function (error, result) {
							if (result.ok === 1 && result.value !== null) {
								return res.send('reported');
							} else {
								return res.send('failure');
							}
						}
					);
				}
			});
		})
		.delete(function (req, res) {
			var board = req.params.board;

			if (req.body.thread_id === undefined || req.body.thread_id === '') {
				return res.json({ error: 'Thread ID is required' });
			}

			let thread_id = req.body.thread_id;

			if (req.body.reply_id === undefined || req.body.reply_id === '') {
				return res.json({ error: 'Reply ID is required' });
			}

			let reply_id = req.body.reply_id;

			if (req.body.delete_password === undefined || req.body.delete_password === '') {
				return res.json({ error: 'Delete password is required' });
			}

			let delete_password = req.body.delete_password;

			MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
				if (err) {
					// console.log('Database error: ' + err);
					return res.json({ error: 'error' });
				} else {
					db.db().collection('messageboard').findOneAndUpdate(
						{
							board: board,
							_id: new ObjectId(thread_id),
							replies: {
								$elemMatch: {
									_id: new ObjectId(reply_id),
									delete_password: delete_password
								}
							}
						},
						{
							$set: {
								'replies.$.text': '[deleted]'
							}
						},
						{ returnDocument: 'after' }, // Return the updated document
						function (err, doc) {
							if (doc.ok === 1 && doc.value !== null) {
								return res.send('success');
							} else {
								return res.send('incorrect password'); // or it no longer exists (delete unsuccessful)
							}
						}
					);
				}
			});
		});

};