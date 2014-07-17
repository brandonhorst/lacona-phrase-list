var _ = require('lodash');

var callDataOnList = function (list, data, done) {
	var l = list.length;
	var entry;
	var i;

	for (i = 0; i < l; i++) {
		entry = list[i];
		data(entry);
	}
	done();
};

var checkCache = function (object, done) {
	if (object._waitingForCache) {
		process.nextTick(function () {
			checkCache(object, done);
		});
	} else {
		done();
	}
};

module.exports = {
	scope: {
		collect: function (inputString, data, done) {
			var _this = this;
			if (!_.isUndefined(this.cache)) {
				callDataOnList(this.cache, data, done)
			} else if (this._waitingForCache) {
				checkCache(this, function() {
					callDataOnList(_this.cache, data, done);
				});
			} else {
				this._waitingForCache = true;
				this.$call(this.collect, function (err, list) {
					if (err) {
						done(err);
					} else {
						_this._waitingForCache = false;
						_this.cache = list;
						callDataOnList(list, data, done);
					}
				});
			}
		}
	},

	schema: {
		name: 'list',
		root: {
			type: 'value',
			compute: 'collect',
			id: '@value'
		}
	}
};
