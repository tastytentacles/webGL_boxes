var screen_buff = [];
var prog = null;
var gl = null;
var c = null;

var planet_stack = [];
var ent_stack = [];

var vert_buff = null;
var vert = [
	0.5, 0.5, 0.0,
	-0.5, 0.5, 0.0,
	-0.5, -0.5, 0.0,
	0.5, -0.5, 0.0
];

var tex_cord_buff = null;
var tex_cords = [
	1.0, 0.0,
	0.0, 0.0,
	0.0, 1.0,
	1.0, 1.0
];

var tex = null;
var tex2 = null;
var tex3 = null;

var tile_data = {
	w: 0.125,
	h: 0.125
};

function init() {
	c = document.getElementById("myCanvas");
	var wgl = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	for (var n = 0; n < wgl.length; ++n) {
		try { gl = c.getContext(wgl[n]); }
		catch (e) {}
		if (gl) { break; }
	}

	if (gl == null)
		{ alert("dead webGL; RIP"); }


	var vs = grep_shader(gl, "shader-vs");
	var fs = grep_shader(gl, "shader-fs");
	prog = gl.createProgram();
	gl.attachShader(prog, vs);
	gl.attachShader(prog, fs);
	gl.linkProgram(prog);
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
		{ alert("Shader died, RIP Shader"); }
	gl.useProgram(prog);

	prog.vec = gl.getAttribLocation(prog, "vec");
	gl.enableVertexAttribArray(prog.vec);
	prog.tex_cords = gl.getAttribLocation(prog, "tex_cords");
	gl.enableVertexAttribArray(prog.tex_cords);

	prog.tex0 = gl.getUniformLocation(prog, "tex0");
	gl.uniform1i(prog.tex0, 0);

	vert_buff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vert_buff);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vert), gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(prog.vec, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	tex_cord_buff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, tex_cord_buff);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tex_cords), gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(prog.tex_cords, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	prog.pos = gl.getUniformLocation(prog, "pos");
	prog.scale = gl.getUniformLocation(prog, "scale");

	prog.col = gl.getUniformLocation(prog, "col");

	tex = gl.createTexture();
	new_img(tex, "/ast/check.png");

	tex2 = gl.createTexture();
	new_img(tex2, "/ast/wall.png");	

	tex3 = gl.createTexture();
	new_img(tex3, "/ast/tile.gif");	

	//enable alpha blending
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	//engable back face culling
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);

	//enable depth test
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	// game logic bits
	for (var n = 0; n < 3; n++) {
		ent = new simp_ent(-0.5 + 0.5 * n, -0.4);
		ent.scale = 0.4
		ent.render = function() {
			gl.bindTexture(gl.TEXTURE_2D, tex);

			gl.bindBuffer(gl.ARRAY_BUFFER, tex_cord_buff);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tex_cords), gl.STATIC_DRAW);
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
		ent_stack.push(ent);
	}

	var wall = new simp_ent(0, 0);
	wall.scale = 0.25;
	wall.data = [
		1, 1, 1, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 1, 1,
		0, 0, 0, 0, 0, 0, 0, 0,
		9, 9, 9, 9, 9, 9, 9, 9,
		9, 9, 9, 9, 9, 9, 9, 9
	];
	wall.render = function() {
		gl.bindTexture(gl.TEXTURE_2D, tex3);

		for (var n = 0; n < wall.data.length; n++) {
			var tile = get_xy(n, 8);
			var subtile = get_xy(this.data[n], 8);
			subtile.x *= tile_data.w;
			subtile.y *= tile_data.h;

			console.log(tile);

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
				0.1,
			]));

			gl.bindBuffer(gl.ARRAY_BUFFER, vert_buff);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, (vert.length / 3));
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
		}
	}
	ent_stack.push(wall);
	// game logic bits

	render_loop();
}

function logic_loop() {
	for(var n = 0; n < ent_stack.length; n++) {

	}
}

function render_loop() {
	var rAniFrame = (
	function() {
		return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback, element) { window.setTimeout(callback, 1000/60); };
	}
	)();

	rAniFrame(render_loop);

	logic_loop();

	gl.clearDepth(1.0);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// gl.uniform4fv(prog.col, new Float32Array([
	// 	Math.random(),
	// 	Math.random(),
	// 	Math.random(),
	// 	1.0
	// ]));
	
	gl.uniform4fv(prog.col, new Float32Array([
		1.0, 1.0, 1.0, 1.0
	]));

	for (var n = 0; n < ent_stack.length; n++) {
		ent_stack[n].render();
	}
}