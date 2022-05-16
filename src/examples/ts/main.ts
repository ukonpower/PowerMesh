import * as ORE from 'ore-three';
import { MainScene } from './MainScene';

import { GlobalManager } from './MainScene/GlobalManager';
import { AssetManager } from './MainScene/GlobalManager/AssetManager';

declare global {
	interface Window {
		powerMesh: {
			gManager: GlobalManager;
			assetManager: AssetManager;
			isIE: boolean;
			isSP: boolean;
			mainScene: MainScene;
		}
	}
}


class APP {

	private canvas: HTMLCanvasElement | null;
	private controller: ORE.Controller;

	constructor() {

		window.powerMesh = {} as any;

		/*------------------------
			checkUA
		------------------------*/
		var ua = navigator.userAgent;
		window.powerMesh.isSP = ( ua.indexOf( 'iPhone' ) > 0 || ua.indexOf( 'iPod' ) > 0 || ua.indexOf( 'Android' ) > 0 && ua.indexOf( 'Mobile' ) > 0 || ua.indexOf( 'iPad' ) > 0 || ua.indexOf( 'Android' ) > 0 || ua.indexOf( 'macintosh' ) > 0 );
		window.powerMesh.isSP = window.powerMesh.isSP || navigator.platform == "iPad" || ( navigator.platform == "MacIntel" && navigator.userAgent.indexOf( "Safari" ) != - 1 && navigator.userAgent.indexOf( "Chrome" ) == - 1 && ( navigator as any ).standalone !== undefined );

		/*------------------------
			init ORE
		------------------------*/
		this.canvas = document.querySelector( "#canvas" );

		this.controller = new ORE.Controller();
		this.controller.addLayer( new MainScene(), {
			 name: 'Main',
			 canvas: this.canvas || undefined
		} );

	}

}

window.addEventListener( 'load', ()=>{

	let app = new APP();

} );
