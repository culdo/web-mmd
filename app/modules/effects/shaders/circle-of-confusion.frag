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

uniform mat4 projectionMatrix;

varying vec2 vUv;

float readDepth(const in vec2 uv) {

	#if DEPTH_PACKING == 3201

		float depth = unpackRGBAToDepth(texture2D(depthBuffer, uv));

	#else

		float depth = texture2D(depthBuffer, uv).r;

	#endif

	#ifdef LOG_DEPTH

		float d = pow(2.0, depth * log2(cameraFar + 1.0)) - 1.0;
		float a = cameraFar / (cameraFar - cameraNear);
		float b = cameraFar * cameraNear / (cameraNear - cameraFar);
		depth = a + b / d;

	#endif

	return depth;

}

float GetFocalLength(float focusRange, float focalDistance)
{
	return 1.0 / (1.0 / (0.5 * focusRange * projectionMatrix[2][2]) + 1.0 / focalDistance);
}

float GetFocalAperture(float Fstop)
{
	float aperture = 1.0 / Fstop;
	return aperture;
}

void main() {

	float depth = readDepth(vUv);

	float D = depth;
	float P = focusDistance;
	float F = GetFocalLength(focusRange, focusDistance);
	float aspect = GetFocalAperture(1.8);
	float focalRegion = 3.0;

	P *= 0.001f;
	D *= 0.001f;
	F *= 0.001f;

	float CoC = aspect * F * (D - P) / (D * (P - F));
 	CoC = clamp(CoC, -2.0, 4.0);
 	CoC = pow(abs(CoC) / 4.0, focalRegion) * sign(CoC) * 4.0;

	gl_FragColor.rg = vec2(
		step(CoC, 0.0),
		step(0.0, CoC)
	);

}
