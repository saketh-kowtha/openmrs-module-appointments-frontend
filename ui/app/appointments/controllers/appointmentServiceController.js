'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentServiceController', ['$scope', '$q', 'spinner', '$window', '$state', '$translate',
        'appointmentsServiceService', 'locationService', 'messagingService', 'specialityService', 'ngDialog',
        'appService', 'appointmentServiceContext',
        function ($scope, $q, spinner, $window, $state, $translate, appointmentsServiceService, locationService,
                  messagingService, specialityService, ngDialog, appService, appointmentServiceContext) {
            $scope.showConfirmationPopUp = true;
            $scope.enableSpecialities = appService.getAppDescriptor().getConfigValue('enableSpecialities');
            $scope.enableServiceTypes = appService.getAppDescriptor().getConfigValue('enableServiceTypes');
            $scope.enableCalendarView = appService.getAppDescriptor().getConfigValue('enableCalendarView');
            $scope.colorsForAppointmentService = appService.getAppDescriptor().getConfigValue('colorsForAppointmentService');
            var serviceDetails = appointmentServiceContext ? appointmentServiceContext.service : {};
            $scope.service = Bahmni.Appointments.AppointmentServiceViewModel.createFromResponse(serviceDetails);
            $scope.service.color = $scope.service.color || $scope.colorsForAppointmentService && $scope.colorsForAppointmentService[0] || "#008000";

            $scope.save = function () {
                clearValuesIfDisabledAndInvalid();
                if ($scope.createServiceForm.$invalid) {
                    messagingService.showMessage('error', 'INVALID_SERVICE_FORM_ERROR_MESSAGE');
                    return;
                }
                var service = Bahmni.Appointments.AppointmentService.createFromUIObject($scope.service);
                appointmentsServiceService.save(service).then(function () {
                    messagingService.showMessage('info', 'APPOINTMENT_SERVICE_SAVE_SUCCESS');
                    $scope.showConfirmationPopUp = false;
                    $state.go('home.admin.service');
                });
            };

            var clearValuesIfDisabledAndInvalid = function () {
                var form = $scope.createServiceForm;
                if (form.serviceTime.$invalid && $scope.hasWeeklyAvailability()) {
                    $scope.service.startTime = undefined;
                    $scope.service.endTime = undefined;
                    form.serviceTime.$setValidity('timeSequence', true);
                }
                if (form.serviceMaxLoad.$invalid && ($scope.hasWeeklyAvailability() || $scope.hasServiceTypes())) {
                    $scope.service.maxAppointmentsLimit = undefined;
                    form.serviceMaxLoad.$setValidity('min', true);
                }
            };

            $scope.hasWeeklyAvailability = function () {
                return ($scope.service.weeklyAvailability.length > 0);
            };

            $scope.hasServiceTypes = function () {
                return ($scope.service.serviceTypes.length > 0);
            };

            $scope.confirmForEdit = function () {
                return !$scope.service.uuid || ($window.confirm($translate.instant('CONFIRM_DELETE_AVAILABILITY')));
            };

            $scope.validateServiceName = function () {
                var name = $scope.service.name;
                $scope.createServiceForm.name.$setValidity('uniqueServiceName', name ? isServiceNameUnique(name) : true);
            };

            var isServiceNameUnique = function (serviceName) {
                return !$scope.services.some(function (service) {
                    return service.name.toLowerCase() === serviceName.toLowerCase();
                });
            };

            var initAppointmentLocations = function () {
                return locationService.getAllByTag('Appointment Location').then(function (response) {
                    $scope.locations = response.data.results;
                }
                );
            };

            var initSpecialities = function () {
                return specialityService.getAllSpecialities().then(function (response) {
                    $scope.specialities = response.data;
                });
            };

            var initServices = function () {
                return appointmentsServiceService.getAllServices().then(function (response) {
                    $scope.services = response.data;
                });
            };

            var init = function () {
                var promises = [];
                promises.push(initAppointmentLocations());
                promises.push(initServices());
                if ($scope.enableSpecialities) {
                    promises.push(initSpecialities());
                }
                return spinner.forPromise($q.all(promises));
            };

            $scope.continueWithoutSaving = function () {
                $scope.showConfirmationPopUp = false;
                $state.go($scope.toStateConfig.toState, $scope.toStateConfig.toParams);
                ngDialog.close();
            };

            $scope.cancelTransition = function () {
                $scope.showConfirmationPopUp = true;
                ngDialog.close();
            };

            $scope.displayConfirmationDialog = function () {
                ngDialog.openConfirm({
                    template: 'views/admin/appointmentServiceSaveConfirmation.html',
                    scope: $scope,
                    closeByEscape: true
                });
            };

            var cleanUpListenerStateChangeStart = $scope.$on('$stateChangeStart',
                function (event, toState, toParams) {
                    if ($scope.createServiceForm.$dirty && $scope.showConfirmationPopUp) {
                        event.preventDefault();
                        ngDialog.close();
                        $scope.toStateConfig = {toState: toState, toParams: toParams};
                        $scope.displayConfirmationDialog();
                    }
                }
            );

            $scope.$on("$destroy", function () {
                cleanUpListenerStateChangeStart();
            });

            return init();
        }]);