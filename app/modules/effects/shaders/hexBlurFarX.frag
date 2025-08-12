precision highp float;
precision highp int;

//----  Step 1 - Combined Vertical & Diagonal Blur
uniform mediump sampler2D inputBuffer;

layout(location = 0) out vec4 vertical;
layout(location = 1) out vec4 diagonal;
//--------------------------------

uniform lowp sampler2D cocBuffer;
uniform vec2 texelSize;

in vec2 vUv;

#define PI 3.1415926535897932384626433832795
#define DOF_BLUR_RADIUS 10

vec4 ComputeHexagonalFarBlur(in sampler2D source, vec2 coord, vec2 offset)
{
	vec4 colors = vec4(0.0f);

	for (int i = 0; i < DOF_BLUR_RADIUS; ++i, coord += offset)
	{
		vec4 color = texture(source, coord);
		color.a = max(0.0, color.a);
		color.rgb *= color.a;

		colors += color;
	}

	return min(vec4(65535, 65535, 65535, 65535), colors / (colors.a + 1e-5));
}

void main() {

	float coc = texture(inputBuffer, vUv).a;
	vec2 step = texelSize * coc;
	
	//----  Step 1 - Combined Vertical & Diagonal Blur
	vec2 blur1 = vec2(cos(PI/2.0), sin(PI/2.0));
	vec2 blur2 = vec2(cos(-PI/6.0), sin(-PI/6.0));
	//--------------------------------

	vec2 blurDirection1 = step * blur1;
	vec2 blurDirection2 = step * blur2;

	vec2 coord1 = vUv + blurDirection1 * 0.5;
	vec2 coord2 = vUv + blurDirection2 * 0.5;

	//----  Step 1 - Combined Vertical & Diagonal Blur
	vec4 color0 = ComputeHexagonalFarBlur(inputBuffer, coord1, blurDirection1);
	vec4 color1 = ComputeHexagonalFarBlur(inputBuffer, coord2, blurDirection2);

	vertical = vec4(color0.rgb, coc);
	diagonal = vec4(color0.rgb + color1.rgb, coc);
	//--------------------------------


}
