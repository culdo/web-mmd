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

varying vec2 vUv;
varying vec2 samplePoint;
varying float focalDistance;

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

	for (int i = 0; i < DOF_POSSION_SAMPLES; i++)
	{
		float depth = texture2D(depthBuffer, samplePoint + poisson[i] * sampleRadius).r;
		minDepth = min(minDepth, depth);
	}

	vec2 avgDepth = vec2(0);

	for (int j = 0; j < DOF_POSSION_SAMPLES; j++)
	{
		float depth = texture2D(depthBuffer, samplePoint + poisson[j] * sampleRadius).r;
		avgDepth += vec2(depth, 1.0) * exp2(-abs(depth - minDepth));
	}

	float distance = avgDepth.x / avgDepth.y;
	gl_FragColor.r = mix(distance + mFocalDistance - 1.0, focalDistance, step(0.5, mMeasureMode));
}

