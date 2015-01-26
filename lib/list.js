var lacona = require('lacona');

module.exports = lacona.createPhrase({
	name: 'lacona/list',
	onCreate: function () {
		var this_ = this;
		this.pendingCallbacks = [];
		this.props.collect(function (err, collectedData) {
			if (err) {
				this_.pendingCallbacks.forEach(function (callback) {
					callback.done(err);
				});
			} else {
				this_.cache = collectedData;
				this_.pendingCallbacks.forEach(function (callback) {
					collectedData.forEach(callback.data);
					callback.done();
				});
			}
		});
	},
	collect: function (inputString, data, done) {
		if (inputString === '' && this.props.default) {
			this.props.default(function (err, result) {
				if (err) {
					done(err);
				} else {
					data({text: result, value: result});
					done();
				}
			});
		} else {
			if (this.cache) {
				this.cache.forEach(data);
				done();
			} else {
				this.pendingCallbacks.push({
					data: data,
					done: done
				});
			}
		}
	},
	getValue: function (result) {
		return result.value;
	},
	describe: function () {
		return lacona.value({
			compute: this.collect,
			id: 'value'
		});
	}
});
