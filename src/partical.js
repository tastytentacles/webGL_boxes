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