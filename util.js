function simp_ent(_x, _y) {
	this.x = _x;
	this.y = _y;

	this.scale = 0.1;

	this.tick = 0;
	this.logic = function() {};
	this.render = function() {};
}

function find_boxs() {
	var box_stack = [];
	for (var n = 0; n < ent_stack.length; n++) {
		if (ent_stack[n].first_open != null) {
			box_stack.push(n);
		}
	}
	return box_stack;
}

function gen_bright_rgb() {
	var rgb = [
		Math.random(),
		Math.random(),
		Math.random(),
		1.0
	];

	while (rgb[0] + rgb[1] + rgb[2] < 1.5) {
		for (var n = 0; n < 3; n++) {
			if (rgb[n] >= 0.5) {
				rgb[n] -= Math.random();
				if (rgb[n] < 0) {
					rgb[n] = 0;
				}
			}

			if (rgb[n] < 0.5) {
				rgb[n] += Math.random();
				if (rgb[n] > 1) {
					rgb[n] = 1;
				}
			}
		}
	}

	return rgb;
}

function get_xy(index, width) {
	var n = {x: 0, y: 0};
	n.y = Math.floor(index / width);
	n.x = index - n.y * width;
	return n;
}

function new_img(texture, src){
	var img = new Image();
	img.onload = function() {image_init(img, texture)};
	img.src = src;
}

function image_init(image, texture) {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		image
	);
	gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

function check_distence(p1, p2) {
	return Math.sqrt(Math.pow(2, p1.x - p2.x) + (2, p1.y - p2.y));
}

function grep_shader(gl, id) {
	var shad_raw = document.getElementById(id);
	var shad_pass = "";
	var k = shad_raw.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			shad_pass += k.textContent;
		}
		k = k.nextSibling;
	}

	var shad_shad = null;
	if (shad_raw.type == "x-shader/x-vertex")
		{ shad_shad = gl.createShader(gl.VERTEX_SHADER); }
	else if (shad_raw.type == "x-shader/x-fragment")
		{ shad_shad = gl.createShader(gl.FRAGMENT_SHADER); }
	else { alert("w/e you just put in me it was not a shader"); }

	gl.shaderSource(shad_shad, shad_pass);
	gl.compileShader(shad_shad);

	if (!gl.getShaderParameter(shad_shad, gl.COMPILE_STATUS))
		{ alert(gl.getShaderInfoLog(shad_shad)); }

	return shad_shad;
}

function flush_stack() {
	ent_stack = [];
	stack_inti();
}