#include <common>
#include <packing>

uniform highp sampler2D depthBuffer;
uniform highp sampler2D bokehBuffer;
uniform highp sampler2D inputBuffer;

varying vec2 vUv;
uniform vec2 offset;

// [focalDistance, focalLength, focalAperture, 1]
uniform vec4 focalCameraParams;
uniform vec2 viewportSize;

#define mFocalRegion 4.0;
#define mTestMode 1.0;

#define DOF_POSSION_SAMPLES 36

float ComputeDepthCoC(float depth) {

	float D = depth;
	// focalDistance
	float P = focalCameraParams.x;
	// focalLength
	float F = focalCameraParams.y;
	// focalAperture
	float aspect = focalCameraParams.z;

	P *= 0.001f;
	D *= 0.001f;
	F *= 0.001f;

	float CoC = aspect * F * (D - P) / (D * (P - F));
 	CoC = clamp(CoC, -2.0, 4.0);
 	CoC = pow(abs(CoC) / 4.0) * sign(CoC) * 4.0;

	return CoC;

}

float GetSampleCircleSDF(vec2 uv, vec2 pos, float radius)
{
	float d = length(pos - uv);
	float d1 = d - radius;
	float d2 = d - radius * 0.85;
	return saturate(saturate(d2) - saturate(d1));
}

// mMeasureMode=0.25 -> 為跟隨骨骼平面X偏移值，否則為0.5(正中間)
vec2 GetSamplePoint()
{
	vec4 proj = mul(vec4(bonePos, 1), projectionMatrix * viewMatrix);
	proj /= proj.w;
	proj.xy = proj.xy * vec2(0.5, -0.5) + vec2(0.5, 0.5);
	return 0.5 + vec2(proj.x - 0.5, 0.0) * step(0.25, mMeasureMode);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
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

	vec4 CoC = texture2D(bokehBuffer, vec4(vUv, 0, 0));
	vec4 colors = vec4(texture2D(inputBuffer, vec4(vUv, 0, 0)).rgb, 1);


	offset *= (saturate(-CoC.a) * 2 + 1);

	for(int i = 0; i < DOF_POSSION_SAMPLES; i++)
	{
		vec4 color = texture2D(inputBuffer, vec4(vUv + poisson[i] * offset, 0, 0));
		colors += color;
	}

	CoC.a = ComputeDepthCoC(texture2D(depthBuffer, vec4(coord.zw, 0, 0)).r);

	float SDF = GetSampleCircleSDF(vUv * viewportSize, viewportSize * GetSamplePoint(), viewportSize.y * 0.2) * 0.5;

	colors.rgb /= float(DOF_POSSION_SAMPLES + 1);
	colors.rgb = mix(colors.rgb, ((CoC.a > 0) ? vec3(0,0.05,0.1) : vec3(0.1,0.05,0)) * abs(CoC.a), mTestMode);
	colors.rgb = mix(colors.rgb, vec3(0.01, 0.4, 0.09), SDF * mTestMode * (1 - step(0.5, mMeasureMode)));
	colors.a = mix(saturate(pow2(CoC.a * 2)), 1, mTestMode);

	outputColor = colors;
}

