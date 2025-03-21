#include <common>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>

varying vec4 vPos;

void main() {

	#include <skinbase_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>

	vPos = mvPosition;
	#include <clipping_planes_vertex>
	
}