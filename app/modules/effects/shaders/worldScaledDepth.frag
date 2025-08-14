varying vec4 vPos;

void main() {
	gl_FragColor.rg = vec2(vPos.w, 0.0);
}
