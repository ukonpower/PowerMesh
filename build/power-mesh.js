(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("three"), require("ore-three-ts"));
	else if(typeof define === 'function' && define.amd)
		define(["three", "ore-three-ts"], factory);
	else if(typeof exports === 'object')
		exports["PowerMesh"] = factory(require("three"), require("ore-three-ts"));
	else
		root["PowerMesh"] = factory(root["THREE"], root["ORE"]);
})(self, function(__WEBPACK_EXTERNAL_MODULE_three__, __WEBPACK_EXTERNAL_MODULE_ore_three_ts__) {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/PowerMesh/shaders/power.fs":
/*!****************************************!*\
  !*** ./src/PowerMesh/shaders/power.fs ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("#define GLSLIFY 1\nvarying vec2 vUv;\nvarying vec3 vTangent;\nvarying vec3 vBitangent;\n\n/*-------------------------------\n\tRequire\n-------------------------------*/\n\n#include <packing>\n\nvec2 packing16( float value ) { \n\n\tfloat v1 = value * 255.0;\n\tfloat r = floor(v1);\n\n\tfloat v2 = ( v1 - r ) * 255.0;\n\tfloat g = floor( v2 );\n\n\treturn vec2( r, g ) / 255.0;\n\n}\n\n/*-------------------------------\n\tRequiers\n-------------------------------*/\n\n#include <common>\n\nfloat random(vec2 p){\n\treturn fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\n/*-------------------------------\n\tMaterial Uniforms\n-------------------------------*/\n\nuniform float time;\n\n/*-------------------------------\n\tTextures\n-------------------------------*/\n\n#ifdef USE_MAP\n\n\tuniform sampler2D map;\n\n#else\n\n\tuniform vec3 color;\n\n#endif\n\n#ifdef USE_NORMAL_MAP\n\n\tuniform sampler2D normalMap;\n\n#endif\n\n#ifdef USE_ROUGHNESS_MAP\n\n\tuniform sampler2D roughnessMap;\n\n#else\n\n\tuniform float roughness;\n\n#endif\n\n#ifdef USE_ALPHA_MAP\n\n\tuniform sampler2D alphaMap;\n\n#else\n\n\tuniform float opacity;\n\t\n#endif\n\n#ifdef USE_METALNESS_MAP\n\n\tuniform sampler2D metalnessMap;\n\n#else\n\n\tuniform float metalness;\n\n#endif\n#ifdef USE_EMISSION_MAP\n\n\tuniform sampler2D emissionMap;\n\n#else\n\n\tuniform vec3 emission;\n\n#endif\n\n#ifdef IS_REFLECTIONPLANE\n\n\tuniform sampler2D reflectionTex;\n\tuniform vec2 renderResolution;\n\tuniform vec2 mipMapResolution;\n\t\n#endif\n\n/*-------------------------------\n\tTypes\n-------------------------------*/\n\nstruct Geometry {\n\tvec3 pos;\n\tvec3 posWorld;\n\tvec3 viewDir;\n\tvec3 viewDirWorld;\n\tvec3 normal;\n\tvec3 normalWorld;\n};\n\nstruct Light {\n\tvec3 direction;\n\tvec3 color;\n};\n\nstruct Material {\n\tvec3 albedo;\n\tvec3 diffuseColor;\n\tvec3 specularColor;\n\tfloat metalness;\n\tfloat roughness;\n\tfloat opacity;\n};\n\n/*-------------------------------\n\tLights\n-------------------------------*/\n\n#if NUM_DIR_LIGHTS > 0\n\n\tstruct DirectionalLight {\n\t\tvec3 direction;\n\t\tvec3 color;\n\t};\n\n\tuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n\n#endif\n\n#if NUM_POINT_LIGHTS > 0\n\n\tstruct PointLight {\n\t\tvec3 position;\n\t\tvec3 color;\n\t\tfloat distance;\n\t\tfloat decay;\n\t};\n\n\tuniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n\n#endif\n\n/*-------------------------------\n\tEnvMap\n-------------------------------*/\n\n#ifdef USE_ENV_MAP\n\n\tuniform sampler2D envMap;\n\tuniform float envMapIntensity;\n\tuniform float iblIntensity;\n\tuniform float maxLodLevel;\n\n\t#define ENVMAP_TYPE_CUBE_UV\n\t#include <cube_uv_reflection_fragment>\n\n#endif\n\n/*-------------------------------\n\tReflection\n-------------------------------*/\n\n#define REF_MIPMAP_LEVEL 8.0\n\n#ifdef IS_REFLECTIONPLANE\n\n\tvec2 getRefMipmapUV( vec2 uv, float level ) {\n\n\t\tvec2 ruv = uv;\n\n\t\tif( level > 0.0 ) {\n\n\t\t\truv.x *= 1.0 / ( 3.0 * ( pow( 2.0, level ) / 2.0 ) );\n\t\t\truv.y *= 1.0 / ( pow( 2.0, level ) );\n\t\t\truv.y += 1.0 / ( pow( 2.0, level ) );\n\t\t\truv.x += 1.0 / 1.5;\n\t\t\n\t\t} else {\n\n\t\t\truv.x /= 1.5;\n\t\t\t\n\t\t}\n\n\t\treturn ruv;\n\n\t}\n\t\n\tvec4 cubic(float v) {\n\t\tvec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;\n\t\tvec4 s = n * n * n;\n\t\tfloat x = s.x;\n\t\tfloat y = s.y - 4.0 * s.x;\n\t\tfloat z = s.z - 4.0 * s.y + 6.0 * s.x;\n\t\tfloat w = 6.0 - x - y - z;\n\t\treturn vec4(x, y, z, w);\n\t}\n\n\t// https://stackoverflow.com/questions/13501081/efficient-bicubic-filtering-code-in-glsl\n\tvec4 textureBicubic(sampler2D t, vec2 texCoords, vec2 textureSize) {\n\t\tvec2 invTexSize = 1.0 / textureSize;\n\t\ttexCoords = texCoords * textureSize - 0.5;\n\t\tvec2 fxy = fract(texCoords);\n\t\ttexCoords -= fxy;\n\t\tvec4 xcubic = cubic(fxy.x);\n\t\tvec4 ycubic = cubic(fxy.y);\n\t\tvec4 c = texCoords.xxyy + vec2 (-0.5, 1.5).xyxy;\n\t\tvec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);\n\t\tvec4 offset = c + vec4 (xcubic.yw, ycubic.yw) / s;\n\t\toffset *= invTexSize.xxyy;\n\t\tvec4 sample0 = texture2D(t, offset.xz);\n\t\tvec4 sample1 = texture2D(t, offset.yz);\n\t\tvec4 sample2 = texture2D(t, offset.xw);\n\t\tvec4 sample3 = texture2D(t, offset.yw);\n\t\tfloat sx = s.x / (s.x + s.y);\n\t\tfloat sy = s.z / (s.z + s.w);\n\t\treturn mix(\n\t\tmix(sample3, sample2, sx), mix(sample1, sample0, sx), sy);\n\t}\n\n#endif\n\n/*-------------------------------\n\tShadow\n-------------------------------*/\n\n#ifdef DEPTH\n\n\tvarying vec2 vHighPrecisionZW;\n\tuniform float cameraNear;\n\tuniform float cameraFar;\n\n#endif\n\n#ifdef USE_SHADOWMAP\n\n#if NUM_DIR_LIGHT_SHADOWS > 0\n\n\t\tuniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];\n\t\tvarying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];\n\n\t\tstruct DirectionalLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t};\n\n\t\tuniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];\n\n\t#endif\n\n\t#define SHADOW_SAMPLE_COUNT 4\n\n\tvec2 poissonDisk[ SHADOW_SAMPLE_COUNT ];\n\n\tvoid initPoissonDisk( float seed ) {\n\n\t\tfloat r = 0.1;\n\t\tfloat rStep = (1.0 - r) / float( SHADOW_SAMPLE_COUNT );\n\n\t\tfloat ang = random( gl_FragCoord.xy * 0.01 + sin( time ) ) * PI2 * 1.0;\n\t\tfloat angStep = ( ( PI2 * 11.0 ) / float( SHADOW_SAMPLE_COUNT ) );\n\t\t\n\t\tfor( int i = 0; i < SHADOW_SAMPLE_COUNT; i++ ) {\n\n\t\t\tpoissonDisk[ i ] = vec2(\n\t\t\t\tsin( ang ),\n\t\t\t\tcos( ang )\n\t\t\t) * pow( r, 0.75 );\n\n\t\t\tr += rStep;\n\t\t\tang += angStep;\n\t\t}\n\t\t\n\t}\n\n\tvec2 compairShadowMapDepth( sampler2D shadowMap, vec2 shadowMapUV, float depth ) {\n\n\t\tif( shadowMapUV.x < 0.0 || shadowMapUV.x > 1.0 || shadowMapUV.y < 0.0 || shadowMapUV.y > 1.0 ) {\n\n\t\t\treturn vec2( 1.0, 0.0 );\n\n\t\t}\n\n\t\tfloat shadowMapDepth = unpackRGBAToDepth( texture2D( shadowMap, shadowMapUV ) );\n\n\t\tif( 0.0 >= shadowMapDepth || shadowMapDepth >= 1.0 ) {\n\n\t\t\treturn vec2( 1.0, 0.0 );\n\n\t\t}\n\t\t\n\t\tfloat shadow = depth <= shadowMapDepth ? 1.0 : 0.0;\n\n\t\treturn vec2( shadow, shadowMapDepth );\n\t\t\n\t}\n\n\tfloat shadowMapPCF( sampler2D shadowMap, vec4 shadowMapCoord, vec2 shadowSize ) {\n\n\t\tfloat shadow = 0.0;\n\t\t\n\t\tfor( int i = 0; i < SHADOW_SAMPLE_COUNT; i ++  ) {\n\t\t\t\n\t\t\tvec2 offset = poissonDisk[ i ] * shadowSize; \n\n\t\t\tshadow += compairShadowMapDepth( shadowMap, shadowMapCoord.xy + offset, shadowMapCoord.z ).x;\n\t\t\t\n\t\t}\n\n\t\tshadow /= float( SHADOW_SAMPLE_COUNT );\n\n\t\treturn shadow;\n\n\t}\n\n\tfloat getShadow( sampler2D shadowMap, vec2 shadowMapSize, float bias, vec4 shadowMapCoord ) {\n\t\t\n\t\tshadowMapCoord.xyz /= shadowMapCoord.w;\n\t\tshadowMapCoord.z += bias - 0.0001;\n\n\t\tinitPoissonDisk(time);\n\n\t\tvec2 shadowSize = 1.0 / shadowMapSize;\n\n\t\treturn shadowMapPCF( shadowMap, shadowMapCoord, shadowSize );\n\n\t}\n\n#endif\n\n/*-------------------------------\n\tRE\n-------------------------------*/\n\nvarying vec3 vNormal;\nvarying vec3 vViewNormal;\nvarying vec3 vViewPos;\nvarying vec3 vWorldPos;\n\nfloat ggx( float dNH, float roughness ) {\n\t\n\tfloat a2 = roughness * roughness;\n\ta2 = a2 * a2;\n\tfloat dNH2 = dNH * dNH;\n\n\tif( dNH2 <= 0.0 ) return 0.0;\n\n\treturn a2 / ( PI * pow( dNH2 * ( a2 - 1.0 ) + 1.0, 2.0) );\n\n}\n\nvec3 lambert( vec3 diffuseColor ) {\n\n\treturn diffuseColor / PI;\n\n}\n\nfloat gSchlick( float d, float k ) {\n\n\tif( d == 0.0 ) return 0.0;\n\n\treturn d / ( d * ( 1.0 - k ) + k );\n\t\n}\n\nfloat gSmith( float dNV, float dNL, float roughness ) {\n\n\tfloat k = clamp( roughness * sqrt( 2.0 / PI ), 0.0, 1.0 );\n\n\treturn gSchlick( dNV, k ) * gSchlick( dNL, k );\n\t\n}\n\nfloat fresnel( float d ) {\n\t\n\tfloat f0 = 0.04;\n\n\treturn f0 + ( 1.0 - f0 ) * pow( 1.0 - d, 5.0 );\n\n}\n\nvec3 RE( Geometry geo, Material mat, Light light) {\n\n\tvec3 lightDir = normalize( light.direction );\n\tvec3 halfVec = normalize( geo.viewDir + lightDir );\n\n\tfloat dLH = clamp( dot( lightDir, halfVec ), 0.0, 1.0 );\n\tfloat dNH = clamp( dot( geo.normal, halfVec ), 0.0, 1.0 );\n\tfloat dNV = clamp( dot( geo.normal, geo.viewDir ), 0.0, 1.0 );\n\tfloat dNL = clamp( dot( geo.normal, lightDir), 0.0, 1.0 );\n\n\tvec3 irradiance = light.color * dNL;\n\n\t// diffuse\n\tvec3 diffuse = lambert( mat.diffuseColor ) * irradiance;\n\n\t// specular\n\tfloat D = ggx( dNH, mat.roughness );\n\tfloat G = gSmith( dNV, dNL, mat.roughness );\n\tfloat F = fresnel( dLH );\n\t\n\tvec3 specular = (( D * G * F ) / ( 4.0 * dNL * dNV + 0.0001 ) * mat.specularColor ) * irradiance; \n\n\tvec3 c = vec3( 0.0 );\n\tc += diffuse * ( 1.0 - F ) + specular;\n\n\treturn c;\n\n}\n\n/*-------------------------------\n\tMain\n-------------------------------*/\n\nvoid main( void ) {\n\n\t/*-------------------------------\n\t\tMaterial\n\t-------------------------------*/\n\n\tMaterial mat;\n\n\t#ifdef USE_MAP\n\n\t\tvec4 color = LinearTosRGB( texture2D( map, vUv ) );\n\t\tmat.albedo = color.xyz;\n\n\t#else\n\n\t\tmat.albedo = color.xyz;\n\t\tmat.opacity = 1.0;\n\t\n\t#endif\n\n\t#ifdef USE_ROUGHNESS_MAP\n\n\t\tmat.roughness = texture2D( roughnessMap, vUv ).y;\n\n\t#else\n\n\t\tmat.roughness = roughness;\n\t\n\t#endif\n\n\t#ifdef USE_METALNESS_MAP\n\n\t\tmat.metalness = texture2D( metalnessMap, vUv ).z;\n\n\t#else\n\n\t\tmat.metalness = metalness;\n\t\n\t#endif\n\n\t#ifdef USE_ALPHA_MAP\n\n\t\tmat.opacity = texture2D( alphaMap, vUv ).x;\n\n\t#else\n\n\t\tmat.opacity = opacity;\n\n\t#endif\n\t\n\tif( mat.opacity < 0.5 ) discard;\n\n\tmat.diffuseColor = mix( mat.albedo, vec3( 0.0, 0.0, 0.0 ), mat.metalness );\n\tmat.specularColor = mix( vec3( 1.0, 1.0, 1.0 ), mat.albedo, mat.metalness );\n\n\t// output\n\tvec3 outColor = vec3( 0.0 );\n\tfloat outOpacity = mat.opacity;\n\n\t/*-------------------------------\n\t\tDepth\n\t-------------------------------*/\n\n\t#ifdef DEPTH\n\n\t\tfloat fragCoordZ = 0.5 * vHighPrecisionZW.x / vHighPrecisionZW.y + 0.5;\n\t\tgl_FragColor = packDepthToRGBA( fragCoordZ );\n\t\treturn;\n\t\n\t#endif\n\n\t/*-------------------------------\n\t\tGeometry\n\t-------------------------------*/\n\n\tfloat faceDirection = gl_FrontFacing ? 1.0 : -1.0;\n\n\tGeometry geo;\n\tgeo.pos = -vViewPos;\n\tgeo.posWorld = vWorldPos;\n\tgeo.viewDir = normalize( vViewPos );\n\tgeo.viewDirWorld = normalize( geo.posWorld - cameraPosition );\n\tgeo.normal = normalize( vNormal ) * faceDirection;\n\n\t#ifdef USE_NORMAL_MAP\n\t\t\n\t\tvec3 tangent = normalize( vTangent );\n\t\tvec3 bitangent = normalize( vBitangent );\n\n\t\t#ifdef DOUBLE_SIDED\n\n\t\t\ttangent *= faceDirection;\n\t\t\tbitangent *= faceDirection;\n\t\t\n\t\t#endif\n\t\t\n\t\tmat3 vTBN = mat3( tangent, bitangent, geo.normal );\n\t\t\n\t\tvec3 mapN = texture2D( normalMap, vUv ).xyz;\n\t\tmapN = mapN * 2.0 - 1.0;\n\t\tgeo.normal = normalize( vTBN * mapN );\n\n\t#endif\n\t\n\tgeo.normalWorld = normalize( ( vec4( geo.normal, 0.0 ) * viewMatrix ).xyz );\n\n\t/*-------------------------------\n\t\tLighting\n\t-------------------------------*/\n\t\n\tLight light;\n\n\t#if NUM_DIR_LIGHTS > 0\n\n\t\t#pragma unroll_loop_start\n\t\t\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\n\t\t\t\tlight.direction = directionalLights[ i ].direction;\n\t\t\t\tlight.color = directionalLights[ i ].color;\n\n\t\t\t\tfloat shadow = 1.0;\n\t\t\t\t\n\t\t\t\t#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0\n\n\t\t\t\t\tshadow = getShadow( directionalShadowMap[ i ], directionalLightShadows[ i ].shadowMapSize, directionalLightShadows[ i ].shadowBias, vDirectionalShadowCoord[ i ] );\n\n\t\t\t\t#endif\n\n\t\t\t\toutColor += RE( geo, mat, light ) * shadow;\n\t\t\t\t\n\t\t\t}\n\t\t#pragma unroll_loop_end\n\n\t#endif\n\n\t#if NUM_POINT_LIGHTS > 0\n\n\t\tPointLight pLight;\n\t\tvec3 v;\n\t\tfloat d;\n\t\tfloat attenuation;\n\t\t#pragma unroll_loop_start\n\n\t\t\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\n\t\t\t\tpLight = pointLights[ i ];\n\n\t\t\t\tv = pLight.position - geo.pos;\n\t\t\t\td = length( v );\n\t\t\t\tlight.direction = normalize( v );\n\t\t\n\t\t\t\tlight.color = pLight.color;\n\n\t\t\t\tif( pLight.distance > 0.0 && pLight.decay > 0.0 ) {\n\n\t\t\t\t\tattenuation = pow( clamp( -d / pLight.distance + 1.0, 0.0, 1.0 ), pLight.decay );\n\t\t\t\t\tlight.color *= attenuation;\n\n\t\t\t\t}\n\n\t\t\t\toutColor += RE( geo, mat, light );\n\t\t\t\t\n\t\t\t}\n\t\t\t\n\t\t#pragma unroll_loop_end\n\n\t#endif\n\n\t#if defined( USE_ENV_MAP ) || defined( IS_REFLECTIONPLANE )\n\n\t\tfloat dNV = clamp( dot( geo.normal, geo.viewDir ), 0.0, 1.0 );\n\t\tfloat EF = fresnel( dNV );\n\n\t#endif\n\n\t/*-------------------------------\n\t\tEnvironment Lighting\n\t-------------------------------*/\n\n\t#ifdef USE_ENV_MAP\n\n\t\tvec3 refDir = reflect( geo.viewDirWorld, geo.normalWorld );\n\t\trefDir.x *= -1.0;\n\t\n\t\tvec4 envMapColor = textureCubeUV( envMap, geo.normalWorld, 1.0 ) * iblIntensity * envMapIntensity;\n\t\toutColor += mat.diffuseColor * envMapColor.xyz * ( 1.0 - mat.metalness );\n\n\t#endif\n\n\t/*-------------------------------\n\t\tReflection\n\t-------------------------------*/\n\t\n\t#ifdef IS_REFLECTIONPLANE\n\t\n\t\tvec2 refUV = gl_FragCoord.xy / renderResolution;\n\n\t\trefUV.x += geo.normal.x * 0.5;\n\n\t\tfloat l = (mat.roughness ) * 1.6 * REF_MIPMAP_LEVEL;\n\n\t\tfloat offset1 = floor( l );\n\t\tfloat offset2 = offset1 + 1.0;\n\t\tfloat blend = fract( l );\n\t\t\n\t\tvec2 ruv1 = getRefMipmapUV( refUV, offset1 );\n\t\tvec2 ruv2 = getRefMipmapUV( refUV, offset2 );\n\n\t\tvec3 ref1 = textureBicubic( reflectionTex, ruv1, mipMapResolution ).xyz;\n\t\tvec3 ref2 = textureBicubic( reflectionTex, ruv2, mipMapResolution ).xyz;\n\n\t\tvec3 ref = mat.specularColor * mix( ref1, ref2, blend );\n\n\t\toutColor = mix(\n\t\t\toutColor + ref * mat.metalness,\n\t\t\tref,\n\t\t\tEF\n\t\t);\n\n\t#elif defined( USE_ENV_MAP )\n\t\n\t\tvec3 env = mat.specularColor * textureCubeUV( envMap, refDir, mat.roughness ).xyz * envMapIntensity;\n\t\n\t\toutColor = mix(\n\t\t\toutColor + env * mat.metalness,\n\t\t\tenv,\n\t\t\tEF\n\t\t);\n\t\n\t#endif\n\n\t/*-------------------------------\n\t\tEmission\n\t-------------------------------*/\n\n\t#ifdef USE_EMISSION_MAP\n\n\t\toutColor += LinearTosRGB( texture2D( emissionMap, vUv ) ).xyz;\n\t\n\t#else\n\n\t\toutColor += emission;\n\n\t#endif\n\n\tgl_FragColor = vec4( outColor, outOpacity );\n\n}");

/***/ }),

/***/ "./src/PowerMesh/shaders/power.vs":
/*!****************************************!*\
  !*** ./src/PowerMesh/shaders/power.vs ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("#define GLSLIFY 1\nattribute vec4 tangent;\n\nvarying vec2 vUv;\nvarying vec3 vNormal;\nvarying vec3 vViewNormal;\nvarying vec3 vTangent;\nvarying vec3 vBitangent;\nvarying vec3 vViewPos;\nvarying vec3 vWorldPos;\nvarying vec2 vHighPrecisionZW;\n\n/*-------------------------------\n\tShadowMap\n-------------------------------*/\n\n#include <shadowmap_pars_vertex>\n\nvoid main( void ) {\n\n\t/*-------------------------------\n\t\tPosition\n\t-------------------------------*/\n\n\tvec3 pos = position;\n\tvec4 worldPos = modelMatrix * vec4( pos, 1.0 );\n\tvec4 mvPosition = viewMatrix * worldPos;\n\t\n\tgl_Position = projectionMatrix * mvPosition;\n\n\t/*-------------------------------\n\t\tNormal / Tangent\n\t-------------------------------*/\n\n\tvec3 transformedNormal = normalMatrix * normal;\n\tvec4 flipedTangent = tangent;\n\tflipedTangent.w *= -1.0;\n\n\t#ifdef FLIP_SIDED\n\t\ttransformedNormal *= -1.0;\n\t\tflipedTangent *= -1.0;\n\t#endif\n\t\n\tvec3 normal = normalize( transformedNormal );\n\tvec3 tangent = normalize( ( modelViewMatrix * vec4( flipedTangent.xyz, 0.0 ) ).xyz );\n\tvec3 biTangent = normalize( cross( normal, tangent ) * flipedTangent.w );\n\n\t/*-------------------------------\n\t\tShadow\n\t-------------------------------*/\n\t\n\tvec4 shadowWorldPos;\n\t\n\t#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0\n\t\n\t\t#pragma unroll_loop_start\n\t\tfor ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {\n\t\t\t\n\t\t\tshadowWorldPos = worldPos + vec4( vec4( transformedNormal, 0.0 ) * modelMatrix ) * directionalLightShadows[ i ].shadowNormalBias;\n\t\t\tvDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPos;\n\t\t\t\n\t\t}\n\t\t#pragma unroll_loop_end\n\t\t\n\t#endif\n\n\t/*-------------------------------\n\t\tVarying\n\t-------------------------------*/\n\t\n\tvUv = uv;\n\tvNormal = normal;\n\tvTangent = tangent;\n\tvBitangent = biTangent;\n\tvViewPos = -mvPosition.xyz;\n\tvWorldPos = worldPos.xyz;\n\tvHighPrecisionZW = gl_Position.zw;\n\t\n}");

/***/ }),

/***/ "./src/PowerReflectionMesh/shaders/mipmap.fs":
/*!***************************************************!*\
  !*** ./src/PowerReflectionMesh/shaders/mipmap.fs ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("#define GLSLIFY 1\nuniform sampler2D tex;\nvarying vec2 vUv;\n\nfloat clip( vec2 uv ) {\n\tvec2 c = step( abs(uv - 0.5), vec2( 0.5 ) );\n\treturn c.x * c.y;\n}\n\nvoid main( void ) {\n\n\tvec4 col = texture2D( tex, vUv );\n\tgl_FragColor = col;\n\n}");

/***/ }),

/***/ "./src/PowerMesh/index.ts":
/*!********************************!*\
  !*** ./src/PowerMesh/index.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PowerMesh": () => (/* binding */ PowerMesh)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var ore_three_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ore-three-ts */ "ore-three-ts");
/* harmony import */ var ore_three_ts__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(ore_three_ts__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _shaders_power_vs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shaders/power.vs */ "./src/PowerMesh/shaders/power.vs");
/* harmony import */ var _shaders_power_fs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./shaders/power.fs */ "./src/PowerMesh/shaders/power.fs");




class PowerMesh extends three__WEBPACK_IMPORTED_MODULE_0__.Mesh {
    constructor(geoMesh, materialOption, override) {
        materialOption = materialOption || {};
        let uni = ore_three_ts__WEBPACK_IMPORTED_MODULE_1__.UniformsLib.mergeUniforms(materialOption.uniforms || {}, {
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
                value: new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4()
            },
            shadowLightProjectionMatrix: {
                value: new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4()
            },
            shadowLightDirection: {
                value: new three__WEBPACK_IMPORTED_MODULE_0__.Vector3()
            },
            shadowLightCameraClip: {
                value: new three__WEBPACK_IMPORTED_MODULE_0__.Vector2()
            },
            shadowMap: {
                value: null
            },
            shadowMapSize: {
                value: new three__WEBPACK_IMPORTED_MODULE_0__.Vector2()
            },
            shadowMapResolution: {
                value: new three__WEBPACK_IMPORTED_MODULE_0__.Vector2()
            },
            shadowLightSize: {
                value: 1.0
            },
            cameraNear: {
                value: 0.01
            },
            cameraFar: {
                value: 1000.0
            }
        });
        uni = ore_three_ts__WEBPACK_IMPORTED_MODULE_1__.UniformsLib.mergeUniforms(uni, three__WEBPACK_IMPORTED_MODULE_0__.UniformsUtils.clone(three__WEBPACK_IMPORTED_MODULE_0__.UniformsLib.lights));
        /*-------------------------------
            Geometry
        -------------------------------*/
        let geo;
        if ('isBufferGeometry' in geoMesh) {
            geo = geoMesh;
        }
        else if ('isMesh' in geoMesh) {
            geo = geoMesh.geometry;
            let mat = geoMesh.material;
            if (mat.isMeshStandardMaterial) {
                if (mat.map) {
                    uni.map = {
                        value: mat.map
                    };
                }
                else if (mat.color) {
                    uni.color = {
                        value: mat.color
                    };
                }
                if (mat.roughnessMap) {
                    uni.roughnessMap = {
                        value: mat.roughnessMap
                    };
                }
                else {
                    uni.roughness = {
                        value: mat.roughness
                    };
                }
                if (mat.alphaMap) {
                    uni.alphaMap = {
                        value: mat.alphaMap
                    };
                }
                else {
                    uni.opacity = {
                        value: mat.opacity
                    };
                }
                if (mat.metalnessMap) {
                    uni.metalnessMap = {
                        value: mat.metalnessMap
                    };
                }
                else {
                    uni.metalness = {
                        value: mat.metalness
                    };
                }
                if (mat.normalMap) {
                    uni.normalMap = {
                        value: mat.normalMap
                    };
                }
                if (mat.emissiveMap) {
                    uni.emissionMap = {
                        value: mat.emissiveMap
                    };
                }
                else {
                    uni.emission = {
                        value: mat.emissive
                    };
                }
            }
        }
        else {
            geo = new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry();
        }
        // tangents
        if (!geo.getAttribute('tangent')) {
            if (geo.getIndex() &&
                geo.getAttribute('position') &&
                geo.getAttribute('normal') &&
                geo.getAttribute('uv')) {
                geo.computeTangents();
            }
        }
        /*-------------------------------
            Material
        -------------------------------*/
        materialOption.uniforms = uni;
        let mat = new three__WEBPACK_IMPORTED_MODULE_0__.ShaderMaterial(Object.assign({ vertexShader: _shaders_power_vs__WEBPACK_IMPORTED_MODULE_2__["default"], fragmentShader: _shaders_power_fs__WEBPACK_IMPORTED_MODULE_3__["default"], lights: true, transparent: true, side: three__WEBPACK_IMPORTED_MODULE_0__.DoubleSide, extensions: {
                derivatives: true,
            }, defines: {} }, materialOption));
        if (uni.map) {
            mat.defines.USE_MAP = '';
        }
        if (uni.roughnessMap) {
            mat.defines.USE_ROUGHNESS_MAP = '';
        }
        if (uni.metalnessMap) {
            mat.defines.USE_METALNESS_MAP = '';
        }
        if (uni.alphaMap) {
            mat.defines.USE_ALPHA_MAP = '';
        }
        if (uni.normalMap) {
            mat.defines.USE_NORMAL_MAP = '';
        }
        if (uni.emissionMap) {
            mat.defines.USE_EMISSION_MAP = '';
        }
        super(geo, mat);
        this.name = geoMesh.name;
        this.userData.colorMat = this.material;
        this.customDepthMaterial = new three__WEBPACK_IMPORTED_MODULE_0__.ShaderMaterial(Object.assign(Object.assign({ vertexShader: _shaders_power_vs__WEBPACK_IMPORTED_MODULE_2__["default"], fragmentShader: _shaders_power_fs__WEBPACK_IMPORTED_MODULE_3__["default"], side: three__WEBPACK_IMPORTED_MODULE_0__.DoubleSide, lights: true, extensions: {
                derivatives: true
            } }, materialOption), { defines: Object.assign(Object.assign({}, mat.defines), { 'DEPTH': "" }) }));
        this.commonUniforms = uni;
        /*-------------------------------
            Transform
        -------------------------------*/
        if ('isMesh' in geoMesh && override) {
            geoMesh.geometry.dispose();
            let childArray = geoMesh.children.slice();
            childArray.forEach(child => {
                this.add(child);
            });
            this.position.copy(geoMesh.position);
            this.rotation.copy(geoMesh.rotation);
            this.scale.copy(geoMesh.scale);
            let parent = geoMesh.parent;
            if (parent) {
                parent.add(this);
                parent.remove(geoMesh);
            }
        }
        /*-------------------------------
            EnvMap
        -------------------------------*/
        this.envMapSrc = null;
        this.envMapUpdate = false;
        this.envMapResolution = 256;
        this.envMapRenderTarget = new three__WEBPACK_IMPORTED_MODULE_0__.WebGLCubeRenderTarget(this.envMapResolution, {
            format: three__WEBPACK_IMPORTED_MODULE_0__.RGBAFormat,
            generateMipmaps: true,
            magFilter: three__WEBPACK_IMPORTED_MODULE_0__.LinearFilter,
            minFilter: three__WEBPACK_IMPORTED_MODULE_0__.LinearFilter
        });
        this.envMapCamera = new three__WEBPACK_IMPORTED_MODULE_0__.CubeCamera(0.001, 1000, this.envMapRenderTarget);
        this.getWorldPosition(this.envMapCamera.position);
        this.onBeforeRender = (renderer, scene, camera) => {
            this.dispatchEvent({
                type: 'beforeRender',
                renderer,
                scene,
                camera
            });
        };
        this.addEventListener('beforeRender', (e) => {
            let renderer = e.renderer;
            let scene = e.scene;
            let camera = e.camera;
            /*-------------------------------
                EnvMap
            -------------------------------*/
            if (this.envMapUpdate) {
                let envMapRT = null;
                let pmremGenerator = new three__WEBPACK_IMPORTED_MODULE_0__.PMREMGenerator(renderer);
                pmremGenerator.compileEquirectangularShader();
                if (this.envMapSrc) {
                    if ('isCubeTexture' in this.envMapSrc) {
                        envMapRT = pmremGenerator.fromCubemap(this.envMapSrc);
                    }
                    else {
                        envMapRT = pmremGenerator.fromEquirectangular(this.envMapSrc);
                    }
                }
                else {
                    this.visible = false;
                    this.envMapCamera.update(renderer, scene);
                    envMapRT = pmremGenerator.fromCubemap(this.envMapRenderTarget.texture);
                    this.visible = true;
                }
                // envmap
                let envMapResolution = envMapRT.height;
                const maxMip = Math.round(Math.log2(envMapResolution)) - 2;
                const texelHeight = 1.0 / envMapResolution;
                const texelWidth = 1.0 / (3 * Math.max(Math.pow(2, maxMip), 7 * 16));
                mat.defines['USE_ENV_MAP'] = '';
                mat.defines['CUBEUV_MAX_MIP'] = maxMip + '.0';
                mat.defines['CUBEUV_TEXEL_WIDTH'] = texelWidth + '';
                mat.defines['CUBEUV_TEXEL_HEIGHT'] = texelHeight + '';
                this.commonUniforms.envMap.value = envMapRT.texture;
                this.envMapUpdate = false;
            }
            /*-------------------------------
                Depth
            -------------------------------*/
            if (camera.userData.depthCamera) {
                this.material = this.userData.depthMat;
                this.commonUniforms.cameraNear.value = camera.near;
                this.commonUniforms.cameraFar.value = camera.far;
                if (!this.material) {
                    this.visible = false;
                }
            }
        });
        /*-------------------------------
            Dispose
        -------------------------------*/
        const onDispose = () => {
            this.envMapRenderTarget.dispose();
            this.geometry.dispose();
            this.material.dispose();
            this.removeEventListener('dispose', onDispose);
        };
        this.addEventListener('dispose', onDispose);
    }
    /*-------------------------------
        EnvMap / IBL
    -------------------------------*/
    updateEnvMap(envMap = null) {
        this.envMapSrc = envMap;
        this.envMapUpdate = true;
        if (this.commonUniforms.envMapIntensity.value == null) {
            this.commonUniforms.envMapIntensity.value = 1;
        }
        if (this.commonUniforms.iblIntensity.value == null) {
            this.commonUniforms.iblIntensity.value = 1;
        }
    }
    set envMapIntensity(value) {
        this.commonUniforms.envMapIntensity.value = value;
    }
    set iblIntensity(value) {
        this.commonUniforms.iblIntensity.value = value;
    }
    dispose() {
        this.dispatchEvent({ type: 'dispsoe' });
    }
    get isPowerMesh() {
        return true;
    }
}


/***/ }),

/***/ "./src/PowerReflectionMesh/index.ts":
/*!******************************************!*\
  !*** ./src/PowerReflectionMesh/index.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PowerReflectionMesh": () => (/* binding */ PowerReflectionMesh)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var ore_three_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ore-three-ts */ "ore-three-ts");
/* harmony import */ var ore_three_ts__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(ore_three_ts__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _PowerMesh__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../PowerMesh */ "./src/PowerMesh/index.ts");
/* harmony import */ var _shaders_mipmap_fs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./shaders/mipmap.fs */ "./src/PowerReflectionMesh/shaders/mipmap.fs");




class PowerReflectionMesh extends _PowerMesh__WEBPACK_IMPORTED_MODULE_2__.PowerMesh {
    constructor(geoMesh, materialOption, override) {
        materialOption = materialOption || {};
        materialOption.uniforms = ore_three_ts__WEBPACK_IMPORTED_MODULE_1__.UniformsLib.mergeUniforms(materialOption.uniforms || {}, {
            reflectionTex: {
                value: null
            },
            renderResolution: {
                value: new three__WEBPACK_IMPORTED_MODULE_0__.Vector2(1, 1)
            },
            textureMatrix: {
                value: new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4()
            },
            mipMapResolution: {
                value: new three__WEBPACK_IMPORTED_MODULE_0__.Vector2(1, 1)
            }
        });
        materialOption.defines = {
            IS_REFLECTIONPLANE: '',
        };
        super(geoMesh, materialOption, override);
        this.reflectorPlane = new three__WEBPACK_IMPORTED_MODULE_0__.Plane();
        this.normal = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
        this.reflectorWorldPosition = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
        this.cameraWorldPosition = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
        this.rotationMatrix = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
        this.lookAtPosition = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 0, -1);
        this.clipPlane = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4();
        this.textureMatrix = this.commonUniforms.textureMatrix.value;
        this.clipBias = 0.1;
        this.view = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
        this.target = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
        this.q = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4();
        this.virtualCamera = new three__WEBPACK_IMPORTED_MODULE_0__.PerspectiveCamera();
        /*-------------------------------
            MipMap
        -------------------------------*/
        this.mipmapPP = null;
        this.mipmapGeo = new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry();
        let posArray = [];
        let uvArray = [];
        let indexArray = [];
        let p = new three__WEBPACK_IMPORTED_MODULE_0__.Vector2(0, 0);
        let s = 2.0;
        posArray.push(p.x, p.y, 0);
        posArray.push(p.x + s, p.y, 0);
        posArray.push(p.x + s, p.y - s, 0);
        posArray.push(p.x, p.y - s, 0);
        uvArray.push(1.0, 1.0);
        uvArray.push(0.0, 1.0);
        uvArray.push(0.0, 0.0);
        uvArray.push(1.0, 0.0);
        indexArray.push(0, 2, 1, 0, 3, 2);
        p.set(s, 0);
        for (let i = 0; i < 7; i++) {
            s *= 0.5;
            posArray.push(p.x, p.y, 0);
            posArray.push(p.x + s, p.y, 0);
            posArray.push(p.x + s, p.y - s, 0);
            posArray.push(p.x, p.y - s, 0);
            uvArray.push(1.0, 1.0);
            uvArray.push(0.0, 1.0);
            uvArray.push(0.0, 0.0);
            uvArray.push(1.0, 0.0);
            let indexOffset = (i + 0.0) * 4;
            indexArray.push(indexOffset + 0, indexOffset + 2, indexOffset + 1, indexOffset + 0, indexOffset + 3, indexOffset + 2);
            p.y = p.y - s;
        }
        let posAttr = new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Float32Array(posArray), 3);
        let uvAttr = new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Float32Array(uvArray), 2);
        let indexAttr = new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Uint16Array(indexArray), 1);
        let gs = 1;
        posAttr.applyMatrix4(new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4().makeScale((1.0 / 1.5), gs, gs));
        posAttr.applyMatrix4(new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4().makeTranslation(-1.0, 1.0, 0));
        this.mipmapGeo.setAttribute('position', posAttr);
        this.mipmapGeo.setAttribute('uv', uvAttr);
        this.mipmapGeo.setIndex(indexAttr);
        /*-------------------------------
            RenderTargets
        -------------------------------*/
        this.renderTargets = {
            ref: new three__WEBPACK_IMPORTED_MODULE_0__.WebGLRenderTarget(1, 1),
            mipmap: new three__WEBPACK_IMPORTED_MODULE_0__.WebGLRenderTarget(1, 1),
        };
        /*-------------------------------
            Reflection
        -------------------------------*/
        this.addEventListener('beforeRender', (e) => {
            let renderer = e.renderer;
            let scene = e.scene;
            let camera = e.camera;
            this.reflectorWorldPosition.setFromMatrixPosition(this.matrixWorld);
            this.cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);
            this.rotationMatrix.extractRotation(this.matrixWorld);
            this.normal.set(0, 1.0, 0);
            this.normal.applyMatrix4(this.rotationMatrix);
            this.view.subVectors(this.reflectorWorldPosition, this.cameraWorldPosition);
            // Avoid rendering when reflector is facing away
            if (this.view.dot(this.normal) > 0)
                return;
            this.view.reflect(this.normal).negate();
            this.view.add(this.reflectorWorldPosition);
            this.rotationMatrix.extractRotation(camera.matrixWorld);
            this.lookAtPosition.set(0, 0, -1);
            this.lookAtPosition.applyMatrix4(this.rotationMatrix);
            this.lookAtPosition.add(this.cameraWorldPosition);
            this.target.subVectors(this.reflectorWorldPosition, this.lookAtPosition);
            this.target.reflect(this.normal).negate();
            this.target.add(this.reflectorWorldPosition);
            this.virtualCamera.position.copy(this.view);
            this.virtualCamera.up.set(0, 1, 0);
            this.virtualCamera.up.applyMatrix4(this.rotationMatrix);
            this.virtualCamera.up.reflect(this.normal);
            this.virtualCamera.lookAt(this.target);
            if (camera.far) {
                this.virtualCamera.far = camera.far; // Used in WebGLBackground
            }
            this.virtualCamera.updateMatrixWorld();
            this.virtualCamera.projectionMatrix.copy(camera.projectionMatrix);
            // Update the texture matrix
            this.textureMatrix.set(0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0);
            this.textureMatrix.multiply(this.virtualCamera.projectionMatrix);
            this.textureMatrix.multiply(this.virtualCamera.matrixWorldInverse);
            this.textureMatrix.multiply(this.matrixWorld);
            // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
            // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
            this.reflectorPlane.setFromNormalAndCoplanarPoint(this.normal, this.reflectorWorldPosition);
            this.reflectorPlane.applyMatrix4(this.virtualCamera.matrixWorldInverse);
            this.clipPlane.set(this.reflectorPlane.normal.x, this.reflectorPlane.normal.y, this.reflectorPlane.normal.z, this.reflectorPlane.constant);
            var projectionMatrix = this.virtualCamera.projectionMatrix;
            this.q.x = (Math.sign(this.clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
            this.q.y = (Math.sign(this.clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
            this.q.z = -1.0;
            this.q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];
            // Calculate the scaled plane vector
            this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(this.q));
            // Replacing the third row of the projection matrix
            projectionMatrix.elements[2] = this.clipPlane.x;
            projectionMatrix.elements[6] = this.clipPlane.y;
            projectionMatrix.elements[10] = this.clipPlane.z + 1.0 - this.clipBias;
            projectionMatrix.elements[14] = this.clipPlane.w;
            //render
            let currentRenderTarget = renderer.getRenderTarget();
            renderer.setRenderTarget(this.renderTargets.ref);
            this.visible = false;
            renderer.clear();
            renderer.render(scene, this.virtualCamera);
            renderer.clearDepth();
            renderer.setRenderTarget(currentRenderTarget);
            this.visible = true;
            /*-------------------------------
                MipMapPP
            -------------------------------*/
            if (this.mipmapPP == null) {
                this.mipmapPP = new ore_three_ts__WEBPACK_IMPORTED_MODULE_1__.PostProcessing(renderer, {
                    fragmentShader: _shaders_mipmap_fs__WEBPACK_IMPORTED_MODULE_3__["default"],
                    side: three__WEBPACK_IMPORTED_MODULE_0__.DoubleSide
                }, this.mipmapGeo);
            }
            this.mipmapPP.render({ tex: this.renderTargets.ref.texture }, this.renderTargets.mipmap);
            this.commonUniforms.reflectionTex.value = this.renderTargets.mipmap.texture;
            let rt = renderer.getRenderTarget();
            if (rt) {
                this.commonUniforms.renderResolution.value.set(rt.width, rt.height);
            }
            else {
                renderer.getSize(this.commonUniforms.renderResolution.value);
                this.commonUniforms.renderResolution.value.multiplyScalar(renderer.getPixelRatio());
            }
        });
        this.resize();
    }
    resize() {
        let size = 512;
        this.renderTargets.ref.setSize(size, size);
        let mipMapSize = new three__WEBPACK_IMPORTED_MODULE_0__.Vector2(size * 1.5, size);
        this.renderTargets.mipmap.setSize(mipMapSize.x, mipMapSize.y);
        this.commonUniforms.mipMapResolution.value.copy(mipMapSize);
    }
}


/***/ }),

/***/ "ore-three-ts":
/*!*********************************************************************************************************!*\
  !*** external {"commonjs":"ore-three-ts","commonjs2":"ore-three-ts","amd":"ore-three-ts","root":"ORE"} ***!
  \*********************************************************************************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_ore_three_ts__;

/***/ }),

/***/ "three":
/*!**************************************************************************************!*\
  !*** external {"commonjs":"three","commonjs2":"three","amd":"three","root":"THREE"} ***!
  \**************************************************************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_three__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PowerMesh": () => (/* reexport safe */ _PowerMesh__WEBPACK_IMPORTED_MODULE_0__.PowerMesh),
/* harmony export */   "PowerReflectionMesh": () => (/* reexport safe */ _PowerReflectionMesh__WEBPACK_IMPORTED_MODULE_1__.PowerReflectionMesh)
/* harmony export */ });
/* harmony import */ var _PowerMesh__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./PowerMesh */ "./src/PowerMesh/index.ts");
/* harmony import */ var _PowerReflectionMesh__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PowerReflectionMesh */ "./src/PowerReflectionMesh/index.ts");



})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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VUFBVSxHQUFHLEVBQUUsQ0FBQztRQUVwQixJQUFJLENBQUMsR0FBRyxJQUFJLDBDQUFhLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUVaLFFBQVEsQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDO1FBQzdCLFFBQVEsQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQztRQUNqQyxRQUFRLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDO1FBQ3JDLFFBQVEsQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQztRQUVqQyxPQUFPLENBQUMsSUFBSSxDQUFFLEdBQUcsRUFBRSxHQUFHLENBQUUsQ0FBQztRQUN6QixPQUFPLENBQUMsSUFBSSxDQUFFLEdBQUcsRUFBRSxHQUFHLENBQUUsQ0FBQztRQUN6QixPQUFPLENBQUMsSUFBSSxDQUFFLEdBQUcsRUFBRSxHQUFHLENBQUUsQ0FBQztRQUN6QixPQUFPLENBQUMsSUFBSSxDQUFFLEdBQUcsRUFBRSxHQUFHLENBQUUsQ0FBQztRQUV6QixVQUFVLENBQUMsSUFBSSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUM7UUFFcEMsQ0FBQyxDQUFDLEdBQUcsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUM7UUFFZCxLQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRyxFQUFHO1lBRTlCLENBQUMsSUFBSSxHQUFHLENBQUM7WUFFVCxRQUFRLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUUsQ0FBQztZQUMvQixRQUFRLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFFLENBQUM7WUFDbEMsUUFBUSxDQUFDLElBQUksQ0FBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQztZQUNyQyxRQUFRLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUcsQ0FBQyxDQUFFLENBQUM7WUFFbkMsT0FBTyxDQUFDLElBQUksQ0FBRSxHQUFHLEVBQUUsR0FBRyxDQUFFLENBQUM7WUFDekIsT0FBTyxDQUFDLElBQUksQ0FBRSxHQUFHLEVBQUUsR0FBRyxDQUFFLENBQUM7WUFDekIsT0FBTyxDQUFDLElBQUksQ0FBRSxHQUFHLEVBQUUsR0FBRyxDQUFFLENBQUM7WUFDekIsT0FBTyxDQUFDLElBQUksQ0FBRSxHQUFHLEVBQUUsR0FBRyxDQUFFLENBQUM7WUFFekIsSUFBSSxXQUFXLEdBQUcsQ0FBRSxDQUFDLEdBQUcsR0FBRyxDQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2xDLFVBQVUsQ0FBQyxJQUFJLENBQUUsV0FBVyxHQUFHLENBQUMsRUFBRSxXQUFXLEdBQUcsQ0FBQyxFQUFFLFdBQVcsR0FBRyxDQUFDLEVBQUUsV0FBVyxHQUFHLENBQUMsRUFBRSxXQUFXLEdBQUcsQ0FBQyxFQUFFLFdBQVcsR0FBRyxDQUFDLENBQUUsQ0FBQztZQUV4SCxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBRWQ7UUFFRCxJQUFJLE9BQU8sR0FBRyxJQUFJLGtEQUFxQixDQUFFLElBQUksWUFBWSxDQUFFLFFBQVEsQ0FBRSxFQUFFLENBQUMsQ0FBRSxDQUFDO1FBQzNFLElBQUksTUFBTSxHQUFHLElBQUksa0RBQXFCLENBQUUsSUFBSSxZQUFZLENBQUUsT0FBTyxDQUFFLEVBQUUsQ0FBQyxDQUFFLENBQUM7UUFDekUsSUFBSSxTQUFTLEdBQUcsSUFBSSxrREFBcUIsQ0FBRSxJQUFJLFdBQVcsQ0FBRSxVQUFVLENBQUUsRUFBRSxDQUFDLENBQUUsQ0FBQztRQUU5RSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDWCxPQUFPLENBQUMsWUFBWSxDQUFFLElBQUksMENBQWEsRUFBRSxDQUFDLFNBQVMsQ0FBRSxDQUFFLEdBQUcsR0FBRyxHQUFHLENBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFFLENBQUUsQ0FBQztRQUMvRSxPQUFPLENBQUMsWUFBWSxDQUFFLElBQUksMENBQWEsRUFBRSxDQUFDLGVBQWUsQ0FBRSxDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFFLENBQUUsQ0FBQztRQUU3RSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBRSxVQUFVLEVBQUUsT0FBTyxDQUFFLENBQUM7UUFDbkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBRSxDQUFDO1FBQzVDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFFLFNBQVMsQ0FBRSxDQUFDO1FBRXJDOzt5Q0FFaUM7UUFFakMsSUFBSSxDQUFDLGFBQWEsR0FBRztZQUNwQixHQUFHLEVBQUUsSUFBSSxvREFBdUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFO1lBQ3hDLE1BQU0sRUFBRSxJQUFJLG9EQUF1QixDQUFFLENBQUMsRUFBRSxDQUFDLENBQUU7U0FDM0MsQ0FBQztRQUVGOzt5Q0FFaUM7UUFFakMsSUFBSSxDQUFDLGdCQUFnQixDQUFFLGNBQWMsRUFBRSxDQUFFLENBQWMsRUFBRyxFQUFFO1lBRTNELElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUErQixDQUFDO1lBQ2pELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFvQixDQUFDO1lBQ25DLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFzQixDQUFDO1lBRXRDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxxQkFBcUIsQ0FBRSxJQUFJLENBQUMsV0FBVyxDQUFFLENBQUM7WUFDdEUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLHFCQUFxQixDQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUUsQ0FBQztZQUVyRSxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBRSxJQUFJLENBQUMsV0FBVyxDQUFFLENBQUM7WUFFeEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBRSxJQUFJLENBQUMsY0FBYyxDQUFFLENBQUM7WUFFaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUUsSUFBSSxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBRSxDQUFDO1lBRTlFLGdEQUFnRDtZQUVoRCxJQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBQyxNQUFNLENBQUUsR0FBRyxDQUFDO2dCQUFHLE9BQU87WUFFL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBRSxDQUFDO1lBRTdDLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUUsQ0FBQztZQUUxRCxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBRSxDQUFDO1lBQ3hELElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBRSxDQUFDO1lBRXBELElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFFLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFFLENBQUM7WUFDM0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBRSxDQUFDO1lBRS9DLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsSUFBSSxDQUFFLENBQUM7WUFDOUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFFLElBQUksQ0FBQyxjQUFjLENBQUUsQ0FBQztZQUMxRCxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBRSxDQUFDO1lBQzdDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFFLElBQUksQ0FBQyxNQUFNLENBQUUsQ0FBQztZQUV6QyxJQUFPLE1BQW1DLENBQUMsR0FBRyxFQUFHO2dCQUVoRCxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBSyxNQUFtQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLDBCQUEwQjthQUU5RjtZQUVELElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBRSxNQUFNLENBQUMsZ0JBQWdCLENBQUUsQ0FBQztZQUVwRSw0QkFBNEI7WUFDNUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQ3JCLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFDbEIsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUNsQixHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQ2xCLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FDbEIsQ0FBQztZQUVGLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUUsQ0FBQztZQUNuRSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBRSxJQUFJLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFFLENBQUM7WUFDckUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBRSxDQUFDO1lBRWhELHNIQUFzSDtZQUN0SCx1RkFBdUY7WUFDdkYsSUFBSSxDQUFDLGNBQWMsQ0FBQyw2QkFBNkIsQ0FBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBRSxDQUFDO1lBQzlGLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUUsQ0FBQztZQUUxRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBRSxDQUFDO1lBRTdJLElBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQztZQUUzRCxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUM7WUFDL0csSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFFLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFFLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDO1lBQy9HLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUUsR0FBRyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUUsR0FBRyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBRSxFQUFFLENBQUUsQ0FBRSxHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBRSxFQUFFLENBQUUsQ0FBQztZQUV2RixvQ0FBb0M7WUFDcEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBQyxDQUFDLENBQUUsQ0FBRSxDQUFDO1lBRXBFLG1EQUFtRDtZQUNuRCxnQkFBZ0IsQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbEQsZ0JBQWdCLENBQUMsUUFBUSxDQUFFLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ2xELGdCQUFnQixDQUFDLFFBQVEsQ0FBRSxFQUFFLENBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUN6RSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUUsRUFBRSxDQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFFbkQsUUFBUTtZQUNSLElBQUksbUJBQW1CLEdBQUcsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRXJELFFBQVEsQ0FBQyxlQUFlLENBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUUsQ0FBQztZQUNuRCxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUVyQixRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDakIsUUFBUSxDQUFDLE1BQU0sQ0FBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBRSxDQUFDO1lBQzdDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUV0QixRQUFRLENBQUMsZUFBZSxDQUFFLG1CQUFtQixDQUFFLENBQUM7WUFDaEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFFcEI7OzZDQUVpQztZQUVqQyxJQUFLLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFHO2dCQUU1QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksd0RBQWtCLENBQUUsUUFBUSxFQUFFO29CQUNqRCxjQUFjLEVBQUUsMERBQVU7b0JBQzFCLElBQUksRUFBRSw2Q0FBZ0I7aUJBQ3RCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBRSxDQUFDO2FBRXBCO1lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUUsQ0FBQztZQUMzRixJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1lBRTVFLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxlQUFlLEVBQTZCLENBQUM7WUFFL0QsSUFBSyxFQUFFLEVBQUc7Z0JBRVQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBRSxDQUFDO2FBRXRFO2lCQUFNO2dCQUVOLFFBQVEsQ0FBQyxPQUFPLENBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUUsQ0FBQztnQkFDL0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFFLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBRSxDQUFDO2FBRXRGO1FBRUYsQ0FBQyxDQUFFLENBQUM7UUFFSixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFFZixDQUFDO0lBRU8sTUFBTTtRQUViLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBRSxJQUFJLEVBQUUsSUFBSSxDQUFFLENBQUM7UUFFN0MsSUFBSSxVQUFVLEdBQUcsSUFBSSwwQ0FBYSxDQUFFLElBQUksR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFFLENBQUM7UUFDdkQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFFLFVBQVUsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBRSxDQUFDO1FBQ2hFLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBRSxVQUFVLENBQUUsQ0FBQztJQUUvRCxDQUFDO0NBRUQ7Ozs7Ozs7Ozs7O0FDclREOzs7Ozs7Ozs7O0FDQUE7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7OztBQ053QztBQUNvQiIsInNvdXJjZXMiOlsid2VicGFjazovL1Bvd2VyTWVzaC93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vUG93ZXJNZXNoLy4vc3JjL1Bvd2VyTWVzaC9zaGFkZXJzL3Bvd2VyLmZzIiwid2VicGFjazovL1Bvd2VyTWVzaC8uL3NyYy9Qb3dlck1lc2gvc2hhZGVycy9wb3dlci52cyIsIndlYnBhY2s6Ly9Qb3dlck1lc2gvLi9zcmMvUG93ZXJSZWZsZWN0aW9uTWVzaC9zaGFkZXJzL21pcG1hcC5mcyIsIndlYnBhY2s6Ly9Qb3dlck1lc2gvLi9zcmMvUG93ZXJNZXNoL2luZGV4LnRzIiwid2VicGFjazovL1Bvd2VyTWVzaC8uL3NyYy9Qb3dlclJlZmxlY3Rpb25NZXNoL2luZGV4LnRzIiwid2VicGFjazovL1Bvd2VyTWVzaC9leHRlcm5hbCB1bWQge1wiY29tbW9uanNcIjpcIm9yZS10aHJlZS10c1wiLFwiY29tbW9uanMyXCI6XCJvcmUtdGhyZWUtdHNcIixcImFtZFwiOlwib3JlLXRocmVlLXRzXCIsXCJyb290XCI6XCJPUkVcIn0iLCJ3ZWJwYWNrOi8vUG93ZXJNZXNoL2V4dGVybmFsIHVtZCB7XCJjb21tb25qc1wiOlwidGhyZWVcIixcImNvbW1vbmpzMlwiOlwidGhyZWVcIixcImFtZFwiOlwidGhyZWVcIixcInJvb3RcIjpcIlRIUkVFXCJ9Iiwid2VicGFjazovL1Bvd2VyTWVzaC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9Qb3dlck1lc2gvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vUG93ZXJNZXNoL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9Qb3dlck1lc2gvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9Qb3dlck1lc2gvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9Qb3dlck1lc2gvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKFwidGhyZWVcIiksIHJlcXVpcmUoXCJvcmUtdGhyZWUtdHNcIikpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW1widGhyZWVcIiwgXCJvcmUtdGhyZWUtdHNcIl0sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiUG93ZXJNZXNoXCJdID0gZmFjdG9yeShyZXF1aXJlKFwidGhyZWVcIiksIHJlcXVpcmUoXCJvcmUtdGhyZWUtdHNcIikpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIlBvd2VyTWVzaFwiXSA9IGZhY3Rvcnkocm9vdFtcIlRIUkVFXCJdLCByb290W1wiT1JFXCJdKTtcbn0pKHNlbGYsIGZ1bmN0aW9uKF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfdGhyZWVfXywgX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9vcmVfdGhyZWVfdHNfXykge1xucmV0dXJuICIsImV4cG9ydCBkZWZhdWx0IFwiI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIHZlYzIgdlV2O1xcbnZhcnlpbmcgdmVjMyB2VGFuZ2VudDtcXG52YXJ5aW5nIHZlYzMgdkJpdGFuZ2VudDtcXG5cXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRSZXF1aXJlXFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxuI2luY2x1ZGUgPHBhY2tpbmc+XFxuXFxudmVjMiBwYWNraW5nMTYoIGZsb2F0IHZhbHVlICkgeyBcXG5cXG5cXHRmbG9hdCB2MSA9IHZhbHVlICogMjU1LjA7XFxuXFx0ZmxvYXQgciA9IGZsb29yKHYxKTtcXG5cXG5cXHRmbG9hdCB2MiA9ICggdjEgLSByICkgKiAyNTUuMDtcXG5cXHRmbG9hdCBnID0gZmxvb3IoIHYyICk7XFxuXFxuXFx0cmV0dXJuIHZlYzIoIHIsIGcgKSAvIDI1NS4wO1xcblxcbn1cXG5cXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRSZXF1aWVyc1xcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcbiNpbmNsdWRlIDxjb21tb24+XFxuXFxuZmxvYXQgcmFuZG9tKHZlYzIgcCl7XFxuXFx0cmV0dXJuIGZyYWN0KHNpbihkb3QocC54eSAsdmVjMigxMi45ODk4LDc4LjIzMykpKSAqIDQzNzU4LjU0NTMpO1xcbn1cXG5cXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRNYXRlcmlhbCBVbmlmb3Jtc1xcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXG5cXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRUZXh0dXJlc1xcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcbiNpZmRlZiBVU0VfTUFQXFxuXFxuXFx0dW5pZm9ybSBzYW1wbGVyMkQgbWFwO1xcblxcbiNlbHNlXFxuXFxuXFx0dW5pZm9ybSB2ZWMzIGNvbG9yO1xcblxcbiNlbmRpZlxcblxcbiNpZmRlZiBVU0VfTk9STUFMX01BUFxcblxcblxcdHVuaWZvcm0gc2FtcGxlcjJEIG5vcm1hbE1hcDtcXG5cXG4jZW5kaWZcXG5cXG4jaWZkZWYgVVNFX1JPVUdITkVTU19NQVBcXG5cXG5cXHR1bmlmb3JtIHNhbXBsZXIyRCByb3VnaG5lc3NNYXA7XFxuXFxuI2Vsc2VcXG5cXG5cXHR1bmlmb3JtIGZsb2F0IHJvdWdobmVzcztcXG5cXG4jZW5kaWZcXG5cXG4jaWZkZWYgVVNFX0FMUEhBX01BUFxcblxcblxcdHVuaWZvcm0gc2FtcGxlcjJEIGFscGhhTWFwO1xcblxcbiNlbHNlXFxuXFxuXFx0dW5pZm9ybSBmbG9hdCBvcGFjaXR5O1xcblxcdFxcbiNlbmRpZlxcblxcbiNpZmRlZiBVU0VfTUVUQUxORVNTX01BUFxcblxcblxcdHVuaWZvcm0gc2FtcGxlcjJEIG1ldGFsbmVzc01hcDtcXG5cXG4jZWxzZVxcblxcblxcdHVuaWZvcm0gZmxvYXQgbWV0YWxuZXNzO1xcblxcbiNlbmRpZlxcbiNpZmRlZiBVU0VfRU1JU1NJT05fTUFQXFxuXFxuXFx0dW5pZm9ybSBzYW1wbGVyMkQgZW1pc3Npb25NYXA7XFxuXFxuI2Vsc2VcXG5cXG5cXHR1bmlmb3JtIHZlYzMgZW1pc3Npb247XFxuXFxuI2VuZGlmXFxuXFxuI2lmZGVmIElTX1JFRkxFQ1RJT05QTEFORVxcblxcblxcdHVuaWZvcm0gc2FtcGxlcjJEIHJlZmxlY3Rpb25UZXg7XFxuXFx0dW5pZm9ybSB2ZWMyIHJlbmRlclJlc29sdXRpb247XFxuXFx0dW5pZm9ybSB2ZWMyIG1pcE1hcFJlc29sdXRpb247XFxuXFx0XFxuI2VuZGlmXFxuXFxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0VHlwZXNcXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG5zdHJ1Y3QgR2VvbWV0cnkge1xcblxcdHZlYzMgcG9zO1xcblxcdHZlYzMgcG9zV29ybGQ7XFxuXFx0dmVjMyB2aWV3RGlyO1xcblxcdHZlYzMgdmlld0RpcldvcmxkO1xcblxcdHZlYzMgbm9ybWFsO1xcblxcdHZlYzMgbm9ybWFsV29ybGQ7XFxufTtcXG5cXG5zdHJ1Y3QgTGlnaHQge1xcblxcdHZlYzMgZGlyZWN0aW9uO1xcblxcdHZlYzMgY29sb3I7XFxufTtcXG5cXG5zdHJ1Y3QgTWF0ZXJpYWwge1xcblxcdHZlYzMgYWxiZWRvO1xcblxcdHZlYzMgZGlmZnVzZUNvbG9yO1xcblxcdHZlYzMgc3BlY3VsYXJDb2xvcjtcXG5cXHRmbG9hdCBtZXRhbG5lc3M7XFxuXFx0ZmxvYXQgcm91Z2huZXNzO1xcblxcdGZsb2F0IG9wYWNpdHk7XFxufTtcXG5cXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRMaWdodHNcXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG4jaWYgTlVNX0RJUl9MSUdIVFMgPiAwXFxuXFxuXFx0c3RydWN0IERpcmVjdGlvbmFsTGlnaHQge1xcblxcdFxcdHZlYzMgZGlyZWN0aW9uO1xcblxcdFxcdHZlYzMgY29sb3I7XFxuXFx0fTtcXG5cXG5cXHR1bmlmb3JtIERpcmVjdGlvbmFsTGlnaHQgZGlyZWN0aW9uYWxMaWdodHNbIE5VTV9ESVJfTElHSFRTIF07XFxuXFxuI2VuZGlmXFxuXFxuI2lmIE5VTV9QT0lOVF9MSUdIVFMgPiAwXFxuXFxuXFx0c3RydWN0IFBvaW50TGlnaHQge1xcblxcdFxcdHZlYzMgcG9zaXRpb247XFxuXFx0XFx0dmVjMyBjb2xvcjtcXG5cXHRcXHRmbG9hdCBkaXN0YW5jZTtcXG5cXHRcXHRmbG9hdCBkZWNheTtcXG5cXHR9O1xcblxcblxcdHVuaWZvcm0gUG9pbnRMaWdodCBwb2ludExpZ2h0c1sgTlVNX1BPSU5UX0xJR0hUUyBdO1xcblxcbiNlbmRpZlxcblxcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcblxcdEVudk1hcFxcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcbiNpZmRlZiBVU0VfRU5WX01BUFxcblxcblxcdHVuaWZvcm0gc2FtcGxlcjJEIGVudk1hcDtcXG5cXHR1bmlmb3JtIGZsb2F0IGVudk1hcEludGVuc2l0eTtcXG5cXHR1bmlmb3JtIGZsb2F0IGlibEludGVuc2l0eTtcXG5cXHR1bmlmb3JtIGZsb2F0IG1heExvZExldmVsO1xcblxcblxcdCNkZWZpbmUgRU5WTUFQX1RZUEVfQ1VCRV9VVlxcblxcdCNpbmNsdWRlIDxjdWJlX3V2X3JlZmxlY3Rpb25fZnJhZ21lbnQ+XFxuXFxuI2VuZGlmXFxuXFxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0UmVmbGVjdGlvblxcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcbiNkZWZpbmUgUkVGX01JUE1BUF9MRVZFTCA4LjBcXG5cXG4jaWZkZWYgSVNfUkVGTEVDVElPTlBMQU5FXFxuXFxuXFx0dmVjMiBnZXRSZWZNaXBtYXBVViggdmVjMiB1diwgZmxvYXQgbGV2ZWwgKSB7XFxuXFxuXFx0XFx0dmVjMiBydXYgPSB1djtcXG5cXG5cXHRcXHRpZiggbGV2ZWwgPiAwLjAgKSB7XFxuXFxuXFx0XFx0XFx0cnV2LnggKj0gMS4wIC8gKCAzLjAgKiAoIHBvdyggMi4wLCBsZXZlbCApIC8gMi4wICkgKTtcXG5cXHRcXHRcXHRydXYueSAqPSAxLjAgLyAoIHBvdyggMi4wLCBsZXZlbCApICk7XFxuXFx0XFx0XFx0cnV2LnkgKz0gMS4wIC8gKCBwb3coIDIuMCwgbGV2ZWwgKSApO1xcblxcdFxcdFxcdHJ1di54ICs9IDEuMCAvIDEuNTtcXG5cXHRcXHRcXG5cXHRcXHR9IGVsc2Uge1xcblxcblxcdFxcdFxcdHJ1di54IC89IDEuNTtcXG5cXHRcXHRcXHRcXG5cXHRcXHR9XFxuXFxuXFx0XFx0cmV0dXJuIHJ1djtcXG5cXG5cXHR9XFxuXFx0XFxuXFx0dmVjNCBjdWJpYyhmbG9hdCB2KSB7XFxuXFx0XFx0dmVjNCBuID0gdmVjNCgxLjAsIDIuMCwgMy4wLCA0LjApIC0gdjtcXG5cXHRcXHR2ZWM0IHMgPSBuICogbiAqIG47XFxuXFx0XFx0ZmxvYXQgeCA9IHMueDtcXG5cXHRcXHRmbG9hdCB5ID0gcy55IC0gNC4wICogcy54O1xcblxcdFxcdGZsb2F0IHogPSBzLnogLSA0LjAgKiBzLnkgKyA2LjAgKiBzLng7XFxuXFx0XFx0ZmxvYXQgdyA9IDYuMCAtIHggLSB5IC0gejtcXG5cXHRcXHRyZXR1cm4gdmVjNCh4LCB5LCB6LCB3KTtcXG5cXHR9XFxuXFxuXFx0Ly8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTM1MDEwODEvZWZmaWNpZW50LWJpY3ViaWMtZmlsdGVyaW5nLWNvZGUtaW4tZ2xzbFxcblxcdHZlYzQgdGV4dHVyZUJpY3ViaWMoc2FtcGxlcjJEIHQsIHZlYzIgdGV4Q29vcmRzLCB2ZWMyIHRleHR1cmVTaXplKSB7XFxuXFx0XFx0dmVjMiBpbnZUZXhTaXplID0gMS4wIC8gdGV4dHVyZVNpemU7XFxuXFx0XFx0dGV4Q29vcmRzID0gdGV4Q29vcmRzICogdGV4dHVyZVNpemUgLSAwLjU7XFxuXFx0XFx0dmVjMiBmeHkgPSBmcmFjdCh0ZXhDb29yZHMpO1xcblxcdFxcdHRleENvb3JkcyAtPSBmeHk7XFxuXFx0XFx0dmVjNCB4Y3ViaWMgPSBjdWJpYyhmeHkueCk7XFxuXFx0XFx0dmVjNCB5Y3ViaWMgPSBjdWJpYyhmeHkueSk7XFxuXFx0XFx0dmVjNCBjID0gdGV4Q29vcmRzLnh4eXkgKyB2ZWMyICgtMC41LCAxLjUpLnh5eHk7XFxuXFx0XFx0dmVjNCBzID0gdmVjNCh4Y3ViaWMueHogKyB4Y3ViaWMueXcsIHljdWJpYy54eiArIHljdWJpYy55dyk7XFxuXFx0XFx0dmVjNCBvZmZzZXQgPSBjICsgdmVjNCAoeGN1YmljLnl3LCB5Y3ViaWMueXcpIC8gcztcXG5cXHRcXHRvZmZzZXQgKj0gaW52VGV4U2l6ZS54eHl5O1xcblxcdFxcdHZlYzQgc2FtcGxlMCA9IHRleHR1cmUyRCh0LCBvZmZzZXQueHopO1xcblxcdFxcdHZlYzQgc2FtcGxlMSA9IHRleHR1cmUyRCh0LCBvZmZzZXQueXopO1xcblxcdFxcdHZlYzQgc2FtcGxlMiA9IHRleHR1cmUyRCh0LCBvZmZzZXQueHcpO1xcblxcdFxcdHZlYzQgc2FtcGxlMyA9IHRleHR1cmUyRCh0LCBvZmZzZXQueXcpO1xcblxcdFxcdGZsb2F0IHN4ID0gcy54IC8gKHMueCArIHMueSk7XFxuXFx0XFx0ZmxvYXQgc3kgPSBzLnogLyAocy56ICsgcy53KTtcXG5cXHRcXHRyZXR1cm4gbWl4KFxcblxcdFxcdG1peChzYW1wbGUzLCBzYW1wbGUyLCBzeCksIG1peChzYW1wbGUxLCBzYW1wbGUwLCBzeCksIHN5KTtcXG5cXHR9XFxuXFxuI2VuZGlmXFxuXFxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0U2hhZG93XFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxuI2lmZGVmIERFUFRIXFxuXFxuXFx0dmFyeWluZyB2ZWMyIHZIaWdoUHJlY2lzaW9uWlc7XFxuXFx0dW5pZm9ybSBmbG9hdCBjYW1lcmFOZWFyO1xcblxcdHVuaWZvcm0gZmxvYXQgY2FtZXJhRmFyO1xcblxcbiNlbmRpZlxcblxcbiNpZmRlZiBVU0VfU0hBRE9XTUFQXFxuXFxuI2lmIE5VTV9ESVJfTElHSFRfU0hBRE9XUyA+IDBcXG5cXG5cXHRcXHR1bmlmb3JtIHNhbXBsZXIyRCBkaXJlY3Rpb25hbFNoYWRvd01hcFsgTlVNX0RJUl9MSUdIVF9TSEFET1dTIF07XFxuXFx0XFx0dmFyeWluZyB2ZWM0IHZEaXJlY3Rpb25hbFNoYWRvd0Nvb3JkWyBOVU1fRElSX0xJR0hUX1NIQURPV1MgXTtcXG5cXG5cXHRcXHRzdHJ1Y3QgRGlyZWN0aW9uYWxMaWdodFNoYWRvdyB7XFxuXFx0XFx0XFx0ZmxvYXQgc2hhZG93QmlhcztcXG5cXHRcXHRcXHRmbG9hdCBzaGFkb3dOb3JtYWxCaWFzO1xcblxcdFxcdFxcdGZsb2F0IHNoYWRvd1JhZGl1cztcXG5cXHRcXHRcXHR2ZWMyIHNoYWRvd01hcFNpemU7XFxuXFx0XFx0fTtcXG5cXG5cXHRcXHR1bmlmb3JtIERpcmVjdGlvbmFsTGlnaHRTaGFkb3cgZGlyZWN0aW9uYWxMaWdodFNoYWRvd3NbIE5VTV9ESVJfTElHSFRfU0hBRE9XUyBdO1xcblxcblxcdCNlbmRpZlxcblxcblxcdCNkZWZpbmUgU0hBRE9XX1NBTVBMRV9DT1VOVCA0XFxuXFxuXFx0dmVjMiBwb2lzc29uRGlza1sgU0hBRE9XX1NBTVBMRV9DT1VOVCBdO1xcblxcblxcdHZvaWQgaW5pdFBvaXNzb25EaXNrKCBmbG9hdCBzZWVkICkge1xcblxcblxcdFxcdGZsb2F0IHIgPSAwLjE7XFxuXFx0XFx0ZmxvYXQgclN0ZXAgPSAoMS4wIC0gcikgLyBmbG9hdCggU0hBRE9XX1NBTVBMRV9DT1VOVCApO1xcblxcblxcdFxcdGZsb2F0IGFuZyA9IHJhbmRvbSggZ2xfRnJhZ0Nvb3JkLnh5ICogMC4wMSArIHNpbiggdGltZSApICkgKiBQSTIgKiAxLjA7XFxuXFx0XFx0ZmxvYXQgYW5nU3RlcCA9ICggKCBQSTIgKiAxMS4wICkgLyBmbG9hdCggU0hBRE9XX1NBTVBMRV9DT1VOVCApICk7XFxuXFx0XFx0XFxuXFx0XFx0Zm9yKCBpbnQgaSA9IDA7IGkgPCBTSEFET1dfU0FNUExFX0NPVU5UOyBpKysgKSB7XFxuXFxuXFx0XFx0XFx0cG9pc3NvbkRpc2tbIGkgXSA9IHZlYzIoXFxuXFx0XFx0XFx0XFx0c2luKCBhbmcgKSxcXG5cXHRcXHRcXHRcXHRjb3MoIGFuZyApXFxuXFx0XFx0XFx0KSAqIHBvdyggciwgMC43NSApO1xcblxcblxcdFxcdFxcdHIgKz0gclN0ZXA7XFxuXFx0XFx0XFx0YW5nICs9IGFuZ1N0ZXA7XFxuXFx0XFx0fVxcblxcdFxcdFxcblxcdH1cXG5cXG5cXHR2ZWMyIGNvbXBhaXJTaGFkb3dNYXBEZXB0aCggc2FtcGxlcjJEIHNoYWRvd01hcCwgdmVjMiBzaGFkb3dNYXBVViwgZmxvYXQgZGVwdGggKSB7XFxuXFxuXFx0XFx0aWYoIHNoYWRvd01hcFVWLnggPCAwLjAgfHwgc2hhZG93TWFwVVYueCA+IDEuMCB8fCBzaGFkb3dNYXBVVi55IDwgMC4wIHx8IHNoYWRvd01hcFVWLnkgPiAxLjAgKSB7XFxuXFxuXFx0XFx0XFx0cmV0dXJuIHZlYzIoIDEuMCwgMC4wICk7XFxuXFxuXFx0XFx0fVxcblxcblxcdFxcdGZsb2F0IHNoYWRvd01hcERlcHRoID0gdW5wYWNrUkdCQVRvRGVwdGgoIHRleHR1cmUyRCggc2hhZG93TWFwLCBzaGFkb3dNYXBVViApICk7XFxuXFxuXFx0XFx0aWYoIDAuMCA+PSBzaGFkb3dNYXBEZXB0aCB8fCBzaGFkb3dNYXBEZXB0aCA+PSAxLjAgKSB7XFxuXFxuXFx0XFx0XFx0cmV0dXJuIHZlYzIoIDEuMCwgMC4wICk7XFxuXFxuXFx0XFx0fVxcblxcdFxcdFxcblxcdFxcdGZsb2F0IHNoYWRvdyA9IGRlcHRoIDw9IHNoYWRvd01hcERlcHRoID8gMS4wIDogMC4wO1xcblxcblxcdFxcdHJldHVybiB2ZWMyKCBzaGFkb3csIHNoYWRvd01hcERlcHRoICk7XFxuXFx0XFx0XFxuXFx0fVxcblxcblxcdGZsb2F0IHNoYWRvd01hcFBDRiggc2FtcGxlcjJEIHNoYWRvd01hcCwgdmVjNCBzaGFkb3dNYXBDb29yZCwgdmVjMiBzaGFkb3dTaXplICkge1xcblxcblxcdFxcdGZsb2F0IHNoYWRvdyA9IDAuMDtcXG5cXHRcXHRcXG5cXHRcXHRmb3IoIGludCBpID0gMDsgaSA8IFNIQURPV19TQU1QTEVfQ09VTlQ7IGkgKysgICkge1xcblxcdFxcdFxcdFxcblxcdFxcdFxcdHZlYzIgb2Zmc2V0ID0gcG9pc3NvbkRpc2tbIGkgXSAqIHNoYWRvd1NpemU7IFxcblxcblxcdFxcdFxcdHNoYWRvdyArPSBjb21wYWlyU2hhZG93TWFwRGVwdGgoIHNoYWRvd01hcCwgc2hhZG93TWFwQ29vcmQueHkgKyBvZmZzZXQsIHNoYWRvd01hcENvb3JkLnogKS54O1xcblxcdFxcdFxcdFxcblxcdFxcdH1cXG5cXG5cXHRcXHRzaGFkb3cgLz0gZmxvYXQoIFNIQURPV19TQU1QTEVfQ09VTlQgKTtcXG5cXG5cXHRcXHRyZXR1cm4gc2hhZG93O1xcblxcblxcdH1cXG5cXG5cXHRmbG9hdCBnZXRTaGFkb3coIHNhbXBsZXIyRCBzaGFkb3dNYXAsIHZlYzIgc2hhZG93TWFwU2l6ZSwgZmxvYXQgYmlhcywgdmVjNCBzaGFkb3dNYXBDb29yZCApIHtcXG5cXHRcXHRcXG5cXHRcXHRzaGFkb3dNYXBDb29yZC54eXogLz0gc2hhZG93TWFwQ29vcmQudztcXG5cXHRcXHRzaGFkb3dNYXBDb29yZC56ICs9IGJpYXMgLSAwLjAwMDE7XFxuXFxuXFx0XFx0aW5pdFBvaXNzb25EaXNrKHRpbWUpO1xcblxcblxcdFxcdHZlYzIgc2hhZG93U2l6ZSA9IDEuMCAvIHNoYWRvd01hcFNpemU7XFxuXFxuXFx0XFx0cmV0dXJuIHNoYWRvd01hcFBDRiggc2hhZG93TWFwLCBzaGFkb3dNYXBDb29yZCwgc2hhZG93U2l6ZSApO1xcblxcblxcdH1cXG5cXG4jZW5kaWZcXG5cXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRSRVxcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcbnZhcnlpbmcgdmVjMyB2Tm9ybWFsO1xcbnZhcnlpbmcgdmVjMyB2Vmlld05vcm1hbDtcXG52YXJ5aW5nIHZlYzMgdlZpZXdQb3M7XFxudmFyeWluZyB2ZWMzIHZXb3JsZFBvcztcXG5cXG5mbG9hdCBnZ3goIGZsb2F0IGROSCwgZmxvYXQgcm91Z2huZXNzICkge1xcblxcdFxcblxcdGZsb2F0IGEyID0gcm91Z2huZXNzICogcm91Z2huZXNzO1xcblxcdGEyID0gYTIgKiBhMjtcXG5cXHRmbG9hdCBkTkgyID0gZE5IICogZE5IO1xcblxcblxcdGlmKCBkTkgyIDw9IDAuMCApIHJldHVybiAwLjA7XFxuXFxuXFx0cmV0dXJuIGEyIC8gKCBQSSAqIHBvdyggZE5IMiAqICggYTIgLSAxLjAgKSArIDEuMCwgMi4wKSApO1xcblxcbn1cXG5cXG52ZWMzIGxhbWJlcnQoIHZlYzMgZGlmZnVzZUNvbG9yICkge1xcblxcblxcdHJldHVybiBkaWZmdXNlQ29sb3IgLyBQSTtcXG5cXG59XFxuXFxuZmxvYXQgZ1NjaGxpY2soIGZsb2F0IGQsIGZsb2F0IGsgKSB7XFxuXFxuXFx0aWYoIGQgPT0gMC4wICkgcmV0dXJuIDAuMDtcXG5cXG5cXHRyZXR1cm4gZCAvICggZCAqICggMS4wIC0gayApICsgayApO1xcblxcdFxcbn1cXG5cXG5mbG9hdCBnU21pdGgoIGZsb2F0IGROViwgZmxvYXQgZE5MLCBmbG9hdCByb3VnaG5lc3MgKSB7XFxuXFxuXFx0ZmxvYXQgayA9IGNsYW1wKCByb3VnaG5lc3MgKiBzcXJ0KCAyLjAgLyBQSSApLCAwLjAsIDEuMCApO1xcblxcblxcdHJldHVybiBnU2NobGljayggZE5WLCBrICkgKiBnU2NobGljayggZE5MLCBrICk7XFxuXFx0XFxufVxcblxcbmZsb2F0IGZyZXNuZWwoIGZsb2F0IGQgKSB7XFxuXFx0XFxuXFx0ZmxvYXQgZjAgPSAwLjA0O1xcblxcblxcdHJldHVybiBmMCArICggMS4wIC0gZjAgKSAqIHBvdyggMS4wIC0gZCwgNS4wICk7XFxuXFxufVxcblxcbnZlYzMgUkUoIEdlb21ldHJ5IGdlbywgTWF0ZXJpYWwgbWF0LCBMaWdodCBsaWdodCkge1xcblxcblxcdHZlYzMgbGlnaHREaXIgPSBub3JtYWxpemUoIGxpZ2h0LmRpcmVjdGlvbiApO1xcblxcdHZlYzMgaGFsZlZlYyA9IG5vcm1hbGl6ZSggZ2VvLnZpZXdEaXIgKyBsaWdodERpciApO1xcblxcblxcdGZsb2F0IGRMSCA9IGNsYW1wKCBkb3QoIGxpZ2h0RGlyLCBoYWxmVmVjICksIDAuMCwgMS4wICk7XFxuXFx0ZmxvYXQgZE5IID0gY2xhbXAoIGRvdCggZ2VvLm5vcm1hbCwgaGFsZlZlYyApLCAwLjAsIDEuMCApO1xcblxcdGZsb2F0IGROViA9IGNsYW1wKCBkb3QoIGdlby5ub3JtYWwsIGdlby52aWV3RGlyICksIDAuMCwgMS4wICk7XFxuXFx0ZmxvYXQgZE5MID0gY2xhbXAoIGRvdCggZ2VvLm5vcm1hbCwgbGlnaHREaXIpLCAwLjAsIDEuMCApO1xcblxcblxcdHZlYzMgaXJyYWRpYW5jZSA9IGxpZ2h0LmNvbG9yICogZE5MO1xcblxcblxcdC8vIGRpZmZ1c2VcXG5cXHR2ZWMzIGRpZmZ1c2UgPSBsYW1iZXJ0KCBtYXQuZGlmZnVzZUNvbG9yICkgKiBpcnJhZGlhbmNlO1xcblxcblxcdC8vIHNwZWN1bGFyXFxuXFx0ZmxvYXQgRCA9IGdneCggZE5ILCBtYXQucm91Z2huZXNzICk7XFxuXFx0ZmxvYXQgRyA9IGdTbWl0aCggZE5WLCBkTkwsIG1hdC5yb3VnaG5lc3MgKTtcXG5cXHRmbG9hdCBGID0gZnJlc25lbCggZExIICk7XFxuXFx0XFxuXFx0dmVjMyBzcGVjdWxhciA9ICgoIEQgKiBHICogRiApIC8gKCA0LjAgKiBkTkwgKiBkTlYgKyAwLjAwMDEgKSAqIG1hdC5zcGVjdWxhckNvbG9yICkgKiBpcnJhZGlhbmNlOyBcXG5cXG5cXHR2ZWMzIGMgPSB2ZWMzKCAwLjAgKTtcXG5cXHRjICs9IGRpZmZ1c2UgKiAoIDEuMCAtIEYgKSArIHNwZWN1bGFyO1xcblxcblxcdHJldHVybiBjO1xcblxcbn1cXG5cXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRNYWluXFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxudm9pZCBtYWluKCB2b2lkICkge1xcblxcblxcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcblxcdFxcdE1hdGVyaWFsXFxuXFx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxuXFx0TWF0ZXJpYWwgbWF0O1xcblxcblxcdCNpZmRlZiBVU0VfTUFQXFxuXFxuXFx0XFx0dmVjNCBjb2xvciA9IExpbmVhclRvc1JHQiggdGV4dHVyZTJEKCBtYXAsIHZVdiApICk7XFxuXFx0XFx0bWF0LmFsYmVkbyA9IGNvbG9yLnh5ejtcXG5cXG5cXHQjZWxzZVxcblxcblxcdFxcdG1hdC5hbGJlZG8gPSBjb2xvci54eXo7XFxuXFx0XFx0bWF0Lm9wYWNpdHkgPSAxLjA7XFxuXFx0XFxuXFx0I2VuZGlmXFxuXFxuXFx0I2lmZGVmIFVTRV9ST1VHSE5FU1NfTUFQXFxuXFxuXFx0XFx0bWF0LnJvdWdobmVzcyA9IHRleHR1cmUyRCggcm91Z2huZXNzTWFwLCB2VXYgKS55O1xcblxcblxcdCNlbHNlXFxuXFxuXFx0XFx0bWF0LnJvdWdobmVzcyA9IHJvdWdobmVzcztcXG5cXHRcXG5cXHQjZW5kaWZcXG5cXG5cXHQjaWZkZWYgVVNFX01FVEFMTkVTU19NQVBcXG5cXG5cXHRcXHRtYXQubWV0YWxuZXNzID0gdGV4dHVyZTJEKCBtZXRhbG5lc3NNYXAsIHZVdiApLno7XFxuXFxuXFx0I2Vsc2VcXG5cXG5cXHRcXHRtYXQubWV0YWxuZXNzID0gbWV0YWxuZXNzO1xcblxcdFxcblxcdCNlbmRpZlxcblxcblxcdCNpZmRlZiBVU0VfQUxQSEFfTUFQXFxuXFxuXFx0XFx0bWF0Lm9wYWNpdHkgPSB0ZXh0dXJlMkQoIGFscGhhTWFwLCB2VXYgKS54O1xcblxcblxcdCNlbHNlXFxuXFxuXFx0XFx0bWF0Lm9wYWNpdHkgPSBvcGFjaXR5O1xcblxcblxcdCNlbmRpZlxcblxcdFxcblxcdGlmKCBtYXQub3BhY2l0eSA8IDAuNSApIGRpc2NhcmQ7XFxuXFxuXFx0bWF0LmRpZmZ1c2VDb2xvciA9IG1peCggbWF0LmFsYmVkbywgdmVjMyggMC4wLCAwLjAsIDAuMCApLCBtYXQubWV0YWxuZXNzICk7XFxuXFx0bWF0LnNwZWN1bGFyQ29sb3IgPSBtaXgoIHZlYzMoIDEuMCwgMS4wLCAxLjAgKSwgbWF0LmFsYmVkbywgbWF0Lm1ldGFsbmVzcyApO1xcblxcblxcdC8vIG91dHB1dFxcblxcdHZlYzMgb3V0Q29sb3IgPSB2ZWMzKCAwLjAgKTtcXG5cXHRmbG9hdCBvdXRPcGFjaXR5ID0gbWF0Lm9wYWNpdHk7XFxuXFxuXFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0XFx0RGVwdGhcXG5cXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG5cXHQjaWZkZWYgREVQVEhcXG5cXG5cXHRcXHRmbG9hdCBmcmFnQ29vcmRaID0gMC41ICogdkhpZ2hQcmVjaXNpb25aVy54IC8gdkhpZ2hQcmVjaXNpb25aVy55ICsgMC41O1xcblxcdFxcdGdsX0ZyYWdDb2xvciA9IHBhY2tEZXB0aFRvUkdCQSggZnJhZ0Nvb3JkWiApO1xcblxcdFxcdHJldHVybjtcXG5cXHRcXG5cXHQjZW5kaWZcXG5cXG5cXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRcXHRHZW9tZXRyeVxcblxcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcblxcdGZsb2F0IGZhY2VEaXJlY3Rpb24gPSBnbF9Gcm9udEZhY2luZyA/IDEuMCA6IC0xLjA7XFxuXFxuXFx0R2VvbWV0cnkgZ2VvO1xcblxcdGdlby5wb3MgPSAtdlZpZXdQb3M7XFxuXFx0Z2VvLnBvc1dvcmxkID0gdldvcmxkUG9zO1xcblxcdGdlby52aWV3RGlyID0gbm9ybWFsaXplKCB2Vmlld1BvcyApO1xcblxcdGdlby52aWV3RGlyV29ybGQgPSBub3JtYWxpemUoIGdlby5wb3NXb3JsZCAtIGNhbWVyYVBvc2l0aW9uICk7XFxuXFx0Z2VvLm5vcm1hbCA9IG5vcm1hbGl6ZSggdk5vcm1hbCApICogZmFjZURpcmVjdGlvbjtcXG5cXG5cXHQjaWZkZWYgVVNFX05PUk1BTF9NQVBcXG5cXHRcXHRcXG5cXHRcXHR2ZWMzIHRhbmdlbnQgPSBub3JtYWxpemUoIHZUYW5nZW50ICk7XFxuXFx0XFx0dmVjMyBiaXRhbmdlbnQgPSBub3JtYWxpemUoIHZCaXRhbmdlbnQgKTtcXG5cXG5cXHRcXHQjaWZkZWYgRE9VQkxFX1NJREVEXFxuXFxuXFx0XFx0XFx0dGFuZ2VudCAqPSBmYWNlRGlyZWN0aW9uO1xcblxcdFxcdFxcdGJpdGFuZ2VudCAqPSBmYWNlRGlyZWN0aW9uO1xcblxcdFxcdFxcblxcdFxcdCNlbmRpZlxcblxcdFxcdFxcblxcdFxcdG1hdDMgdlRCTiA9IG1hdDMoIHRhbmdlbnQsIGJpdGFuZ2VudCwgZ2VvLm5vcm1hbCApO1xcblxcdFxcdFxcblxcdFxcdHZlYzMgbWFwTiA9IHRleHR1cmUyRCggbm9ybWFsTWFwLCB2VXYgKS54eXo7XFxuXFx0XFx0bWFwTiA9IG1hcE4gKiAyLjAgLSAxLjA7XFxuXFx0XFx0Z2VvLm5vcm1hbCA9IG5vcm1hbGl6ZSggdlRCTiAqIG1hcE4gKTtcXG5cXG5cXHQjZW5kaWZcXG5cXHRcXG5cXHRnZW8ubm9ybWFsV29ybGQgPSBub3JtYWxpemUoICggdmVjNCggZ2VvLm5vcm1hbCwgMC4wICkgKiB2aWV3TWF0cml4ICkueHl6ICk7XFxuXFxuXFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0XFx0TGlnaHRpbmdcXG5cXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXHRcXG5cXHRMaWdodCBsaWdodDtcXG5cXG5cXHQjaWYgTlVNX0RJUl9MSUdIVFMgPiAwXFxuXFxuXFx0XFx0I3ByYWdtYSB1bnJvbGxfbG9vcF9zdGFydFxcblxcdFxcdFxcdGZvciAoIGludCBpID0gMDsgaSA8IE5VTV9ESVJfTElHSFRTOyBpICsrICkge1xcblxcblxcdFxcdFxcdFxcdGxpZ2h0LmRpcmVjdGlvbiA9IGRpcmVjdGlvbmFsTGlnaHRzWyBpIF0uZGlyZWN0aW9uO1xcblxcdFxcdFxcdFxcdGxpZ2h0LmNvbG9yID0gZGlyZWN0aW9uYWxMaWdodHNbIGkgXS5jb2xvcjtcXG5cXG5cXHRcXHRcXHRcXHRmbG9hdCBzaGFkb3cgPSAxLjA7XFxuXFx0XFx0XFx0XFx0XFxuXFx0XFx0XFx0XFx0I2lmIGRlZmluZWQoIFVTRV9TSEFET1dNQVAgKSAmJiBOVU1fRElSX0xJR0hUX1NIQURPV1MgPiAwXFxuXFxuXFx0XFx0XFx0XFx0XFx0c2hhZG93ID0gZ2V0U2hhZG93KCBkaXJlY3Rpb25hbFNoYWRvd01hcFsgaSBdLCBkaXJlY3Rpb25hbExpZ2h0U2hhZG93c1sgaSBdLnNoYWRvd01hcFNpemUsIGRpcmVjdGlvbmFsTGlnaHRTaGFkb3dzWyBpIF0uc2hhZG93QmlhcywgdkRpcmVjdGlvbmFsU2hhZG93Q29vcmRbIGkgXSApO1xcblxcblxcdFxcdFxcdFxcdCNlbmRpZlxcblxcblxcdFxcdFxcdFxcdG91dENvbG9yICs9IFJFKCBnZW8sIG1hdCwgbGlnaHQgKSAqIHNoYWRvdztcXG5cXHRcXHRcXHRcXHRcXG5cXHRcXHRcXHR9XFxuXFx0XFx0I3ByYWdtYSB1bnJvbGxfbG9vcF9lbmRcXG5cXG5cXHQjZW5kaWZcXG5cXG5cXHQjaWYgTlVNX1BPSU5UX0xJR0hUUyA+IDBcXG5cXG5cXHRcXHRQb2ludExpZ2h0IHBMaWdodDtcXG5cXHRcXHR2ZWMzIHY7XFxuXFx0XFx0ZmxvYXQgZDtcXG5cXHRcXHRmbG9hdCBhdHRlbnVhdGlvbjtcXG5cXHRcXHQjcHJhZ21hIHVucm9sbF9sb29wX3N0YXJ0XFxuXFxuXFx0XFx0XFx0Zm9yICggaW50IGkgPSAwOyBpIDwgTlVNX1BPSU5UX0xJR0hUUzsgaSArKyApIHtcXG5cXG5cXHRcXHRcXHRcXHRwTGlnaHQgPSBwb2ludExpZ2h0c1sgaSBdO1xcblxcblxcdFxcdFxcdFxcdHYgPSBwTGlnaHQucG9zaXRpb24gLSBnZW8ucG9zO1xcblxcdFxcdFxcdFxcdGQgPSBsZW5ndGgoIHYgKTtcXG5cXHRcXHRcXHRcXHRsaWdodC5kaXJlY3Rpb24gPSBub3JtYWxpemUoIHYgKTtcXG5cXHRcXHRcXG5cXHRcXHRcXHRcXHRsaWdodC5jb2xvciA9IHBMaWdodC5jb2xvcjtcXG5cXG5cXHRcXHRcXHRcXHRpZiggcExpZ2h0LmRpc3RhbmNlID4gMC4wICYmIHBMaWdodC5kZWNheSA+IDAuMCApIHtcXG5cXG5cXHRcXHRcXHRcXHRcXHRhdHRlbnVhdGlvbiA9IHBvdyggY2xhbXAoIC1kIC8gcExpZ2h0LmRpc3RhbmNlICsgMS4wLCAwLjAsIDEuMCApLCBwTGlnaHQuZGVjYXkgKTtcXG5cXHRcXHRcXHRcXHRcXHRsaWdodC5jb2xvciAqPSBhdHRlbnVhdGlvbjtcXG5cXG5cXHRcXHRcXHRcXHR9XFxuXFxuXFx0XFx0XFx0XFx0b3V0Q29sb3IgKz0gUkUoIGdlbywgbWF0LCBsaWdodCApO1xcblxcdFxcdFxcdFxcdFxcblxcdFxcdFxcdH1cXG5cXHRcXHRcXHRcXG5cXHRcXHQjcHJhZ21hIHVucm9sbF9sb29wX2VuZFxcblxcblxcdCNlbmRpZlxcblxcblxcdCNpZiBkZWZpbmVkKCBVU0VfRU5WX01BUCApIHx8IGRlZmluZWQoIElTX1JFRkxFQ1RJT05QTEFORSApXFxuXFxuXFx0XFx0ZmxvYXQgZE5WID0gY2xhbXAoIGRvdCggZ2VvLm5vcm1hbCwgZ2VvLnZpZXdEaXIgKSwgMC4wLCAxLjAgKTtcXG5cXHRcXHRmbG9hdCBFRiA9IGZyZXNuZWwoIGROViApO1xcblxcblxcdCNlbmRpZlxcblxcblxcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcblxcdFxcdEVudmlyb25tZW50IExpZ2h0aW5nXFxuXFx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxuXFx0I2lmZGVmIFVTRV9FTlZfTUFQXFxuXFxuXFx0XFx0dmVjMyByZWZEaXIgPSByZWZsZWN0KCBnZW8udmlld0RpcldvcmxkLCBnZW8ubm9ybWFsV29ybGQgKTtcXG5cXHRcXHRyZWZEaXIueCAqPSAtMS4wO1xcblxcdFxcblxcdFxcdHZlYzQgZW52TWFwQ29sb3IgPSB0ZXh0dXJlQ3ViZVVWKCBlbnZNYXAsIGdlby5ub3JtYWxXb3JsZCwgMS4wICkgKiBpYmxJbnRlbnNpdHkgKiBlbnZNYXBJbnRlbnNpdHk7XFxuXFx0XFx0b3V0Q29sb3IgKz0gbWF0LmRpZmZ1c2VDb2xvciAqIGVudk1hcENvbG9yLnh5eiAqICggMS4wIC0gbWF0Lm1ldGFsbmVzcyApO1xcblxcblxcdCNlbmRpZlxcblxcblxcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcblxcdFxcdFJlZmxlY3Rpb25cXG5cXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXHRcXG5cXHQjaWZkZWYgSVNfUkVGTEVDVElPTlBMQU5FXFxuXFx0XFxuXFx0XFx0dmVjMiByZWZVViA9IGdsX0ZyYWdDb29yZC54eSAvIHJlbmRlclJlc29sdXRpb247XFxuXFxuXFx0XFx0cmVmVVYueCArPSBnZW8ubm9ybWFsLnggKiAwLjU7XFxuXFxuXFx0XFx0ZmxvYXQgbCA9IChtYXQucm91Z2huZXNzICkgKiAxLjYgKiBSRUZfTUlQTUFQX0xFVkVMO1xcblxcblxcdFxcdGZsb2F0IG9mZnNldDEgPSBmbG9vciggbCApO1xcblxcdFxcdGZsb2F0IG9mZnNldDIgPSBvZmZzZXQxICsgMS4wO1xcblxcdFxcdGZsb2F0IGJsZW5kID0gZnJhY3QoIGwgKTtcXG5cXHRcXHRcXG5cXHRcXHR2ZWMyIHJ1djEgPSBnZXRSZWZNaXBtYXBVViggcmVmVVYsIG9mZnNldDEgKTtcXG5cXHRcXHR2ZWMyIHJ1djIgPSBnZXRSZWZNaXBtYXBVViggcmVmVVYsIG9mZnNldDIgKTtcXG5cXG5cXHRcXHR2ZWMzIHJlZjEgPSB0ZXh0dXJlQmljdWJpYyggcmVmbGVjdGlvblRleCwgcnV2MSwgbWlwTWFwUmVzb2x1dGlvbiApLnh5ejtcXG5cXHRcXHR2ZWMzIHJlZjIgPSB0ZXh0dXJlQmljdWJpYyggcmVmbGVjdGlvblRleCwgcnV2MiwgbWlwTWFwUmVzb2x1dGlvbiApLnh5ejtcXG5cXG5cXHRcXHR2ZWMzIHJlZiA9IG1hdC5zcGVjdWxhckNvbG9yICogbWl4KCByZWYxLCByZWYyLCBibGVuZCApO1xcblxcblxcdFxcdG91dENvbG9yID0gbWl4KFxcblxcdFxcdFxcdG91dENvbG9yICsgcmVmICogbWF0Lm1ldGFsbmVzcyxcXG5cXHRcXHRcXHRyZWYsXFxuXFx0XFx0XFx0RUZcXG5cXHRcXHQpO1xcblxcblxcdCNlbGlmIGRlZmluZWQoIFVTRV9FTlZfTUFQIClcXG5cXHRcXG5cXHRcXHR2ZWMzIGVudiA9IG1hdC5zcGVjdWxhckNvbG9yICogdGV4dHVyZUN1YmVVViggZW52TWFwLCByZWZEaXIsIG1hdC5yb3VnaG5lc3MgKS54eXogKiBlbnZNYXBJbnRlbnNpdHk7XFxuXFx0XFxuXFx0XFx0b3V0Q29sb3IgPSBtaXgoXFxuXFx0XFx0XFx0b3V0Q29sb3IgKyBlbnYgKiBtYXQubWV0YWxuZXNzLFxcblxcdFxcdFxcdGVudixcXG5cXHRcXHRcXHRFRlxcblxcdFxcdCk7XFxuXFx0XFxuXFx0I2VuZGlmXFxuXFxuXFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0XFx0RW1pc3Npb25cXG5cXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG5cXHQjaWZkZWYgVVNFX0VNSVNTSU9OX01BUFxcblxcblxcdFxcdG91dENvbG9yICs9IExpbmVhclRvc1JHQiggdGV4dHVyZTJEKCBlbWlzc2lvbk1hcCwgdlV2ICkgKS54eXo7XFxuXFx0XFxuXFx0I2Vsc2VcXG5cXG5cXHRcXHRvdXRDb2xvciArPSBlbWlzc2lvbjtcXG5cXG5cXHQjZW5kaWZcXG5cXG5cXHRnbF9GcmFnQ29sb3IgPSB2ZWM0KCBvdXRDb2xvciwgb3V0T3BhY2l0eSApO1xcblxcbn1cIjsiLCJleHBvcnQgZGVmYXVsdCBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzQgdGFuZ2VudDtcXG5cXG52YXJ5aW5nIHZlYzIgdlV2O1xcbnZhcnlpbmcgdmVjMyB2Tm9ybWFsO1xcbnZhcnlpbmcgdmVjMyB2Vmlld05vcm1hbDtcXG52YXJ5aW5nIHZlYzMgdlRhbmdlbnQ7XFxudmFyeWluZyB2ZWMzIHZCaXRhbmdlbnQ7XFxudmFyeWluZyB2ZWMzIHZWaWV3UG9zO1xcbnZhcnlpbmcgdmVjMyB2V29ybGRQb3M7XFxudmFyeWluZyB2ZWMyIHZIaWdoUHJlY2lzaW9uWlc7XFxuXFxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0U2hhZG93TWFwXFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxuI2luY2x1ZGUgPHNoYWRvd21hcF9wYXJzX3ZlcnRleD5cXG5cXG52b2lkIG1haW4oIHZvaWQgKSB7XFxuXFxuXFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0XFx0UG9zaXRpb25cXG5cXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG5cXHR2ZWMzIHBvcyA9IHBvc2l0aW9uO1xcblxcdHZlYzQgd29ybGRQb3MgPSBtb2RlbE1hdHJpeCAqIHZlYzQoIHBvcywgMS4wICk7XFxuXFx0dmVjNCBtdlBvc2l0aW9uID0gdmlld01hdHJpeCAqIHdvcmxkUG9zO1xcblxcdFxcblxcdGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxuXFxuXFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0XFx0Tm9ybWFsIC8gVGFuZ2VudFxcblxcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcblxcdHZlYzMgdHJhbnNmb3JtZWROb3JtYWwgPSBub3JtYWxNYXRyaXggKiBub3JtYWw7XFxuXFx0dmVjNCBmbGlwZWRUYW5nZW50ID0gdGFuZ2VudDtcXG5cXHRmbGlwZWRUYW5nZW50LncgKj0gLTEuMDtcXG5cXG5cXHQjaWZkZWYgRkxJUF9TSURFRFxcblxcdFxcdHRyYW5zZm9ybWVkTm9ybWFsICo9IC0xLjA7XFxuXFx0XFx0ZmxpcGVkVGFuZ2VudCAqPSAtMS4wO1xcblxcdCNlbmRpZlxcblxcdFxcblxcdHZlYzMgbm9ybWFsID0gbm9ybWFsaXplKCB0cmFuc2Zvcm1lZE5vcm1hbCApO1xcblxcdHZlYzMgdGFuZ2VudCA9IG5vcm1hbGl6ZSggKCBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KCBmbGlwZWRUYW5nZW50Lnh5eiwgMC4wICkgKS54eXogKTtcXG5cXHR2ZWMzIGJpVGFuZ2VudCA9IG5vcm1hbGl6ZSggY3Jvc3MoIG5vcm1hbCwgdGFuZ2VudCApICogZmxpcGVkVGFuZ2VudC53ICk7XFxuXFxuXFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0XFx0U2hhZG93XFxuXFx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFx0XFxuXFx0dmVjNCBzaGFkb3dXb3JsZFBvcztcXG5cXHRcXG5cXHQjaWYgZGVmaW5lZCggVVNFX1NIQURPV01BUCApICYmIE5VTV9ESVJfTElHSFRfU0hBRE9XUyA+IDBcXG5cXHRcXG5cXHRcXHQjcHJhZ21hIHVucm9sbF9sb29wX3N0YXJ0XFxuXFx0XFx0Zm9yICggaW50IGkgPSAwOyBpIDwgTlVNX0RJUl9MSUdIVF9TSEFET1dTOyBpICsrICkge1xcblxcdFxcdFxcdFxcblxcdFxcdFxcdHNoYWRvd1dvcmxkUG9zID0gd29ybGRQb3MgKyB2ZWM0KCB2ZWM0KCB0cmFuc2Zvcm1lZE5vcm1hbCwgMC4wICkgKiBtb2RlbE1hdHJpeCApICogZGlyZWN0aW9uYWxMaWdodFNoYWRvd3NbIGkgXS5zaGFkb3dOb3JtYWxCaWFzO1xcblxcdFxcdFxcdHZEaXJlY3Rpb25hbFNoYWRvd0Nvb3JkWyBpIF0gPSBkaXJlY3Rpb25hbFNoYWRvd01hdHJpeFsgaSBdICogc2hhZG93V29ybGRQb3M7XFxuXFx0XFx0XFx0XFxuXFx0XFx0fVxcblxcdFxcdCNwcmFnbWEgdW5yb2xsX2xvb3BfZW5kXFxuXFx0XFx0XFxuXFx0I2VuZGlmXFxuXFxuXFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0XFx0VmFyeWluZ1xcblxcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcdFxcblxcdHZVdiA9IHV2O1xcblxcdHZOb3JtYWwgPSBub3JtYWw7XFxuXFx0dlRhbmdlbnQgPSB0YW5nZW50O1xcblxcdHZCaXRhbmdlbnQgPSBiaVRhbmdlbnQ7XFxuXFx0dlZpZXdQb3MgPSAtbXZQb3NpdGlvbi54eXo7XFxuXFx0dldvcmxkUG9zID0gd29ybGRQb3MueHl6O1xcblxcdHZIaWdoUHJlY2lzaW9uWlcgPSBnbF9Qb3NpdGlvbi56dztcXG5cXHRcXG59XCI7IiwiZXhwb3J0IGRlZmF1bHQgXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleDtcXG52YXJ5aW5nIHZlYzIgdlV2O1xcblxcbmZsb2F0IGNsaXAoIHZlYzIgdXYgKSB7XFxuXFx0dmVjMiBjID0gc3RlcCggYWJzKHV2IC0gMC41KSwgdmVjMiggMC41ICkgKTtcXG5cXHRyZXR1cm4gYy54ICogYy55O1xcbn1cXG5cXG52b2lkIG1haW4oIHZvaWQgKSB7XFxuXFxuXFx0dmVjNCBjb2wgPSB0ZXh0dXJlMkQoIHRleCwgdlV2ICk7XFxuXFx0Z2xfRnJhZ0NvbG9yID0gY29sO1xcblxcbn1cIjsiLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tICd0aHJlZSc7XHJcbmltcG9ydCAqIGFzIE9SRSBmcm9tICdvcmUtdGhyZWUtdHMnO1xyXG5cclxuaW1wb3J0IHBvd2VyVmVydCBmcm9tICcuL3NoYWRlcnMvcG93ZXIudnMnO1xyXG5pbXBvcnQgcG93ZXJGcmFnIGZyb20gJy4vc2hhZGVycy9wb3dlci5mcyc7XHJcblxyXG5leHBvcnQgdHlwZSBQb3dlck1lc2hNYXRlcmlhbFR5cGUgPSAnY29sb3InIHwgJ2RlcHRoJyB8ICdjb2MnXHJcbmV4cG9ydCBjbGFzcyBQb3dlck1lc2ggZXh0ZW5kcyBUSFJFRS5NZXNoPFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBUSFJFRS5TaGFkZXJNYXRlcmlhbD4ge1xyXG5cclxuXHRwcm90ZWN0ZWQgY29tbW9uVW5pZm9ybXM6IE9SRS5Vbmlmb3JtcztcclxuXHJcblx0Ly8gZW52TWFwXHJcblx0cHJvdGVjdGVkIGVudk1hcFJlc29sdXRpb246IG51bWJlcjtcclxuXHRwcm90ZWN0ZWQgZW52TWFwUmVuZGVyVGFyZ2V0OiBUSFJFRS5XZWJHTEN1YmVSZW5kZXJUYXJnZXQ7XHJcblx0cHJvdGVjdGVkIGVudk1hcENhbWVyYTogVEhSRUUuQ3ViZUNhbWVyYTtcclxuXHRwcm90ZWN0ZWQgZW52TWFwVXBkYXRlOiBib29sZWFuO1xyXG5cdHByb3RlY3RlZCBlbnZNYXBTcmM6IFRIUkVFLkN1YmVUZXh0dXJlIHwgVEhSRUUuVGV4dHVyZSB8IG51bGw7XHJcblxyXG5cdGNvbnN0cnVjdG9yKCBnZW9tZXRyeTogVEhSRUUuQnVmZmVyR2VvbWV0cnksIG1hdGVyaWFsT3B0aW9uPzogVEhSRUUuU2hhZGVyTWF0ZXJpYWxQYXJhbWV0ZXJzLCBvdmVycmlkZT86IGJvb2xlYW4gKTtcclxuXHJcblx0Y29uc3RydWN0b3IoIG1lc2g6IFRIUkVFLk1lc2gsIG1hdGVyaWFsT3B0aW9uPzogVEhSRUUuU2hhZGVyTWF0ZXJpYWxQYXJhbWV0ZXJzLCBvdmVycmlkZT86IGJvb2xlYW4gKTtcclxuXHJcblx0Y29uc3RydWN0b3IoIGdlb01lc2g6IFRIUkVFLkJ1ZmZlckdlb21ldHJ5IHwgVEhSRUUuTWVzaCwgbWF0ZXJpYWxPcHRpb24/OiBUSFJFRS5TaGFkZXJNYXRlcmlhbFBhcmFtZXRlcnMsIG92ZXJyaWRlPzogYm9vbGVhbiApIHtcclxuXHJcblx0XHRtYXRlcmlhbE9wdGlvbiA9IG1hdGVyaWFsT3B0aW9uIHx8IHt9O1xyXG5cclxuXHRcdGxldCB1bmkgPSBPUkUuVW5pZm9ybXNMaWIubWVyZ2VVbmlmb3JtcyggbWF0ZXJpYWxPcHRpb24udW5pZm9ybXMgfHwge30sIHtcclxuXHRcdFx0ZW52TWFwOiB7XHJcblx0XHRcdFx0dmFsdWU6IG51bGxcclxuXHRcdFx0fSxcclxuXHRcdFx0ZW52TWFwSW50ZW5zaXR5OiB7XHJcblx0XHRcdFx0dmFsdWU6IG51bGxcclxuXHRcdFx0fSxcclxuXHRcdFx0aWJsSW50ZW5zaXR5OiB7XHJcblx0XHRcdFx0dmFsdWU6IG51bGxcclxuXHRcdFx0fSxcclxuXHRcdFx0bWF4TG9kTGV2ZWw6IHtcclxuXHRcdFx0XHR2YWx1ZTogMFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRzaGFkb3dMaWdodE1vZGVsVmlld01hdHJpeDoge1xyXG5cdFx0XHRcdHZhbHVlOiBuZXcgVEhSRUUuTWF0cml4NCgpXHJcblx0XHRcdH0sXHJcblx0XHRcdHNoYWRvd0xpZ2h0UHJvamVjdGlvbk1hdHJpeDoge1xyXG5cdFx0XHRcdHZhbHVlOiBuZXcgVEhSRUUuTWF0cml4NCgpXHJcblx0XHRcdH0sXHJcblx0XHRcdHNoYWRvd0xpZ2h0RGlyZWN0aW9uOiB7XHJcblx0XHRcdFx0dmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IzKClcclxuXHRcdFx0fSxcclxuXHRcdFx0c2hhZG93TGlnaHRDYW1lcmFDbGlwOiB7XHJcblx0XHRcdFx0dmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKClcclxuXHRcdFx0fSxcclxuXHRcdFx0c2hhZG93TWFwOiB7XHJcblx0XHRcdFx0dmFsdWU6IG51bGxcclxuXHRcdFx0fSxcclxuXHRcdFx0c2hhZG93TWFwU2l6ZToge1xyXG5cdFx0XHRcdHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMigpXHJcblx0XHRcdH0sXHJcblx0XHRcdHNoYWRvd01hcFJlc29sdXRpb246IHtcclxuXHRcdFx0XHR2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIoKVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRzaGFkb3dMaWdodFNpemU6IHtcclxuXHRcdFx0XHR2YWx1ZTogMS4wXHJcblx0XHRcdH0sXHJcblx0XHRcdGNhbWVyYU5lYXI6IHtcclxuXHRcdFx0XHR2YWx1ZTogMC4wMVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRjYW1lcmFGYXI6IHtcclxuXHRcdFx0XHR2YWx1ZTogMTAwMC4wXHJcblx0XHRcdH1cclxuXHRcdH0gKTtcclxuXHJcblx0XHR1bmkgPSBPUkUuVW5pZm9ybXNMaWIubWVyZ2VVbmlmb3JtcyggdW5pLCBUSFJFRS5Vbmlmb3Jtc1V0aWxzLmNsb25lKCBUSFJFRS5Vbmlmb3Jtc0xpYi5saWdodHMgKSApO1xyXG5cclxuXHRcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0XHRHZW9tZXRyeVxyXG5cdFx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG5cdFx0bGV0IGdlbzogVEhSRUUuQnVmZmVyR2VvbWV0cnk7XHJcblxyXG5cdFx0aWYgKCAnaXNCdWZmZXJHZW9tZXRyeScgaW4gZ2VvTWVzaCApIHtcclxuXHJcblx0XHRcdGdlbyA9IGdlb01lc2g7XHJcblxyXG5cdFx0fSBlbHNlIGlmICggJ2lzTWVzaCcgaW4gZ2VvTWVzaCApIHtcclxuXHJcblx0XHRcdGdlbyA9IGdlb01lc2guZ2VvbWV0cnk7XHJcblxyXG5cdFx0XHRsZXQgbWF0ID0gKCBnZW9NZXNoLm1hdGVyaWFsIGFzIFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsICk7XHJcblxyXG5cdFx0XHRpZiAoIG1hdC5pc01lc2hTdGFuZGFyZE1hdGVyaWFsICkge1xyXG5cclxuXHRcdFx0XHRpZiAoIG1hdC5tYXAgKSB7XHJcblxyXG5cdFx0XHRcdFx0dW5pLm1hcCA9IHtcclxuXHRcdFx0XHRcdFx0dmFsdWU6IG1hdC5tYXBcclxuXHRcdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdH0gZWxzZSBpZiAoIG1hdC5jb2xvciApIHtcclxuXHJcblx0XHRcdFx0XHR1bmkuY29sb3IgPSB7XHJcblx0XHRcdFx0XHRcdHZhbHVlOiBtYXQuY29sb3JcclxuXHRcdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKCBtYXQucm91Z2huZXNzTWFwICkge1xyXG5cclxuXHRcdFx0XHRcdHVuaS5yb3VnaG5lc3NNYXAgPSB7XHJcblx0XHRcdFx0XHRcdHZhbHVlOiBtYXQucm91Z2huZXNzTWFwXHJcblx0XHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHRcdHVuaS5yb3VnaG5lc3MgPSB7XHJcblx0XHRcdFx0XHRcdHZhbHVlOiBtYXQucm91Z2huZXNzXHJcblx0XHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmICggbWF0LmFscGhhTWFwICkge1xyXG5cclxuXHRcdFx0XHRcdHVuaS5hbHBoYU1hcCA9IHtcclxuXHRcdFx0XHRcdFx0dmFsdWU6IG1hdC5hbHBoYU1hcFxyXG5cdFx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdFx0XHR1bmkub3BhY2l0eSA9IHtcclxuXHRcdFx0XHRcdFx0dmFsdWU6IG1hdC5vcGFjaXR5XHJcblx0XHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmICggbWF0Lm1ldGFsbmVzc01hcCApIHtcclxuXHJcblx0XHRcdFx0XHR1bmkubWV0YWxuZXNzTWFwID0ge1xyXG5cdFx0XHRcdFx0XHR2YWx1ZTogbWF0Lm1ldGFsbmVzc01hcFxyXG5cdFx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdFx0XHR1bmkubWV0YWxuZXNzID0ge1xyXG5cdFx0XHRcdFx0XHR2YWx1ZTogbWF0Lm1ldGFsbmVzc1xyXG5cdFx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoIG1hdC5ub3JtYWxNYXAgKSB7XHJcblxyXG5cdFx0XHRcdFx0dW5pLm5vcm1hbE1hcCA9IHtcclxuXHRcdFx0XHRcdFx0dmFsdWU6IG1hdC5ub3JtYWxNYXBcclxuXHRcdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKCBtYXQuZW1pc3NpdmVNYXAgKSB7XHJcblxyXG5cdFx0XHRcdFx0dW5pLmVtaXNzaW9uTWFwID0ge1xyXG5cdFx0XHRcdFx0XHR2YWx1ZTogbWF0LmVtaXNzaXZlTWFwXHJcblx0XHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHRcdHVuaS5lbWlzc2lvbiA9IHtcclxuXHRcdFx0XHRcdFx0dmFsdWU6IG1hdC5lbWlzc2l2ZVxyXG5cdFx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRnZW8gPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gdGFuZ2VudHNcclxuXHJcblx0XHRpZiAoICEgZ2VvLmdldEF0dHJpYnV0ZSggJ3RhbmdlbnQnICkgKSB7XHJcblxyXG5cdFx0XHRpZiAoXHJcblx0XHRcdFx0Z2VvLmdldEluZGV4KCkgJiZcclxuXHRcdFx0XHRnZW8uZ2V0QXR0cmlidXRlKCAncG9zaXRpb24nICkgJiZcclxuXHRcdFx0XHRnZW8uZ2V0QXR0cmlidXRlKCAnbm9ybWFsJyApICYmXHJcblx0XHRcdFx0Z2VvLmdldEF0dHJpYnV0ZSggJ3V2JyApXHJcblx0XHRcdCkge1xyXG5cclxuXHRcdFx0XHRnZW8uY29tcHV0ZVRhbmdlbnRzKCk7XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0XHRNYXRlcmlhbFxyXG5cdFx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG5cdFx0bWF0ZXJpYWxPcHRpb24udW5pZm9ybXMgPSB1bmk7XHJcblxyXG5cdFx0bGV0IG1hdCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCgge1xyXG5cdFx0XHR2ZXJ0ZXhTaGFkZXI6IHBvd2VyVmVydCxcclxuXHRcdFx0ZnJhZ21lbnRTaGFkZXI6IHBvd2VyRnJhZyxcclxuXHRcdFx0bGlnaHRzOiB0cnVlLFxyXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZSxcclxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZSxcclxuXHRcdFx0ZXh0ZW5zaW9uczoge1xyXG5cdFx0XHRcdGRlcml2YXRpdmVzOiB0cnVlLFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRkZWZpbmVzOiB7XHJcblx0XHRcdH0sXHJcblx0XHRcdC4uLm1hdGVyaWFsT3B0aW9uXHJcblx0XHR9ICk7XHJcblxyXG5cdFx0aWYgKCB1bmkubWFwICkge1xyXG5cclxuXHRcdFx0bWF0LmRlZmluZXMuVVNFX01BUCA9ICcnO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIHVuaS5yb3VnaG5lc3NNYXAgKSB7XHJcblxyXG5cdFx0XHRtYXQuZGVmaW5lcy5VU0VfUk9VR0hORVNTX01BUCA9ICcnO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIHVuaS5tZXRhbG5lc3NNYXAgKSB7XHJcblxyXG5cdFx0XHRtYXQuZGVmaW5lcy5VU0VfTUVUQUxORVNTX01BUCA9ICcnO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIHVuaS5hbHBoYU1hcCApIHtcclxuXHJcblx0XHRcdG1hdC5kZWZpbmVzLlVTRV9BTFBIQV9NQVAgPSAnJztcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCB1bmkubm9ybWFsTWFwICkge1xyXG5cclxuXHRcdFx0bWF0LmRlZmluZXMuVVNFX05PUk1BTF9NQVAgPSAnJztcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCB1bmkuZW1pc3Npb25NYXAgKSB7XHJcblxyXG5cdFx0XHRtYXQuZGVmaW5lcy5VU0VfRU1JU1NJT05fTUFQID0gJyc7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHN1cGVyKCBnZW8sIG1hdCApO1xyXG5cclxuXHRcdHRoaXMubmFtZSA9IGdlb01lc2gubmFtZTtcclxuXHJcblx0XHR0aGlzLnVzZXJEYXRhLmNvbG9yTWF0ID0gdGhpcy5tYXRlcmlhbDtcclxuXHJcblx0XHR0aGlzLmN1c3RvbURlcHRoTWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoIHtcclxuXHRcdFx0dmVydGV4U2hhZGVyOiBwb3dlclZlcnQsXHJcblx0XHRcdGZyYWdtZW50U2hhZGVyOiBwb3dlckZyYWcsXHJcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXHJcblx0XHRcdGxpZ2h0czogdHJ1ZSxcclxuXHRcdFx0ZXh0ZW5zaW9uczoge1xyXG5cdFx0XHRcdGRlcml2YXRpdmVzOiB0cnVlXHJcblx0XHRcdH0sXHJcblx0XHRcdC4uLm1hdGVyaWFsT3B0aW9uLFxyXG5cdFx0XHRkZWZpbmVzOiB7XHJcblx0XHRcdFx0Li4ubWF0LmRlZmluZXMsXHJcblx0XHRcdFx0J0RFUFRIJzogXCJcIixcclxuXHRcdFx0fSxcclxuXHRcdH0gKTtcclxuXHJcblx0XHR0aGlzLmNvbW1vblVuaWZvcm1zID0gdW5pO1xyXG5cclxuXHRcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0XHRUcmFuc2Zvcm1cclxuXHRcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRcdGlmICggJ2lzTWVzaCcgaW4gZ2VvTWVzaCAmJiBvdmVycmlkZSApIHtcclxuXHJcblx0XHRcdGdlb01lc2guZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG5cclxuXHRcdFx0bGV0IGNoaWxkQXJyYXkgPSBnZW9NZXNoLmNoaWxkcmVuLnNsaWNlKCk7XHJcblxyXG5cdFx0XHRjaGlsZEFycmF5LmZvckVhY2goIGNoaWxkID0+IHtcclxuXHJcblx0XHRcdFx0dGhpcy5hZGQoIGNoaWxkICk7XHJcblxyXG5cdFx0XHR9ICk7XHJcblxyXG5cdFx0XHR0aGlzLnBvc2l0aW9uLmNvcHkoIGdlb01lc2gucG9zaXRpb24gKTtcclxuXHRcdFx0dGhpcy5yb3RhdGlvbi5jb3B5KCBnZW9NZXNoLnJvdGF0aW9uICk7XHJcblx0XHRcdHRoaXMuc2NhbGUuY29weSggZ2VvTWVzaC5zY2FsZSApO1xyXG5cclxuXHRcdFx0bGV0IHBhcmVudCA9IGdlb01lc2gucGFyZW50O1xyXG5cclxuXHRcdFx0aWYgKCBwYXJlbnQgKSB7XHJcblxyXG5cdFx0XHRcdHBhcmVudC5hZGQoIHRoaXMgKTtcclxuXHJcblx0XHRcdFx0cGFyZW50LnJlbW92ZSggZ2VvTWVzaCApO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHRcdFx0RW52TWFwXHJcblx0XHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcblx0XHR0aGlzLmVudk1hcFNyYyA9IG51bGw7XHJcblx0XHR0aGlzLmVudk1hcFVwZGF0ZSA9IGZhbHNlO1xyXG5cdFx0dGhpcy5lbnZNYXBSZXNvbHV0aW9uID0gMjU2O1xyXG5cclxuXHRcdHRoaXMuZW52TWFwUmVuZGVyVGFyZ2V0ID0gbmV3IFRIUkVFLldlYkdMQ3ViZVJlbmRlclRhcmdldCggdGhpcy5lbnZNYXBSZXNvbHV0aW9uLCB7XHJcblx0XHRcdGZvcm1hdDogVEhSRUUuUkdCQUZvcm1hdCxcclxuXHRcdFx0Z2VuZXJhdGVNaXBtYXBzOiB0cnVlLFxyXG5cdFx0XHRtYWdGaWx0ZXI6IFRIUkVFLkxpbmVhckZpbHRlcixcclxuXHRcdFx0bWluRmlsdGVyOiBUSFJFRS5MaW5lYXJGaWx0ZXJcclxuXHRcdH0gKTtcclxuXHJcblx0XHR0aGlzLmVudk1hcENhbWVyYSA9IG5ldyBUSFJFRS5DdWJlQ2FtZXJhKCAwLjAwMSwgMTAwMCwgdGhpcy5lbnZNYXBSZW5kZXJUYXJnZXQgKTtcclxuXHRcdHRoaXMuZ2V0V29ybGRQb3NpdGlvbiggdGhpcy5lbnZNYXBDYW1lcmEucG9zaXRpb24gKTtcclxuXHJcblx0XHR0aGlzLm9uQmVmb3JlUmVuZGVyID0gKCByZW5kZXJlciwgc2NlbmUsIGNhbWVyYSApID0+IHtcclxuXHJcblx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudCgge1xyXG5cdFx0XHRcdHR5cGU6ICdiZWZvcmVSZW5kZXInLFxyXG5cdFx0XHRcdHJlbmRlcmVyLFxyXG5cdFx0XHRcdHNjZW5lLFxyXG5cdFx0XHRcdGNhbWVyYVxyXG5cdFx0XHR9ICk7XHJcblxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoICdiZWZvcmVSZW5kZXInLCAoIGU6IFRIUkVFLkV2ZW50ICkgPT4ge1xyXG5cclxuXHRcdFx0bGV0IHJlbmRlcmVyID0gZS5yZW5kZXJlcjtcclxuXHRcdFx0bGV0IHNjZW5lID0gZS5zY2VuZTtcclxuXHRcdFx0bGV0IGNhbWVyYSA9IGUuY2FtZXJhO1xyXG5cclxuXHRcdFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0XHRcdFx0RW52TWFwXHJcblx0XHRcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRcdFx0aWYgKCB0aGlzLmVudk1hcFVwZGF0ZSApIHtcclxuXHJcblx0XHRcdFx0bGV0IGVudk1hcFJUOiBUSFJFRS5XZWJHTFJlbmRlclRhcmdldCB8IG51bGwgPSBudWxsO1xyXG5cclxuXHRcdFx0XHRsZXQgcG1yZW1HZW5lcmF0b3IgPSBuZXcgVEhSRUUuUE1SRU1HZW5lcmF0b3IoIHJlbmRlcmVyICk7XHJcblx0XHRcdFx0cG1yZW1HZW5lcmF0b3IuY29tcGlsZUVxdWlyZWN0YW5ndWxhclNoYWRlcigpO1xyXG5cclxuXHRcdFx0XHRpZiAoIHRoaXMuZW52TWFwU3JjICkge1xyXG5cclxuXHRcdFx0XHRcdGlmICggJ2lzQ3ViZVRleHR1cmUnIGluIHRoaXMuZW52TWFwU3JjICkge1xyXG5cclxuXHRcdFx0XHRcdFx0ZW52TWFwUlQgPSBwbXJlbUdlbmVyYXRvci5mcm9tQ3ViZW1hcCggdGhpcy5lbnZNYXBTcmMgKTtcclxuXHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHRcdFx0ZW52TWFwUlQgPSBwbXJlbUdlbmVyYXRvci5mcm9tRXF1aXJlY3Rhbmd1bGFyKCB0aGlzLmVudk1hcFNyYyApO1xyXG5cclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdFx0XHR0aGlzLnZpc2libGUgPSBmYWxzZTtcclxuXHJcblx0XHRcdFx0XHR0aGlzLmVudk1hcENhbWVyYS51cGRhdGUoIHJlbmRlcmVyLCBzY2VuZSApO1xyXG5cdFx0XHRcdFx0ZW52TWFwUlQgPSBwbXJlbUdlbmVyYXRvci5mcm9tQ3ViZW1hcCggdGhpcy5lbnZNYXBSZW5kZXJUYXJnZXQudGV4dHVyZSApO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMudmlzaWJsZSA9IHRydWU7XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly8gZW52bWFwXHJcblx0XHRcdFx0bGV0IGVudk1hcFJlc29sdXRpb24gPSBlbnZNYXBSVC5oZWlnaHQ7XHJcblxyXG5cdFx0XHRcdGNvbnN0IG1heE1pcCA9IE1hdGgucm91bmQoIE1hdGgubG9nMiggZW52TWFwUmVzb2x1dGlvbiApICkgLSAyO1xyXG5cdFx0XHRcdGNvbnN0IHRleGVsSGVpZ2h0ID0gMS4wIC8gZW52TWFwUmVzb2x1dGlvbjtcclxuXHRcdFx0XHRjb25zdCB0ZXhlbFdpZHRoID0gMS4wIC8gKCAzICogTWF0aC5tYXgoIE1hdGgucG93KCAyLCBtYXhNaXAgKSwgNyAqIDE2ICkgKTtcclxuXHJcblx0XHRcdFx0bWF0LmRlZmluZXNbICdVU0VfRU5WX01BUCcgXSA9ICcnO1xyXG5cdFx0XHRcdG1hdC5kZWZpbmVzWyAnQ1VCRVVWX01BWF9NSVAnIF0gPSBtYXhNaXAgKyAnLjAnO1xyXG5cdFx0XHRcdG1hdC5kZWZpbmVzWyAnQ1VCRVVWX1RFWEVMX1dJRFRIJyBdID0gdGV4ZWxXaWR0aCArICcnO1xyXG5cdFx0XHRcdG1hdC5kZWZpbmVzWyAnQ1VCRVVWX1RFWEVMX0hFSUdIVCcgXSA9IHRleGVsSGVpZ2h0ICsgJyc7XHJcblxyXG5cdFx0XHRcdHRoaXMuY29tbW9uVW5pZm9ybXMuZW52TWFwLnZhbHVlID0gZW52TWFwUlQudGV4dHVyZTtcclxuXHRcdFx0XHR0aGlzLmVudk1hcFVwZGF0ZSA9IGZhbHNlO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0XHRcdFx0RGVwdGhcclxuXHRcdFx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG5cdFx0XHRpZiAoIGNhbWVyYS51c2VyRGF0YS5kZXB0aENhbWVyYSApIHtcclxuXHJcblx0XHRcdFx0dGhpcy5tYXRlcmlhbCA9IHRoaXMudXNlckRhdGEuZGVwdGhNYXQ7XHJcblx0XHRcdFx0dGhpcy5jb21tb25Vbmlmb3Jtcy5jYW1lcmFOZWFyLnZhbHVlID0gY2FtZXJhLm5lYXI7XHJcblx0XHRcdFx0dGhpcy5jb21tb25Vbmlmb3Jtcy5jYW1lcmFGYXIudmFsdWUgPSBjYW1lcmEuZmFyO1xyXG5cclxuXHRcdFx0XHRpZiAoICEgdGhpcy5tYXRlcmlhbCApIHtcclxuXHJcblx0XHRcdFx0XHR0aGlzLnZpc2libGUgPSBmYWxzZTtcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH0gKTtcclxuXHJcblx0XHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHRcdFx0RGlzcG9zZVxyXG5cdFx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG5cdFx0Y29uc3Qgb25EaXNwb3NlID0gKCkgPT4ge1xyXG5cclxuXHRcdFx0dGhpcy5lbnZNYXBSZW5kZXJUYXJnZXQuZGlzcG9zZSgpO1xyXG5cdFx0XHR0aGlzLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuXHRcdFx0dGhpcy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcblxyXG5cdFx0XHR0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdkaXNwb3NlJywgb25EaXNwb3NlICk7XHJcblxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoICdkaXNwb3NlJywgb25EaXNwb3NlICk7XHJcblxyXG5cdH1cclxuXHJcblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0XHRFbnZNYXAgLyBJQkxcclxuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcblx0cHVibGljIHVwZGF0ZUVudk1hcCggZW52TWFwOiBUSFJFRS5DdWJlVGV4dHVyZSB8IFRIUkVFLlRleHR1cmUgfCBudWxsID0gbnVsbCApIHtcclxuXHJcblx0XHR0aGlzLmVudk1hcFNyYyA9IGVudk1hcDtcclxuXHRcdHRoaXMuZW52TWFwVXBkYXRlID0gdHJ1ZTtcclxuXHJcblx0XHRpZiAoIHRoaXMuY29tbW9uVW5pZm9ybXMuZW52TWFwSW50ZW5zaXR5LnZhbHVlID09IG51bGwgKSB7XHJcblxyXG5cdFx0XHR0aGlzLmNvbW1vblVuaWZvcm1zLmVudk1hcEludGVuc2l0eS52YWx1ZSA9IDE7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggdGhpcy5jb21tb25Vbmlmb3Jtcy5pYmxJbnRlbnNpdHkudmFsdWUgPT0gbnVsbCApIHtcclxuXHJcblx0XHRcdHRoaXMuY29tbW9uVW5pZm9ybXMuaWJsSW50ZW5zaXR5LnZhbHVlID0gMTtcclxuXHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0cHVibGljIHNldCBlbnZNYXBJbnRlbnNpdHkoIHZhbHVlOiBudW1iZXIgKSB7XHJcblxyXG5cdFx0dGhpcy5jb21tb25Vbmlmb3Jtcy5lbnZNYXBJbnRlbnNpdHkudmFsdWUgPSB2YWx1ZTtcclxuXHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0IGlibEludGVuc2l0eSggdmFsdWU6IG51bWJlciApIHtcclxuXHJcblx0XHR0aGlzLmNvbW1vblVuaWZvcm1zLmlibEludGVuc2l0eS52YWx1ZSA9IHZhbHVlO1xyXG5cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkaXNwb3NlKCkge1xyXG5cclxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCggeyB0eXBlOiAnZGlzcHNvZScgfSApO1xyXG5cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBnZXQgaXNQb3dlck1lc2goKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblxyXG5cdH1cclxuXHJcbn1cclxuIiwiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSAndGhyZWUnO1xyXG5pbXBvcnQgKiBhcyBPUkUgZnJvbSAnb3JlLXRocmVlLXRzJztcclxuXHJcbmltcG9ydCB7IFBvd2VyTWVzaCB9IGZyb20gJy4uL1Bvd2VyTWVzaCc7XHJcblxyXG5pbXBvcnQgbWlwbWFwVmVydCBmcm9tICcuL3NoYWRlcnMvbWlwbWFwLnZzJztcclxuaW1wb3J0IG1pcG1hcEZyYWcgZnJvbSAnLi9zaGFkZXJzL21pcG1hcC5mcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgUG93ZXJSZWZsZWN0aW9uTWVzaCBleHRlbmRzIFBvd2VyTWVzaCB7XHJcblxyXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0UmVuZGVyVGFyZ2V0XHJcblx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG5cdHByaXZhdGUgcmVuZGVyVGFyZ2V0czoge1xyXG5cdFx0cmVmOiBUSFJFRS5XZWJHTFJlbmRlclRhcmdldCxcclxuXHRcdG1pcG1hcDogVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXRcclxuXHR9O1xyXG5cclxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHRcdE1pcG1hcFxyXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRwcml2YXRlIG1pcG1hcEdlbzogVEhSRUUuQnVmZmVyR2VvbWV0cnk7XHJcblx0cHJpdmF0ZSBtaXBtYXBQUDogT1JFLlBvc3RQcm9jZXNzaW5nIHwgbnVsbDtcclxuXHJcblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0XHRSZWZsZWN0aW9uIENhbWVyYVxyXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRwcml2YXRlIGxvb2tBdFBvc2l0aW9uOiBUSFJFRS5WZWN0b3IzO1xyXG5cdHByaXZhdGUgcm90YXRpb25NYXRyaXg6IFRIUkVFLk1hdHJpeDQ7XHJcblx0cHJpdmF0ZSB0YXJnZXQ6IFRIUkVFLlZlY3RvcjM7XHJcblx0cHJpdmF0ZSB2aWV3OiBUSFJFRS5WZWN0b3IzO1xyXG5cclxuXHRwcml2YXRlIHZpcnR1YWxDYW1lcmE6IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhO1xyXG5cdHByaXZhdGUgcmVmbGVjdG9yUGxhbmU6IFRIUkVFLlBsYW5lO1xyXG5cdHByaXZhdGUgbm9ybWFsOiBUSFJFRS5WZWN0b3IzO1xyXG5cclxuXHRwcml2YXRlIHJlZmxlY3RvcldvcmxkUG9zaXRpb246IFRIUkVFLlZlY3RvcjM7XHJcblx0cHJpdmF0ZSBjYW1lcmFXb3JsZFBvc2l0aW9uOiBUSFJFRS5WZWN0b3IzO1xyXG5cclxuXHRwcml2YXRlIGNsaXBQbGFuZTogVEhSRUUuVmVjdG9yNDtcclxuXHRwcml2YXRlIGNsaXBCaWFzOiBudW1iZXI7XHJcblx0cHJpdmF0ZSBxOiBUSFJFRS5WZWN0b3I0O1xyXG5cclxuXHRwcml2YXRlIHRleHR1cmVNYXRyaXg6IFRIUkVFLk1hdHJpeDQ7XHJcblxyXG5cdGNvbnN0cnVjdG9yKCBnZW9tZXRyeTogVEhSRUUuQnVmZmVyR2VvbWV0cnksIG1hdGVyaWFsT3B0aW9uPzogVEhSRUUuU2hhZGVyTWF0ZXJpYWxQYXJhbWV0ZXJzLCBvdmVycmlkZT86IGJvb2xlYW4gKTtcclxuXHJcblx0Y29uc3RydWN0b3IoIG1lc2g6IFRIUkVFLk1lc2gsIG1hdGVyaWFsT3B0aW9uPzogVEhSRUUuU2hhZGVyTWF0ZXJpYWxQYXJhbWV0ZXJzLCBvdmVycmlkZT86IGJvb2xlYW4gKTtcclxuXHJcblx0Y29uc3RydWN0b3IoIGdlb01lc2g6IFRIUkVFLkJ1ZmZlckdlb21ldHJ5IHwgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeT4sIG1hdGVyaWFsT3B0aW9uPzogVEhSRUUuU2hhZGVyTWF0ZXJpYWxQYXJhbWV0ZXJzLCBvdmVycmlkZT86IGJvb2xlYW4gKSB7XHJcblxyXG5cdFx0bWF0ZXJpYWxPcHRpb24gPSBtYXRlcmlhbE9wdGlvbiB8fCB7fTtcclxuXHJcblx0XHRtYXRlcmlhbE9wdGlvbi51bmlmb3JtcyA9IE9SRS5Vbmlmb3Jtc0xpYi5tZXJnZVVuaWZvcm1zKCBtYXRlcmlhbE9wdGlvbi51bmlmb3JtcyB8fCB7fSwge1xyXG5cdFx0XHRyZWZsZWN0aW9uVGV4OiB7XHJcblx0XHRcdFx0dmFsdWU6IG51bGxcclxuXHRcdFx0fSxcclxuXHRcdFx0cmVuZGVyUmVzb2x1dGlvbjoge1xyXG5cdFx0XHRcdHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMiggMSwgMSApXHJcblx0XHRcdH0sXHJcblx0XHRcdHRleHR1cmVNYXRyaXg6IHtcclxuXHRcdFx0XHR2YWx1ZTogbmV3IFRIUkVFLk1hdHJpeDQoKVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRtaXBNYXBSZXNvbHV0aW9uOiB7XHJcblx0XHRcdFx0dmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKCAxLCAxIClcclxuXHRcdFx0fVxyXG5cdFx0fSApO1xyXG5cclxuXHRcdG1hdGVyaWFsT3B0aW9uLmRlZmluZXMgPSB7XHJcblx0XHRcdElTX1JFRkxFQ1RJT05QTEFORTogJycsXHJcblx0XHR9O1xyXG5cclxuXHRcdHN1cGVyKCBnZW9NZXNoIGFzIFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBtYXRlcmlhbE9wdGlvbiwgb3ZlcnJpZGUgKTtcclxuXHJcblx0XHR0aGlzLnJlZmxlY3RvclBsYW5lID0gbmV3IFRIUkVFLlBsYW5lKCk7XHJcblx0XHR0aGlzLm5vcm1hbCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcblx0XHR0aGlzLnJlZmxlY3RvcldvcmxkUG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG5cdFx0dGhpcy5jYW1lcmFXb3JsZFBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuXHRcdHRoaXMucm90YXRpb25NYXRyaXggPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xyXG5cdFx0dGhpcy5sb29rQXRQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCAwLCAwLCAtIDEgKTtcclxuXHRcdHRoaXMuY2xpcFBsYW5lID0gbmV3IFRIUkVFLlZlY3RvcjQoKTtcclxuXHRcdHRoaXMudGV4dHVyZU1hdHJpeCA9IHRoaXMuY29tbW9uVW5pZm9ybXMudGV4dHVyZU1hdHJpeC52YWx1ZTtcclxuXHRcdHRoaXMuY2xpcEJpYXMgPSAwLjE7XHJcblxyXG5cdFx0dGhpcy52aWV3ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuXHRcdHRoaXMudGFyZ2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuXHRcdHRoaXMucSA9IG5ldyBUSFJFRS5WZWN0b3I0KCk7XHJcblxyXG5cdFx0dGhpcy52aXJ0dWFsQ2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKCk7XHJcblxyXG5cdFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0XHRcdE1pcE1hcFxyXG5cdFx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG5cdFx0dGhpcy5taXBtYXBQUCA9IG51bGw7XHJcblx0XHR0aGlzLm1pcG1hcEdlbyA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xyXG5cclxuXHRcdGxldCBwb3NBcnJheSA9IFtdO1xyXG5cdFx0bGV0IHV2QXJyYXkgPSBbXTtcclxuXHRcdGxldCBpbmRleEFycmF5ID0gW107XHJcblxyXG5cdFx0bGV0IHAgPSBuZXcgVEhSRUUuVmVjdG9yMiggMCwgMCApO1xyXG5cdFx0bGV0IHMgPSAyLjA7XHJcblxyXG5cdFx0cG9zQXJyYXkucHVzaCggcC54LCBwLnksIDAgKTtcclxuXHRcdHBvc0FycmF5LnB1c2goIHAueCArIHMsIHAueSwgMCApO1xyXG5cdFx0cG9zQXJyYXkucHVzaCggcC54ICsgcywgcC55IC0gcywgMCApO1xyXG5cdFx0cG9zQXJyYXkucHVzaCggcC54LCBwLnkgLSBzLCAwICk7XHJcblxyXG5cdFx0dXZBcnJheS5wdXNoKCAxLjAsIDEuMCApO1xyXG5cdFx0dXZBcnJheS5wdXNoKCAwLjAsIDEuMCApO1xyXG5cdFx0dXZBcnJheS5wdXNoKCAwLjAsIDAuMCApO1xyXG5cdFx0dXZBcnJheS5wdXNoKCAxLjAsIDAuMCApO1xyXG5cclxuXHRcdGluZGV4QXJyYXkucHVzaCggMCwgMiwgMSwgMCwgMywgMiApO1xyXG5cclxuXHRcdHAuc2V0KCBzLCAwICk7XHJcblxyXG5cdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwgNzsgaSArKyApIHtcclxuXHJcblx0XHRcdHMgKj0gMC41O1xyXG5cclxuXHRcdFx0cG9zQXJyYXkucHVzaCggcC54LFx0XHRwLnksXHRcdDAgKTtcclxuXHRcdFx0cG9zQXJyYXkucHVzaCggcC54ICsgcywgcC55LFx0XHQwICk7XHJcblx0XHRcdHBvc0FycmF5LnB1c2goIHAueCArIHMsIHAueSAtIHMsXHQwICk7XHJcblx0XHRcdHBvc0FycmF5LnB1c2goIHAueCxcdFx0cC55IC0gcywgXHQwICk7XHJcblxyXG5cdFx0XHR1dkFycmF5LnB1c2goIDEuMCwgMS4wICk7XHJcblx0XHRcdHV2QXJyYXkucHVzaCggMC4wLCAxLjAgKTtcclxuXHRcdFx0dXZBcnJheS5wdXNoKCAwLjAsIDAuMCApO1xyXG5cdFx0XHR1dkFycmF5LnB1c2goIDEuMCwgMC4wICk7XHJcblxyXG5cdFx0XHRsZXQgaW5kZXhPZmZzZXQgPSAoIGkgKyAwLjAgKSAqIDQ7XHJcblx0XHRcdGluZGV4QXJyYXkucHVzaCggaW5kZXhPZmZzZXQgKyAwLCBpbmRleE9mZnNldCArIDIsIGluZGV4T2Zmc2V0ICsgMSwgaW5kZXhPZmZzZXQgKyAwLCBpbmRleE9mZnNldCArIDMsIGluZGV4T2Zmc2V0ICsgMiApO1xyXG5cclxuXHRcdFx0cC55ID0gcC55IC0gcztcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IHBvc0F0dHIgPSBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCBuZXcgRmxvYXQzMkFycmF5KCBwb3NBcnJheSApLCAzICk7XHJcblx0XHRsZXQgdXZBdHRyID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggbmV3IEZsb2F0MzJBcnJheSggdXZBcnJheSApLCAyICk7XHJcblx0XHRsZXQgaW5kZXhBdHRyID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggbmV3IFVpbnQxNkFycmF5KCBpbmRleEFycmF5ICksIDEgKTtcclxuXHJcblx0XHRsZXQgZ3MgPSAxO1xyXG5cdFx0cG9zQXR0ci5hcHBseU1hdHJpeDQoIG5ldyBUSFJFRS5NYXRyaXg0KCkubWFrZVNjYWxlKCAoIDEuMCAvIDEuNSApLCBncywgZ3MgKSApO1xyXG5cdFx0cG9zQXR0ci5hcHBseU1hdHJpeDQoIG5ldyBUSFJFRS5NYXRyaXg0KCkubWFrZVRyYW5zbGF0aW9uKCAtIDEuMCwgMS4wLCAwICkgKTtcclxuXHJcblx0XHR0aGlzLm1pcG1hcEdlby5zZXRBdHRyaWJ1dGUoICdwb3NpdGlvbicsIHBvc0F0dHIgKTtcclxuXHRcdHRoaXMubWlwbWFwR2VvLnNldEF0dHJpYnV0ZSggJ3V2JywgdXZBdHRyICk7XHJcblx0XHR0aGlzLm1pcG1hcEdlby5zZXRJbmRleCggaW5kZXhBdHRyICk7XHJcblxyXG5cdFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0XHRcdFJlbmRlclRhcmdldHNcclxuXHRcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRcdHRoaXMucmVuZGVyVGFyZ2V0cyA9IHtcclxuXHRcdFx0cmVmOiBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQoIDEsIDEgKSxcclxuXHRcdFx0bWlwbWFwOiBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQoIDEsIDEgKSxcclxuXHRcdH07XHJcblxyXG5cdFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0XHRcdFJlZmxlY3Rpb25cclxuXHRcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lciggJ2JlZm9yZVJlbmRlcicsICggZTogVEhSRUUuRXZlbnQgKSA9PiB7XHJcblxyXG5cdFx0XHRsZXQgcmVuZGVyZXIgPSBlLnJlbmRlcmVyIGFzIFRIUkVFLldlYkdMUmVuZGVyZXI7XHJcblx0XHRcdGxldCBzY2VuZSA9IGUuc2NlbmUgYXMgVEhSRUUuU2NlbmU7XHJcblx0XHRcdGxldCBjYW1lcmEgPSBlLmNhbWVyYSBhcyBUSFJFRS5DYW1lcmE7XHJcblxyXG5cdFx0XHR0aGlzLnJlZmxlY3RvcldvcmxkUG9zaXRpb24uc2V0RnJvbU1hdHJpeFBvc2l0aW9uKCB0aGlzLm1hdHJpeFdvcmxkICk7XHJcblx0XHRcdHRoaXMuY2FtZXJhV29ybGRQb3NpdGlvbi5zZXRGcm9tTWF0cml4UG9zaXRpb24oIGNhbWVyYS5tYXRyaXhXb3JsZCApO1xyXG5cclxuXHRcdFx0dGhpcy5yb3RhdGlvbk1hdHJpeC5leHRyYWN0Um90YXRpb24oIHRoaXMubWF0cml4V29ybGQgKTtcclxuXHJcblx0XHRcdHRoaXMubm9ybWFsLnNldCggMCwgMS4wLCAwICk7XHJcblx0XHRcdHRoaXMubm9ybWFsLmFwcGx5TWF0cml4NCggdGhpcy5yb3RhdGlvbk1hdHJpeCApO1xyXG5cclxuXHRcdFx0dGhpcy52aWV3LnN1YlZlY3RvcnMoIHRoaXMucmVmbGVjdG9yV29ybGRQb3NpdGlvbiwgdGhpcy5jYW1lcmFXb3JsZFBvc2l0aW9uICk7XHJcblxyXG5cdFx0XHQvLyBBdm9pZCByZW5kZXJpbmcgd2hlbiByZWZsZWN0b3IgaXMgZmFjaW5nIGF3YXlcclxuXHJcblx0XHRcdGlmICggdGhpcy52aWV3LmRvdCggdGhpcy5ub3JtYWwgKSA+IDAgKSByZXR1cm47XHJcblxyXG5cdFx0XHR0aGlzLnZpZXcucmVmbGVjdCggdGhpcy5ub3JtYWwgKS5uZWdhdGUoKTtcclxuXHRcdFx0dGhpcy52aWV3LmFkZCggdGhpcy5yZWZsZWN0b3JXb3JsZFBvc2l0aW9uICk7XHJcblxyXG5cdFx0XHR0aGlzLnJvdGF0aW9uTWF0cml4LmV4dHJhY3RSb3RhdGlvbiggY2FtZXJhLm1hdHJpeFdvcmxkICk7XHJcblxyXG5cdFx0XHR0aGlzLmxvb2tBdFBvc2l0aW9uLnNldCggMCwgMCwgLSAxICk7XHJcblx0XHRcdHRoaXMubG9va0F0UG9zaXRpb24uYXBwbHlNYXRyaXg0KCB0aGlzLnJvdGF0aW9uTWF0cml4ICk7XHJcblx0XHRcdHRoaXMubG9va0F0UG9zaXRpb24uYWRkKCB0aGlzLmNhbWVyYVdvcmxkUG9zaXRpb24gKTtcclxuXHJcblx0XHRcdHRoaXMudGFyZ2V0LnN1YlZlY3RvcnMoIHRoaXMucmVmbGVjdG9yV29ybGRQb3NpdGlvbiwgdGhpcy5sb29rQXRQb3NpdGlvbiApO1xyXG5cdFx0XHR0aGlzLnRhcmdldC5yZWZsZWN0KCB0aGlzLm5vcm1hbCApLm5lZ2F0ZSgpO1xyXG5cdFx0XHR0aGlzLnRhcmdldC5hZGQoIHRoaXMucmVmbGVjdG9yV29ybGRQb3NpdGlvbiApO1xyXG5cclxuXHRcdFx0dGhpcy52aXJ0dWFsQ2FtZXJhLnBvc2l0aW9uLmNvcHkoIHRoaXMudmlldyApO1xyXG5cdFx0XHR0aGlzLnZpcnR1YWxDYW1lcmEudXAuc2V0KCAwLCAxLCAwICk7XHJcblx0XHRcdHRoaXMudmlydHVhbENhbWVyYS51cC5hcHBseU1hdHJpeDQoIHRoaXMucm90YXRpb25NYXRyaXggKTtcclxuXHRcdFx0dGhpcy52aXJ0dWFsQ2FtZXJhLnVwLnJlZmxlY3QoIHRoaXMubm9ybWFsICk7XHJcblx0XHRcdHRoaXMudmlydHVhbENhbWVyYS5sb29rQXQoIHRoaXMudGFyZ2V0ICk7XHJcblxyXG5cdFx0XHRpZiAoICggY2FtZXJhIGFzIFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhICkuZmFyICkge1xyXG5cclxuXHRcdFx0XHR0aGlzLnZpcnR1YWxDYW1lcmEuZmFyID0gKCBjYW1lcmEgYXMgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEgKS5mYXI7IC8vIFVzZWQgaW4gV2ViR0xCYWNrZ3JvdW5kXHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLnZpcnR1YWxDYW1lcmEudXBkYXRlTWF0cml4V29ybGQoKTtcclxuXHRcdFx0dGhpcy52aXJ0dWFsQ2FtZXJhLnByb2plY3Rpb25NYXRyaXguY29weSggY2FtZXJhLnByb2plY3Rpb25NYXRyaXggKTtcclxuXHJcblx0XHRcdC8vIFVwZGF0ZSB0aGUgdGV4dHVyZSBtYXRyaXhcclxuXHRcdFx0dGhpcy50ZXh0dXJlTWF0cml4LnNldChcclxuXHRcdFx0XHQwLjUsIDAuMCwgMC4wLCAwLjUsXHJcblx0XHRcdFx0MC4wLCAwLjUsIDAuMCwgMC41LFxyXG5cdFx0XHRcdDAuMCwgMC4wLCAwLjUsIDAuNSxcclxuXHRcdFx0XHQwLjAsIDAuMCwgMC4wLCAxLjBcclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdHRoaXMudGV4dHVyZU1hdHJpeC5tdWx0aXBseSggdGhpcy52aXJ0dWFsQ2FtZXJhLnByb2plY3Rpb25NYXRyaXggKTtcclxuXHRcdFx0dGhpcy50ZXh0dXJlTWF0cml4Lm11bHRpcGx5KCB0aGlzLnZpcnR1YWxDYW1lcmEubWF0cml4V29ybGRJbnZlcnNlICk7XHJcblx0XHRcdHRoaXMudGV4dHVyZU1hdHJpeC5tdWx0aXBseSggdGhpcy5tYXRyaXhXb3JsZCApO1xyXG5cclxuXHRcdFx0Ly8gTm93IHVwZGF0ZSBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIG5ldyBjbGlwIHBsYW5lLCBpbXBsZW1lbnRpbmcgY29kZSBmcm9tOiBodHRwOi8vd3d3LnRlcmF0aG9uLmNvbS9jb2RlL29ibGlxdWUuaHRtbFxyXG5cdFx0XHQvLyBQYXBlciBleHBsYWluaW5nIHRoaXMgdGVjaG5pcXVlOiBodHRwOi8vd3d3LnRlcmF0aG9uLmNvbS9sZW5neWVsL0xlbmd5ZWwtT2JsaXF1ZS5wZGZcclxuXHRcdFx0dGhpcy5yZWZsZWN0b3JQbGFuZS5zZXRGcm9tTm9ybWFsQW5kQ29wbGFuYXJQb2ludCggdGhpcy5ub3JtYWwsIHRoaXMucmVmbGVjdG9yV29ybGRQb3NpdGlvbiApO1xyXG5cdFx0XHR0aGlzLnJlZmxlY3RvclBsYW5lLmFwcGx5TWF0cml4NCggdGhpcy52aXJ0dWFsQ2FtZXJhLm1hdHJpeFdvcmxkSW52ZXJzZSApO1xyXG5cclxuXHRcdFx0dGhpcy5jbGlwUGxhbmUuc2V0KCB0aGlzLnJlZmxlY3RvclBsYW5lLm5vcm1hbC54LCB0aGlzLnJlZmxlY3RvclBsYW5lLm5vcm1hbC55LCB0aGlzLnJlZmxlY3RvclBsYW5lLm5vcm1hbC56LCB0aGlzLnJlZmxlY3RvclBsYW5lLmNvbnN0YW50ICk7XHJcblxyXG5cdFx0XHR2YXIgcHJvamVjdGlvbk1hdHJpeCA9IHRoaXMudmlydHVhbENhbWVyYS5wcm9qZWN0aW9uTWF0cml4O1xyXG5cclxuXHRcdFx0dGhpcy5xLnggPSAoIE1hdGguc2lnbiggdGhpcy5jbGlwUGxhbmUueCApICsgcHJvamVjdGlvbk1hdHJpeC5lbGVtZW50c1sgOCBdICkgLyBwcm9qZWN0aW9uTWF0cml4LmVsZW1lbnRzWyAwIF07XHJcblx0XHRcdHRoaXMucS55ID0gKCBNYXRoLnNpZ24oIHRoaXMuY2xpcFBsYW5lLnkgKSArIHByb2plY3Rpb25NYXRyaXguZWxlbWVudHNbIDkgXSApIC8gcHJvamVjdGlvbk1hdHJpeC5lbGVtZW50c1sgNSBdO1xyXG5cdFx0XHR0aGlzLnEueiA9IC0gMS4wO1xyXG5cdFx0XHR0aGlzLnEudyA9ICggMS4wICsgcHJvamVjdGlvbk1hdHJpeC5lbGVtZW50c1sgMTAgXSApIC8gcHJvamVjdGlvbk1hdHJpeC5lbGVtZW50c1sgMTQgXTtcclxuXHJcblx0XHRcdC8vIENhbGN1bGF0ZSB0aGUgc2NhbGVkIHBsYW5lIHZlY3RvclxyXG5cdFx0XHR0aGlzLmNsaXBQbGFuZS5tdWx0aXBseVNjYWxhciggMi4wIC8gdGhpcy5jbGlwUGxhbmUuZG90KCB0aGlzLnEgKSApO1xyXG5cclxuXHRcdFx0Ly8gUmVwbGFjaW5nIHRoZSB0aGlyZCByb3cgb2YgdGhlIHByb2plY3Rpb24gbWF0cml4XHJcblx0XHRcdHByb2plY3Rpb25NYXRyaXguZWxlbWVudHNbIDIgXSA9IHRoaXMuY2xpcFBsYW5lLng7XHJcblx0XHRcdHByb2plY3Rpb25NYXRyaXguZWxlbWVudHNbIDYgXSA9IHRoaXMuY2xpcFBsYW5lLnk7XHJcblx0XHRcdHByb2plY3Rpb25NYXRyaXguZWxlbWVudHNbIDEwIF0gPSB0aGlzLmNsaXBQbGFuZS56ICsgMS4wIC0gdGhpcy5jbGlwQmlhcztcclxuXHRcdFx0cHJvamVjdGlvbk1hdHJpeC5lbGVtZW50c1sgMTQgXSA9IHRoaXMuY2xpcFBsYW5lLnc7XHJcblxyXG5cdFx0XHQvL3JlbmRlclxyXG5cdFx0XHRsZXQgY3VycmVudFJlbmRlclRhcmdldCA9IHJlbmRlcmVyLmdldFJlbmRlclRhcmdldCgpO1xyXG5cclxuXHRcdFx0cmVuZGVyZXIuc2V0UmVuZGVyVGFyZ2V0KCB0aGlzLnJlbmRlclRhcmdldHMucmVmICk7XHJcblx0XHRcdHRoaXMudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuXHRcdFx0cmVuZGVyZXIuY2xlYXIoKTtcclxuXHRcdFx0cmVuZGVyZXIucmVuZGVyKCBzY2VuZSwgdGhpcy52aXJ0dWFsQ2FtZXJhICk7XHJcblx0XHRcdHJlbmRlcmVyLmNsZWFyRGVwdGgoKTtcclxuXHJcblx0XHRcdHJlbmRlcmVyLnNldFJlbmRlclRhcmdldCggY3VycmVudFJlbmRlclRhcmdldCApO1xyXG5cdFx0XHR0aGlzLnZpc2libGUgPSB0cnVlO1xyXG5cclxuXHRcdFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0XHRcdFx0TWlwTWFwUFBcclxuXHRcdFx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG5cdFx0XHRpZiAoIHRoaXMubWlwbWFwUFAgPT0gbnVsbCApIHtcclxuXHJcblx0XHRcdFx0dGhpcy5taXBtYXBQUCA9IG5ldyBPUkUuUG9zdFByb2Nlc3NpbmcoIHJlbmRlcmVyLCB7XHJcblx0XHRcdFx0XHRmcmFnbWVudFNoYWRlcjogbWlwbWFwRnJhZyxcclxuXHRcdFx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcclxuXHRcdFx0XHR9LCB0aGlzLm1pcG1hcEdlbyApO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5taXBtYXBQUC5yZW5kZXIoIHsgdGV4OiB0aGlzLnJlbmRlclRhcmdldHMucmVmLnRleHR1cmUgfSwgdGhpcy5yZW5kZXJUYXJnZXRzLm1pcG1hcCApO1xyXG5cdFx0XHR0aGlzLmNvbW1vblVuaWZvcm1zLnJlZmxlY3Rpb25UZXgudmFsdWUgPSB0aGlzLnJlbmRlclRhcmdldHMubWlwbWFwLnRleHR1cmU7XHJcblxyXG5cdFx0XHRsZXQgcnQgPSByZW5kZXJlci5nZXRSZW5kZXJUYXJnZXQoKSBhcyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldDtcclxuXHJcblx0XHRcdGlmICggcnQgKSB7XHJcblxyXG5cdFx0XHRcdHRoaXMuY29tbW9uVW5pZm9ybXMucmVuZGVyUmVzb2x1dGlvbi52YWx1ZS5zZXQoIHJ0LndpZHRoLCBydC5oZWlnaHQgKTtcclxuXHJcblx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdHJlbmRlcmVyLmdldFNpemUoIHRoaXMuY29tbW9uVW5pZm9ybXMucmVuZGVyUmVzb2x1dGlvbi52YWx1ZSApO1xyXG5cdFx0XHRcdHRoaXMuY29tbW9uVW5pZm9ybXMucmVuZGVyUmVzb2x1dGlvbi52YWx1ZS5tdWx0aXBseVNjYWxhciggcmVuZGVyZXIuZ2V0UGl4ZWxSYXRpbygpICk7XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fSApO1xyXG5cclxuXHRcdHRoaXMucmVzaXplKCk7XHJcblxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSByZXNpemUoKSB7XHJcblxyXG5cdFx0bGV0IHNpemUgPSA1MTI7XHJcblx0XHR0aGlzLnJlbmRlclRhcmdldHMucmVmLnNldFNpemUoIHNpemUsIHNpemUgKTtcclxuXHJcblx0XHRsZXQgbWlwTWFwU2l6ZSA9IG5ldyBUSFJFRS5WZWN0b3IyKCBzaXplICogMS41LCBzaXplICk7XHJcblx0XHR0aGlzLnJlbmRlclRhcmdldHMubWlwbWFwLnNldFNpemUoIG1pcE1hcFNpemUueCwgbWlwTWFwU2l6ZS55ICk7XHJcblx0XHR0aGlzLmNvbW1vblVuaWZvcm1zLm1pcE1hcFJlc29sdXRpb24udmFsdWUuY29weSggbWlwTWFwU2l6ZSApO1xyXG5cclxuXHR9XHJcblxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9vcmVfdGhyZWVfdHNfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfdGhyZWVfXzsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiZXhwb3J0IHsgUG93ZXJNZXNoIH0gZnJvbSBcIi4vUG93ZXJNZXNoXCI7XHJcbmV4cG9ydCB7IFBvd2VyUmVmbGVjdGlvbk1lc2ggfSBmcm9tIFwiLi9Qb3dlclJlZmxlY3Rpb25NZXNoXCI7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==