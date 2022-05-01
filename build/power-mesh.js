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
            },
            // default props
            color: {
                value: new three__WEBPACK_IMPORTED_MODULE_0__.Color(1.0, 1.0, 1.0)
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
                value: new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.0, 0.0, 0.0)
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
                    uni.color.value.copy(mat.color);
                }
                if (mat.roughnessMap) {
                    uni.roughnessMap = {
                        value: mat.roughnessMap
                    };
                }
                else {
                    uni.roughness.value = mat.roughness;
                }
                if (mat.alphaMap) {
                    uni.alphaMap = {
                        value: mat.alphaMap
                    };
                }
                else {
                    uni.opacity.value = mat.opacity;
                }
                if (mat.metalnessMap) {
                    uni.metalnessMap = {
                        value: mat.metalnessMap
                    };
                }
                else {
                    uni.metalness.value = mat.metalness;
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
                    uni.emission.value.copy(mat.emissive);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUMsSUFBSSxDQUFFLFVBQVUsQ0FBRSxDQUFDO0lBRS9ELENBQUM7Q0FFRDs7Ozs7Ozs7Ozs7QUNyVEQ7Ozs7Ozs7Ozs7QUNBQTs7Ozs7O1VDQUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTndDO0FBQ29CIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vUG93ZXJNZXNoL3dlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIndlYnBhY2s6Ly9Qb3dlck1lc2gvLi9zcmMvUG93ZXJNZXNoL3NoYWRlcnMvcG93ZXIuZnMiLCJ3ZWJwYWNrOi8vUG93ZXJNZXNoLy4vc3JjL1Bvd2VyTWVzaC9zaGFkZXJzL3Bvd2VyLnZzIiwid2VicGFjazovL1Bvd2VyTWVzaC8uL3NyYy9Qb3dlclJlZmxlY3Rpb25NZXNoL3NoYWRlcnMvbWlwbWFwLmZzIiwid2VicGFjazovL1Bvd2VyTWVzaC8uL3NyYy9Qb3dlck1lc2gvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vUG93ZXJNZXNoLy4vc3JjL1Bvd2VyUmVmbGVjdGlvbk1lc2gvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vUG93ZXJNZXNoL2V4dGVybmFsIHVtZCB7XCJjb21tb25qc1wiOlwib3JlLXRocmVlLXRzXCIsXCJjb21tb25qczJcIjpcIm9yZS10aHJlZS10c1wiLFwiYW1kXCI6XCJvcmUtdGhyZWUtdHNcIixcInJvb3RcIjpcIk9SRVwifSIsIndlYnBhY2s6Ly9Qb3dlck1lc2gvZXh0ZXJuYWwgdW1kIHtcImNvbW1vbmpzXCI6XCJ0aHJlZVwiLFwiY29tbW9uanMyXCI6XCJ0aHJlZVwiLFwiYW1kXCI6XCJ0aHJlZVwiLFwicm9vdFwiOlwiVEhSRUVcIn0iLCJ3ZWJwYWNrOi8vUG93ZXJNZXNoL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL1Bvd2VyTWVzaC93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9Qb3dlck1lc2gvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL1Bvd2VyTWVzaC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL1Bvd2VyTWVzaC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL1Bvd2VyTWVzaC8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCJ0aHJlZVwiKSwgcmVxdWlyZShcIm9yZS10aHJlZS10c1wiKSk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXCJ0aHJlZVwiLCBcIm9yZS10aHJlZS10c1wiXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJQb3dlck1lc2hcIl0gPSBmYWN0b3J5KHJlcXVpcmUoXCJ0aHJlZVwiKSwgcmVxdWlyZShcIm9yZS10aHJlZS10c1wiKSk7XG5cdGVsc2Vcblx0XHRyb290W1wiUG93ZXJNZXNoXCJdID0gZmFjdG9yeShyb290W1wiVEhSRUVcIl0sIHJvb3RbXCJPUkVcIl0pO1xufSkoc2VsZiwgZnVuY3Rpb24oX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV90aHJlZV9fLCBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX29yZV90aHJlZV90c19fKSB7XG5yZXR1cm4gIiwiZXhwb3J0IGRlZmF1bHQgXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnZhcnlpbmcgdmVjMiB2VXY7XFxudmFyeWluZyB2ZWMzIHZUYW5nZW50O1xcbnZhcnlpbmcgdmVjMyB2Qml0YW5nZW50O1xcblxcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcblxcdFJlcXVpcmVcXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG4jaW5jbHVkZSA8cGFja2luZz5cXG5cXG52ZWMyIHBhY2tpbmcxNiggZmxvYXQgdmFsdWUgKSB7IFxcblxcblxcdGZsb2F0IHYxID0gdmFsdWUgKiAyNTUuMDtcXG5cXHRmbG9hdCByID0gZmxvb3IodjEpO1xcblxcblxcdGZsb2F0IHYyID0gKCB2MSAtIHIgKSAqIDI1NS4wO1xcblxcdGZsb2F0IGcgPSBmbG9vciggdjIgKTtcXG5cXG5cXHRyZXR1cm4gdmVjMiggciwgZyApIC8gMjU1LjA7XFxuXFxufVxcblxcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcblxcdFJlcXVpZXJzXFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxuI2luY2x1ZGUgPGNvbW1vbj5cXG5cXG5mbG9hdCByYW5kb20odmVjMiBwKXtcXG5cXHRyZXR1cm4gZnJhY3Qoc2luKGRvdChwLnh5ICx2ZWMyKDEyLjk4OTgsNzguMjMzKSkpICogNDM3NTguNTQ1Myk7XFxufVxcblxcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcblxcdE1hdGVyaWFsIFVuaWZvcm1zXFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcblxcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcblxcdFRleHR1cmVzXFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxuI2lmZGVmIFVTRV9NQVBcXG5cXG5cXHR1bmlmb3JtIHNhbXBsZXIyRCBtYXA7XFxuXFxuI2Vsc2VcXG5cXG5cXHR1bmlmb3JtIHZlYzMgY29sb3I7XFxuXFxuI2VuZGlmXFxuXFxuI2lmZGVmIFVTRV9OT1JNQUxfTUFQXFxuXFxuXFx0dW5pZm9ybSBzYW1wbGVyMkQgbm9ybWFsTWFwO1xcblxcbiNlbmRpZlxcblxcbiNpZmRlZiBVU0VfUk9VR0hORVNTX01BUFxcblxcblxcdHVuaWZvcm0gc2FtcGxlcjJEIHJvdWdobmVzc01hcDtcXG5cXG4jZWxzZVxcblxcblxcdHVuaWZvcm0gZmxvYXQgcm91Z2huZXNzO1xcblxcbiNlbmRpZlxcblxcbiNpZmRlZiBVU0VfQUxQSEFfTUFQXFxuXFxuXFx0dW5pZm9ybSBzYW1wbGVyMkQgYWxwaGFNYXA7XFxuXFxuI2Vsc2VcXG5cXG5cXHR1bmlmb3JtIGZsb2F0IG9wYWNpdHk7XFxuXFx0XFxuI2VuZGlmXFxuXFxuI2lmZGVmIFVTRV9NRVRBTE5FU1NfTUFQXFxuXFxuXFx0dW5pZm9ybSBzYW1wbGVyMkQgbWV0YWxuZXNzTWFwO1xcblxcbiNlbHNlXFxuXFxuXFx0dW5pZm9ybSBmbG9hdCBtZXRhbG5lc3M7XFxuXFxuI2VuZGlmXFxuI2lmZGVmIFVTRV9FTUlTU0lPTl9NQVBcXG5cXG5cXHR1bmlmb3JtIHNhbXBsZXIyRCBlbWlzc2lvbk1hcDtcXG5cXG4jZWxzZVxcblxcblxcdHVuaWZvcm0gdmVjMyBlbWlzc2lvbjtcXG5cXG4jZW5kaWZcXG5cXG4jaWZkZWYgSVNfUkVGTEVDVElPTlBMQU5FXFxuXFxuXFx0dW5pZm9ybSBzYW1wbGVyMkQgcmVmbGVjdGlvblRleDtcXG5cXHR1bmlmb3JtIHZlYzIgcmVuZGVyUmVzb2x1dGlvbjtcXG5cXHR1bmlmb3JtIHZlYzIgbWlwTWFwUmVzb2x1dGlvbjtcXG5cXHRcXG4jZW5kaWZcXG5cXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRUeXBlc1xcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcbnN0cnVjdCBHZW9tZXRyeSB7XFxuXFx0dmVjMyBwb3M7XFxuXFx0dmVjMyBwb3NXb3JsZDtcXG5cXHR2ZWMzIHZpZXdEaXI7XFxuXFx0dmVjMyB2aWV3RGlyV29ybGQ7XFxuXFx0dmVjMyBub3JtYWw7XFxuXFx0dmVjMyBub3JtYWxXb3JsZDtcXG59O1xcblxcbnN0cnVjdCBMaWdodCB7XFxuXFx0dmVjMyBkaXJlY3Rpb247XFxuXFx0dmVjMyBjb2xvcjtcXG59O1xcblxcbnN0cnVjdCBNYXRlcmlhbCB7XFxuXFx0dmVjMyBhbGJlZG87XFxuXFx0dmVjMyBkaWZmdXNlQ29sb3I7XFxuXFx0dmVjMyBzcGVjdWxhckNvbG9yO1xcblxcdGZsb2F0IG1ldGFsbmVzcztcXG5cXHRmbG9hdCByb3VnaG5lc3M7XFxuXFx0ZmxvYXQgb3BhY2l0eTtcXG59O1xcblxcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcblxcdExpZ2h0c1xcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcbiNpZiBOVU1fRElSX0xJR0hUUyA+IDBcXG5cXG5cXHRzdHJ1Y3QgRGlyZWN0aW9uYWxMaWdodCB7XFxuXFx0XFx0dmVjMyBkaXJlY3Rpb247XFxuXFx0XFx0dmVjMyBjb2xvcjtcXG5cXHR9O1xcblxcblxcdHVuaWZvcm0gRGlyZWN0aW9uYWxMaWdodCBkaXJlY3Rpb25hbExpZ2h0c1sgTlVNX0RJUl9MSUdIVFMgXTtcXG5cXG4jZW5kaWZcXG5cXG4jaWYgTlVNX1BPSU5UX0xJR0hUUyA+IDBcXG5cXG5cXHRzdHJ1Y3QgUG9pbnRMaWdodCB7XFxuXFx0XFx0dmVjMyBwb3NpdGlvbjtcXG5cXHRcXHR2ZWMzIGNvbG9yO1xcblxcdFxcdGZsb2F0IGRpc3RhbmNlO1xcblxcdFxcdGZsb2F0IGRlY2F5O1xcblxcdH07XFxuXFxuXFx0dW5pZm9ybSBQb2ludExpZ2h0IHBvaW50TGlnaHRzWyBOVU1fUE9JTlRfTElHSFRTIF07XFxuXFxuI2VuZGlmXFxuXFxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0RW52TWFwXFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxuI2lmZGVmIFVTRV9FTlZfTUFQXFxuXFxuXFx0dW5pZm9ybSBzYW1wbGVyMkQgZW52TWFwO1xcblxcdHVuaWZvcm0gZmxvYXQgZW52TWFwSW50ZW5zaXR5O1xcblxcdHVuaWZvcm0gZmxvYXQgaWJsSW50ZW5zaXR5O1xcblxcdHVuaWZvcm0gZmxvYXQgbWF4TG9kTGV2ZWw7XFxuXFxuXFx0I2RlZmluZSBFTlZNQVBfVFlQRV9DVUJFX1VWXFxuXFx0I2luY2x1ZGUgPGN1YmVfdXZfcmVmbGVjdGlvbl9mcmFnbWVudD5cXG5cXG4jZW5kaWZcXG5cXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRSZWZsZWN0aW9uXFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxuI2RlZmluZSBSRUZfTUlQTUFQX0xFVkVMIDguMFxcblxcbiNpZmRlZiBJU19SRUZMRUNUSU9OUExBTkVcXG5cXG5cXHR2ZWMyIGdldFJlZk1pcG1hcFVWKCB2ZWMyIHV2LCBmbG9hdCBsZXZlbCApIHtcXG5cXG5cXHRcXHR2ZWMyIHJ1diA9IHV2O1xcblxcblxcdFxcdGlmKCBsZXZlbCA+IDAuMCApIHtcXG5cXG5cXHRcXHRcXHRydXYueCAqPSAxLjAgLyAoIDMuMCAqICggcG93KCAyLjAsIGxldmVsICkgLyAyLjAgKSApO1xcblxcdFxcdFxcdHJ1di55ICo9IDEuMCAvICggcG93KCAyLjAsIGxldmVsICkgKTtcXG5cXHRcXHRcXHRydXYueSArPSAxLjAgLyAoIHBvdyggMi4wLCBsZXZlbCApICk7XFxuXFx0XFx0XFx0cnV2LnggKz0gMS4wIC8gMS41O1xcblxcdFxcdFxcblxcdFxcdH0gZWxzZSB7XFxuXFxuXFx0XFx0XFx0cnV2LnggLz0gMS41O1xcblxcdFxcdFxcdFxcblxcdFxcdH1cXG5cXG5cXHRcXHRyZXR1cm4gcnV2O1xcblxcblxcdH1cXG5cXHRcXG5cXHR2ZWM0IGN1YmljKGZsb2F0IHYpIHtcXG5cXHRcXHR2ZWM0IG4gPSB2ZWM0KDEuMCwgMi4wLCAzLjAsIDQuMCkgLSB2O1xcblxcdFxcdHZlYzQgcyA9IG4gKiBuICogbjtcXG5cXHRcXHRmbG9hdCB4ID0gcy54O1xcblxcdFxcdGZsb2F0IHkgPSBzLnkgLSA0LjAgKiBzLng7XFxuXFx0XFx0ZmxvYXQgeiA9IHMueiAtIDQuMCAqIHMueSArIDYuMCAqIHMueDtcXG5cXHRcXHRmbG9hdCB3ID0gNi4wIC0geCAtIHkgLSB6O1xcblxcdFxcdHJldHVybiB2ZWM0KHgsIHksIHosIHcpO1xcblxcdH1cXG5cXG5cXHQvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMzUwMTA4MS9lZmZpY2llbnQtYmljdWJpYy1maWx0ZXJpbmctY29kZS1pbi1nbHNsXFxuXFx0dmVjNCB0ZXh0dXJlQmljdWJpYyhzYW1wbGVyMkQgdCwgdmVjMiB0ZXhDb29yZHMsIHZlYzIgdGV4dHVyZVNpemUpIHtcXG5cXHRcXHR2ZWMyIGludlRleFNpemUgPSAxLjAgLyB0ZXh0dXJlU2l6ZTtcXG5cXHRcXHR0ZXhDb29yZHMgPSB0ZXhDb29yZHMgKiB0ZXh0dXJlU2l6ZSAtIDAuNTtcXG5cXHRcXHR2ZWMyIGZ4eSA9IGZyYWN0KHRleENvb3Jkcyk7XFxuXFx0XFx0dGV4Q29vcmRzIC09IGZ4eTtcXG5cXHRcXHR2ZWM0IHhjdWJpYyA9IGN1YmljKGZ4eS54KTtcXG5cXHRcXHR2ZWM0IHljdWJpYyA9IGN1YmljKGZ4eS55KTtcXG5cXHRcXHR2ZWM0IGMgPSB0ZXhDb29yZHMueHh5eSArIHZlYzIgKC0wLjUsIDEuNSkueHl4eTtcXG5cXHRcXHR2ZWM0IHMgPSB2ZWM0KHhjdWJpYy54eiArIHhjdWJpYy55dywgeWN1YmljLnh6ICsgeWN1YmljLnl3KTtcXG5cXHRcXHR2ZWM0IG9mZnNldCA9IGMgKyB2ZWM0ICh4Y3ViaWMueXcsIHljdWJpYy55dykgLyBzO1xcblxcdFxcdG9mZnNldCAqPSBpbnZUZXhTaXplLnh4eXk7XFxuXFx0XFx0dmVjNCBzYW1wbGUwID0gdGV4dHVyZTJEKHQsIG9mZnNldC54eik7XFxuXFx0XFx0dmVjNCBzYW1wbGUxID0gdGV4dHVyZTJEKHQsIG9mZnNldC55eik7XFxuXFx0XFx0dmVjNCBzYW1wbGUyID0gdGV4dHVyZTJEKHQsIG9mZnNldC54dyk7XFxuXFx0XFx0dmVjNCBzYW1wbGUzID0gdGV4dHVyZTJEKHQsIG9mZnNldC55dyk7XFxuXFx0XFx0ZmxvYXQgc3ggPSBzLnggLyAocy54ICsgcy55KTtcXG5cXHRcXHRmbG9hdCBzeSA9IHMueiAvIChzLnogKyBzLncpO1xcblxcdFxcdHJldHVybiBtaXgoXFxuXFx0XFx0bWl4KHNhbXBsZTMsIHNhbXBsZTIsIHN4KSwgbWl4KHNhbXBsZTEsIHNhbXBsZTAsIHN4KSwgc3kpO1xcblxcdH1cXG5cXG4jZW5kaWZcXG5cXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRTaGFkb3dcXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG4jaWZkZWYgREVQVEhcXG5cXG5cXHR2YXJ5aW5nIHZlYzIgdkhpZ2hQcmVjaXNpb25aVztcXG5cXHR1bmlmb3JtIGZsb2F0IGNhbWVyYU5lYXI7XFxuXFx0dW5pZm9ybSBmbG9hdCBjYW1lcmFGYXI7XFxuXFxuI2VuZGlmXFxuXFxuI2lmZGVmIFVTRV9TSEFET1dNQVBcXG5cXG4jaWYgTlVNX0RJUl9MSUdIVF9TSEFET1dTID4gMFxcblxcblxcdFxcdHVuaWZvcm0gc2FtcGxlcjJEIGRpcmVjdGlvbmFsU2hhZG93TWFwWyBOVU1fRElSX0xJR0hUX1NIQURPV1MgXTtcXG5cXHRcXHR2YXJ5aW5nIHZlYzQgdkRpcmVjdGlvbmFsU2hhZG93Q29vcmRbIE5VTV9ESVJfTElHSFRfU0hBRE9XUyBdO1xcblxcblxcdFxcdHN0cnVjdCBEaXJlY3Rpb25hbExpZ2h0U2hhZG93IHtcXG5cXHRcXHRcXHRmbG9hdCBzaGFkb3dCaWFzO1xcblxcdFxcdFxcdGZsb2F0IHNoYWRvd05vcm1hbEJpYXM7XFxuXFx0XFx0XFx0ZmxvYXQgc2hhZG93UmFkaXVzO1xcblxcdFxcdFxcdHZlYzIgc2hhZG93TWFwU2l6ZTtcXG5cXHRcXHR9O1xcblxcblxcdFxcdHVuaWZvcm0gRGlyZWN0aW9uYWxMaWdodFNoYWRvdyBkaXJlY3Rpb25hbExpZ2h0U2hhZG93c1sgTlVNX0RJUl9MSUdIVF9TSEFET1dTIF07XFxuXFxuXFx0I2VuZGlmXFxuXFxuXFx0I2RlZmluZSBTSEFET1dfU0FNUExFX0NPVU5UIDRcXG5cXG5cXHR2ZWMyIHBvaXNzb25EaXNrWyBTSEFET1dfU0FNUExFX0NPVU5UIF07XFxuXFxuXFx0dm9pZCBpbml0UG9pc3NvbkRpc2soIGZsb2F0IHNlZWQgKSB7XFxuXFxuXFx0XFx0ZmxvYXQgciA9IDAuMTtcXG5cXHRcXHRmbG9hdCByU3RlcCA9ICgxLjAgLSByKSAvIGZsb2F0KCBTSEFET1dfU0FNUExFX0NPVU5UICk7XFxuXFxuXFx0XFx0ZmxvYXQgYW5nID0gcmFuZG9tKCBnbF9GcmFnQ29vcmQueHkgKiAwLjAxICsgc2luKCB0aW1lICkgKSAqIFBJMiAqIDEuMDtcXG5cXHRcXHRmbG9hdCBhbmdTdGVwID0gKCAoIFBJMiAqIDExLjAgKSAvIGZsb2F0KCBTSEFET1dfU0FNUExFX0NPVU5UICkgKTtcXG5cXHRcXHRcXG5cXHRcXHRmb3IoIGludCBpID0gMDsgaSA8IFNIQURPV19TQU1QTEVfQ09VTlQ7IGkrKyApIHtcXG5cXG5cXHRcXHRcXHRwb2lzc29uRGlza1sgaSBdID0gdmVjMihcXG5cXHRcXHRcXHRcXHRzaW4oIGFuZyApLFxcblxcdFxcdFxcdFxcdGNvcyggYW5nIClcXG5cXHRcXHRcXHQpICogcG93KCByLCAwLjc1ICk7XFxuXFxuXFx0XFx0XFx0ciArPSByU3RlcDtcXG5cXHRcXHRcXHRhbmcgKz0gYW5nU3RlcDtcXG5cXHRcXHR9XFxuXFx0XFx0XFxuXFx0fVxcblxcblxcdHZlYzIgY29tcGFpclNoYWRvd01hcERlcHRoKCBzYW1wbGVyMkQgc2hhZG93TWFwLCB2ZWMyIHNoYWRvd01hcFVWLCBmbG9hdCBkZXB0aCApIHtcXG5cXG5cXHRcXHRpZiggc2hhZG93TWFwVVYueCA8IDAuMCB8fCBzaGFkb3dNYXBVVi54ID4gMS4wIHx8IHNoYWRvd01hcFVWLnkgPCAwLjAgfHwgc2hhZG93TWFwVVYueSA+IDEuMCApIHtcXG5cXG5cXHRcXHRcXHRyZXR1cm4gdmVjMiggMS4wLCAwLjAgKTtcXG5cXG5cXHRcXHR9XFxuXFxuXFx0XFx0ZmxvYXQgc2hhZG93TWFwRGVwdGggPSB1bnBhY2tSR0JBVG9EZXB0aCggdGV4dHVyZTJEKCBzaGFkb3dNYXAsIHNoYWRvd01hcFVWICkgKTtcXG5cXG5cXHRcXHRpZiggMC4wID49IHNoYWRvd01hcERlcHRoIHx8IHNoYWRvd01hcERlcHRoID49IDEuMCApIHtcXG5cXG5cXHRcXHRcXHRyZXR1cm4gdmVjMiggMS4wLCAwLjAgKTtcXG5cXG5cXHRcXHR9XFxuXFx0XFx0XFxuXFx0XFx0ZmxvYXQgc2hhZG93ID0gZGVwdGggPD0gc2hhZG93TWFwRGVwdGggPyAxLjAgOiAwLjA7XFxuXFxuXFx0XFx0cmV0dXJuIHZlYzIoIHNoYWRvdywgc2hhZG93TWFwRGVwdGggKTtcXG5cXHRcXHRcXG5cXHR9XFxuXFxuXFx0ZmxvYXQgc2hhZG93TWFwUENGKCBzYW1wbGVyMkQgc2hhZG93TWFwLCB2ZWM0IHNoYWRvd01hcENvb3JkLCB2ZWMyIHNoYWRvd1NpemUgKSB7XFxuXFxuXFx0XFx0ZmxvYXQgc2hhZG93ID0gMC4wO1xcblxcdFxcdFxcblxcdFxcdGZvciggaW50IGkgPSAwOyBpIDwgU0hBRE9XX1NBTVBMRV9DT1VOVDsgaSArKyAgKSB7XFxuXFx0XFx0XFx0XFxuXFx0XFx0XFx0dmVjMiBvZmZzZXQgPSBwb2lzc29uRGlza1sgaSBdICogc2hhZG93U2l6ZTsgXFxuXFxuXFx0XFx0XFx0c2hhZG93ICs9IGNvbXBhaXJTaGFkb3dNYXBEZXB0aCggc2hhZG93TWFwLCBzaGFkb3dNYXBDb29yZC54eSArIG9mZnNldCwgc2hhZG93TWFwQ29vcmQueiApLng7XFxuXFx0XFx0XFx0XFxuXFx0XFx0fVxcblxcblxcdFxcdHNoYWRvdyAvPSBmbG9hdCggU0hBRE9XX1NBTVBMRV9DT1VOVCApO1xcblxcblxcdFxcdHJldHVybiBzaGFkb3c7XFxuXFxuXFx0fVxcblxcblxcdGZsb2F0IGdldFNoYWRvdyggc2FtcGxlcjJEIHNoYWRvd01hcCwgdmVjMiBzaGFkb3dNYXBTaXplLCBmbG9hdCBiaWFzLCB2ZWM0IHNoYWRvd01hcENvb3JkICkge1xcblxcdFxcdFxcblxcdFxcdHNoYWRvd01hcENvb3JkLnh5eiAvPSBzaGFkb3dNYXBDb29yZC53O1xcblxcdFxcdHNoYWRvd01hcENvb3JkLnogKz0gYmlhcyAtIDAuMDAwMTtcXG5cXG5cXHRcXHRpbml0UG9pc3NvbkRpc2sodGltZSk7XFxuXFxuXFx0XFx0dmVjMiBzaGFkb3dTaXplID0gMS4wIC8gc2hhZG93TWFwU2l6ZTtcXG5cXG5cXHRcXHRyZXR1cm4gc2hhZG93TWFwUENGKCBzaGFkb3dNYXAsIHNoYWRvd01hcENvb3JkLCBzaGFkb3dTaXplICk7XFxuXFxuXFx0fVxcblxcbiNlbmRpZlxcblxcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcblxcdFJFXFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxudmFyeWluZyB2ZWMzIHZOb3JtYWw7XFxudmFyeWluZyB2ZWMzIHZWaWV3Tm9ybWFsO1xcbnZhcnlpbmcgdmVjMyB2Vmlld1BvcztcXG52YXJ5aW5nIHZlYzMgdldvcmxkUG9zO1xcblxcbmZsb2F0IGdneCggZmxvYXQgZE5ILCBmbG9hdCByb3VnaG5lc3MgKSB7XFxuXFx0XFxuXFx0ZmxvYXQgYTIgPSByb3VnaG5lc3MgKiByb3VnaG5lc3M7XFxuXFx0YTIgPSBhMiAqIGEyO1xcblxcdGZsb2F0IGROSDIgPSBkTkggKiBkTkg7XFxuXFxuXFx0aWYoIGROSDIgPD0gMC4wICkgcmV0dXJuIDAuMDtcXG5cXG5cXHRyZXR1cm4gYTIgLyAoIFBJICogcG93KCBkTkgyICogKCBhMiAtIDEuMCApICsgMS4wLCAyLjApICk7XFxuXFxufVxcblxcbnZlYzMgbGFtYmVydCggdmVjMyBkaWZmdXNlQ29sb3IgKSB7XFxuXFxuXFx0cmV0dXJuIGRpZmZ1c2VDb2xvciAvIFBJO1xcblxcbn1cXG5cXG5mbG9hdCBnU2NobGljayggZmxvYXQgZCwgZmxvYXQgayApIHtcXG5cXG5cXHRpZiggZCA9PSAwLjAgKSByZXR1cm4gMC4wO1xcblxcblxcdHJldHVybiBkIC8gKCBkICogKCAxLjAgLSBrICkgKyBrICk7XFxuXFx0XFxufVxcblxcbmZsb2F0IGdTbWl0aCggZmxvYXQgZE5WLCBmbG9hdCBkTkwsIGZsb2F0IHJvdWdobmVzcyApIHtcXG5cXG5cXHRmbG9hdCBrID0gY2xhbXAoIHJvdWdobmVzcyAqIHNxcnQoIDIuMCAvIFBJICksIDAuMCwgMS4wICk7XFxuXFxuXFx0cmV0dXJuIGdTY2hsaWNrKCBkTlYsIGsgKSAqIGdTY2hsaWNrKCBkTkwsIGsgKTtcXG5cXHRcXG59XFxuXFxuZmxvYXQgZnJlc25lbCggZmxvYXQgZCApIHtcXG5cXHRcXG5cXHRmbG9hdCBmMCA9IDAuMDQ7XFxuXFxuXFx0cmV0dXJuIGYwICsgKCAxLjAgLSBmMCApICogcG93KCAxLjAgLSBkLCA1LjAgKTtcXG5cXG59XFxuXFxudmVjMyBSRSggR2VvbWV0cnkgZ2VvLCBNYXRlcmlhbCBtYXQsIExpZ2h0IGxpZ2h0KSB7XFxuXFxuXFx0dmVjMyBsaWdodERpciA9IG5vcm1hbGl6ZSggbGlnaHQuZGlyZWN0aW9uICk7XFxuXFx0dmVjMyBoYWxmVmVjID0gbm9ybWFsaXplKCBnZW8udmlld0RpciArIGxpZ2h0RGlyICk7XFxuXFxuXFx0ZmxvYXQgZExIID0gY2xhbXAoIGRvdCggbGlnaHREaXIsIGhhbGZWZWMgKSwgMC4wLCAxLjAgKTtcXG5cXHRmbG9hdCBkTkggPSBjbGFtcCggZG90KCBnZW8ubm9ybWFsLCBoYWxmVmVjICksIDAuMCwgMS4wICk7XFxuXFx0ZmxvYXQgZE5WID0gY2xhbXAoIGRvdCggZ2VvLm5vcm1hbCwgZ2VvLnZpZXdEaXIgKSwgMC4wLCAxLjAgKTtcXG5cXHRmbG9hdCBkTkwgPSBjbGFtcCggZG90KCBnZW8ubm9ybWFsLCBsaWdodERpciksIDAuMCwgMS4wICk7XFxuXFxuXFx0dmVjMyBpcnJhZGlhbmNlID0gbGlnaHQuY29sb3IgKiBkTkw7XFxuXFxuXFx0Ly8gZGlmZnVzZVxcblxcdHZlYzMgZGlmZnVzZSA9IGxhbWJlcnQoIG1hdC5kaWZmdXNlQ29sb3IgKSAqIGlycmFkaWFuY2U7XFxuXFxuXFx0Ly8gc3BlY3VsYXJcXG5cXHRmbG9hdCBEID0gZ2d4KCBkTkgsIG1hdC5yb3VnaG5lc3MgKTtcXG5cXHRmbG9hdCBHID0gZ1NtaXRoKCBkTlYsIGROTCwgbWF0LnJvdWdobmVzcyApO1xcblxcdGZsb2F0IEYgPSBmcmVzbmVsKCBkTEggKTtcXG5cXHRcXG5cXHR2ZWMzIHNwZWN1bGFyID0gKCggRCAqIEcgKiBGICkgLyAoIDQuMCAqIGROTCAqIGROViArIDAuMDAwMSApICogbWF0LnNwZWN1bGFyQ29sb3IgKSAqIGlycmFkaWFuY2U7IFxcblxcblxcdHZlYzMgYyA9IHZlYzMoIDAuMCApO1xcblxcdGMgKz0gZGlmZnVzZSAqICggMS4wIC0gRiApICsgc3BlY3VsYXI7XFxuXFxuXFx0cmV0dXJuIGM7XFxuXFxufVxcblxcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcblxcdE1haW5cXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG52b2lkIG1haW4oIHZvaWQgKSB7XFxuXFxuXFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0XFx0TWF0ZXJpYWxcXG5cXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG5cXHRNYXRlcmlhbCBtYXQ7XFxuXFxuXFx0I2lmZGVmIFVTRV9NQVBcXG5cXG5cXHRcXHR2ZWM0IGNvbG9yID0gTGluZWFyVG9zUkdCKCB0ZXh0dXJlMkQoIG1hcCwgdlV2ICkgKTtcXG5cXHRcXHRtYXQuYWxiZWRvID0gY29sb3IueHl6O1xcblxcblxcdCNlbHNlXFxuXFxuXFx0XFx0bWF0LmFsYmVkbyA9IGNvbG9yLnh5ejtcXG5cXHRcXHRtYXQub3BhY2l0eSA9IDEuMDtcXG5cXHRcXG5cXHQjZW5kaWZcXG5cXG5cXHQjaWZkZWYgVVNFX1JPVUdITkVTU19NQVBcXG5cXG5cXHRcXHRtYXQucm91Z2huZXNzID0gdGV4dHVyZTJEKCByb3VnaG5lc3NNYXAsIHZVdiApLnk7XFxuXFxuXFx0I2Vsc2VcXG5cXG5cXHRcXHRtYXQucm91Z2huZXNzID0gcm91Z2huZXNzO1xcblxcdFxcblxcdCNlbmRpZlxcblxcblxcdCNpZmRlZiBVU0VfTUVUQUxORVNTX01BUFxcblxcblxcdFxcdG1hdC5tZXRhbG5lc3MgPSB0ZXh0dXJlMkQoIG1ldGFsbmVzc01hcCwgdlV2ICkuejtcXG5cXG5cXHQjZWxzZVxcblxcblxcdFxcdG1hdC5tZXRhbG5lc3MgPSBtZXRhbG5lc3M7XFxuXFx0XFxuXFx0I2VuZGlmXFxuXFxuXFx0I2lmZGVmIFVTRV9BTFBIQV9NQVBcXG5cXG5cXHRcXHRtYXQub3BhY2l0eSA9IHRleHR1cmUyRCggYWxwaGFNYXAsIHZVdiApLng7XFxuXFxuXFx0I2Vsc2VcXG5cXG5cXHRcXHRtYXQub3BhY2l0eSA9IG9wYWNpdHk7XFxuXFxuXFx0I2VuZGlmXFxuXFx0XFxuXFx0aWYoIG1hdC5vcGFjaXR5IDwgMC41ICkgZGlzY2FyZDtcXG5cXG5cXHRtYXQuZGlmZnVzZUNvbG9yID0gbWl4KCBtYXQuYWxiZWRvLCB2ZWMzKCAwLjAsIDAuMCwgMC4wICksIG1hdC5tZXRhbG5lc3MgKTtcXG5cXHRtYXQuc3BlY3VsYXJDb2xvciA9IG1peCggdmVjMyggMS4wLCAxLjAsIDEuMCApLCBtYXQuYWxiZWRvLCBtYXQubWV0YWxuZXNzICk7XFxuXFxuXFx0Ly8gb3V0cHV0XFxuXFx0dmVjMyBvdXRDb2xvciA9IHZlYzMoIDAuMCApO1xcblxcdGZsb2F0IG91dE9wYWNpdHkgPSBtYXQub3BhY2l0eTtcXG5cXG5cXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRcXHREZXB0aFxcblxcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcblxcdCNpZmRlZiBERVBUSFxcblxcblxcdFxcdGZsb2F0IGZyYWdDb29yZFogPSAwLjUgKiB2SGlnaFByZWNpc2lvblpXLnggLyB2SGlnaFByZWNpc2lvblpXLnkgKyAwLjU7XFxuXFx0XFx0Z2xfRnJhZ0NvbG9yID0gcGFja0RlcHRoVG9SR0JBKCBmcmFnQ29vcmRaICk7XFxuXFx0XFx0cmV0dXJuO1xcblxcdFxcblxcdCNlbmRpZlxcblxcblxcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcblxcdFxcdEdlb21ldHJ5XFxuXFx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxuXFx0ZmxvYXQgZmFjZURpcmVjdGlvbiA9IGdsX0Zyb250RmFjaW5nID8gMS4wIDogLTEuMDtcXG5cXG5cXHRHZW9tZXRyeSBnZW87XFxuXFx0Z2VvLnBvcyA9IC12Vmlld1BvcztcXG5cXHRnZW8ucG9zV29ybGQgPSB2V29ybGRQb3M7XFxuXFx0Z2VvLnZpZXdEaXIgPSBub3JtYWxpemUoIHZWaWV3UG9zICk7XFxuXFx0Z2VvLnZpZXdEaXJXb3JsZCA9IG5vcm1hbGl6ZSggZ2VvLnBvc1dvcmxkIC0gY2FtZXJhUG9zaXRpb24gKTtcXG5cXHRnZW8ubm9ybWFsID0gbm9ybWFsaXplKCB2Tm9ybWFsICkgKiBmYWNlRGlyZWN0aW9uO1xcblxcblxcdCNpZmRlZiBVU0VfTk9STUFMX01BUFxcblxcdFxcdFxcblxcdFxcdHZlYzMgdGFuZ2VudCA9IG5vcm1hbGl6ZSggdlRhbmdlbnQgKTtcXG5cXHRcXHR2ZWMzIGJpdGFuZ2VudCA9IG5vcm1hbGl6ZSggdkJpdGFuZ2VudCApO1xcblxcblxcdFxcdCNpZmRlZiBET1VCTEVfU0lERURcXG5cXG5cXHRcXHRcXHR0YW5nZW50ICo9IGZhY2VEaXJlY3Rpb247XFxuXFx0XFx0XFx0Yml0YW5nZW50ICo9IGZhY2VEaXJlY3Rpb247XFxuXFx0XFx0XFxuXFx0XFx0I2VuZGlmXFxuXFx0XFx0XFxuXFx0XFx0bWF0MyB2VEJOID0gbWF0MyggdGFuZ2VudCwgYml0YW5nZW50LCBnZW8ubm9ybWFsICk7XFxuXFx0XFx0XFxuXFx0XFx0dmVjMyBtYXBOID0gdGV4dHVyZTJEKCBub3JtYWxNYXAsIHZVdiApLnh5ejtcXG5cXHRcXHRtYXBOID0gbWFwTiAqIDIuMCAtIDEuMDtcXG5cXHRcXHRnZW8ubm9ybWFsID0gbm9ybWFsaXplKCB2VEJOICogbWFwTiApO1xcblxcblxcdCNlbmRpZlxcblxcdFxcblxcdGdlby5ub3JtYWxXb3JsZCA9IG5vcm1hbGl6ZSggKCB2ZWM0KCBnZW8ubm9ybWFsLCAwLjAgKSAqIHZpZXdNYXRyaXggKS54eXogKTtcXG5cXG5cXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRcXHRMaWdodGluZ1xcblxcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcdFxcblxcdExpZ2h0IGxpZ2h0O1xcblxcblxcdCNpZiBOVU1fRElSX0xJR0hUUyA+IDBcXG5cXG5cXHRcXHQjcHJhZ21hIHVucm9sbF9sb29wX3N0YXJ0XFxuXFx0XFx0XFx0Zm9yICggaW50IGkgPSAwOyBpIDwgTlVNX0RJUl9MSUdIVFM7IGkgKysgKSB7XFxuXFxuXFx0XFx0XFx0XFx0bGlnaHQuZGlyZWN0aW9uID0gZGlyZWN0aW9uYWxMaWdodHNbIGkgXS5kaXJlY3Rpb247XFxuXFx0XFx0XFx0XFx0bGlnaHQuY29sb3IgPSBkaXJlY3Rpb25hbExpZ2h0c1sgaSBdLmNvbG9yO1xcblxcblxcdFxcdFxcdFxcdGZsb2F0IHNoYWRvdyA9IDEuMDtcXG5cXHRcXHRcXHRcXHRcXG5cXHRcXHRcXHRcXHQjaWYgZGVmaW5lZCggVVNFX1NIQURPV01BUCApICYmIE5VTV9ESVJfTElHSFRfU0hBRE9XUyA+IDBcXG5cXG5cXHRcXHRcXHRcXHRcXHRzaGFkb3cgPSBnZXRTaGFkb3coIGRpcmVjdGlvbmFsU2hhZG93TWFwWyBpIF0sIGRpcmVjdGlvbmFsTGlnaHRTaGFkb3dzWyBpIF0uc2hhZG93TWFwU2l6ZSwgZGlyZWN0aW9uYWxMaWdodFNoYWRvd3NbIGkgXS5zaGFkb3dCaWFzLCB2RGlyZWN0aW9uYWxTaGFkb3dDb29yZFsgaSBdICk7XFxuXFxuXFx0XFx0XFx0XFx0I2VuZGlmXFxuXFxuXFx0XFx0XFx0XFx0b3V0Q29sb3IgKz0gUkUoIGdlbywgbWF0LCBsaWdodCApICogc2hhZG93O1xcblxcdFxcdFxcdFxcdFxcblxcdFxcdFxcdH1cXG5cXHRcXHQjcHJhZ21hIHVucm9sbF9sb29wX2VuZFxcblxcblxcdCNlbmRpZlxcblxcblxcdCNpZiBOVU1fUE9JTlRfTElHSFRTID4gMFxcblxcblxcdFxcdFBvaW50TGlnaHQgcExpZ2h0O1xcblxcdFxcdHZlYzMgdjtcXG5cXHRcXHRmbG9hdCBkO1xcblxcdFxcdGZsb2F0IGF0dGVudWF0aW9uO1xcblxcdFxcdCNwcmFnbWEgdW5yb2xsX2xvb3Bfc3RhcnRcXG5cXG5cXHRcXHRcXHRmb3IgKCBpbnQgaSA9IDA7IGkgPCBOVU1fUE9JTlRfTElHSFRTOyBpICsrICkge1xcblxcblxcdFxcdFxcdFxcdHBMaWdodCA9IHBvaW50TGlnaHRzWyBpIF07XFxuXFxuXFx0XFx0XFx0XFx0diA9IHBMaWdodC5wb3NpdGlvbiAtIGdlby5wb3M7XFxuXFx0XFx0XFx0XFx0ZCA9IGxlbmd0aCggdiApO1xcblxcdFxcdFxcdFxcdGxpZ2h0LmRpcmVjdGlvbiA9IG5vcm1hbGl6ZSggdiApO1xcblxcdFxcdFxcblxcdFxcdFxcdFxcdGxpZ2h0LmNvbG9yID0gcExpZ2h0LmNvbG9yO1xcblxcblxcdFxcdFxcdFxcdGlmKCBwTGlnaHQuZGlzdGFuY2UgPiAwLjAgJiYgcExpZ2h0LmRlY2F5ID4gMC4wICkge1xcblxcblxcdFxcdFxcdFxcdFxcdGF0dGVudWF0aW9uID0gcG93KCBjbGFtcCggLWQgLyBwTGlnaHQuZGlzdGFuY2UgKyAxLjAsIDAuMCwgMS4wICksIHBMaWdodC5kZWNheSApO1xcblxcdFxcdFxcdFxcdFxcdGxpZ2h0LmNvbG9yICo9IGF0dGVudWF0aW9uO1xcblxcblxcdFxcdFxcdFxcdH1cXG5cXG5cXHRcXHRcXHRcXHRvdXRDb2xvciArPSBSRSggZ2VvLCBtYXQsIGxpZ2h0ICk7XFxuXFx0XFx0XFx0XFx0XFxuXFx0XFx0XFx0fVxcblxcdFxcdFxcdFxcblxcdFxcdCNwcmFnbWEgdW5yb2xsX2xvb3BfZW5kXFxuXFxuXFx0I2VuZGlmXFxuXFxuXFx0I2lmIGRlZmluZWQoIFVTRV9FTlZfTUFQICkgfHwgZGVmaW5lZCggSVNfUkVGTEVDVElPTlBMQU5FIClcXG5cXG5cXHRcXHRmbG9hdCBkTlYgPSBjbGFtcCggZG90KCBnZW8ubm9ybWFsLCBnZW8udmlld0RpciApLCAwLjAsIDEuMCApO1xcblxcdFxcdGZsb2F0IEVGID0gZnJlc25lbCggZE5WICk7XFxuXFxuXFx0I2VuZGlmXFxuXFxuXFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0XFx0RW52aXJvbm1lbnQgTGlnaHRpbmdcXG5cXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG5cXHQjaWZkZWYgVVNFX0VOVl9NQVBcXG5cXG5cXHRcXHR2ZWMzIHJlZkRpciA9IHJlZmxlY3QoIGdlby52aWV3RGlyV29ybGQsIGdlby5ub3JtYWxXb3JsZCApO1xcblxcdFxcdHJlZkRpci54ICo9IC0xLjA7XFxuXFx0XFxuXFx0XFx0dmVjNCBlbnZNYXBDb2xvciA9IHRleHR1cmVDdWJlVVYoIGVudk1hcCwgZ2VvLm5vcm1hbFdvcmxkLCAxLjAgKSAqIGlibEludGVuc2l0eSAqIGVudk1hcEludGVuc2l0eTtcXG5cXHRcXHRvdXRDb2xvciArPSBtYXQuZGlmZnVzZUNvbG9yICogZW52TWFwQ29sb3IueHl6ICogKCAxLjAgLSBtYXQubWV0YWxuZXNzICk7XFxuXFxuXFx0I2VuZGlmXFxuXFxuXFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0XFx0UmVmbGVjdGlvblxcblxcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcdFxcblxcdCNpZmRlZiBJU19SRUZMRUNUSU9OUExBTkVcXG5cXHRcXG5cXHRcXHR2ZWMyIHJlZlVWID0gZ2xfRnJhZ0Nvb3JkLnh5IC8gcmVuZGVyUmVzb2x1dGlvbjtcXG5cXG5cXHRcXHRyZWZVVi54ICs9IGdlby5ub3JtYWwueCAqIDAuNTtcXG5cXG5cXHRcXHRmbG9hdCBsID0gKG1hdC5yb3VnaG5lc3MgKSAqIDEuNiAqIFJFRl9NSVBNQVBfTEVWRUw7XFxuXFxuXFx0XFx0ZmxvYXQgb2Zmc2V0MSA9IGZsb29yKCBsICk7XFxuXFx0XFx0ZmxvYXQgb2Zmc2V0MiA9IG9mZnNldDEgKyAxLjA7XFxuXFx0XFx0ZmxvYXQgYmxlbmQgPSBmcmFjdCggbCApO1xcblxcdFxcdFxcblxcdFxcdHZlYzIgcnV2MSA9IGdldFJlZk1pcG1hcFVWKCByZWZVViwgb2Zmc2V0MSApO1xcblxcdFxcdHZlYzIgcnV2MiA9IGdldFJlZk1pcG1hcFVWKCByZWZVViwgb2Zmc2V0MiApO1xcblxcblxcdFxcdHZlYzMgcmVmMSA9IHRleHR1cmVCaWN1YmljKCByZWZsZWN0aW9uVGV4LCBydXYxLCBtaXBNYXBSZXNvbHV0aW9uICkueHl6O1xcblxcdFxcdHZlYzMgcmVmMiA9IHRleHR1cmVCaWN1YmljKCByZWZsZWN0aW9uVGV4LCBydXYyLCBtaXBNYXBSZXNvbHV0aW9uICkueHl6O1xcblxcblxcdFxcdHZlYzMgcmVmID0gbWF0LnNwZWN1bGFyQ29sb3IgKiBtaXgoIHJlZjEsIHJlZjIsIGJsZW5kICk7XFxuXFxuXFx0XFx0b3V0Q29sb3IgPSBtaXgoXFxuXFx0XFx0XFx0b3V0Q29sb3IgKyByZWYgKiBtYXQubWV0YWxuZXNzLFxcblxcdFxcdFxcdHJlZixcXG5cXHRcXHRcXHRFRlxcblxcdFxcdCk7XFxuXFxuXFx0I2VsaWYgZGVmaW5lZCggVVNFX0VOVl9NQVAgKVxcblxcdFxcblxcdFxcdHZlYzMgZW52ID0gbWF0LnNwZWN1bGFyQ29sb3IgKiB0ZXh0dXJlQ3ViZVVWKCBlbnZNYXAsIHJlZkRpciwgbWF0LnJvdWdobmVzcyApLnh5eiAqIGVudk1hcEludGVuc2l0eTtcXG5cXHRcXG5cXHRcXHRvdXRDb2xvciA9IG1peChcXG5cXHRcXHRcXHRvdXRDb2xvciArIGVudiAqIG1hdC5tZXRhbG5lc3MsXFxuXFx0XFx0XFx0ZW52LFxcblxcdFxcdFxcdEVGXFxuXFx0XFx0KTtcXG5cXHRcXG5cXHQjZW5kaWZcXG5cXG5cXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRcXHRFbWlzc2lvblxcblxcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcblxcdCNpZmRlZiBVU0VfRU1JU1NJT05fTUFQXFxuXFxuXFx0XFx0b3V0Q29sb3IgKz0gTGluZWFyVG9zUkdCKCB0ZXh0dXJlMkQoIGVtaXNzaW9uTWFwLCB2VXYgKSApLnh5ejtcXG5cXHRcXG5cXHQjZWxzZVxcblxcblxcdFxcdG91dENvbG9yICs9IGVtaXNzaW9uO1xcblxcblxcdCNlbmRpZlxcblxcblxcdGdsX0ZyYWdDb2xvciA9IHZlYzQoIG91dENvbG9yLCBvdXRPcGFjaXR5ICk7XFxuXFxufVwiOyIsImV4cG9ydCBkZWZhdWx0IFwiI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjNCB0YW5nZW50O1xcblxcbnZhcnlpbmcgdmVjMiB2VXY7XFxudmFyeWluZyB2ZWMzIHZOb3JtYWw7XFxudmFyeWluZyB2ZWMzIHZWaWV3Tm9ybWFsO1xcbnZhcnlpbmcgdmVjMyB2VGFuZ2VudDtcXG52YXJ5aW5nIHZlYzMgdkJpdGFuZ2VudDtcXG52YXJ5aW5nIHZlYzMgdlZpZXdQb3M7XFxudmFyeWluZyB2ZWMzIHZXb3JsZFBvcztcXG52YXJ5aW5nIHZlYzIgdkhpZ2hQcmVjaXNpb25aVztcXG5cXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRTaGFkb3dNYXBcXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG4jaW5jbHVkZSA8c2hhZG93bWFwX3BhcnNfdmVydGV4PlxcblxcbnZvaWQgbWFpbiggdm9pZCApIHtcXG5cXG5cXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRcXHRQb3NpdGlvblxcblxcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcblxcdHZlYzMgcG9zID0gcG9zaXRpb247XFxuXFx0dmVjNCB3b3JsZFBvcyA9IG1vZGVsTWF0cml4ICogdmVjNCggcG9zLCAxLjAgKTtcXG5cXHR2ZWM0IG12UG9zaXRpb24gPSB2aWV3TWF0cml4ICogd29ybGRQb3M7XFxuXFx0XFxuXFx0Z2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbXZQb3NpdGlvbjtcXG5cXG5cXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRcXHROb3JtYWwgLyBUYW5nZW50XFxuXFx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxuXFx0dmVjMyB0cmFuc2Zvcm1lZE5vcm1hbCA9IG5vcm1hbE1hdHJpeCAqIG5vcm1hbDtcXG5cXHR2ZWM0IGZsaXBlZFRhbmdlbnQgPSB0YW5nZW50O1xcblxcdGZsaXBlZFRhbmdlbnQudyAqPSAtMS4wO1xcblxcblxcdCNpZmRlZiBGTElQX1NJREVEXFxuXFx0XFx0dHJhbnNmb3JtZWROb3JtYWwgKj0gLTEuMDtcXG5cXHRcXHRmbGlwZWRUYW5nZW50ICo9IC0xLjA7XFxuXFx0I2VuZGlmXFxuXFx0XFxuXFx0dmVjMyBub3JtYWwgPSBub3JtYWxpemUoIHRyYW5zZm9ybWVkTm9ybWFsICk7XFxuXFx0dmVjMyB0YW5nZW50ID0gbm9ybWFsaXplKCAoIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIGZsaXBlZFRhbmdlbnQueHl6LCAwLjAgKSApLnh5eiApO1xcblxcdHZlYzMgYmlUYW5nZW50ID0gbm9ybWFsaXplKCBjcm9zcyggbm9ybWFsLCB0YW5nZW50ICkgKiBmbGlwZWRUYW5nZW50LncgKTtcXG5cXG5cXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRcXHRTaGFkb3dcXG5cXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXHRcXG5cXHR2ZWM0IHNoYWRvd1dvcmxkUG9zO1xcblxcdFxcblxcdCNpZiBkZWZpbmVkKCBVU0VfU0hBRE9XTUFQICkgJiYgTlVNX0RJUl9MSUdIVF9TSEFET1dTID4gMFxcblxcdFxcblxcdFxcdCNwcmFnbWEgdW5yb2xsX2xvb3Bfc3RhcnRcXG5cXHRcXHRmb3IgKCBpbnQgaSA9IDA7IGkgPCBOVU1fRElSX0xJR0hUX1NIQURPV1M7IGkgKysgKSB7XFxuXFx0XFx0XFx0XFxuXFx0XFx0XFx0c2hhZG93V29ybGRQb3MgPSB3b3JsZFBvcyArIHZlYzQoIHZlYzQoIHRyYW5zZm9ybWVkTm9ybWFsLCAwLjAgKSAqIG1vZGVsTWF0cml4ICkgKiBkaXJlY3Rpb25hbExpZ2h0U2hhZG93c1sgaSBdLnNoYWRvd05vcm1hbEJpYXM7XFxuXFx0XFx0XFx0dkRpcmVjdGlvbmFsU2hhZG93Q29vcmRbIGkgXSA9IGRpcmVjdGlvbmFsU2hhZG93TWF0cml4WyBpIF0gKiBzaGFkb3dXb3JsZFBvcztcXG5cXHRcXHRcXHRcXG5cXHRcXHR9XFxuXFx0XFx0I3ByYWdtYSB1bnJvbGxfbG9vcF9lbmRcXG5cXHRcXHRcXG5cXHQjZW5kaWZcXG5cXG5cXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRcXHRWYXJ5aW5nXFxuXFx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFx0XFxuXFx0dlV2ID0gdXY7XFxuXFx0dk5vcm1hbCA9IG5vcm1hbDtcXG5cXHR2VGFuZ2VudCA9IHRhbmdlbnQ7XFxuXFx0dkJpdGFuZ2VudCA9IGJpVGFuZ2VudDtcXG5cXHR2Vmlld1BvcyA9IC1tdlBvc2l0aW9uLnh5ejtcXG5cXHR2V29ybGRQb3MgPSB3b3JsZFBvcy54eXo7XFxuXFx0dkhpZ2hQcmVjaXNpb25aVyA9IGdsX1Bvc2l0aW9uLnp3O1xcblxcdFxcbn1cIjsiLCJleHBvcnQgZGVmYXVsdCBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4O1xcbnZhcnlpbmcgdmVjMiB2VXY7XFxuXFxuZmxvYXQgY2xpcCggdmVjMiB1diApIHtcXG5cXHR2ZWMyIGMgPSBzdGVwKCBhYnModXYgLSAwLjUpLCB2ZWMyKCAwLjUgKSApO1xcblxcdHJldHVybiBjLnggKiBjLnk7XFxufVxcblxcbnZvaWQgbWFpbiggdm9pZCApIHtcXG5cXG5cXHR2ZWM0IGNvbCA9IHRleHR1cmUyRCggdGV4LCB2VXYgKTtcXG5cXHRnbF9GcmFnQ29sb3IgPSBjb2w7XFxuXFxufVwiOyIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcclxuaW1wb3J0ICogYXMgT1JFIGZyb20gJ29yZS10aHJlZS10cyc7XHJcblxyXG5pbXBvcnQgcG93ZXJWZXJ0IGZyb20gJy4vc2hhZGVycy9wb3dlci52cyc7XHJcbmltcG9ydCBwb3dlckZyYWcgZnJvbSAnLi9zaGFkZXJzL3Bvd2VyLmZzJztcclxuXHJcbmV4cG9ydCB0eXBlIFBvd2VyTWVzaE1hdGVyaWFsVHlwZSA9ICdjb2xvcicgfCAnZGVwdGgnIHwgJ2NvYydcclxuZXhwb3J0IGNsYXNzIFBvd2VyTWVzaCBleHRlbmRzIFRIUkVFLk1lc2g8VEhSRUUuQnVmZmVyR2VvbWV0cnksIFRIUkVFLlNoYWRlck1hdGVyaWFsPiB7XHJcblxyXG5cdHByb3RlY3RlZCBjb21tb25Vbmlmb3JtczogT1JFLlVuaWZvcm1zO1xyXG5cclxuXHQvLyBlbnZNYXBcclxuXHRwcm90ZWN0ZWQgZW52TWFwUmVzb2x1dGlvbjogbnVtYmVyO1xyXG5cdHByb3RlY3RlZCBlbnZNYXBSZW5kZXJUYXJnZXQ6IFRIUkVFLldlYkdMQ3ViZVJlbmRlclRhcmdldDtcclxuXHRwcm90ZWN0ZWQgZW52TWFwQ2FtZXJhOiBUSFJFRS5DdWJlQ2FtZXJhO1xyXG5cdHByb3RlY3RlZCBlbnZNYXBVcGRhdGU6IGJvb2xlYW47XHJcblx0cHJvdGVjdGVkIGVudk1hcFNyYzogVEhSRUUuQ3ViZVRleHR1cmUgfCBUSFJFRS5UZXh0dXJlIHwgbnVsbDtcclxuXHJcblx0Y29uc3RydWN0b3IoIGdlb21ldHJ5OiBUSFJFRS5CdWZmZXJHZW9tZXRyeSwgbWF0ZXJpYWxPcHRpb24/OiBUSFJFRS5TaGFkZXJNYXRlcmlhbFBhcmFtZXRlcnMsIG92ZXJyaWRlPzogYm9vbGVhbiApO1xyXG5cclxuXHRjb25zdHJ1Y3RvciggbWVzaDogVEhSRUUuTWVzaCwgbWF0ZXJpYWxPcHRpb24/OiBUSFJFRS5TaGFkZXJNYXRlcmlhbFBhcmFtZXRlcnMsIG92ZXJyaWRlPzogYm9vbGVhbiApO1xyXG5cclxuXHRjb25zdHJ1Y3RvciggZ2VvTWVzaDogVEhSRUUuQnVmZmVyR2VvbWV0cnkgfCBUSFJFRS5NZXNoLCBtYXRlcmlhbE9wdGlvbj86IFRIUkVFLlNoYWRlck1hdGVyaWFsUGFyYW1ldGVycywgb3ZlcnJpZGU/OiBib29sZWFuICkge1xyXG5cclxuXHRcdG1hdGVyaWFsT3B0aW9uID0gbWF0ZXJpYWxPcHRpb24gfHwge307XHJcblxyXG5cdFx0bGV0IHVuaSA9IE9SRS5Vbmlmb3Jtc0xpYi5tZXJnZVVuaWZvcm1zKCBtYXRlcmlhbE9wdGlvbi51bmlmb3JtcyB8fCB7fSwge1xyXG5cdFx0XHRlbnZNYXA6IHtcclxuXHRcdFx0XHR2YWx1ZTogbnVsbFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRlbnZNYXBJbnRlbnNpdHk6IHtcclxuXHRcdFx0XHR2YWx1ZTogbnVsbFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRpYmxJbnRlbnNpdHk6IHtcclxuXHRcdFx0XHR2YWx1ZTogbnVsbFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRtYXhMb2RMZXZlbDoge1xyXG5cdFx0XHRcdHZhbHVlOiAwXHJcblx0XHRcdH0sXHJcblx0XHRcdHNoYWRvd0xpZ2h0TW9kZWxWaWV3TWF0cml4OiB7XHJcblx0XHRcdFx0dmFsdWU6IG5ldyBUSFJFRS5NYXRyaXg0KClcclxuXHRcdFx0fSxcclxuXHRcdFx0c2hhZG93TGlnaHRQcm9qZWN0aW9uTWF0cml4OiB7XHJcblx0XHRcdFx0dmFsdWU6IG5ldyBUSFJFRS5NYXRyaXg0KClcclxuXHRcdFx0fSxcclxuXHRcdFx0c2hhZG93TGlnaHREaXJlY3Rpb246IHtcclxuXHRcdFx0XHR2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjMoKVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRzaGFkb3dMaWdodENhbWVyYUNsaXA6IHtcclxuXHRcdFx0XHR2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIoKVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRzaGFkb3dNYXA6IHtcclxuXHRcdFx0XHR2YWx1ZTogbnVsbFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRzaGFkb3dNYXBTaXplOiB7XHJcblx0XHRcdFx0dmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKClcclxuXHRcdFx0fSxcclxuXHRcdFx0c2hhZG93TWFwUmVzb2x1dGlvbjoge1xyXG5cdFx0XHRcdHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMigpXHJcblx0XHRcdH0sXHJcblx0XHRcdHNoYWRvd0xpZ2h0U2l6ZToge1xyXG5cdFx0XHRcdHZhbHVlOiAxLjBcclxuXHRcdFx0fSxcclxuXHRcdFx0Y2FtZXJhTmVhcjoge1xyXG5cdFx0XHRcdHZhbHVlOiAwLjAxXHJcblx0XHRcdH0sXHJcblx0XHRcdGNhbWVyYUZhcjoge1xyXG5cdFx0XHRcdHZhbHVlOiAxMDAwLjBcclxuXHRcdFx0fSxcclxuXHRcdFx0Ly8gZGVmYXVsdCBwcm9wc1xyXG5cdFx0XHRjb2xvcjoge1xyXG5cdFx0XHRcdHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoIDEuMCwgMS4wLCAxLjAgKVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRtZXRhbG5lc3M6IHtcclxuXHRcdFx0XHR2YWx1ZTogMFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRyb3VnaG5lc3M6IHtcclxuXHRcdFx0XHR2YWx1ZTogMC41XHJcblx0XHRcdH0sXHJcblx0XHRcdG9wYWNpdHk6IHtcclxuXHRcdFx0XHR2YWx1ZTogMVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRlbWlzc2lvbjoge1xyXG5cdFx0XHRcdHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoIDAuMCwgMC4wLCAwLjAgKVxyXG5cdFx0XHR9XHJcblx0XHR9ICk7XHJcblxyXG5cdFx0dW5pID0gT1JFLlVuaWZvcm1zTGliLm1lcmdlVW5pZm9ybXMoIHVuaSwgVEhSRUUuVW5pZm9ybXNVdGlscy5jbG9uZSggVEhSRUUuVW5pZm9ybXNMaWIubGlnaHRzICkgKTtcclxuXHJcblx0XHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHRcdFx0R2VvbWV0cnlcclxuXHRcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRcdGxldCBnZW86IFRIUkVFLkJ1ZmZlckdlb21ldHJ5O1xyXG5cclxuXHRcdGlmICggJ2lzQnVmZmVyR2VvbWV0cnknIGluIGdlb01lc2ggKSB7XHJcblxyXG5cdFx0XHRnZW8gPSBnZW9NZXNoO1xyXG5cclxuXHRcdH0gZWxzZSBpZiAoICdpc01lc2gnIGluIGdlb01lc2ggKSB7XHJcblxyXG5cdFx0XHRnZW8gPSBnZW9NZXNoLmdlb21ldHJ5O1xyXG5cclxuXHRcdFx0bGV0IG1hdCA9ICggZ2VvTWVzaC5tYXRlcmlhbCBhcyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCApO1xyXG5cclxuXHRcdFx0aWYgKCBtYXQuaXNNZXNoU3RhbmRhcmRNYXRlcmlhbCApIHtcclxuXHJcblx0XHRcdFx0aWYgKCBtYXQubWFwICkge1xyXG5cclxuXHRcdFx0XHRcdHVuaS5tYXAgPSB7XHJcblx0XHRcdFx0XHRcdHZhbHVlOiBtYXQubWFwXHJcblx0XHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHR9IGVsc2UgaWYgKCBtYXQuY29sb3IgKSB7XHJcblxyXG5cdFx0XHRcdFx0dW5pLmNvbG9yLnZhbHVlLmNvcHkoIG1hdC5jb2xvciApO1xyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmICggbWF0LnJvdWdobmVzc01hcCApIHtcclxuXHJcblx0XHRcdFx0XHR1bmkucm91Z2huZXNzTWFwID0ge1xyXG5cdFx0XHRcdFx0XHR2YWx1ZTogbWF0LnJvdWdobmVzc01hcFxyXG5cdFx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdFx0XHR1bmkucm91Z2huZXNzLnZhbHVlID0gbWF0LnJvdWdobmVzcztcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoIG1hdC5hbHBoYU1hcCApIHtcclxuXHJcblx0XHRcdFx0XHR1bmkuYWxwaGFNYXAgPSB7XHJcblx0XHRcdFx0XHRcdHZhbHVlOiBtYXQuYWxwaGFNYXBcclxuXHRcdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdFx0dW5pLm9wYWNpdHkudmFsdWUgPSBtYXQub3BhY2l0eTtcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoIG1hdC5tZXRhbG5lc3NNYXAgKSB7XHJcblxyXG5cdFx0XHRcdFx0dW5pLm1ldGFsbmVzc01hcCA9IHtcclxuXHRcdFx0XHRcdFx0dmFsdWU6IG1hdC5tZXRhbG5lc3NNYXBcclxuXHRcdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdFx0dW5pLm1ldGFsbmVzcy52YWx1ZSA9IG1hdC5tZXRhbG5lc3M7XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKCBtYXQubm9ybWFsTWFwICkge1xyXG5cclxuXHRcdFx0XHRcdHVuaS5ub3JtYWxNYXAgPSB7XHJcblx0XHRcdFx0XHRcdHZhbHVlOiBtYXQubm9ybWFsTWFwXHJcblx0XHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmICggbWF0LmVtaXNzaXZlTWFwICkge1xyXG5cclxuXHRcdFx0XHRcdHVuaS5lbWlzc2lvbk1hcCA9IHtcclxuXHRcdFx0XHRcdFx0dmFsdWU6IG1hdC5lbWlzc2l2ZU1hcFxyXG5cdFx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdFx0XHR1bmkuZW1pc3Npb24udmFsdWUuY29weSggbWF0LmVtaXNzaXZlICk7XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0Z2VvID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIHRhbmdlbnRzXHJcblxyXG5cdFx0aWYgKCAhIGdlby5nZXRBdHRyaWJ1dGUoICd0YW5nZW50JyApICkge1xyXG5cclxuXHRcdFx0aWYgKFxyXG5cdFx0XHRcdGdlby5nZXRJbmRleCgpICYmXHJcblx0XHRcdFx0Z2VvLmdldEF0dHJpYnV0ZSggJ3Bvc2l0aW9uJyApICYmXHJcblx0XHRcdFx0Z2VvLmdldEF0dHJpYnV0ZSggJ25vcm1hbCcgKSAmJlxyXG5cdFx0XHRcdGdlby5nZXRBdHRyaWJ1dGUoICd1dicgKVxyXG5cdFx0XHQpIHtcclxuXHJcblx0XHRcdFx0Z2VvLmNvbXB1dGVUYW5nZW50cygpO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHRcdFx0TWF0ZXJpYWxcclxuXHRcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRcdG1hdGVyaWFsT3B0aW9uLnVuaWZvcm1zID0gdW5pO1xyXG5cclxuXHRcdGxldCBtYXQgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoIHtcclxuXHRcdFx0dmVydGV4U2hhZGVyOiBwb3dlclZlcnQsXHJcblx0XHRcdGZyYWdtZW50U2hhZGVyOiBwb3dlckZyYWcsXHJcblx0XHRcdGxpZ2h0czogdHJ1ZSxcclxuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWUsXHJcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXHJcblx0XHRcdGV4dGVuc2lvbnM6IHtcclxuXHRcdFx0XHRkZXJpdmF0aXZlczogdHJ1ZSxcclxuXHRcdFx0fSxcclxuXHRcdFx0ZGVmaW5lczoge1xyXG5cdFx0XHR9LFxyXG5cdFx0XHQuLi5tYXRlcmlhbE9wdGlvblxyXG5cdFx0fSApO1xyXG5cclxuXHRcdGlmICggdW5pLm1hcCApIHtcclxuXHJcblx0XHRcdG1hdC5kZWZpbmVzLlVTRV9NQVAgPSAnJztcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCB1bmkucm91Z2huZXNzTWFwICkge1xyXG5cclxuXHRcdFx0bWF0LmRlZmluZXMuVVNFX1JPVUdITkVTU19NQVAgPSAnJztcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCB1bmkubWV0YWxuZXNzTWFwICkge1xyXG5cclxuXHRcdFx0bWF0LmRlZmluZXMuVVNFX01FVEFMTkVTU19NQVAgPSAnJztcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCB1bmkuYWxwaGFNYXAgKSB7XHJcblxyXG5cdFx0XHRtYXQuZGVmaW5lcy5VU0VfQUxQSEFfTUFQID0gJyc7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggdW5pLm5vcm1hbE1hcCApIHtcclxuXHJcblx0XHRcdG1hdC5kZWZpbmVzLlVTRV9OT1JNQUxfTUFQID0gJyc7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggdW5pLmVtaXNzaW9uTWFwICkge1xyXG5cclxuXHRcdFx0bWF0LmRlZmluZXMuVVNFX0VNSVNTSU9OX01BUCA9ICcnO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRzdXBlciggZ2VvLCBtYXQgKTtcclxuXHJcblx0XHR0aGlzLm5hbWUgPSBnZW9NZXNoLm5hbWU7XHJcblxyXG5cdFx0dGhpcy51c2VyRGF0YS5jb2xvck1hdCA9IHRoaXMubWF0ZXJpYWw7XHJcblxyXG5cdFx0dGhpcy5jdXN0b21EZXB0aE1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKCB7XHJcblx0XHRcdHZlcnRleFNoYWRlcjogcG93ZXJWZXJ0LFxyXG5cdFx0XHRmcmFnbWVudFNoYWRlcjogcG93ZXJGcmFnLFxyXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlLFxyXG5cdFx0XHRsaWdodHM6IHRydWUsXHJcblx0XHRcdGV4dGVuc2lvbnM6IHtcclxuXHRcdFx0XHRkZXJpdmF0aXZlczogdHJ1ZVxyXG5cdFx0XHR9LFxyXG5cdFx0XHQuLi5tYXRlcmlhbE9wdGlvbixcclxuXHRcdFx0ZGVmaW5lczoge1xyXG5cdFx0XHRcdC4uLm1hdC5kZWZpbmVzLFxyXG5cdFx0XHRcdCdERVBUSCc6IFwiXCIsXHJcblx0XHRcdH0sXHJcblx0XHR9ICk7XHJcblxyXG5cdFx0dGhpcy5jb21tb25Vbmlmb3JtcyA9IHVuaTtcclxuXHJcblx0XHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHRcdFx0VHJhbnNmb3JtXHJcblx0XHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcblx0XHRpZiAoICdpc01lc2gnIGluIGdlb01lc2ggJiYgb3ZlcnJpZGUgKSB7XHJcblxyXG5cdFx0XHRnZW9NZXNoLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuXHJcblx0XHRcdGxldCBjaGlsZEFycmF5ID0gZ2VvTWVzaC5jaGlsZHJlbi5zbGljZSgpO1xyXG5cclxuXHRcdFx0Y2hpbGRBcnJheS5mb3JFYWNoKCBjaGlsZCA9PiB7XHJcblxyXG5cdFx0XHRcdHRoaXMuYWRkKCBjaGlsZCApO1xyXG5cclxuXHRcdFx0fSApO1xyXG5cclxuXHRcdFx0dGhpcy5wb3NpdGlvbi5jb3B5KCBnZW9NZXNoLnBvc2l0aW9uICk7XHJcblx0XHRcdHRoaXMucm90YXRpb24uY29weSggZ2VvTWVzaC5yb3RhdGlvbiApO1xyXG5cdFx0XHR0aGlzLnNjYWxlLmNvcHkoIGdlb01lc2guc2NhbGUgKTtcclxuXHJcblx0XHRcdGxldCBwYXJlbnQgPSBnZW9NZXNoLnBhcmVudDtcclxuXHJcblx0XHRcdGlmICggcGFyZW50ICkge1xyXG5cclxuXHRcdFx0XHRwYXJlbnQuYWRkKCB0aGlzICk7XHJcblxyXG5cdFx0XHRcdHBhcmVudC5yZW1vdmUoIGdlb01lc2ggKTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblxyXG5cdFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0XHRcdEVudk1hcFxyXG5cdFx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG5cdFx0dGhpcy5lbnZNYXBTcmMgPSBudWxsO1xyXG5cdFx0dGhpcy5lbnZNYXBVcGRhdGUgPSBmYWxzZTtcclxuXHRcdHRoaXMuZW52TWFwUmVzb2x1dGlvbiA9IDI1NjtcclxuXHJcblx0XHR0aGlzLmVudk1hcFJlbmRlclRhcmdldCA9IG5ldyBUSFJFRS5XZWJHTEN1YmVSZW5kZXJUYXJnZXQoIHRoaXMuZW52TWFwUmVzb2x1dGlvbiwge1xyXG5cdFx0XHRmb3JtYXQ6IFRIUkVFLlJHQkFGb3JtYXQsXHJcblx0XHRcdGdlbmVyYXRlTWlwbWFwczogdHJ1ZSxcclxuXHRcdFx0bWFnRmlsdGVyOiBUSFJFRS5MaW5lYXJGaWx0ZXIsXHJcblx0XHRcdG1pbkZpbHRlcjogVEhSRUUuTGluZWFyRmlsdGVyXHJcblx0XHR9ICk7XHJcblxyXG5cdFx0dGhpcy5lbnZNYXBDYW1lcmEgPSBuZXcgVEhSRUUuQ3ViZUNhbWVyYSggMC4wMDEsIDEwMDAsIHRoaXMuZW52TWFwUmVuZGVyVGFyZ2V0ICk7XHJcblx0XHR0aGlzLmdldFdvcmxkUG9zaXRpb24oIHRoaXMuZW52TWFwQ2FtZXJhLnBvc2l0aW9uICk7XHJcblxyXG5cdFx0dGhpcy5vbkJlZm9yZVJlbmRlciA9ICggcmVuZGVyZXIsIHNjZW5lLCBjYW1lcmEgKSA9PiB7XHJcblxyXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQoIHtcclxuXHRcdFx0XHR0eXBlOiAnYmVmb3JlUmVuZGVyJyxcclxuXHRcdFx0XHRyZW5kZXJlcixcclxuXHRcdFx0XHRzY2VuZSxcclxuXHRcdFx0XHRjYW1lcmFcclxuXHRcdFx0fSApO1xyXG5cclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKCAnYmVmb3JlUmVuZGVyJywgKCBlOiBUSFJFRS5FdmVudCApID0+IHtcclxuXHJcblx0XHRcdGxldCByZW5kZXJlciA9IGUucmVuZGVyZXI7XHJcblx0XHRcdGxldCBzY2VuZSA9IGUuc2NlbmU7XHJcblx0XHRcdGxldCBjYW1lcmEgPSBlLmNhbWVyYTtcclxuXHJcblx0XHRcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0XHRcdEVudk1hcFxyXG5cdFx0XHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcblx0XHRcdGlmICggdGhpcy5lbnZNYXBVcGRhdGUgKSB7XHJcblxyXG5cdFx0XHRcdGxldCBlbnZNYXBSVDogVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQgfCBudWxsID0gbnVsbDtcclxuXHJcblx0XHRcdFx0bGV0IHBtcmVtR2VuZXJhdG9yID0gbmV3IFRIUkVFLlBNUkVNR2VuZXJhdG9yKCByZW5kZXJlciApO1xyXG5cdFx0XHRcdHBtcmVtR2VuZXJhdG9yLmNvbXBpbGVFcXVpcmVjdGFuZ3VsYXJTaGFkZXIoKTtcclxuXHJcblx0XHRcdFx0aWYgKCB0aGlzLmVudk1hcFNyYyApIHtcclxuXHJcblx0XHRcdFx0XHRpZiAoICdpc0N1YmVUZXh0dXJlJyBpbiB0aGlzLmVudk1hcFNyYyApIHtcclxuXHJcblx0XHRcdFx0XHRcdGVudk1hcFJUID0gcG1yZW1HZW5lcmF0b3IuZnJvbUN1YmVtYXAoIHRoaXMuZW52TWFwU3JjICk7XHJcblxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdFx0XHRcdGVudk1hcFJUID0gcG1yZW1HZW5lcmF0b3IuZnJvbUVxdWlyZWN0YW5ndWxhciggdGhpcy5lbnZNYXBTcmMgKTtcclxuXHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy52aXNpYmxlID0gZmFsc2U7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5lbnZNYXBDYW1lcmEudXBkYXRlKCByZW5kZXJlciwgc2NlbmUgKTtcclxuXHRcdFx0XHRcdGVudk1hcFJUID0gcG1yZW1HZW5lcmF0b3IuZnJvbUN1YmVtYXAoIHRoaXMuZW52TWFwUmVuZGVyVGFyZ2V0LnRleHR1cmUgKTtcclxuXHJcblx0XHRcdFx0XHR0aGlzLnZpc2libGUgPSB0cnVlO1xyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdC8vIGVudm1hcFxyXG5cdFx0XHRcdGxldCBlbnZNYXBSZXNvbHV0aW9uID0gZW52TWFwUlQuaGVpZ2h0O1xyXG5cclxuXHRcdFx0XHRjb25zdCBtYXhNaXAgPSBNYXRoLnJvdW5kKCBNYXRoLmxvZzIoIGVudk1hcFJlc29sdXRpb24gKSApIC0gMjtcclxuXHRcdFx0XHRjb25zdCB0ZXhlbEhlaWdodCA9IDEuMCAvIGVudk1hcFJlc29sdXRpb247XHJcblx0XHRcdFx0Y29uc3QgdGV4ZWxXaWR0aCA9IDEuMCAvICggMyAqIE1hdGgubWF4KCBNYXRoLnBvdyggMiwgbWF4TWlwICksIDcgKiAxNiApICk7XHJcblxyXG5cdFx0XHRcdG1hdC5kZWZpbmVzWyAnVVNFX0VOVl9NQVAnIF0gPSAnJztcclxuXHRcdFx0XHRtYXQuZGVmaW5lc1sgJ0NVQkVVVl9NQVhfTUlQJyBdID0gbWF4TWlwICsgJy4wJztcclxuXHRcdFx0XHRtYXQuZGVmaW5lc1sgJ0NVQkVVVl9URVhFTF9XSURUSCcgXSA9IHRleGVsV2lkdGggKyAnJztcclxuXHRcdFx0XHRtYXQuZGVmaW5lc1sgJ0NVQkVVVl9URVhFTF9IRUlHSFQnIF0gPSB0ZXhlbEhlaWdodCArICcnO1xyXG5cclxuXHRcdFx0XHR0aGlzLmNvbW1vblVuaWZvcm1zLmVudk1hcC52YWx1ZSA9IGVudk1hcFJULnRleHR1cmU7XHJcblx0XHRcdFx0dGhpcy5lbnZNYXBVcGRhdGUgPSBmYWxzZTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0XHRcdERlcHRoXHJcblx0XHRcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRcdFx0aWYgKCBjYW1lcmEudXNlckRhdGEuZGVwdGhDYW1lcmEgKSB7XHJcblxyXG5cdFx0XHRcdHRoaXMubWF0ZXJpYWwgPSB0aGlzLnVzZXJEYXRhLmRlcHRoTWF0O1xyXG5cdFx0XHRcdHRoaXMuY29tbW9uVW5pZm9ybXMuY2FtZXJhTmVhci52YWx1ZSA9IGNhbWVyYS5uZWFyO1xyXG5cdFx0XHRcdHRoaXMuY29tbW9uVW5pZm9ybXMuY2FtZXJhRmFyLnZhbHVlID0gY2FtZXJhLmZhcjtcclxuXHJcblx0XHRcdFx0aWYgKCAhIHRoaXMubWF0ZXJpYWwgKSB7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy52aXNpYmxlID0gZmFsc2U7XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9ICk7XHJcblxyXG5cdFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0XHRcdERpc3Bvc2VcclxuXHRcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRcdGNvbnN0IG9uRGlzcG9zZSA9ICgpID0+IHtcclxuXHJcblx0XHRcdHRoaXMuZW52TWFwUmVuZGVyVGFyZ2V0LmRpc3Bvc2UoKTtcclxuXHRcdFx0dGhpcy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcblx0XHRcdHRoaXMubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG5cclxuXHRcdFx0dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCAnZGlzcG9zZScsIG9uRGlzcG9zZSApO1xyXG5cclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKCAnZGlzcG9zZScsIG9uRGlzcG9zZSApO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0RW52TWFwIC8gSUJMXHJcblx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG5cdHB1YmxpYyB1cGRhdGVFbnZNYXAoIGVudk1hcDogVEhSRUUuQ3ViZVRleHR1cmUgfCBUSFJFRS5UZXh0dXJlIHwgbnVsbCA9IG51bGwgKSB7XHJcblxyXG5cdFx0dGhpcy5lbnZNYXBTcmMgPSBlbnZNYXA7XHJcblx0XHR0aGlzLmVudk1hcFVwZGF0ZSA9IHRydWU7XHJcblxyXG5cdFx0aWYgKCB0aGlzLmNvbW1vblVuaWZvcm1zLmVudk1hcEludGVuc2l0eS52YWx1ZSA9PSBudWxsICkge1xyXG5cclxuXHRcdFx0dGhpcy5jb21tb25Vbmlmb3Jtcy5lbnZNYXBJbnRlbnNpdHkudmFsdWUgPSAxO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIHRoaXMuY29tbW9uVW5pZm9ybXMuaWJsSW50ZW5zaXR5LnZhbHVlID09IG51bGwgKSB7XHJcblxyXG5cdFx0XHR0aGlzLmNvbW1vblVuaWZvcm1zLmlibEludGVuc2l0eS52YWx1ZSA9IDE7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXQgZW52TWFwSW50ZW5zaXR5KCB2YWx1ZTogbnVtYmVyICkge1xyXG5cclxuXHRcdHRoaXMuY29tbW9uVW5pZm9ybXMuZW52TWFwSW50ZW5zaXR5LnZhbHVlID0gdmFsdWU7XHJcblxyXG5cdH1cclxuXHJcblx0cHVibGljIHNldCBpYmxJbnRlbnNpdHkoIHZhbHVlOiBudW1iZXIgKSB7XHJcblxyXG5cdFx0dGhpcy5jb21tb25Vbmlmb3Jtcy5pYmxJbnRlbnNpdHkudmFsdWUgPSB2YWx1ZTtcclxuXHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZGlzcG9zZSgpIHtcclxuXHJcblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQoIHsgdHlwZTogJ2Rpc3Bzb2UnIH0gKTtcclxuXHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZ2V0IGlzUG93ZXJNZXNoKCkge1xyXG5cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cclxuXHR9XHJcblxyXG59XHJcbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcclxuaW1wb3J0ICogYXMgT1JFIGZyb20gJ29yZS10aHJlZS10cyc7XHJcblxyXG5pbXBvcnQgeyBQb3dlck1lc2ggfSBmcm9tICcuLi9Qb3dlck1lc2gnO1xyXG5cclxuaW1wb3J0IG1pcG1hcFZlcnQgZnJvbSAnLi9zaGFkZXJzL21pcG1hcC52cyc7XHJcbmltcG9ydCBtaXBtYXBGcmFnIGZyb20gJy4vc2hhZGVycy9taXBtYXAuZnMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFBvd2VyUmVmbGVjdGlvbk1lc2ggZXh0ZW5kcyBQb3dlck1lc2gge1xyXG5cclxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHRcdFJlbmRlclRhcmdldFxyXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRwcml2YXRlIHJlbmRlclRhcmdldHM6IHtcclxuXHRcdHJlZjogVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQsXHJcblx0XHRtaXBtYXA6IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0XHJcblx0fTtcclxuXHJcblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0XHRNaXBtYXBcclxuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcblx0cHJpdmF0ZSBtaXBtYXBHZW86IFRIUkVFLkJ1ZmZlckdlb21ldHJ5O1xyXG5cdHByaXZhdGUgbWlwbWFwUFA6IE9SRS5Qb3N0UHJvY2Vzc2luZyB8IG51bGw7XHJcblxyXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0UmVmbGVjdGlvbiBDYW1lcmFcclxuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcblx0cHJpdmF0ZSBsb29rQXRQb3NpdGlvbjogVEhSRUUuVmVjdG9yMztcclxuXHRwcml2YXRlIHJvdGF0aW9uTWF0cml4OiBUSFJFRS5NYXRyaXg0O1xyXG5cdHByaXZhdGUgdGFyZ2V0OiBUSFJFRS5WZWN0b3IzO1xyXG5cdHByaXZhdGUgdmlldzogVEhSRUUuVmVjdG9yMztcclxuXHJcblx0cHJpdmF0ZSB2aXJ0dWFsQ2FtZXJhOiBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYTtcclxuXHRwcml2YXRlIHJlZmxlY3RvclBsYW5lOiBUSFJFRS5QbGFuZTtcclxuXHRwcml2YXRlIG5vcm1hbDogVEhSRUUuVmVjdG9yMztcclxuXHJcblx0cHJpdmF0ZSByZWZsZWN0b3JXb3JsZFBvc2l0aW9uOiBUSFJFRS5WZWN0b3IzO1xyXG5cdHByaXZhdGUgY2FtZXJhV29ybGRQb3NpdGlvbjogVEhSRUUuVmVjdG9yMztcclxuXHJcblx0cHJpdmF0ZSBjbGlwUGxhbmU6IFRIUkVFLlZlY3RvcjQ7XHJcblx0cHJpdmF0ZSBjbGlwQmlhczogbnVtYmVyO1xyXG5cdHByaXZhdGUgcTogVEhSRUUuVmVjdG9yNDtcclxuXHJcblx0cHJpdmF0ZSB0ZXh0dXJlTWF0cml4OiBUSFJFRS5NYXRyaXg0O1xyXG5cclxuXHRjb25zdHJ1Y3RvciggZ2VvbWV0cnk6IFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBtYXRlcmlhbE9wdGlvbj86IFRIUkVFLlNoYWRlck1hdGVyaWFsUGFyYW1ldGVycywgb3ZlcnJpZGU/OiBib29sZWFuICk7XHJcblxyXG5cdGNvbnN0cnVjdG9yKCBtZXNoOiBUSFJFRS5NZXNoLCBtYXRlcmlhbE9wdGlvbj86IFRIUkVFLlNoYWRlck1hdGVyaWFsUGFyYW1ldGVycywgb3ZlcnJpZGU/OiBib29sZWFuICk7XHJcblxyXG5cdGNvbnN0cnVjdG9yKCBnZW9NZXNoOiBUSFJFRS5CdWZmZXJHZW9tZXRyeSB8IFRIUkVFLk1lc2g8VEhSRUUuQnVmZmVyR2VvbWV0cnk+LCBtYXRlcmlhbE9wdGlvbj86IFRIUkVFLlNoYWRlck1hdGVyaWFsUGFyYW1ldGVycywgb3ZlcnJpZGU/OiBib29sZWFuICkge1xyXG5cclxuXHRcdG1hdGVyaWFsT3B0aW9uID0gbWF0ZXJpYWxPcHRpb24gfHwge307XHJcblxyXG5cdFx0bWF0ZXJpYWxPcHRpb24udW5pZm9ybXMgPSBPUkUuVW5pZm9ybXNMaWIubWVyZ2VVbmlmb3JtcyggbWF0ZXJpYWxPcHRpb24udW5pZm9ybXMgfHwge30sIHtcclxuXHRcdFx0cmVmbGVjdGlvblRleDoge1xyXG5cdFx0XHRcdHZhbHVlOiBudWxsXHJcblx0XHRcdH0sXHJcblx0XHRcdHJlbmRlclJlc29sdXRpb246IHtcclxuXHRcdFx0XHR2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIoIDEsIDEgKVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR0ZXh0dXJlTWF0cml4OiB7XHJcblx0XHRcdFx0dmFsdWU6IG5ldyBUSFJFRS5NYXRyaXg0KClcclxuXHRcdFx0fSxcclxuXHRcdFx0bWlwTWFwUmVzb2x1dGlvbjoge1xyXG5cdFx0XHRcdHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMiggMSwgMSApXHJcblx0XHRcdH1cclxuXHRcdH0gKTtcclxuXHJcblx0XHRtYXRlcmlhbE9wdGlvbi5kZWZpbmVzID0ge1xyXG5cdFx0XHRJU19SRUZMRUNUSU9OUExBTkU6ICcnLFxyXG5cdFx0fTtcclxuXHJcblx0XHRzdXBlciggZ2VvTWVzaCBhcyBUSFJFRS5CdWZmZXJHZW9tZXRyeSwgbWF0ZXJpYWxPcHRpb24sIG92ZXJyaWRlICk7XHJcblxyXG5cdFx0dGhpcy5yZWZsZWN0b3JQbGFuZSA9IG5ldyBUSFJFRS5QbGFuZSgpO1xyXG5cdFx0dGhpcy5ub3JtYWwgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG5cdFx0dGhpcy5yZWZsZWN0b3JXb3JsZFBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuXHRcdHRoaXMuY2FtZXJhV29ybGRQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcblx0XHR0aGlzLnJvdGF0aW9uTWF0cml4ID0gbmV3IFRIUkVFLk1hdHJpeDQoKTtcclxuXHRcdHRoaXMubG9va0F0UG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMyggMCwgMCwgLSAxICk7XHJcblx0XHR0aGlzLmNsaXBQbGFuZSA9IG5ldyBUSFJFRS5WZWN0b3I0KCk7XHJcblx0XHR0aGlzLnRleHR1cmVNYXRyaXggPSB0aGlzLmNvbW1vblVuaWZvcm1zLnRleHR1cmVNYXRyaXgudmFsdWU7XHJcblx0XHR0aGlzLmNsaXBCaWFzID0gMC4xO1xyXG5cclxuXHRcdHRoaXMudmlldyA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcblx0XHR0aGlzLnRhcmdldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcblx0XHR0aGlzLnEgPSBuZXcgVEhSRUUuVmVjdG9yNCgpO1xyXG5cclxuXHRcdHRoaXMudmlydHVhbENhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSgpO1xyXG5cclxuXHRcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0XHRNaXBNYXBcclxuXHRcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRcdHRoaXMubWlwbWFwUFAgPSBudWxsO1xyXG5cdFx0dGhpcy5taXBtYXBHZW8gPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuXHJcblx0XHRsZXQgcG9zQXJyYXkgPSBbXTtcclxuXHRcdGxldCB1dkFycmF5ID0gW107XHJcblx0XHRsZXQgaW5kZXhBcnJheSA9IFtdO1xyXG5cclxuXHRcdGxldCBwID0gbmV3IFRIUkVFLlZlY3RvcjIoIDAsIDAgKTtcclxuXHRcdGxldCBzID0gMi4wO1xyXG5cclxuXHRcdHBvc0FycmF5LnB1c2goIHAueCwgcC55LCAwICk7XHJcblx0XHRwb3NBcnJheS5wdXNoKCBwLnggKyBzLCBwLnksIDAgKTtcclxuXHRcdHBvc0FycmF5LnB1c2goIHAueCArIHMsIHAueSAtIHMsIDAgKTtcclxuXHRcdHBvc0FycmF5LnB1c2goIHAueCwgcC55IC0gcywgMCApO1xyXG5cclxuXHRcdHV2QXJyYXkucHVzaCggMS4wLCAxLjAgKTtcclxuXHRcdHV2QXJyYXkucHVzaCggMC4wLCAxLjAgKTtcclxuXHRcdHV2QXJyYXkucHVzaCggMC4wLCAwLjAgKTtcclxuXHRcdHV2QXJyYXkucHVzaCggMS4wLCAwLjAgKTtcclxuXHJcblx0XHRpbmRleEFycmF5LnB1c2goIDAsIDIsIDEsIDAsIDMsIDIgKTtcclxuXHJcblx0XHRwLnNldCggcywgMCApO1xyXG5cclxuXHRcdGZvciAoIGxldCBpID0gMDsgaSA8IDc7IGkgKysgKSB7XHJcblxyXG5cdFx0XHRzICo9IDAuNTtcclxuXHJcblx0XHRcdHBvc0FycmF5LnB1c2goIHAueCxcdFx0cC55LFx0XHQwICk7XHJcblx0XHRcdHBvc0FycmF5LnB1c2goIHAueCArIHMsIHAueSxcdFx0MCApO1xyXG5cdFx0XHRwb3NBcnJheS5wdXNoKCBwLnggKyBzLCBwLnkgLSBzLFx0MCApO1xyXG5cdFx0XHRwb3NBcnJheS5wdXNoKCBwLngsXHRcdHAueSAtIHMsIFx0MCApO1xyXG5cclxuXHRcdFx0dXZBcnJheS5wdXNoKCAxLjAsIDEuMCApO1xyXG5cdFx0XHR1dkFycmF5LnB1c2goIDAuMCwgMS4wICk7XHJcblx0XHRcdHV2QXJyYXkucHVzaCggMC4wLCAwLjAgKTtcclxuXHRcdFx0dXZBcnJheS5wdXNoKCAxLjAsIDAuMCApO1xyXG5cclxuXHRcdFx0bGV0IGluZGV4T2Zmc2V0ID0gKCBpICsgMC4wICkgKiA0O1xyXG5cdFx0XHRpbmRleEFycmF5LnB1c2goIGluZGV4T2Zmc2V0ICsgMCwgaW5kZXhPZmZzZXQgKyAyLCBpbmRleE9mZnNldCArIDEsIGluZGV4T2Zmc2V0ICsgMCwgaW5kZXhPZmZzZXQgKyAzLCBpbmRleE9mZnNldCArIDIgKTtcclxuXHJcblx0XHRcdHAueSA9IHAueSAtIHM7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBwb3NBdHRyID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggbmV3IEZsb2F0MzJBcnJheSggcG9zQXJyYXkgKSwgMyApO1xyXG5cdFx0bGV0IHV2QXR0ciA9IG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIG5ldyBGbG9hdDMyQXJyYXkoIHV2QXJyYXkgKSwgMiApO1xyXG5cdFx0bGV0IGluZGV4QXR0ciA9IG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIG5ldyBVaW50MTZBcnJheSggaW5kZXhBcnJheSApLCAxICk7XHJcblxyXG5cdFx0bGV0IGdzID0gMTtcclxuXHRcdHBvc0F0dHIuYXBwbHlNYXRyaXg0KCBuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VTY2FsZSggKCAxLjAgLyAxLjUgKSwgZ3MsIGdzICkgKTtcclxuXHRcdHBvc0F0dHIuYXBwbHlNYXRyaXg0KCBuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VUcmFuc2xhdGlvbiggLSAxLjAsIDEuMCwgMCApICk7XHJcblxyXG5cdFx0dGhpcy5taXBtYXBHZW8uc2V0QXR0cmlidXRlKCAncG9zaXRpb24nLCBwb3NBdHRyICk7XHJcblx0XHR0aGlzLm1pcG1hcEdlby5zZXRBdHRyaWJ1dGUoICd1dicsIHV2QXR0ciApO1xyXG5cdFx0dGhpcy5taXBtYXBHZW8uc2V0SW5kZXgoIGluZGV4QXR0ciApO1xyXG5cclxuXHRcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0XHRSZW5kZXJUYXJnZXRzXHJcblx0XHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcblx0XHR0aGlzLnJlbmRlclRhcmdldHMgPSB7XHJcblx0XHRcdHJlZjogbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KCAxLCAxICksXHJcblx0XHRcdG1pcG1hcDogbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KCAxLCAxICksXHJcblx0XHR9O1xyXG5cclxuXHRcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0XHRSZWZsZWN0aW9uXHJcblx0XHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoICdiZWZvcmVSZW5kZXInLCAoIGU6IFRIUkVFLkV2ZW50ICkgPT4ge1xyXG5cclxuXHRcdFx0bGV0IHJlbmRlcmVyID0gZS5yZW5kZXJlciBhcyBUSFJFRS5XZWJHTFJlbmRlcmVyO1xyXG5cdFx0XHRsZXQgc2NlbmUgPSBlLnNjZW5lIGFzIFRIUkVFLlNjZW5lO1xyXG5cdFx0XHRsZXQgY2FtZXJhID0gZS5jYW1lcmEgYXMgVEhSRUUuQ2FtZXJhO1xyXG5cclxuXHRcdFx0dGhpcy5yZWZsZWN0b3JXb3JsZFBvc2l0aW9uLnNldEZyb21NYXRyaXhQb3NpdGlvbiggdGhpcy5tYXRyaXhXb3JsZCApO1xyXG5cdFx0XHR0aGlzLmNhbWVyYVdvcmxkUG9zaXRpb24uc2V0RnJvbU1hdHJpeFBvc2l0aW9uKCBjYW1lcmEubWF0cml4V29ybGQgKTtcclxuXHJcblx0XHRcdHRoaXMucm90YXRpb25NYXRyaXguZXh0cmFjdFJvdGF0aW9uKCB0aGlzLm1hdHJpeFdvcmxkICk7XHJcblxyXG5cdFx0XHR0aGlzLm5vcm1hbC5zZXQoIDAsIDEuMCwgMCApO1xyXG5cdFx0XHR0aGlzLm5vcm1hbC5hcHBseU1hdHJpeDQoIHRoaXMucm90YXRpb25NYXRyaXggKTtcclxuXHJcblx0XHRcdHRoaXMudmlldy5zdWJWZWN0b3JzKCB0aGlzLnJlZmxlY3RvcldvcmxkUG9zaXRpb24sIHRoaXMuY2FtZXJhV29ybGRQb3NpdGlvbiApO1xyXG5cclxuXHRcdFx0Ly8gQXZvaWQgcmVuZGVyaW5nIHdoZW4gcmVmbGVjdG9yIGlzIGZhY2luZyBhd2F5XHJcblxyXG5cdFx0XHRpZiAoIHRoaXMudmlldy5kb3QoIHRoaXMubm9ybWFsICkgPiAwICkgcmV0dXJuO1xyXG5cclxuXHRcdFx0dGhpcy52aWV3LnJlZmxlY3QoIHRoaXMubm9ybWFsICkubmVnYXRlKCk7XHJcblx0XHRcdHRoaXMudmlldy5hZGQoIHRoaXMucmVmbGVjdG9yV29ybGRQb3NpdGlvbiApO1xyXG5cclxuXHRcdFx0dGhpcy5yb3RhdGlvbk1hdHJpeC5leHRyYWN0Um90YXRpb24oIGNhbWVyYS5tYXRyaXhXb3JsZCApO1xyXG5cclxuXHRcdFx0dGhpcy5sb29rQXRQb3NpdGlvbi5zZXQoIDAsIDAsIC0gMSApO1xyXG5cdFx0XHR0aGlzLmxvb2tBdFBvc2l0aW9uLmFwcGx5TWF0cml4NCggdGhpcy5yb3RhdGlvbk1hdHJpeCApO1xyXG5cdFx0XHR0aGlzLmxvb2tBdFBvc2l0aW9uLmFkZCggdGhpcy5jYW1lcmFXb3JsZFBvc2l0aW9uICk7XHJcblxyXG5cdFx0XHR0aGlzLnRhcmdldC5zdWJWZWN0b3JzKCB0aGlzLnJlZmxlY3RvcldvcmxkUG9zaXRpb24sIHRoaXMubG9va0F0UG9zaXRpb24gKTtcclxuXHRcdFx0dGhpcy50YXJnZXQucmVmbGVjdCggdGhpcy5ub3JtYWwgKS5uZWdhdGUoKTtcclxuXHRcdFx0dGhpcy50YXJnZXQuYWRkKCB0aGlzLnJlZmxlY3RvcldvcmxkUG9zaXRpb24gKTtcclxuXHJcblx0XHRcdHRoaXMudmlydHVhbENhbWVyYS5wb3NpdGlvbi5jb3B5KCB0aGlzLnZpZXcgKTtcclxuXHRcdFx0dGhpcy52aXJ0dWFsQ2FtZXJhLnVwLnNldCggMCwgMSwgMCApO1xyXG5cdFx0XHR0aGlzLnZpcnR1YWxDYW1lcmEudXAuYXBwbHlNYXRyaXg0KCB0aGlzLnJvdGF0aW9uTWF0cml4ICk7XHJcblx0XHRcdHRoaXMudmlydHVhbENhbWVyYS51cC5yZWZsZWN0KCB0aGlzLm5vcm1hbCApO1xyXG5cdFx0XHR0aGlzLnZpcnR1YWxDYW1lcmEubG9va0F0KCB0aGlzLnRhcmdldCApO1xyXG5cclxuXHRcdFx0aWYgKCAoIGNhbWVyYSBhcyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSApLmZhciApIHtcclxuXHJcblx0XHRcdFx0dGhpcy52aXJ0dWFsQ2FtZXJhLmZhciA9ICggY2FtZXJhIGFzIFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhICkuZmFyOyAvLyBVc2VkIGluIFdlYkdMQmFja2dyb3VuZFxyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy52aXJ0dWFsQ2FtZXJhLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XHJcblx0XHRcdHRoaXMudmlydHVhbENhbWVyYS5wcm9qZWN0aW9uTWF0cml4LmNvcHkoIGNhbWVyYS5wcm9qZWN0aW9uTWF0cml4ICk7XHJcblxyXG5cdFx0XHQvLyBVcGRhdGUgdGhlIHRleHR1cmUgbWF0cml4XHJcblx0XHRcdHRoaXMudGV4dHVyZU1hdHJpeC5zZXQoXHJcblx0XHRcdFx0MC41LCAwLjAsIDAuMCwgMC41LFxyXG5cdFx0XHRcdDAuMCwgMC41LCAwLjAsIDAuNSxcclxuXHRcdFx0XHQwLjAsIDAuMCwgMC41LCAwLjUsXHJcblx0XHRcdFx0MC4wLCAwLjAsIDAuMCwgMS4wXHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHR0aGlzLnRleHR1cmVNYXRyaXgubXVsdGlwbHkoIHRoaXMudmlydHVhbENhbWVyYS5wcm9qZWN0aW9uTWF0cml4ICk7XHJcblx0XHRcdHRoaXMudGV4dHVyZU1hdHJpeC5tdWx0aXBseSggdGhpcy52aXJ0dWFsQ2FtZXJhLm1hdHJpeFdvcmxkSW52ZXJzZSApO1xyXG5cdFx0XHR0aGlzLnRleHR1cmVNYXRyaXgubXVsdGlwbHkoIHRoaXMubWF0cml4V29ybGQgKTtcclxuXHJcblx0XHRcdC8vIE5vdyB1cGRhdGUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCBuZXcgY2xpcCBwbGFuZSwgaW1wbGVtZW50aW5nIGNvZGUgZnJvbTogaHR0cDovL3d3dy50ZXJhdGhvbi5jb20vY29kZS9vYmxpcXVlLmh0bWxcclxuXHRcdFx0Ly8gUGFwZXIgZXhwbGFpbmluZyB0aGlzIHRlY2huaXF1ZTogaHR0cDovL3d3dy50ZXJhdGhvbi5jb20vbGVuZ3llbC9MZW5neWVsLU9ibGlxdWUucGRmXHJcblx0XHRcdHRoaXMucmVmbGVjdG9yUGxhbmUuc2V0RnJvbU5vcm1hbEFuZENvcGxhbmFyUG9pbnQoIHRoaXMubm9ybWFsLCB0aGlzLnJlZmxlY3RvcldvcmxkUG9zaXRpb24gKTtcclxuXHRcdFx0dGhpcy5yZWZsZWN0b3JQbGFuZS5hcHBseU1hdHJpeDQoIHRoaXMudmlydHVhbENhbWVyYS5tYXRyaXhXb3JsZEludmVyc2UgKTtcclxuXHJcblx0XHRcdHRoaXMuY2xpcFBsYW5lLnNldCggdGhpcy5yZWZsZWN0b3JQbGFuZS5ub3JtYWwueCwgdGhpcy5yZWZsZWN0b3JQbGFuZS5ub3JtYWwueSwgdGhpcy5yZWZsZWN0b3JQbGFuZS5ub3JtYWwueiwgdGhpcy5yZWZsZWN0b3JQbGFuZS5jb25zdGFudCApO1xyXG5cclxuXHRcdFx0dmFyIHByb2plY3Rpb25NYXRyaXggPSB0aGlzLnZpcnR1YWxDYW1lcmEucHJvamVjdGlvbk1hdHJpeDtcclxuXHJcblx0XHRcdHRoaXMucS54ID0gKCBNYXRoLnNpZ24oIHRoaXMuY2xpcFBsYW5lLnggKSArIHByb2plY3Rpb25NYXRyaXguZWxlbWVudHNbIDggXSApIC8gcHJvamVjdGlvbk1hdHJpeC5lbGVtZW50c1sgMCBdO1xyXG5cdFx0XHR0aGlzLnEueSA9ICggTWF0aC5zaWduKCB0aGlzLmNsaXBQbGFuZS55ICkgKyBwcm9qZWN0aW9uTWF0cml4LmVsZW1lbnRzWyA5IF0gKSAvIHByb2plY3Rpb25NYXRyaXguZWxlbWVudHNbIDUgXTtcclxuXHRcdFx0dGhpcy5xLnogPSAtIDEuMDtcclxuXHRcdFx0dGhpcy5xLncgPSAoIDEuMCArIHByb2plY3Rpb25NYXRyaXguZWxlbWVudHNbIDEwIF0gKSAvIHByb2plY3Rpb25NYXRyaXguZWxlbWVudHNbIDE0IF07XHJcblxyXG5cdFx0XHQvLyBDYWxjdWxhdGUgdGhlIHNjYWxlZCBwbGFuZSB2ZWN0b3JcclxuXHRcdFx0dGhpcy5jbGlwUGxhbmUubXVsdGlwbHlTY2FsYXIoIDIuMCAvIHRoaXMuY2xpcFBsYW5lLmRvdCggdGhpcy5xICkgKTtcclxuXHJcblx0XHRcdC8vIFJlcGxhY2luZyB0aGUgdGhpcmQgcm93IG9mIHRoZSBwcm9qZWN0aW9uIG1hdHJpeFxyXG5cdFx0XHRwcm9qZWN0aW9uTWF0cml4LmVsZW1lbnRzWyAyIF0gPSB0aGlzLmNsaXBQbGFuZS54O1xyXG5cdFx0XHRwcm9qZWN0aW9uTWF0cml4LmVsZW1lbnRzWyA2IF0gPSB0aGlzLmNsaXBQbGFuZS55O1xyXG5cdFx0XHRwcm9qZWN0aW9uTWF0cml4LmVsZW1lbnRzWyAxMCBdID0gdGhpcy5jbGlwUGxhbmUueiArIDEuMCAtIHRoaXMuY2xpcEJpYXM7XHJcblx0XHRcdHByb2plY3Rpb25NYXRyaXguZWxlbWVudHNbIDE0IF0gPSB0aGlzLmNsaXBQbGFuZS53O1xyXG5cclxuXHRcdFx0Ly9yZW5kZXJcclxuXHRcdFx0bGV0IGN1cnJlbnRSZW5kZXJUYXJnZXQgPSByZW5kZXJlci5nZXRSZW5kZXJUYXJnZXQoKTtcclxuXHJcblx0XHRcdHJlbmRlcmVyLnNldFJlbmRlclRhcmdldCggdGhpcy5yZW5kZXJUYXJnZXRzLnJlZiApO1xyXG5cdFx0XHR0aGlzLnZpc2libGUgPSBmYWxzZTtcclxuXHJcblx0XHRcdHJlbmRlcmVyLmNsZWFyKCk7XHJcblx0XHRcdHJlbmRlcmVyLnJlbmRlciggc2NlbmUsIHRoaXMudmlydHVhbENhbWVyYSApO1xyXG5cdFx0XHRyZW5kZXJlci5jbGVhckRlcHRoKCk7XHJcblxyXG5cdFx0XHRyZW5kZXJlci5zZXRSZW5kZXJUYXJnZXQoIGN1cnJlbnRSZW5kZXJUYXJnZXQgKTtcclxuXHRcdFx0dGhpcy52aXNpYmxlID0gdHJ1ZTtcclxuXHJcblx0XHRcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0XHRcdE1pcE1hcFBQXHJcblx0XHRcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRcdFx0aWYgKCB0aGlzLm1pcG1hcFBQID09IG51bGwgKSB7XHJcblxyXG5cdFx0XHRcdHRoaXMubWlwbWFwUFAgPSBuZXcgT1JFLlBvc3RQcm9jZXNzaW5nKCByZW5kZXJlciwge1xyXG5cdFx0XHRcdFx0ZnJhZ21lbnRTaGFkZXI6IG1pcG1hcEZyYWcsXHJcblx0XHRcdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXHJcblx0XHRcdFx0fSwgdGhpcy5taXBtYXBHZW8gKTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMubWlwbWFwUFAucmVuZGVyKCB7IHRleDogdGhpcy5yZW5kZXJUYXJnZXRzLnJlZi50ZXh0dXJlIH0sIHRoaXMucmVuZGVyVGFyZ2V0cy5taXBtYXAgKTtcclxuXHRcdFx0dGhpcy5jb21tb25Vbmlmb3Jtcy5yZWZsZWN0aW9uVGV4LnZhbHVlID0gdGhpcy5yZW5kZXJUYXJnZXRzLm1pcG1hcC50ZXh0dXJlO1xyXG5cclxuXHRcdFx0bGV0IHJ0ID0gcmVuZGVyZXIuZ2V0UmVuZGVyVGFyZ2V0KCkgYXMgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQ7XHJcblxyXG5cdFx0XHRpZiAoIHJ0ICkge1xyXG5cclxuXHRcdFx0XHR0aGlzLmNvbW1vblVuaWZvcm1zLnJlbmRlclJlc29sdXRpb24udmFsdWUuc2V0KCBydC53aWR0aCwgcnQuaGVpZ2h0ICk7XHJcblxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHRyZW5kZXJlci5nZXRTaXplKCB0aGlzLmNvbW1vblVuaWZvcm1zLnJlbmRlclJlc29sdXRpb24udmFsdWUgKTtcclxuXHRcdFx0XHR0aGlzLmNvbW1vblVuaWZvcm1zLnJlbmRlclJlc29sdXRpb24udmFsdWUubXVsdGlwbHlTY2FsYXIoIHJlbmRlcmVyLmdldFBpeGVsUmF0aW8oKSApO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH0gKTtcclxuXHJcblx0XHR0aGlzLnJlc2l6ZSgpO1xyXG5cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVzaXplKCkge1xyXG5cclxuXHRcdGxldCBzaXplID0gNTEyO1xyXG5cdFx0dGhpcy5yZW5kZXJUYXJnZXRzLnJlZi5zZXRTaXplKCBzaXplLCBzaXplICk7XHJcblxyXG5cdFx0bGV0IG1pcE1hcFNpemUgPSBuZXcgVEhSRUUuVmVjdG9yMiggc2l6ZSAqIDEuNSwgc2l6ZSApO1xyXG5cdFx0dGhpcy5yZW5kZXJUYXJnZXRzLm1pcG1hcC5zZXRTaXplKCBtaXBNYXBTaXplLngsIG1pcE1hcFNpemUueSApO1xyXG5cdFx0dGhpcy5jb21tb25Vbmlmb3Jtcy5taXBNYXBSZXNvbHV0aW9uLnZhbHVlLmNvcHkoIG1pcE1hcFNpemUgKTtcclxuXHJcblx0fVxyXG5cclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfb3JlX3RocmVlX3RzX187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX3RocmVlX187IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImV4cG9ydCB7IFBvd2VyTWVzaCB9IGZyb20gXCIuL1Bvd2VyTWVzaFwiO1xyXG5leHBvcnQgeyBQb3dlclJlZmxlY3Rpb25NZXNoIH0gZnJvbSBcIi4vUG93ZXJSZWZsZWN0aW9uTWVzaFwiO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=