#include <common>
#include <packing>

#ifdef GL_FRAGMENT_PRECISION_HIGH

	uniform highp sampler2D depthBuffer;
	uniform highp sampler2D inputBuffer;

#else

	uniform mediump sampler2D depthBuffer;
	uniform mediump sampler2D inputBuffer;

#endif

// [focalDistance, focalLength, focalAperture, 1]
varying vec4 focalCameraParams;
uniform vec2 texelSize;
uniform float mFocalRegion;

varying vec2 vUv;

float ComputeDepthCoC(float depth) {

	float D = depth;
	// focalDistance
	float P = focalCameraParams.x;
	// focalLength
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

void main() {
	vec4 offset = texelSize.xyxy * vec4(-1.0, -1.0, 1.0, 1.0);

	vec2 coords[4];
	coords[0] = vUv + offset.xy;
	coords[1] = vUv + offset.zy;
	coords[2] = vUv + offset.xw;
	coords[3] = vUv + offset.zw;

	vec4 linearDepths;
	linearDepths.x = texture2D(depthBuffer, coords[0]).r;
	linearDepths.y = texture2D(depthBuffer, coords[1]).r;
	linearDepths.z = texture2D(depthBuffer, coords[2]).r;
	linearDepths.w = texture2D(depthBuffer, coords[3]).r;

	vec3 colors[4];
	colors[0] = texture2D(inputBuffer, coords[0]).rgb;
	colors[1] = texture2D(inputBuffer, coords[1]).rgb;
	colors[2] = texture2D(inputBuffer, coords[2]).rgb;
	colors[3] = texture2D(inputBuffer, coords[3]).rgb;

	// anti-flicker
	vec4 weights = vec4(0.0);
 	weights.x = 1.0 / (max3(colors[0]) + 1.0);
 	weights.y = 1.0 / (max3(colors[1]) + 1.0);
 	weights.z = 1.0 / (max3(colors[2]) + 1.0);
 	weights.w = 1.0 / (max3(colors[3]) + 1.0);

	vec4 color = vec4(0.0);
	color.rgb += colors[0] * weights.x;
	color.rgb += colors[1] * weights.y;
	color.rgb += colors[2] * weights.z;
	color.rgb += colors[3] * weights.w;
	color.rgb /= dot(weights, vec4(1.0));

	vec4 CoC;
	CoC.x = ComputeDepthCoC(linearDepths.x);
	CoC.y = ComputeDepthCoC(linearDepths.y);
	CoC.z = ComputeDepthCoC(linearDepths.z);
	CoC.w = ComputeDepthCoC(linearDepths.w);

	color.a = CoC.x;
	if(abs(color.a) < CoC.y) color.a = CoC.y;
	if(abs(color.a) < CoC.z) color.a = CoC.z;
	if(abs(color.a) < CoC.w) color.a = CoC.w;
	if(color.a > 0.0) color.a = dot(vec4(0.25), max(vec4(0.0), CoC));

	gl_FragColor = min(color, vec4(65535, 65535, 65535, 65535));
}

