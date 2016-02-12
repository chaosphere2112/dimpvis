function scatterplot(container, data, xattr, yattr) {
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	timetick = 100,
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

	var interval = null;

	var svg = container.append("svg");

	if (xattr === undefined) {
		xattr = "x";
	}
	if (yattr === undefined) {
		yattr = "y";
	}

	/*
	<button id="playpause">Play</button>
	<input id="time_slide" type="range" value="0" min="0" step="1" />
	*/

	var time_length = data.reduce(function(previousValue, currentValue) {
		if (previousValue === null) {
			return currentValue.length;
		} else {
			return previousValue > currentValue.length ? currentValue.length : previousValue;
		}
	}, null);

	function update() {
		dots.transition().delay(timetick / 2)
		.attr("cx", function(d) { return x_scale(d[get_time()].x)})
		.attr('cy', function(d) { return y_scale(d[get_time()].y)});
	}

	var playpause = container.append("button")
			 .attr("class", "playpause")
			 .text("Play")
			 .on("click", function(){
			 	var playing = interval != null;
				if (playing) {
					playpause.text("Play");
					clearInterval(interval);
					interval = null;
				} else {
					playpause.text("Pause");
					interval = setInterval(step_time, timetick);
				}
			});
	
	container.append("input")
			.attr("class", "time_slide")
			.attr('type', "range")
			.attr("value", "0")
			.attr("min", "0")
			.attr("step", "1")
			.attr("max", "" + time_length);
	
	var slider = null, node = null;
	var parent_el = container[0][0];
	for (var ind = 0; ind < parent_el.children.length; ind++) {
		node = parent_el.children[ind]
		for (var i = 0; i < node.classList.length; i++) {
			if (node.classList[i] === "time_slide") {
				slider = node;
			}
		}
	}
	slider.oninput = function(){
		update()
	};

	function get_time() {
		return slider.valueAsNumber;
	}
	function set_time(t) {
		slider.valueAsNumber = t % times;
	}
	function step_time() {
		set_time(get_time() + 1);
		update();
	}


	// Flatten the timeseries for extent determination
	var flat_data = data.reduce(function(previousValue, currentValue) {
		return previousValue.concat(currentValue);
	}, []);

	var x_scale = d3.scale.linear()
						  .range([0, width])
						  .domain(d3.extent(flat_data, function(d) { return d[xattr]; }))
						  .nice();

	var y_scale = d3.scale.linear()
						  .range([height, 0])
						  .domain(d3.extent(flat_data, function(d) { return d[yattr]; }))
						  .nice();

	var x_axis = d3.svg.axis().scale(x_scale).orient("bottom");
	var y_axis = d3.svg.axis().scale(y_scale).orient("left");

	// Prep the SVG
	svg = svg.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(x_axis);
	svg.append("g")
		.attr("class", "y axis")
		.call(y_axis);

	var dots = svg.selectAll(".scatter-dot")
					.data(points)
					.enter().append("circle")
					.attr("class", "scatter-dot")
					.attr("r", 3.5)
					.attr("cx", function(d) { return x_scale(d[get_time()][xattr])})
					.attr('cy', function(d) { return y_scale(d[get_time()][yattr])});

}