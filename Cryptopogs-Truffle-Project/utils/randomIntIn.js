module.exports = function randomIntIn(from, to) {
	return Math.floor(Math.random() * Math.floor(to)) + Math.floor(from);
}