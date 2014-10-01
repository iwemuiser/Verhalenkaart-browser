<?php

    include("config.php");

    function rebuild_query($get) { 
        $query = "";
        $and = "";
        foreach ($get as $key => $value){
            $query = $query . $and . $key . "=" . $value;
            $and = "&";
        }
        return $query; 
    }
    
    function replace_spaces_and_cancellations($url){
        return str_replace("\\", "", str_replace(" ","%20",$url));
    }
    
    $total_query = "";
    
    if (array_key_exists('q', $_GET)) {
        if (array_key_exists('ne', $_GET)) { //NE location
            $collection = "collectionid:201";
            $pre_query = replace_spaces_and_cancellations($_GET["q"] . " AND " . $collection);
            $return_fields = "fl=title,country,administrative_area_level_1,administrative_area_level_2,locality,longitude,latitude,id,identifier";
            $settings = "wt=json&rows=1000000";
            $total_query = $config['query_location'] . "?q=" . $pre_query . "&" . $return_fields . "&" . $settings;
//            print $total_query;
        }
        if (array_key_exists('l', $_GET)) { //location
            $collection = "collectionid:1";
            $pre_query = replace_spaces_and_cancellations($_GET["q"] . " AND " . $collection);
            $return_fields = "fl=title,country,administrative_area_level_1,administrative_area_level_2,locality,longitude,latitude,id,date,identifier";//",collectionid";
            $settings = "wt=json&rows=1000000";
            $total_query = $config['query_location'] . "?q=" . $pre_query . "&" . $return_fields . "&" . $settings;
        }
        else if (array_key_exists('c', $_GET)) { //creators (story tellers)
            $collection = "collectionid:4";
            $pre_query = replace_spaces_and_cancellations($_GET["q"] . " AND " . $collection);
            $return_fields = "fl=title,gender,administrative_area_level_1,administrative_area_level_2,locality,longitude,latitude,id,privacy_required";
            $settings = "wt=json&rows=1000000"; //ident=true off for faster results
            $total_query = $config['query_location'] . "?q=" . $pre_query . "&" . $return_fields . "&" . $settings;
        }
        else if (array_key_exists('o', $_GET)) { //collectors
            $collection = "collectionid:9";
            $pre_query = replace_spaces_and_cancellations($_GET["q"] . " AND " . $collection);
            $return_fields = "fl=title,gender,administrative_area_level_1,administrative_area_level_2,locality,longitude,latitude,id";
            $settings = "wt=json&rows=1000000"; //ident=true off for faster results
            $total_query = $config['query_location'] . "?q=" . $pre_query . "&" . $return_fields . "&" . $settings;
        }
        else if (array_key_exists('f', $_GET)) { //facets
            $total_query = $config['query_location'] . "?" . $_SERVER["QUERY_STRING"];
        }
    }

//    print $total_query . "<br>";
    
    $result = file_get_contents($total_query);
    
//    print "<pre>";
    print $result;
//    print "</pre>";
    
?>