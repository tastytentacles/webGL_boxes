var m = {
	x: 0.0,
	y: 0.0,
	down: false
};

// var mouse_mem = false;

function io_init(c_) {
	c_.addEventListener('mousemove', function(evt) {
		if (c.width < c.height) {
			m.x = evt.clientX / (c.width / 2) - 1;
			m.y = 1 - (evt.clientY - (c.height - c.width) / 2) / (c.width / 2);
		} else {
			m.x = (evt.clientX - (c.width - c.height) / 2) / (c.height / 2) - 1;
			m.y = 1 - evt.clientY / (c.height / 2);
		}
	});

	c_.addEventListener('mousedown', function(evt) { m.down = true; });
	c_.addEventListener('mouseup', function(evt) { m.down = false; });
}