function TimelineViewer(vm){
    this.init = function(){
        console.log("timeline viewer init");
        vm.location_results.subscribe( function (){
            console.log("timeline data updated");
//            console.log(vm.location_results());
            d3.selectAll("#timeWindow").selectAll("svg").remove(); // resetting the information screen
//            vm.location_results().forEach(function(d){
//            console.log(d);
            drawTimeline( "Verhalen timeline", vm.location_results(), "#timeWindow", "", 10, 800, 200, vm);
//                drawTimeline(d.key, d.value, "#pie_chart_2 .chart", colors, 10, 100, 20, 1, vm);
//            });
        });
    }
}


function drawTimeline(timelineName, in_data, selectString, colors, margin, widthOrg, heightOrg, vm){
    
    var format_date_classic = d3.time.format("%Y-%m-%d");
    //console.log(format_date(new Date(2011, 0, 1))); // returns a string

    var margin = {top: 10, right: 10, bottom: 70, left: 40},
        margin2 = {top: heightOrg-50, right: 10, bottom: 20, left: 40},
        width = widthOrg - margin.left - margin.right,
        height = heightOrg - margin.top - margin.bottom,
        height2 = heightOrg - margin2.top - margin2.bottom;

    var parseDate = [d3.time.format("%Y-%m-%d %Y-%m-%d").parse,
                    d3.time.format("%Y-%m-%d").parse,
                    d3.time.format("%b %Y").parse];

    //var parseDate = d3.time.format("%Y-%m-%d").parse
    //var parseDate = d3.time.format("%b %Y").parse;

//    console.log(data)
    
    dates = all_dates(in_data);
    //assign counts to unique dates
    counts = counts(dates);
    //prepare for d3 ingestion
    data = d3.entries(counts);
    //parse dates to fit scale
    data.forEach(function(d) { d.key = parseThisDate(d.key); }, this);
    //order datums by time
    data = data.sort(function(a, b) { return a.key - b.key; });
    
//    console.log(data)

    var x = d3.time.scale().range([0, width]), //upper timeline
        x2 = d3.time.scale().range([0, width]), //lower timeline
        y = d3.scale.sqrt().range([height, 0]),
        y2 = d3.scale.pow().exponent(.2).range([height2, 0]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom"),
        xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
        yAxis = d3.svg.axis().scale(y).orient("left");

//    var zoom = d3.behavior.zoom()
//        .x(x)
//        .on("zoom", zoomed);

    var detail_brush = d3.svg.brush()
        .x(x)
        .on("brush", brushmove)
        .on("brushend", brushend);
//        .on("brush", detail_brushed);

    var brush = d3.svg.brush()
        .x(x2)
        .on("brush", brushed);

    var area = d3.svg.area()
        .interpolate("step-after") //shape of the curve!
        .x(function(d) { return x(d.key); })
        .y0(height)
        .y1(function(d) { return y(d.value*1.5); });

    var area2 = d3.svg.area()
        .interpolate("step-after") //shape of the curve!
        .x(function(d) { return x2(d.key); })
        .y0(height2)
        .y1(function(d) { return y2(d.value); });

//    var svg = d3.select("body").append("svg")
    var svg = d3.select(selectString)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
//        .call(zoom);

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    var title = svg.append("text") //add a title to the circle's center
        .attr("x", 56)
        .attr("y", 24)
        .style("font-size", "16px") 
        .style("font-weight", "bold")
        .text(timelineName);

    //extract the dates
    x.domain(d3.extent(data.map(function(d) { return d.key; })));
    y.domain([0, d3.max(data.map(function(d) { return d.value; }))]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    focus.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area);

    focus.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    focus.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    focus.append("g")
        .attr("class", "x brush")
        .call(detail_brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", height + 7);

    context.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area2);

    context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

    context.append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll("rect")
      .attr("y", -6)
      .attr("height", height2 + 7);

    function brushed() {
        console.log(brush.extent());
        x.domain(brush.empty() ? x2.domain() : brush.extent());
        focus.select(".area").attr("d", area);
        focus.select(".x.axis").call(xAxis);
    }
    
    function brushmove() {
    }

    function brushend() {
        x.domain(detail_brush.empty() ? x2.domain() : detail_brush.extent());
        focus.select(".area")
            .transition()
            .duration(1000)
            .attr("d", area);
        focus.select(".x.axis").call(xAxis);
        focus.call(detail_brush.clear());
        detail_brush.clear();
    }

    function detail_brushed() {
//        console.log(detail_brush.extent());
        x.domain(detail_brush.empty() ? x2.domain() : detail_brush.extent());
        focus.select(".area").attr("d", area);
        focus.select(".x.axis").call(xAxis);
    }

    function type(d) {
      d.key = parseThisDate(d.key);
      d.value = +d.value;
      return d;
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