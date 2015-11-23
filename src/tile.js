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