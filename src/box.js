function new_box(n, true_box) {
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
	ent.vel = 0.0;
	ent.ol = false;
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
				if (!this.ol) {
					this.ol = false;
				}

				if (m.x < this.x + 0.5 * this.scale &&
					m.x > this.x - 0.5 * this.scale &&
					m.y < this.y + 0.75 * this.scale &&
					m.y > this.y - 0.5 * this.scale) {
					if (!this.ol) {
						this.ol = true;
						this.vel += 0.03;
					}
				}
				else {
					this.ol = false;
				}

				this.vel += -0.005;
				if (this.y + this.vel < -0.61) {
					this.vel += -this.vel;
				}
				this.y += this.vel;

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

						game_stage = 3;
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
				add_partical(this.x, this.y + -0.5);
			}
			this.first_open = true;
		}
	}
	ent_stack.push(ent);
}