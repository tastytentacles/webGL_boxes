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

function add_tile(_data, _z) {
	var tile_sheet = new simp_ent(0, 0);
	tile_sheet.scale = 0.25;
	tile_sheet.data = _data;
	tile_sheet.z = _z;
	tile_sheet.render = function() {
		gl.bindTexture(gl.TEXTURE_2D, tex3);

		for (var n = 0; n < tile_sheet.data.length; n++) {
			var tile = get_xy(n, 8);
			var subtile = get_xy(this.data[n], 8);
			subtile.x *= tile_data.w;
			subtile.y *= tile_data.h;

			var temp_cords = [
				subtile.x + tile_data.w, subtile.y,
				subtile.x, subtile.y,
				subtile.x, subtile.y + tile_data.h,
				subtile.x + tile_data.w, subtile.y + tile_data.h
			];

			gl.bindBuffer(gl.ARRAY_BUFFER, tex_cord_buff);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(temp_cords), gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);

			gl.uniform1f(prog.scale, this.scale);

			gl.uniform3fv(prog.pos, new Float32Array([
				tile.x * this.scale - 3.5 * this.scale,
				-tile.y * this.scale + 3.5 * this.scale,
				this.z,
			]));

			gl.bindBuffer(gl.ARRAY_BUFFER, vert_buff);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, (vert.length / 3));
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
		}
	}
	ent_stack.push(tile_sheet);
}

function add_partical(_x, _y) {
	var confet = new simp_ent(
		_x + Math.random() * 0.2 - 0.1, 
		_y + Math.random() * 0.5
	);
	confet.scale = 0.4;
	confet.frame = [24, 25, 26];
	confet.state = 0;
	confet.speed = {
		x: Math.random() * 0.04 - 0.02,
		y: Math.random() * 0.08 + 0.02
	};
	confet.colour = gen_bright_rgb();
	confet.time_stamp = Math.round(Math.random() * 2);
	confet.render = function() {
		gl.bindTexture(gl.TEXTURE_2D, tex3);

		var frame = get_xy(this.frame[this.state], 8);
		frame.x *= tile_data.w;
		frame.y *= tile_data.h;

		var temp_cords = [
			frame.x + tile_data.w, frame.y,
			frame.x, frame.y,
			frame.x, frame.y + tile_data.h,
			frame.x + tile_data.w, frame.y + tile_data.h
		];

		gl.bindBuffer(gl.ARRAY_BUFFER, tex_cord_buff);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(temp_cords), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.uniform1f(prog.scale, this.scale);

		gl.uniform3fv(prog.pos, new Float32Array([
			this.x,
			this.y,
			0.0,
		]));

		gl.bindBuffer(gl.ARRAY_BUFFER, vert_buff);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, (vert.length / 3));
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	confet.logic = function() {
		if (this.time_stamp != new Date().getSeconds()) {
			this.time_stamp = new Date().getSeconds();
			this.state = Math.round(Math.random() * 2);
		}

		if (this.y > -2) {
			this.speed.y -= 0.002;
			this.y += this.speed.y;
			this.x += this.speed.x;
		}
		else {
			var i = ent_stack.indexOf(this);
			ent_stack.splice(i, 1);
		}
	}
	ent_stack.push(confet);
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