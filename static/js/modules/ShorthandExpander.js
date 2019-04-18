function camelcasify (string) {
	return string.replace(/-([a-z])/g, match => match[1].toUpperCase());
}

export class ShorthandExpander {
	constructor () {
		this.shorthands = new Map();
		this.aliases = new Map();
	}

	static expandShorthands (rule) {
		//typeof rule = object
		return rule;
	}
	static replaceAliases (rule) {
		//typeof rule = object
		return rule;
	}

	shorthand (pattern, replacements) {
		this.shorthands.set(pattern, replacements);

		return this;
	}

	alias (pattern, replacement) {
		this.aliases.set(pattern, replacement);

		return this;
	}

	process (css) {
		const rules = css
			.split(/;?\r?\n/)
			.filter(line => !/^\s*$/.test(line))
			.map(line => line
				.split(/:/)
				.map(str => str.trim()))
			.map(([property, values]) => ({
				property,
				values: values.split(/ /)}))
			.map(ShorthandExpander.expandShorthands)
			.map(ShorthandExpander.replaceAliases);

		//ONE LINER PLS
		return [[]];
	}
}

export const canvasStyleExpander = (new ShorthandExpander())
	.alias("true", true)
	.alias("false", false)
	.alias("colour", "color")
	.alias("fill", "fillStyle")
	.alias("stroke", "strokeStyle")
	.alias("alpha", "globalAlpha")
	.alias("anti-aliasing", "imageSmoothing")
	.shorthand("global", {
		globalAlpha: 1,
		globalCompositeOperation: ["source-over", "source-in", "source-out", "source-atop", "destination-over", "destination-in", "destination-out", "destination-atop", "lighter", "copy", "xor", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"]})
	.shorthand("imageSmoothing", {
		imageSmoothingEnabled: ["true", "false"],
		imageSmoothingQuality: ["high", "medium", "low"]})
	.shorthand("line", {
		lineWidth: 2,
		lineJoin: ["bevel", "round", "miter"],
		lineCap: ["butt", "round", "square"],
		lineDashOffset: 0,
		miterLimit: 10})
	.shorthand("shadow", {
		shadowOffsetX: 0,
		shadowOffsetY: 0,
		shadowBlur: 5,
		shadowColor: "black"})
	.shorthand("text-align", {
		textAlign: ["start", "end", "left", "right", "center"],
		textBaseline: ["alphabetic", "top", "hanging", "middle", "ideographic", "bottom"]});