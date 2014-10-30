var chai = require('chai');
var expect = chai.expect;
var list = require('../lib/list')
var sinon = require('sinon');
var Parser = require('lacona').Parser;

chai.use(require('sinon-chai'));

describe('list', function () {
	var parser;

	beforeEach(function () {
		parser = new Parser({sentences: ['test']});
	});

	it('handles a list properly', function (done) {
		var grammar = {
			scope: {
				collectFunction: sinon.spy(function(done) {
					process.nextTick( function() {
						done(null, [{
							display: 'test',
							value: 'test value',
						}, {
							display: 'tesla',
							value: 'tesla motors'
						}]);
					});

				})
			},
			phrases: [{
				name: 'test',
				root: {
					type: 'list',
					id: 'test',
					collect: 'collectFunction'
				}
			}],
			dependencies: [list]
		}

		var handleData = sinon.spy(function (data) {
			expect(data.result.test).to.equal('test value');
			expect(data.match[0].string).to.equal('test');
		});

		var handleEnd = sinon.spy(function () {
			expect(handleData).to.have.callCount(handleEnd.callCount);
			expect(grammar.scope.collectFunction).to.have.been.called.once;
			if (handleEnd.calledTwice) {
				done();
			} else {
				parser.parse('test');
			}
		});

		parser
		.understand(grammar)
		.on('data', handleData)
		.on('end', handleEnd)
		.parse('test');
	});
});
