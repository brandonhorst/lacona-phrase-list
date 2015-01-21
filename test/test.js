var chai = require('chai');
var expect = chai.expect;
var fulltext = require('lacona-util-fulltext');
var lacona = require('lacona');
var sinon = require('sinon');
var stream = require('stream');

var list = require('..');

chai.use(require('sinon-chai'));

function toStream(strings) {
	var newStream = new stream.Readable({objectMode: true});

	strings.forEach(function (string) {
		newStream.push(string);
	});
	newStream.push(null);

	return newStream;
}

function toArray(done) {
	var newStream = new stream.Writable({objectMode: true});
	var list = [];
	newStream.write = function(obj) {
		list.push(obj);
	};

	newStream.end = function() {
		done(list);
	};

	return newStream;
}

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


		it('handles a list properly (async)', function (done) {
			function callback(data) {
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

			toStream(['a', 'b'])
				.pipe(parser)
				.pipe(toArray(callback));
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
				describe: function () {
					return list({
						id: 'test',
						collect: this.collectFunction
					});
				}
			});

			parser.sentences = [test()];
		});

		it('handles a list properly (sync)', function (done) {

			function callback(data) {
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

			toStream(['a', 'b'])
				.pipe(parser)
				.pipe(toArray(callback));
		});
	});
});
