'use strict';

angular.module('core').factory('Donors', ['$resource',
  function ($resource) {
    return $resource('api/donors/:donorId', {
      donorId: '@_id'
    });
  }
]);
