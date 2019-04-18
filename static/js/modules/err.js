"use strict";
function parseTemplateLiteral (string, ...placeholders) {
	return Array()
		.concat(string)
		.map((chunk, i) => {
			return (placeholders[i] !== undefined)
				? chunk + placeholders[i]
				: chunk
		})
		.join("")
		.trim();
}

export default function err (str, placeholders, skip = 4) {
	const raw = parseTemplateLiteral(str, placeholders);
	const error = new Error(raw);
	const stack = error.stack
		.split(/\n/)
		.filter((_, i) => i === 0 || i >= skip)
		.join("\n");

	return stack;
}