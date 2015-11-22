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

var box_a = null;
var box_b = null;
var reshuffle = true;
var shuffle_count = 10;
var game_stage = 0;


function init() {
	c = document.getElementById("myCanvas");
	io_init(c);
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
	var true_box = Math.round(Math.random() * 2);

	for (var n = 0; n < 3; n++) {
		var ent = new simp_ent(-0.59 + 0.6 * n, -0.6);
		ent.scale = 0.4;
		if (n == true_box) {ent.first_open = false;}
		else {ent.first_open = true;}
		ent.time_stamp = new Date().getSeconds();
		ent.show_blink = false;
		ent.frame = [
			[10, 2, 18],
			[11, 3, 18]
		];
		ent.target_point = {x: -0.59 + 0.6 * n, y: -0.6};
		ent.found_target = false;
		ent.state = 0;
		ent.render = function() {
			gl.bindTexture(gl.TEXTURE_2D, tex3);

			for (var nn = 0; nn < 3; nn++) {
				if ((this.show_blink && !this.first_open) || nn < 2) {
					var frame = get_xy(this.frame[this.state][nn], 8);
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
						this.y + (1 * this.scale) * nn,
						0.0,
					]));

					gl.bindBuffer(gl.ARRAY_BUFFER, vert_buff);
					gl.drawArrays(gl.TRIANGLE_FAN, 0, (vert.length / 3));
					gl.bindBuffer(gl.ARRAY_BUFFER, null);
				}
			}
		}
		ent.logic = function() {
			switch(game_stage){
				case 0:
					if (this.time_stamp != new Date().getSeconds()) {
						if (this.show_blink) {
							this.show_blink = false;
						}
						else {
							this.show_blink = true;
						}
						this.time_stamp = new Date().getSeconds();
					}
					break;

				case 1:
					this.show_blink = false;

					this.x += (this.target_point.x - this.x) / 6;

					if (this.target_point.x - this.x < 0.001) {
						this.found_target = true;
					}
					break;

				case 2:
					if (m.x < this.x + 0.5 * this.scale &&
						m.x > this.x - 0.5 * this.scale &&
						m.y < this.y + 0.75 * this.scale &&
						m.y > this.y - 0.5 * this.scale &&
						this.state == 0 && m.down) {
						this.state = 1;

						if (!this.first_open) {
							sfx = new Audio("ast/open_win.wav");
							sfx2 = new Audio("ast/open.wav");
							sfx.volume = 0.5;
							sfx2.volume = 0.2;
							sfx.play();
							sfx2.play();
						}
						else {
							sfx = new Audio("ast/open.wav");
							sfx.volume = 0.2;
							sfx.play();
						}
					}
					break;

				default:
					break;
			}

			if (this.state == 1 && !this.first_open) {
				for (var n = 0; n < 16; n++) {
					add_partical(this.x, this.y + 0.03);
				}
				this.first_open = true;
			}
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
	switch(game_stage){
		case 0:
			if (m.down) {
				game_stage = 1;
			}
			break;

		case 1:
			if (reshuffle) {
				reshuffle = false;
				shuffle_count -= 1;
				var box_sweep = find_boxs();
				box_a = box_sweep[Math.round(Math.random() * 2)];
				box_b = box_sweep[Math.round(Math.random() * 2)];
				
				while (box_a == box_b && box_a != null) {
					box_b = box_sweep[Math.round(Math.random() * 2)];
				}

				ent_stack[box_a].target_point.x = ent_stack[box_b].x;
				ent_stack[box_a].found_target = false;

				ent_stack[box_b].target_point.x = ent_stack[box_a].x;
				ent_stack[box_b].found_target = false;
			}

			if (ent_stack[box_a].found_target && ent_stack[box_b].found_target) {
				if (shuffle_count == 0) {
					game_stage = 2;
				}
				else {
					reshuffle = true;
				}
			}
			break;

		default:
			break;
	}

	

	for(var n = 0; n < ent_stack.length; n++) {
		ent_stack[n].logic();
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

	for (var n = 0; n < ent_stack.length; n++) {
		if (ent_stack[n].colour != null) {
			gl.uniform4fv(prog.col, new Float32Array(ent_stack[n].colour));
		}
		else {
			gl.uniform4fv(prog.col, new Float32Array([1.0, 1.0, 1.0, 1.0]));
		}

		ent_stack[n].render();
	}
}