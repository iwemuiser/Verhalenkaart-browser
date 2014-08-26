<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no"/>
    <script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=true&v=3.16"></script>
    <script type="text/javascript" src="js/knockout-3.1.0.js"></script>
    <script type="text/javascript" src="js/d3.v2.min.js"></script>
    <script type="text/javascript" src="js/jquery-1.11.1.min.js"></script>
    <script type="text/javascript" src="js/dynamic_pie_charts.js"></script>
    <script type="text/javascript" src="js/verhalen_timeline.js"></script>
    <script type="text/javascript" src="js/circle_click.js"></script>
    <script type="text/javascript" src="js/main.js"></script>
	<link rel="stylesheet" type="text/css" href="style/style.css" media="all"/>
    <script>
    $( document ).ready(function() {
        $("input[name=show_hide_stats]").on("change", function () {
            $(".viewer").toggle("explode");
        });
    });
    </script>
	<title>Nederlandse Volksverhalenkaart 2014</title>
  </head>
  <body>
    <div id="map"></div>
    <div class="toplayer controller" id="viewControl">
        <h4 id="view_control_titel">Object besturing</h4>
        <div id="viewControlInner">
            <form>
                <input type="checkbox" name="show_provinces" data-bind="checked: show_provinces" checked>
                Provincies <br>
                <input type="checkbox" name="show_counties" data-bind="checked: show_counties" checked>
                Gemeenten <br>
                <input type="checkbox" name="show_locations" data-bind="checked: show_locations" checked>
                <input type="range" name="opacity_locations" min="0" max="1" step="0.05" data-bind="value: opacity_locations">
                <svg height="10" width="10">
                  <circle cx="5" cy="5" r="4" stroke="black" stroke-width="1" fill="red" />
                </svg>
                Volksverhalen <br>
                <input type="checkbox" name="show_collectors" data-bind="checked: show_collectors">
                <input type="range" name="opacity_collectors" min="0" max="1" step="0.1" data-bind="value: opacity_collectors"> 
                <svg height="10" width="10">
                  <rect x="1" y="1" width="8" height="8" stroke="black" stroke-width="1" fill="blue" />
                </svg>
                Verzamelaars <br>
                <input type="checkbox" name="show_creators" data-bind="checked: show_creators">
                <input type="range" name="opacity_creators" min="0" max="1" step="0.05" data-bind="value: opacity_creators"> 
                <svg height="10" width="10">
                    <polygon fill="lime" stroke="green" stroke-width="1" 
                                points="4,0 8,8 0,8 4,0" />
                </svg>
                Vertellers <br>
            </form>
            <form>
                <input type="checkbox" name="lines">
                <svg height="10" width="20">
                  <line x1="0" y1="2" x2="20" y2="8" style="stroke:rgb(0,0,0);stroke-width:2" />
                </svg>
                Verzamelaars -> Verhalen<br>
                
                <input type="checkbox" name="lines">
                <svg height="10" width="20">
                  <line x1="0" y1="2" x2="20" y2="8" style="stroke:rgb(0,0,255);stroke-width:2" />
                </svg>
                Verzamelaars -> Vertellers<br>
            </form>
        </div>
        
        <div id="viewControlInner">
            <form>
                <input type="checkbox" name="show_info_windows" data-bind="checked: show_info_windows">Info<br>
                <input type="checkbox" name="bubbles_same_size" data-bind="checked: bubbles_same_size">Zelfde grootte<br>
                <input type="checkbox" name="bubbles_color_intensity" data-bind="checked: bubbles_color_intensity">Op kleur<br>
                <input type="checkbox" name="item_cloud">Cloud<br>
            </form>
        </div>
    </div>

    <div class="toplayer viewer" id="search_container_bg"></div>
    <div class="toplayer viewer" id="search_container">
        Q: <input id="searchBox" class="input-search" data-bind="value:location_query, valueUpdate: 'afterkeydown', event: { keypress: searchKeyboardCmd}" size="50"/>
        <center>
        <button class="search_button" data-bind="click:doSearch">Search</button>
        <button class="reset_button" data-bind="click:emptySearchbox">Reset</button>
        </center>
    </div>
        
    <div class="toplayer viewer" id="timeWindowBG"></div>
    <div class="toplayer viewer" id="timeWindow"></div>
    
    <div class="toplayer viewer" id="infoWindowBG"></div>
    <div class="toplayer viewer" id="infoWindow" style="overflow-y:scroll; overflow-x:hidden;">
        <img></img>
        <h4 id="statistieken_titel">Statistieken</h4>
        <div class="div_RootBody" id="pie_chart_2">
          <div class="chart"></div>
        </div>
    </div>
    
    <div class="toplayer viewer" id="waitWindow"><br><center>Please <br> wait..<center></div>
    
  </body>
</html>