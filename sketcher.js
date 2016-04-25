window.addEventListener('load', function(){

var vDrag = $('#view_drag');
var oDrag = $('#options_drag');
var vBar = $('#sidebar_view');
var oBar = $('#sidebar_options');
var drawBtn = $('#btn_draw');
var eraseBtn = $('#btn_erase');

var canvas = $('#canvas');
var canvas0 = $('#canvas_layer0');
var canvasImg = $('#canvas_img');
var ctx = canvas0[0].getContext('2d');

var vybar_start, oybar_start, vytouchstart, oytouchstart;
var vDragGrabbed = false;
var oDragGrabbed = false;

var mode = 'draw';
var color = 'black';
var brushSize = 6;
var eraserSize = 7;

hover(drawBtn);
$('#size_slider').val((brushSize*10)-1);

canvas0[0].width = canvas0[0].offsetWidth;
canvas0[0].height = canvas0[0].offsetHeight;
ctx.fillStyle = 'white'; //canvas is transparent by default
ctx.fillRect(0, 0, canvas0.width(), canvas0.height());
ctx.fill();

//canvas offset when window is resized
//undo/redo initial one step


$(window).resize(function() {
	clearTimeout(window.resizedFinished);
	if (trackimage.indexOf(canvas0[0].toDataURL()) == -1){
		trackimage.push(canvas0[0].toDataURL());
	}
    window.resizedFinished = setTimeout(function(){
    	canvas0[0].width = canvas0[0].offsetWidth;
	    canvas0[0].height = canvas0[0].offsetHeight;
        var newtrack = new Image();
		newtrack.src = trackimage[trackimage.length-1];
		ctx.clearRect(0, 0, canvas0[0].width, canvas0[0].height);
		newtrack.onload = function() {ctx.drawImage(newtrack,0,0,canvas0[0].width,canvas0[0].height);}
    }, 250);
});

/***********************************************
 * General button hover/press display behavior *
 ***********************************************/

$('.hover').mouseenter(function(e){
	hover($(this));
})

$('.hover').mouseleave(function(e){
	var obj = $(this);
	if (obj.attr('id').substring(4) == mode) hover(obj);
	else unhover(obj);
})

$('.hover').on('mousedown touchstart', function(e){
	var obj = $(this);  
	var addr = obj.css('background-image');
	if (addr.indexOf('_c.png') == -1)
		obj.css('background-image', addr.replace('.png','_c.png'));
	else
		obj.css('background-image', addr.replace('_c.png','.png'));
})

$('.hover').on('mouseup touchend', function(e){
	var obj = $(this);
	var btn = obj.attr('id').substring(4);
	
	if (btn != 'draw' && btn != 'erase') toggleHover(obj);
	else setMode(obj);

	//canvas.html('Pressed ' + btn + ' button');
})

$('#size_slider').on('pointerup mouseup touchend', function(e){
	var obj = $(this);
	var size = (parseInt(obj.val())+1)/10;
	if (mode == 'erase') eraserSize = size;
	else if (mode == 'draw') brushSize = size;
	
	//canvas.html('Width changed to: ' + size);
});

function hover (jObj) {
	if (vDragGrabbed | oDragGrabbed) return;
	var addr = jObj.css('background-image');
	if (addr.indexOf('_c.png') == -1)
		jObj.css('background-image', addr.replace('.png','_c.png'));
}

function unhover (jObj) {
	if (vDragGrabbed | oDragGrabbed) return;
	var addr = jObj.css('background-image');
	if (addr.indexOf('_c.png') != -1)
		jObj.css('background-image', addr.replace('_c.png','.png'));
}

function toggleHover (jObj) {
	if (vDragGrabbed | oDragGrabbed) return;
	var addr = jObj.css('background-image');
	if (addr.indexOf('_c.png') != -1)
		jObj.css('background-image', addr.replace('_c.png','.png'));
	else
		jObj.css('background-image', addr.replace('.png','_c.png'));
}

function setMode (jObj) {
	hover(jObj);
	
	var newMode = jObj.attr('id').substring(4);
	if (mode != newMode) { //not already in this mode, switch modes
		if (newMode == 'draw') {
			unhover(eraseBtn);
			$('#size_slider').val((brushSize*10)-1);
			mode = 'draw';
		}
		else if (newMode == 'erase') {
			unhover(drawBtn);
			$('#size_slider').val((eraserSize*10)-1);
			mode = 'erase';
		}
	}
}

/***********************************************
 * 'touch' event handling for sidebar dragging *
 ***********************************************/

vDrag.on('touchstart', function(e){
	var e = e.originalEvent;
	vBarGrab(parseInt(e.changedTouches[0].clientY));
	vDragGrabbed = true;
	e.preventDefault();
})

vDrag.on('touchmove', function(e){
	var e = e.originalEvent;
	vBarMove(parseInt(e.changedTouches[0].clientY));
	e.preventDefault();
})

vDrag.on('touchend', function(e){
	var e = e.originalEvent;
	vDragGrabbed = false;
	vBarRelease();
	e.preventDefault();
})

oDrag.on('touchstart', function(e){
	var e = e.originalEvent;
	oBarGrab(parseInt(e.changedTouches[0].clientY));
	oDragGrabbed = true;
	e.preventDefault();
})

oDrag.on('touchmove', function(e){
	var e = e.originalEvent;
	oBarMove(parseInt(e.changedTouches[0].clientY));
	e.preventDefault();
})

oDrag.on('touchend', function(e){
	var e = e.originalEvent;
	oBarRelease();
	oDragGrabbed = false;
	e.preventDefault();
})

/**********************************************************
 * mouse/pointer (IE) event handling for sidebar dragging *
 **********************************************************/

vDrag.on('mousedown pointerdown', function(e){
	vBarGrab(parseInt(e.clientY));
	vDragGrabbed = true;
})

oDrag.on('mousedown pointerdown', function(e){
	oBarGrab(parseInt(e.clientY));
	oDragGrabbed = true;
})

$(document).on('mousemove pointermove', function(e){
	if (vDragGrabbed) vBarMove(parseInt(e.clientY));
	if (oDragGrabbed) oBarMove(parseInt(e.clientY));
})

$(document).on('mouseup pointerup', function(e){
	if (vDragGrabbed == true) {
		vDragGrabbed = false;
		vBarRelease();
	}
	if (oDragGrabbed == true) {
		oDragGrabbed = false;
		oBarRelease();
	}
})

/*****************************************************
 * browser independent sidebar pull up/down handlers *
 *****************************************************/

function vBarGrab(y) {
	sidebarGrabbed();
	vBar.css('z-index', '5');
	oBar.css('z-index', '4');
	vybar_start = parseInt(vBar.css('top'));
	vytouchstart = y;
}

function vBarMove(y) {
	var dist = y - vytouchstart;
	var floor = -1 * $('#sidebar_container').height();
	var vy_new = Math.min(0, Math.max(floor, vybar_start + dist));
	vBar.css('top', vy_new + 'px');
}

function vBarRelease() {
	sidebarReleased();
	var y_current = parseInt(vBar.css('top'));
	var threshold = (-1 * $('#sidebar_container').height()) / 2;
	if (y_current < threshold) { //retract sidebar
		vBar.css('top', 'calc(4mm - 100%)');
		canvas.fadeIn(300);
		canvas0.fadeIn(300);
	}
	else { //sidebar pulled down
		vBar.css('top', '0px');
		
		//show viewing mode html in canvas container
	}
}

function oBarGrab(y) {
	sidebarGrabbed();
	oBar.css('z-index', '5');
	vBar.css('z-index', '4');
	oybar_start = parseInt(oBar.css('top'));
	oytouchstart = y;
}

function oBarMove(y) {
	var dist = y - oytouchstart;
	var ceiling = $('#sidebar_container').height();
	var oy_new = Math.max(0, Math.min(ceiling, oybar_start + dist));
	oBar.css('top', oy_new + 'px');
}

function oBarRelease() {
	sidebarReleased();
	var y_current = parseInt(oBar.css('top'));
	var threshold = $('#sidebar_container').height() / 2;
	if (y_current > threshold) { //retract sidebar
		oBar.css('top', 'calc(100% - 4mm)');
		canvas.fadeIn(300);
		canvas0.fadeIn(300);
	}
	else { //sidebar pulled up, create image of canvas for saving
		oBar.css('top', '0px');
		var dataURL = canvas0[0].toDataURL();
		canvasImg.attr('src', dataURL);
		canvasImg.fadeIn(300);
	}
}

//fade out canvas area and show button names
function sidebarGrabbed() {
	canvas.fadeOut(300);
	canvas0.fadeOut(300);
	canvasImg.fadeOut(300);
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
	$('.help').each(function(i) {
		var obj = $(this);
		var addr = obj.css('background-image');
		obj.css('background-image', addr.replace('_h.png','.png'));
	});
}

/*********************
 * Drawing functions *
 *********************/

var flag = false,
	prevX = 0,
	currX = 0,
	prevY = 0,
	currY = 0,
	dot_flag = false;
var trackimage = new Array();
var step = 0;
$('#btn_undo').css("pointer-events", "none");
$('#btn_redo').css("pointer-events", "none");

canvas0.on('mousedown pointerdown', function (e) {findxy('down', e.originalEvent)});
canvas0.on('mousemove pointermove', function (e) {findxy('move', e.originalEvent)});
canvas0.on('mouseout pointerout',   function (e) {findxy('out',  e.originalEvent)});
canvas0.on('mouseup pointerup',	 function (e) {findxy('up',   e.originalEvent)});

canvas0.on('touchstart', function(e){findxy('down', e.originalEvent.changedTouches[0])});
canvas0.on('touchmove',  function(e){findxy('move', e.originalEvent.changedTouches[0])});
canvas0.on('touchleave', function(e){findxy('out',  e.originalEvent.changedTouches[0])});
canvas0.on('touchend',   function(e){findxy('up',   e.originalEvent.changedTouches[0])});

function draw() {
	ctx.beginPath();
	ctx.strokeStyle = (mode == 'erase') ? 'white' : color;
	ctx.lineWidth = (mode == 'erase') ? eraserSize : brushSize;
	ctx.lineJoin = "round";
	ctx.moveTo(prevX, prevY);
	ctx.lineTo(currX, currY);
	ctx.closePath();
	ctx.stroke();
}

var points = [];

var h = 0,
	w = 0,
	x = 0,
	y = 0,
	tuple = [];

function sendPoint() {

	if(flag == true) {
		w = canvas0[0].width;
		h = canvas0[0].height;
		x = currX;
		y = currY;
		x = (x/w) * 100; 
		y = (y/h) * 100;
		tuple = [x, y];

		points.push(tuple);

	} else if (flag == false) {
		console.table(points);

		//send points to server
		//meta username and room name!
		//clear the points
		points = [];
	}

}

function findxy(res, e) {

	if (res == 'down') {
		currX = e.clientX - canvas0[0].offsetLeft;
		currY = e.clientY - canvas0[0].offsetTop;
		push();
		flag = true;
		dot_flag = true;
		if (dot_flag) {
			ctx.beginPath();
			ctx.fillStyle = (mode == 'erase') ? 'white' : color;
			ctx.arc(currX, currY, brushSize/2, 0, 2*Math.PI);
			ctx.fill();
			dot_flag = false;
		}

		sendPoint();
	}
	if (res == 'up' || res == "out") {
		flag = false;

		sendPoint();
	}
	if (res == 'move') {
		if (flag) {
			prevX = currX;
			prevY = currY;
			currX = e.clientX - canvas0[0].offsetLeft;
			currY = e.clientY - canvas0[0].offsetTop;
			draw();

			sendPoint();
		}
	}
}

function push(){
	step++;
	$('#btn_undo').css("pointer-events", "auto");
	if (step < trackimage.length){
		trackimage = trackimage.slice(0, step);
	}
	if (trackimage.indexOf(canvas0[0].toDataURL()) == -1){
		trackimage.push(canvas0[0].toDataURL());
	}
}

/******************************
 * Other button functionality *
 ******************************/

$('.colorbtn').click(function(e){
	color = $(this).attr('id');
	setMode (drawBtn);
});

$('#btn_undo').click(function(e){
	if (trackimage.indexOf(canvas0[0].toDataURL()) == -1){
		trackimage.push(canvas0[0].toDataURL());
	}
	$('#btn_redo').css("pointer-events", "auto");
	if (step > 0){
		step --;
		var oldtrack = new Image();
		oldtrack.src = trackimage[step];
		ctx.clearRect(0, 0, canvas0[0].width, canvas0[0].height);
		oldtrack.onload = function (){ctx.drawImage(oldtrack,0,0);}
	}
	if (step == 0){
		$('#btn_undo').css("pointer-events", "none");
	}
	
	//TODO: adjust canvas layer visibility, notify server
	
});

$('#btn_redo').click(function(e){
	if (step < trackimage.length-1){
			step++;
			var newtrack = new Image();
			newtrack.src = trackimage[step];
			ctx.clearRect(0, 0, canvas0[0].width, canvas0[0].height);
			newtrack.onload = function() {ctx.drawImage(newtrack,0,0);}
	}
	if (step == trackimage.length-1){
		$('#btn_redo').css("pointer-events", "none");
		$('#btn_undo').css("pointer-events", "auto");
	}
	
	//TODO: adjust canvas layer visibility, notify server
	
});

$('#btn_save').click(function(e){
	alert('Right-click or touch and hold image on the right to save on your device.')
});

$('#btn_clear').click(function(e){
	if (confirm('This will clear your sketch, are you sure?')) {
		canvasImg.fadeOut(300);
		
		ctx.fillStyle = 'white'; //clear canvas
		ctx.fillRect(0, 0, canvas0[0].width, canvas0[0].height);
		ctx.fill();
		var dataURL = canvas0[0].toDataURL(); //clear canvas image
		setTimeout(function (){	canvasImg.attr('src', dataURL); }, 300);

		canvasImg.fadeIn(300).css('display', 'block');
	}
});

$('#btn_mirror').click(function(e){
	var bar = $('#sidebar_container');
	var addr = bar.css('background-image');
	if (bar.css('float') == 'left') {
		bar.css('float', 'right');
		bar.css('background-image', addr.replace('_left.png','_right.png'));
	}
	else {
		bar.css('float', 'left');
		bar.css('background-image', addr.replace('_right.png','_left.png'));		
	}
});

$('#btn_post').click(function(e){
	
	//TODO: prompt and permanently post picture
	
});

$('#btn_tribes').click(function(e){
	
	//TODO: toggle tribes, notify server after short interval (when user decides)
	
});

//TODO: sketch viewing functionality

}, false)
