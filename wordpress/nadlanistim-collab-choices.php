<?php
/*
 * Plugin Name: Nadlanistim collab choices
 * Description: Exposes the labels of the collaboration select fields (stage, board tab, looking, invest) to WPGraphQL, so the site shows the labels set in WordPress.
 * { collabChoices } -> JSON { "stage": { "idea": "label" }, "board_tab": { ... }, ... }
 */
add_action("graphql_register_types", function () {
	register_graphql_field("RootQuery", "collabChoices", array("type" => "String", "resolve" => function () {
		$out = array();
		foreach ((array) (function_exists("acf_get_fields") ? acf_get_fields("group_nad_collab") : array()) as $f) {
			if (!empty($f["choices"])) $out[$f["name"]] = $f["choices"];
		}
		return wp_json_encode($out, JSON_UNESCAPED_UNICODE);
	}));
});
