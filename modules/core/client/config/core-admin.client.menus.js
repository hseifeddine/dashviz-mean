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
