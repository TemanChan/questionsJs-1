'use strict';

describe('sorting the list of users', function() {
  it('sorts in descending order by default', function() {
    var users = ['jack', 'igor', 'jeff'];
    //    var sorted = sortUsers(users);
    //    expect(sorted).toEqual(['jeff', 'jack', 'igor']);
  });
});

describe('TodoCtrl', function() {
  beforeEach(module('todomvc'));
  // variables for injection
  var controller;
  var scope;
  var location;
  var firebaseArray;
  var sce;
  var localStorage;
  var window;
  var httpBackend;

  // Injecting variables
  // http://stackoverflow.com/questions/13664144/how-to-unit-test-angularjs-controller-with-location-service
  beforeEach(inject(function($location,
    $rootScope,
    $controller,
    $firebaseArray,
    $localStorage,
    $sce,
    $window,
    $httpBackend){
      // The injector unwraps the underscores (_) from around the parameter names when matching

      scope = $rootScope.$new();

      location = $location;
      controller = $controller;
      firebaseArray = $firebaseArray;
      sce = $sce;
      localStorage = $localStorage;
      window = $window;
      httpBackend = $httpBackend;
    }));

    describe('TodoCtrl Testing', function() {
      var testTodo = {
	  wholeMsg: "Test. ",
	  head: "Test. ",
	  headLastChar: '.',
	  desc: '',
	  linkedDesc: Autolinker.link(''  , {newWindow: false, stripPrefix: false}),
	  completed: true,
	  new_reply: '',
	  reply: [[' ',0]],
	  timestamp: new Date().getTime()-60001,
	  tags: "...",
	  echo: 0,
	  order: 0
      };

      var testTodo3 = {
	  wholeMsg: "Test! #hash",
	  head: "Test! ",
	  headLastChar: '!',
	  desc: '#hash',
	  linkedDesc: Autolinker.link(''  , {newWindow: false, stripPrefix: false}),
	  completed: false,
	  timestamp: new Date().getTime()-100000000,
	  tags: "...",
	  new_reply: 'new',
	  reply: [[' ',0]],
	  echo: 0,
	  order: 0
      };

      var testTodo2 = {
	  wholeMsg: ''      ,
	  head: ''      ,
	  headLastChar: '' ,
	  desc: '',
	  linkedDesc: Autolinker.link(''  , {newWindow: false, stripPrefix: false}),
	  completed: false,
	  timestamp: new Date().getTime()-3600001,
	  tags: "...",
	  new_reply: 'new',
	  reply: [[' ',0]],
	  echo: 0,
	  order: 0
      };

      var todos = {
	  forEach: function(foo) {
	      foo(testTodo);
	      foo(testTodo2);
	      foo(testTodo3);
	  },
	  $remove: function(a, b) {
	  }
      }
	


      it('watchCollection Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window,
          $httpBackend: httpBackend
        });
    //httpBackend.expectGET(scope.serverURL + '/api/posts?roomName=all').respond();
    httpBackend.expectGET().respond();
	  scope.todos = todos;
	  scope.$digest();
	  
      });

      it('getQYTime Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });

	  expect(scope.getQYTime(0)).toBe('');
	  var now = new Date().getTime();
	  expect(scope.getQYTime(now)).toBe('just now');
	  expect(scope.getQYTime(now-3600000)).toBe('1 hour ago');
	  expect(scope.getQYTime(now-3600000)).toBe('1 hour ago');
	  expect(scope.getQYTime(now-86400000*2)).toBe('2 days ago');
	  expect(scope.getQYTime(now-86400000*2-3600000)).toBe('2 days 1 hour ago');
	  expect(scope.getQYTime(now-2*3600000-2*60000)).toBe('2 hours 2 minutes ago');
	  
      });

	
      it('setFirstAndRestSentence', function() {
        var ctrl = controller('TodoCtrl', {
          $scope: scope
        });

        var testInputs = [
          {str:"Hello? This is Sung", exp: "Hello?"},
          {str:"Hello.co? This is Sung", exp: "Hello.co?"},
          {str:"Hello.co This is Sung", exp: "Hello.co This is Sung"},
          {str:"Hello.co \nThis is Sung", exp: "Hello.co \n"},
          {str:"Hello. Hi? This is Sung", exp: "Hello."},
          {str:"Hello? Hi. This is Sung", exp: "Hello?"},
          {str:"Hello?? This is Sung", exp: "Hello??"},
        ];

        for (var i in testInputs) {
          var results = scope.getFirstAndRestSentence(testInputs[i].str);
          expect(results[0]).toEqual(testInputs[i].exp);
        }
      });

	it('getPreMsg Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });

	    expect(scope.getPreMsg('<em>\"#test\"</em>')).toBe('<pre style="background-color:white; border:none;">&lt;em&gt;&quot;<strong>#test</strong>&quot;&lt;/em&gt;</pre>');
	  
      });


      it('addTodo Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });

	  scope.input = {wholeMsg : "test"};
	  scope.isAdmin = true;
	scope.addTodo();
	  expect(scope.input.wholeMsg).toBe('');
	  scope.input = {wholeMsg : "test"};
	  scope.isAdmin = false;
	scope.addTodo();
	scope.addTodo();
	expect(scope.input.wholeMsg).toBe('');
      });

      it('editTodo Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });

        expect(scope.editTodo(testTodo)).toBe(undefined);
      });

/*
	it('editInput Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });

	    scope.input = {wholeMsg: ""};
	    var str = "<plaintext>abc".toString();
	    scope.editInput(str);
            expect(scope.input.wholeMsg).toEqual("");
	    str = "#abc".toString();
	    scope.editInput(str);
	    expect(scope.input.wholeMsg).toEqual("#abc");
	    
      });
*/
	
      it('inscreaseMax Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });
	scope.maxQuestion = 10;
	scope.totalCount = 11;
	expect(scope.increaseMax()).toBe(undefined);
	scope.maxQuestion = 11;
        expect(scope.increaseMax()).toBe(undefined);
      });

      it('addReply Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });
	  expect(scope.addReply(testTodo)).toBe(undefined);
	  scope.isAdmin = false;
	expect(scope.addReply(testTodo3)).toBe(undefined);
	  scope.isAdmin = true;
	expect(scope.addReply(testTodo2)).toBe(undefined);
	  
      });
	
      it('doneEditing Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });
	expect(scope.doneEditing(testTodo)).toBe(undefined);
	expect(scope.doneEditing(testTodo2)).toBe(undefined);
      });

      it('editTodo Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });

        expect(scope.editTodo(testTodo)).toBe(undefined);
      });

      it('revertEditing Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });
	scope.originalTodo = {wholeMsg: "test"};
        expect(scope.revertEditing(testTodo)).toBe(undefined);
      });

	it('clearCompletedTodos Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });
	    scope.todos = todos;
	    scope.clearCompletedTodos();
      });


      it('RoomId', function() {
        location.path('/new/path');

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location
        });

	  expect(scope.roomId).toBe("new");
      });

      it('image', function() {
        location.path('/new/path');

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location
        });

        expect(scope.image).toBe('');
      });

      it('usersystem', function() {
        location.path('/new/path');

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location
        });

          expect(scope.authname).toBe('');
	  expect(scope.username).toBe('');
	  expect(scope.password).toBe('');
	  expect(scope.isAdmin).toBe(false);
      });

      it('signupCallback Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });

	  scope.signupCallback(false);
	  expect(scope.isAdmin).toBe(false);
	  scope.signupCallback(true);
	  expect(scope.isAdmin).toBe(true);
			   
      });

      it('loginCallback Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });

	  scope.loginCallback(false);
	  expect(scope.isAdmin).toBe(false);
	  scope.username="Peter";
	  scope.loginCallback(true);
	  expect(scope.isAdmin).toBe(true);
	  expect(scope.welcomeMsg).toBe("Welcome, Peter!");
			   
      });


      it('signup Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });
	  scope.isAdmin = false;
	  scope.signup();
	  scope.isAdmin = true;
	  scope.signup();
			   
      });

      it('login Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });
	  scope.isAdmin = false;
	  scope.login();
	  scope.isAdmin = true;
	  scope.login();
			   
      });

      it('logout Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });
	  scope.isAdmin = true;
	  scope.logout();
	  expect(scope.isAdmin).toBe(false);
			   
      });

	
      it('toTop Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });

        scope.toTop();
        expect(window.scrollX).toBe(0);
        expect(window.scrollY).toBe(0);
      });
    });
  });
