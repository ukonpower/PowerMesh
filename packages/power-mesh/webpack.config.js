const path = require('path');

module.exports = {
    mode: 'development',
	devtool: 'inline-source-map',
    entry: {
		main: './src/index.ts'
    },
    output: {
		path: path.resolve(__dirname, "build"),
		filename: 'power-mesh' + '.js',
		library: 'PowerMesh',
		libraryTarget: 'umd',
		globalObject: 'this',
    },
    module: {
        rules: [{
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            },
            {
				test: /\.(vs|fs|glsl)$/,
				exclude: /node_modules/,
				use: [
					'raw-loader',
					{
						loader: 'glslify-loader',
						options: {
							transform: [
								['glslify-hex'],
								['glslify-import']
							],
							basedir: './src/glsl'
						}
					}
				]
			}
        ]
    },
	externals: {
		'three': {
			commonjs: 'three',
			commonjs2: 'three',
			amd: 'three',
			root: 'THREE'
		},
		'ore-three': {
			commonjs: 'ore-three',
			commonjs2: 'ore-three',
			amd: 'ore-three',
			root: 'ORE'
		}
	},
    resolve: {
        extensions: [".ts", ".js"]
	},
	cache: {
		type: 'filesystem',
		buildDependencies: {
			config: [__filename]
		}
	},
	optimization: {
		innerGraph: true
	}
};