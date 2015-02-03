function PieViewer(vm){

    colors = ["#E56717", "#E66C2C", "#F87217", "#F87431", "#E67451", "#FF8040", "#F88017", "#FF7F50", "#F88158", "#F9966B", "#E78A61", "#E18B6B", "#E77471", "#F75D59", "#E55451", "#E55B3C", "#FF0000", "#FF2400", "#F62217", "#F70D1A", "#F62817", "#E42217", "#E41B17", "#DC381F", "#C34A2C", "#C24641", "#C04000", "#C11B17", "#9F000F", "#990012", "#8C001A", "#954535", "#7E3517", "#8A4117", "#7E3817", "#800517"];

    function shuffle(o){ //v1.0
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

    this.init = function(){
//        console.log("pieviewer init");
        colors = shuffle(colors);
        vm.facets_results.subscribe( function (){
            d3.selectAll("#pie_chart_2").selectAll("svg").remove(); // resetting the information screen
            vm.facets_results().forEach(function(d){
                drawPie(d.key, d.value, "#pie_chart_2 .chart", colors, 10, 100, 20, 1, vm);
            });
        });
    }
}


function drawPie( pieName, dataSet, selectString, colors, margin, outerRadius, innerRadius, sortArcs, vm ) {

    // pieName => A unique drawing identifier that has no spaces, no "." and no "#" characters.
    // dataSet => Input Data for the chart, itself.
    // selectString => String that allows you to pass in
    //           a D3 select string.
    // colors => String to set color scale.  Values can be...
    //           => "colorScale10"
    //           => "colorScale20"
    //           => "colorScale20b"
    //           => "colorScale20c"
    // margin => Integer margin offset value.
    // outerRadius => Integer outer radius value.
    // innerRadius => Integer inner radius value.
    // sortArcs => Controls sorting of Arcs by value.
    //              0 = No Sort.  Maintain original order.
    //              1 = Sort by arc value size.

    // Color Scale Handling...
    
    d3.selectAll(".term_tip").style("visibility", "hidden"); //term tips keep coming up
    
    //reverse sorting data to show sorted list of items in pie diagram
    dataSet.sort(function (a, b) {
        if (a.value > b.value)
            return -1;
        if (a.value < b.value)
            return 1;
        // a must be equal to b
        return 0;
    });
    
    var colorScale = d3.scale.category20c();
    switch (colors)
    {
      case "colorScale10":
        colorScale = d3.scale.category10();
        break;
      case "colorScale20":
        colorScale = d3.scale.category20();
        break;
      case "colorScale20b":
        colorScale = d3.scale.category20b();
        break;
      case "colorScale20c":
        colorScale = d3.scale.category20c();
        break;
      default:
        colorScale = d3.scale.category20c();
    };

    if (Object.prototype.toString.call( colors ) === '[object Array]'){
        var colorScale = d3.scale.ordinal().range(colors);
    }


    var minimum_percentage = 4;
    var canvasWidth = 600;
    var pieWidthTotal = outerRadius * 1.2;// * 2;
    var pieCenterX = outerRadius + margin/2;
    var pieCenterY = outerRadius + margin/2;
    var legendBulletOffset = 30;
    var legendVerticalOffset = outerRadius - margin;
    var legendTextOffset = 20;
    var textVerticalSpace = 14;

    var canvasHeight = 0;
    var pieDrivenHeight = outerRadius*2 + margin*2;
    var legendTextDrivenHeight = (10 * textVerticalSpace) + margin*2;
//    var legendTextDrivenHeight = (dataSet.length * textVerticalSpace) + margin*2;

    // Autoadjust Canvas Height
    if (pieDrivenHeight >= legendTextDrivenHeight){
        canvasHeight = pieDrivenHeight;
    }
    else{
        canvasHeight = legendTextDrivenHeight;
    }

    var x = d3.scale.linear().domain([0, d3.max(dataSet, function(d) { return d.value; })]).rangeRound([0, pieWidthTotal]);
    var y = d3.scale.linear().domain([0, dataSet.length]).range([0, (dataSet.length * 20)]);

    var synchronizedMouseOver = function(d) {
        var arc = d3.select(this);
        var indexValue = arc.attr("index_value");

        d3.select("body").style("cursor", "pointer");

        var arcSelector = "." + "pie-" + pieName + "-arc-" + indexValue;
        var selectedArc = d3.selectAll(arcSelector);
        selectedArc.style("fill", "Maroon");

        var bulletSelector = "." + "pie-" + pieName + "-legendBullet-" + indexValue;
        var selectedLegendBullet = d3.selectAll(bulletSelector);
        selectedLegendBullet.style("fill", "Maroon");

        var textSelector = "." + "pie-" + pieName + "-legendText-" + indexValue;
        var selectedLegendText = d3.selectAll(textSelector);
        selectedLegendText.style("fill", "Maroon");
        
        termtip.style("visibility", "visible")
            .text(d.data.key);
        
    };

    var synchronizedMouseOut = function() {
        var arc = d3.select(this);
        var indexValue = arc.attr("index_value");

        d3.select("body").style("cursor", "default");

        var arcSelector = "." + "pie-" + pieName + "-arc-" + indexValue;
        var selectedArc = d3.selectAll(arcSelector);
        var colorValue = selectedArc.attr("color_value");
        selectedArc.style("fill", colorValue);

        var bulletSelector = "." + "pie-" + pieName + "-legendBullet-" + indexValue;
        var selectedLegendBullet = d3.selectAll(bulletSelector);
        var colorValue = selectedLegendBullet.attr("color_value");
        selectedLegendBullet.style("fill", colorValue);

        var textSelector = "." + "pie-" + pieName + "-legendText-" + indexValue;
        var selectedLegendText = d3.selectAll(textSelector);
        selectedLegendText.style("fill", "Blue");
        
        termtip.style("visibility", "hidden");
    };
    
    var moveTip = function(){
        termtip.style("top", (event.pageY-10)+"px")
                .style("left",(event.pageX+10)+"px");
    }

    var addToSearchQueryRaw = function(d) {
        vm.addSearch(" AND " + pieName + ':"' + d.key + '"');
    }


    var addToSearchQuery = function(d) {
//        console.log(pieName + " - ");
//        console.log(d);
//        console.log(vm);
        vm.addSearch(" AND " + pieName + ':"' + d.data.key + '"');
    }

    var tweenPie = function (b) {
        b.innerRadius = 0;
        var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
        return function(t) {
            return arc(i(t));
        };
    }

    // Create a drawing canvas...
    var canvas = d3.select(selectString)
        .append("svg:svg") //create the SVG element inside the <body>
        .data([dataSet]) //associate our data with the document
        .attr("width", canvasWidth) //set the width of the canvas
        .attr("height", canvasHeight) //set the height of the canvas
        .append("svg:g") //make a group to hold our pie chart
        .attr("transform", "translate(" + pieCenterX + "," + pieCenterY + ")") // Set center of pie

    var termtip = d3.select("body")
        .append("div")
        .attr("class", "term_tip")
        .style("position", "absolute")
        .style("background", "white")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("");

    // Define an arc generator. This will create <path> elements for using arc data.
    var arc = d3.svg.arc()
        .innerRadius(innerRadius) // Causes center of pie to be hollow
        .outerRadius(outerRadius);

    // Define a pie layout: the pie angle encodes the value of dataSet.
    // Since our data is in the form of a post-parsed CSV string, the
    // values are Strings which we coerce to Numbers.
    var pie = d3.layout.pie()
        .value(function(d) { return d.value; })
        .sort(function(a, b) {if (sortArcs==1) { return b.value - a.value; } else { return null; } });

    // Select all <g> elements with class slice (there aren't any yet)
    var arcs = canvas.selectAll("g.slice")
      // Associate the generated pie data (an array of arcs, each having startAngle,
      // endAngle and value properties) 
        .data(pie)
        // This will create <g> elements for every "extra" data element that should be associated
        // with a selection. The result is creating a <g> for every object in the data array
        // Create a group to hold each slice (we will have a <path> and a <text>      // element associated with each slice)
        .enter().append("svg:a")
//            .attr("xlink:href", function(d) { return d.data.link; })
        .append("svg:g")
        .attr("class", "slice")    //allow us to style things in the slices (like text)
        // Set the color for each slice to be chosen from the color function defined above
        // This creates the actual SVG path using the associated data (pie) with the arc drawing function
//        .style("stroke", "White" )
        .attr("d", arc);

    arcs.append("svg:path")
      // Set the color for each slice to be chosen from the color function defined above
      // This creates the actual SVG path using the associated data (pie) with the arc drawing function
      .attr("fill", function(d, i) { return colorScale(i); } )
      .attr("color_value", function(d, i) { return colorScale(i); }) // Bar fill color...
      .attr("index_value", function(d, i) { return "index-" + i; })
      .attr("class", function(d, i) { return "pie-" + pieName + "-arc-index-" + i; })
//      .style("stroke", "White" )
      .attr("d", arc)
      .on('click', addToSearchQuery)
      .on('mouseover', synchronizedMouseOver)
      .on("mouseout", synchronizedMouseOut)
      .on("mousemove", moveTip)
      .transition()
        .ease("bounce")
        .duration(1000)
        .delay(function(d, i) { return i * 50; })
        .attrTween("d", tweenPie);

    // Add a magnitude value to the larger arcs, translated to the arc centroid and rotated.
    arcs.filter(function(d) { return d.endAngle - d.startAngle > .2; }).append("svg:text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        //.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")"; })
        .attr("transform", function(d) { //set the label's origin to the center of the arc
        //we have to make sure to set these before calling arc.centroid
            d.outerRadius = outerRadius; // Set Outer Coordinate
            d.innerRadius = innerRadius; // Set Inner Coordinate
//            return "translate(0,0)"; //rotate(" + angle(d) + ")";
            return "translate(" + arc.centroid(d) + ")"; //rotate(" + angle(d) + ")";
        })
//        .transition()
//        .delay(200)
//        .duration(800)
        .style("fill", "White")
        .style("font", "normal 12px Arial")
        .text(function(d) { return d.data.value; });

    // Computes the angle of an arc, converting from radians to degrees.
    function angle(d) {
        var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
        return a > 90 ? a - 180 : a;
    }

    canvas.append("svg:text") //add a title to the circle's center
        .attr("x", 0)
        .attr("y", 6)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("font-weight", "bold")  
        .text(pieName);
//        .attr("transform", "rotate(10 20, 20)"); // Set center of pie;

    // Plot the bullet circles...
    var bullets = canvas.selectAll("circle")
      .data(dataSet)
      .enter().append("svg:circle") // Append circle elements
      .attr("cx", pieWidthTotal)// + legendBulletOffset)
      .attr("cy", function(d, i) { return i*textVerticalSpace - legendVerticalOffset; } )
      .attr("stroke-width", ".5")
      .style("fill", function(d, i) { return colorScale(i); }) // Bullet fill color
      .attr("r", 5)
      .attr("color_value", function(d, i) { return colorScale(i); }) // Bar fill color...
      .attr("index_value", function(d, i) { return "index-" + i; })
      .attr("class", function(d, i) { return "pie-" + pieName + "-legendBullet-index-" + i; })
      .on('click', addToSearchQueryRaw)
      .on('mouseover', synchronizedMouseOver)
      .on("mouseout", synchronizedMouseOut);

    // Create hyper linked text at right that acts as label key...
    canvas.selectAll("a.legend_link")
      .data(dataSet) // Instruct to bind dataSet to text elements
      .enter().append("svg:a") // Append legend elements
//            .attr("xlink:href", function(d) { return d.link; })
        .append("text")
          .attr("text-anchor", "center")
          .attr("x", pieWidthTotal + 3)// + legendBulletOffset + legendTextOffset)
          //.attr("y", function(d, i) { return legendOffset + i*20 - 10; })
      //.attr("cy", function(d, i) {    return i*textVerticalSpace - legendVerticalOffset; } )
          .attr("y", function(d, i) { return i*textVerticalSpace - legendVerticalOffset; } )
          .attr("dx", 4)
          .attr("dy", "4px") // Controls padding to place text in alignment with bullets
          .text(function(d) { return d.key;})
          .attr("color_value", function(d, i) { return colorScale(i); }) // Bar fill color...
          .attr("index_value", function(d, i) { return "index-" + i; })
          .attr("class", function(d, i) { return "pie-" + pieName + "-legendText-index-" + i; })
          .style("fill", "Blue")
          .style("font", "normal 0.8em Arial")
          .on('click', addToSearchQueryRaw)
          .on('mouseover', synchronizedMouseOver)
          .on("mouseout", synchronizedMouseOut);
  };