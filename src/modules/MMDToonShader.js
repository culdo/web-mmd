/**
 * MMD Toon Shader
 *
 * This shader is extended from MeshPhongMaterial, and merged algorithms with
 * MeshToonMaterial and MeshMetcapMaterial.
 * Ideas came from https://github.com/mrdoob/three.js/issues/19609
 *
 * Combining steps:
 *  * Declare matcap uniform.
 *  * Add gradientmap_pars_fragment.
 *  * Use gradient irradiances instead of dotNL irradiance from MeshPhongMaterial.
 *    (Replace lights_phong_pars_fragment with lights_mmd_toon_pars_fragment)
 *  * Add mmd_toon_matcap_fragment.
 */

import { UniformsUtils, ShaderLib } from 'three';

const lights_mmd_toon_pars_fragment = /* glsl */`
varying vec3 vViewPosition;

struct BlinnPhongMaterial {

	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;

};

void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {

	vec3 irradiance = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;

	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularShininess ) * material.specularStrength;

}

void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {

	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

}

#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong

#define Material_LightProbeLOD( material )	(0)
`;

const mmd_toon_matcap_fragment = /* glsl */`
#ifdef USE_MATCAP

	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks
	vec4 matcapColor = texture2D( matcap, uv );

	#ifdef MATCAP_BLENDING_MULTIPLY

		outgoingLight *= matcapColor.rgb;

	#elif defined( MATCAP_BLENDING_ADD )

		outgoingLight += matcapColor.rgb;

	#endif

#endif
`;

const sdefSkinningParsVertex = `
#define QUATERNION_IDENTITY vec4(0, 0, 0, 1)
vec4 m2q( mat4 a ) {
	vec4 q;
	float trace = a[0][0] + a[1][1] + a[2][2];
	if( trace > 0.0 ) { 
		float s = 0.5f / sqrt(trace+ 1.0f);
		q.w = 0.25f / s;
		q.x = ( a[2][1] - a[1][2] ) * s;
		q.y = ( a[0][2] - a[2][0] ) * s;
		q.z = ( a[1][0] - a[0][1] ) * s;
	} else {
		if ( a[0][0] > a[1][1] && a[0][0] > a[2][2] ) {
			float s = 2.0f * sqrt( 1.0f + a[0][0] - a[1][1] - a[2][2]);
			q.w = (a[2][1] - a[1][2] ) / s;
			q.x = 0.25f * s;
			q.y = (a[0][1] + a[1][0] ) / s;
			q.z = (a[0][2] + a[2][0] ) / s;
		} else if (a[1][1] > a[2][2]) {
			float s = 2.0f * sqrt( 1.0f + a[1][1] - a[0][0] - a[2][2]);
			q.w = (a[0][2] - a[2][0] ) / s;
			q.x = (a[0][1] + a[1][0] ) / s;
			q.y = 0.25f * s;
			q.z = (a[1][2] + a[2][1] ) / s;
		} else {
			float s = 2.0f * sqrt( 1.0f + a[2][2] - a[0][0] - a[1][1] );
			q.w = (a[1][0] - a[0][1] ) / s;
			q.x = (a[0][2] + a[2][0] ) / s;
			q.y = (a[1][2] + a[2][1] ) / s;
			q.z = 0.25f * s;
		}
	}
	return q;
}

mat3 q2m(vec4 q)
{
	return mat3(
		1.0 - 2.0*q.y*q.y - 2.0*q.z*q.z ,     2.0*q.x*q.y - 2.0*q.z*q.w ,     2.0*q.x*q.z + 2.0*q.y*q.w,
			2.0*q.x*q.y + 2.0*q.z*q.w , 1.0 - 2.0*q.x*q.x - 2.0*q.z*q.z ,     2.0*q.y*q.z - 2.0*q.x*q.w,
			2.0*q.x*q.z - 2.0*q.y*q.w ,     2.0*q.y*q.z + 2.0*q.x*q.w , 1.0 - 2.0*q.x*q.x - 2.0*q.y*q.y
	);
}

vec4 q_slerp(vec4 a, vec4 b, float t) {
	// if either input is zero, return the other.
	if (length(a) == 0.0) {
		if (length(b) == 0.0) {
			return QUATERNION_IDENTITY;
		}
		return b;
	} else if (length(b) == 0.0) {
		return a;
	}

	float cosHalfAngle = a.w * b.w + dot(a.xyz, b.xyz);

	if (cosHalfAngle >= 1.0 || cosHalfAngle <= -1.0) {
		return a;
	} else if (cosHalfAngle < 0.0) {
		b.xyz = -b.xyz;
		b.w = -b.w;
		cosHalfAngle = -cosHalfAngle;
	}

	float blendA;
	float blendB;
	if (cosHalfAngle < 0.99) {
		// do proper slerp for big angles
		float halfAngle = acos(cosHalfAngle);
		float sinHalfAngle = sin(halfAngle);
		float oneOverSinHalfAngle = 1.0 / sinHalfAngle;
		blendA = sin(halfAngle * (1.0 - t)) * oneOverSinHalfAngle;
		blendB = sin(halfAngle * t) * oneOverSinHalfAngle;
	} else {
		// do lerp if angle is really small.
		blendA = 1.0 - t;
		blendB = t;
	}

	vec4 result = vec4(blendA * a.xyz + blendB * b.xyz, blendA * a.w + blendB * b.w);
	if (length(result) > 0.0) {
		return normalize(result);
	}
	return QUATERNION_IDENTITY;
}

attribute int skinType;
attribute vec3 skinC;
attribute vec3 skinR0;
attribute vec3 skinR1;

#include <skinning_pars_vertex>
`

const sdefSkinningVertex = `
#ifdef USE_SKINNING	

	if (skinType == 3) {	
		vec4 q0 = m2q(boneMatX);
		vec4 q1 = m2q(boneMatY);
	
		mat3 rot_mat = q2m(q_slerp(q0, q1, skinWeight.y));
		transformed = rot_mat * (transformed - skinC) + vec3(boneMatX * vec4(skinR0, 1)) * skinWeight.x + vec3(boneMatY * vec4(skinR1, 1)) * skinWeight.y;
	} else {
		#include <skinning_vertex>
	}
#endif
`

const sdefSkinningNormVertex = `
#ifdef USE_SKINNING	

	if (skinType == 3) {	
		vec4 q0 = m2q(boneMatX);
		vec4 q1 = m2q(boneMatY);
	
		mat3 rot_mat = q2m(q_slerp(q0, q1, skinWeight.y));
		objectNormal = rot_mat * objectNormal;
	} else {
		#include <skinnormal_vertex>
	}
#endif
`

const MMDToonShader = {

	defines: {
		TOON: true,
		MATCAP: true,
		MATCAP_BLENDING_ADD: true
	},

	uniforms: UniformsUtils.merge([
		ShaderLib.toon.uniforms,
		ShaderLib.phong.uniforms,
		ShaderLib.matcap.uniforms,
	]),

	vertexShader: ShaderLib.phong.vertexShader
		.replace(
			'#include <skinning_pars_vertex>',
			sdefSkinningParsVertex
		)
		.replace(
			'#include <skinning_vertex>',
			sdefSkinningVertex
		)
		.replace(
			'#include <skinnormal_vertex>',
			sdefSkinningNormVertex
		),

	fragmentShader:
		ShaderLib.phong.fragmentShader
			.replace(
				'#include <common>',
				`
					#ifdef USE_MATCAP
						uniform sampler2D matcap;
					#endif

					#include <common>
				`
			)
			.replace(
				'#include <envmap_common_pars_fragment>',
				`
					#include <gradientmap_pars_fragment>
					#include <envmap_common_pars_fragment>
				`
			)
			.replace(
				'#include <lights_phong_pars_fragment>',
				lights_mmd_toon_pars_fragment
			)
			.replace(
				'#include <envmap_fragment>',
				`
					#include <envmap_fragment>
					${mmd_toon_matcap_fragment}
				`
			),

};

export { MMDToonShader };
