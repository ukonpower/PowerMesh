import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import { GlobalManager } from './GlobalManager';
import { RenderPipeline } from './RenderPipeline';
import { World } from './World';
import { Pane } from 'tweakpane';

import CameraControls from 'camera-controls';
CameraControls.install( { THREE: THREE } );

export class MainScene extends ORE.BaseLayer {

	private gManager?: GlobalManager;
	private renderPipeline?: RenderPipeline;

	//  world
	private world?: World;

	// cameraControls
	private cameraControls?: CameraControls;

	// TweakPane
	private pane: Pane;
	private params = {
		gltf: '',
		environment: ''
	};

	constructor() {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {} );

		/*-------------------------------
			TweakPane
		-------------------------------*/

		this.pane = new Pane();

		let gltfInput = this.pane.addInput( this.params, 'gltf', { options: {
			DamagedHelmet: './assets/gltf/2.0/DamagedHelmet/gltf-Binary/DamagedHelmet.glb',
			FlightHelmet: './assets/gltf/2.0/FlightHelmet/glTF/FlightHelmet.gltf',
			MetalRoughSpheresNoTextures: './assets/gltf/2.0/MetalRoughSpheresNoTextures/gltf-Binary/MetalRoughSpheresNoTextures.glb',
			MetalRoughSpheres: './assets/gltf/2.0/MetalRoughSpheres/gltf-Binary/MetalRoughSpheres.glb',
			NormalTangentTest: './assets/gltf/2.0/NormalTangentTest/gltf-Binary/NormalTangentTest.glb',
			EnvironmentTest: './assets/gltf/2.0/EnvironmentTest/glTF/EnvironmentTest.gltf',
		} } );

		gltfInput.on( 'change', ( e ) => {

			this.loadGltf( e.value );

		} );

		let envMapInput = this.pane.addInput( this.params, 'environment', { options: {
			green_point_park: 'green_point_park',
			solitude_night: 'solitude_night',
			studio_small: 'studio_small',
		} } );

		envMapInput.on( 'change', ( e ) =>{

			this.loadEnvMap( e.value );

		} );

	}

	onBind( info: ORE.LayerInfo ) {

		super.onBind( info );

		this.gManager = new GlobalManager();

		this.initScene();
		this.onResize();

	}

	private initScene() {

		if ( this.renderer ) {

			/*-------------------------------
				RenderPipeline
			-------------------------------*/

			this.renderPipeline = new RenderPipeline( this.renderer, this.commonUniforms );

			/*-------------------------------
				CameraControls
			-------------------------------*/

			this.camera.position.set( 2, 1, 2 );

			this.cameraControls = new CameraControls( this.camera, this.renderer.domElement );
			this.cameraControls.dollySpeed = 0.1;

		}

		/*-------------------------------
			World
		-------------------------------*/

		this.world = new World( this.commonUniforms, this.scene );
		this.scene.add( this.world );

		this.loadGltf( this.params.gltf );
		this.loadEnvMap( this.params.environment );

		this.world.addEventListener( 'updateModel', () => {

			if ( this.world && this.cameraControls ) {

				this.world.fit( this.camera, this.cameraControls );

			}

		} );

	}

	private loadGltf( gltfSrc: string ) {

		if ( this.world ) {

			this.world.loadGLTF( gltfSrc );

		}

	}

	private loadEnvMap( envMapSrc: string ) {

		if ( this.world ) {

			this.world.loadEnvMap( envMapSrc );

		}

	}

	public animate( deltaTime: number ) {

		if ( this.cameraControls ) {

			this.cameraControls.update( deltaTime );

		}

		if ( this.renderPipeline ) {

			this.renderPipeline.render( this.scene, this.camera );

		}

	}

	public onResize() {

		super.onResize();

		if ( this.renderPipeline ) {

			this.renderPipeline.resize( this.info.size.canvasPixelSize );

		}

	}

	public onHover( args: ORE.TouchEventArgs ) {

	}

	public onTouchStart( args: ORE.TouchEventArgs ) {

	}

	public onTouchMove( args: ORE.TouchEventArgs ) {

	}

	public onTouchEnd( args: ORE.TouchEventArgs ) {

	}

}
