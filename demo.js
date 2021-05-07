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