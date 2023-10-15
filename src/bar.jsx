import React, { useEffect } from "react";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";

const Bar = ({ data }) => {
    useEffect(() => {
        /* Chart code */
        // Create root element
        // https://www.amcharts.com/docs/v5/getting-started/#Root_element
        let root = am5.Root.new("bar");


        // Set themes
        // https://www.amcharts.com/docs/v5/concepts/themes/
        root.setThemes([
            am5themes_Animated.new(root)
        ]);


        // Create chart
        // https://www.amcharts.com/docs/v5/charts/xy-chart/
        let chart = root.container.children.push(am5xy.XYChart.new(root, {
            panX: false,
            panY: false,
            layout: root.verticalLayout
        }));

        let colors = chart.get("colors");

        // Data
        const arr = Object.keys(data).map(key => (
            {
                key,
                value:Math.round(data[key].count * 100) / 100,
                faculty: data[key].faculty,
                columnSettings: { fill: colors.next() },
            }
        )
        );

        // Create axes
        // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/

        let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
            valueXField: "value",
            renderer: am5xy.AxisRendererX.new(root, {
                strokeOpacity: 0.1
            }),

        }));
        xAxis.data.setAll(arr);


        let yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
            categoryField: "key",
            valueYField: "faculty",
            renderer: am5xy.AxisRendererY.new(root, {
                inversed: true,
                cellStartLocation: 0.1,
                cellEndLocation: 0.9
            })
        }));
        yAxis.data.setAll(arr);




        // Add series
        // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
        let series = chart.series.push(am5xy.ColumnSeries.new(root, {
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: "value",
            categoryYField: "key",
            valueYField: "faculty",
        }));

        series.columns.template.setAll({
            tooltipText: "Count: {valueX} \nFaculty:{valueY}",
            tooltipY: 0,
            strokeOpacity: 0,
            templateField: "columnSettings"
        });

        series.data.setAll(arr);


        // Make stuff animate on load
        // https://www.amcharts.com/docs/v5/concepts/animations/
        series.appear();
        chart.appear(1000, 100);
        return () => root.dispose();

    }, [data]);
    return <div id="bar" style={{ width: "100%", height: "600px" }}></div>;
}

export default Bar;