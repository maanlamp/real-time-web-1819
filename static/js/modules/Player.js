import Vector2 from "./Vector2.js";

export default class Player {
	constructor (name, x, y, direction, sprite) {
		this.name = name;
		this.position = new Vector2(x, y);
		this.direction = direction;
		this.sprite = sprite;
		this.health = 1000;
		this.scale = 1;
	}
}