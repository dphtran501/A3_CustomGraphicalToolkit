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

// Implement a MyToolkit RadioButton
var radioBtns = new MyToolkit.RadioButton(5);
for (let i = 0; i < 5; i++) {
	radioBtns.setText(i, "This is radio button " + i + ".");
}
radioBtns.move(100, 250);
radioBtns.onIdle(e => {
	console.log("IDLE: ", e)
});
radioBtns.onIdleHover(e => {
	console.log("IDLE HOVER: ", e)
});
radioBtns.onPressedDown(e => {
	console.log("PRESSED DOWN: ", e)
});
radioBtns.onExecute(e => {
	console.log("EXECUTE: ", e)
});
radioBtns.onSelect((e, idx) => {
	console.log("SELECT: Button " + idx, e)
});
radioBtns.onDeselect((e, idx) => {
	console.log("DESELECT: Button " + idx, e)
});

// Implement a MyToolkit Textbox
var textbox = new MyToolkit.TextBox();
textbox.move(350, 100);
textbox.onIdle(e => {
	console.log("IDLE: ", e)
});
textbox.onIdleHover(e => {
	console.log("IDLE HOVER: ", e)
});
textbox.onFocus(e => {
	console.log("FOCUS: ", e)
});
textbox.onPrint(e => {
	console.log("PRINT: ", e)
});
textbox.onTextChange(e => {
	console.log("TEXT CHANGE: ", textbox.getText());
});

// Implement a MyToolkit Scrollbar
var scrollbar = new MyToolkit.ScrollBar();
scrollbar.setHeight(300);
scrollbar.move(350, 150);
scrollbar.onMove((e, direction) => {
	console.log("MOVING: ", direction)
})
scrollbar.onIdle(e => {
	console.log("IDLE: ", e)
});
scrollbar.onIdleHover(e => {
	console.log("IDLE HOVER: ", e)
});
scrollbar.onDragReady(e => {
	console.log("DRAG READY: ", scrollbar.getThumbPosition());
});
scrollbar.onDrag(e => {
	console.log("DRAG: ", scrollbar.getThumbPosition());
})

// Implement a MyToolkit Progressbar
var progressbar = new MyToolkit.ProgressBar();
progressbar.move(380, 150);
progressbar.setWidth(100);
progressbar.onIdle(e => {
	console.log("ProgressBar: IDLE")
});
progressbar.onIdleHover(e => {
	console.log("ProgressBar: IDLE HOVER")
});
progressbar.onProgress(e => {
	console.log("ProgressBar: PROGRESS " + progressbar.getProgress() + "\%")
});
progressbar.afterProgress(e => {
	console.log("ProgressBar: AFTER PROGRESS " + progressbar.getProgress() + "\%")
})
progressbar.onProgressComplete(e => {
	console.log("ProgressBar: PROGRESS COMPLETE")
});
let percent = 0;
setInterval(() => {
	if (percent > 100) {
		percent = 0;
	}
	progressbar.progress(percent);
	percent += 20;
}, 1000);