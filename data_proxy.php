<?php

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
    
//    $id = (integer) $_GET['id'];
//localhost here
    $config['query_location'] = "http://127.0.0.1:8080/solr/collection2/select";
//    $example_query = "?q=*:*&amp;start=0&amp;rows=0&amp;sort=added+desc&amp;facet=true&amp;facet.sort=count&amp;facet.field=subgenre&amp;facet.field=type&amp;facet.field=language&amp;facet.field=item_type&amp;facet.field=locality&amp;wt=json";
    
    $total_query = "";
    
    if (array_key_exists('q', $_GET)) {
        if (array_key_exists('l', $_GET)) { //location
            $collection = "collectionid:1";
            $pre_query = replace_spaces_and_cancellations($_GET["q"] . " AND " . $collection);
            $return_fields = "fl=country,administrative_area_level_1,administrative_area_level_2,locality,longitude,latitude,id,date,identifier,collectionid";
            $settings = "wt=json&rows=1000000";
            $total_query = $config['query_location'] . "?q=" . $pre_query . "&" . $return_fields . "&" . $settings;
        }
        else if (array_key_exists('c', $_GET)) { //creators (story tellers)
            $collection = "collectionid:4";
            $pre_query = replace_spaces_and_cancellations($_GET["q"] . " AND " . $collection);
            $return_fields = "fl=title,gender,administrative_area_level_1,administrative_area_level_2,locality,longitude,latitude,id";
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