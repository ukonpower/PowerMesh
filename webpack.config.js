module.exports = {
    mode: 'development',
	devtool: 'inline-source-map',
    entry: {
		main: './src/index.ts'
    },
    output: {
		filename: 'powermesh' + '.js',
		library: 'PowerMesh',
		libraryTarget: 'umd',
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
		'ore-three-ts': {
			commonjs: 'ore-three-ts',
			commonjs2: 'ore-three-ts',
			amd: 'ore-three-ts',
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