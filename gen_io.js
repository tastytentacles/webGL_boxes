var m = {
	x: 0.0,
	y: 0.0,
	down: false
};

function io_init(c_) {
	c_.addEventListener('mousemove', function(evt) {
		m.x = evt.clientX / 256 - 1;
		m.y = 1 - evt.clientY / 256;
	});

	c_.addEventListener('mousedown', function(evt) {m.down = true;});
	c_.addEventListener('mouseup', function(evt) {m.down = false;});
}