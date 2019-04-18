"use strict";
import err from "./err.js";

class Assertion {
	constructor (expression) {
		//constructor cannot be async so awaiting must be deferred to all other methods :(
		this.__EXPRESSION = expression;
	}

	and (expression) {
		this.__EXPRESSION = (this.__EXPRESSION && expression);

		return this;
	}

	or (expression) {
		this.__EXPRESSION = (this.__EXPRESSION || expression);

		return this;
	}

	async ignore () {
		return this;
	}

	async warn (message) {
		if (await this.__EXPRESSION === false) console.warn(message);

		return this.__EXPRESSION;
	}

	async error (message) {
		if (await this.__EXPRESSION === false) throw err(message);

		return this.__EXPRESSION;
	}
}

export default function assert (expression) {
	return new Assertion(expression);
}