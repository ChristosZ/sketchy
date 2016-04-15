window.addEventListener('load', function(){

var vDrag = $('#view_drag');
var oDrag = $('#options_drag');
var vBar = $('#sidebar_view');
var oBar = $('#sidebar_options');
var canvas = $('#canvas');

var vybar_start, oybar_start, vytouchstart, oytouchstart;

canvas.html('vBar offset: ' + parseInt(vBar.css('top')) + '<br>'
			+ 'oBar offset: ' + parseInt(oBar.css('top')));

var vDragElement = document.getElementById('view_drag');
var oDragElement = document.getElementById('options_drag');
var vDragGrabbed = false;
var oDragGrabbed = false;
	
/**************************
 * 'touch' event handling *
 **************************/
	
vDragElement.addEventListener('touchstart', function(e){
	vBarGrab(parseInt(e.changedTouches[0].clientY));
	e.preventDefault();
}, false)

vDragElement.addEventListener('touchmove', function(e){
	vBarMove(parseInt(e.changedTouches[0].clientY));
	e.preventDefault();
}, false)

vDragElement.addEventListener('touchend', function(e){
	vBarRelease();
	e.preventDefault();
}, false)

oDragElement.addEventListener('touchstart', function(e){
	oBarGrab(parseInt(e.changedTouches[0].clientY));
	e.preventDefault();
}, false)

oDragElement.addEventListener('touchmove', function(e){
	oBarMove(parseInt(e.changedTouches[0].clientY));
	e.preventDefault();
}, false)

oDragElement.addEventListener('touchend', function(e){
	oBarRelease();
	e.preventDefault();
}, false)

/**************************
 * 'mouse' event handling *
 **************************/

vDragElement.addEventListener('mousedown', function(e){
	vBarGrab(parseInt(e.clientY));
	vDragGrabbed = true;
	e.preventDefault();
}, false)

oDragElement.addEventListener('mousedown', function(e){
	oBarGrab(parseInt(e.clientY));
	oDragGrabbed = true;
	e.preventDefault();
}, false)

document.addEventListener('mousemove', function(e){
	if (vDragGrabbed) vBarMove(parseInt(e.clientY));
	if (oDragGrabbed) oBarMove(parseInt(e.clientY));
	e.preventDefault();
}, false)

document.addEventListener('mouseup', function(e){
	if (vDragGrabbed == true) {
		vDragGrabbed = false;
		vBarRelease();
	}
	if (oDragGrabbed == true) {
		oDragGrabbed = false;
		oBarRelease();
	}
	e.preventDefault();
}, false)
	
/*********************************
 * 'pointer' event handling (IE) *
 *********************************/

vDragElement.addEventListener('pointerdown', function(e){
	vBarGrab(parseInt(e.clientY));
	vDragGrabbed = true;
	e.preventDefault();
}, false)

oDragElement.addEventListener('pointerdown', function(e){
	oBarGrab(parseInt(e.clientY));
	oDragGrabbed = true;
	e.preventDefault();
}, false)

document.addEventListener('pointermove', function(e){
	if (vDragGrabbed) vBarMove(parseInt(e.clientY));
	if (oDragGrabbed) oBarMove(parseInt(e.clientY));
	e.preventDefault();
}, false)

document.addEventListener('pointerup', function(e){
	if (vDragGrabbed == true) {
		vDragGrabbed = false;
		vBarRelease();
	}
	if (oDragGrabbed == true) {
		oDragGrabbed = false;
		oBarRelease();
	}
	e.preventDefault();
}, false)

/*****************************************************
 * browser independent sidebar pull up/down handlers *
 *****************************************************/
	
function vBarGrab(y) {
	sidebarGrabbed();
	vBar.css('z-index', '5');
	oBar.css('z-index', '4');
	vybar_start = parseInt(vBar.css('top'));
	vytouchstart = y;
	canvas.html('touched at: ' + y + '<br>'
				+ 'view bar at: ' + vybar_start);
}

function vBarMove(y) {
	var dist = y - vytouchstart;
	var floor = -1 * $('#sidebar_container').height();
	var vy_new = Math.min(0, Math.max(floor, vybar_start + dist));
	vBar.css('top', vy_new + 'px');
	canvas.html('initially touched at: ' + vytouchstart + '<br>'
				+ 'currently touching at: ' + y + '<br>'
				+ 'moved vertically by: ' + dist + '<br>'
				+ 'view bar was at: ' + vybar_start + '<br>'
				+ 'new bar position: ' + vy_new + 'px');
}

function vBarRelease() {
	sidebarReleased();
	var y_current = parseInt(vBar.css('top'));
	var threshold = (-1 * $('#sidebar_container').height()) / 2;
	if (y_current < threshold) //retract sidebar
		vBar.css('top', 'calc(4mm - 100%)');
	else //sidebar pulled down
		vBar.css('top', '0px');
	
	canvas.html('view bar release point: ' + y_current + '<br>'
				+ 'action: ' + ((threshold > y_current) ? 'retract' : 'pull down'));
}

function oBarGrab(y) {
	sidebarGrabbed();
	oBar.css('z-index', '5');
	vBar.css('z-index', '4');
	oybar_start = parseInt(oBar.css('top'));
	oytouchstart = y;
	canvas.html('touched at: ' + oytouchstart + '<br>'
				+ 'options bar at: ' + oybar_start);
}

function oBarMove(y) {
	var dist = y - oytouchstart;
	var ceiling = $('#sidebar_container').height();
	var oy_new = Math.max(0, Math.min(ceiling, oybar_start + dist));
	oBar.css('top', oy_new + 'px');
	canvas.html('initially touched at: ' + oytouchstart + '<br>'
				+ 'currently touching at: ' + y + '<br>'
				+ 'moved vertically by: ' + dist + '<br>'
				+ 'options bar was at: ' + oybar_start + '<br>'
				+ 'new bar position: ' + oy_new + 'px');
}

function oBarRelease() {
	sidebarReleased();
	var y_current = parseInt(oBar.css('top'));
	var threshold = $('#sidebar_container').height() / 2;
	if (y_current > threshold) //retract sidebar
		oBar.css('top', 'calc(100% - 4mm)');
	else //sidebar pulled up
		oBar.css('top', '0px');
	
	canvas.html('options bar release point: ' + y_current + '<br>'
				+ 'action: ' + ((y_current > threshold) ? 'retract' : 'pull up'));
}

//fade out canvas area and show button names
function sidebarGrabbed() {
	canvas.fadeOut(300);
	$('.help').each(function(i) {
		var obj = $(this);
		var addr = obj.css('background-image');
		if (addr.indexOf('_c.png') !== -1)
			obj.css('background-image', addr.replace('_c.png','_h.png'));
		else
			obj.css('background-image', addr.replace('.png','_h.png'));
	});
}

//fade in canvas area and show button icons
function sidebarReleased() {
	canvas.fadeIn(300);
	$('.help').each(function(i) {
		var obj = $(this);
		var addr = obj.css('background-image');
		obj.css('background-image', addr.replace('_h.png','.png'));
	});
}

/*********************
 * Drawing functions *
 *********************/


}, false)
