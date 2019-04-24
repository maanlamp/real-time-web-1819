export default class Vector2 {
	constructor (x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	static random (xMax = 1, yMax = xMax) {
		return new Vector2(
			Math.floor(Math.random() * xMax),
			Math.floor(Math.random() * yMax));
	}

	static lenDir (len, angle) {
		const x = len * Math.cos(Vector2.radians(angle))
		const y = len * Math.sin(Vector2.radians(angle));
		return new Vector2(x, y);
	}

	static radians (degrees) {
		return degrees * Math.PI / 180;
	}

	static degrees (radians) {
		return radians * 180 / Math.PI;
	}

	round (other) {
		this.set(Math.round(this.x), Math.round(this.y));
		return this;
	}
	rounded (other) {
		return this.copy().round(other);
	}

	ceil (other) {
		this.set(Math.ceil(this.x), Math.ceil(this.y));
		return this;
	}
	ceiled (other) {
		return this.copy().ceil(other);
	}

	floor (other) {
		this.set(Math.floor(this.x), Math.floor(this.y));
		return this;
	}
	floored (other) {
		return this.copy().floor(other);
	}

	set (x, y = null) {
		if (x.x && x.y) {
			this.x = x.x;
			this.y = x.y;
		} else {
			this.x = x;
			this.y = (y !== null) ? y : x;
		}
		return this;
	}

	equals (other) {
		return (this.x === other.x && this.y === other.y);
	}

	fuzzyEquals (other) {
		return (this.rounded().x === other.rounded().x && this.rounded().y === other.rounded().y);
	}

	interpolate (other, factor) {
		const value = this.add(other.subtracted(this).multiplied(factor));
		return value;
	}
	interpolated (other, factor) {
		return this.copy().interpolate(other, factor);
	}

	lerp (other) {
		return this.interpolate(other, .5);
	}
	lerped (other) {
		return this.interpolated(other, .5);
	}

	get magnitude  () {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}

	distance (other) {
		return this.subtracted(other).magnitude;
	}

	angle (other, mode = "degrees") {
		const deltaX = other.x - this.x;
		const deltaY = other.y - this.y;
		let angle = Math.atan2(deltaY, deltaX) + Math.PI / 2;
		if (mode.toLowerCase().includes("deg")) {
			angle = Vector2.degrees(angle);
			return (angle < 0) ? angle + 360 : angle;
		} else if (mode.toLowerCase().includes("rad")) {
			return angle;
		} else {
			throw new Error(`Unknown angle mode "${mode}"`);
		}
	}

	normalise () {
		this.divide(this.magnitude());
	}

	get normalised () {
		return this.copy().normalise();
	}

	scale (other) {
		this.multiply(other);
	}

	scaled (other) {
		return this.copy().multiply(other);
	}

	copy (property) {
		if (typeof property === "string") {
			switch (property) {
				case "x": return new Vector2(this.x, 0);
				case "y": return new Vector2(0, this.y);
				default: throw new Error(`Cannot copy unknown property "${property}"`);
			}
		}
		return new Vector2(this.x, this.y);
	}

	static from (other) {
		if (other instanceof Array) {
			if (other.length > 2) {
				const returnArray = [];
				for (let i = 0; i < Math.floor(other.length / 2); i++) {
					returnArray.push(new Vector2(other[i], other[i + 1]));
				}
				return returnArray;
			}
			return new Vector2(other[0], other[1]);
		} else if (other instanceof Object) {
			if (other instanceof Vector2) {
				return other.copy();
			}
			return new Vector2(other.x, other.y);
		}
		throw new Error(`Cannot create Vector2 from "${other}"`);
	}

	subtract (other, otherOther = null) {
		if (other.x && other.y) {
			this.x -= other.x;
			this.y -= other.y;
		} else if (other.constructor.name === "Number") {
			if (otherOther !== null) {
				this.x -= other;
				this.y -= otherOther
			} else {
				this.x -= other;
				this.y -= other;
			}
		} else {
			throw new Error(`Cannot subtract by "${other}"`);
		}
		return this;
	}
	subtracted (other, otherOther = null) {
		return this.copy().subtract(other, otherOther);
	}

	multiply (other, otherOther = null) {
		if (other instanceof Vector2) {
			this.x *= other.x;
			this.y *= other.y;
		} else if (other.constructor.name === "Number") {
			if (otherOther !== null) {
				this.x *= other;
				this.y *= otherOther
			} else {
				this.x *= other;
				this.y *= other;
			}
		} else {
			throw new Error(`Cannot multiply by "${other}"`);
		}
		return this;
	}
	multiplied (other, otherOther = null) {
		return this.copy().multiply(other, otherOther);
	}

	divide (other, otherOther = null) {
		if (other instanceof Vector2) {
			this.x /= other.x || 1;
			this.y /= other.y || 1;
		} else if (other.constructor.name === "Number") {
			if (otherOther !== null) {
				this.x /= other || 1;
				this.y /= otherOther || 1;
			} else {
				this.x /= other || 1;
				this.y /= other || 1;
			}
		} else {
			throw new Error(`Cannot divide by "${other}"`);
		}
		return this;
	}
	divided (other, otherOther = null) {
		return this.copy().divide(other, otherOther);
	}

	add (other, otherOther = null) {
		if (other instanceof Vector2) {
			this.x += other.x;
			this.y += other.y;
		} else if (other.constructor.name === "Number") {
			if (otherOther !== null) {
				this.x += other;
				this.y += otherOther;
			} else {
				this.x += other;
				this.y += other;
			}
		} else {
			throw new Error(`Cannot add "${other}"`);
		}
		return this;
	}
	added (other, otherOther = null) {
		return this.copy().add(other, otherOther);
	}
}