/*global todomvc, angular, Firebase */
'use strict';

/**
* The main controller for the app. The controller:
* - retrieves and persists the model via the $firebaseArray service
* - exposes the model to the template and provides event handlers
*/
todomvc.controller('TodoCtrl',
['$scope', '$location', '$firebaseArray', 'RESTfulAPI', '$sce', '$localStorage', '$window',
function ($scope, $location, $firebaseArray, RESTfulAPI, $sce, $localStorage, $window) {
	// set local storage
	$scope.$storage = $localStorage;

	var scrollCountDelta = 10;
	$scope.maxQuestion = scrollCountDelta;

	/*
	$(window).scroll(function(){
	if($(window).scrollTop() > 0) {
	$("#btn_top").show();
} else {
$("#btn_top").hide();
}
});
*/
var splits = $location.path().trim().split("/");
var roomId = angular.lowercase(splits[1]);
if (!roomId || roomId.length === 0) {
	roomId = "all";
}

// TODO: Please change this URL for your app
var firebaseURL = "https://crackling-torch-6031.firebaseio.com/";


$scope.roomId = roomId;
var url = firebaseURL + roomId + "/questions/";
var echoRef = new Firebase(url);

var query = echoRef.orderByChild("order");
// Should we limit?
//.limitToFirst(1000);
//$scope.todos = $firebaseArray(query);
var params = {roomName: roomId};
$scope.todos = RESTfulAPI.postQuery(params);

var serverURL = 'http://52.74.132.232:5000';
$scope.socket = io.connect(serverURL);
$scope.socket.emit('join', {room: roomId});
$scope.socket.on('new post', function(data){
	var post = angular.fromJson(data);
	post.reply = [];
	$scope.todos.splice(0, 0, post);
	$scope.$apply();
});

$scope.input = {wholeMsg : ''};
$scope.editedTodo = null;

Date.prototype.dateDiff = function(interval,now) { 
    var t = now.getTime() - this.getTime();
    var i = {};
    
    i['d']=Math.floor(t/86400000);
    t = t % 86400000;
    i['h']=Math.floor(t/3600000);
    t = t % 3600000;
    i['m']=Math.floor(t/60000);
    t = t % 60000;
    i['s']=Math.floor(t/1000);
    return i[interval]; 
};

$scope.getQYTime = function(postTime) {
    if (postTime == 0) return '';
    var postDate = new Date(postTime);
    var now = new Date();
    var d = postDate.dateDiff('d',now);
    var h = postDate.dateDiff('h',now);
    var m = postDate.dateDiff('m',now);
    var s = postDate.dateDiff('s',now);
    var dateString = "";
    if (d != 0) {
	dateString+=d;
	if (d == 1) {
	    dateString +=" day ";
	} else  {
	    dateString +=" days ";
	}
	if (h == 0) {
	    dateString +="ago";
	} else if (h==1) {
	    dateString +="1 hour ago";
	} else {
	    dateString +=h+" hours ago";
	}
    } else {
	if (h == 0) {
	} else if (h == 1) {
	    dateString = "1 hour ";
	} else {
	    dateString = h + " hours ";
	}

	if (m == 0) {
	    dateString += "ago";
	} else if (m == 1) {
	    dateString += "1 minute ago";
	} else {
	    dateString += m+" minutes ago";
	}
    }
    if (dateString == '' || dateString =="ago") return 'just now';
    return dateString;
};	

$scope.trInput = {
    from: {
	name: 'The Start',
	value: -5000000000000
    },
    to: {
	name: 'Now',
	value: 5000000000000
    }
};

$scope.trOptions = [
    {
	name: 'Now',
	value: 5000000000000
    },
    {
	name: '1 hour ago',
	value: -3600000
    },
    {
	name: '2 hours ago',
	value: -7200000
    },
    {
	name: '1 day ago',
	value: -24*3600000
    },
    {
	name: '1 week ago',
	value: -7*24*3600000
    },
    {
	name: '30 days ago',
	value: -30*24*3600000
    },
    {
	name: '365 days ago',
	value: -365*24*3600000
    },
    {
	name: 'The Start',
	value: -5000000000000
    }
];

/* this is the old one
$scope.getPreMsg = function($string) {
    var preMsg = "<pre>";
    var inHashtag = false;
    for (var i = 0; i < $string.length; ++i) {
	var ch = $string.charAt(i);
	if (inHashtag && (ch == ' ' || ch == '\n')) {
	    inHashtag = false;
	    preMsg+="</strong>";
	}
	if (ch == '<') {
	    preMsg+="&lt;";
	} else if (ch == '>') {
	    preMsg+="&gt;";
	} else if (ch == '\"') {
	    preMsg+="&quot;";
	} else if (ch == '#' && !inHashtag) {
	    inHashtag = true;
	    preMsg+="<strong>"+ch;
	} else {
	    preMsg+=ch;
	}
    }
    preMsg+="</pre>"
    return preMsg;
};
*/

$scope.getPreMsg = function($string) {
    var preMsg = "<pre>";
    for (var i = 0; i < $string.length; ++i) {
	var ch = $string.charAt(i);
	if (ch == '<') {
	    preMsg+="&lt;";
	} else if (ch == '>') {
	    preMsg+="&gt;";
	} else if (ch == '\"') {
	    preMsg+="&quot;";
	} else {
	    preMsg+=ch;
	}
    }
    preMsg+="</pre>"
    return preMsg.replace(/#\w+/g, function(s) {
	return "<strong>" + s + "</strong>";
    });
};
    
// pre-precessing for collection
$scope.$watchCollection('todos', function () {
	var total = 0;
        var remaining = 0;
	$scope.todos.forEach(function (todo) {
		// Skip invalid entries so they don't break the entire app.
		if (!todo || !todo.head ) {
			return;
		}

		total++;
		if (todo.completed === false) {
			remaining++;
		}

	    // set time

	    todo.dateString = $scope.getQYTime(todo.timestamp);
	    todo.tags = todo.wholeMsg.match(/#\w+/g);
//	    todo.splitMsg=todo.desc.split(/(#\w+)/g);
//	    todo.displayMsg = [];
//	    for (var i in todo.splitMsg){
//		if (todo.splitMsg[i][0] != '#') todo.displayMsg.push($sce.trustAsHtml('<plaintext>'+todo.splitMsg[i]));
//		else todo.displayMsg.push($sce.trustAsHtml('<a href="">' + todo.splitMsg[i] + '</a>'));
//	    }
	    todo.preMsg = $scope.getPreMsg(todo.desc);
	    todo.trustedDesc = $sce.trustAsHtml(Autolinker.link(todo.preMsg, {newWindow: false, stripPrefix: false}));
	});

	$scope.totalCount = total;
	$scope.remainingCount = remaining;
	$scope.completedCount = total - remaining;
	$scope.allChecked = remaining === 0;
	$scope.absurl = $location.absUrl();
}, true);

$scope.editInput = function($string) {
	if ($string.length >= 11 && $string.toString().slice(0,11) == '<plaintext>') return;
	$scope.input.wholeMsg = $string.toString().match(/#\w+/g)[0];
};
    
$scope.trustHtml = function (desc) {
    return $sce.trustAsHtml(desc);
};

// Get the first sentence and rest
$scope.getFirstAndRestSentence = function($string) {
	var head = $string;
	var desc = " ";

	var separators = [". ", "? ", "! ", '\n'];

	var firstIndex = -1;
	for (var i in separators) {
		var index = $string.indexOf(separators[i]);
		if (index == -1) continue;
		if (firstIndex == -1) {firstIndex = index; continue;}
		if (firstIndex > index) {firstIndex = index;}
	}

	if (firstIndex !=-1) {
		head = $string.slice(0, firstIndex+1);
		desc = $string.slice(firstIndex+1);
	}
	return [head, desc];
};

$scope.addTodo = function () {
	var newTodo = $scope.input.wholeMsg.trim();

	// No input, so just do nothing
	if (!newTodo.length) {
		return;
	}

	var firstAndLast = $scope.getFirstAndRestSentence(newTodo);
	var head = firstAndLast[0];
	var desc = firstAndLast[1];
    var preMsg = $scope.getPreMsg(desc);

    $scope.todos.$add({
    	roomName: roomId,
		wholeMsg: newTodo,
		head: head,
		headLastChar: head.slice(-1),
		desc: desc,
	        linkedDesc: Autolinker.link(desc, {newWindow: false, stripPrefix: false}),
		completed: false,
		timestamp: new Date().getTime(),
		tags: "...",
	        echo: 0,
 	        hate: 0,
	        preMsg: preMsg,
	        reply: [],
	        new_reply: '',
	        order: 0,
	image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAEbklEQVR4Xu3Yv2skZQDH4XcGyQ8TFLS6zsbKv8FWyA9SZDfhrCxEsLxOS6+ythUbbRR3tgnJ1lb+CVfYyDV2CnfgJkGyKysb1PPcnU34NjtPqhTvfGE+8zDZbFX8KBAoUAU2TSpQwIIgUgCsSFajYDEQKQBWJKtRsBiIFAArktUoWAxECoAVyWoULAYiBcCKZDUKFgORAmBFshoFi4FIAbAiWY2CxUCkAFiRrEbBYiBSAKxIVqNgMRApAFYkq1GwGIgUACuS1ShYDEQKgBXJahQsBiIFwIpkNQoWA5ECYEWyGgWLgUgBsCJZjYLFQKQAWJGsRsFiIFIArEhWo2AxECkAViSrUbAYiBQAK5LVKFgMRAqAFclqFCwGIgXAimQ1ChYDkQJgRbIaBYuBSAGwIlmNgsVApABYkaxGwWIgUgCsSFajYDEQKQBWJKtRsBiIFAArktUoWAxECoAVyWoULAYiBcCKZDUKFgORAmBFshoFi4FIAbAiWY2CxUCkAFiRrEbBYiBSAKxIVqNgMRApAFYkq9G1g3VwcPDt9vb2w7aP9vLy8ruLi4v32553rl2BtYM1u+0Zrq2trYd1XS+tMJ1O/zozHo+/GY1GHyy9wIFWBdYS1u2drwoMrlZmWh1aa1irAptMJmU4HHaiSSsd9zjUqYirvMGur6+fnJ2dvXOPtp2+tFOwVnmDzT97PW+a5vVOC7njzXcS1m2rXq83XfQBf47rt6Zp3rxj385e1mlY+/v7X+3s7Hy46Onf/td4dXX1+Pz8/LPOSlnxxjsNa9bq6Ojop42Njbdnv1fV/+e4BTadTi+Hw+GrK3bu3PHOw/rnE+/3+8+qqnpt2RtsPB4/Go1GX3ROywo3DNYLsfr9/q9VVb2xDFcpZVJK+bFpmndX6N2Zo2C95FEfHh5+vrm5+emyb+7nfx7/KKX8XlXV14PB4FFn5Cy5UbAWBOr1er/Udf2gDZY5siellO+bpnnc5pp1PgPWkqfb6/V+rqrqrUUf7F+cGAwGne/a+QBt3hp7e3sf7e7uftnm7OwMWKWA1VLL8fHx86qqdmfH67pe2A0ssFqy+vexk5OTi8lk8t4c2Sv+FP43ozfWnWj9fdHp6eknNzc3H8+/YH1aSvmhaZrOf0MP1j1hufzlBcAiI1IArEhWo2AxECkAViSrUbAYiBQAK5LVKFgMRAqAFclqFCwGIgXAimQ1ChYDkQJgRbIaBYuBSAGwIlmNgsVApABYkaxGwWIgUgCsSFajYDEQKQBWJKtRsBiIFAArktUoWAxECoAVyWoULAYiBcCKZDUKFgORAmBFshoFi4FIAbAiWY2CxUCkAFiRrEbBYiBSAKxIVqNgMRApAFYkq1GwGIgUACuS1ShYDEQKgBXJahQsBiIFwIpkNQoWA5ECYEWyGgWLgUgBsCJZjYLFQKQAWJGsRsFiIFIArEhWo2AxECkAViSrUbAYiBQAK5LVKFgMRAqAFclqFCwGIgXAimQ1ChYDkQJgRbIaBYuBSIE/AcColpfqcNd2AAAAAElFTkSuQmCC"
         });
	// remove the posted question in the input
	$scope.input.wholeMsg = '';
};


$scope.addReply = function (todo) {
    var now = new Date();
    if (todo.new_reply=='') return;
    $scope.todos.$addReply(todo, {
    	postId: todo._id,
    	wholeMsg: todo.new_reply,
    	timestamp: now.getTime()
    });
    todo.new_reply = '';
};

$scope.editTodo = function (todo) {
        $scope.editedTodo = todo;
        $scope.originalTodo = angular.extend({}, $scope.editedTodo);
};

$scope.addEcho = function (todo) {
	$scope.editedTodo = todo;
	todo.echo = todo.echo + 1;
	// Hack to order using this order.
        todo.order = todo.order -1;
	$scope.todos.$save(todo);

	// Disable the button
	$scope.$storage[todo._id] = "echoed";
};

$scope.addHate = function (todo) {
	$scope.editedTodo = todo;
	todo.hate = todo.hate + 1;
	// Hack to order using this order.
	todo.order = todo.order + 1;
	$scope.todos.$save(todo);

	// Disable the button
	$scope.$storage[todo._id] = "echoed";
};


$scope.doneEditing = function (todo) {
	$scope.editedTodo = null;
	var wholeMsg = todo.wholeMsg.trim();
	if (wholeMsg) {
		$scope.todos.$save(todo);
	} else {
		$scope.removeTodo(todo);
	}
};

$scope.revertEditing = function (todo) {
	todo.wholeMsg = $scope.originalTodo.wholeMsg;
	$scope.doneEditing(todo);
};

$scope.removeTodo = function (todo) {
	$scope.todos.$remove(todo);
};

$scope.clearCompletedTodos = function () {
	$scope.todos.forEach(function (todo) {
		if (todo.completed) {
			$scope.removeTodo(todo);
		}
	});
};

$scope.toggleCompleted = function (todo) {
	todo.completed = !todo.completed;
	$scope.todos.$save(todo);
};

$scope.markAll = function (allCompleted) {
	$scope.todos.forEach(function (todo) {
		todo.completed = allCompleted;
		$scope.todos.$save(todo);
	});
};

$scope.FBLogin = function () {
	var ref = new Firebase(firebaseURL);
	ref.authWithOAuthPopup("facebook", function(error, authData) {
		if (error) {
			console.log("Login Failed!", error);
		} else {
			$scope.$apply(function() {
				$scope.$authData = authData;
				$scope.isAdmin = true;
			});
			console.log("Authenticated successfully with payload:", authData);
		}
	});
};

$scope.FBLogout = function () {
	var ref = new Firebase(firebaseURL);
	ref.unauth();
	delete $scope.$authData;
	$scope.isAdmin = false;
};

$scope.increaseMax = function () {
	if ($scope.maxQuestion < $scope.totalCount) {
		$scope.maxQuestion+=scrollCountDelta;
	}
};

$scope.toTop =function toTop() {
	$window.scrollTo(0,0);
};

// Not sure what is this code. Todel
if ($location.path() === '') {
	$location.path('/');
}
$scope.location = $location;

// autoscroll
angular.element($window).bind("scroll", function() {
	if ($window.innerHeight + $window.scrollY >= $window.document.body.offsetHeight) {
		console.log('Hit the bottom2. innerHeight' +
		$window.innerHeight + "scrollY" +
		$window.scrollY + "offsetHeight" + $window.document.body.offsetHeight);

		// update the max value
		$scope.increaseMax();

		// force to update the view (html)
		$scope.$apply();
	}
});

}]);
