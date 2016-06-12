'use strict';

angular.module('core').factory('Stocks', ['$resource',
  function ($resource) {
    return $resource('api/stocks/:stockId', {
      stockId: '@_id'
    });
  }
]);
