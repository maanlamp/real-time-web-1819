"use strict";
import Canvas from "./Canvas.js";

export function loadImage (url) {
	return new Promise((resolve, reject) => {
		const image = new Image();

		image.addEventListener("error", () => {
			reject(new Error(`"${url}" is not a proper image url.`));
		});
		image.addEventListener("load", () => {
			resolve(image);
		});

		image.src = url;
	});
}

export async function loadJSON (url) {
	return (await fetch(url)).json();
}

export async function loadImageData (url) {
	const image = await loadImage(url);
	const {width, height} = image;
	const canvas = new Canvas({width, height});
	canvas.drawImage(image);
	return canvas.getImageData();
}