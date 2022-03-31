import * as THREE from 'three';
import * as ORE from 'ore-three-ts';
import { PowerMesh } from '../../PowerMesh';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class World extends THREE.Object3D {

	private commonUniforms: ORE.Uniforms;
	private scene: THREE.Scene;
	private gltfLoader: GLTFLoader;
	private model: THREE.Group | null = null;

	constructor( parentUniforms: ORE.Uniforms, scene: THREE.Scene ) {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.scene = scene;

		/*-------------------------------
			Light
		-------------------------------*/

		let light = new THREE.DirectionalLight();
		light.position.set( 1, 1, 1 );
		this.add( light );

		/*-------------------------------
			glTF Loader
		-------------------------------*/

		this.gltfLoader = new GLTFLoader();

	}

	public loadGLTF( gltfSrc: string ) {

		this.gltfLoader.load( './assets/gltf/2.0/' + gltfSrc, ( gltf ) => {

			if ( this.model ) {

				this.disposeGLTF( this.model );

			}

			this.model = gltf.scene;

			this.add( gltf.scene );

		} );

	}

	private disposeGLTF( gltf: THREE.Group ) {

		gltf.traverse( item => {

			let mesh = item as THREE.Mesh;

			if ( mesh.isMesh ) {

				mesh.geometry.dispose();

				let mat = mesh.material as THREE.ShaderMaterial;

				if ( mat.isShaderMaterial ) [

					mat.dispose()

				];

			}

		} );

		this.remove( gltf );

	}

}
