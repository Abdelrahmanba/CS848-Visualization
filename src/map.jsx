import React from 'react'

import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_usaLow from "@amcharts/amcharts5-geodata/usaLow";
import am5geodata_canadaLow from "@amcharts/amcharts5-geodata/canadaLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

import { useEffect } from 'react';
import geoData from './geolocation_filtered.json';

// Desc: Map component
const Map = ({ data }) => {
    useEffect(() => {

        /* Chart code */
        // Create root and chart
        const root = am5.Root.new("chartdiv");

        // Set themes
        root.setThemes([
            am5themes_Animated.new(root)
        ]);


        // ====================================
        // Create map
        // ====================================

        let map = root.container.children.push(
            am5map.MapChart.new(root, {
                panY: "translateY",
                panX: "translateX",
                // maxPanOut: 0.2,
                homeZoomLevel: 5,
                minZoomLevel: 3,
                maxZoomLevel: 200,
                homeGeoPoint: { latitude: 46.4, longitude: -90.5 }
            })
        );
        // Create polygon series
        let usa = map.series.push(
            am5map.MapPolygonSeries.new(root, {
                geoJSON: am5geodata_usaLow,
                fill: am5.color(0x668bab)
            })
        )


        let canada = map.series.push(am5map.MapPolygonSeries.new(root, {
            geoJSON: am5geodata_canadaLow,
            fill: am5.color(0xe76979)

        }))

        usa.mapPolygons.template.setAll({
            tooltipText: "{name}"
        });

        usa.events.on("datavalidated", function () {
            map.goHome();
        });

        usa.mapPolygons.template.states.create("hover", {
            fill: am5.color(0x255A87),
        });

        canada.mapPolygons.template.setAll({
            tooltipText: "{name}"
        });


        canada.mapPolygons.template.states.create("hover", {
            fill: am5.color(0xD80621)
        });


        let zoomOut = root.tooltipContainer.children.push(am5.Button.new(root, {
            x: am5.p100,
            y: 0,
            centerX: am5.p100,
            centerY: 0,
            paddingTop: 18,
            paddingBottom: 18,
            paddingLeft: 12,
            paddingRight: 12,
            dx: -20,
            dy: 20,
            themeTags: ["zoom"],
            icon: am5.Graphics.new(root, {
                themeTags: ["button", "icon"],
                strokeOpacity: 0.7,
                draw: function (display) {
                    display.moveTo(0, 0);
                    display.lineTo(12, 0);
                }
            })
        }));
        let regionalSeries = {};
        let currentSeries;

        zoomOut.get("background").setAll({
            cornerRadiusBL: 40,
            cornerRadiusBR: 40,
            cornerRadiusTL: 40,
            cornerRadiusTR: 40
        });
        zoomOut.events.on("click", function () {
            if (currentSeries) {
                currentSeries.hide();
            }
            map.goHome();
            zoomOut.hide();
            currentSeries = regionalSeries.US.series;
            currentSeries.show();
        });
        zoomOut.hide();

        let i = 1;
        data.forEach(element => {
            if (geoData[element[0]] !== undefined) {
                geoData[element[0]].faculty = element[1]["faculty"];
                geoData[element[0]].counts = element[1]["count"];
                geoData[element[0]].rank = i++;
            }
        });

        // =================================
        // Set up point series
        // =================================
        const universityArray = Object.keys(geoData).map((name) => {
            return {
                name: name,
                latitude: geoData[name].latitude,
                longitude: geoData[name].longitude,
                country: geoData[name].country_code,
                state: geoData[name].state,
                faculty: geoData[name].faculty,
                count: geoData[name].counts,
                rank: geoData[name].rank
            };
        });

        canada.events.on("datavalidated", function () {
            setupStores(universityArray);
        })

        // Load store data


        // Parses data and creats map point series for domestic and state-level
        function setupStores(data) {
            // Init country-level series
            regionalSeries.US = {
                markerData: [],
                series: createSeries("count")
            };

            // Set current series
            currentSeries = regionalSeries.US.series;

            // Process data
            am5.array.each(data, function (uni) {
                // Get store data
                let storeObj = {
                    name: uni.name,
                    state: uni.state,
                    long: am5.type.toNumber(uni.longitude),
                    lat: am5.type.toNumber(uni.latitude),
                    count: 1,
                    faculty: uni.faculty,
                    counts: uni.count,
                    country: uni.country,
                    rank: uni.rank
                };
                // Process state-level data
                if (regionalSeries[storeObj.state] == undefined) {
                    let statePolygon
                    if (storeObj.country == "CA") {
                        console.log("CA-" + storeObj.state)
                        statePolygon = getPolygonCA("CA-" + storeObj.state);
                    } else {
                        statePolygon = getPolygonUS("US-" + storeObj.state);
                    }
                    if (statePolygon) {

                        let centroid = statePolygon.visualCentroid();

                        // Add state data
                        regionalSeries[storeObj.state] = {
                            target: storeObj.state,
                            type: "state",
                            country: storeObj.country,
                            name: statePolygon.dataItem.dataContext.name,
                            count: 1,
                            rank: storeObj.rank,
                            state: storeObj.state,
                            markerData: [],
                            geometry: {
                                type: "Point",
                                coordinates: [centroid.longitude, centroid.latitude]
                            }
                        };
                        regionalSeries.US.markerData.push(regionalSeries[storeObj.state]);

                    }
                    else {
                        // State not found
                        return;
                    }
                }
                else {
                    regionalSeries[storeObj.state].count += 1;
                }
                // Process individual store
                regionalSeries[storeObj.state].markerData.push({
                    name: storeObj.name,
                    count: storeObj.count,
                    state: storeObj.state,
                    rank: storeObj.rank,
                    faculty: storeObj.faculty,
                    counts: storeObj.counts,
                    geometry: {
                        type: "Point",
                        coordinates: [storeObj.long, storeObj.lat]
                    }
                });

            });
            regionalSeries.US.series.data.setAll(regionalSeries.US.markerData);
        }

        // Finds polygon in series by its id
        function getPolygonUS(id) {
            let found;
            usa.mapPolygons.each(function (polygon) {
                if (polygon.dataItem.get("id") == id) {
                    found = polygon;
                }
            })
            return found;
        }
        function getPolygonCA(id) {
            let found;
            canada.mapPolygons.each(function (polygon) {
                if (polygon.dataItem.get("id") == id) {
                    found = polygon;
                }
            })
            return found;
        }

        // Creates series with heat rules
        function createSeries(heatfield) {
            // Create point series
            let pointSeries = map.series.push(
                am5map.MapPointSeries.new(root, {
                    valueField: heatfield,
                    calculateAggregates: true
                })
            );

            // Add store bullet
            let circleTemplate = am5.Template.new(root);
            pointSeries.bullets.push(function () {
                let container = am5.Container.new(root, {});
                let circle = container.children.push(am5.Circle.new(root, {
                    radius: 1,
                    fill: am5.color(0x000000),
                    fillOpacity: 0.7,
                    cursorOverStyle: "pointer",
                }, circleTemplate));

                let label = container.children.push(am5.Label.new(root, {
                    text: "{count}",
                    fill: am5.color(0xffffff),
                    populateText: true,
                    centerX: am5.p50,
                    centerY: am5.p50,
                    textAlign: "center"
                }));

                // Set up drill-down
                circle.events.on("click", function (ev) {

                    // Determine what we've clicked on
                    let data = ev.target.dataItem.dataContext;

                    // No id? Individual store - nothing to drill down to further
                    if (!data.target) {
                        return;
                    }

                    // Create actual series if it hasn't been yet created
                    if (!regionalSeries[data.target].series) {
                        regionalSeries[data.target].series = createSeries2("rank");
                        regionalSeries[data.target].series.data.setAll(data.markerData);
                    }

                    // Hide current series
                    if (currentSeries) {
                        currentSeries.hide();
                    }

                    // Control zoom
                    if (data.type == "state") {
                        let statePolygon
                        if (data.country === "CA") {
                            statePolygon = getPolygonCA("CA-" + data.state);
                            canada.zoomToDataItem(statePolygon.dataItem);
                        } else {
                            statePolygon = getPolygonUS("US-" + data.state);
                            usa.zoomToDataItem(statePolygon.dataItem);
                        }
                    }
                    zoomOut.show();

                    // Show new targert series
                    currentSeries = regionalSeries[data.target].series;
                    currentSeries.show();
                });

                return am5.Bullet.new(root, {
                    sprite: container
                });
            });

            // Add heat rule for circles
            pointSeries.set("heatRules", [{
                target: circleTemplate,
                dataField: "value",
                min: 10,
                max: 30,
                key: "radius"
            }])

            // Set up drill-down
            // TODO

            return pointSeries;
        }

        function createSeries2(heatfield) {
            // Create point series
            let pointSeries = map.series.push(
                am5map.MapPointSeries.new(root, {
                    valueField: heatfield,
                    calculateAggregates: true
                })
            );

            // Add store bullet
            let circleTemplate = am5.Template.new(root);
            pointSeries.bullets.push(function () {
                let container = am5.Container.new(root, {});
                let circle = container.children.push(am5.Circle.new(root, {
                    radius: 1,
                    fill: am5.color(0x000000),
                    fillOpacity: 0.7,
                    cursorOverStyle: "pointer",
                    tooltipText: "{name} \nCount: {counts} \nFaculty: {faculty}\nRank: #{rank}"
                }, circleTemplate));

                let label = container.children.push(am5.Label.new(root, {
                    text: "#{rank}",
                    fill: am5.color(0xffffff),
                    populateText: true,
                    centerX: am5.p50,
                    centerY: am5.p50,
                    textAlign: "center"
                }));

                // Set up drill-down
                circle.events.on("click", function (ev) {

                    // Determine what we've clicked on
                    let data = ev.target.dataItem.dataContext;

                    // No id? Individual store - nothing to drill down to further
                    if (!data.target) {
                        return;
                    }

                    // Create actual series if it hasn't been yet created
                    if (!regionalSeries[data.target].series) {
                        regionalSeries[data.target].series = createSeries("count");
                        regionalSeries[data.target].series.data.setAll(data.markerData);
                    }

                    // Hide current series
                    if (currentSeries) {
                        currentSeries.hide();
                    }

                    // Control zoom
                    if (data.type == "state") {
                        let statePolygon
                        if (data.country === "CA") {
                            statePolygon = getPolygonCA("CA-" + data.state);
                            canada.zoomToDataItem(statePolygon.dataItem);
                        } else {
                            statePolygon = getPolygonUS("US-" + data.state);
                            usa.zoomToDataItem(statePolygon.dataItem);
                        }
                    }
                    zoomOut.show();

                    // Show new targert series
                    currentSeries = regionalSeries[data.target].series;
                    currentSeries.show();
                });

                return am5.Bullet.new(root, {
                    sprite: container
                });
            });

            // Add heat rule for circles
            pointSeries.set("heatRules", [{
                target: circleTemplate,
                dataField: "value",
                min: 10,
                max: 30,
                customFunction: function (sprite, min, max, value) {
                    if(value < 10)
                        sprite.set("fill","#50C878");
                    if (value < 70)
                        sprite.set("radius",(1-value/70)*50);
                    else{
                        sprite.set("radius",20);
                    }
                }
            }])

            // Set up drill-down
            // TODO

            return pointSeries;
        }

        return () => root.dispose();

    }, [data]);

    return (
        <div id="chartdiv" style={{ width: "100%", height: "600px" }}></div>
    )

}

export default Map




