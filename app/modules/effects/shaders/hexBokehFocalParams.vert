varying vec2 vUv;
varying vec4 focalCameraParams;
uniform float mFocalLength
uniform float mFstop
uniform sampler2D autoFocusBuffer;

void main() {

	float focalDistance = texture2D(autoFocusBuffer, vec4(0.5,0.5, 0, 0)).r;
	float focalLength = GetFocalLength(mFocalLength, focalDistance);
	float focalAperture = GetFocalAperture(mFstop);
	focalCameraParams = vec4(focalDistance, focalLength, focalAperture, 1);
	
	vUv = position.xy * 0.5 + 0.5;
	gl_Position = vec4(position.xy, 1.0, 1.0);

}