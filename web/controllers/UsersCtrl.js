define(function () {
    'use strict';
    return function ($scope, $http, $location, $window, $stateParams, $rootScope, $state,
                     usersManager,
                     groupsManager,
                     smsManager) {

      $scope.users = {};
      $scope.smsText = '';
      $scope.groupData = {};

      $scope.getUserList = function (groupId) {
        if (groupId) {
          groupsManager.groupData(groupId).then(
            function success (config) {
              $scope.groupData = config.data;
              $scope.users = $scope.groupData.users;
            },

            function failed (err) {
              console.log("error:", err);
            });
        } else {
          usersManager.userList().then(
            function success (config) {
              $scope.users = config.data;
            },

            function failed (err) {
              console.log("error:", err);
            });
        }
      };

      $scope.getUserList($stateParams.groupId);

      $scope.showDetails = function (userId) {
        $('#' + userId + ' .user-details').toggleClass('hide');
        $('#' + userId).toggleClass('show-details');
      };

      $scope.sendSms = function () {
        smsManager.sendSMStoUser($stateParams.userId, { sms: $scope.smsText }).then(
          function success (config) {
            $rootScope.back();
          },

          function failed (err) {
            console.log("error:", err);
          });
      };

      $scope.deleteUser = function (userId, userName) {
        if ($stateParams.groupId) {
          $scope.groupData.users = _.pluck($scope.groupData.users, '_id');

          $scope.groupData.users  = _.filter($scope.groupData.users, function (user) {
            return user !== userId;
          });

          $scope.updateGroup($stateParams.groupId, $scope.groupData);
        } else {
          $rootScope.deletedItems.users.push(userId);
          $rootScope.$broadcast('deleted_user', userId, userName);
        }
      };

      $("#sortable").sortable({
        forceHelperSize: true,
        cursor: 'move',
        start: function (event, ui) {
          ui.item.find('.user-details').addClass('hide');
          ui.item.removeClass('show-details');
          ui.item.height('35px');
            $('.droppable:not(.active)').droppable({
              hoverClass: 'droppable-hover',
              drop: function (event, ui) {
                var groupId = $(event.target).attr('id'),
                    userId = ui.draggable.attr('id'),
                    groupData = {};

                groupsManager.groupData(groupId).then(
                  function success (config) {
                    groupData = config.data;
                    if (groupData.users.length !== 0) {
                        groupData.users = _.pluck(groupData.users, '_id');
                    }
                    groupData.users.push(userId);
                    $scope.updateGroup(groupId, groupData);
                  },

                  function failed (err) {
                    console.log("error:", err);
                  });
              }
            });
        }
      });

      $("#sortable").disableSelection();

      $scope.updateGroup = function (groupId, groupData) {
        groupsManager.updateGroup(groupId, groupData).then(
          function success (config) {
            $scope.getUserList($stateParams.groupId);
            $rootScope.$broadcast('updated_group', groupId);
          },
          function failed (err) {
            console.log("error:", err);
          });
      };
    };
});
