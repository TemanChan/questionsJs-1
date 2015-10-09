'use strict';

describe("directive Test", function() {
    var scope;
    var compile;

    beforeEach(module('todomvc'));
    
    beforeEach(inject(function($compile,$rootScope) {
	scope = $rootScope.$new();

	compile = $compile;
    }));
    
    it("todoEscape Test", function() {
	var element = compile('<todo-blur todo-escape="t=1"></todo-blur>')(scope);
	var e = $.Event("keydown");
	scope.t = 0;
	e.keyCode = 28;
	element.trigger(e);
	expect(scope.t).toBe(0);
	e.keyCode = 27;
	element.trigger(e);
	expect(scope.t).toBe(1);
    });
    
    it("todoFocus Test", function() {
	var element = compile('<todo-blur todo-focus="tmp"></todo-blur>')(scope);
	scope.tmp = false;
	element.scope().$apply();
	
	scope.tmp = true;
	element.scope().$apply();
    });

});
