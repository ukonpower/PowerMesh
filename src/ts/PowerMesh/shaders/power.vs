attribute vec4 tangent;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vViewPos;
varying vec3 vWorldPos;
varying vec2 vHighPrecisionZW;

varying vec3 vShadowMapCoord;

uniform mat4 shadowLightModelViewMatrix;
uniform mat4 shadowLightProjectionMatrix;

void main( void ) {

	vec3 pos = position;
	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	
	vec3 transformedNormal = normalMatrix * normal;
	vec4 flipedTangent = tangent;
	flipedTangent.w *= -1.0;

	#ifdef FLIP_SIDED
		transformedNormal *= -1.0;
		flipedTangent *= -1.0;
	#endif
	
	vNormal = normalize( transformedNormal );
	vTangent = normalize( ( modelViewMatrix * vec4( flipedTangent.xyz, 0.0 ) ).xyz );
	vBitangent = normalize( cross( vNormal, vTangent ) * flipedTangent.w );
	vViewPos = -mvPosition.xyz;
	vWorldPos = vec4( modelMatrix * vec4( pos, 1.0 ) ).xyz;
	vHighPrecisionZW = gl_Position.zw;
	
	vec4 shadowModelPos = shadowLightModelViewMatrix * vec4( pos + normal * 0.01, 1.0 );
	vec4 shadowScreenPos = shadowLightProjectionMatrix * shadowModelPos;
	vShadowMapCoord = shadowScreenPos.xyz / shadowScreenPos.w * 0.5 + 0.5;
	vShadowMapCoord.z = -shadowModelPos.z;

}