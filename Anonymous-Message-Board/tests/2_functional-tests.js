/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

	var _id1;
	var _id2;
	var _id3;

	suite('API ROUTING FOR /api/threads/:board', function () {

		suite('POST', function () {

			test('Create 2 new threads (because 1 will be deleted in a test)', function (done) {
				chai.request(server)
					.post('/api/threads/test')
					.send({ text: 'Text', delete_password: 'password' })
					.end(function (err, res) {
						assert.equal(res.status, 200);
					});

				chai.request(server)
					.post('/api/threads/test')
					.send({ text: 'Text', delete_password: 'password' })
					.end(function (err, res) {
						assert.equal(res.status, 200);
						done();
					});
			});

		});

		suite('GET', function () {

			test('Most recent 10 bumped threads with only the most recent 3 replies each', function (done) {
				chai.request(server)
					.get('/api/threads/test')
					.end(function (err, res) {
						assert.equal(res.status, 200);
						assert.isArray(res.body);
						assert.isBelow(res.body.length, 11);
						assert.property(res.body[0], '_id');
						assert.property(res.body[0], 'board');
						assert.property(res.body[0], 'text');
						assert.property(res.body[0], 'created_on');
						assert.property(res.body[0], 'bumped_on');
						assert.property(res.body[0], 'replies');
						assert.notProperty(res.body[0], 'delete_password');
						assert.notProperty(res.body[0], 'reported');
						assert.equal(res.body[0].board, 'test');
						assert.isArray(res.body[0].replies);
						assert.isBelow(res.body[0].replies.length, 4);
						_id1 = res.body[0]._id;
						_id2 = res.body[1]._id;
						done();
					});
			});

		});

		suite('PUT', function () {

			test('Report thread', function (done) {
				chai.request(server)
					.put('/api/threads/test')
					.send({ thread_id: _id2 })
					.end(function (err, res) {
						assert.equal(res.status, 200);
						assert.equal(res.text, 'reported');
						done();
					});
			});

		});

		suite('DELETE', function () {

			test('Delete thread with invalid password', function (done) {
				chai.request(server)
					.delete('/api/threads/test')
					.send({ thread_id: _id1, delete_password: 'invalid' })
					.end(function (err, res) {
						assert.equal(res.status, 200);
						assert.equal(res.text, 'incorrect password');
						done();
					});
			});

			test('Delete thread with valid password', function (done) {
				chai.request(server)
					.delete('/api/threads/test')
					.send({ thread_id: _id1, delete_password: 'password' })
					.end(function (err, res) {
						assert.equal(res.status, 200);
						assert.equal(res.text, 'success');
						done();
					});
			});

		});

	});

	suite('API ROUTING FOR /api/replies/:board', function () {

		suite('POST', function () {

			test('Reply to thread', function (done) {
				chai.request(server)
					.post('/api/replies/test')
					.send({ thread_id: _id2, text: 'Reply', delete_password: 'password' })
					.end(function (err, res) {
						assert.equal(res.status, 200);
						done();
					});
			});

		});

		suite('GET', function () {

			test('Get all replies for a thread', function (done) {
				chai.request(server)
					.get('/api/replies/test')
					.query({ thread_id: _id2 })
					.end(function (err, res) {
						assert.equal(res.status, 200);
						assert.property(res.body, '_id');
						assert.property(res.body, 'board');
						assert.property(res.body, 'text');
						assert.property(res.body, 'created_on');
						assert.property(res.body, 'bumped_on');
						assert.property(res.body, 'replies');
						assert.notProperty(res.body, 'delete_password');
						assert.notProperty(res.body, 'reported');
						assert.equal(res.body.board, 'test');
						assert.isArray(res.body.replies);
						assert.property(res.body.replies[0], '_id');
						assert.property(res.body.replies[0], 'text');
						assert.property(res.body.replies[0], 'created_on');
						assert.notProperty(res.body.replies[0], 'delete_password');
						assert.notProperty(res.body.replies[0], 'reported');
						assert.equal(res.body.replies[res.body.replies.length - 1].text, 'Reply');
						_id3 = res.body.replies[res.body.replies.length - 1]._id;
						done();
					});
			});

		});

		suite('PUT', function () {

			test('Report reply', function (done) {
				chai.request(server)
					.put('/api/replies/test')
					.send({ thread_id: _id2, reply_id: _id3 })
					.end(function (err, res) {
						assert.equal(res.status, 200);
						assert.equal(res.text, 'reported');
						done();
					});
			});

		});

		suite('DELETE', function () {

			test('Delete reply with invalid password', function (done) {
				chai.request(server)
					.delete('/api/replies/test')
					.send({ thread_id: _id2, reply_id: _id3, delete_password: 'invalid' })
					.end(function (err, res) {
						assert.equal(res.status, 200);
						assert.equal(res.text, 'incorrect password');
						done();
					});
			});

			test('Delete reply with valid password', function (done) {
				chai.request(server)
					.delete('/api/replies/test')
					.send({ thread_id: _id2, reply_id: _id3, delete_password: 'password' })
					.end(function (err, res) {
						assert.equal(res.status, 200);
						assert.equal(res.text, 'success');
						done();
					});
			});

		});

	});

});