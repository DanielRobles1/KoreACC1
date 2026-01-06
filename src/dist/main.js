"use strict";
exports.__esModule = true;
var platform_browser_1 = require("@angular/platform-browser");
var app_config_1 = require("./app/app.config");
var app_component_1 = require("./app/app.component");
var chart_js_1 = require("chart.js");
chart_js_1.Chart.register.apply(chart_js_1.Chart, chart_js_1.registerables);
platform_browser_1.bootstrapApplication(app_component_1.AppComponent, app_config_1.appConfig)["catch"](function (err) { return console.error(err); });
