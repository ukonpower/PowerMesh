import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import powerVert from './shaders/power.vs';
import powerFrag from './shaders/power.fs';

export type PowerMeshMaterialType = 'color' | 'depth' | 'coc'
export class PowerMesh extends THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial> {

	protected commonUniforms: ORE.Uniforms;

	// envMap
	protected envMapResolution: number;
	protected envMapRenderTarget: THREE.WebGLCubeRenderTarget;
	protected envMapCamera: THREE.CubeCamera;
	protected envMapUpdate: boolean;
	protected envMapSrc: THREE.CubeTexture | THREE.Texture | null;

	constructor( geometry: THREE.BufferGeometry, materialOption?: THREE.ShaderMaterialParameters, override?: boolean );

	constructor( mesh: THREE.Mesh, materialOption?: THREE.ShaderMaterialParameters, override?: boolean );

	constructor( geoMesh: THREE.BufferGeometry | THREE.Mesh, materialOption?: THREE.ShaderMaterialParameters, override?: boolean ) {

		materialOption = materialOption || {};

		let uni = ORE.UniformsLib.mergeUniforms( materialOption.uniforms || {}, {
			envMap: {
				value: null
			},
			envMapIntensity: {
				value: null
			},
			iblIntensity: {
				value: null
			},
			maxLodLevel: {
				value: 0
			},
			shadowLightModelViewMatrix: {
				value: new THREE.Matrix4()
			},
			shadowLightProjectionMatrix: {
				value: new THREE.Matrix4()
			},
			shadowLightDirection: {
				value: new THREE.Vector3()
			},
			shadowLightCameraClip: {
				value: new THREE.Vector2()
			},
			shadowMap: {
				value: null
			},
			shadowMapSize: {
				value: new THREE.Vector2()
			},
			shadowMapResolution: {
				value: new THREE.Vector2()
			},
			shadowLightSize: {
				value: 1.0
			},
			cameraNear: {
				value: 0.01
			},
			cameraFar: {
				value: 1000.0
			},
			// default props
			color: {
				value: new THREE.Color( 1.0, 1.0, 1.0 )
			},
			metalness: {
				value: 0
			},
			roughness: {
				value: 0.5
			},
			opacity: {
				value: 1
			},
			emission: {
				value: new THREE.Color( 0.0, 0.0, 0.0 )
			}
		} );

		uni = ORE.UniformsLib.mergeUniforms( uni, THREE.UniformsUtils.clone( THREE.UniformsLib.lights ) );

		/*-------------------------------
			Geometry
		-------------------------------*/

		let geo: THREE.BufferGeometry;

		if ( 'isBufferGeometry' in geoMesh ) {

			geo = geoMesh;

		} else if ( 'isMesh' in geoMesh ) {

			geo = geoMesh.geometry;

			let mat = ( geoMesh.material as THREE.MeshStandardMaterial );

			if ( mat.isMeshStandardMaterial ) {

				if ( mat.map ) {

					uni.map = {
						value: mat.map
					};

				} else if ( mat.color ) {

					uni.color.value.copy( mat.color );

				}

				if ( mat.roughnessMap ) {

					uni.roughnessMap = {
						value: mat.roughnessMap
					};

				} else {

					uni.roughness.value = mat.roughness;

				}

				if ( mat.alphaMap ) {

					uni.alphaMap = {
						value: mat.alphaMap
					};

				} else {

					uni.opacity.value = mat.opacity;

				}

				if ( mat.metalnessMap ) {

					console.log( mat.metalnessMap );

					uni.metalnessMap = {
						value: mat.metalnessMap
					};

				} else {

					uni.metalness.value = mat.metalness;

				}

				if ( mat.normalMap ) {

					uni.normalMap = {
						value: mat.normalMap
					};

				}

				if ( mat.emissiveMap ) {

					uni.emissionMap = {
						value: mat.emissiveMap
					};

				} else {

					uni.emission.value.copy( mat.emissive );

				}

			}

		} else {

			geo = new THREE.BufferGeometry();

		}

		// tangents

		if ( ! geo.getAttribute( 'tangent' ) ) {

			if (
				geo.getIndex() &&
				geo.getAttribute( 'position' ) &&
				geo.getAttribute( 'normal' ) &&
				geo.getAttribute( 'uv' )
			) {

				geo.computeTangents();

			}

		}

		/*-------------------------------
			Material
		-------------------------------*/

		materialOption.uniforms = uni;

		let mat = new THREE.ShaderMaterial( {
			vertexShader: powerVert,
			fragmentShader: powerFrag,
			lights: true,
			transparent: true,
			side: THREE.DoubleSide,
			extensions: {
				derivatives: true,
			},
			defines: {
			},
			...materialOption
		} );

		if ( uni.map ) {

			mat.defines.USE_MAP = '';

		}

		if ( uni.roughnessMap ) {

			mat.defines.USE_ROUGHNESS_MAP = '';

		}

		if ( uni.metalnessMap ) {

			mat.defines.USE_METALNESS_MAP = '';

		}

		if ( uni.alphaMap ) {

			mat.defines.USE_ALPHA_MAP = '';

		}

		if ( uni.normalMap ) {

			mat.defines.USE_NORMAL_MAP = '';

		}

		if ( uni.emissionMap ) {

			mat.defines.USE_EMISSION_MAP = '';

		}

		super( geo, mat );

		this.name = geoMesh.name;

		this.userData.colorMat = this.material;

		this.customDepthMaterial = new THREE.ShaderMaterial( {
			vertexShader: powerVert,
			fragmentShader: powerFrag,
			side: THREE.DoubleSide,
			lights: true,
			extensions: {
				derivatives: true
			},
			...materialOption,
			defines: {
				...mat.defines,
				'DEPTH': "",
			},
		} );

		this.commonUniforms = uni;

		/*-------------------------------
			Transform
		-------------------------------*/

		if ( 'isMesh' in geoMesh && override ) {

			geoMesh.geometry.dispose();

			let childArray = geoMesh.children.slice();

			childArray.forEach( child => {

				this.add( child );

			} );

			this.position.copy( geoMesh.position );
			this.rotation.copy( geoMesh.rotation );
			this.scale.copy( geoMesh.scale );

			let parent = geoMesh.parent;

			if ( parent ) {

				parent.add( this );

				parent.remove( geoMesh );

			}

		}

		/*-------------------------------
			EnvMap
		-------------------------------*/

		this.envMapSrc = null;
		this.envMapUpdate = false;
		this.envMapResolution = 256;

		this.envMapRenderTarget = new THREE.WebGLCubeRenderTarget( this.envMapResolution, {
			format: THREE.RGBAFormat,
			generateMipmaps: true,
			magFilter: THREE.LinearFilter,
			minFilter: THREE.LinearFilter
		} );

		this.envMapCamera = new THREE.CubeCamera( 0.001, 1000, this.envMapRenderTarget );
		this.getWorldPosition( this.envMapCamera.position );

		this.onBeforeRender = ( renderer, scene, camera ) => {

			this.dispatchEvent( {
				type: 'beforeRender',
				renderer,
				scene,
				camera
			} );

		};

		this.addEventListener( 'beforeRender', ( e: THREE.Event ) => {

			let renderer = e.renderer;
			let scene = e.scene;
			let camera = e.camera;

			/*-------------------------------
				EnvMap
			-------------------------------*/

			if ( this.envMapUpdate ) {

				let envMapRT: THREE.WebGLRenderTarget | null = null;

				let pmremGenerator = new THREE.PMREMGenerator( renderer );
				pmremGenerator.compileEquirectangularShader();

				if ( this.envMapSrc ) {

					if ( 'isCubeTexture' in this.envMapSrc ) {

						envMapRT = pmremGenerator.fromCubemap( this.envMapSrc );

					} else {

						envMapRT = pmremGenerator.fromEquirectangular( this.envMapSrc );

					}

				} else {

					this.visible = false;

					this.envMapCamera.update( renderer, scene );
					envMapRT = pmremGenerator.fromCubemap( this.envMapRenderTarget.texture );

					this.visible = true;

				}

				// envmap
				let envMapResolution = envMapRT.height;

				const maxMip = Math.round( Math.log2( envMapResolution ) ) - 2;
				const texelHeight = 1.0 / envMapResolution;
				const texelWidth = 1.0 / ( 3 * Math.max( Math.pow( 2, maxMip ), 7 * 16 ) );

				mat.defines[ 'USE_ENV_MAP' ] = '';
				mat.defines[ 'CUBEUV_MAX_MIP' ] = maxMip + '.0';
				mat.defines[ 'CUBEUV_TEXEL_WIDTH' ] = texelWidth + '';
				mat.defines[ 'CUBEUV_TEXEL_HEIGHT' ] = texelHeight + '';

				this.commonUniforms.envMap.value = envMapRT.texture;
				this.envMapUpdate = false;

			}

			/*-------------------------------
				Depth
			-------------------------------*/

			if ( camera.userData.depthCamera ) {

				this.material = this.userData.depthMat;
				this.commonUniforms.cameraNear.value = camera.near;
				this.commonUniforms.cameraFar.value = camera.far;

				if ( ! this.material ) {

					this.visible = false;

				}

			}

		} );

		/*-------------------------------
			Dispose
		-------------------------------*/

		const onDispose = () => {

			this.envMapRenderTarget.dispose();
			this.geometry.dispose();
			this.material.dispose();

			this.removeEventListener( 'dispose', onDispose );

		};

		this.addEventListener( 'dispose', onDispose );

	}

	/*-------------------------------
		EnvMap / IBL
	-------------------------------*/

	public updateEnvMap( envMap: THREE.CubeTexture | THREE.Texture | null = null ) {

		this.envMapSrc = envMap;
		this.envMapUpdate = true;

		if ( this.commonUniforms.envMapIntensity.value == null ) {

			this.commonUniforms.envMapIntensity.value = 1;

		}

		if ( this.commonUniforms.iblIntensity.value == null ) {

			this.commonUniforms.iblIntensity.value = 1;

		}

	}

	public set envMapIntensity( value: number ) {

		this.commonUniforms.envMapIntensity.value = value;

	}

	public set iblIntensity( value: number ) {

		this.commonUniforms.iblIntensity.value = value;

	}

	public dispose() {

		this.dispatchEvent( { type: 'dispsoe' } );

	}

	public get isPowerMesh() {

		return true;

	}

}
