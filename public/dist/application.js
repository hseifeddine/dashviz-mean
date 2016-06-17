'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload', 'd3', 'crossfilter', 'dc'];

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider',
  function ($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {

  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;
      toState.data.roles.forEach(function (role) {
        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
          allowed = true;
          return true;
        }
      });

      if (!allowed) {
        event.preventDefault();
        if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
          $state.go('forbidden');
        } else {
          $state.go('authentication.signin').then(function () {
            storePreviousState(toState, toParams);
          });
        }
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    storePreviousState(fromState, fromParams);
  });

  // Store previous state
  function storePreviousState(state, params) {
    // only store this state if it shouldn't be ignored 
    if (!state.data || !state.data.ignoreState) {
      $state.previous = {
        state: state,
        params: params,
        href: $state.href(state, params)
      };
    }
  }
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);
ApplicationConfiguration.registerModule('d3');
ApplicationConfiguration.registerModule('crossfilter');
ApplicationConfiguration.registerModule('dc');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    // Add the articles dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Dashboards',
      state: 'dashboards',
      type: 'dropdown',
      roles: ['user']
    });

    Menus.addSubMenuItem('topbar', 'dashboards', {
      title: 'Censuses',
      state: 'censuses'
    });

    Menus.addSubMenuItem('topbar', 'dashboards', {
      title: 'Donors',
      state: 'donors',
    });
    
    Menus.addSubMenuItem('topbar', 'dashboards', {
      title: 'Earth Quakes',
      state: 'earthquakes',
    });
 
     Menus.addSubMenuItem('topbar', 'dashboards', {
      title: 'Stocks',
      state: 'stocks',
    });
    
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'modules/core/client/views/home.client.view.html'
    })
    .state('censuses', {
      url: '/censuses',
      templateUrl: 'modules/core/client/views/censuses.client.view.html'
    })
    .state('donors', {
      url: '/donors',
      templateUrl: 'modules/core/client/views/donors.client.view.html'
    })
    .state('earthquakes', {
      url: '/earthquakes',
      templateUrl: 'modules/core/client/views/earthquakes.client.view.html'
    })
    .state('stocks', {
      url: '/stocks',
      templateUrl: 'modules/core/client/views/stocks.client.view.html'
    })
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/core/client/views/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/core/client/views/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/core/client/views/403.client.view.html',
      data: {
        ignoreState: true
      }
    });
  }
]);

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
'use strict';

angular.module('core').controller('DonorsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Donors',
  function ($scope, $stateParams, $location, Authentication, Donors) {
    $scope.authentication = Authentication;
    
    $scope.find = function () {
        Donors.query(
            function (response) {
                var dataSet = response;
                var dateFormat = d3.time.format("%m/%d/%Y");
                dataSet.forEach(function (d) {
                    d.date_posted = dateFormat.parse(d.date_posted);
                    d.date_posted.setDate(1);
                    d.total_donations = +d.total_donations;
                });

                //Create a Crossfilter instance
                var ndx = crossfilter(dataSet);

                //Define Dimensions
                var datePosted = ndx.dimension(function (d) { return d.date_posted; });
                var gradeLevel = ndx.dimension(function (d) { return d.grade_level; });
                var resourceType = ndx.dimension(function (d) { return d.resource_type; });
                var fundingStatus = ndx.dimension(function (d) { return d.funding_status; });
                var povertyLevel = ndx.dimension(function (d) { return d.poverty_level; });
                var state = ndx.dimension(function (d) { return d.school_state; });
                var totalDonations = ndx.dimension(function (d) { return d.total_donations; });


                //Calculate metrics
                var projectsByDate = datePosted.group();
                var projectsByGrade = gradeLevel.group();
                var projectsByResourceType = resourceType.group();
                var projectsByFundingStatus = fundingStatus.group();
                var projectsByPovertyLevel = povertyLevel.group();
                var stateGroup = state.group();

                var all = ndx.groupAll();

                //Calculate Groups
                var totalDonationsState = state.group().reduceSum(function (d) {
                    return d.total_donations;
                });

                var totalDonationsGrade = gradeLevel.group().reduceSum(function (d) {
                    return d.grade_level;
                });

                var totalDonationsFundingStatus = fundingStatus.group().reduceSum(function (d) {
                    return d.funding_status;
                });



                var netTotalDonations = ndx.groupAll().reduceSum(function (d) { return d.total_donations; });

                //Define threshold values for data
                var minDate = datePosted.bottom(1)[0].date_posted;
                var maxDate = datePosted.top(1)[0].date_posted;

                //Charts
                var dateChart = dc.lineChart("#date-chart");
                var gradeLevelChart = dc.rowChart("#grade-chart");
                var resourceTypeChart = dc.rowChart("#resource-chart");
                var fundingStatusChart = dc.pieChart("#funding-chart");
                var povertyLevelChart = dc.rowChart("#poverty-chart");
                var totalProjects = dc.numberDisplay("#total-projects");
                var netDonations = dc.numberDisplay("#net-donations");
                var stateDonations = dc.barChart("#state-donations");

                //selectField = dc.selectMenu('#menuselect')
                //          .dimension(state)
                //          .group(stateGroup); 

                dc.dataCount("#row-selection")
                    .dimension(ndx)
                    .group(all);


                totalProjects
                    .formatNumber(d3.format("d"))
                    .valueAccessor(function (d) { return d; })
                    .group(all);

                netDonations
                    .formatNumber(d3.format("d"))
                    .valueAccessor(function (d) { return d; })
                    .group(netTotalDonations)
                    .formatNumber(d3.format(".3s"));

                dateChart
                    .height(220)
                    .margins({ top: 10, right: 50, bottom: 30, left: 50 })
                    .dimension(datePosted)
                    .group(projectsByDate)
                    .renderArea(true)
                    .transitionDuration(500)
                    .x(d3.time.scale().domain([minDate, maxDate]))
                    .elasticY(true)
                    .renderHorizontalGridLines(true)
                    .renderVerticalGridLines(true)
                    .xAxisLabel("Year")
                    .yAxis().ticks(6);

                resourceTypeChart
                    .height(220)
                    .dimension(resourceType)
                    .group(projectsByResourceType)
                    .elasticX(true)
                    .xAxis().ticks(5);

                povertyLevelChart
                    .height(220)
                    .dimension(povertyLevel)
                    .group(projectsByPovertyLevel)
                    .xAxis().ticks(4);

                gradeLevelChart
                    .height(220)
                    .dimension(gradeLevel)
                    .group(projectsByGrade)
                    .xAxis().ticks(4);


                fundingStatusChart
                    .height(220)
                    .radius(90)
                    .innerRadius(40)
                    .transitionDuration(1000)
                    .dimension(fundingStatus)
                    .group(projectsByFundingStatus);


                stateDonations
                    .height(220)
                    .transitionDuration(1000)
                    .dimension(state)
                    .group(totalDonationsState)
                    .margins({ top: 10, right: 50, bottom: 30, left: 50 })
                    .centerBar(false)
                    .gap(5)
                    .elasticY(true)
                    .x(d3.scale.ordinal().domain(state))
                    .xUnits(dc.units.ordinal)
                    .renderHorizontalGridLines(true)
                    .renderVerticalGridLines(true)
                    .ordering(function (d) { return d.value; })
                    .yAxis().tickFormat(d3.format("s"));

                dc.renderAll();


            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });
             };
  }
]);
'use strict';

angular.module('core').controller('EarthQuakesController', ['$scope', '$stateParams', '$location', 'Authentication', 'EarthQuakes',
  function ($scope, $stateParams, $location, Authentication, EarthQuakes) {
    $scope.authentication = Authentication;

    $scope.find = function () {
      EarthQuakes.query(
        function (response) {
          var data = response;

          var dataTable = dc.dataTable("#dc-table-graph");
          var magnitudeChart = dc.barChart("#dc-magnitude-chart");
          var depthChart = dc.barChart("#dc-depth-chart");
          var dayOfWeekChart = dc.rowChart("#dc-dayweek-chart");
          var islandChart = dc.pieChart("#dc-island-chart");
          var timeChart = dc.lineChart("#dc-time-chart");

          // format our data
          var dtgFormat = d3.time.format("%Y-%m-%dT%H:%M:%S");
          var dtgFormat2 = d3.time.format("%a %e %b %H:%M");

          data.forEach(function (d) {
            d.dtg1 = d.origintime.substr(0, 10) + " " + d.origintime.substr(11, 8);
            d.dtg = dtgFormat.parse(d.origintime.substr(0, 19));
            d.lat = +d.latitude;
            d.long = +d.longitude;
            d.mag = d3.round(+d.magnitude, 1);
            d.depth = d3.round(+d.depth, 0);

          });

          // Run the data through crossfilter and load our 'facts'
          var facts = crossfilter(data);
          var all = facts.groupAll();

          // for Magnitude
          var magValue = facts.dimension(function (d) {
            return d.mag;       // add the magnitude dimension
          });
          var magValueGroupSum = magValue.group()
            .reduceSum(function (d) { return d.mag; });	// sums 
          var magValueGroupCount = magValue.group()
            .reduceCount(function (d) { return d.mag; }) // counts 

          // for Depth
          var depthValue = facts.dimension(function (d) {
            return d.depth;
          });
          var depthValueGroup = depthValue.group();

          // time chart
          var volumeByHour = facts.dimension(function (d) {
            return d3.time.hour(d.dtg);
          });
          var volumeByHourGroup = volumeByHour.group()
            .reduceCount(function (d) { return d.dtg; });

          // row chart Day of Week
          var dayOfWeek = facts.dimension(function (d) {
            var day = d.dtg.getDay();
            switch (day) {
              case 0:
                return "0.Sun";
              case 1:
                return "1.Mon";
              case 2:
                return "2.Tue";
              case 3:
                return "3.Wed";
              case 4:
                return "4.Thu";
              case 5:
                return "5.Fri";
              case 6:
                return "6.Sat";
            }
          });
          var dayOfWeekGroup = dayOfWeek.group();

          // Pie Chart
          var islands = facts.dimension(function (d) {
            if (d.lat <= -40.555907 && d.long <= 174.590607)
              return "South";
            else
              return "North";
          });
          var islandsGroup = islands.group();

          // Create datatable dimension
          var timeDimension = facts.dimension(function (d) {
            return d.dtg;
          });

          // Setup the charts

          // count all the facts
          dc.dataCount(".dc-data-count")
            .dimension(facts)
            .group(all);

          // Magnitide Bar Graph Counted
          magnitudeChart.width(480)
            .height(150)
            .margins({ top: 10, right: 10, bottom: 20, left: 40 })
            .dimension(magValue)
            .group(magValueGroupCount)
            .transitionDuration(500)
            .centerBar(true)
            .gap(65)  // 65 = norm
            .x(d3.scale.linear().domain([0.5, 7.5]))
            .elasticY(true)
            .xAxis().tickFormat();

          // Depth bar graph
          depthChart.width(480)
            .height(150)
            .margins({ top: 10, right: 10, bottom: 20, left: 40 })
            .dimension(depthValue)
            .group(depthValueGroup)
            .transitionDuration(500)
            .centerBar(true)
            .gap(1)
            .x(d3.scale.linear().domain([0, 100]))
            .elasticY(true)
            .xAxis().tickFormat(function (v) { return v; });

          // time graph
          timeChart.width(960)
            .height(150)
            .transitionDuration(500)
            .margins({ top: 10, right: 10, bottom: 20, left: 40 })
            .dimension(volumeByHour)
            .group(volumeByHourGroup)
            .title(function (d) {
              return dtgFormat2(d.data.key)
                + "\nNumber of Events: " + d.data.value;
            })
            .elasticY(true)
            .x(d3.time.scale().domain(d3.extent(data, function (d) { return d.dtg; })))
            .xAxis();

          // row chart day of week
          dayOfWeekChart.width(300)
            .height(220)
            .margins({ top: 5, left: 10, right: 10, bottom: 20 })
            .dimension(dayOfWeek)
            .group(dayOfWeekGroup)
            .colors(d3.scale.category10())
            .label(function (d) {
              return d.key.split(".")[1];
            })
            .title(function (d) { return d.value; })
            .elasticX(true)
            .xAxis().ticks(4);

          // islands pie chart
          islandChart.width(250)
            .height(220)
            .radius(100)
            .innerRadius(30)
            .dimension(islands)
            .title(function (d) { return d.value; })
            .group(islandsGroup);

          // Table of earthquake data
          dataTable.width(960).height(800)
            .dimension(timeDimension)
            .group(function (d) {
              return "Earthquake Table"
            })
            .size(10)
            .columns([
              function (d) { return d.dtg1; },
              function (d) { return d.lat; },
              function (d) { return d.long; },
              function (d) { return d.depth; },
              function (d) { return d.mag; },
              function (d) { return '<a href=\"http://maps.google.com/maps?z=12&t=m&q=loc:' + d.lat + '+' + d.long + "\" target=\"_blank\">Google Map</a>" },
              function (d) { return '<a href=\"http://www.openstreetmap.org/?mlat=' + d.lat + '&mlon=' + d.long + '&zoom=12' + "\" target=\"_blank\"> OSM Map</a>" }
            ])
            .sortBy(function (d) { return d.dtg; })
            .order(d3.ascending);

          // Render the Charts
          dc.renderAll();
        },
        function (response) {
          $scope.message = "Error: " + response.status + " " + response.statusText;
        });
    };
  }
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus',
  function ($scope, $state, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);

'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);

'use strict';

angular.module('core').controller('StocksController', ['$scope', '$stateParams', '$location', 'Authentication', 'Stocks',
    function ($scope, $stateParams, $location, Authentication, Stocks) {
        $scope.authentication = Authentication;

        $scope.find = function () {
            Stocks.query(
                function (response) {
                    var data = response;
                    var gainOrLossChart = dc.pieChart('#gain-loss-chart');
                    var fluctuationChart = dc.barChart('#fluctuation-chart');
                    var quarterChart = dc.pieChart('#quarter-chart');
                    var dayOfWeekChart = dc.rowChart('#day-of-week-chart');
                    var moveChart = dc.lineChart('#monthly-move-chart');
                    var volumeChart = dc.barChart('#monthly-volume-chart');
                    var yearlyBubbleChart = dc.bubbleChart('#yearly-bubble-chart');

                    var dateFormat = d3.time.format('%m/%d/%Y');
                    var numberFormat = d3.format('.2f');

                    data.forEach(function (d) {
                        d.dd = dateFormat.parse(d.date);
                        d.month = d3.time.month(d.dd); // pre-calculate month for better performance
                        d.close = +d.close; // coerce to number
                        d.open = +d.open;
                    });

                    //### Create Crossfilter Dimensions and Groups
                    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
                    var ndx = crossfilter(data);
                    var all = ndx.groupAll();

                    // dimension by year
                    var yearlyDimension = ndx.dimension(function (d) {
                        return d3.time.year(d.dd).getFullYear();
                    });

                    // maintain running tallies by year as filters are applied or removed
                    var yearlyPerformanceGroup = yearlyDimension.group().reduce(
                        /* callback for when data is added to the current filter results */
                        function (p, v) {
                            ++p.count;
                            p.absGain += v.close - v.open;
                            p.fluctuation += Math.abs(v.close - v.open);
                            p.sumIndex += (v.open + v.close) / 2;
                            p.avgIndex = p.sumIndex / p.count;
                            p.percentageGain = (p.absGain / p.avgIndex) * 100;
                            p.fluctuationPercentage = (p.fluctuation / p.avgIndex) * 100;
                            return p;
                        },
                        /* callback for when data is removed from the current filter results */
                        function (p, v) {
                            --p.count;
                            p.absGain -= v.close - v.open;
                            p.fluctuation -= Math.abs(v.close - v.open);
                            p.sumIndex -= (v.open + v.close) / 2;
                            p.avgIndex = p.sumIndex / p.count;
                            p.percentageGain = (p.absGain / p.avgIndex) * 100;
                            p.fluctuationPercentage = (p.fluctuation / p.avgIndex) * 100;
                            return p;
                        },
                        /* initialize p */
                        function () {
                            return {
                                count: 0,
                                absGain: 0,
                                fluctuation: 0,
                                fluctuationPercentage: 0,
                                sumIndex: 0,
                                avgIndex: 0,
                                percentageGain: 0
                            };
                        }
                    );

                    // dimension by full date
                    var dateDimension = ndx.dimension(function (d) {
                        return d.dd;
                    });

                    // dimension by month
                    var moveMonths = ndx.dimension(function (d) {
                        return d.month;
                    });
                    // group by total movement within month
                    var monthlyMoveGroup = moveMonths.group().reduceSum(function (d) {
                        return Math.abs(d.close - d.open);
                    });

                    // group by total volume within move, and scale down result
                    var volumeByMonthGroup = moveMonths.group().reduceSum(function (d) {
                        return d.volume / 500000;
                    });

                    var indexAvgByMonthGroup = moveMonths.group().reduce(
                        function (p, v) {
                            ++p.days;
                            p.total += (v.open + v.close) / 2;
                            p.avg = Math.round(p.total / p.days);
                            return p;
                        },
                        function (p, v) {
                            --p.days;
                            p.total -= (v.open + v.close) / 2;
                            p.avg = p.days ? Math.round(p.total / p.days) : 0;
                            return p;
                        },
                        function () {
                            return { days: 0, total: 0, avg: 0 };
                        }
                    );

                    // create categorical dimension
                    var gainOrLoss = ndx.dimension(function (d) {
                        return d.open > d.close ? 'Loss' : 'Gain';
                    });
                    // produce counts records in the dimension
                    var gainOrLossGroup = gainOrLoss.group();

                    // determine a histogram of percent changes
                    var fluctuation = ndx.dimension(function (d) {
                        return Math.round((d.close - d.open) / d.open * 100);
                    });

                    var fluctuationGroup = fluctuation.group();

                    // summerize volume by quarter
                    var quarter = ndx.dimension(function (d) {
                        var month = d.dd.getMonth();
                        if (month <= 2) {
                            return 'Q1';
                        } else if (month > 2 && month <= 5) {
                            return 'Q2';
                        } else if (month > 5 && month <= 8) {
                            return 'Q3';
                        } else {
                            return 'Q4';
                        }
                    });
                    var quarterGroup = quarter.group().reduceSum(function (d) {
                        return d.volume;
                    });

                    // counts per weekday
                    var dayOfWeek = ndx.dimension(function (d) {
                        var day = d.dd.getDay();
                        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        return day + '.' + name[day];
                    });
                    var dayOfWeekGroup = dayOfWeek.group();

                    //### Define Chart Attributes
                    //Define chart attributes using fluent methods. See the
                    // [dc API Reference](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md) for more information
                    //

                    //#### Bubble Chart
                    //Create a bubble chart and use the given css selector as anchor. You can also specify
                    //an optional chart group for this chart to be scoped within. When a chart belongs
                    //to a specific group then any interaction with such chart will only trigger redraw
                    //on other charts within the same chart group.
                    /* dc.bubbleChart('#yearly-bubble-chart', 'chartGroup') */
                    yearlyBubbleChart
                        .width(990) // (optional) define chart width, :default = 200
                        .height(250)  // (optional) define chart height, :default = 200
                        .transitionDuration(1500) // (optional) define chart transition duration, :default = 750
                        .margins({ top: 10, right: 50, bottom: 30, left: 40 })
                        .dimension(yearlyDimension)
                        //Bubble chart expect the groups are reduced to multiple values which would then be used
                        //to generate x, y, and radius for each key (bubble) in the group
                        .group(yearlyPerformanceGroup)
                        .colors(colorbrewer.RdYlGn[9]) // (optional) define color function or array for bubbles
                        .colorDomain([-500, 500]) //(optional) define color domain to match your data domain if you want to bind data or
                        //color
                        //##### Accessors
                        //Accessor functions are applied to each value returned by the grouping
                        //
                        //* `.colorAccessor` The returned value will be mapped to an internal scale to determine a fill color
                        //* `.keyAccessor` Identifies the `X` value that will be applied against the `.x()` to identify pixel location
                        //* `.valueAccessor` Identifies the `Y` value that will be applied agains the `.y()` to identify pixel location
                        //* `.radiusValueAccessor` Identifies the value that will be applied agains the `.r()` determine radius size,
                        //*     by default this maps linearly to [0,100]
                        .colorAccessor(function (d) {
                            return d.value.absGain;
                        })
                        .keyAccessor(function (p) {
                            return p.value.absGain;
                        })
                        .valueAccessor(function (p) {
                            return p.value.percentageGain;
                        })
                        .radiusValueAccessor(function (p) {
                            return p.value.fluctuationPercentage;
                        })
                        .maxBubbleRelativeSize(0.3)
                        .x(d3.scale.linear().domain([-2500, 2500]))
                        .y(d3.scale.linear().domain([-100, 100]))
                        .r(d3.scale.linear().domain([0, 4000]))
                        //##### Elastic Scaling
                        //`.elasticX` and `.elasticX` determine whether the chart should rescale each axis to fit data.
                        //The `.yAxisPadding` and `.xAxisPadding` add padding to data above and below their max values in the same unit
                        //domains as the Accessors.
                        .elasticY(true)
                        .elasticX(true)
                        .yAxisPadding(100)
                        .xAxisPadding(500)
                        .renderHorizontalGridLines(true) // (optional) render horizontal grid lines, :default=false
                        .renderVerticalGridLines(true) // (optional) render vertical grid lines, :default=false
                        .xAxisLabel('Index Gain') // (optional) render an axis label below the x axis
                        .yAxisLabel('Index Gain %') // (optional) render a vertical axis lable left of the y axis
                        //#### Labels and  Titles
                        //Labels are displaed on the chart for each bubble. Titles displayed on mouseover.
                        .renderLabel(true) // (optional) whether chart should render labels, :default = true
                        .label(function (p) {
                            return p.key;
                        })
                        .renderTitle(true) // (optional) whether chart should render titles, :default = false
                        .title(function (p) {
                            return [
                                p.key,
                                'Index Gain: ' + numberFormat(p.value.absGain),
                                'Index Gain in Percentage: ' + numberFormat(p.value.percentageGain) + '%',
                                'Fluctuation / Index Ratio: ' + numberFormat(p.value.fluctuationPercentage) + '%'
                            ].join('\n');
                        })
                        //#### Customize Axis
                        //Set a custom tick format. Note `.yAxis()` returns an axis object, so any additional method chaining applies
                        //to the axis, not the chart.
                        .yAxis().tickFormat(function (v) {
                            return v + '%';
                        });

                    // #### Pie/Donut Chart
                    // Create a pie chart and use the given css selector as anchor. You can also specify
                    // an optional chart group for this chart to be scoped within. When a chart belongs
                    // to a specific group then any interaction with such chart will only trigger redraw
                    // on other charts within the same chart group.
                    gainOrLossChart
                        .width(180) // (optional) define chart width, :default = 200
                        .height(180) // (optional) define chart height, :default = 200
                        .radius(80) // define pie radius
                        .dimension(gainOrLoss) // set dimension
                        .group(gainOrLossGroup) // set group
                        /* (optional) by default pie chart will use group.key as its label
                         * but you can overwrite it with a closure */
                        .label(function (d) {
                            if (gainOrLossChart.hasFilter() && !gainOrLossChart.hasFilter(d.key)) {
                                return d.key + '(0%)';
                            }
                            var label = d.key;
                            if (all.value()) {
                                label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
                            }
                            return label;
                        })
                        // (optional) whether chart should render labels, :default = true
                        .renderLabel(true)
                        // (optional) if inner radius is used then a donut chart will be generated instead of pie chart
                        //.innerRadius(40)
                        // (optional) define chart transition duration, :default = 350
                        .transitionDuration(500)
                        // (optional) define color array for slices
                        //.colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
                        // (optional) define color domain to match your data domain if you want to bind data or color
                        .colorDomain([-1750, 1644])
                        // (optional) define color value accessor
                        .colorAccessor(function (d, i) { return d.value; });


                    quarterChart
                        .width(180)
                        .height(180)
                        .radius(80)
                        .innerRadius(30)
                        .dimension(quarter)
                        .group(quarterGroup);

                    //#### Row Chart
                    dayOfWeekChart
                        .width(180)
                        .height(180)
                        .margins({ top: 20, left: 10, right: 10, bottom: 20 })
                        .group(dayOfWeekGroup)
                        .dimension(dayOfWeek)
                        // assign colors to each value in the x scale domain
                        .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
                        .label(function (d) {
                            return d.key.split('.')[1];
                        })
                        // title sets the row text
                        .title(function (d) {
                            return d.value;
                        })
                        .elasticX(true)
                        .xAxis().ticks(4);


                    //#### Bar Chart
                    // Create a bar chart and use the given css selector as anchor. You can also specify
                    // an optional chart group for this chart to be scoped within. When a chart belongs
                    // to a specific group then any interaction with such chart will only trigger redraw
                    // on other charts within the same chart group.
                    /* dc.barChart('#volume-month-chart') */
                    fluctuationChart.width(420)
                        .height(180)
                        .margins({ top: 10, right: 50, bottom: 30, left: 40 })
                        .dimension(fluctuation)
                        .group(fluctuationGroup)
                        .elasticY(true)
                        // (optional) whether bar should be center to its x value. Not needed for ordinal chart, :default=false
                        .centerBar(true)
                        // (optional) set gap between bars manually in px, :default=2
                        .gap(1)
                        // (optional) set filter brush rounding
                        .round(dc.round.floor)
                        .alwaysUseRounding(true)
                        .x(d3.scale.linear().domain([-10, 10]))
                        .renderHorizontalGridLines(true)
                        // customize the filter displayed in the control span
                        .filterPrinter(function (filters) {
                            var filter = filters[0], s = '';
                            s += numberFormat(filter[0]) + '% -> ' + numberFormat(filter[1]) + '%';
                            return s;
                        });

                    // Customize axis
                    fluctuationChart.xAxis().tickFormat(
                        function (v) { return v + '%'; });
                    fluctuationChart.yAxis().ticks(5);

                    //#### Stacked Area Chart
                    //Specify an area chart, by using a line chart with `.renderArea(true)`
                    moveChart
                        .renderArea(true)
                        .width(990)
                        .height(200)
                        .transitionDuration(1000)
                        .margins({ top: 30, right: 50, bottom: 25, left: 40 })
                        .dimension(moveMonths)
                        .mouseZoomable(true)
                        // Specify a range chart to link the brush extent of the range with the zoom focue of the current chart.
                        .rangeChart(volumeChart)
                        .x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)]))
                        .round(d3.time.month.round)
                        .xUnits(d3.time.months)
                        .elasticY(true)
                        .renderHorizontalGridLines(true)
                        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
                        .brushOn(false)
                        // Add the base layer of the stack with group. The second parameter specifies a series name for use in the
                        // legend
                        // The `.valueAccessor` will be used for the base layer
                        .group(indexAvgByMonthGroup, 'Monthly Index Average')
                        .valueAccessor(function (d) {
                            return d.value.avg;
                        })
                        // stack additional layers with `.stack`. The first paramenter is a new group.
                        // The second parameter is the series name. The third is a value accessor.
                        .stack(monthlyMoveGroup, 'Monthly Index Move', function (d) {
                            return d.value;
                        })
                        // title can be called by any stack layer.
                        .title(function (d) {
                            var value = d.value.avg ? d.value.avg : d.value;
                            if (isNaN(value)) {
                                value = 0;
                            }
                            return dateFormat(d.key) + '\n' + numberFormat(value);
                        });

                    volumeChart.width(990)
                        .height(40)
                        .margins({ top: 0, right: 50, bottom: 20, left: 40 })
                        .dimension(moveMonths)
                        .group(volumeByMonthGroup)
                        .centerBar(true)
                        .gap(1)
                        .x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)]))
                        .round(d3.time.month.round)
                        .alwaysUseRounding(true)
                        .xUnits(d3.time.months);

                    /*
                    //#### Data Count
                    // Create a data count widget and use the given css selector as anchor. You can also specify
                    // an optional chart group for this chart to be scoped within. When a chart belongs
                    // to a specific group then any interaction with such chart will only trigger redraw
                    // on other charts within the same chart group.
                    <div id='data-count'>
                        <span class='filter-count'></span> selected out of <span class='total-count'></span> records
                    </div>
                    */
                    dc.dataCount('.dc-data-count')
                        .dimension(ndx)
                        .group(all)
                        // (optional) html, for setting different html for some records and all records.
                        // .html replaces everything in the anchor with the html given using the following function.
                        // %filter-count and %total-count are replaced with the values obtained.
                        .html({
                            some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                            ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>Reset All</a>',
                            all: 'All records selected. Please click on the graph to apply filters.'
                        });

                    /*
                    //#### Data Table
                    // Create a data table widget and use the given css selector as anchor. You can also specify
                    // an optional chart group for this chart to be scoped within. When a chart belongs
                    // to a specific group then any interaction with such chart will only trigger redraw
                    // on other charts within the same chart group.
                    <!-- anchor div for data table -->
                    <div id='data-table'>
                        <!-- create a custom header -->
                        <div class='header'>
                            <span>Date</span>
                            <span>Open</span>
                            <span>Close</span>
                            <span>Change</span>
                            <span>Volume</span>
                        </div>
                        <!-- data rows will filled in here -->
                    </div>
                    */
                    dc.dataTable('.dc-data-table')
                        .dimension(dateDimension)
                        // data table does not use crossfilter group but rather a closure
                        // as a grouping function
                        .group(function (d) {
                            var format = d3.format('02d');
                            return d.dd.getFullYear() + '/' + format((d.dd.getMonth() + 1));
                        })
                        .size(25) // (optional) max number of records to be shown, :default = 25
                        // There are several ways to specify the columns; see the data-table documentation.
                        // This code demonstrates generating the column header automatically based on the columns.
                        .columns([
                            'date',    // d['date'], ie, a field accessor; capitalized automatically
                            'open',    // ...
                            'close',   // ...
                            {
                                label: 'Change', // desired format of column name 'Change' when used as a label with a function.
                                format: function (d) {
                                    return numberFormat(d.close - d.open);
                                }
                            },
                            'volume'   // d['volume'], ie, a field accessor; capitalized automatically
                        ])

                        // (optional) sort using the given field, :default = function(d){return d;}
                        .sortBy(function (d) {
                            return d.dd;
                        })
                        // (optional) sort order, :default ascending
                        .order(d3.ascending)
                        // (optional) custom renderlet to post-process chart using D3
                        .renderlet(function (table) {
                            table.selectAll('.dc-table-group').classed('info', true);
                        });


                    /*    
                    //#### Geo Choropleth Chart
                    //Create a choropleth chart and use the given css selector as anchor. You can also specify
                    //an optional chart group for this chart to be scoped within. When a chart belongs
                    //to a specific group then any interaction with such chart will only trigger redraw
                    //on other charts within the same chart group.
                    dc.geoChoroplethChart('#us-chart')
                        .width(990) // (optional) define chart width, :default = 200
                        .height(500) // (optional) define chart height, :default = 200
                        .transitionDuration(1000) // (optional) define chart transition duration, :default = 1000
                        .dimension(states) // set crossfilter dimension, dimension key should match the name retrieved in geo json layer
                        .group(stateRaisedSum) // set crossfilter group
                        // (optional) define color function or array for bubbles
                        .colors(['#ccc', '#E2F2FF','#C4E4FF','#9ED2FF','#81C5FF','#6BBAFF','#51AEFF','#36A2FF','#1E96FF','#0089FF',
                            '#0061B5'])
                        // (optional) define color domain to match your data domain if you want to bind data or color
                        .colorDomain([-5, 200])
                        // (optional) define color value accessor
                        .colorAccessor(function(d, i){return d.value;})
                        // Project the given geojson. You can call this function mutliple times with different geojson feed to generate
                        // multiple layers of geo paths.
                        //
                        // * 1st param - geo json data
                        // * 2nd param - name of the layer which will be used to generate css class
                        // * 3rd param - (optional) a function used to generate key for geo path, it should match the dimension key
                        // in order for the coloring to work properly
                        .overlayGeoJson(statesJson.features, 'state', function(d) {
                            return d.properties.name;
                        })
                        // (optional) closure to generate title for path, :default = d.key + ': ' + d.value
                        .title(function(d) {
                            return 'State: ' + d.key + '\nTotal Amount Raised: ' + numberFormat(d.value ? d.value : 0) + 'M';
                        });
                        //#### Bubble Overlay Chart
                        // Create a overlay bubble chart and use the given css selector as anchor. You can also specify
                        // an optional chart group for this chart to be scoped within. When a chart belongs
                        // to a specific group then any interaction with such chart will only trigger redraw
                        // on other charts within the same chart group.
                        dc.bubbleOverlay('#bubble-overlay')
                            // bubble overlay chart does not generate it's own svg element but rather resue an existing
                            // svg to generate it's overlay layer
                            .svg(d3.select('#bubble-overlay svg'))
                            .width(990) // (optional) define chart width, :default = 200
                            .height(500) // (optional) define chart height, :default = 200
                            .transitionDuration(1000) // (optional) define chart transition duration, :default = 1000
                            .dimension(states) // set crossfilter dimension, dimension key should match the name retrieved in geo json
                                layer
                            .group(stateRaisedSum) // set crossfilter group
                            // closure used to retrieve x value from multi-value group
                            .keyAccessor(function(p) {return p.value.absGain;})
                            // closure used to retrieve y value from multi-value group
                            .valueAccessor(function(p) {return p.value.percentageGain;})
                            // (optional) define color function or array for bubbles
                            .colors(['#ccc', '#E2F2FF','#C4E4FF','#9ED2FF','#81C5FF','#6BBAFF','#51AEFF','#36A2FF','#1E96FF','#0089FF',
                                '#0061B5'])
                            // (optional) define color domain to match your data domain if you want to bind data or color
                            .colorDomain([-5, 200])
                            // (optional) define color value accessor
                            .colorAccessor(function(d, i){return d.value;})
                            // closure used to retrieve radius value from multi-value group
                            .radiusValueAccessor(function(p) {return p.value.fluctuationPercentage;})
                            // set radius scale
                            .r(d3.scale.linear().domain([0, 3]))
                            // (optional) whether chart should render labels, :default = true
                            .renderLabel(true)
                            // (optional) closure to generate label per bubble, :default = group.key
                            .label(function(p) {return p.key.getFullYear();})
                            // (optional) whether chart should render titles, :default = false
                            .renderTitle(true)
                            // (optional) closure to generate title per bubble, :default = d.key + ': ' + d.value
                            .title(function(d) {
                                return 'Title: ' + d.key;
                            })
                            // add data point to it's layer dimension key that matches point name will be used to
                            // generate bubble. multiple data points can be added to bubble overlay to generate
                            // multiple bubbles
                            .point('California', 100, 120)
                            .point('Colorado', 300, 120)
                            // (optional) setting debug flag to true will generate a transparent layer on top of
                            // bubble overlay which can be used to obtain relative x,y coordinate for specific
                            // data point, :default = false
                            .debug(true);
                        */

                    //#### Rendering
                    //simply call renderAll() to render all charts on the page
                    dc.renderAll();
                    /*
                    // or you can render charts belong to a specific chart group
                    dc.renderAll('group');
                    // once rendered you can call redrawAll to update charts incrementally when data
                    // change without re-rendering everything
                    dc.redrawAll();
                    // or you can choose to redraw only those charts associated with a specific chart group
                    dc.redrawAll('group');
                    */
                },
                function (response) {
                    $scope.message = "Error: " + response.status + " " + response.statusText;
                });
        };
    }
]);
'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular.module('core')
  .directive('showErrors', ['$timeout', '$interpolate', function ($timeout, $interpolate) {
    var linkFn = function (scope, el, attrs, formCtrl) {
      var inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses,
        initCheck = false,
        showValidationMessages = false,
        blurred = false;

      options = scope.$eval(attrs.showErrors) || {};
      showSuccess = options.showSuccess || false;
      inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
      inputNgEl = angular.element(inputEl);
      inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

      if (!inputName) {
        throw 'show-errors element has no child input elements with a \'name\' attribute class';
      }

      var reset = function () {
        return $timeout(function () {
          el.removeClass('has-error');
          el.removeClass('has-success');
          showValidationMessages = false;
        }, 0, false);
      };

      scope.$watch(function () {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function (invalid) {
        return toggleClasses(invalid);
      });

      scope.$on('show-errors-check-validity', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          initCheck = true;
          showValidationMessages = true;

          return toggleClasses(formCtrl[inputName].$invalid);
        }
      });

      scope.$on('show-errors-reset', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          return reset();
        }
      });

      toggleClasses = function (invalid) {
        el.toggleClass('has-error', showValidationMessages && invalid);
        if (showSuccess) {
          return el.toggleClass('has-success', showValidationMessages && !invalid);
        }
      };
    };

    return {
      restrict: 'A',
      require: '^form',
      compile: function (elem, attrs) {
        if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
          if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
            throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
          }
        }
        return linkFn;
      }
    };
  }]);

'use strict';

angular.module('core').factory('Censuses', ['$resource',
  function ($resource) {
    return $resource('api/censuses/:censusId', {
      censusId: '@_id'
    });
  }
]);


'use strict';

angular.module('core').factory('Donors', ['$resource',
  function ($resource) {
    return $resource('api/donors/:donorId', {
      donorId: '@_id'
    });
  }
]);

'use strict';

angular.module('core').factory('EarthQuakes', ['$resource',
  function ($resource) {
    return $resource('api/earthquakes/:earthquakeId', {
      earthquakeId: '@_id'
    });
  }
]);

'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector',
  function ($q, $injector) {
    return {
      responseError: function(rejection) {
        if (!rejection.config.ignoreAuthModule) {
          switch (rejection.status) {
            case 401:
              $injector.get('$state').transitionTo('authentication.signin');
              break;
            case 403:
              $injector.get('$state').transitionTo('forbidden');
              break;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = ['user', 'admin'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (!!~this.roles.indexOf('*')) {
        return true;
      } else {
        if(!user) {
          return false;
        }
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function (menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.state, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      roles: ['*']
    });
  }
]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);

'use strict';

angular.module('core').factory('Stocks', ['$resource',
  function ($resource) {
    return $resource('api/stocks/:stockId', {
      stockId: '@_id'
    });
  }
]);

'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
]);

'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
      });
  }
]);

'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);

'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function ($scope, $state, Authentication, userResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = $scope.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication', 'PasswordValidator',
  function ($scope, $http, Authentication, PasswordValidator) {
    $scope.user = Authentication.user;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');

        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
  function ($scope, $timeout, $window, Authentication, FileUploader) {
    $scope.user = Authentication.user;
    $scope.imageURL = $scope.user.profileImageURL;

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      $scope.user = Authentication.user = response;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };
  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SocialAccountsController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);

'use strict';

angular.module('users')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$validators.requirements = function (password) {
          var status = true;
          if (password) {
            var result = PasswordValidator.getResult(password);
            var requirementsIdx = 0;

            // Requirements Meter - visual indicator for users
            var requirementsMeter = [
              { color: 'danger', progress: '20' },
              { color: 'warning', progress: '40' },
              { color: 'info', progress: '60' },
              { color: 'primary', progress: '80' },
              { color: 'success', progress: '100' }
            ];

            if (result.errors.length < requirementsMeter.length) {
              requirementsIdx = requirementsMeter.length - result.errors.length - 1;
            }

            scope.requirementsColor = requirementsMeter[requirementsIdx].color;
            scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

            if (result.errors.length) {
              scope.popoverMsg = PasswordValidator.getPopoverMsg();
              scope.passwordErrors = result.errors;
              status = false;
            } else {
              scope.popoverMsg = '';
              scope.passwordErrors = [];
              status = true;
            }
          }
          return status;
        };
      }
    };
  }]);

'use strict';

angular.module('users')
  .directive('passwordVerify', [function() {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        var status = true;
        scope.$watch(function() {
          var combined;
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel;
          }
          return combined;
        }, function(value) {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              var origin = scope.passwordVerify;
              return (origin !== password) ? false : true;
            };
          }
        });
      }
    };
  }]);

'use strict';

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);

'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Please enter a passphrase or password with greater than 10 characters, numbers, lowercase, upppercase, and special characters.';
        return popoverMsg;
      }
    };
  }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
