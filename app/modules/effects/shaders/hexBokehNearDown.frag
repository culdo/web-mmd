#include <common>
#include <packing>

#ifdef GL_FRAGMENT_PRECISION_HIGH
	uniform highp sampler2D inputBuffer;
#else
	uniform mediump sampler2D inputBuffer;
#endif

uniform vec2 offset;
varying vec2 vUv;


void main() {
	vec4 coords[4];
	coords[0] = vec4(vUv, 0, 0);
	coords[1] = vec4(vUv + vec2(1.0, 0.0) * offset, 0, 0);
	coords[2] = vec4(vUv + vec2(0.0, 1.0) * offset, 0, 0);
	coords[3] = vec4(vUv + vec2(1.0, 1.0) * offset, 0, 0);

	vec4 colors[4];
	colors[0] = texture2D(inputBuffer, coords[0]);
	colors[1] = texture2D(inputBuffer, coords[1]);
	colors[2] = texture2D(inputBuffer, coords[2]);
	colors[3] = texture2D(inputBuffer, coords[3]);

	vec4 CoC = vec4(colors[0].w, colors[1].w, colors[2].w, colors[3].w);

	vec4 color = 0;
	color.rgb += colors[0].rgb * abs(CoC.x);
	color.rgb += colors[1].rgb * abs(CoC.y);
	color.rgb += colors[2].rgb * abs(CoC.z);
	color.rgb += colors[3].rgb * abs(CoC.w);
	color.rgb /= dot(abs(CoC), 1.0f);

	color.a = CoC.x;
	if(abs(color.a) > CoC.y) color.a = CoC.y;
	if(abs(color.a) > CoC.z) color.a = CoC.z;
	if(abs(color.a) > CoC.w) color.a = CoC.w;
	if(color.a > 0)	color.a = dot(0.25f, max(0, CoC));

	return min(color, vec4(65535, 65535, 65535, 65535));
}

