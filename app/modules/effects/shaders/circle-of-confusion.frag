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

	float linearDepth = texture2D(depthBuffer, vUv).r;

	float signedDistance = linearDepth - focusDistance;
	const float CIRCLE_OF_CONFUSION = 0.03; // 35mm film = 0.03mm CoC.

	float focalPlaneMM = focusDistance * 1000.0;
	float depthMM = linearDepth * 1000.0;

	float focalPlane = (depthMM * focusRange) / (depthMM - focusRange);
	float farDoF = (focalPlaneMM * focusRange) / (focalPlaneMM - focusRange);
	float nearDoF = (focalPlaneMM - focusRange) / (focalPlaneMM * 0.9 * CIRCLE_OF_CONFUSION);

	float blur = abs(focalPlane - farDoF) * nearDoF;

	gl_FragColor.rg = blur * vec2(
		step(signedDistance, 0.0),
		step(0.0, signedDistance)
	);

}
