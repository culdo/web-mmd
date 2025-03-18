#include <skinning_pars_vertex>

attribute vec2 skinType;
attribute vec3 skinC;
attribute vec3 skinR0;
attribute vec3 skinR1;

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

mat3 getRotMat() {
	vec4 q0 = m2q(getBoneMatrix( skinIndex.x ));
	vec4 q1 = m2q(getBoneMatrix( skinIndex.y ));

	return q2m(q_slerp(q0, q1, skinWeight.y));
}
