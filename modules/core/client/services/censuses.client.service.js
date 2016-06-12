'use strict';

angular.module('core').factory('Censuses', ['$resource',
  function ($resource) {
    return $resource('api/censuses/:censusId', {
      censusId: '@_id'
    });
  }
]);

