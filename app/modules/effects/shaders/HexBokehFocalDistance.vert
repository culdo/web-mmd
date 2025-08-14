uniform vec3 bonePos;
varying vec2 vUv;
varying vec2 samplePoint;
varying float focalDistance;

vec2 GetSamplePoint()
{
	vec4 proj = projectionMatrix * viewMatrix * vec4(bonePos, 1.0);
	proj /= proj.w;
	proj.xy = proj.xy * vec2(0.5, -0.5) + vec2(0.5, 0.5);
	return 0.5 + vec2(proj.x - 0.5, 0.0) * step(0.25, mMeasureMode);
}

// mMeasureMode=1.0 -> 使用相机到骨骼的距离，mMeasureMode=0.5 -> 时使用固定的焦长mFocalDistance
float GetFocalDistance()
{
	float focalDistance = mFocalDistance + (distance(cameraPosition, bonePos) - 1.0) * step(0.99, mMeasureMode);
	return max(1.0, focalDistance);
}

void main() {
	vUv = position.xy * 0.5 + 0.5;
	samplePoint = GetSamplePoint();
	focalDistance = GetFocalDistance();

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
