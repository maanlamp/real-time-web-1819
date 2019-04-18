"use strict";
import assert from "./Assert.js";
import { canvasStyleExpander } from "./ShorthandExpander.js";

export default class Canvas {
	constructor (options = {
		width: 640,
		height: 480
	}) {
		this.__SAVEDCTX = {};
		this.__ELEMENT = document.createElement("canvas");
		this.__CTX = this.__ELEMENT.getContext(options.contextType || "2d");
		this.resizeTo(options);
	}

	get element () {
		return this.__ELEMENT;
	}

	get width () {
		return this.__WIDTH;
	}

	get height () {
		return this.__HEIGHT;
	}

	get size () {
		return Object.assign([this.__WIDTH, this.__HEIGHT], {
			width: this.__WIDTH,
			height: this.__HEIGHT,
		});
	}

	resize (w, h = w) {
		if (w instanceof Object) return this.resizeTo(w);

		this.save();
		this.__WIDTH = w;
		this.__HEIGHT = h;
		this.__ELEMENT.width = this.__WIDTH;
		this.__ELEMENT.height = this.__HEIGHT;
		this.restore();

		return this;
	}

	resizeTo (obj) {
		assert(obj.innerWidth !== undefined)
			.or(obj.width !== undefined)
			.error(`Cannot resize to ${obj} because it does not have a (inner)width.`);

		const w = obj.innerWidth || obj.width;
		const h = obj.innerHeight || obj.height || w;

		this.resize(w, h);

		return this;
	}

	save () {
		for (const property in this.__CTX) {
			const value = this.__CTX[property];
			if (typeof value === "string" || typeof value === "number") this.__SAVEDCTX[property] = value;
		}

		return this;
	}

	restore () {
		Object.assign(this.__CTX, this.__SAVEDCTX);

		return this;
	}

	clear (
		x = 0,
		y = 0,
		w = this.width,
		h = this.height
	)	{
		this.__CTX.clearRect(x, y, w, h);

		return this;
	}

	text (str, x, y, type = "fill", maxWidth) {
		this.__CTX[`${type}Text`](str, x, y, maxWidth);

		return this;
	}

	style (css) {
		canvasStyleExpander
			.process(css)
			.forEach(([prop, value]) => this.__CTX[prop] = value);

			console.warn("vergeet dit niet werkend te maken");

		return this;
	}

	drawImage (image, sx = 0, sy = 0, sw = image.width, sh = image.height, dx = 0, dy = 0, dw = image.width, dh = image.height) {
		this.__CTX.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);

		return this;
	}

	getImageData (sx = 0, sy = 0, sw = this.width, sh = this.height) {
		return this.__CTX.getImageData(sx, sy, sw, sh)
	}

	fillRect (x = 0, y = 0, w = this.width, h = this.height) {
		this.__CTX.fillRect(x, y, w, h);

		return this;
	}

	rotate (degrees) {
		this.__CTX.rotate(degrees * Math.PI / 180);
		return this;
	}

	translate (x, y = x) {
		this.__CTX.translate(x, y);
		return this;
	}
}