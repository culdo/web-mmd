#include <common>
#include <packing>

#ifdef GL_FRAGMENT_PRECISION_HIGH

	uniform highp sampler2D depthBuffer;
	uniform highp sampler2D inputBuffer;

#else

	uniform mediump sampler2D depthBuffer;
	uniform mediump sampler2D inputBuffer;

#endif

#define DOF_POSSION_SAMPLES 36

uniform vec2 viewportAspect;
uniform vec3 bonePos;
varying vec2 vUv;

// bonePos: 骨骼位置
// mMeasureMode: 当数值在0.0是使用自动测距，数值在0.25时可以跟随骨骼并且自动测距，数值0.5时使用固定的焦长，数值1.0时使用相机到骨骼的距离
#define mMeasureMode 0.0
#define mFocalDistance 1.0

// mMeasureMode=1.0 -> 使用相机到骨骼的距离，mMeasureMode=0.5 -> 时使用固定的焦长mFocalDistance
float GetFocalDistance()
{
	float focalDistance = mFocalDistance + (distance(cameraPosition, bonePos) - 1.0) * step(0.99, mMeasureMode);
	return max(1.0, focalDistance);
}

// mMeasureMode=0.25 -> 為跟隨骨骼平面X偏移值，否則為0.5(正中間)
vec2 GetSamplePoint()
{
	vec4 proj = mul(vec4(bonePos, 1.0), projectionMatrix * viewMatrix);
	proj /= proj.w;
	proj.xy = proj.xy * vec2(0.5, -0.5) + vec2(0.5, 0.5);
	return 0.5 + vec2(proj.x - 0.5, 0.0) * step(0.25, mMeasureMode);
}

void main() {
	vec2 poisson[DOF_POSSION_SAMPLES] =
	{
		vec2(-1.0,  0.0), vec2(-2.0,  0.0), vec2(-3.0,  0.0), vec2(3.0,  0.0), vec2(2.0,  0.0), vec2(1.0,  0.0),
		vec2(-1.0, -1.0), vec2(-2.0, -1.0),	vec2(-3.0, -1.0), vec2(0.0, -1.0), vec2(3.0, -1.0), vec2(2.0, -1.0), vec2(1.0, -1.0),
		vec2(-1.0,  1.0), vec2(-2.0,  1.0), vec2(-3.0,  1.0), vec2(0.0,  1.0), vec2(3.0,  1.0), vec2(2.0,  1.0), vec2(1.0,  1.0),
		vec2(-2.0,  2.0), vec2(-1.0,  2.0), vec2( 0.0,  2.0), vec2(1.0,  2.0), vec2(2.0,  2.0),
		vec2(-2.0, -2.0), vec2(-1.0, -2.0), vec2( 0.0, -2.0), vec2(1.0, -2.0), vec2(2.0, -2.0),
		vec2(-1.0,  3.0), vec2( 0.0,  3.0), vec2( 1.0,  3.0),
		vec2(-1.0, -3.0), vec2( 0.0, -3.0), vec2( 1.0, -3.0),
	};

	vec2 sampleRadius = 0.2 / vec2(viewportAspect * 3.0, 3.0);
	vec2 samplePoint = GetSamplePoint();

	float minDepth = 65535;

	for (int i = 0; i < DOF_POSSION_SAMPLES; i++)
	{
		float depth = texture2D(depthBuffer, vec4(samplePoint + poisson[i] * sampleRadius, 0, 0)).r;
		minDepth = min(minDepth, depth);
	}

	vec2 avgDepth = 0;

	for (int j = 0; j < DOF_POSSION_SAMPLES; j++)
	{
		float depth = texture2D(depthBuffer, vec4(samplePoint + poisson[j] * sampleRadius, 0, 0)).r;
		avgDepth += vec2(depth, 1.0) * exp2(-abs(depth - minDepth));
	}

	float distance = avgDepth.x / avgDepth.y;
	return mix(distance + mFocalDistance - 1.0, GetFocalDistance(), step(0.5, mMeasureMode));
}

