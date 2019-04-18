"use strict";
import Gametime from "./Gametime.js";
import assert from "./Assert.js";

export default class Game {
	constructor () {
		const instance = this;

		this.__KEYBINDS = new Map();
		this.__TIME = new Gametime();
		this.__USERDATA = new Object();
		this.__KEYBINDTARGET = window;
		this.__PROXVAL = null;
		this.__PROXHANDLER = {
			instance,
			get (obj, key) {
				return (key in obj)
					? obj[key]
					: instance[key];
			}
		};
		this.__KEYBINDTARGET.addEventListener("keydown", event => {
			this.__KEYBINDS.forEach((action, keycombo) => {
				const keys = keycombo
					.split(/\+| /)
					.map(key => key.toLowerCase());

				const keytoCheck = keys[keys.length - 1];
				const ctrl = keys.includes("ctrl");
				const shift = keys.includes("shift");

				if ((event.key.toLowerCase() === keytoCheck)
					&& (ctrl ? event.ctrlKey : true)
					&& (shift ? event.shiftKey : true)) action(event);
			});
		});
	}

	deltaTime () {
		return this.__TIME.delta;
	}

	update (timestamp) {
		this.__TIME.update(timestamp);

		return this;
	}

	add (key, value) {
		assert(this.__USERDATA[key] !== undefined)
			.error(`No property "${key}" found in userdata.`);

		this.__USERDATA[key].push(
			(value instanceof Function)
				? value(this)
				: value);

		return this;
	}

	set (key, value) {
		this.__USERDATA[key] = value;

		return this;
	}

	get (key) {
		return this.__USERDATA[`${key}`];
	}

	enter (key) {
		//TODO: REUSE PROXY TO MASSIVELY REDUCE MEMORY USAGE
		assert(this.__USERDATA[`${key}`] !== undefined)
			.error(`No property "${key}" found in userdata.`);

		return new Proxy(this.__PROXVAL = this.get(key), this.__PROXHANDLER);
	}

	exit () {
		this.__PROXVAL = null;

		return this;
	}

	bindkey (keybind) {
		const keycombo = keybind.combo;
		function action (event) {
			return ((keybind.when !== undefined)
					? keybind.when(event)
					: true)
				&& keybind.do(event);
		}

		this.__KEYBINDS.set(keycombo, action)

		return this;
	}

	bindkeys (keybinds) {
		keybinds.forEach(this.bindkey.bind(this));

		return this;
	}
}