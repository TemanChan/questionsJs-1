var pad = document.getElementById('spad');
var ctx = pad.getContext('2d');
var app = angular.module('drawApp', []);
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

app.controller('drawCtrl', ['$scope', function($scope) {
    $scope.color = "#555";
    $scope.size = "5";
    $scope.width = 500;
    $scope.height = 500;

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
}]);

$cont.find('.butt_col').each(function() {
    var $t = $(this);
    var col = splitColor($t.attr('ng-click'));
    $t.css({
        'background-color': col
    });
});

$cont.find('button.savedoodle').click(function() {
    var url = pad.toDataURL("image/png");
    $cont.find(".theimage>a").attr('href', url);
    $cont.find(".theimage").show();
    
    $('#spad').mousedown(function() {
        $cont.find(".theimage").hide();
    });
});
