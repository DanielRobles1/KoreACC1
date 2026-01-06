"use strict";
exports.__esModule = true;
var testing_1 = require("@angular/core/testing");
var dashboard_contable_service_1 = require("./dashboard-contable.service");
describe('DashboardContableService', function () {
    var service;
    beforeEach(function () {
        testing_1.TestBed.configureTestingModule({});
        service = testing_1.TestBed.inject(dashboard_contable_service_1.DashboardContableService);
    });
    it('should be created', function () {
        expect(service).toBeTruthy();
    });
});
