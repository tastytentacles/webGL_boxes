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

var char_data = {
	w: 0.078125,
	h: 0.078125
}

var box_a = null;
var box_b = null;
var reshuffle = true;
var shuffle_count = 10;
var game_stage = 0;
var time_stamp = new Date().getSeconds();

var posible_wisppers = [
	[
		"oh look you found a statue",
		"of the deep god! it whipp-",
		"ers fun things like:"
	],
	[
		"statue:",
		"  -set fire to the weak",
		"  -it will make you strong"
	],
	[
		"statue:",
		"  -come join my flesh! i",
		"-can drown you in pleasure"
	],
	[
		"statue:",
		"  -where do you keep your",
		"  -snails"
	],
	[
		"statue:",
		"  -your eyes remind me",
		"  -how cold and dead i am"
	],
	[
		"statue:",
		"  -give me a second of",
		"  -your time"
	],
	[
		"statue:",
		"  -police police police",
		"  -police police police"
	],
	[
		"statue:",
		"  -feed me dolls eyes and",
		"  -gum drops"
	],
	[
		"statue:",
		"  -when you touch me i can",
		"  -see right into your hart"
	],
	[
		"statue:",
		"  -take deeply of my sweat",
		"  -nectar"
	],
	[
		"statue:",
		"  -find the box of childr-",
		"  -ens bones"
	],
	[
		"statue:",
		"  -aaaaaaay",
		"  -macarena"
	],
	[
		"statue:",
		"  -doot doot ima spook",
		""
	]
];

function init() {
	c = document.getElementById("myCanvas");
	io_init(c);
	var wgl = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	for (var n = 0; n < wgl.length; ++n) {
		try { gl = c.getContext(wgl[n], { antialias: false }); }
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

	stack_inti();

	render_loop();
}

function logic_loop() {
	for(var n = 0; n < ent_stack.length; n++) {
		ent_stack[n].logic();
	}

	switch(game_stage){
		case 0:
			if (m.down && time_stamp != new Date().getSeconds()) {
				time_stamp = new Date().getSeconds();
				game_stage = 3;
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

		case 4:
			if (m.click && time_stamp != new Date().getSeconds()) {
				time_stamp = new Date().getSeconds();
				console.log("dave");
				flush_stack();
				game_stage = 0;
			}
			break;

		default:
			break;
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

	c.width = window.innerWidth;
	c.height = window.innerHeight;

	var c_dat = [c.width, c.height];
	if (c_dat[0] < c_dat[1]) {
		gl.viewport(0, (c_dat[1] - c_dat[0]) / 2, c_dat[0], c_dat[0]);
	} else {
		gl.viewport((c_dat[0] - c_dat[1]) / 2, 0, c_dat[1], c_dat[1]);
	}

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

function stack_inti() {
	var true_box = Math.round(Math.random() * 2);
	reshuffle = true;

	for (var n = 0; n < 3; n++) {
		new_box(n);
	}
	new_textbox();

	add_tile([
		1, 1, 1, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 1, 1,
		1, 1, 34, 1, 1, 1, 1, 1,
		1, 1, 42, 1, 1, 32, 33, 1,
		1, 1, 50, 1, 1, 40, 41, 1,
		0, 0, 0, 0, 0, 0, 0, 0,
		9, 9, 9, 9, 9, 9, 9, 9,
		9, 9, 9, 9, 9, 9, 9, 9
	], 0.2);

	add_tile([
		4, 5, 20, 21, 22, 23, 6, 7,
		12, 13, 28, 29, 30, 31, 14, 15,
		16, 16, 16, 16, 16, 16, 16, 16,
		16, 16, 16, 16, 16, 16, 16, 16,
		16, 16, 16, 16, 16, 16, 16, 16,
		16, 16, 16, 16, 16, 16, 16, 16,
		16, 16, 16, 16, 16, 16, 16, 16,
		16, 16, 16, 16, 16, 16, 16, 16
	], 0.1);
}