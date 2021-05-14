import {MyToolkit} from './toolkit.js';

// Implement a MyToolkit Button
var btn = new MyToolkit.Button;
btn.setText("This is a test.");
btn.move(100,100);
btn.onIdleUp(e => {
	console.log("IDLE UP: ", e)
});
btn.onIdleHover(e => {
	console.log("IDLE HOVER: ", e)
});
btn.onPressedDown(e => {
	console.log("PRESSED DOWN: ", e)
});
btn.onExecute(e => {
	console.log("EXECUTE: ", e)
});
btn.onClick(function(e){
	console.log("CLICK: ", e);
});

// Implement a MyToolkit Checkbox
var chkbox = new MyToolkit.CheckBox;
chkbox.setText("This is a test.")
chkbox.move(100, 200);
chkbox.onIdle(e => {
	console.log("IDLE: ", e)
});
chkbox.onIdleHover(e => {
	console.log("IDLE HOVER: ", e)
});
chkbox.onPressedDown(e => {
	console.log("PRESSED DOWN: ", e)
});
chkbox.onExecute(e => {
	console.log("EXECUTE: ", e)
});
chkbox.onCheck(e => {
	console.log("CHECK: ", e)
});
chkbox.onUncheck(e => {
	console.log("UNCHECK: ", e)
});