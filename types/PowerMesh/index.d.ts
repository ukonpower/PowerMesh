import * as THREE from 'three';
import * as ORE from 'ore-three-ts';
export declare type PowerMeshMaterialType = 'color' | 'depth' | 'coc';
export declare class PowerMesh extends THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial> {
    protected commonUniforms: ORE.Uniforms;
    protected envMapResolution: number;
    protected envMapRenderTarget: THREE.WebGLCubeRenderTarget;
    protected envMapCamera: THREE.CubeCamera;
    protected envMapUpdate: boolean;
    protected envMapSrc: THREE.CubeTexture | THREE.Texture | null;
    constructor(geometry: THREE.BufferGeometry, materialOption?: THREE.ShaderMaterialParameters, override?: boolean);
    constructor(mesh: THREE.Mesh, materialOption?: THREE.ShaderMaterialParameters, override?: boolean);
    updateEnvMap(envMap?: THREE.CubeTexture | THREE.Texture | null): void;
    set envMapIntensity(value: number);
    set iblIntensity(value: number);
    dispose(): void;
    get isPowerMesh(): boolean;
}
