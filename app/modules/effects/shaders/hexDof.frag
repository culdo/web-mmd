uniform highp sampler2D wDepthBuffer;
uniform highp sampler2D bokehBuffer;

uniform vec2 offset;

// [focalDistance, focalLength, focalAperture, 1]
varying vec4 focalCameraParams;
uniform vec2 viewportSize;
uniform float mFocalRegion;
uniform float mMeasureMode;
uniform float mTestMode;

#define DOF_POSSION_SAMPLES 36

float ComputeDepthCoC(float depth) {

	float D = depth;
	// focalDistance
	float P = focalCameraParams.x;
	// focalLength by magic normalization
	float F = 1.0 / (1.0 / focalCameraParams.y + 1.0 / P);
	// focalAperture
	float aspect = focalCameraParams.z;

	P *= 0.001f;
	D *= 0.001f;
	F *= 0.001f;

	float CoC = aspect * F * (D - P) / (D * (P - F));
 	CoC = clamp(CoC, -2.0, 4.0);
 	CoC = pow(abs(CoC) / 4.0, mFocalRegion) * sign(CoC) * 4.0;

	return CoC;

}

float GetSampleCircleSDF(vec2 uv, vec2 pos, float radius)
{
	float d = length(pos - uv);
	float d1 = d - radius;
	float d2 = d - radius * 0.85;
	return saturate(saturate(d2) - saturate(d1));
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
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

	vec4 CoC = texture2D(bokehBuffer, uv);
	vec4 colors = vec4(texture2D(inputBuffer, uv).rgb, 1.0);

	vec2 calcedOffset = (saturate(-CoC.a) * 2.0 + 1.0) * offset;

	for(int i = 0; i < DOF_POSSION_SAMPLES; i++)
	{
		vec4 color = texture2D(inputBuffer, uv + poisson[i] * calcedOffset);
		colors += color;
	}

	CoC.a = ComputeDepthCoC(texture2D(wDepthBuffer, uv).r);

	float SDF = GetSampleCircleSDF(uv * viewportSize, viewportSize * vec2(0.5, 0.5), viewportSize.y * 0.2) * 0.5;

	colors.rgb /= float(DOF_POSSION_SAMPLES + 1);
	colors.rgb = mix(colors.rgb, ((CoC.a > 0.0) ? vec3(0,0.05,0.1) : vec3(0.1,0.05,0)) * abs(CoC.a), mTestMode);
	colors.rgb = mix(colors.rgb, vec3(0.01, 0.4, 0.09), SDF * mTestMode * (1.0 - step(0.5, mMeasureMode)));
	colors.a = mix(saturate(pow2(CoC.a * 2.0)), 1.0, mTestMode);

	outputColor = colors;
}

