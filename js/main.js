window.onload = function () {
    var vm = new ViewModel();
    ko.applyBindings(vm);

    var mapman = new MapViewer(vm);
    mapman.init();

    var pieman = new PieViewer(vm);
    pieman.init();

    var timeman = new TimelineViewer(vm);
    timeman.init();

    var waitman = new WaitViewer(vm);
    waitman.init();

    vm.doSearch();
}

var show_info_windows = true;
var show_help_windows = true;

var bubble_sizes_multiplier = 1.0;

var bubbles_same_size = false;
var bubbles_color_intensity = false;

var opacity_provinces = 0;
var opacity_counties = 0;
var opacity_locations = 0.65;
var opacity_collectors = 0.65;
var opacity_creators = 0.65;
var opacity_ne_locations = 0.65;

var show_provinces = false;
var show_counties = false;
var show_locations = true;
var show_collectors = true;
var show_creators = true;
var show_ne_locations = false;

var show_collectors_locations = false;
var show_collectors_creators = false;

var cloud_view = false;

var location_proxy = 'data_proxy.php?l&q='
var creator_proxy = 'data_proxy.php?c&q='
var collector_proxy = 'data_proxy.php?o&q='
var ne_location_proxy = 'data_proxy.php?ne&q='

var facet_proxy = 'data_proxy.php?f&q='

var show_facets = ["subgenre", "type", "language", "tags", "collector", "creator", "subject", "literary", "extreme", "text_length_group"]
var facet_addition = "&facet=true&facet.mincount=1&wt=json&rows=0&facet.field=" + show_facets.join("&facet.field=")

var province_coordinate_data = "http://geodata.nationaalgeoregister.nl/bestuurlijkegrenzen/wfs?service=WFS&version=2.0.0&request=GetFeature&outputformat=json&typename=provincies"
var county_coordinate_data = "http://geodata.nationaalgeoregister.nl/bestuurlijkegrenzen/wfs?service=WFS&version=2.0.0&request=GetFeature&outputformat=json&typename=gemeentes"

var waiting = true;

//var initial_location_query = "*:*";
var initial_location_query = "subgenre:sprookje";
var initial_creator_query = "*:*";
var initial_collector_query = "*:*";
var initial_ne_location_query = "*:*";
var initial_facet_query = initial_location_query;

var search_query = location_proxy + initial_location_query;

function ViewModel() {
    
    var self = this;
    
    self.waiting = ko.observable(waiting);
    
    self.show_help_windows = ko.observable(show_help_windows);
    self.show_info_windows = ko.observable(show_info_windows);
    self.bubble_size = ko.observable(bubble_sizes_multiplier);
    
    self.bubbles_same_size = ko.observable(bubbles_same_size);
    self.bubbles_color_intensity = ko.observable(bubbles_color_intensity);
    
    self.opacity_locations = ko.observable(opacity_locations);
    self.opacity_provinces = ko.observable(opacity_provinces);
    self.opacity_counties = ko.observable(opacity_counties);
    self.opacity_collectors = ko.observable(opacity_collectors);
    self.opacity_creators = ko.observable(opacity_creators);
    self.opacity_ne_locations = ko.observable(opacity_ne_locations);

    //checkboxes for showing objects
    self.show_provinces = ko.observable(show_provinces);
    self.show_counties = ko.observable(show_counties);
    self.show_locations = ko.observable(show_locations);
    self.show_collectors = ko.observable(show_collectors);
    self.show_creators = ko.observable(show_creators);
    self.show_ne_locations = ko.observable(show_ne_locations);
        
    //lines / connections
    self.show_collectors_locations = ko.observable(show_collectors_locations);
    self.show_collectors_creators = ko.observable(show_collectors_creators);
    
    self.cloud_view = ko.observable(cloud_view);
    
    self.show_facets = ko.observableArray(show_facets);
    
    //observable arrays for containing search/browse results
    self.facets_results = ko.observableArray([]);
    self.location_results = ko.observableArray([]);
    self.creator_results = ko.observableArray([]);
    self.collector_results = ko.observableArray([]);
    self.ne_location_results = ko.observableArray([]);

    //keeping track of selected objects
    self.selected_location = ko.observableArray([]);
    self.selected_province = ko.observableArray([]);
    self.selected_county = ko.observableArray([]);
    self.selected_collector = ko.observableArray([]);
    self.selected_creator = ko.observableArray([]);
    self.selected_ne_location = ko.observableArray([]);
    
    self.location_query = ko.observable(initial_location_query);
    self.creator_query = ko.observable(initial_creator_query);
    self.collector_query = ko.observable(initial_collector_query);
    self.facet_query = ko.observable(initial_facet_query);
    self.ne_location_query = ko.observable(initial_ne_location_query);
    
    self.current_query = ko.observable("");
    
    self.doFacetRetrieve = function(){
        self.location_query = proxy + self.initial_facet_query();
    }
    
    //helpsearches
    self.hs1 = function (hq) {
        self.location_query($("#hs1").val());
        self.doSearch();
    }
    self.hs2 = function (hq) {
        self.location_query($("#hs2").val());
        self.doSearch();
    }
    self.hs3 = function (hq) {
        self.location_query($("#hs3").val());
        self.doSearch();
    }
    self.hs4 = function (hq) {
        self.location_query($("#hs4").val());
        self.doSearch();
    }
    self.hs5 = function (hq) {
        self.location_query($("#hs5").val());
        self.doSearch();
    }
    self.hs6 = function (hq) {
        self.location_query($("#hs6").val());
        self.doSearch();
    }
    self.hs7 = function (hq) {
        self.location_query($("#hs7").val());
        self.doSearch();
    }
    self.hs8 = function (hq) {
        self.location_query($("#hs8").val());
        self.doSearch();
    }
    self.hs9 = function (hq) {
        self.location_query($("#hs9").val());
        self.doSearch();
    }
    self.hs10 = function (hq) {
        self.location_query($("#hs10").val());
        self.doSearch();
    }
    self.hs11 = function (hq) {
        self.location_query($("#hs11").val());
        self.doSearch();
    }
    self.hs12 = function (hq) {
        self.location_query($("#hs12").val());
        self.doSearch();
    }

    self.doSearch = function () {
        if (self.location_query() == ""){
            self.location_query("*:*");
        }
        if (self.show_locations()){
            setTimeout(function(){ //easy now!
                UpdateLocationData(location_proxy + self.location_query(), self);
            },10);
        }
        if (self.show_collectors){
            setTimeout(function(){
                UpdateCollectorData(collector_proxy + self.collector_query(), self);
            },20);
        }
        if (self.show_creators){
            setTimeout(function(){
                UpdateCreatorData(creator_proxy + self.creator_query(), self);
            },30);
        }
        if (self.show_ne_locations){ //the future comes soon
            setTimeout(function(){
                UpdateNELocationData(ne_location_proxy + self.ne_location_query(), self);
            },40);
        }
//        UpdateLocationData(location_proxy + self.location_query(), self);
        UpdateFacetData(facet_proxy + self.location_query() + facet_addition, self);
    }

    self.emptySearchbox = function(){
        self.location_query("*:*");
    }

    self.addSearch = function (added_search) {
        self.location_query(self.location_query() + added_search);
        self.doSearch();
    }

    self.searchKeyboardCmd = function (data, event) {
        if (event.keyCode == 13) self.doSearch();
        return true;
    };
};

function d3_format_facets(raw_facets){
    var formatted_facets = {}
    for(var index in raw_facets) { 
        var attr = raw_facets[index];
        var list = {};
        for (var val in raw_facets[index]){
            if (typeof attr[val] == "string"){
                list[attr[val]] = attr[parseInt(val) + 1];
            }
        }
        formatted_facets[index] = d3.entries(list);
    }
    return d3.entries(formatted_facets);
}

function UpdateFacetData(facet_query, vm){
//    console.log(facet_query);
    $.getJSON(facet_query, function(response) {
//        var this_facets_results = vm.facets_results;
        formatted_response = d3_format_facets(response.facet_counts.facet_fields);
        vm.facets_results(formatted_response);
        vm.facets_results.valueHasMutated();
    });
}


function UpdateNELocationData(ne_location_query, vm){
    console.log("NE LOCATION:" + ne_location_query);
    vm.waiting(true);
    vm.waiting.valueHasMutated();
    $.getJSON(ne_location_query, function(response) {
//        var jq_results = vm.location_results;
        nested_results = d3.nest()
            .key(function(d) { return [d.latitude, d.longitude]; })
            .entries(response.response.docs);
        vm.ne_location_results(nested_results);
        vm.ne_location_results.valueHasMutated();
        vm.waiting(false);
        vm.waiting.valueHasMutated();
    });
}

function UpdateLocationData(location_query, vm){
//    console.log("LOCATION:" + location_query);
    vm.waiting(true);
    vm.waiting.valueHasMutated();
    $.getJSON(location_query, function(response) {
//        var jq_results = vm.location_results;
        nested_results = d3.nest()
            .key(function(d) { return [d.latitude, d.longitude]; })
            .entries(response.response.docs);
        vm.location_results(nested_results);
        vm.location_results.valueHasMutated();
        vm.waiting(false);
        vm.waiting.valueHasMutated();
    });
}

function UpdateCreatorData(creator_query, vm){
    console.log("CREATORS:" + creator_query);
    $.getJSON(creator_query, function(response) {
//        var jq_results = vm.creator_results;
        nested_results = d3.nest()
            .key(function(d) { return [d.latitude, d.longitude]; })
            .entries(response.response.docs);
        vm.creator_results(nested_results);
        vm.creator_results.valueHasMutated();
    });
}


function UpdateCollectorData(collector_query, vm){
//    console.log("COLLECTOTS:" + collector_query);
    $.getJSON(collector_query, function(response) {
//        var jq_results = vm.creator_results;
        nested_results = d3.nest()
            .key(function(d) { return [d.latitude, d.longitude]; })
            .entries(response.response.docs);
        vm.collector_results(nested_results);
        vm.collector_results.valueHasMutated();
    });
}