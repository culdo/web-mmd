#include <common>
#include <packing>

#ifdef GL_FRAGMENT_PRECISION_HIGH

	uniform highp sampler2D depthBuffer;

#else

	uniform mediump sampler2D depthBuffer;

#endif

uniform float focusDistance;
uniform float focusRange;
uniform float cameraNear;
uniform float cameraFar;

varying vec2 vUv;

void main() {

	float D = texture2D(depthBuffer, vUv).r;
	float P = focusDistance;
	float F = focusRange;
	float aspect = 0.9;

	P *= 0.001f;
	D *= 0.001f;
	F *= 0.001f;

	float CoC = aspect * F * (D - P) / (D * (P - F));
 	CoC = clamp(CoC, -2.0, 4.0);
 	CoC = pow(abs(CoC) / 4.0) * sign(CoC) * 4.0;

	gl_FragColor.r = CoC;

}
