/*global todomvc, angular, Firebase */
'use strict';


/**
* The main controller for the app. The controller:
* - retrieves and persists the model via the $firebaseArray service
* - exposes the model to the template and provides event handlers
*/
todomvc.controller('TodoCtrl',
['$scope', '$location', 'RESTfulAPI', '$sce', '$localStorage', '$window',
function ($scope, $location, RESTfulAPI, $sce, $localStorage, $window) {
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
//    var roomId = angular.lowercase(splits[1]);
    var roomId = splits[1];
if (!roomId || roomId.length === 0) {
	roomId = "all";
}

    //user
    $scope.username = '';
    $scope.password = '';
    
    //doodle
var pad = document.getElementById('spad');
var ctx;
if (pad!=null)
    {ctx = pad.getContext('2d');}
var color;
var size;
var $cont = $('.wrapper');
var $can = $cont.find('#spad');

function conv(x, y) {
    return [x - $can.offset().left, y - $can.offset().top];
}
    
function splitColor(text) {
    return (text.split('='))[1].split("\"")[1];
}
    

$scope.roomId = roomId;

var params = {roomName: roomId};
$scope.todos = RESTfulAPI.postQuery(params);
$scope.image = '';    
//isAdmin is true if the user has log n
    $scope.isAdmin = false;
//authname will denote the name of the current user
    $scope.authname = '';
    
$scope.input = {wholeMsg : ''};
$scope.editedTodo = null;
//incognito is true if the user is in incognito mode
    $scope.incognito = false;

    //datediff returns the difference now and the date
    //return value is specified by interval (d,h,m,s)
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

    //getQYTime transfers the post time to the correct time string
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

//trInpot and options are for time range filter
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

//getPreMsg transfer the string into preMsg to aviod XSS
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

    /*
$scope.editInput = function($string) {
	if ($string.length >= 11 && $string.toString().slice(0,11) == '<plaintext>') return;
	$scope.input.wholeMsg = $string.toString().match(/#\w+/g)[0];
};
    */

    //trust the input as html
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

    var username = 'Anonymous';
    var anonymous = true;

    //if is loged in, the username is kept
    //anonymous is for incognito
    if ($scope.isAdmin) {
	username = $scope.authname;
	anonymous = $scope.incognito;
    }

	var firstAndLast = $scope.getFirstAndRestSentence(newTodo);
	var head = firstAndLast[0];
	var desc = firstAndLast[1];
    var preMsg = $scope.getPreMsg(desc);
    //the image is the one produced by doodle
    var image = $scope.image;
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
	        image: image,
	        username: username,
	        anonymous: anonymous
         });
	// remove the posted question in the input
    $scope.input.wholeMsg = '';
    $scope.image = '';
};


$scope.addReply = function (todo) {
    var now = new Date();
    if (todo.new_reply=='') return;

    var username = 'Anonymous';
    var anonymous = true;
    
    if ($scope.isAdmin) {
	username = $scope.authname;
	anonymous = $scope.incognito;
    }

    $scope.todos.$addReply(todo, {
    	postId: todo._id,
    	wholeMsg: todo.new_reply,
    	timestamp: now.getTime(),
	username: username,
	anonymous: anonymous
    });
    todo.new_reply = '';
};

$scope.editTodo = function (todo) {
        $scope.editedTodo = todo;
        $scope.originalTodo = angular.extend({}, $scope.editedTodo);
};

$scope.addEcho = function (todo) {
	$scope.editedTodo = todo;
	$scope.todos.$like(todo);
	// Disable the button
	$scope.$storage[todo._id] = "echoed";
};

$scope.addHate = function (todo) {
	$scope.editedTodo = todo;
	$scope.todos.$dislike(todo);

	// Disable the button
	$scope.$storage[todo._id] = "echoed";
};

$scope.reply_to = function (r, todo) {
    if (r.anonymous) {
	todo.new_reply = "+Anonymous "+todo.new_reply;
    } else {
	todo.new_reply = "+"+r.username+" "+todo.new_reply;
    }
};
    
$scope.doneEditing = function (todo) {
	$scope.editedTodo = null;
	var wholeMsg = todo.wholeMsg.trim();
	if (wholeMsg) {
		$scope.todos.$save(todo);
	} else {
	    $scope.removeTodo(todo, $scope.authname);
	}
};

$scope.revertEditing = function (todo) {
	todo.wholeMsg = $scope.originalTodo.wholeMsg;
	$scope.doneEditing(todo);
};

$scope.removeTodo = function (todo) {
    $scope.todos.$remove(todo, $scope.authname);
};

$scope.clearCompletedTodos = function () {
	$scope.todos.forEach(function (todo) {
		if (todo.completed) {
		    $scope.removeTodo(todo, $scope.authname);
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

    /*
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
    */
    
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

//initialize doodle
$scope.color = "#555";
$scope.size = "5";
$scope.width = 700;
$scope.height = 150;
$scope.image = '';
    
$can.mousedown(function(e) {
    ctx.lineWidth = $scope.size;
    ctx.beginPath();

    var con = conv(e.pageX, e.pageY);
    var x = con[0];
    var y = con[1];

    ctx.moveTo(x, y);

    $(this).mousemove(function(e) {
        var con = conv(e.pageX, e.pageY);
        var x = con[0];
        var y = con[1];
	
        var d = 400;
        var bar = (x < d || y < d || x > 500 - d || y > 500 - d);
	
        if (bar) {
            ctx.lineTo(x, y);
            ctx.strokeStyle = $scope.color;
            ctx.stroke();
        } else {
            $(this).unbind('mousemove');
        }
        });
    
}).mouseup(function(e) {
    $(this).unbind('mousemove');
});
    

$cont.find('.butt_col').each(function() {
    var $t = $(this);
    var col = splitColor($t.attr('ng-click'));
    $t.css({
        'background-color': col
    });
});

$scope.resetDoodle = function() {
    ctx.clearRect(0, 0, pad.width, pad.height);
    $scope.image='';
};

$scope.saveImage = function() {
    var url = pad.toDataURL("image/png");
    $scope.image = url;
};
    

$scope.signupCallback = function(result) {
    if (!result) {
	console.log("Sign up Failed! Username exits.");
    } else {
	$scope.authname = $scope.username;
	$scope.username = '';
	$scope.password = '';
	$scope.isAdmin = true;
	console.log("Successfully sign up and log in");//, authData);
    }
};

$scope.loginCallback = function(result) {
    if (!result) {
	console.log("Log in failed");
    } else {
	$scope.authname = $scope.username;
	$scope.isAdmin = true;
	$scope.username = '';
	$scope.password = '';
	console.log("Successfully log in");//, authData);
    }
};
    
    
$scope.signup = function() {
    if ($scope.isAdmin) return;
    RESTfulAPI.signup($scope.username, $scope.password, $scope.signupCallback);
};

$scope.login = function() {
    if ($scope.isAdmin) return;
    RESTfulAPI.login($scope.username, $scope.password, $scope.loginCallback);
};

$scope.logout = function() {
    $scope.isAdmin = false;
    $scope.username = '';
    $scope.password = '';
    $scope.authname = '';
};
    
}]);
