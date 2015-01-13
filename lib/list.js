var lacona = require('lacona');

module.exports = lacona.createPhrase({
	name: 'lacona/list',
	onCreate: function () {
		this.pendingCallbacks = [];
		this.collectCalled = false;
	},
	collect: function (inputString, data, done) {
		var this_ = this;
		if (this.cache) {
			this.cache.forEach(data);
			done();

		} else {
			this.pendingCallbacks.push({
				data: data,
				done: done
			});

			if (!this.collectCalled) {
				this.collectCalled = true;
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
