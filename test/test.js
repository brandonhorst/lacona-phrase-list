var chai = require('chai');
var es = require('event-stream');
var expect = chai.expect;
var fulltext = require('lacona-util-fulltext');
var lacona = require('lacona');
var sinon = require('sinon');

var list = require('..');

chai.use(require('sinon-chai'));

describe('list', function () {
	var parser;

	beforeEach(function () {
		parser = new lacona.Parser();
	});

	describe('async', function () {
		var test;
		var spy;

		beforeEach(function () {
			spy = sinon.spy();
			test = lacona.createPhrase({
				name: 'test/test',
				collectFunction: function(done) {
					spy();
					setTimeout(function() {
						done(null, [{
							text: 'a test',
							value: 'value a',
						}, {
							text: 'b test',
							value: 'value b'
						}]);
					}, 0);
				},
				describe: function () {
					return list({
						id: 'test',
						collect: this.collectFunction
					});
				}
			});

			parser.sentences = [test()];
		});


		it('handles a list properly', function (done) {
			function callback(err, data) {
				var filteredData = data.filter(function (datum) {
					return datum.event === 'data';
				});
				expect(data).to.have.length(6);
				expect(filteredData).to.have.length(2);
				expect(fulltext.suggestion(filteredData[0].data)).to.equal('a test');
				expect(filteredData[0].data.result.test).to.equal('value a');
				expect(fulltext.suggestion(filteredData[1].data)).to.equal('b test');
				expect(filteredData[1].data.result.test).to.equal('value b');
				expect(spy).to.have.been.calledOnce;
				done();
			}

			es.readArray(['a', 'b'])
				.pipe(parser)
				.pipe(es.writeArray(callback));
		});
	});


	describe('sync', function () {
		var test;
		var spy;

		beforeEach(function () {
			spy = sinon.spy();

			test = lacona.createPhrase({
				name: 'test/test',
				collectFunction: function(done) {
					spy();
					done(null, [{
						text: 'a test',
						value: 'value a',
					}, {
						text: 'b test',
						value: 'value b'
					}]);
				},
				getDefault: function (done) {
					done(null, {text: 'myDefault', value: 'myDefaultValue'});
				},
				describe: function () {
					return list({
						id: 'test',
						collect: this.collectFunction,
						default: this.getDefault
					});
				}
			});

			parser.sentences = [test()];
		});

		it('handles a list properly', function (done) {

			function callback(err, data) {
				expect(data).to.have.length(6);
				expect(fulltext.suggestion(data[1].data)).to.equal('a test');
				expect(data[1].data.result.test).to.equal('value a');
				expect(fulltext.suggestion(data[4].data)).to.equal('b test');
				expect(data[4].data.result.test).to.equal('value b');
				expect(spy).to.have.been.calledOnce;
				done();
			}

			es.readArray(['a', 'b'])
				.pipe(parser)
				.pipe(es.writeArray(callback));
		});

		it('allows a default', function (done) {
			function callback(err, data) {
				expect(data).to.have.length(3);
				expect(fulltext.suggestion(data[1].data)).to.equal('myDefault');
				expect(data[1].data.result.test).to.equal('myDefaultValue');
				done();
			}

			es.readArray([''])
			.pipe(parser)
			.pipe(es.writeArray(callback));
		});
	});
});
