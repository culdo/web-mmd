#include <common>
#include <packing>

#ifdef GL_FRAGMENT_PRECISION_HIGH

	uniform highp sampler2D bokehBuffer;
	uniform highp sampler2D inputBuffer;

#else

	uniform mediump sampler2D bokehBuffer;
	uniform mediump sampler2D inputBuffer;

#endif

varying vec2 vUv;


void main() {
	vec4 samp1 = texture2D(bokehBuffer, vUv);
	vec4 samp2 = texture2D(inputBuffer, vUv);

	vec4 color;
	color.rgb = mix(samp1.rgb, samp2.rgb, pow(saturate(samp1.a * 2.0), 2.0));
	color.a = samp1.a;

	gl_FragColor = color;
}

