(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("three"), require("ore-three"));
	else if(typeof define === 'function' && define.amd)
		define(["three", "ore-three"], factory);
	else if(typeof exports === 'object')
		exports["PowerMesh"] = factory(require("three"), require("ore-three"));
	else
		root["PowerMesh"] = factory(root["THREE"], root["ORE"]);
})(self, (__WEBPACK_EXTERNAL_MODULE_three__, __WEBPACK_EXTERNAL_MODULE_ore_three__) => {
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("#define GLSLIFY 1\nvarying vec2 vUv;\nvarying vec3 vTangent;\nvarying vec3 vBitangent;\n\n/*-------------------------------\n\tRequire\n-------------------------------*/\n\n#include <packing>\n\nvec2 packing16( float value ) { \n\n\tfloat v1 = value * 255.0;\n\tfloat r = floor(v1);\n\n\tfloat v2 = ( v1 - r ) * 255.0;\n\tfloat g = floor( v2 );\n\n\treturn vec2( r, g ) / 255.0;\n\n}\n\n/*-------------------------------\n\tRequiers\n-------------------------------*/\n\n#include <common>\n\nfloat random(vec2 p){\n\treturn fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\n/*-------------------------------\n\tMaterial Uniforms\n-------------------------------*/\n\nuniform float time;\n\n/*-------------------------------\n\tTextures\n-------------------------------*/\n\n#ifdef USE_MAP\n\n\tuniform sampler2D map;\n\n#else\n\n\tuniform vec3 color;\n\n#endif\n\n#ifdef USE_NORMAL_MAP\n\n\tuniform sampler2D normalMap;\n\n#endif\n\n#ifdef USE_ROUGHNESS_MAP\n\n\tuniform sampler2D roughnessMap;\n\n#else\n\n\tuniform float roughness;\n\n#endif\n\n#ifdef USE_ALPHA_MAP\n\n\tuniform sampler2D alphaMap;\n\n#else\n\n\tuniform float opacity;\n\t\n#endif\n\n#ifdef USE_METALNESS_MAP\n\n\tuniform sampler2D metalnessMap;\n\n#else\n\n\tuniform float metalness;\n\n#endif\n#ifdef USE_EMISSION_MAP\n\n\tuniform sampler2D emissionMap;\n\n#else\n\n\tuniform vec3 emission;\n\n#endif\n\n#ifdef IS_REFLECTIONPLANE\n\n\tuniform sampler2D reflectionTex;\n\tuniform vec2 renderResolution;\n\tuniform vec2 mipMapResolution;\n\t\n#endif\n\n/*-------------------------------\n\tTypes\n-------------------------------*/\n\nstruct Geometry {\n\tvec3 pos;\n\tvec3 posWorld;\n\tvec3 viewDir;\n\tvec3 viewDirWorld;\n\tvec3 normal;\n\tvec3 normalWorld;\n};\n\nstruct Light {\n\tvec3 direction;\n\tvec3 color;\n};\n\nstruct Material {\n\tvec3 albedo;\n\tvec3 diffuseColor;\n\tvec3 specularColor;\n\tfloat metalness;\n\tfloat roughness;\n\tfloat opacity;\n};\n\n/*-------------------------------\n\tLights\n-------------------------------*/\n\n#if NUM_DIR_LIGHTS > 0\n\n\tstruct DirectionalLight {\n\t\tvec3 direction;\n\t\tvec3 color;\n\t};\n\n\tuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n\n#endif\n\n#if NUM_POINT_LIGHTS > 0\n\n\tstruct PointLight {\n\t\tvec3 position;\n\t\tvec3 color;\n\t\tfloat distance;\n\t\tfloat decay;\n\t};\n\n\tuniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n\n#endif\n\n/*-------------------------------\n\tEnvMap\n-------------------------------*/\n\n#ifdef USE_ENV_MAP\n\n\tuniform sampler2D envMap;\n\tuniform float envMapIntensity;\n\tuniform float iblIntensity;\n\tuniform float maxLodLevel;\n\n\t#define ENVMAP_TYPE_CUBE_UV\n\t#include <cube_uv_reflection_fragment>\n\n#endif\n\n/*-------------------------------\n\tReflection\n-------------------------------*/\n\n#define REF_MIPMAP_LEVEL 8.0\n\n#ifdef IS_REFLECTIONPLANE\n\n\tvec2 getRefMipmapUV( vec2 uv, float level ) {\n\n\t\tvec2 ruv = uv;\n\n\t\tif( level > 0.0 ) {\n\n\t\t\truv.x *= 1.0 / ( 3.0 * ( pow( 2.0, level ) / 2.0 ) );\n\t\t\truv.y *= 1.0 / ( pow( 2.0, level ) );\n\t\t\truv.y += 1.0 / ( pow( 2.0, level ) );\n\t\t\truv.x += 1.0 / 1.5;\n\t\t\n\t\t} else {\n\n\t\t\truv.x /= 1.5;\n\t\t\t\n\t\t}\n\n\t\treturn ruv;\n\n\t}\n\t\n\tvec4 cubic(float v) {\n\t\tvec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;\n\t\tvec4 s = n * n * n;\n\t\tfloat x = s.x;\n\t\tfloat y = s.y - 4.0 * s.x;\n\t\tfloat z = s.z - 4.0 * s.y + 6.0 * s.x;\n\t\tfloat w = 6.0 - x - y - z;\n\t\treturn vec4(x, y, z, w);\n\t}\n\n\t// https://stackoverflow.com/questions/13501081/efficient-bicubic-filtering-code-in-glsl\n\tvec4 textureBicubic(sampler2D t, vec2 texCoords, vec2 textureSize) {\n\t\tvec2 invTexSize = 1.0 / textureSize;\n\t\ttexCoords = texCoords * textureSize - 0.5;\n\t\tvec2 fxy = fract(texCoords);\n\t\ttexCoords -= fxy;\n\t\tvec4 xcubic = cubic(fxy.x);\n\t\tvec4 ycubic = cubic(fxy.y);\n\t\tvec4 c = texCoords.xxyy + vec2 (-0.5, 1.5).xyxy;\n\t\tvec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);\n\t\tvec4 offset = c + vec4 (xcubic.yw, ycubic.yw) / s;\n\t\toffset *= invTexSize.xxyy;\n\t\tvec4 sample0 = texture2D(t, offset.xz);\n\t\tvec4 sample1 = texture2D(t, offset.yz);\n\t\tvec4 sample2 = texture2D(t, offset.xw);\n\t\tvec4 sample3 = texture2D(t, offset.yw);\n\t\tfloat sx = s.x / (s.x + s.y);\n\t\tfloat sy = s.z / (s.z + s.w);\n\t\treturn mix(\n\t\tmix(sample3, sample2, sx), mix(sample1, sample0, sx), sy);\n\t}\n\n#endif\n\n/*-------------------------------\n\tShadow\n-------------------------------*/\n\n#ifdef DEPTH\n\n\tvarying vec2 vHighPrecisionZW;\n\tuniform float cameraNear;\n\tuniform float cameraFar;\n\n#endif\n\n#ifdef USE_SHADOWMAP\n\n#if NUM_DIR_LIGHT_SHADOWS > 0\n\n\t\tuniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];\n\t\tvarying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];\n\n\t\tstruct DirectionalLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t};\n\n\t\tuniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];\n\n\t#endif\n\n\t#define SHADOW_SAMPLE_COUNT 4\n\n\tvec2 poissonDisk[ SHADOW_SAMPLE_COUNT ];\n\n\tvoid initPoissonDisk( float seed ) {\n\n\t\tfloat r = 0.1;\n\t\tfloat rStep = (1.0 - r) / float( SHADOW_SAMPLE_COUNT );\n\n\t\tfloat ang = random( gl_FragCoord.xy * 0.01 + sin( time ) ) * PI2 * 1.0;\n\t\tfloat angStep = ( ( PI2 * 11.0 ) / float( SHADOW_SAMPLE_COUNT ) );\n\t\t\n\t\tfor( int i = 0; i < SHADOW_SAMPLE_COUNT; i++ ) {\n\n\t\t\tpoissonDisk[ i ] = vec2(\n\t\t\t\tsin( ang ),\n\t\t\t\tcos( ang )\n\t\t\t) * pow( r, 0.75 );\n\n\t\t\tr += rStep;\n\t\t\tang += angStep;\n\t\t}\n\t\t\n\t}\n\n\tvec2 compairShadowMapDepth( sampler2D shadowMap, vec2 shadowMapUV, float depth ) {\n\n\t\tif( shadowMapUV.x < 0.0 || shadowMapUV.x > 1.0 || shadowMapUV.y < 0.0 || shadowMapUV.y > 1.0 ) {\n\n\t\t\treturn vec2( 1.0, 0.0 );\n\n\t\t}\n\n\t\tfloat shadowMapDepth = unpackRGBAToDepth( texture2D( shadowMap, shadowMapUV ) );\n\n\t\tif( 0.0 >= shadowMapDepth || shadowMapDepth >= 1.0 ) {\n\n\t\t\treturn vec2( 1.0, 0.0 );\n\n\t\t}\n\t\t\n\t\tfloat shadow = depth <= shadowMapDepth ? 1.0 : 0.0;\n\n\t\treturn vec2( shadow, shadowMapDepth );\n\t\t\n\t}\n\n\tfloat shadowMapPCF( sampler2D shadowMap, vec4 shadowMapCoord, vec2 shadowSize ) {\n\n\t\tfloat shadow = 0.0;\n\t\t\n\t\tfor( int i = 0; i < SHADOW_SAMPLE_COUNT; i ++  ) {\n\t\t\t\n\t\t\tvec2 offset = poissonDisk[ i ] * shadowSize; \n\n\t\t\tshadow += compairShadowMapDepth( shadowMap, shadowMapCoord.xy + offset, shadowMapCoord.z ).x;\n\t\t\t\n\t\t}\n\n\t\tshadow /= float( SHADOW_SAMPLE_COUNT );\n\n\t\treturn shadow;\n\n\t}\n\n\tfloat getShadow( sampler2D shadowMap, vec2 shadowMapSize, float bias, vec4 shadowMapCoord ) {\n\t\t\n\t\tshadowMapCoord.xyz /= shadowMapCoord.w;\n\t\tshadowMapCoord.z += bias - 0.0001;\n\n\t\tinitPoissonDisk(time);\n\n\t\tvec2 shadowSize = 1.0 / shadowMapSize;\n\n\t\treturn shadowMapPCF( shadowMap, shadowMapCoord, shadowSize );\n\n\t}\n\n#endif\n\n/*-------------------------------\n\tRE\n-------------------------------*/\n\nvarying vec3 vNormal;\nvarying vec3 vViewNormal;\nvarying vec3 vViewPos;\nvarying vec3 vWorldPos;\n\nfloat ggx( float dNH, float roughness ) {\n\t\n\tfloat a2 = roughness * roughness;\n\ta2 = a2 * a2;\n\tfloat dNH2 = dNH * dNH;\n\n\tif( dNH2 <= 0.0 ) return 0.0;\n\n\treturn a2 / ( PI * pow( dNH2 * ( a2 - 1.0 ) + 1.0, 2.0) );\n\n}\n\nvec3 lambert( vec3 diffuseColor ) {\n\n\treturn diffuseColor / PI;\n\n}\n\nfloat gSchlick( float d, float k ) {\n\n\tif( d == 0.0 ) return 0.0;\n\n\treturn d / ( d * ( 1.0 - k ) + k );\n\t\n}\n\nfloat gSmith( float dNV, float dNL, float roughness ) {\n\n\tfloat k = clamp( roughness * sqrt( 2.0 / PI ), 0.0, 1.0 );\n\n\treturn gSchlick( dNV, k ) * gSchlick( dNL, k );\n\t\n}\n\nfloat fresnel( float d ) {\n\t\n\tfloat f0 = 0.04;\n\n\treturn f0 + ( 1.0 - f0 ) * pow( 1.0 - d, 5.0 );\n\n}\n\nvec3 RE( Geometry geo, Material mat, Light light) {\n\n\tvec3 lightDir = normalize( light.direction );\n\tvec3 halfVec = normalize( geo.viewDir + lightDir );\n\n\tfloat dLH = clamp( dot( lightDir, halfVec ), 0.0, 1.0 );\n\tfloat dNH = clamp( dot( geo.normal, halfVec ), 0.0, 1.0 );\n\tfloat dNV = clamp( dot( geo.normal, geo.viewDir ), 0.0, 1.0 );\n\tfloat dNL = clamp( dot( geo.normal, lightDir), 0.0, 1.0 );\n\n\tvec3 irradiance = light.color * dNL;\n\n\t// diffuse\n\tvec3 diffuse = lambert( mat.diffuseColor ) * irradiance;\n\n\t// specular\n\tfloat D = ggx( dNH, mat.roughness );\n\tfloat G = gSmith( dNV, dNL, mat.roughness );\n\tfloat F = fresnel( dLH );\n\t\n\tvec3 specular = (( D * G * F ) / ( 4.0 * dNL * dNV + 0.0001 ) * mat.specularColor ) * irradiance; \n\n\tvec3 c = vec3( 0.0 );\n\tc += diffuse * ( 1.0 - F ) + specular;\n\n\treturn c;\n\n}\n\n/*-------------------------------\n\tMain\n-------------------------------*/\n\nvoid main( void ) {\n\n\t/*-------------------------------\n\t\tMaterial\n\t-------------------------------*/\n\n\tMaterial mat;\n\n\t#ifdef USE_MAP\n\n\t\tvec4 color = LinearTosRGB( texture2D( map, vUv ) );\n\t\tmat.albedo = color.xyz;\n\t\tmat.opacity = color.w;\n\n\t#else\n\n\t\tmat.albedo = color.xyz;\n\t\tmat.opacity = 1.0;\n\t\n\t#endif\n\n\t#ifdef USE_ROUGHNESS_MAP\n\n\t\tmat.roughness = texture2D( roughnessMap, vUv ).y;\n\n\t#else\n\n\t\tmat.roughness = roughness;\n\t\n\t#endif\n\n\t#ifdef USE_METALNESS_MAP\n\n\t\tmat.metalness = texture2D( metalnessMap, vUv ).z;\n\n\t#else\n\n\t\tmat.metalness = metalness;\n\t\n\t#endif\n\n\t#ifdef USE_ALPHA_MAP\n\n\t\tmat.opacity = texture2D( alphaMap, vUv ).x;\n\n\t#else\n\n\t\tmat.opacity *= opacity;\n\n\t#endif\n\t\n\t// if( mat.opacity < 0.5 ) discard;\n\n\tmat.diffuseColor = mix( mat.albedo, vec3( 0.0, 0.0, 0.0 ), mat.metalness );\n\tmat.specularColor = mix( vec3( 1.0, 1.0, 1.0 ), mat.albedo, mat.metalness );\n\n\t// output\n\tvec3 outColor = vec3( 0.0 );\n\tfloat outOpacity = mat.opacity;\n\n\t/*-------------------------------\n\t\tDepth\n\t-------------------------------*/\n\n\t#ifdef DEPTH\n\n\t\tfloat fragCoordZ = 0.5 * vHighPrecisionZW.x / vHighPrecisionZW.y + 0.5;\n\t\tgl_FragColor = packDepthToRGBA( fragCoordZ );\n\t\treturn;\n\t\n\t#endif\n\n\t/*-------------------------------\n\t\tGeometry\n\t-------------------------------*/\n\n\tfloat faceDirection = gl_FrontFacing ? 1.0 : -1.0;\n\n\tGeometry geo;\n\tgeo.pos = -vViewPos;\n\tgeo.posWorld = vWorldPos;\n\tgeo.viewDir = normalize( vViewPos );\n\tgeo.viewDirWorld = normalize( geo.posWorld - cameraPosition );\n\tgeo.normal = normalize( vNormal ) * faceDirection;\n\n\t#ifdef USE_NORMAL_MAP\n\t\t\n\t\tvec3 tangent = normalize( vTangent );\n\t\tvec3 bitangent = normalize( vBitangent );\n\n\t\t#ifdef DOUBLE_SIDED\n\n\t\t\ttangent *= faceDirection;\n\t\t\tbitangent *= faceDirection;\n\t\t\n\t\t#endif\n\t\t\n\t\tmat3 vTBN = mat3( tangent, bitangent, geo.normal );\n\t\t\n\t\tvec3 mapN = texture2D( normalMap, vUv ).xyz;\n\t\tmapN = mapN * 2.0 - 1.0;\n\t\tgeo.normal = normalize( vTBN * mapN );\n\n\t#endif\n\t\n\tgeo.normalWorld = normalize( ( vec4( geo.normal, 0.0 ) * viewMatrix ).xyz );\n\n\t/*-------------------------------\n\t\tLighting\n\t-------------------------------*/\n\t\n\tLight light;\n\n\t#if NUM_DIR_LIGHTS > 0\n\n\t\t#pragma unroll_loop_start\n\t\t\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\n\t\t\t\tlight.direction = directionalLights[ i ].direction;\n\t\t\t\tlight.color = directionalLights[ i ].color;\n\n\t\t\t\tfloat shadow = 1.0;\n\t\t\t\t\n\t\t\t\t#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0\n\n\t\t\t\t\tshadow = getShadow( directionalShadowMap[ i ], directionalLightShadows[ i ].shadowMapSize, directionalLightShadows[ i ].shadowBias, vDirectionalShadowCoord[ i ] );\n\n\t\t\t\t#endif\n\n\t\t\t\toutColor += RE( geo, mat, light ) * shadow;\n\t\t\t\t\n\t\t\t}\n\t\t#pragma unroll_loop_end\n\n\t#endif\n\n\t#if NUM_POINT_LIGHTS > 0\n\n\t\tPointLight pLight;\n\t\tvec3 v;\n\t\tfloat d;\n\t\tfloat attenuation;\n\t\t#pragma unroll_loop_start\n\n\t\t\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\n\t\t\t\tpLight = pointLights[ i ];\n\n\t\t\t\tv = pLight.position - geo.pos;\n\t\t\t\td = length( v );\n\t\t\t\tlight.direction = normalize( v );\n\t\t\n\t\t\t\tlight.color = pLight.color;\n\n\t\t\t\tif( pLight.distance > 0.0 && pLight.decay > 0.0 ) {\n\n\t\t\t\t\tattenuation = pow( clamp( -d / pLight.distance + 1.0, 0.0, 1.0 ), pLight.decay );\n\t\t\t\t\tlight.color *= attenuation;\n\n\t\t\t\t}\n\n\t\t\t\toutColor += RE( geo, mat, light );\n\t\t\t\t\n\t\t\t}\n\t\t\t\n\t\t#pragma unroll_loop_end\n\n\t#endif\n\n\t#if defined( USE_ENV_MAP ) || defined( IS_REFLECTIONPLANE )\n\n\t\tfloat dNV = clamp( dot( geo.normal, geo.viewDir ), 0.0, 1.0 );\n\t\tfloat EF = fresnel( dNV );\n\n\t#endif\n\n\t/*-------------------------------\n\t\tEnvironment Lighting\n\t-------------------------------*/\n\n\t#ifdef USE_ENV_MAP\n\n\t\tvec3 refDir = reflect( geo.viewDirWorld, geo.normalWorld );\n\t\trefDir.x *= -1.0;\n\t\n\t\tvec4 envMapColor = textureCubeUV( envMap, geo.normalWorld, 1.0 ) * iblIntensity * envMapIntensity;\n\t\toutColor += mat.diffuseColor * envMapColor.xyz * ( 1.0 - mat.metalness );\n\n\t#endif\n\n\t/*-------------------------------\n\t\tReflection\n\t-------------------------------*/\n\t\n\t#ifdef IS_REFLECTIONPLANE\n\t\n\t\tvec2 refUV = gl_FragCoord.xy / renderResolution;\n\n\t\trefUV.x += geo.normal.x * 0.5;\n\n\t\tfloat l = (mat.roughness ) * 1.6 * REF_MIPMAP_LEVEL;\n\n\t\tfloat offset1 = floor( l );\n\t\tfloat offset2 = offset1 + 1.0;\n\t\tfloat blend = fract( l );\n\t\t\n\t\tvec2 ruv1 = getRefMipmapUV( refUV, offset1 );\n\t\tvec2 ruv2 = getRefMipmapUV( refUV, offset2 );\n\n\t\tvec3 ref1 = textureBicubic( reflectionTex, ruv1, mipMapResolution ).xyz;\n\t\tvec3 ref2 = textureBicubic( reflectionTex, ruv2, mipMapResolution ).xyz;\n\n\t\tvec3 ref = mat.specularColor * mix( ref1, ref2, blend );\n\n\t\toutColor = mix(\n\t\t\toutColor + ref * mat.metalness,\n\t\t\tref,\n\t\t\tEF\n\t\t);\n\n\t#elif defined( USE_ENV_MAP )\n\t\n\t\tvec3 env = mat.specularColor * textureCubeUV( envMap, refDir, mat.roughness ).xyz * envMapIntensity;\n\t\n\t\toutColor = mix(\n\t\t\toutColor + env * mat.metalness,\n\t\t\tenv,\n\t\t\tEF\n\t\t);\n\t\n\t#endif\n\n\t/*-------------------------------\n\t\tEmission\n\t-------------------------------*/\n\n\t#ifdef USE_EMISSION_MAP\n\n\t\toutColor += LinearTosRGB( texture2D( emissionMap, vUv ) ).xyz;\n\t\n\t#else\n\n\t\toutColor += emission;\n\n\t#endif\n\n\tgl_FragColor = vec4( outColor, outOpacity );\n\n}");

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
/* harmony import */ var ore_three__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ore-three */ "ore-three");
/* harmony import */ var ore_three__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(ore_three__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _shaders_power_vs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shaders/power.vs */ "./src/PowerMesh/shaders/power.vs");
/* harmony import */ var _shaders_power_fs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./shaders/power.fs */ "./src/PowerMesh/shaders/power.fs");




class PowerMesh extends three__WEBPACK_IMPORTED_MODULE_0__.Mesh {
    constructor(geoMesh, materialOption, override) {
        materialOption = materialOption || {};
        let uni = ore_three__WEBPACK_IMPORTED_MODULE_1__.UniformsLib.mergeUniforms(materialOption.uniforms || {}, {
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
        uni = ore_three__WEBPACK_IMPORTED_MODULE_1__.UniformsLib.mergeUniforms(uni, three__WEBPACK_IMPORTED_MODULE_0__.UniformsUtils.clone(three__WEBPACK_IMPORTED_MODULE_0__.UniformsLib.lights));
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
/* harmony import */ var ore_three__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ore-three */ "ore-three");
/* harmony import */ var ore_three__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(ore_three__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _PowerMesh__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../PowerMesh */ "./src/PowerMesh/index.ts");
/* harmony import */ var _shaders_mipmap_fs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./shaders/mipmap.fs */ "./src/PowerReflectionMesh/shaders/mipmap.fs");




class PowerReflectionMesh extends _PowerMesh__WEBPACK_IMPORTED_MODULE_2__.PowerMesh {
    constructor(geoMesh, materialOption, override) {
        materialOption = materialOption || {};
        materialOption.uniforms = ore_three__WEBPACK_IMPORTED_MODULE_1__.UniformsLib.mergeUniforms(materialOption.uniforms || {}, {
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
                this.mipmapPP = new ore_three__WEBPACK_IMPORTED_MODULE_1__.PostProcessing(renderer, {
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

/***/ "ore-three":
/*!************************************************************************************************!*\
  !*** external {"commonjs":"ore-three","commonjs2":"ore-three","amd":"ore-three","root":"ORE"} ***!
  \************************************************************************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_ore_three__;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUUsQ0FBQztRQUN6QixPQUFPLENBQUMsSUFBSSxDQUFFLEdBQUcsRUFBRSxHQUFHLENBQUUsQ0FBQztRQUV6QixVQUFVLENBQUMsSUFBSSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUM7UUFFcEMsQ0FBQyxDQUFDLEdBQUcsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUM7UUFFZCxLQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRyxFQUFHO1lBRTlCLENBQUMsSUFBSSxHQUFHLENBQUM7WUFFVCxRQUFRLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUUsQ0FBQztZQUMvQixRQUFRLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFFLENBQUM7WUFDbEMsUUFBUSxDQUFDLElBQUksQ0FBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQztZQUNyQyxRQUFRLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUcsQ0FBQyxDQUFFLENBQUM7WUFFbkMsT0FBTyxDQUFDLElBQUksQ0FBRSxHQUFHLEVBQUUsR0FBRyxDQUFFLENBQUM7WUFDekIsT0FBTyxDQUFDLElBQUksQ0FBRSxHQUFHLEVBQUUsR0FBRyxDQUFFLENBQUM7WUFDekIsT0FBTyxDQUFDLElBQUksQ0FBRSxHQUFHLEVBQUUsR0FBRyxDQUFFLENBQUM7WUFDekIsT0FBTyxDQUFDLElBQUksQ0FBRSxHQUFHLEVBQUUsR0FBRyxDQUFFLENBQUM7WUFFekIsSUFBSSxXQUFXLEdBQUcsQ0FBRSxDQUFDLEdBQUcs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S0FBSyxDQUFDLElBQUksQ0FBRSxVQUFVLENBQUUsQ0FBQztJQUUvRCxDQUFDO0NBRUQ7Ozs7Ozs7Ozs7O0FDclREOzs7Ozs7Ozs7O0FDQUE7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7OztBQ053QztBQUNvQiIsInNvdXJjZXMiOlsid2VicGFjazovL1Bvd2VyTWVzaC93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vUG93ZXJNZXNoLy4vc3JjL1Bvd2VyTWVzaC9zaGFkZXJzL3Bvd2VyLmZzIiwid2VicGFjazovL1Bvd2VyTWVzaC8uL3NyYy9Qb3dlck1lc2gvc2hhZGVycy9wb3dlci52cyIsIndlYnBhY2s6Ly9Qb3dlck1lc2gvLi9zcmMvUG93ZXJSZWZsZWN0aW9uTWVzaC9zaGFkZXJzL21pcG1hcC5mcyIsIndlYnBhY2s6Ly9Qb3dlck1lc2gvLi9zcmMvUG93ZXJNZXNoL2luZGV4LnRzIiwid2VicGFjazovL1Bvd2VyTWVzaC8uL3NyYy9Qb3dlclJlZmxlY3Rpb25NZXNoL2luZGV4LnRzIiwid2VicGFjazovL1Bvd2VyTWVzaC9leHRlcm5hbCB1bWQge1wiY29tbW9uanNcIjpcIm9yZS10aHJlZVwiLFwiY29tbW9uanMyXCI6XCJvcmUtdGhyZWVcIixcImFtZFwiOlwib3JlLXRocmVlXCIsXCJyb290XCI6XCJPUkVcIn0iLCJ3ZWJwYWNrOi8vUG93ZXJNZXNoL2V4dGVybmFsIHVtZCB7XCJjb21tb25qc1wiOlwidGhyZWVcIixcImNvbW1vbmpzMlwiOlwidGhyZWVcIixcImFtZFwiOlwidGhyZWVcIixcInJvb3RcIjpcIlRIUkVFXCJ9Iiwid2VicGFjazovL1Bvd2VyTWVzaC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9Qb3dlck1lc2gvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vUG93ZXJNZXNoL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9Qb3dlck1lc2gvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9Qb3dlck1lc2gvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9Qb3dlck1lc2gvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKFwidGhyZWVcIiksIHJlcXVpcmUoXCJvcmUtdGhyZWVcIikpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW1widGhyZWVcIiwgXCJvcmUtdGhyZWVcIl0sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiUG93ZXJNZXNoXCJdID0gZmFjdG9yeShyZXF1aXJlKFwidGhyZWVcIiksIHJlcXVpcmUoXCJvcmUtdGhyZWVcIikpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIlBvd2VyTWVzaFwiXSA9IGZhY3Rvcnkocm9vdFtcIlRIUkVFXCJdLCByb290W1wiT1JFXCJdKTtcbn0pKHNlbGYsIChfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX3RocmVlX18sIF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfb3JlX3RocmVlX18pID0+IHtcbnJldHVybiAiLCJleHBvcnQgZGVmYXVsdCBcIiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyB2ZWMyIHZVdjtcXG52YXJ5aW5nIHZlYzMgdlRhbmdlbnQ7XFxudmFyeWluZyB2ZWMzIHZCaXRhbmdlbnQ7XFxuXFxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0UmVxdWlyZVxcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcbiNpbmNsdWRlIDxwYWNraW5nPlxcblxcbnZlYzIgcGFja2luZzE2KCBmbG9hdCB2YWx1ZSApIHsgXFxuXFxuXFx0ZmxvYXQgdjEgPSB2YWx1ZSAqIDI1NS4wO1xcblxcdGZsb2F0IHIgPSBmbG9vcih2MSk7XFxuXFxuXFx0ZmxvYXQgdjIgPSAoIHYxIC0gciApICogMjU1LjA7XFxuXFx0ZmxvYXQgZyA9IGZsb29yKCB2MiApO1xcblxcblxcdHJldHVybiB2ZWMyKCByLCBnICkgLyAyNTUuMDtcXG5cXG59XFxuXFxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0UmVxdWllcnNcXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG4jaW5jbHVkZSA8Y29tbW9uPlxcblxcbmZsb2F0IHJhbmRvbSh2ZWMyIHApe1xcblxcdHJldHVybiBmcmFjdChzaW4oZG90KHAueHkgLHZlYzIoMTIuOTg5OCw3OC4yMzMpKSkgKiA0Mzc1OC41NDUzKTtcXG59XFxuXFxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0TWF0ZXJpYWwgVW5pZm9ybXNcXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG51bmlmb3JtIGZsb2F0IHRpbWU7XFxuXFxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0VGV4dHVyZXNcXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG4jaWZkZWYgVVNFX01BUFxcblxcblxcdHVuaWZvcm0gc2FtcGxlcjJEIG1hcDtcXG5cXG4jZWxzZVxcblxcblxcdHVuaWZvcm0gdmVjMyBjb2xvcjtcXG5cXG4jZW5kaWZcXG5cXG4jaWZkZWYgVVNFX05PUk1BTF9NQVBcXG5cXG5cXHR1bmlmb3JtIHNhbXBsZXIyRCBub3JtYWxNYXA7XFxuXFxuI2VuZGlmXFxuXFxuI2lmZGVmIFVTRV9ST1VHSE5FU1NfTUFQXFxuXFxuXFx0dW5pZm9ybSBzYW1wbGVyMkQgcm91Z2huZXNzTWFwO1xcblxcbiNlbHNlXFxuXFxuXFx0dW5pZm9ybSBmbG9hdCByb3VnaG5lc3M7XFxuXFxuI2VuZGlmXFxuXFxuI2lmZGVmIFVTRV9BTFBIQV9NQVBcXG5cXG5cXHR1bmlmb3JtIHNhbXBsZXIyRCBhbHBoYU1hcDtcXG5cXG4jZWxzZVxcblxcblxcdHVuaWZvcm0gZmxvYXQgb3BhY2l0eTtcXG5cXHRcXG4jZW5kaWZcXG5cXG4jaWZkZWYgVVNFX01FVEFMTkVTU19NQVBcXG5cXG5cXHR1bmlmb3JtIHNhbXBsZXIyRCBtZXRhbG5lc3NNYXA7XFxuXFxuI2Vsc2VcXG5cXG5cXHR1bmlmb3JtIGZsb2F0IG1ldGFsbmVzcztcXG5cXG4jZW5kaWZcXG4jaWZkZWYgVVNFX0VNSVNTSU9OX01BUFxcblxcblxcdHVuaWZvcm0gc2FtcGxlcjJEIGVtaXNzaW9uTWFwO1xcblxcbiNlbHNlXFxuXFxuXFx0dW5pZm9ybSB2ZWMzIGVtaXNzaW9uO1xcblxcbiNlbmRpZlxcblxcbiNpZmRlZiBJU19SRUZMRUNUSU9OUExBTkVcXG5cXG5cXHR1bmlmb3JtIHNhbXBsZXIyRCByZWZsZWN0aW9uVGV4O1xcblxcdHVuaWZvcm0gdmVjMiByZW5kZXJSZXNvbHV0aW9uO1xcblxcdHVuaWZvcm0gdmVjMiBtaXBNYXBSZXNvbHV0aW9uO1xcblxcdFxcbiNlbmRpZlxcblxcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcblxcdFR5cGVzXFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxuc3RydWN0IEdlb21ldHJ5IHtcXG5cXHR2ZWMzIHBvcztcXG5cXHR2ZWMzIHBvc1dvcmxkO1xcblxcdHZlYzMgdmlld0RpcjtcXG5cXHR2ZWMzIHZpZXdEaXJXb3JsZDtcXG5cXHR2ZWMzIG5vcm1hbDtcXG5cXHR2ZWMzIG5vcm1hbFdvcmxkO1xcbn07XFxuXFxuc3RydWN0IExpZ2h0IHtcXG5cXHR2ZWMzIGRpcmVjdGlvbjtcXG5cXHR2ZWMzIGNvbG9yO1xcbn07XFxuXFxuc3RydWN0IE1hdGVyaWFsIHtcXG5cXHR2ZWMzIGFsYmVkbztcXG5cXHR2ZWMzIGRpZmZ1c2VDb2xvcjtcXG5cXHR2ZWMzIHNwZWN1bGFyQ29sb3I7XFxuXFx0ZmxvYXQgbWV0YWxuZXNzO1xcblxcdGZsb2F0IHJvdWdobmVzcztcXG5cXHRmbG9hdCBvcGFjaXR5O1xcbn07XFxuXFxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0TGlnaHRzXFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxuI2lmIE5VTV9ESVJfTElHSFRTID4gMFxcblxcblxcdHN0cnVjdCBEaXJlY3Rpb25hbExpZ2h0IHtcXG5cXHRcXHR2ZWMzIGRpcmVjdGlvbjtcXG5cXHRcXHR2ZWMzIGNvbG9yO1xcblxcdH07XFxuXFxuXFx0dW5pZm9ybSBEaXJlY3Rpb25hbExpZ2h0IGRpcmVjdGlvbmFsTGlnaHRzWyBOVU1fRElSX0xJR0hUUyBdO1xcblxcbiNlbmRpZlxcblxcbiNpZiBOVU1fUE9JTlRfTElHSFRTID4gMFxcblxcblxcdHN0cnVjdCBQb2ludExpZ2h0IHtcXG5cXHRcXHR2ZWMzIHBvc2l0aW9uO1xcblxcdFxcdHZlYzMgY29sb3I7XFxuXFx0XFx0ZmxvYXQgZGlzdGFuY2U7XFxuXFx0XFx0ZmxvYXQgZGVjYXk7XFxuXFx0fTtcXG5cXG5cXHR1bmlmb3JtIFBvaW50TGlnaHQgcG9pbnRMaWdodHNbIE5VTV9QT0lOVF9MSUdIVFMgXTtcXG5cXG4jZW5kaWZcXG5cXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRFbnZNYXBcXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG4jaWZkZWYgVVNFX0VOVl9NQVBcXG5cXG5cXHR1bmlmb3JtIHNhbXBsZXIyRCBlbnZNYXA7XFxuXFx0dW5pZm9ybSBmbG9hdCBlbnZNYXBJbnRlbnNpdHk7XFxuXFx0dW5pZm9ybSBmbG9hdCBpYmxJbnRlbnNpdHk7XFxuXFx0dW5pZm9ybSBmbG9hdCBtYXhMb2RMZXZlbDtcXG5cXG5cXHQjZGVmaW5lIEVOVk1BUF9UWVBFX0NVQkVfVVZcXG5cXHQjaW5jbHVkZSA8Y3ViZV91dl9yZWZsZWN0aW9uX2ZyYWdtZW50PlxcblxcbiNlbmRpZlxcblxcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcblxcdFJlZmxlY3Rpb25cXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG4jZGVmaW5lIFJFRl9NSVBNQVBfTEVWRUwgOC4wXFxuXFxuI2lmZGVmIElTX1JFRkxFQ1RJT05QTEFORVxcblxcblxcdHZlYzIgZ2V0UmVmTWlwbWFwVVYoIHZlYzIgdXYsIGZsb2F0IGxldmVsICkge1xcblxcblxcdFxcdHZlYzIgcnV2ID0gdXY7XFxuXFxuXFx0XFx0aWYoIGxldmVsID4gMC4wICkge1xcblxcblxcdFxcdFxcdHJ1di54ICo9IDEuMCAvICggMy4wICogKCBwb3coIDIuMCwgbGV2ZWwgKSAvIDIuMCApICk7XFxuXFx0XFx0XFx0cnV2LnkgKj0gMS4wIC8gKCBwb3coIDIuMCwgbGV2ZWwgKSApO1xcblxcdFxcdFxcdHJ1di55ICs9IDEuMCAvICggcG93KCAyLjAsIGxldmVsICkgKTtcXG5cXHRcXHRcXHRydXYueCArPSAxLjAgLyAxLjU7XFxuXFx0XFx0XFxuXFx0XFx0fSBlbHNlIHtcXG5cXG5cXHRcXHRcXHRydXYueCAvPSAxLjU7XFxuXFx0XFx0XFx0XFxuXFx0XFx0fVxcblxcblxcdFxcdHJldHVybiBydXY7XFxuXFxuXFx0fVxcblxcdFxcblxcdHZlYzQgY3ViaWMoZmxvYXQgdikge1xcblxcdFxcdHZlYzQgbiA9IHZlYzQoMS4wLCAyLjAsIDMuMCwgNC4wKSAtIHY7XFxuXFx0XFx0dmVjNCBzID0gbiAqIG4gKiBuO1xcblxcdFxcdGZsb2F0IHggPSBzLng7XFxuXFx0XFx0ZmxvYXQgeSA9IHMueSAtIDQuMCAqIHMueDtcXG5cXHRcXHRmbG9hdCB6ID0gcy56IC0gNC4wICogcy55ICsgNi4wICogcy54O1xcblxcdFxcdGZsb2F0IHcgPSA2LjAgLSB4IC0geSAtIHo7XFxuXFx0XFx0cmV0dXJuIHZlYzQoeCwgeSwgeiwgdyk7XFxuXFx0fVxcblxcblxcdC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEzNTAxMDgxL2VmZmljaWVudC1iaWN1YmljLWZpbHRlcmluZy1jb2RlLWluLWdsc2xcXG5cXHR2ZWM0IHRleHR1cmVCaWN1YmljKHNhbXBsZXIyRCB0LCB2ZWMyIHRleENvb3JkcywgdmVjMiB0ZXh0dXJlU2l6ZSkge1xcblxcdFxcdHZlYzIgaW52VGV4U2l6ZSA9IDEuMCAvIHRleHR1cmVTaXplO1xcblxcdFxcdHRleENvb3JkcyA9IHRleENvb3JkcyAqIHRleHR1cmVTaXplIC0gMC41O1xcblxcdFxcdHZlYzIgZnh5ID0gZnJhY3QodGV4Q29vcmRzKTtcXG5cXHRcXHR0ZXhDb29yZHMgLT0gZnh5O1xcblxcdFxcdHZlYzQgeGN1YmljID0gY3ViaWMoZnh5LngpO1xcblxcdFxcdHZlYzQgeWN1YmljID0gY3ViaWMoZnh5LnkpO1xcblxcdFxcdHZlYzQgYyA9IHRleENvb3Jkcy54eHl5ICsgdmVjMiAoLTAuNSwgMS41KS54eXh5O1xcblxcdFxcdHZlYzQgcyA9IHZlYzQoeGN1YmljLnh6ICsgeGN1YmljLnl3LCB5Y3ViaWMueHogKyB5Y3ViaWMueXcpO1xcblxcdFxcdHZlYzQgb2Zmc2V0ID0gYyArIHZlYzQgKHhjdWJpYy55dywgeWN1YmljLnl3KSAvIHM7XFxuXFx0XFx0b2Zmc2V0ICo9IGludlRleFNpemUueHh5eTtcXG5cXHRcXHR2ZWM0IHNhbXBsZTAgPSB0ZXh0dXJlMkQodCwgb2Zmc2V0Lnh6KTtcXG5cXHRcXHR2ZWM0IHNhbXBsZTEgPSB0ZXh0dXJlMkQodCwgb2Zmc2V0Lnl6KTtcXG5cXHRcXHR2ZWM0IHNhbXBsZTIgPSB0ZXh0dXJlMkQodCwgb2Zmc2V0Lnh3KTtcXG5cXHRcXHR2ZWM0IHNhbXBsZTMgPSB0ZXh0dXJlMkQodCwgb2Zmc2V0Lnl3KTtcXG5cXHRcXHRmbG9hdCBzeCA9IHMueCAvIChzLnggKyBzLnkpO1xcblxcdFxcdGZsb2F0IHN5ID0gcy56IC8gKHMueiArIHMudyk7XFxuXFx0XFx0cmV0dXJuIG1peChcXG5cXHRcXHRtaXgoc2FtcGxlMywgc2FtcGxlMiwgc3gpLCBtaXgoc2FtcGxlMSwgc2FtcGxlMCwgc3gpLCBzeSk7XFxuXFx0fVxcblxcbiNlbmRpZlxcblxcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcblxcdFNoYWRvd1xcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcbiNpZmRlZiBERVBUSFxcblxcblxcdHZhcnlpbmcgdmVjMiB2SGlnaFByZWNpc2lvblpXO1xcblxcdHVuaWZvcm0gZmxvYXQgY2FtZXJhTmVhcjtcXG5cXHR1bmlmb3JtIGZsb2F0IGNhbWVyYUZhcjtcXG5cXG4jZW5kaWZcXG5cXG4jaWZkZWYgVVNFX1NIQURPV01BUFxcblxcbiNpZiBOVU1fRElSX0xJR0hUX1NIQURPV1MgPiAwXFxuXFxuXFx0XFx0dW5pZm9ybSBzYW1wbGVyMkQgZGlyZWN0aW9uYWxTaGFkb3dNYXBbIE5VTV9ESVJfTElHSFRfU0hBRE9XUyBdO1xcblxcdFxcdHZhcnlpbmcgdmVjNCB2RGlyZWN0aW9uYWxTaGFkb3dDb29yZFsgTlVNX0RJUl9MSUdIVF9TSEFET1dTIF07XFxuXFxuXFx0XFx0c3RydWN0IERpcmVjdGlvbmFsTGlnaHRTaGFkb3cge1xcblxcdFxcdFxcdGZsb2F0IHNoYWRvd0JpYXM7XFxuXFx0XFx0XFx0ZmxvYXQgc2hhZG93Tm9ybWFsQmlhcztcXG5cXHRcXHRcXHRmbG9hdCBzaGFkb3dSYWRpdXM7XFxuXFx0XFx0XFx0dmVjMiBzaGFkb3dNYXBTaXplO1xcblxcdFxcdH07XFxuXFxuXFx0XFx0dW5pZm9ybSBEaXJlY3Rpb25hbExpZ2h0U2hhZG93IGRpcmVjdGlvbmFsTGlnaHRTaGFkb3dzWyBOVU1fRElSX0xJR0hUX1NIQURPV1MgXTtcXG5cXG5cXHQjZW5kaWZcXG5cXG5cXHQjZGVmaW5lIFNIQURPV19TQU1QTEVfQ09VTlQgNFxcblxcblxcdHZlYzIgcG9pc3NvbkRpc2tbIFNIQURPV19TQU1QTEVfQ09VTlQgXTtcXG5cXG5cXHR2b2lkIGluaXRQb2lzc29uRGlzayggZmxvYXQgc2VlZCApIHtcXG5cXG5cXHRcXHRmbG9hdCByID0gMC4xO1xcblxcdFxcdGZsb2F0IHJTdGVwID0gKDEuMCAtIHIpIC8gZmxvYXQoIFNIQURPV19TQU1QTEVfQ09VTlQgKTtcXG5cXG5cXHRcXHRmbG9hdCBhbmcgPSByYW5kb20oIGdsX0ZyYWdDb29yZC54eSAqIDAuMDEgKyBzaW4oIHRpbWUgKSApICogUEkyICogMS4wO1xcblxcdFxcdGZsb2F0IGFuZ1N0ZXAgPSAoICggUEkyICogMTEuMCApIC8gZmxvYXQoIFNIQURPV19TQU1QTEVfQ09VTlQgKSApO1xcblxcdFxcdFxcblxcdFxcdGZvciggaW50IGkgPSAwOyBpIDwgU0hBRE9XX1NBTVBMRV9DT1VOVDsgaSsrICkge1xcblxcblxcdFxcdFxcdHBvaXNzb25EaXNrWyBpIF0gPSB2ZWMyKFxcblxcdFxcdFxcdFxcdHNpbiggYW5nICksXFxuXFx0XFx0XFx0XFx0Y29zKCBhbmcgKVxcblxcdFxcdFxcdCkgKiBwb3coIHIsIDAuNzUgKTtcXG5cXG5cXHRcXHRcXHRyICs9IHJTdGVwO1xcblxcdFxcdFxcdGFuZyArPSBhbmdTdGVwO1xcblxcdFxcdH1cXG5cXHRcXHRcXG5cXHR9XFxuXFxuXFx0dmVjMiBjb21wYWlyU2hhZG93TWFwRGVwdGgoIHNhbXBsZXIyRCBzaGFkb3dNYXAsIHZlYzIgc2hhZG93TWFwVVYsIGZsb2F0IGRlcHRoICkge1xcblxcblxcdFxcdGlmKCBzaGFkb3dNYXBVVi54IDwgMC4wIHx8IHNoYWRvd01hcFVWLnggPiAxLjAgfHwgc2hhZG93TWFwVVYueSA8IDAuMCB8fCBzaGFkb3dNYXBVVi55ID4gMS4wICkge1xcblxcblxcdFxcdFxcdHJldHVybiB2ZWMyKCAxLjAsIDAuMCApO1xcblxcblxcdFxcdH1cXG5cXG5cXHRcXHRmbG9hdCBzaGFkb3dNYXBEZXB0aCA9IHVucGFja1JHQkFUb0RlcHRoKCB0ZXh0dXJlMkQoIHNoYWRvd01hcCwgc2hhZG93TWFwVVYgKSApO1xcblxcblxcdFxcdGlmKCAwLjAgPj0gc2hhZG93TWFwRGVwdGggfHwgc2hhZG93TWFwRGVwdGggPj0gMS4wICkge1xcblxcblxcdFxcdFxcdHJldHVybiB2ZWMyKCAxLjAsIDAuMCApO1xcblxcblxcdFxcdH1cXG5cXHRcXHRcXG5cXHRcXHRmbG9hdCBzaGFkb3cgPSBkZXB0aCA8PSBzaGFkb3dNYXBEZXB0aCA/IDEuMCA6IDAuMDtcXG5cXG5cXHRcXHRyZXR1cm4gdmVjMiggc2hhZG93LCBzaGFkb3dNYXBEZXB0aCApO1xcblxcdFxcdFxcblxcdH1cXG5cXG5cXHRmbG9hdCBzaGFkb3dNYXBQQ0YoIHNhbXBsZXIyRCBzaGFkb3dNYXAsIHZlYzQgc2hhZG93TWFwQ29vcmQsIHZlYzIgc2hhZG93U2l6ZSApIHtcXG5cXG5cXHRcXHRmbG9hdCBzaGFkb3cgPSAwLjA7XFxuXFx0XFx0XFxuXFx0XFx0Zm9yKCBpbnQgaSA9IDA7IGkgPCBTSEFET1dfU0FNUExFX0NPVU5UOyBpICsrICApIHtcXG5cXHRcXHRcXHRcXG5cXHRcXHRcXHR2ZWMyIG9mZnNldCA9IHBvaXNzb25EaXNrWyBpIF0gKiBzaGFkb3dTaXplOyBcXG5cXG5cXHRcXHRcXHRzaGFkb3cgKz0gY29tcGFpclNoYWRvd01hcERlcHRoKCBzaGFkb3dNYXAsIHNoYWRvd01hcENvb3JkLnh5ICsgb2Zmc2V0LCBzaGFkb3dNYXBDb29yZC56ICkueDtcXG5cXHRcXHRcXHRcXG5cXHRcXHR9XFxuXFxuXFx0XFx0c2hhZG93IC89IGZsb2F0KCBTSEFET1dfU0FNUExFX0NPVU5UICk7XFxuXFxuXFx0XFx0cmV0dXJuIHNoYWRvdztcXG5cXG5cXHR9XFxuXFxuXFx0ZmxvYXQgZ2V0U2hhZG93KCBzYW1wbGVyMkQgc2hhZG93TWFwLCB2ZWMyIHNoYWRvd01hcFNpemUsIGZsb2F0IGJpYXMsIHZlYzQgc2hhZG93TWFwQ29vcmQgKSB7XFxuXFx0XFx0XFxuXFx0XFx0c2hhZG93TWFwQ29vcmQueHl6IC89IHNoYWRvd01hcENvb3JkLnc7XFxuXFx0XFx0c2hhZG93TWFwQ29vcmQueiArPSBiaWFzIC0gMC4wMDAxO1xcblxcblxcdFxcdGluaXRQb2lzc29uRGlzayh0aW1lKTtcXG5cXG5cXHRcXHR2ZWMyIHNoYWRvd1NpemUgPSAxLjAgLyBzaGFkb3dNYXBTaXplO1xcblxcblxcdFxcdHJldHVybiBzaGFkb3dNYXBQQ0YoIHNoYWRvd01hcCwgc2hhZG93TWFwQ29vcmQsIHNoYWRvd1NpemUgKTtcXG5cXG5cXHR9XFxuXFxuI2VuZGlmXFxuXFxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0UkVcXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG52YXJ5aW5nIHZlYzMgdk5vcm1hbDtcXG52YXJ5aW5nIHZlYzMgdlZpZXdOb3JtYWw7XFxudmFyeWluZyB2ZWMzIHZWaWV3UG9zO1xcbnZhcnlpbmcgdmVjMyB2V29ybGRQb3M7XFxuXFxuZmxvYXQgZ2d4KCBmbG9hdCBkTkgsIGZsb2F0IHJvdWdobmVzcyApIHtcXG5cXHRcXG5cXHRmbG9hdCBhMiA9IHJvdWdobmVzcyAqIHJvdWdobmVzcztcXG5cXHRhMiA9IGEyICogYTI7XFxuXFx0ZmxvYXQgZE5IMiA9IGROSCAqIGROSDtcXG5cXG5cXHRpZiggZE5IMiA8PSAwLjAgKSByZXR1cm4gMC4wO1xcblxcblxcdHJldHVybiBhMiAvICggUEkgKiBwb3coIGROSDIgKiAoIGEyIC0gMS4wICkgKyAxLjAsIDIuMCkgKTtcXG5cXG59XFxuXFxudmVjMyBsYW1iZXJ0KCB2ZWMzIGRpZmZ1c2VDb2xvciApIHtcXG5cXG5cXHRyZXR1cm4gZGlmZnVzZUNvbG9yIC8gUEk7XFxuXFxufVxcblxcbmZsb2F0IGdTY2hsaWNrKCBmbG9hdCBkLCBmbG9hdCBrICkge1xcblxcblxcdGlmKCBkID09IDAuMCApIHJldHVybiAwLjA7XFxuXFxuXFx0cmV0dXJuIGQgLyAoIGQgKiAoIDEuMCAtIGsgKSArIGsgKTtcXG5cXHRcXG59XFxuXFxuZmxvYXQgZ1NtaXRoKCBmbG9hdCBkTlYsIGZsb2F0IGROTCwgZmxvYXQgcm91Z2huZXNzICkge1xcblxcblxcdGZsb2F0IGsgPSBjbGFtcCggcm91Z2huZXNzICogc3FydCggMi4wIC8gUEkgKSwgMC4wLCAxLjAgKTtcXG5cXG5cXHRyZXR1cm4gZ1NjaGxpY2soIGROViwgayApICogZ1NjaGxpY2soIGROTCwgayApO1xcblxcdFxcbn1cXG5cXG5mbG9hdCBmcmVzbmVsKCBmbG9hdCBkICkge1xcblxcdFxcblxcdGZsb2F0IGYwID0gMC4wNDtcXG5cXG5cXHRyZXR1cm4gZjAgKyAoIDEuMCAtIGYwICkgKiBwb3coIDEuMCAtIGQsIDUuMCApO1xcblxcbn1cXG5cXG52ZWMzIFJFKCBHZW9tZXRyeSBnZW8sIE1hdGVyaWFsIG1hdCwgTGlnaHQgbGlnaHQpIHtcXG5cXG5cXHR2ZWMzIGxpZ2h0RGlyID0gbm9ybWFsaXplKCBsaWdodC5kaXJlY3Rpb24gKTtcXG5cXHR2ZWMzIGhhbGZWZWMgPSBub3JtYWxpemUoIGdlby52aWV3RGlyICsgbGlnaHREaXIgKTtcXG5cXG5cXHRmbG9hdCBkTEggPSBjbGFtcCggZG90KCBsaWdodERpciwgaGFsZlZlYyApLCAwLjAsIDEuMCApO1xcblxcdGZsb2F0IGROSCA9IGNsYW1wKCBkb3QoIGdlby5ub3JtYWwsIGhhbGZWZWMgKSwgMC4wLCAxLjAgKTtcXG5cXHRmbG9hdCBkTlYgPSBjbGFtcCggZG90KCBnZW8ubm9ybWFsLCBnZW8udmlld0RpciApLCAwLjAsIDEuMCApO1xcblxcdGZsb2F0IGROTCA9IGNsYW1wKCBkb3QoIGdlby5ub3JtYWwsIGxpZ2h0RGlyKSwgMC4wLCAxLjAgKTtcXG5cXG5cXHR2ZWMzIGlycmFkaWFuY2UgPSBsaWdodC5jb2xvciAqIGROTDtcXG5cXG5cXHQvLyBkaWZmdXNlXFxuXFx0dmVjMyBkaWZmdXNlID0gbGFtYmVydCggbWF0LmRpZmZ1c2VDb2xvciApICogaXJyYWRpYW5jZTtcXG5cXG5cXHQvLyBzcGVjdWxhclxcblxcdGZsb2F0IEQgPSBnZ3goIGROSCwgbWF0LnJvdWdobmVzcyApO1xcblxcdGZsb2F0IEcgPSBnU21pdGgoIGROViwgZE5MLCBtYXQucm91Z2huZXNzICk7XFxuXFx0ZmxvYXQgRiA9IGZyZXNuZWwoIGRMSCApO1xcblxcdFxcblxcdHZlYzMgc3BlY3VsYXIgPSAoKCBEICogRyAqIEYgKSAvICggNC4wICogZE5MICogZE5WICsgMC4wMDAxICkgKiBtYXQuc3BlY3VsYXJDb2xvciApICogaXJyYWRpYW5jZTsgXFxuXFxuXFx0dmVjMyBjID0gdmVjMyggMC4wICk7XFxuXFx0YyArPSBkaWZmdXNlICogKCAxLjAgLSBGICkgKyBzcGVjdWxhcjtcXG5cXG5cXHRyZXR1cm4gYztcXG5cXG59XFxuXFxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0TWFpblxcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcbnZvaWQgbWFpbiggdm9pZCApIHtcXG5cXG5cXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRcXHRNYXRlcmlhbFxcblxcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcblxcdE1hdGVyaWFsIG1hdDtcXG5cXG5cXHQjaWZkZWYgVVNFX01BUFxcblxcblxcdFxcdHZlYzQgY29sb3IgPSBMaW5lYXJUb3NSR0IoIHRleHR1cmUyRCggbWFwLCB2VXYgKSApO1xcblxcdFxcdG1hdC5hbGJlZG8gPSBjb2xvci54eXo7XFxuXFx0XFx0bWF0Lm9wYWNpdHkgPSBjb2xvci53O1xcblxcblxcdCNlbHNlXFxuXFxuXFx0XFx0bWF0LmFsYmVkbyA9IGNvbG9yLnh5ejtcXG5cXHRcXHRtYXQub3BhY2l0eSA9IDEuMDtcXG5cXHRcXG5cXHQjZW5kaWZcXG5cXG5cXHQjaWZkZWYgVVNFX1JPVUdITkVTU19NQVBcXG5cXG5cXHRcXHRtYXQucm91Z2huZXNzID0gdGV4dHVyZTJEKCByb3VnaG5lc3NNYXAsIHZVdiApLnk7XFxuXFxuXFx0I2Vsc2VcXG5cXG5cXHRcXHRtYXQucm91Z2huZXNzID0gcm91Z2huZXNzO1xcblxcdFxcblxcdCNlbmRpZlxcblxcblxcdCNpZmRlZiBVU0VfTUVUQUxORVNTX01BUFxcblxcblxcdFxcdG1hdC5tZXRhbG5lc3MgPSB0ZXh0dXJlMkQoIG1ldGFsbmVzc01hcCwgdlV2ICkuejtcXG5cXG5cXHQjZWxzZVxcblxcblxcdFxcdG1hdC5tZXRhbG5lc3MgPSBtZXRhbG5lc3M7XFxuXFx0XFxuXFx0I2VuZGlmXFxuXFxuXFx0I2lmZGVmIFVTRV9BTFBIQV9NQVBcXG5cXG5cXHRcXHRtYXQub3BhY2l0eSA9IHRleHR1cmUyRCggYWxwaGFNYXAsIHZVdiApLng7XFxuXFxuXFx0I2Vsc2VcXG5cXG5cXHRcXHRtYXQub3BhY2l0eSAqPSBvcGFjaXR5O1xcblxcblxcdCNlbmRpZlxcblxcdFxcblxcdC8vIGlmKCBtYXQub3BhY2l0eSA8IDAuNSApIGRpc2NhcmQ7XFxuXFxuXFx0bWF0LmRpZmZ1c2VDb2xvciA9IG1peCggbWF0LmFsYmVkbywgdmVjMyggMC4wLCAwLjAsIDAuMCApLCBtYXQubWV0YWxuZXNzICk7XFxuXFx0bWF0LnNwZWN1bGFyQ29sb3IgPSBtaXgoIHZlYzMoIDEuMCwgMS4wLCAxLjAgKSwgbWF0LmFsYmVkbywgbWF0Lm1ldGFsbmVzcyApO1xcblxcblxcdC8vIG91dHB1dFxcblxcdHZlYzMgb3V0Q29sb3IgPSB2ZWMzKCAwLjAgKTtcXG5cXHRmbG9hdCBvdXRPcGFjaXR5ID0gbWF0Lm9wYWNpdHk7XFxuXFxuXFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0XFx0RGVwdGhcXG5cXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG5cXHQjaWZkZWYgREVQVEhcXG5cXG5cXHRcXHRmbG9hdCBmcmFnQ29vcmRaID0gMC41ICogdkhpZ2hQcmVjaXNpb25aVy54IC8gdkhpZ2hQcmVjaXNpb25aVy55ICsgMC41O1xcblxcdFxcdGdsX0ZyYWdDb2xvciA9IHBhY2tEZXB0aFRvUkdCQSggZnJhZ0Nvb3JkWiApO1xcblxcdFxcdHJldHVybjtcXG5cXHRcXG5cXHQjZW5kaWZcXG5cXG5cXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXHRcXHRHZW9tZXRyeVxcblxcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcblxcdGZsb2F0IGZhY2VEaXJlY3Rpb24gPSBnbF9Gcm9udEZhY2luZyA/IDEuMCA6IC0xLjA7XFxuXFxuXFx0R2VvbWV0cnkgZ2VvO1xcblxcdGdlby5wb3MgPSAtdlZpZXdQb3M7XFxuXFx0Z2VvLnBvc1dvcmxkID0gdldvcmxkUG9zO1xcblxcdGdlby52aWV3RGlyID0gbm9ybWFsaXplKCB2Vmlld1BvcyApO1xcblxcdGdlby52aWV3RGlyV29ybGQgPSBub3JtYWxpemUoIGdlby5wb3NXb3JsZCAtIGNhbWVyYVBvc2l0aW9uICk7XFxuXFx0Z2VvLm5vcm1hbCA9IG5vcm1hbGl6ZSggdk5vcm1hbCApICogZmFjZURpcmVjdGlvbjtcXG5cXG5cXHQjaWZkZWYgVVNFX05PUk1BTF9NQVBcXG5cXHRcXHRcXG5cXHRcXHR2ZWMzIHRhbmdlbnQgPSBub3JtYWxpemUoIHZUYW5nZW50ICk7XFxuXFx0XFx0dmVjMyBiaXRhbmdlbnQgPSBub3JtYWxpemUoIHZCaXRhbmdlbnQgKTtcXG5cXG5cXHRcXHQjaWZkZWYgRE9VQkxFX1NJREVEXFxuXFxuXFx0XFx0XFx0dGFuZ2VudCAqPSBmYWNlRGlyZWN0aW9uO1xcblxcdFxcdFxcdGJpdGFuZ2VudCAqPSBmYWNlRGlyZWN0aW9uO1xcblxcdFxcdFxcblxcdFxcdCNlbmRpZlxcblxcdFxcdFxcblxcdFxcdG1hdDMgdlRCTiA9IG1hdDMoIHRhbmdlbnQsIGJpdGFuZ2VudCwgZ2VvLm5vcm1hbCApO1xcblxcdFxcdFxcblxcdFxcdHZlYzMgbWFwTiA9IHRleHR1cmUyRCggbm9ybWFsTWFwLCB2VXYgKS54eXo7XFxuXFx0XFx0bWFwTiA9IG1hcE4gKiAyLjAgLSAxLjA7XFxuXFx0XFx0Z2VvLm5vcm1hbCA9IG5vcm1hbGl6ZSggdlRCTiAqIG1hcE4gKTtcXG5cXG5cXHQjZW5kaWZcXG5cXHRcXG5cXHRnZW8ubm9ybWFsV29ybGQgPSBub3JtYWxpemUoICggdmVjNCggZ2VvLm5vcm1hbCwgMC4wICkgKiB2aWV3TWF0cml4ICkueHl6ICk7XFxuXFxuXFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0XFx0TGlnaHRpbmdcXG5cXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXHRcXG5cXHRMaWdodCBsaWdodDtcXG5cXG5cXHQjaWYgTlVNX0RJUl9MSUdIVFMgPiAwXFxuXFxuXFx0XFx0I3ByYWdtYSB1bnJvbGxfbG9vcF9zdGFydFxcblxcdFxcdFxcdGZvciAoIGludCBpID0gMDsgaSA8IE5VTV9ESVJfTElHSFRTOyBpICsrICkge1xcblxcblxcdFxcdFxcdFxcdGxpZ2h0LmRpcmVjdGlvbiA9IGRpcmVjdGlvbmFsTGlnaHRzWyBpIF0uZGlyZWN0aW9uO1xcblxcdFxcdFxcdFxcdGxpZ2h0LmNvbG9yID0gZGlyZWN0aW9uYWxMaWdodHNbIGkgXS5jb2xvcjtcXG5cXG5cXHRcXHRcXHRcXHRmbG9hdCBzaGFkb3cgPSAxLjA7XFxuXFx0XFx0XFx0XFx0XFxuXFx0XFx0XFx0XFx0I2lmIGRlZmluZWQoIFVTRV9TSEFET1dNQVAgKSAmJiBOVU1fRElSX0xJR0hUX1NIQURPV1MgPiAwXFxuXFxuXFx0XFx0XFx0XFx0XFx0c2hhZG93ID0gZ2V0U2hhZG93KCBkaXJlY3Rpb25hbFNoYWRvd01hcFsgaSBdLCBkaXJlY3Rpb25hbExpZ2h0U2hhZG93c1sgaSBdLnNoYWRvd01hcFNpemUsIGRpcmVjdGlvbmFsTGlnaHRTaGFkb3dzWyBpIF0uc2hhZG93QmlhcywgdkRpcmVjdGlvbmFsU2hhZG93Q29vcmRbIGkgXSApO1xcblxcblxcdFxcdFxcdFxcdCNlbmRpZlxcblxcblxcdFxcdFxcdFxcdG91dENvbG9yICs9IFJFKCBnZW8sIG1hdCwgbGlnaHQgKSAqIHNoYWRvdztcXG5cXHRcXHRcXHRcXHRcXG5cXHRcXHRcXHR9XFxuXFx0XFx0I3ByYWdtYSB1bnJvbGxfbG9vcF9lbmRcXG5cXG5cXHQjZW5kaWZcXG5cXG5cXHQjaWYgTlVNX1BPSU5UX0xJR0hUUyA+IDBcXG5cXG5cXHRcXHRQb2ludExpZ2h0IHBMaWdodDtcXG5cXHRcXHR2ZWMzIHY7XFxuXFx0XFx0ZmxvYXQgZDtcXG5cXHRcXHRmbG9hdCBhdHRlbnVhdGlvbjtcXG5cXHRcXHQjcHJhZ21hIHVucm9sbF9sb29wX3N0YXJ0XFxuXFxuXFx0XFx0XFx0Zm9yICggaW50IGkgPSAwOyBpIDwgTlVNX1BPSU5UX0xJR0hUUzsgaSArKyApIHtcXG5cXG5cXHRcXHRcXHRcXHRwTGlnaHQgPSBwb2ludExpZ2h0c1sgaSBdO1xcblxcblxcdFxcdFxcdFxcdHYgPSBwTGlnaHQucG9zaXRpb24gLSBnZW8ucG9zO1xcblxcdFxcdFxcdFxcdGQgPSBsZW5ndGgoIHYgKTtcXG5cXHRcXHRcXHRcXHRsaWdodC5kaXJlY3Rpb24gPSBub3JtYWxpemUoIHYgKTtcXG5cXHRcXHRcXG5cXHRcXHRcXHRcXHRsaWdodC5jb2xvciA9IHBMaWdodC5jb2xvcjtcXG5cXG5cXHRcXHRcXHRcXHRpZiggcExpZ2h0LmRpc3RhbmNlID4gMC4wICYmIHBMaWdodC5kZWNheSA+IDAuMCApIHtcXG5cXG5cXHRcXHRcXHRcXHRcXHRhdHRlbnVhdGlvbiA9IHBvdyggY2xhbXAoIC1kIC8gcExpZ2h0LmRpc3RhbmNlICsgMS4wLCAwLjAsIDEuMCApLCBwTGlnaHQuZGVjYXkgKTtcXG5cXHRcXHRcXHRcXHRcXHRsaWdodC5jb2xvciAqPSBhdHRlbnVhdGlvbjtcXG5cXG5cXHRcXHRcXHRcXHR9XFxuXFxuXFx0XFx0XFx0XFx0b3V0Q29sb3IgKz0gUkUoIGdlbywgbWF0LCBsaWdodCApO1xcblxcdFxcdFxcdFxcdFxcblxcdFxcdFxcdH1cXG5cXHRcXHRcXHRcXG5cXHRcXHQjcHJhZ21hIHVucm9sbF9sb29wX2VuZFxcblxcblxcdCNlbmRpZlxcblxcblxcdCNpZiBkZWZpbmVkKCBVU0VfRU5WX01BUCApIHx8IGRlZmluZWQoIElTX1JFRkxFQ1RJT05QTEFORSApXFxuXFxuXFx0XFx0ZmxvYXQgZE5WID0gY2xhbXAoIGRvdCggZ2VvLm5vcm1hbCwgZ2VvLnZpZXdEaXIgKSwgMC4wLCAxLjAgKTtcXG5cXHRcXHRmbG9hdCBFRiA9IGZyZXNuZWwoIGROViApO1xcblxcblxcdCNlbmRpZlxcblxcblxcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcblxcdFxcdEVudmlyb25tZW50IExpZ2h0aW5nXFxuXFx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxuXFx0I2lmZGVmIFVTRV9FTlZfTUFQXFxuXFxuXFx0XFx0dmVjMyByZWZEaXIgPSByZWZsZWN0KCBnZW8udmlld0RpcldvcmxkLCBnZW8ubm9ybWFsV29ybGQgKTtcXG5cXHRcXHRyZWZEaXIueCAqPSAtMS4wO1xcblxcdFxcblxcdFxcdHZlYzQgZW52TWFwQ29sb3IgPSB0ZXh0dXJlQ3ViZVVWKCBlbnZNYXAsIGdlby5ub3JtYWxXb3JsZCwgMS4wICkgKiBpYmxJbnRlbnNpdHkgKiBlbnZNYXBJbnRlbnNpdHk7XFxuXFx0XFx0b3V0Q29sb3IgKz0gbWF0LmRpZmZ1c2VDb2xvciAqIGVudk1hcENvbG9yLnh5eiAqICggMS4wIC0gbWF0Lm1ldGFsbmVzcyApO1xcblxcblxcdCNlbmRpZlxcblxcblxcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcblxcdFxcdFJlZmxlY3Rpb25cXG5cXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXHRcXG5cXHQjaWZkZWYgSVNfUkVGTEVDVElPTlBMQU5FXFxuXFx0XFxuXFx0XFx0dmVjMiByZWZVViA9IGdsX0ZyYWdDb29yZC54eSAvIHJlbmRlclJlc29sdXRpb247XFxuXFxuXFx0XFx0cmVmVVYueCArPSBnZW8ubm9ybWFsLnggKiAwLjU7XFxuXFxuXFx0XFx0ZmxvYXQgbCA9IChtYXQucm91Z2huZXNzICkgKiAxLjYgKiBSRUZfTUlQTUFQX0xFVkVMO1xcblxcblxcdFxcdGZsb2F0IG9mZnNldDEgPSBmbG9vciggbCApO1xcblxcdFxcdGZsb2F0IG9mZnNldDIgPSBvZmZzZXQxICsgMS4wO1xcblxcdFxcdGZsb2F0IGJsZW5kID0gZnJhY3QoIGwgKTtcXG5cXHRcXHRcXG5cXHRcXHR2ZWMyIHJ1djEgPSBnZXRSZWZNaXBtYXBVViggcmVmVVYsIG9mZnNldDEgKTtcXG5cXHRcXHR2ZWMyIHJ1djIgPSBnZXRSZWZNaXBtYXBVViggcmVmVVYsIG9mZnNldDIgKTtcXG5cXG5cXHRcXHR2ZWMzIHJlZjEgPSB0ZXh0dXJlQmljdWJpYyggcmVmbGVjdGlvblRleCwgcnV2MSwgbWlwTWFwUmVzb2x1dGlvbiApLnh5ejtcXG5cXHRcXHR2ZWMzIHJlZjIgPSB0ZXh0dXJlQmljdWJpYyggcmVmbGVjdGlvblRleCwgcnV2MiwgbWlwTWFwUmVzb2x1dGlvbiApLnh5ejtcXG5cXG5cXHRcXHR2ZWMzIHJlZiA9IG1hdC5zcGVjdWxhckNvbG9yICogbWl4KCByZWYxLCByZWYyLCBibGVuZCApO1xcblxcblxcdFxcdG91dENvbG9yID0gbWl4KFxcblxcdFxcdFxcdG91dENvbG9yICsgcmVmICogbWF0Lm1ldGFsbmVzcyxcXG5cXHRcXHRcXHRyZWYsXFxuXFx0XFx0XFx0RUZcXG5cXHRcXHQpO1xcblxcblxcdCNlbGlmIGRlZmluZWQoIFVTRV9FTlZfTUFQIClcXG5cXHRcXG5cXHRcXHR2ZWMzIGVudiA9IG1hdC5zcGVjdWxhckNvbG9yICogdGV4dHVyZUN1YmVVViggZW52TWFwLCByZWZEaXIsIG1hdC5yb3VnaG5lc3MgKS54eXogKiBlbnZNYXBJbnRlbnNpdHk7XFxuXFx0XFxuXFx0XFx0b3V0Q29sb3IgPSBtaXgoXFxuXFx0XFx0XFx0b3V0Q29sb3IgKyBlbnYgKiBtYXQubWV0YWxuZXNzLFxcblxcdFxcdFxcdGVudixcXG5cXHRcXHRcXHRFRlxcblxcdFxcdCk7XFxuXFx0XFxuXFx0I2VuZGlmXFxuXFxuXFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0XFx0RW1pc3Npb25cXG5cXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG5cXHQjaWZkZWYgVVNFX0VNSVNTSU9OX01BUFxcblxcblxcdFxcdG91dENvbG9yICs9IExpbmVhclRvc1JHQiggdGV4dHVyZTJEKCBlbWlzc2lvbk1hcCwgdlV2ICkgKS54eXo7XFxuXFx0XFxuXFx0I2Vsc2VcXG5cXG5cXHRcXHRvdXRDb2xvciArPSBlbWlzc2lvbjtcXG5cXG5cXHQjZW5kaWZcXG5cXG5cXHRnbF9GcmFnQ29sb3IgPSB2ZWM0KCBvdXRDb2xvciwgb3V0T3BhY2l0eSApO1xcblxcbn1cIjsiLCJleHBvcnQgZGVmYXVsdCBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzQgdGFuZ2VudDtcXG5cXG52YXJ5aW5nIHZlYzIgdlV2O1xcbnZhcnlpbmcgdmVjMyB2Tm9ybWFsO1xcbnZhcnlpbmcgdmVjMyB2Vmlld05vcm1hbDtcXG52YXJ5aW5nIHZlYzMgdlRhbmdlbnQ7XFxudmFyeWluZyB2ZWMzIHZCaXRhbmdlbnQ7XFxudmFyeWluZyB2ZWMzIHZWaWV3UG9zO1xcbnZhcnlpbmcgdmVjMyB2V29ybGRQb3M7XFxudmFyeWluZyB2ZWMyIHZIaWdoUHJlY2lzaW9uWlc7XFxuXFxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0U2hhZG93TWFwXFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFxuI2luY2x1ZGUgPHNoYWRvd21hcF9wYXJzX3ZlcnRleD5cXG5cXG52b2lkIG1haW4oIHZvaWQgKSB7XFxuXFxuXFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0XFx0UG9zaXRpb25cXG5cXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cXG5cXG5cXHR2ZWMzIHBvcyA9IHBvc2l0aW9uO1xcblxcdHZlYzQgd29ybGRQb3MgPSBtb2RlbE1hdHJpeCAqIHZlYzQoIHBvcywgMS4wICk7XFxuXFx0dmVjNCBtdlBvc2l0aW9uID0gdmlld01hdHJpeCAqIHdvcmxkUG9zO1xcblxcdFxcblxcdGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxuXFxuXFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0XFx0Tm9ybWFsIC8gVGFuZ2VudFxcblxcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcblxcdHZlYzMgdHJhbnNmb3JtZWROb3JtYWwgPSBub3JtYWxNYXRyaXggKiBub3JtYWw7XFxuXFx0dmVjNCBmbGlwZWRUYW5nZW50ID0gdGFuZ2VudDtcXG5cXHRmbGlwZWRUYW5nZW50LncgKj0gLTEuMDtcXG5cXG5cXHQjaWZkZWYgRkxJUF9TSURFRFxcblxcdFxcdHRyYW5zZm9ybWVkTm9ybWFsICo9IC0xLjA7XFxuXFx0XFx0ZmxpcGVkVGFuZ2VudCAqPSAtMS4wO1xcblxcdCNlbmRpZlxcblxcdFxcblxcdHZlYzMgbm9ybWFsID0gbm9ybWFsaXplKCB0cmFuc2Zvcm1lZE5vcm1hbCApO1xcblxcdHZlYzMgdGFuZ2VudCA9IG5vcm1hbGl6ZSggKCBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KCBmbGlwZWRUYW5nZW50Lnh5eiwgMC4wICkgKS54eXogKTtcXG5cXHR2ZWMzIGJpVGFuZ2VudCA9IG5vcm1hbGl6ZSggY3Jvc3MoIG5vcm1hbCwgdGFuZ2VudCApICogZmxpcGVkVGFuZ2VudC53ICk7XFxuXFxuXFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0XFx0U2hhZG93XFxuXFx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXFxuXFx0XFxuXFx0dmVjNCBzaGFkb3dXb3JsZFBvcztcXG5cXHRcXG5cXHQjaWYgZGVmaW5lZCggVVNFX1NIQURPV01BUCApICYmIE5VTV9ESVJfTElHSFRfU0hBRE9XUyA+IDBcXG5cXHRcXG5cXHRcXHQjcHJhZ21hIHVucm9sbF9sb29wX3N0YXJ0XFxuXFx0XFx0Zm9yICggaW50IGkgPSAwOyBpIDwgTlVNX0RJUl9MSUdIVF9TSEFET1dTOyBpICsrICkge1xcblxcdFxcdFxcdFxcblxcdFxcdFxcdHNoYWRvd1dvcmxkUG9zID0gd29ybGRQb3MgKyB2ZWM0KCB2ZWM0KCB0cmFuc2Zvcm1lZE5vcm1hbCwgMC4wICkgKiBtb2RlbE1hdHJpeCApICogZGlyZWN0aW9uYWxMaWdodFNoYWRvd3NbIGkgXS5zaGFkb3dOb3JtYWxCaWFzO1xcblxcdFxcdFxcdHZEaXJlY3Rpb25hbFNoYWRvd0Nvb3JkWyBpIF0gPSBkaXJlY3Rpb25hbFNoYWRvd01hdHJpeFsgaSBdICogc2hhZG93V29ybGRQb3M7XFxuXFx0XFx0XFx0XFxuXFx0XFx0fVxcblxcdFxcdCNwcmFnbWEgdW5yb2xsX2xvb3BfZW5kXFxuXFx0XFx0XFxuXFx0I2VuZGlmXFxuXFxuXFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuXFx0XFx0VmFyeWluZ1xcblxcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xcblxcdFxcblxcdHZVdiA9IHV2O1xcblxcdHZOb3JtYWwgPSBub3JtYWw7XFxuXFx0dlRhbmdlbnQgPSB0YW5nZW50O1xcblxcdHZCaXRhbmdlbnQgPSBiaVRhbmdlbnQ7XFxuXFx0dlZpZXdQb3MgPSAtbXZQb3NpdGlvbi54eXo7XFxuXFx0dldvcmxkUG9zID0gd29ybGRQb3MueHl6O1xcblxcdHZIaWdoUHJlY2lzaW9uWlcgPSBnbF9Qb3NpdGlvbi56dztcXG5cXHRcXG59XCI7IiwiZXhwb3J0IGRlZmF1bHQgXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleDtcXG52YXJ5aW5nIHZlYzIgdlV2O1xcblxcbmZsb2F0IGNsaXAoIHZlYzIgdXYgKSB7XFxuXFx0dmVjMiBjID0gc3RlcCggYWJzKHV2IC0gMC41KSwgdmVjMiggMC41ICkgKTtcXG5cXHRyZXR1cm4gYy54ICogYy55O1xcbn1cXG5cXG52b2lkIG1haW4oIHZvaWQgKSB7XFxuXFxuXFx0dmVjNCBjb2wgPSB0ZXh0dXJlMkQoIHRleCwgdlV2ICk7XFxuXFx0Z2xfRnJhZ0NvbG9yID0gY29sO1xcblxcbn1cIjsiLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tICd0aHJlZSc7XHJcbmltcG9ydCAqIGFzIE9SRSBmcm9tICdvcmUtdGhyZWUnO1xyXG5cclxuaW1wb3J0IHBvd2VyVmVydCBmcm9tICcuL3NoYWRlcnMvcG93ZXIudnMnO1xyXG5pbXBvcnQgcG93ZXJGcmFnIGZyb20gJy4vc2hhZGVycy9wb3dlci5mcyc7XHJcblxyXG5leHBvcnQgdHlwZSBQb3dlck1lc2hNYXRlcmlhbFR5cGUgPSAnY29sb3InIHwgJ2RlcHRoJyB8ICdjb2MnXHJcbmV4cG9ydCBjbGFzcyBQb3dlck1lc2ggZXh0ZW5kcyBUSFJFRS5NZXNoPFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBUSFJFRS5TaGFkZXJNYXRlcmlhbD4ge1xyXG5cclxuXHRwcm90ZWN0ZWQgY29tbW9uVW5pZm9ybXM6IE9SRS5Vbmlmb3JtcztcclxuXHJcblx0Ly8gZW52TWFwXHJcblx0cHJvdGVjdGVkIGVudk1hcFJlc29sdXRpb246IG51bWJlcjtcclxuXHRwcm90ZWN0ZWQgZW52TWFwUmVuZGVyVGFyZ2V0OiBUSFJFRS5XZWJHTEN1YmVSZW5kZXJUYXJnZXQ7XHJcblx0cHJvdGVjdGVkIGVudk1hcENhbWVyYTogVEhSRUUuQ3ViZUNhbWVyYTtcclxuXHRwcm90ZWN0ZWQgZW52TWFwVXBkYXRlOiBib29sZWFuO1xyXG5cdHByb3RlY3RlZCBlbnZNYXBTcmM6IFRIUkVFLkN1YmVUZXh0dXJlIHwgVEhSRUUuVGV4dHVyZSB8IG51bGw7XHJcblxyXG5cdGNvbnN0cnVjdG9yKCBnZW9tZXRyeTogVEhSRUUuQnVmZmVyR2VvbWV0cnksIG1hdGVyaWFsT3B0aW9uPzogVEhSRUUuU2hhZGVyTWF0ZXJpYWxQYXJhbWV0ZXJzLCBvdmVycmlkZT86IGJvb2xlYW4gKTtcclxuXHJcblx0Y29uc3RydWN0b3IoIG1lc2g6IFRIUkVFLk1lc2gsIG1hdGVyaWFsT3B0aW9uPzogVEhSRUUuU2hhZGVyTWF0ZXJpYWxQYXJhbWV0ZXJzLCBvdmVycmlkZT86IGJvb2xlYW4gKTtcclxuXHJcblx0Y29uc3RydWN0b3IoIGdlb01lc2g6IFRIUkVFLkJ1ZmZlckdlb21ldHJ5IHwgVEhSRUUuTWVzaCwgbWF0ZXJpYWxPcHRpb24/OiBUSFJFRS5TaGFkZXJNYXRlcmlhbFBhcmFtZXRlcnMsIG92ZXJyaWRlPzogYm9vbGVhbiApIHtcclxuXHJcblx0XHRtYXRlcmlhbE9wdGlvbiA9IG1hdGVyaWFsT3B0aW9uIHx8IHt9O1xyXG5cclxuXHRcdGxldCB1bmkgPSBPUkUuVW5pZm9ybXNMaWIubWVyZ2VVbmlmb3JtcyggbWF0ZXJpYWxPcHRpb24udW5pZm9ybXMgfHwge30sIHtcclxuXHRcdFx0ZW52TWFwOiB7XHJcblx0XHRcdFx0dmFsdWU6IG51bGxcclxuXHRcdFx0fSxcclxuXHRcdFx0ZW52TWFwSW50ZW5zaXR5OiB7XHJcblx0XHRcdFx0dmFsdWU6IG51bGxcclxuXHRcdFx0fSxcclxuXHRcdFx0aWJsSW50ZW5zaXR5OiB7XHJcblx0XHRcdFx0dmFsdWU6IG51bGxcclxuXHRcdFx0fSxcclxuXHRcdFx0bWF4TG9kTGV2ZWw6IHtcclxuXHRcdFx0XHR2YWx1ZTogMFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRzaGFkb3dMaWdodE1vZGVsVmlld01hdHJpeDoge1xyXG5cdFx0XHRcdHZhbHVlOiBuZXcgVEhSRUUuTWF0cml4NCgpXHJcblx0XHRcdH0sXHJcblx0XHRcdHNoYWRvd0xpZ2h0UHJvamVjdGlvbk1hdHJpeDoge1xyXG5cdFx0XHRcdHZhbHVlOiBuZXcgVEhSRUUuTWF0cml4NCgpXHJcblx0XHRcdH0sXHJcblx0XHRcdHNoYWRvd0xpZ2h0RGlyZWN0aW9uOiB7XHJcblx0XHRcdFx0dmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IzKClcclxuXHRcdFx0fSxcclxuXHRcdFx0c2hhZG93TGlnaHRDYW1lcmFDbGlwOiB7XHJcblx0XHRcdFx0dmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKClcclxuXHRcdFx0fSxcclxuXHRcdFx0c2hhZG93TWFwOiB7XHJcblx0XHRcdFx0dmFsdWU6IG51bGxcclxuXHRcdFx0fSxcclxuXHRcdFx0c2hhZG93TWFwU2l6ZToge1xyXG5cdFx0XHRcdHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMigpXHJcblx0XHRcdH0sXHJcblx0XHRcdHNoYWRvd01hcFJlc29sdXRpb246IHtcclxuXHRcdFx0XHR2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIoKVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRzaGFkb3dMaWdodFNpemU6IHtcclxuXHRcdFx0XHR2YWx1ZTogMS4wXHJcblx0XHRcdH0sXHJcblx0XHRcdGNhbWVyYU5lYXI6IHtcclxuXHRcdFx0XHR2YWx1ZTogMC4wMVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRjYW1lcmFGYXI6IHtcclxuXHRcdFx0XHR2YWx1ZTogMTAwMC4wXHJcblx0XHRcdH0sXHJcblx0XHRcdC8vIGRlZmF1bHQgcHJvcHNcclxuXHRcdFx0Y29sb3I6IHtcclxuXHRcdFx0XHR2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCAxLjAsIDEuMCwgMS4wIClcclxuXHRcdFx0fSxcclxuXHRcdFx0bWV0YWxuZXNzOiB7XHJcblx0XHRcdFx0dmFsdWU6IDBcclxuXHRcdFx0fSxcclxuXHRcdFx0cm91Z2huZXNzOiB7XHJcblx0XHRcdFx0dmFsdWU6IDAuNVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRvcGFjaXR5OiB7XHJcblx0XHRcdFx0dmFsdWU6IDFcclxuXHRcdFx0fSxcclxuXHRcdFx0ZW1pc3Npb246IHtcclxuXHRcdFx0XHR2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCAwLjAsIDAuMCwgMC4wIClcclxuXHRcdFx0fVxyXG5cdFx0fSApO1xyXG5cclxuXHRcdHVuaSA9IE9SRS5Vbmlmb3Jtc0xpYi5tZXJnZVVuaWZvcm1zKCB1bmksIFRIUkVFLlVuaWZvcm1zVXRpbHMuY2xvbmUoIFRIUkVFLlVuaWZvcm1zTGliLmxpZ2h0cyApICk7XHJcblxyXG5cdFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0XHRcdEdlb21ldHJ5XHJcblx0XHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcblx0XHRsZXQgZ2VvOiBUSFJFRS5CdWZmZXJHZW9tZXRyeTtcclxuXHJcblx0XHRpZiAoICdpc0J1ZmZlckdlb21ldHJ5JyBpbiBnZW9NZXNoICkge1xyXG5cclxuXHRcdFx0Z2VvID0gZ2VvTWVzaDtcclxuXHJcblx0XHR9IGVsc2UgaWYgKCAnaXNNZXNoJyBpbiBnZW9NZXNoICkge1xyXG5cclxuXHRcdFx0Z2VvID0gZ2VvTWVzaC5nZW9tZXRyeTtcclxuXHJcblx0XHRcdGxldCBtYXQgPSAoIGdlb01lc2gubWF0ZXJpYWwgYXMgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwgKTtcclxuXHJcblx0XHRcdGlmICggbWF0LmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwgKSB7XHJcblxyXG5cdFx0XHRcdGlmICggbWF0Lm1hcCApIHtcclxuXHJcblx0XHRcdFx0XHR1bmkubWFwID0ge1xyXG5cdFx0XHRcdFx0XHR2YWx1ZTogbWF0Lm1hcFxyXG5cdFx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0fSBlbHNlIGlmICggbWF0LmNvbG9yICkge1xyXG5cclxuXHRcdFx0XHRcdHVuaS5jb2xvci52YWx1ZS5jb3B5KCBtYXQuY29sb3IgKTtcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoIG1hdC5yb3VnaG5lc3NNYXAgKSB7XHJcblxyXG5cdFx0XHRcdFx0dW5pLnJvdWdobmVzc01hcCA9IHtcclxuXHRcdFx0XHRcdFx0dmFsdWU6IG1hdC5yb3VnaG5lc3NNYXBcclxuXHRcdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdFx0dW5pLnJvdWdobmVzcy52YWx1ZSA9IG1hdC5yb3VnaG5lc3M7XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKCBtYXQuYWxwaGFNYXAgKSB7XHJcblxyXG5cdFx0XHRcdFx0dW5pLmFscGhhTWFwID0ge1xyXG5cdFx0XHRcdFx0XHR2YWx1ZTogbWF0LmFscGhhTWFwXHJcblx0XHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHRcdHVuaS5vcGFjaXR5LnZhbHVlID0gbWF0Lm9wYWNpdHk7XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKCBtYXQubWV0YWxuZXNzTWFwICkge1xyXG5cclxuXHRcdFx0XHRcdHVuaS5tZXRhbG5lc3NNYXAgPSB7XHJcblx0XHRcdFx0XHRcdHZhbHVlOiBtYXQubWV0YWxuZXNzTWFwXHJcblx0XHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHRcdHVuaS5tZXRhbG5lc3MudmFsdWUgPSBtYXQubWV0YWxuZXNzO1xyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmICggbWF0Lm5vcm1hbE1hcCApIHtcclxuXHJcblx0XHRcdFx0XHR1bmkubm9ybWFsTWFwID0ge1xyXG5cdFx0XHRcdFx0XHR2YWx1ZTogbWF0Lm5vcm1hbE1hcFxyXG5cdFx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoIG1hdC5lbWlzc2l2ZU1hcCApIHtcclxuXHJcblx0XHRcdFx0XHR1bmkuZW1pc3Npb25NYXAgPSB7XHJcblx0XHRcdFx0XHRcdHZhbHVlOiBtYXQuZW1pc3NpdmVNYXBcclxuXHRcdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdFx0dW5pLmVtaXNzaW9uLnZhbHVlLmNvcHkoIG1hdC5lbWlzc2l2ZSApO1xyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdGdlbyA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvLyB0YW5nZW50c1xyXG5cclxuXHRcdGlmICggISBnZW8uZ2V0QXR0cmlidXRlKCAndGFuZ2VudCcgKSApIHtcclxuXHJcblx0XHRcdGlmIChcclxuXHRcdFx0XHRnZW8uZ2V0SW5kZXgoKSAmJlxyXG5cdFx0XHRcdGdlby5nZXRBdHRyaWJ1dGUoICdwb3NpdGlvbicgKSAmJlxyXG5cdFx0XHRcdGdlby5nZXRBdHRyaWJ1dGUoICdub3JtYWwnICkgJiZcclxuXHRcdFx0XHRnZW8uZ2V0QXR0cmlidXRlKCAndXYnIClcclxuXHRcdFx0KSB7XHJcblxyXG5cdFx0XHRcdGdlby5jb21wdXRlVGFuZ2VudHMoKTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblxyXG5cdFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0XHRcdE1hdGVyaWFsXHJcblx0XHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcblx0XHRtYXRlcmlhbE9wdGlvbi51bmlmb3JtcyA9IHVuaTtcclxuXHJcblx0XHRsZXQgbWF0ID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKCB7XHJcblx0XHRcdHZlcnRleFNoYWRlcjogcG93ZXJWZXJ0LFxyXG5cdFx0XHRmcmFnbWVudFNoYWRlcjogcG93ZXJGcmFnLFxyXG5cdFx0XHRsaWdodHM6IHRydWUsXHJcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlLFxyXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlLFxyXG5cdFx0XHRleHRlbnNpb25zOiB7XHJcblx0XHRcdFx0ZGVyaXZhdGl2ZXM6IHRydWUsXHJcblx0XHRcdH0sXHJcblx0XHRcdGRlZmluZXM6IHtcclxuXHRcdFx0fSxcclxuXHRcdFx0Li4ubWF0ZXJpYWxPcHRpb25cclxuXHRcdH0gKTtcclxuXHJcblx0XHRpZiAoIHVuaS5tYXAgKSB7XHJcblxyXG5cdFx0XHRtYXQuZGVmaW5lcy5VU0VfTUFQID0gJyc7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggdW5pLnJvdWdobmVzc01hcCApIHtcclxuXHJcblx0XHRcdG1hdC5kZWZpbmVzLlVTRV9ST1VHSE5FU1NfTUFQID0gJyc7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggdW5pLm1ldGFsbmVzc01hcCApIHtcclxuXHJcblx0XHRcdG1hdC5kZWZpbmVzLlVTRV9NRVRBTE5FU1NfTUFQID0gJyc7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggdW5pLmFscGhhTWFwICkge1xyXG5cclxuXHRcdFx0bWF0LmRlZmluZXMuVVNFX0FMUEhBX01BUCA9ICcnO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIHVuaS5ub3JtYWxNYXAgKSB7XHJcblxyXG5cdFx0XHRtYXQuZGVmaW5lcy5VU0VfTk9STUFMX01BUCA9ICcnO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIHVuaS5lbWlzc2lvbk1hcCApIHtcclxuXHJcblx0XHRcdG1hdC5kZWZpbmVzLlVTRV9FTUlTU0lPTl9NQVAgPSAnJztcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0c3VwZXIoIGdlbywgbWF0ICk7XHJcblxyXG5cdFx0dGhpcy5uYW1lID0gZ2VvTWVzaC5uYW1lO1xyXG5cclxuXHRcdHRoaXMudXNlckRhdGEuY29sb3JNYXQgPSB0aGlzLm1hdGVyaWFsO1xyXG5cclxuXHRcdHRoaXMuY3VzdG9tRGVwdGhNYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCgge1xyXG5cdFx0XHR2ZXJ0ZXhTaGFkZXI6IHBvd2VyVmVydCxcclxuXHRcdFx0ZnJhZ21lbnRTaGFkZXI6IHBvd2VyRnJhZyxcclxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZSxcclxuXHRcdFx0bGlnaHRzOiB0cnVlLFxyXG5cdFx0XHRleHRlbnNpb25zOiB7XHJcblx0XHRcdFx0ZGVyaXZhdGl2ZXM6IHRydWVcclxuXHRcdFx0fSxcclxuXHRcdFx0Li4ubWF0ZXJpYWxPcHRpb24sXHJcblx0XHRcdGRlZmluZXM6IHtcclxuXHRcdFx0XHQuLi5tYXQuZGVmaW5lcyxcclxuXHRcdFx0XHQnREVQVEgnOiBcIlwiLFxyXG5cdFx0XHR9LFxyXG5cdFx0fSApO1xyXG5cclxuXHRcdHRoaXMuY29tbW9uVW5pZm9ybXMgPSB1bmk7XHJcblxyXG5cdFx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0XHRcdFRyYW5zZm9ybVxyXG5cdFx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG5cdFx0aWYgKCAnaXNNZXNoJyBpbiBnZW9NZXNoICYmIG92ZXJyaWRlICkge1xyXG5cclxuXHRcdFx0Z2VvTWVzaC5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcblxyXG5cdFx0XHRsZXQgY2hpbGRBcnJheSA9IGdlb01lc2guY2hpbGRyZW4uc2xpY2UoKTtcclxuXHJcblx0XHRcdGNoaWxkQXJyYXkuZm9yRWFjaCggY2hpbGQgPT4ge1xyXG5cclxuXHRcdFx0XHR0aGlzLmFkZCggY2hpbGQgKTtcclxuXHJcblx0XHRcdH0gKTtcclxuXHJcblx0XHRcdHRoaXMucG9zaXRpb24uY29weSggZ2VvTWVzaC5wb3NpdGlvbiApO1xyXG5cdFx0XHR0aGlzLnJvdGF0aW9uLmNvcHkoIGdlb01lc2gucm90YXRpb24gKTtcclxuXHRcdFx0dGhpcy5zY2FsZS5jb3B5KCBnZW9NZXNoLnNjYWxlICk7XHJcblxyXG5cdFx0XHRsZXQgcGFyZW50ID0gZ2VvTWVzaC5wYXJlbnQ7XHJcblxyXG5cdFx0XHRpZiAoIHBhcmVudCApIHtcclxuXHJcblx0XHRcdFx0cGFyZW50LmFkZCggdGhpcyApO1xyXG5cclxuXHRcdFx0XHRwYXJlbnQucmVtb3ZlKCBnZW9NZXNoICk7XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0XHRFbnZNYXBcclxuXHRcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRcdHRoaXMuZW52TWFwU3JjID0gbnVsbDtcclxuXHRcdHRoaXMuZW52TWFwVXBkYXRlID0gZmFsc2U7XHJcblx0XHR0aGlzLmVudk1hcFJlc29sdXRpb24gPSAyNTY7XHJcblxyXG5cdFx0dGhpcy5lbnZNYXBSZW5kZXJUYXJnZXQgPSBuZXcgVEhSRUUuV2ViR0xDdWJlUmVuZGVyVGFyZ2V0KCB0aGlzLmVudk1hcFJlc29sdXRpb24sIHtcclxuXHRcdFx0Zm9ybWF0OiBUSFJFRS5SR0JBRm9ybWF0LFxyXG5cdFx0XHRnZW5lcmF0ZU1pcG1hcHM6IHRydWUsXHJcblx0XHRcdG1hZ0ZpbHRlcjogVEhSRUUuTGluZWFyRmlsdGVyLFxyXG5cdFx0XHRtaW5GaWx0ZXI6IFRIUkVFLkxpbmVhckZpbHRlclxyXG5cdFx0fSApO1xyXG5cclxuXHRcdHRoaXMuZW52TWFwQ2FtZXJhID0gbmV3IFRIUkVFLkN1YmVDYW1lcmEoIDAuMDAxLCAxMDAwLCB0aGlzLmVudk1hcFJlbmRlclRhcmdldCApO1xyXG5cdFx0dGhpcy5nZXRXb3JsZFBvc2l0aW9uKCB0aGlzLmVudk1hcENhbWVyYS5wb3NpdGlvbiApO1xyXG5cclxuXHRcdHRoaXMub25CZWZvcmVSZW5kZXIgPSAoIHJlbmRlcmVyLCBzY2VuZSwgY2FtZXJhICkgPT4ge1xyXG5cclxuXHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KCB7XHJcblx0XHRcdFx0dHlwZTogJ2JlZm9yZVJlbmRlcicsXHJcblx0XHRcdFx0cmVuZGVyZXIsXHJcblx0XHRcdFx0c2NlbmUsXHJcblx0XHRcdFx0Y2FtZXJhXHJcblx0XHRcdH0gKTtcclxuXHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lciggJ2JlZm9yZVJlbmRlcicsICggZTogVEhSRUUuRXZlbnQgKSA9PiB7XHJcblxyXG5cdFx0XHRsZXQgcmVuZGVyZXIgPSBlLnJlbmRlcmVyO1xyXG5cdFx0XHRsZXQgc2NlbmUgPSBlLnNjZW5lO1xyXG5cdFx0XHRsZXQgY2FtZXJhID0gZS5jYW1lcmE7XHJcblxyXG5cdFx0XHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHRcdFx0XHRFbnZNYXBcclxuXHRcdFx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG5cdFx0XHRpZiAoIHRoaXMuZW52TWFwVXBkYXRlICkge1xyXG5cclxuXHRcdFx0XHRsZXQgZW52TWFwUlQ6IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0IHwgbnVsbCA9IG51bGw7XHJcblxyXG5cdFx0XHRcdGxldCBwbXJlbUdlbmVyYXRvciA9IG5ldyBUSFJFRS5QTVJFTUdlbmVyYXRvciggcmVuZGVyZXIgKTtcclxuXHRcdFx0XHRwbXJlbUdlbmVyYXRvci5jb21waWxlRXF1aXJlY3Rhbmd1bGFyU2hhZGVyKCk7XHJcblxyXG5cdFx0XHRcdGlmICggdGhpcy5lbnZNYXBTcmMgKSB7XHJcblxyXG5cdFx0XHRcdFx0aWYgKCAnaXNDdWJlVGV4dHVyZScgaW4gdGhpcy5lbnZNYXBTcmMgKSB7XHJcblxyXG5cdFx0XHRcdFx0XHRlbnZNYXBSVCA9IHBtcmVtR2VuZXJhdG9yLmZyb21DdWJlbWFwKCB0aGlzLmVudk1hcFNyYyApO1xyXG5cclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdFx0XHRlbnZNYXBSVCA9IHBtcmVtR2VuZXJhdG9yLmZyb21FcXVpcmVjdGFuZ3VsYXIoIHRoaXMuZW52TWFwU3JjICk7XHJcblxyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHRcdHRoaXMudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuZW52TWFwQ2FtZXJhLnVwZGF0ZSggcmVuZGVyZXIsIHNjZW5lICk7XHJcblx0XHRcdFx0XHRlbnZNYXBSVCA9IHBtcmVtR2VuZXJhdG9yLmZyb21DdWJlbWFwKCB0aGlzLmVudk1hcFJlbmRlclRhcmdldC50ZXh0dXJlICk7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy52aXNpYmxlID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBlbnZtYXBcclxuXHRcdFx0XHRsZXQgZW52TWFwUmVzb2x1dGlvbiA9IGVudk1hcFJULmhlaWdodDtcclxuXHJcblx0XHRcdFx0Y29uc3QgbWF4TWlwID0gTWF0aC5yb3VuZCggTWF0aC5sb2cyKCBlbnZNYXBSZXNvbHV0aW9uICkgKSAtIDI7XHJcblx0XHRcdFx0Y29uc3QgdGV4ZWxIZWlnaHQgPSAxLjAgLyBlbnZNYXBSZXNvbHV0aW9uO1xyXG5cdFx0XHRcdGNvbnN0IHRleGVsV2lkdGggPSAxLjAgLyAoIDMgKiBNYXRoLm1heCggTWF0aC5wb3coIDIsIG1heE1pcCApLCA3ICogMTYgKSApO1xyXG5cclxuXHRcdFx0XHRtYXQuZGVmaW5lc1sgJ1VTRV9FTlZfTUFQJyBdID0gJyc7XHJcblx0XHRcdFx0bWF0LmRlZmluZXNbICdDVUJFVVZfTUFYX01JUCcgXSA9IG1heE1pcCArICcuMCc7XHJcblx0XHRcdFx0bWF0LmRlZmluZXNbICdDVUJFVVZfVEVYRUxfV0lEVEgnIF0gPSB0ZXhlbFdpZHRoICsgJyc7XHJcblx0XHRcdFx0bWF0LmRlZmluZXNbICdDVUJFVVZfVEVYRUxfSEVJR0hUJyBdID0gdGV4ZWxIZWlnaHQgKyAnJztcclxuXHJcblx0XHRcdFx0dGhpcy5jb21tb25Vbmlmb3Jtcy5lbnZNYXAudmFsdWUgPSBlbnZNYXBSVC50ZXh0dXJlO1xyXG5cdFx0XHRcdHRoaXMuZW52TWFwVXBkYXRlID0gZmFsc2U7XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHRcdFx0XHREZXB0aFxyXG5cdFx0XHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcblx0XHRcdGlmICggY2FtZXJhLnVzZXJEYXRhLmRlcHRoQ2FtZXJhICkge1xyXG5cclxuXHRcdFx0XHR0aGlzLm1hdGVyaWFsID0gdGhpcy51c2VyRGF0YS5kZXB0aE1hdDtcclxuXHRcdFx0XHR0aGlzLmNvbW1vblVuaWZvcm1zLmNhbWVyYU5lYXIudmFsdWUgPSBjYW1lcmEubmVhcjtcclxuXHRcdFx0XHR0aGlzLmNvbW1vblVuaWZvcm1zLmNhbWVyYUZhci52YWx1ZSA9IGNhbWVyYS5mYXI7XHJcblxyXG5cdFx0XHRcdGlmICggISB0aGlzLm1hdGVyaWFsICkge1xyXG5cclxuXHRcdFx0XHRcdHRoaXMudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fSApO1xyXG5cclxuXHRcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0XHREaXNwb3NlXHJcblx0XHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcblx0XHRjb25zdCBvbkRpc3Bvc2UgPSAoKSA9PiB7XHJcblxyXG5cdFx0XHR0aGlzLmVudk1hcFJlbmRlclRhcmdldC5kaXNwb3NlKCk7XHJcblx0XHRcdHRoaXMuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG5cdFx0XHR0aGlzLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuXHJcblx0XHRcdHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2Rpc3Bvc2UnLCBvbkRpc3Bvc2UgKTtcclxuXHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lciggJ2Rpc3Bvc2UnLCBvbkRpc3Bvc2UgKTtcclxuXHJcblx0fVxyXG5cclxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHRcdEVudk1hcCAvIElCTFxyXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRwdWJsaWMgdXBkYXRlRW52TWFwKCBlbnZNYXA6IFRIUkVFLkN1YmVUZXh0dXJlIHwgVEhSRUUuVGV4dHVyZSB8IG51bGwgPSBudWxsICkge1xyXG5cclxuXHRcdHRoaXMuZW52TWFwU3JjID0gZW52TWFwO1xyXG5cdFx0dGhpcy5lbnZNYXBVcGRhdGUgPSB0cnVlO1xyXG5cclxuXHRcdGlmICggdGhpcy5jb21tb25Vbmlmb3Jtcy5lbnZNYXBJbnRlbnNpdHkudmFsdWUgPT0gbnVsbCApIHtcclxuXHJcblx0XHRcdHRoaXMuY29tbW9uVW5pZm9ybXMuZW52TWFwSW50ZW5zaXR5LnZhbHVlID0gMTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCB0aGlzLmNvbW1vblVuaWZvcm1zLmlibEludGVuc2l0eS52YWx1ZSA9PSBudWxsICkge1xyXG5cclxuXHRcdFx0dGhpcy5jb21tb25Vbmlmb3Jtcy5pYmxJbnRlbnNpdHkudmFsdWUgPSAxO1xyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0IGVudk1hcEludGVuc2l0eSggdmFsdWU6IG51bWJlciApIHtcclxuXHJcblx0XHR0aGlzLmNvbW1vblVuaWZvcm1zLmVudk1hcEludGVuc2l0eS52YWx1ZSA9IHZhbHVlO1xyXG5cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXQgaWJsSW50ZW5zaXR5KCB2YWx1ZTogbnVtYmVyICkge1xyXG5cclxuXHRcdHRoaXMuY29tbW9uVW5pZm9ybXMuaWJsSW50ZW5zaXR5LnZhbHVlID0gdmFsdWU7XHJcblxyXG5cdH1cclxuXHJcblx0cHVibGljIGRpc3Bvc2UoKSB7XHJcblxyXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KCB7IHR5cGU6ICdkaXNwc29lJyB9ICk7XHJcblxyXG5cdH1cclxuXHJcblx0cHVibGljIGdldCBpc1Bvd2VyTWVzaCgpIHtcclxuXHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHJcblx0fVxyXG5cdFxyXG59XHJcbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcclxuaW1wb3J0ICogYXMgT1JFIGZyb20gJ29yZS10aHJlZSc7XHJcblxyXG5pbXBvcnQgeyBQb3dlck1lc2ggfSBmcm9tICcuLi9Qb3dlck1lc2gnO1xyXG5cclxuaW1wb3J0IG1pcG1hcFZlcnQgZnJvbSAnLi9zaGFkZXJzL21pcG1hcC52cyc7XHJcbmltcG9ydCBtaXBtYXBGcmFnIGZyb20gJy4vc2hhZGVycy9taXBtYXAuZnMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFBvd2VyUmVmbGVjdGlvbk1lc2ggZXh0ZW5kcyBQb3dlck1lc2gge1xyXG5cclxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHRcdFJlbmRlclRhcmdldFxyXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRwcml2YXRlIHJlbmRlclRhcmdldHM6IHtcclxuXHRcdHJlZjogVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQsXHJcblx0XHRtaXBtYXA6IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0XHJcblx0fTtcclxuXHJcblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0XHRNaXBtYXBcclxuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcblx0cHJpdmF0ZSBtaXBtYXBHZW86IFRIUkVFLkJ1ZmZlckdlb21ldHJ5O1xyXG5cdHByaXZhdGUgbWlwbWFwUFA6IE9SRS5Qb3N0UHJvY2Vzc2luZyB8IG51bGw7XHJcblxyXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0UmVmbGVjdGlvbiBDYW1lcmFcclxuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcblx0cHJpdmF0ZSBsb29rQXRQb3NpdGlvbjogVEhSRUUuVmVjdG9yMztcclxuXHRwcml2YXRlIHJvdGF0aW9uTWF0cml4OiBUSFJFRS5NYXRyaXg0O1xyXG5cdHByaXZhdGUgdGFyZ2V0OiBUSFJFRS5WZWN0b3IzO1xyXG5cdHByaXZhdGUgdmlldzogVEhSRUUuVmVjdG9yMztcclxuXHJcblx0cHJpdmF0ZSB2aXJ0dWFsQ2FtZXJhOiBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYTtcclxuXHRwcml2YXRlIHJlZmxlY3RvclBsYW5lOiBUSFJFRS5QbGFuZTtcclxuXHRwcml2YXRlIG5vcm1hbDogVEhSRUUuVmVjdG9yMztcclxuXHJcblx0cHJpdmF0ZSByZWZsZWN0b3JXb3JsZFBvc2l0aW9uOiBUSFJFRS5WZWN0b3IzO1xyXG5cdHByaXZhdGUgY2FtZXJhV29ybGRQb3NpdGlvbjogVEhSRUUuVmVjdG9yMztcclxuXHJcblx0cHJpdmF0ZSBjbGlwUGxhbmU6IFRIUkVFLlZlY3RvcjQ7XHJcblx0cHJpdmF0ZSBjbGlwQmlhczogbnVtYmVyO1xyXG5cdHByaXZhdGUgcTogVEhSRUUuVmVjdG9yNDtcclxuXHJcblx0cHJpdmF0ZSB0ZXh0dXJlTWF0cml4OiBUSFJFRS5NYXRyaXg0O1xyXG5cclxuXHRjb25zdHJ1Y3RvciggZ2VvbWV0cnk6IFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBtYXRlcmlhbE9wdGlvbj86IFRIUkVFLlNoYWRlck1hdGVyaWFsUGFyYW1ldGVycywgb3ZlcnJpZGU/OiBib29sZWFuICk7XHJcblxyXG5cdGNvbnN0cnVjdG9yKCBtZXNoOiBUSFJFRS5NZXNoLCBtYXRlcmlhbE9wdGlvbj86IFRIUkVFLlNoYWRlck1hdGVyaWFsUGFyYW1ldGVycywgb3ZlcnJpZGU/OiBib29sZWFuICk7XHJcblxyXG5cdGNvbnN0cnVjdG9yKCBnZW9NZXNoOiBUSFJFRS5CdWZmZXJHZW9tZXRyeSB8IFRIUkVFLk1lc2g8VEhSRUUuQnVmZmVyR2VvbWV0cnk+LCBtYXRlcmlhbE9wdGlvbj86IFRIUkVFLlNoYWRlck1hdGVyaWFsUGFyYW1ldGVycywgb3ZlcnJpZGU/OiBib29sZWFuICkge1xyXG5cclxuXHRcdG1hdGVyaWFsT3B0aW9uID0gbWF0ZXJpYWxPcHRpb24gfHwge307XHJcblxyXG5cdFx0bWF0ZXJpYWxPcHRpb24udW5pZm9ybXMgPSBPUkUuVW5pZm9ybXNMaWIubWVyZ2VVbmlmb3JtcyggbWF0ZXJpYWxPcHRpb24udW5pZm9ybXMgfHwge30sIHtcclxuXHRcdFx0cmVmbGVjdGlvblRleDoge1xyXG5cdFx0XHRcdHZhbHVlOiBudWxsXHJcblx0XHRcdH0sXHJcblx0XHRcdHJlbmRlclJlc29sdXRpb246IHtcclxuXHRcdFx0XHR2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIoIDEsIDEgKVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR0ZXh0dXJlTWF0cml4OiB7XHJcblx0XHRcdFx0dmFsdWU6IG5ldyBUSFJFRS5NYXRyaXg0KClcclxuXHRcdFx0fSxcclxuXHRcdFx0bWlwTWFwUmVzb2x1dGlvbjoge1xyXG5cdFx0XHRcdHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMiggMSwgMSApXHJcblx0XHRcdH1cclxuXHRcdH0gKTtcclxuXHJcblx0XHRtYXRlcmlhbE9wdGlvbi5kZWZpbmVzID0ge1xyXG5cdFx0XHRJU19SRUZMRUNUSU9OUExBTkU6ICcnLFxyXG5cdFx0fTtcclxuXHJcblx0XHRzdXBlciggZ2VvTWVzaCBhcyBUSFJFRS5CdWZmZXJHZW9tZXRyeSwgbWF0ZXJpYWxPcHRpb24sIG92ZXJyaWRlICk7XHJcblxyXG5cdFx0dGhpcy5yZWZsZWN0b3JQbGFuZSA9IG5ldyBUSFJFRS5QbGFuZSgpO1xyXG5cdFx0dGhpcy5ub3JtYWwgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG5cdFx0dGhpcy5yZWZsZWN0b3JXb3JsZFBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuXHRcdHRoaXMuY2FtZXJhV29ybGRQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcblx0XHR0aGlzLnJvdGF0aW9uTWF0cml4ID0gbmV3IFRIUkVFLk1hdHJpeDQoKTtcclxuXHRcdHRoaXMubG9va0F0UG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMyggMCwgMCwgLSAxICk7XHJcblx0XHR0aGlzLmNsaXBQbGFuZSA9IG5ldyBUSFJFRS5WZWN0b3I0KCk7XHJcblx0XHR0aGlzLnRleHR1cmVNYXRyaXggPSB0aGlzLmNvbW1vblVuaWZvcm1zLnRleHR1cmVNYXRyaXgudmFsdWU7XHJcblx0XHR0aGlzLmNsaXBCaWFzID0gMC4xO1xyXG5cclxuXHRcdHRoaXMudmlldyA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcblx0XHR0aGlzLnRhcmdldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcblx0XHR0aGlzLnEgPSBuZXcgVEhSRUUuVmVjdG9yNCgpO1xyXG5cclxuXHRcdHRoaXMudmlydHVhbENhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSgpO1xyXG5cclxuXHRcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0XHRNaXBNYXBcclxuXHRcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRcdHRoaXMubWlwbWFwUFAgPSBudWxsO1xyXG5cdFx0dGhpcy5taXBtYXBHZW8gPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuXHJcblx0XHRsZXQgcG9zQXJyYXkgPSBbXTtcclxuXHRcdGxldCB1dkFycmF5ID0gW107XHJcblx0XHRsZXQgaW5kZXhBcnJheSA9IFtdO1xyXG5cclxuXHRcdGxldCBwID0gbmV3IFRIUkVFLlZlY3RvcjIoIDAsIDAgKTtcclxuXHRcdGxldCBzID0gMi4wO1xyXG5cclxuXHRcdHBvc0FycmF5LnB1c2goIHAueCwgcC55LCAwICk7XHJcblx0XHRwb3NBcnJheS5wdXNoKCBwLnggKyBzLCBwLnksIDAgKTtcclxuXHRcdHBvc0FycmF5LnB1c2goIHAueCArIHMsIHAueSAtIHMsIDAgKTtcclxuXHRcdHBvc0FycmF5LnB1c2goIHAueCwgcC55IC0gcywgMCApO1xyXG5cclxuXHRcdHV2QXJyYXkucHVzaCggMS4wLCAxLjAgKTtcclxuXHRcdHV2QXJyYXkucHVzaCggMC4wLCAxLjAgKTtcclxuXHRcdHV2QXJyYXkucHVzaCggMC4wLCAwLjAgKTtcclxuXHRcdHV2QXJyYXkucHVzaCggMS4wLCAwLjAgKTtcclxuXHJcblx0XHRpbmRleEFycmF5LnB1c2goIDAsIDIsIDEsIDAsIDMsIDIgKTtcclxuXHJcblx0XHRwLnNldCggcywgMCApO1xyXG5cclxuXHRcdGZvciAoIGxldCBpID0gMDsgaSA8IDc7IGkgKysgKSB7XHJcblxyXG5cdFx0XHRzICo9IDAuNTtcclxuXHJcblx0XHRcdHBvc0FycmF5LnB1c2goIHAueCxcdFx0cC55LFx0XHQwICk7XHJcblx0XHRcdHBvc0FycmF5LnB1c2goIHAueCArIHMsIHAueSxcdFx0MCApO1xyXG5cdFx0XHRwb3NBcnJheS5wdXNoKCBwLnggKyBzLCBwLnkgLSBzLFx0MCApO1xyXG5cdFx0XHRwb3NBcnJheS5wdXNoKCBwLngsXHRcdHAueSAtIHMsIFx0MCApO1xyXG5cclxuXHRcdFx0dXZBcnJheS5wdXNoKCAxLjAsIDEuMCApO1xyXG5cdFx0XHR1dkFycmF5LnB1c2goIDAuMCwgMS4wICk7XHJcblx0XHRcdHV2QXJyYXkucHVzaCggMC4wLCAwLjAgKTtcclxuXHRcdFx0dXZBcnJheS5wdXNoKCAxLjAsIDAuMCApO1xyXG5cclxuXHRcdFx0bGV0IGluZGV4T2Zmc2V0ID0gKCBpICsgMC4wICkgKiA0O1xyXG5cdFx0XHRpbmRleEFycmF5LnB1c2goIGluZGV4T2Zmc2V0ICsgMCwgaW5kZXhPZmZzZXQgKyAyLCBpbmRleE9mZnNldCArIDEsIGluZGV4T2Zmc2V0ICsgMCwgaW5kZXhPZmZzZXQgKyAzLCBpbmRleE9mZnNldCArIDIgKTtcclxuXHJcblx0XHRcdHAueSA9IHAueSAtIHM7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBwb3NBdHRyID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggbmV3IEZsb2F0MzJBcnJheSggcG9zQXJyYXkgKSwgMyApO1xyXG5cdFx0bGV0IHV2QXR0ciA9IG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIG5ldyBGbG9hdDMyQXJyYXkoIHV2QXJyYXkgKSwgMiApO1xyXG5cdFx0bGV0IGluZGV4QXR0ciA9IG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIG5ldyBVaW50MTZBcnJheSggaW5kZXhBcnJheSApLCAxICk7XHJcblxyXG5cdFx0bGV0IGdzID0gMTtcclxuXHRcdHBvc0F0dHIuYXBwbHlNYXRyaXg0KCBuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VTY2FsZSggKCAxLjAgLyAxLjUgKSwgZ3MsIGdzICkgKTtcclxuXHRcdHBvc0F0dHIuYXBwbHlNYXRyaXg0KCBuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VUcmFuc2xhdGlvbiggLSAxLjAsIDEuMCwgMCApICk7XHJcblxyXG5cdFx0dGhpcy5taXBtYXBHZW8uc2V0QXR0cmlidXRlKCAncG9zaXRpb24nLCBwb3NBdHRyICk7XHJcblx0XHR0aGlzLm1pcG1hcEdlby5zZXRBdHRyaWJ1dGUoICd1dicsIHV2QXR0ciApO1xyXG5cdFx0dGhpcy5taXBtYXBHZW8uc2V0SW5kZXgoIGluZGV4QXR0ciApO1xyXG5cclxuXHRcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0XHRSZW5kZXJUYXJnZXRzXHJcblx0XHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcblx0XHR0aGlzLnJlbmRlclRhcmdldHMgPSB7XHJcblx0XHRcdHJlZjogbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KCAxLCAxICksXHJcblx0XHRcdG1pcG1hcDogbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KCAxLCAxICksXHJcblx0XHR9O1xyXG5cclxuXHRcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0XHRSZWZsZWN0aW9uXHJcblx0XHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoICdiZWZvcmVSZW5kZXInLCAoIGU6IFRIUkVFLkV2ZW50ICkgPT4ge1xyXG5cclxuXHRcdFx0bGV0IHJlbmRlcmVyID0gZS5yZW5kZXJlciBhcyBUSFJFRS5XZWJHTFJlbmRlcmVyO1xyXG5cdFx0XHRsZXQgc2NlbmUgPSBlLnNjZW5lIGFzIFRIUkVFLlNjZW5lO1xyXG5cdFx0XHRsZXQgY2FtZXJhID0gZS5jYW1lcmEgYXMgVEhSRUUuQ2FtZXJhO1xyXG5cclxuXHRcdFx0dGhpcy5yZWZsZWN0b3JXb3JsZFBvc2l0aW9uLnNldEZyb21NYXRyaXhQb3NpdGlvbiggdGhpcy5tYXRyaXhXb3JsZCApO1xyXG5cdFx0XHR0aGlzLmNhbWVyYVdvcmxkUG9zaXRpb24uc2V0RnJvbU1hdHJpeFBvc2l0aW9uKCBjYW1lcmEubWF0cml4V29ybGQgKTtcclxuXHJcblx0XHRcdHRoaXMucm90YXRpb25NYXRyaXguZXh0cmFjdFJvdGF0aW9uKCB0aGlzLm1hdHJpeFdvcmxkICk7XHJcblxyXG5cdFx0XHR0aGlzLm5vcm1hbC5zZXQoIDAsIDEuMCwgMCApO1xyXG5cdFx0XHR0aGlzLm5vcm1hbC5hcHBseU1hdHJpeDQoIHRoaXMucm90YXRpb25NYXRyaXggKTtcclxuXHJcblx0XHRcdHRoaXMudmlldy5zdWJWZWN0b3JzKCB0aGlzLnJlZmxlY3RvcldvcmxkUG9zaXRpb24sIHRoaXMuY2FtZXJhV29ybGRQb3NpdGlvbiApO1xyXG5cclxuXHRcdFx0Ly8gQXZvaWQgcmVuZGVyaW5nIHdoZW4gcmVmbGVjdG9yIGlzIGZhY2luZyBhd2F5XHJcblxyXG5cdFx0XHRpZiAoIHRoaXMudmlldy5kb3QoIHRoaXMubm9ybWFsICkgPiAwICkgcmV0dXJuO1xyXG5cclxuXHRcdFx0dGhpcy52aWV3LnJlZmxlY3QoIHRoaXMubm9ybWFsICkubmVnYXRlKCk7XHJcblx0XHRcdHRoaXMudmlldy5hZGQoIHRoaXMucmVmbGVjdG9yV29ybGRQb3NpdGlvbiApO1xyXG5cclxuXHRcdFx0dGhpcy5yb3RhdGlvbk1hdHJpeC5leHRyYWN0Um90YXRpb24oIGNhbWVyYS5tYXRyaXhXb3JsZCApO1xyXG5cclxuXHRcdFx0dGhpcy5sb29rQXRQb3NpdGlvbi5zZXQoIDAsIDAsIC0gMSApO1xyXG5cdFx0XHR0aGlzLmxvb2tBdFBvc2l0aW9uLmFwcGx5TWF0cml4NCggdGhpcy5yb3RhdGlvbk1hdHJpeCApO1xyXG5cdFx0XHR0aGlzLmxvb2tBdFBvc2l0aW9uLmFkZCggdGhpcy5jYW1lcmFXb3JsZFBvc2l0aW9uICk7XHJcblxyXG5cdFx0XHR0aGlzLnRhcmdldC5zdWJWZWN0b3JzKCB0aGlzLnJlZmxlY3RvcldvcmxkUG9zaXRpb24sIHRoaXMubG9va0F0UG9zaXRpb24gKTtcclxuXHRcdFx0dGhpcy50YXJnZXQucmVmbGVjdCggdGhpcy5ub3JtYWwgKS5uZWdhdGUoKTtcclxuXHRcdFx0dGhpcy50YXJnZXQuYWRkKCB0aGlzLnJlZmxlY3RvcldvcmxkUG9zaXRpb24gKTtcclxuXHJcblx0XHRcdHRoaXMudmlydHVhbENhbWVyYS5wb3NpdGlvbi5jb3B5KCB0aGlzLnZpZXcgKTtcclxuXHRcdFx0dGhpcy52aXJ0dWFsQ2FtZXJhLnVwLnNldCggMCwgMSwgMCApO1xyXG5cdFx0XHR0aGlzLnZpcnR1YWxDYW1lcmEudXAuYXBwbHlNYXRyaXg0KCB0aGlzLnJvdGF0aW9uTWF0cml4ICk7XHJcblx0XHRcdHRoaXMudmlydHVhbENhbWVyYS51cC5yZWZsZWN0KCB0aGlzLm5vcm1hbCApO1xyXG5cdFx0XHR0aGlzLnZpcnR1YWxDYW1lcmEubG9va0F0KCB0aGlzLnRhcmdldCApO1xyXG5cclxuXHRcdFx0aWYgKCAoIGNhbWVyYSBhcyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSApLmZhciApIHtcclxuXHJcblx0XHRcdFx0dGhpcy52aXJ0dWFsQ2FtZXJhLmZhciA9ICggY2FtZXJhIGFzIFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhICkuZmFyOyAvLyBVc2VkIGluIFdlYkdMQmFja2dyb3VuZFxyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy52aXJ0dWFsQ2FtZXJhLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XHJcblx0XHRcdHRoaXMudmlydHVhbENhbWVyYS5wcm9qZWN0aW9uTWF0cml4LmNvcHkoIGNhbWVyYS5wcm9qZWN0aW9uTWF0cml4ICk7XHJcblxyXG5cdFx0XHQvLyBVcGRhdGUgdGhlIHRleHR1cmUgbWF0cml4XHJcblx0XHRcdHRoaXMudGV4dHVyZU1hdHJpeC5zZXQoXHJcblx0XHRcdFx0MC41LCAwLjAsIDAuMCwgMC41LFxyXG5cdFx0XHRcdDAuMCwgMC41LCAwLjAsIDAuNSxcclxuXHRcdFx0XHQwLjAsIDAuMCwgMC41LCAwLjUsXHJcblx0XHRcdFx0MC4wLCAwLjAsIDAuMCwgMS4wXHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHR0aGlzLnRleHR1cmVNYXRyaXgubXVsdGlwbHkoIHRoaXMudmlydHVhbENhbWVyYS5wcm9qZWN0aW9uTWF0cml4ICk7XHJcblx0XHRcdHRoaXMudGV4dHVyZU1hdHJpeC5tdWx0aXBseSggdGhpcy52aXJ0dWFsQ2FtZXJhLm1hdHJpeFdvcmxkSW52ZXJzZSApO1xyXG5cdFx0XHR0aGlzLnRleHR1cmVNYXRyaXgubXVsdGlwbHkoIHRoaXMubWF0cml4V29ybGQgKTtcclxuXHJcblx0XHRcdC8vIE5vdyB1cGRhdGUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCBuZXcgY2xpcCBwbGFuZSwgaW1wbGVtZW50aW5nIGNvZGUgZnJvbTogaHR0cDovL3d3dy50ZXJhdGhvbi5jb20vY29kZS9vYmxpcXVlLmh0bWxcclxuXHRcdFx0Ly8gUGFwZXIgZXhwbGFpbmluZyB0aGlzIHRlY2huaXF1ZTogaHR0cDovL3d3dy50ZXJhdGhvbi5jb20vbGVuZ3llbC9MZW5neWVsLU9ibGlxdWUucGRmXHJcblx0XHRcdHRoaXMucmVmbGVjdG9yUGxhbmUuc2V0RnJvbU5vcm1hbEFuZENvcGxhbmFyUG9pbnQoIHRoaXMubm9ybWFsLCB0aGlzLnJlZmxlY3RvcldvcmxkUG9zaXRpb24gKTtcclxuXHRcdFx0dGhpcy5yZWZsZWN0b3JQbGFuZS5hcHBseU1hdHJpeDQoIHRoaXMudmlydHVhbENhbWVyYS5tYXRyaXhXb3JsZEludmVyc2UgKTtcclxuXHJcblx0XHRcdHRoaXMuY2xpcFBsYW5lLnNldCggdGhpcy5yZWZsZWN0b3JQbGFuZS5ub3JtYWwueCwgdGhpcy5yZWZsZWN0b3JQbGFuZS5ub3JtYWwueSwgdGhpcy5yZWZsZWN0b3JQbGFuZS5ub3JtYWwueiwgdGhpcy5yZWZsZWN0b3JQbGFuZS5jb25zdGFudCApO1xyXG5cclxuXHRcdFx0dmFyIHByb2plY3Rpb25NYXRyaXggPSB0aGlzLnZpcnR1YWxDYW1lcmEucHJvamVjdGlvbk1hdHJpeDtcclxuXHJcblx0XHRcdHRoaXMucS54ID0gKCBNYXRoLnNpZ24oIHRoaXMuY2xpcFBsYW5lLnggKSArIHByb2plY3Rpb25NYXRyaXguZWxlbWVudHNbIDggXSApIC8gcHJvamVjdGlvbk1hdHJpeC5lbGVtZW50c1sgMCBdO1xyXG5cdFx0XHR0aGlzLnEueSA9ICggTWF0aC5zaWduKCB0aGlzLmNsaXBQbGFuZS55ICkgKyBwcm9qZWN0aW9uTWF0cml4LmVsZW1lbnRzWyA5IF0gKSAvIHByb2plY3Rpb25NYXRyaXguZWxlbWVudHNbIDUgXTtcclxuXHRcdFx0dGhpcy5xLnogPSAtIDEuMDtcclxuXHRcdFx0dGhpcy5xLncgPSAoIDEuMCArIHByb2plY3Rpb25NYXRyaXguZWxlbWVudHNbIDEwIF0gKSAvIHByb2plY3Rpb25NYXRyaXguZWxlbWVudHNbIDE0IF07XHJcblxyXG5cdFx0XHQvLyBDYWxjdWxhdGUgdGhlIHNjYWxlZCBwbGFuZSB2ZWN0b3JcclxuXHRcdFx0dGhpcy5jbGlwUGxhbmUubXVsdGlwbHlTY2FsYXIoIDIuMCAvIHRoaXMuY2xpcFBsYW5lLmRvdCggdGhpcy5xICkgKTtcclxuXHJcblx0XHRcdC8vIFJlcGxhY2luZyB0aGUgdGhpcmQgcm93IG9mIHRoZSBwcm9qZWN0aW9uIG1hdHJpeFxyXG5cdFx0XHRwcm9qZWN0aW9uTWF0cml4LmVsZW1lbnRzWyAyIF0gPSB0aGlzLmNsaXBQbGFuZS54O1xyXG5cdFx0XHRwcm9qZWN0aW9uTWF0cml4LmVsZW1lbnRzWyA2IF0gPSB0aGlzLmNsaXBQbGFuZS55O1xyXG5cdFx0XHRwcm9qZWN0aW9uTWF0cml4LmVsZW1lbnRzWyAxMCBdID0gdGhpcy5jbGlwUGxhbmUueiArIDEuMCAtIHRoaXMuY2xpcEJpYXM7XHJcblx0XHRcdHByb2plY3Rpb25NYXRyaXguZWxlbWVudHNbIDE0IF0gPSB0aGlzLmNsaXBQbGFuZS53O1xyXG5cclxuXHRcdFx0Ly9yZW5kZXJcclxuXHRcdFx0bGV0IGN1cnJlbnRSZW5kZXJUYXJnZXQgPSByZW5kZXJlci5nZXRSZW5kZXJUYXJnZXQoKTtcclxuXHJcblx0XHRcdHJlbmRlcmVyLnNldFJlbmRlclRhcmdldCggdGhpcy5yZW5kZXJUYXJnZXRzLnJlZiApO1xyXG5cdFx0XHR0aGlzLnZpc2libGUgPSBmYWxzZTtcclxuXHJcblx0XHRcdHJlbmRlcmVyLmNsZWFyKCk7XHJcblx0XHRcdHJlbmRlcmVyLnJlbmRlciggc2NlbmUsIHRoaXMudmlydHVhbENhbWVyYSApO1xyXG5cdFx0XHRyZW5kZXJlci5jbGVhckRlcHRoKCk7XHJcblxyXG5cdFx0XHRyZW5kZXJlci5zZXRSZW5kZXJUYXJnZXQoIGN1cnJlbnRSZW5kZXJUYXJnZXQgKTtcclxuXHRcdFx0dGhpcy52aXNpYmxlID0gdHJ1ZTtcclxuXHJcblx0XHRcdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdFx0XHRcdE1pcE1hcFBQXHJcblx0XHRcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuXHRcdFx0aWYgKCB0aGlzLm1pcG1hcFBQID09IG51bGwgKSB7XHJcblxyXG5cdFx0XHRcdHRoaXMubWlwbWFwUFAgPSBuZXcgT1JFLlBvc3RQcm9jZXNzaW5nKCByZW5kZXJlciwge1xyXG5cdFx0XHRcdFx0ZnJhZ21lbnRTaGFkZXI6IG1pcG1hcEZyYWcsXHJcblx0XHRcdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXHJcblx0XHRcdFx0fSwgdGhpcy5taXBtYXBHZW8gKTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMubWlwbWFwUFAucmVuZGVyKCB7IHRleDogdGhpcy5yZW5kZXJUYXJnZXRzLnJlZi50ZXh0dXJlIH0sIHRoaXMucmVuZGVyVGFyZ2V0cy5taXBtYXAgKTtcclxuXHRcdFx0dGhpcy5jb21tb25Vbmlmb3Jtcy5yZWZsZWN0aW9uVGV4LnZhbHVlID0gdGhpcy5yZW5kZXJUYXJnZXRzLm1pcG1hcC50ZXh0dXJlO1xyXG5cclxuXHRcdFx0bGV0IHJ0ID0gcmVuZGVyZXIuZ2V0UmVuZGVyVGFyZ2V0KCkgYXMgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQ7XHJcblxyXG5cdFx0XHRpZiAoIHJ0ICkge1xyXG5cclxuXHRcdFx0XHR0aGlzLmNvbW1vblVuaWZvcm1zLnJlbmRlclJlc29sdXRpb24udmFsdWUuc2V0KCBydC53aWR0aCwgcnQuaGVpZ2h0ICk7XHJcblxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHRyZW5kZXJlci5nZXRTaXplKCB0aGlzLmNvbW1vblVuaWZvcm1zLnJlbmRlclJlc29sdXRpb24udmFsdWUgKTtcclxuXHRcdFx0XHR0aGlzLmNvbW1vblVuaWZvcm1zLnJlbmRlclJlc29sdXRpb24udmFsdWUubXVsdGlwbHlTY2FsYXIoIHJlbmRlcmVyLmdldFBpeGVsUmF0aW8oKSApO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH0gKTtcclxuXHJcblx0XHR0aGlzLnJlc2l6ZSgpO1xyXG5cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVzaXplKCkge1xyXG5cclxuXHRcdGxldCBzaXplID0gNTEyO1xyXG5cdFx0dGhpcy5yZW5kZXJUYXJnZXRzLnJlZi5zZXRTaXplKCBzaXplLCBzaXplICk7XHJcblxyXG5cdFx0bGV0IG1pcE1hcFNpemUgPSBuZXcgVEhSRUUuVmVjdG9yMiggc2l6ZSAqIDEuNSwgc2l6ZSApO1xyXG5cdFx0dGhpcy5yZW5kZXJUYXJnZXRzLm1pcG1hcC5zZXRTaXplKCBtaXBNYXBTaXplLngsIG1pcE1hcFNpemUueSApO1xyXG5cdFx0dGhpcy5jb21tb25Vbmlmb3Jtcy5taXBNYXBSZXNvbHV0aW9uLnZhbHVlLmNvcHkoIG1pcE1hcFNpemUgKTtcclxuXHJcblx0fVxyXG5cclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfb3JlX3RocmVlX187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX3RocmVlX187IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImV4cG9ydCB7IFBvd2VyTWVzaCB9IGZyb20gXCIuL1Bvd2VyTWVzaFwiO1xyXG5leHBvcnQgeyBQb3dlclJlZmxlY3Rpb25NZXNoIH0gZnJvbSBcIi4vUG93ZXJSZWZsZWN0aW9uTWVzaFwiO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=