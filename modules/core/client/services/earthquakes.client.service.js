'use strict';

angular.module('core').factory('EarthQuakes', ['$resource',
  function ($resource) {
    return $resource('api/earthquakes/:earthquakeId', {
      earthquakeId: '@_id'
    });
  }
]);
