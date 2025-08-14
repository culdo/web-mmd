varying vec4 vPos;

void main() {

	vPos = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	gl_Position = vPos;

}