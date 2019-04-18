"use strict";
export default class ResetableTimeout {
	constructor ({
		timeout = 0,
		handler = null,
		start = false
	} = {}) {
		this.handler = handler;
		this.timeout = timeout;
		this.id = null;

		if (start) this.start();
	}

	reset () {
		this
			.stop()
			.start();

		return this;
	}

	start () {
		this.id = setTimeout(this.handler, this.timeout);

		return this;
	}

	stop () {
		clearTimeout(this.id);

		return this;
	}
}