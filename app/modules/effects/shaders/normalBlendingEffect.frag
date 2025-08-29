varying vec2 vUv;

uniform mediump sampler2D baseMap;
uniform mediump sampler2D detailMap;

void main() {

	vec3 t = texture2D(baseMap, vUv).xyz * vec3(2, 2, 2) + vec3(-1, -1, 0);

	vec3 u = texture2D(detailMap, vUv).xyz * vec3(-2, -2, 2) + vec3(1, 1, -1);

	gl_FragColor.rgb = (normalize(t * dot(t, u) - u * t.z) + 1.0) / 2.0;
	gl_FragColor.a = 1.0;
}