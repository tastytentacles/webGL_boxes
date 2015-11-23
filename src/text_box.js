function new_textbox() {
	var text_box = new simp_ent(-0.9, -4);
	text_box.text = 0;
	text_box.book_tiles = [39, 47, 55, 63];
	text_box.scale = 0.07;
	text_box.book_scale = 0.50;
	text_box.button_bool = true;
	text_box.time_stamp = new Date().getSeconds();
	text_box.colour = gen_bright_rgb();
	text_box.render = function() {
		gl.uniform4fv(prog.col, new Float32Array([1.0, 1.0, 1.0, 1.0]));
		for (var n = 0; n < 4; n++) {
			var tile = get_xy(this.book_tiles[n], 8);
			tile.x *= tile_data.w;
			tile.y *= tile_data.h;

			var temp_cords_c = [
				tile.x + tile_data.w, tile.y,
				tile.x, tile.y,
				tile.x, tile.y + tile_data.h,
				tile.x + tile_data.w, tile.y + tile_data.h
			];

			gl.bindBuffer(gl.ARRAY_BUFFER, tex_cord_buff);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(temp_cords_c), gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);

			gl.uniform1f(prog.scale, this.book_scale);

			gl.uniform3fv(prog.pos, new Float32Array([
				this.x + (1 * this.book_scale) * n + 0.15,
				this.y,
				-0.1
			]));

			gl.bindBuffer(gl.ARRAY_BUFFER, vert_buff);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, (vert.length / 3));
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
		}

		if (this.button_bool) {
			var b_tile = get_xy(19, 8);
		} else {
			var b_tile = get_xy(27, 8);
		}

		if (this.time_stamp != new Date().getSeconds()) {
			this.time_stamp = new Date().getSeconds();
			if (this.button_bool) { this.button_bool = false; }
			else { this.button_bool = true; }
		}

		b_tile.x *= tile_data.w;
		b_tile.y *= tile_data.h;

		var b_temp_cords = [
			b_tile.x + tile_data.w, b_tile.y,
			b_tile.x, b_tile.y,
			b_tile.x, b_tile.y + tile_data.h,
			b_tile.x + tile_data.w, b_tile.y + tile_data.h
		];

		gl.bindBuffer(gl.ARRAY_BUFFER, tex_cord_buff);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(b_temp_cords), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.uniform1f(prog.scale, 0.5);

		gl.uniform3fv(prog.pos, new Float32Array([
			this.x + 1.7,
			this.y + 0.29,
			-0.2
		]));

		gl.bindBuffer(gl.ARRAY_BUFFER, vert_buff);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, (vert.length / 3));
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		for (var an = 0; an < posible_wisppers[this.text].length; an++) {
			for (var n = 0; n < posible_wisppers[this.text][an].length; n++) {
				this.colour = [
					Math.random(),
					Math.random(),
					Math.random(),
					1.0
				];
				gl.uniform4fv(prog.col, new Float32Array(this.colour));

				var cc = posible_wisppers[this.text][an].charCodeAt(n) - 97;
				var tile = null;
				
				switch(cc) {
					case -39:
						tile = get_xy(28, 6);
						break;

					case -52:
						tile = get_xy(29, 6);
						break;

					case -64:
						tile = get_xy(27, 6);
						break;

					case -65:
						tile = get_xy(30, 6);
						break;

					default:
						tile = get_xy(cc, 6);
						break;
				}

				tile.x *= char_data.w;
				tile.x += 3 * 0.125;
				tile.y *= char_data.h;
				tile.y += 4 * 0.125;

				var temp_cords = [
					tile.x + char_data.w, tile.y,
					tile.x, tile.y,
					tile.x, tile.y + char_data.h,
					tile.x + char_data.w, tile.y + char_data.h
				];

				gl.bindBuffer(gl.ARRAY_BUFFER, tex_cord_buff);
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(temp_cords), gl.STATIC_DRAW);
				gl.bindBuffer(gl.ARRAY_BUFFER, null);

				gl.uniform1f(prog.scale, this.scale);

				gl.uniform3fv(prog.pos, new Float32Array([
					this.x + (1 * this.scale) * n + 0.02,
					this.y + (1.5 * this.scale) * -an + 0.042,
					-0.5
				]));

				gl.bindBuffer(gl.ARRAY_BUFFER, vert_buff);
				gl.drawArrays(gl.TRIANGLE_FAN, 0, (vert.length / 3));
				gl.bindBuffer(gl.ARRAY_BUFFER, null);
			}
		}
	}
	text_box.logic = function() {
		switch(game_stage) {
			case 3:
				this.y += (-0.75 - this.y) / 10;
				
				if (m.down && -0.75 - this.y < 0.01) {
					time_stamp = new Date().getSeconds();
					var subswap = posible_wisppers.length - 2;
					this.text = Math.round(Math.random() * subswap) + 1;
					game_stage = 4;
				}
				break;

			default:
				break;
		}
	}
	ent_stack.push(text_box);
}