"use strict";
export default class Gametime {
	constructor () {
		this.__last = 0;
		this.__current = 0;
		this.delta = 0;
	}

	update (current) {
		this.__current = current;
		this.delta = (this.__current - this.__last) / 1000;
		this.__last = this.__current;
	}
}