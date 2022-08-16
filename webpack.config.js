const path = require( 'path' );

module.exports = {
	entry: './src/scrollAndMouse.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'scrollAndMouse.js'
	}
};