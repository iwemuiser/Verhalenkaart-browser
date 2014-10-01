function TimelineViewer(vm){
    this.init = function(){
        vm.location_results.subscribe( function (){
//            console.log("timeline data updated");
            d3.selectAll("#timeWindow").selectAll("svg").remove(); // resetting the information screen
            drawTimeline( "Verhalen timeline", vm.location_results(), "#timeWindow", "", 800, 200, vm);
        });
    }
}


function drawTimeline(timelineName, in_data, selectString, colors, widthOrg, heightOrg, vm){
    
    var format_date_classic = d3.time.format("%Y-%m-%d");
    //console.log(format_date(new Date(2011, 0, 1))); // returns a string

    var top_graph_percentage = 0.75;
    var between_space = 20;
    
    var main_margin = {top: 0, bottom: 0, right: 60, left: 10};
    var main_height = heightOrg - main_margin.top - main_margin.bottom;
    
    var top_height = main_height * top_graph_percentage; //height of upper
    var top_margin = {top: main_margin.top, bottom: top_height, right: main_margin.right, left: main_margin.left};
    
    var bottom_height = main_height * (1-top_graph_percentage) - between_space;
    var bottom_margin = {top: top_height + top_margin.top + between_space, bottom: main_margin.bottom, right: main_margin.right, left: main_margin.left};

    var main_width = widthOrg - main_margin.left - main_margin.right;
    
    var parseDate = [d3.time.format("%Y-%m-%d %Y-%m-%d").parse,
                    d3.time.format("%Y-%m-%d").parse,
                    d3.time.format("%b %Y").parse];

    //var parseDate = d3.time.format("%Y-%m-%d").parse
    //var parseDate = d3.time.format("%b %Y").parse;

//    console.log(data)
    var q = 0;
    
    dates = all_dates(in_data);
    //assign counts to unique dates
    counts = counts(dates);
    //prepare for d3 ingestion
    data = d3.entries(counts);
    //parse dates to fit scale
    data.forEach(function(d) { d.key = parseThisDate(d.key); }, this);
    //order datums by time
    data = data.sort(function(a, b) { return a.key - b.key; });
    //addition of data to make rising line
    data.forEach(function(d) { 
        q = q + d.value;
        d.value = q; }, this);
//    console.log(data)

    var x = d3.time.scale().range([0, main_width]), //upper timeline
        x2 = d3.time.scale().range([0, main_width]), //lower timeline
//        y = d3.scale.sqrt().range([height, 0]), //upper timeline
        y = d3.scale.pow().range([top_height, 40]), //upper timeline
        scaley = d3.scale.pow().range([top_height, 0]), //upper timeline
        y2 = d3.scale.pow().range([bottom_height, 0]); //lower timeline

    var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");
    var xAxis2 = d3.svg.axis()
                    .scale(x2);
    var yAxis = d3.svg.axis()
                    .scale(y)
                    .tickSize(main_width)
                    .ticks(7)
                    .orient("right");

//    var zoom = d3.behavior.zoom()
//        .x(x)
//        .on("zoom", zoomed);

    var detail_brush = d3.svg.brush()
        .x(x)
        .on("brush", brushmove);
//        .on("brushend", brushend);
//        .on("brush", detail_brushed);

    var brush = d3.svg.brush()
        .x(x2)
        .on("brush", brushed);

    var top_area = d3.svg.area()
        .interpolate("step-after") //shape of the curve!
        .x(function(d) { return x(d.key); })
        .y0(top_height)
        .y1(function(d) { return y(d.value); });

    var bottom_area = d3.svg.area()
        .interpolate("step-after") //shape of the curve!
        .x(function(d) { return x2(d.key); })
        .y0(bottom_height)
        .y1(function(d) { return y2(d.value); });

//    var svg = d3.select("body").append("svg")
    var svg = d3.select(selectString)
        .append("svg")
        .attr("width", widthOrg)
        .attr("height", heightOrg);
//        .call(zoom);

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", main_width)
        .attr("height", main_height);

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + top_margin.left + "," + top_margin.top + ")");

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + bottom_margin.left + "," + bottom_margin.top + ")");

    var title = svg.append("text") //add a title to the circle's center
        .attr("x", 10)
        .attr("y", 24)
        .style("font-size", "16px") 
        .style("font-weight", "bold")
        .style("position","relative")
        .text(timelineName);

    //extract the dates
    x.domain(d3.extent(data.map(function(d) { return d.key; })));
    y.domain([0, d3.max(data.map(function(d) { return d.value; }))]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    focus.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + top_height + ")")
      .call(xAxis);

    focus.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    focus.selectAll("g").filter(function(d) { return d; })
        .classed("minor", true);

    focus.selectAll("text")
        .attr("x", 4);

    focus.append("g")
        .attr("class", "x brush")
//        .call(detail_brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", top_height + 7);

    context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + bottom_height + ")")
      .call(xAxis2);

    context.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", bottom_area);

    context.append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll("rect")
      .attr("y", -6)
      .attr("height", bottom_height + 7);

      focus.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", top_area);


    function brushed() {
//        console.log(brush.extent());
        x.domain(brush.empty() ? x2.domain() : brush.extent());
        focus.select(".area").attr("d", top_area);
        focus.select(".x.axis").call(xAxis);
    }
    
    function brushmove() {
    }

    function brushend() {
        x.domain(detail_brush.empty() ? x2.domain() : detail_brush.extent());
        focus.select(".area")
            .transition()
            .duration(1000)
            .attr("d", top_area);
        focus.select(".x.axis").call(xAxis);
        focus.call(detail_brush.clear());
        detail_brush.clear();
    }

    function detail_brushed() {
//        console.log(detail_brush.extent());
        x.domain(detail_brush.empty() ? x2.domain() : detail_brush.extent());
        focus.select(".area").attr("d", top_area);
        focus.select(".x.axis").call(xAxis);
    }

    function parseThisDate(date){
        for (var i = 0; i < parseDate.length; i++) {
            var item_date = parseDate[i](date);
            if (item_date){
                return item_date;
            }
        }
    }

    function all_dates(data_in){
        var all_dates = new Array();
        var re = /^\d\d\d\d-\d\d-\d\d/;
//        console.log(data_in);
        data_in.forEach(function(d){
//            console.log(d);
            d.values.forEach(function(item){
                if (item.date){
                    var date = re.exec(item.date);
                    if (date){
                        all_dates.push(date[0]);
                    }
                }
            })
        })
        return all_dates;
    }

    function counts(dates){
        var counts = {};
        for (var i = 0; i < dates.length; i++) {
            counts[dates[i]] = 1 + (counts[dates[i]] || 0);
        }
        return counts;
    }
}