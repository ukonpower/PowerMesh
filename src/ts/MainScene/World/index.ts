import * as THREE from 'three';
import * as ORE from 'ore-three-ts';
import { PowerMesh } from '../../PowerMesh';

export class World extends THREE.Object3D {

	private commonUniforms: ORE.Uniforms;

	scene: THREE.Scene;

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
			Model
		-------------------------------*/

		let mesh = new PowerMesh( new THREE.SphereBufferGeometry() );
		this.add( mesh );

	}

}
