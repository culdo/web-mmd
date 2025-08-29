#include <common>
#include <packing>

#ifdef GL_FRAGMENT_PRECISION_HIGH

	uniform highp sampler2D depthBuffer;
	uniform highp sampler2D inputBuffer;

#else

	uniform mediump sampler2D depthBuffer;
	uniform mediump sampler2D inputBuffer;

#endif

uniform float viewportAspect;

uniform float mFocalLength;
uniform float vFov;

uniform float mFocalDistance;
uniform float mMeasureMode;
uniform float mFstop;

float GetFocalLength(float focalDistance)
{
	return 1.0 / (1.0 / (0.5 * mFocalLength * vFov) + 1.0 / focalDistance);
}

// mMeasureMode=0.25 -> 為跟隨骨骼平面X偏移值，否則為0.5(正中間)
void main() {
	vec2 poisson[DOF_POSSION_SAMPLES] =
	vec2[](
		vec2(-1.0,  0.0), vec2(-2.0,  0.0), vec2(-3.0,  0.0), vec2(3.0,  0.0), vec2(2.0,  0.0), vec2(1.0,  0.0),
		vec2(-1.0, -1.0), vec2(-2.0, -1.0),	vec2(-3.0, -1.0), vec2(0.0, -1.0), vec2(3.0, -1.0), vec2(2.0, -1.0), vec2(1.0, -1.0),
		vec2(-1.0,  1.0), vec2(-2.0,  1.0), vec2(-3.0,  1.0), vec2(0.0,  1.0), vec2(3.0,  1.0), vec2(2.0,  1.0), vec2(1.0,  1.0),
		vec2(-2.0,  2.0), vec2(-1.0,  2.0), vec2( 0.0,  2.0), vec2(1.0,  2.0), vec2(2.0,  2.0),
		vec2(-2.0, -2.0), vec2(-1.0, -2.0), vec2( 0.0, -2.0), vec2(1.0, -2.0), vec2(2.0, -2.0),
		vec2(-1.0,  3.0), vec2( 0.0,  3.0), vec2( 1.0,  3.0),
		vec2(-1.0, -3.0), vec2( 0.0, -3.0), vec2( 1.0, -3.0)
	);

	vec2 sampleRadius = 0.2 / vec2(viewportAspect * 3.0, 3.0);

	float minDepth = 65535.0;

	// 先寫死，方便debug
	vec2 samplePoint = vec2(0.5);

	for (int i = 0; i < DOF_POSSION_SAMPLES; i++)
	{
		float depth = texture2D(depthBuffer, samplePoint + poisson[i] * sampleRadius).r;
		minDepth = min(minDepth, depth);
	}

	vec2 avgDepth = vec2(0.0);

	for (int i = 0; i < DOF_POSSION_SAMPLES; i++)
	{
		float depth = texture2D(depthBuffer, samplePoint + poisson[i] * sampleRadius).r;
		avgDepth += vec2(depth, 1.0) * exp2(-abs(depth - minDepth));
	}

	float distance = avgDepth.x / avgDepth.y;
	float focalDistance = mix(distance + mFocalDistance - 1.0, mFocalDistance, step(0.5, mMeasureMode));
	
	float focalLength = GetFocalLength(focalDistance);
	float focalAperture = 1.0 / mFstop;
	gl_FragColor.rgb = vec3(focalDistance, focalLength, focalAperture);

}

