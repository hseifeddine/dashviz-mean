'use strict';


angular.module('core').controller('CensusesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Censuses',
  function ($scope, $stateParams, $location, Authentication, Censuses) {
    $scope.authentication = Authentication;

    // Find a list of Articles
    $scope.find = function () {
      Censuses.query(
        function (response) {
          var data = response;

          var ethnicityChart = dc.rowChart("#ethnicity-chart");
          var entryStatusChart = dc.rowChart("#entry-status-chart"); //entryStatus
          var gradStatusChart = dc.pieChart("#grad-status-chart"); //gradStatus
          var genderChart = dc.pieChart("#gender-chart");//gender
          var yearChart = dc.lineChart("#year-chart"); //year
          var seriesChart = dc.seriesChart("#series-chart");

          var ndx = crossfilter(data);
          var all = ndx.groupAll();

          d3.tip = function () { function t(t) { v = d(t), w = v.createSVGPoint(), document.body.appendChild(g) } function e() { return "n" } function n() { return [0, 0] } function r() { return " " } function o() { var t = y(); return { top: t.n.y - g.offsetHeight, left: t.n.x - g.offsetWidth / 2 } } function s() { var t = y(); return { top: t.s.y, left: t.s.x - g.offsetWidth / 2 } } function u() { var t = y(); return { top: t.e.y - g.offsetHeight / 2, left: t.e.x } } function f() { var t = y(); return { top: t.w.y - g.offsetHeight / 2, left: t.w.x - g.offsetWidth } } function l() { var t = y(); return { top: t.nw.y - g.offsetHeight, left: t.nw.x - g.offsetWidth } } function i() { var t = y(); return { top: t.ne.y - g.offsetHeight, left: t.ne.x } } function a() { var t = y(); return { top: t.sw.y, left: t.sw.x - g.offsetWidth } } function c() { var t = y(); return { top: t.se.y, left: t.e.x } } function m() { var t = document.createElement("div"); return t.style.position = "absolute", t.style.display = "none", t.style.boxSizing = "border-box", t } function d(t) { return t = t.node(), "svg" == t.tagName.toLowerCase() ? t : t.ownerSVGElement } function y() { var t = d3.event.target, e = {}, n = t.getScreenCTM(), r = t.getBBox(), o = r.width, s = r.height, u = r.x, f = r.y, l = document.body.scrollTop, i = document.body.scrollLeft; return document.documentElement && document.documentElement.scrollTop && (l = document.documentElement.scrollTop, i = document.documentElement.scrollLeft), w.x = u + i, w.y = f + l, e.nw = w.matrixTransform(n), w.x += o, e.ne = w.matrixTransform(n), w.y += s, e.se = w.matrixTransform(n), w.x -= o, e.sw = w.matrixTransform(n), w.y -= s / 2, e.w = w.matrixTransform(n), w.x += o, e.e = w.matrixTransform(n), w.x -= o / 2, w.y -= s / 2, e.n = w.matrixTransform(n), w.y += s, e.s = w.matrixTransform(n), e } var p = e, h = n, x = r, g = m(), v = null, w = null; t.show = function () { var e, n = x.apply(this, arguments), r = h.apply(this, arguments), o = p.apply(this, arguments), s = d3.select(g), u = 0; for (s.html(n).style("display", "block"); u--;)s.classed(b[u], !1); return e = T.get(o).apply(this), s.classed(o, !0).style({ top: e.top + r[0] + "px", left: e.left + r[1] + "px" }), t }, t.hide = function () { return g.style.display = "none", g.innerHTML = "", t }, t.attr = function (e, n) { return arguments.length < 2 ? d3.select(g).attr(e) : (d3.select(g).attr(e, n), t) }, t.style = function (e, n) { return arguments.length < 2 ? d3.select(g).style(e) : (d3.select(g).style(e, n), t) }, t.direction = function (e) { return arguments.length ? (p = null == e ? e : d3.functor(e), t) : p }, t.offset = function (e) { return arguments.length ? (h = null == e ? e : d3.functor(e), t) : h }, t.html = function (e) { return arguments.length ? (x = null == e ? e : d3.functor(e), t) : x }; var T = d3.map({ n: o, s: s, e: u, w: f, nw: l, ne: i, sw: a, se: c }), b = T.keys(); return t };

          // Formatting helpers
          var dateFormat = d3.time.format('%Y');
          var numFormat = d3.format(",");

          // format the data
          data.forEach(function (d) {
            d.censusYear = dateFormat.parse(d.year.toString());
          });

          // define the dimensions and groups to be used by the charts
          var ethnicities = ndx.dimension(function (d) { return d.raceEthnicity; });
          var ethnicityCount = ethnicities.group().reduceSum(function (d) { return d.count; });

          var entryStatuses = ndx.dimension(function (d) { return d.entryStatus; });
          var entryStatusCount = entryStatuses.group().reduceSum(function (d) { return d.count; });

          var gradStatuses = ndx.dimension(function (d) { return d.undergradStatus; });
          var gradStatusCount = gradStatuses.group().reduceSum(function (d) { return d.count; });

          var genders = ndx.dimension(function (d) { return d.gender; });
          var genderCount = genders.group().reduceSum(function (d) { return d.count; });

          var censusYears = ndx.dimension(function (d) { return d.censusYear; });
          var censusYearCount = censusYears.group().reduceSum(function (d) { return d.count; });

          var ethnicitiesByYear = ndx.dimension(function (d) { return [d.raceEthnicity, d.censusYear]; });
          var ethnicitiesByYearCount = ethnicitiesByYear.group().reduceSum(function (d) { return d.count; });


          // tooltips 
          var pieTip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) { return "<span style='color: #f0027f'>" + d.data.key + "</span> : " + numFormat(d.value); });

          var barTip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) { return "<span style='color: #c6dbef'>" + d.key + "</span> : " + numFormat(d.value); });

          var seriesTip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) { return "<span style='color: #c6dbef'>" + d.data.key[0] + " (" + dateFormat(d.data.key[1]) + ")" + "</span> : " + numFormat(d.data.value); });

          var areaTip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) { return "<span style='color: #c6dbef'>" + dateFormat(d.data.key) + "</span> : " + numFormat(d.data.value); });

          // the records count
          dc.dataCount("#data-count-top")
            .dimension(ndx)
            .group(all);

          // the ethnicity chart
          ethnicityChart.width(440)
            .height(260)
            .margins({ top: 10, right: 100, bottom: 30, left: 120 })
            .transitionDuration(1000)
            .dimension(ethnicities)
            .group(ethnicityCount)
            .ordinalColors(["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666", "#49006a"])
            // ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"])
            .labelOffsetX([-8])
            .labelOffsetY([12])
            .title(function () { return ""; })
            .elasticX(true)
            .xAxis().ticks(4);

          // the entry status chart
          entryStatusChart.width(440)
            .height(260)
            .margins({ top: 10, right: 40, bottom: 30, left: 120 })
            .transitionDuration(1000)
            .dimension(entryStatuses)
            .group(entryStatusCount)
            .ordinalColors(['rgb(34, 94, 168)'])
            // ['rgb(127,205,187)','rgb(65,182,196)','rgb(29,145,192)','rgb(34,94,168)','rgb(37,52,148)','rgb(8,29,88)'])
            .labelOffsetX([-8])
            .labelOffsetY([12])
            .title(function () { return ""; })
            .elasticX(true)
            .xAxis().ticks(4);

          // the grad status chart
          gradStatusChart.width(250)
            .height(100)
            .transitionDuration(1000)
            .radius(40)
            .innerRadius(20)
            .dimension(gradStatuses)
            .group(gradStatusCount)
            .ordinalColors(["#92c5de", "#2166ac"])
            .title(function () { return ""; })
            .legend(dc.legend().x(50).y(0));

          // the gender chart
          genderChart.width(250)
            .height(100)
            .transitionDuration(1000)
            .radius(40)
            .innerRadius(20)
            .dimension(genders)
            .group(genderCount)
            .title(function () { return ""; })
            .ordinalColors(["#9ecae1", "#2171b5"])
            //.ordinalColors(["#5254a3","#6b6ecf","#9c9ede","#637939","#e7cb94","#843c39", "#bfd3e6","#ad494a","#d6616b","#e7969c","#7b4173","#a55194","#ce6dbd","#de9ed6"])
            // .colors(["#e7298a","#ce1256", "#f768a1","#dd3497","#e78ac3","#f1b6da","#c51b7d"])
            // .colorDomain([1,29])
            // .colorAccessor(function (d) {return d.ugArea;})
            .legend(dc.legend().x(50).y(0))
            .renderLabel(false);

          // the area time series 
          yearChart.width(600)
            .height(140)
            .margins({ top: 10, right: 150, bottom: 30, left: 50 })
            .transitionDuration(1000)
            .dimension(censusYears)
            .group(censusYearCount)
            .elasticY(false)
            .brushOn(false)
            .ordinalColors(["steelblue"])
            .x(d3.time.scale().domain([new Date(1983, 1, 1), new Date(2013, 12, 31)]))
            .xUnits(d3.time.years)
            .renderHorizontalGridLines(true)
            .renderArea(true)
            // .title(function (d) { return d.key[0] + " ("+ parseDate(d.key[1]) + ") "  + numFormat(d.value); })
            .title(function () { return ""; })
            .filterPrinter(function (filters) {
              var filter = filters[0], s = "";
              var dateObj = new Date(filter[0]);
              s += (dateObj.getFullYear() + 1) + " - " + parseDate(filter[1]);
              return s;
            })
            .yAxis().ticks(5);

          // the series chart
          seriesChart.width(600)
            .height(260)
            .margins({ top: 10, right: 150, bottom: 30, left: 50 })
            .transitionDuration(1000)
            .dimension(ethnicitiesByYear)
            .group(ethnicitiesByYearCount)
            .elasticY(true)
            .brushOn(false)
            .ordinalColors(["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666", "#49006a"])
            .x(d3.time.scale().domain([new Date(1983, 1, 1), new Date(2013, 12, 31)]))
            .chart(function (c) { return dc.lineChart(c).interpolate('basis'); })
            .seriesAccessor(function (d) { return d.key[0]; })
            .keyAccessor(function (d) { return +d.key[1]; })
            .valueAccessor(function (d) { return +d.value; })
            .xUnits(d3.time.years)
            .renderHorizontalGridLines(true)
            .filterPrinter(function (filters) {
              var filter = filters[0], s = "";
              var dateObj = new Date(filter[0]);
              s += (dateObj.getFullYear() + 1) + " - " + parseDate(filter[1]);
              return s;
            })
            .title(function () { return ""; })
            .legend(dc.legend().x(450).y(40).itemHeight(13).gap(5).horizontal(1).legendWidth(150).itemWidth(150))
            .yAxis().ticks(5);


          // the data table
          dc.dataTable(".dc-data-table")
            .dimension(entryStatuses)
            .group(function (d) {
              return d.entryStatus;
            })
            .size(170)
            .columns([
              function (d) { return d.undergradStatus; },
              function (d) { return d.entryStatus; },
              function (d) { return d.raceEthnicity; },
              function (d) { return d.gender; },
              function (d) { return d.year; },
              function (d) { return d.count; }
            ])
            .sortBy(function (d) {
              return d.raceEthnicity;
            })
            .order(d3.ascending)
            .renderlet(function (table) {
              table.selectAll(".dc-table-group").classed("info", true);
            });

          dc.renderAll();

          // set up the tool tips
          d3.selectAll(".pie-slice").call(pieTip);
          d3.selectAll(".pie-slice").on('mouseover', pieTip.show)
            .on('mouseout', pieTip.hide);

          d3.selectAll("g.row").call(barTip);
          d3.selectAll("g.row").on('mouseover', barTip.show)
            .on('mouseout', barTip.hide);

          d3.selectAll("#series-chart circle.dot").call(seriesTip);
          d3.selectAll("#series-chart circle.dot")
            .on('mouseover.foo', seriesTip.show)
            .on('mouseout.foo', seriesTip.hide);


          d3.selectAll("#year-chart circle.dot").call(areaTip);
          d3.selectAll("#year-chart circle.dot")
            .on('mouseover.bar', areaTip.show)
            .on('mouseout.bar', areaTip.hide);
        },
        function (response) {
          $scope.message = "Error: " + response.status + " " + response.statusText;
        });
    };
  }
]);