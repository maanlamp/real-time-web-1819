"use strict";
export function fpsFromDeltatime (deltatime) {
	return Math.floor(1 / (deltatime || 1));
}