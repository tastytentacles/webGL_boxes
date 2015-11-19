attribute vec3 vec;

uniform vec3 pos;
uniform float scale;

void main(void) {
	gl_Position = vec4(vec * scale + pos, 1.0);
}