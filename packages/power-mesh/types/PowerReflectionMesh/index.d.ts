import * as THREE from 'three';
import { PowerMesh } from '../PowerMesh';
export declare class PowerReflectionMesh extends PowerMesh {
    private renderTargets;
    private mipmapGeo;
    private mipmapPP;
    private lookAtPosition;
    private rotationMatrix;
    private target;
    private view;
    private virtualCamera;
    private reflectorPlane;
    private normal;
    private reflectorWorldPosition;
    private cameraWorldPosition;
    private clipPlane;
    private clipBias;
    private q;
    private textureMatrix;
    constructor(geometry: THREE.BufferGeometry, materialOption?: THREE.ShaderMaterialParameters, override?: boolean);
    constructor(mesh: THREE.Mesh, materialOption?: THREE.ShaderMaterialParameters, override?: boolean);
    private resize;
}
