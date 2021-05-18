import {MyToolkit} from './toolkit.js';

// Implement a MyToolkit Progressbar
var progressbar = new MyToolkit.ProgressBar();
progressbar.move(350, 100);
progressbar.width = 300;
progressbar.setProgress(66);
progressbar.onIdle(e => {
	console.log("ProgressBar: IDLE")
});
progressbar.onIdleHover(e => {
	console.log("ProgressBar: IDLE HOVER")
});
progressbar.onProgress(e => {
	console.log("ProgressBar: PROGRESS")
});
progressbar.afterProgress(e => {
	console.log("Loading: " + progressbar.progress + "\%")
})
progressbar.onProgressComplete(e => {
	console.log("ProgressBar: PROGRESS COMPLETE");
	btn.text = "Play Progress Bar";
});
// Play Progress Bar
let playInterval;
function playProgressBar() {
	let percent = 0;
	playInterval = setInterval(() => {
		if (percent > 100) {
			stopPlayInterval();
		} else {
			progressbar.progress = percent;
			percent += 20;
		}
	}, 1000);
}
function stopPlayInterval() {
	playInterval = clearInterval(playInterval);
}

// Implement a MyToolkit Button
var btn = new MyToolkit.Button("Play Progress Bar");
btn.move(100,100);
btn.onIdleUp(e => {
	console.log("Button: IDLE UP");
});
btn.onIdleHover(e => {
	console.log("Button: IDLE HOVER");
});
btn.onPressedDown(e => {
	console.log("Button: PRESSED DOWN");
});
btn.onExecute(e => {
	console.log("Button: EXECUTE")
});
btn.onClick(function(e){
	console.log("Clicked button")
	if (playInterval == undefined) {
		btn.text = "Loading...";
		playProgressBar();
	} else {
		console.log("WAIT FOR PROGRESS BAR TO FINISH LOADING!");
	}
});

// Implement a MyToolkit Checkbox
var chkbox = new MyToolkit.CheckBox("CHECK me!");
chkbox.move(100, 200);
chkbox.onIdle(e => {
	console.log("Checkbox: IDLE");
});
chkbox.onIdleHover(e => {
	console.log("Checkbox: IDLE HOVER");
});
chkbox.onPressedDown(e => {
	console.log("Checkbox: PRESSED DOWN");
});
chkbox.onExecute(e => {
	console.log("Checkbox: EXECUTE");
});
chkbox.onCheck(e => {
	console.log("Checked checkbox")
	chkbox.text = "UNCHECK me!";
});
chkbox.onUncheck(e => {
	console.log("Unchecked checkbox")
	chkbox.text = "CHECK me!";
});

// Implement a MyToolkit RadioButton
var radioBtns = new MyToolkit.RadioButton(5);
for (let i = 0; i < 5; i++) {
	radioBtns.setText(i, "Pick me please :(");
}
radioBtns.move(100, 250);
radioBtns.onIdle(e => {
	console.log("RadioButton: IDLE");
});
radioBtns.onIdleHover(e => {
	console.log("RadioButton: IDLE HOVER");
});
radioBtns.onPressedDown(e => {
	console.log("RadioButton: PRESSED DOWN");
});
radioBtns.onExecute(e => {
	console.log("RadioButton: EXECUTE")
});
radioBtns.onSelect((e, idx) => {
	console.log("Selected RadioButton " + idx)
	radioBtns.setText(idx, "I AM PICKED! :D");
});
radioBtns.onDeselect((e, idx) => {
	console.log("Deselected RadioButton " + idx);
	radioBtns.setText(idx, "Pick me please :(");
});

// Implement a MyToolkit Textbox
var textbox = new MyToolkit.TextBox();
textbox.move(350, 150);
textbox.onIdle(e => {
	console.log("TextBox: IDLE");
});
textbox.onIdleHover(e => {
	console.log("TextBox: IDLE HOVER");
});
textbox.onFocus(e => {
	console.log("TextBox: FOCUS");
});
textbox.onPrint(e => {
	console.log("TextBox: PRINT");
});
textbox.onTextChange(e => {
	console.log("Printed: ", textbox.text);
});

// Implement a MyToolkit Scrollbar
var scrollbar = new MyToolkit.ScrollBar();
scrollbar.height = 300;
scrollbar.move(350, 200);
scrollbar.onMove((e, direction) => {
	console.log("Going " + direction + "!", scrollbar.thumbPosition);
})
scrollbar.onIdle(e => {
	console.log("ScrollBar: IDLE");
});
scrollbar.onIdleHover(e => {
	console.log("ScrollBar: IDLE HOVER");
});
scrollbar.onDragReady(e => {
	console.log("ScrollBar: DRAG READY");
});
scrollbar.onDrag(e => {
	console.log("ScrollBar: DRAG");
})

// Implement a MyToolkit Dial
var dial = new MyToolkit.Dial();
dial.move(400, 200);
dial.degree = 45;
dial.degreeStep = 22.5;
dial.onIdle(e => {
	console.log("Dial: IDLE");
});
dial.onIdleHover(e => {
	console.log("Dial: IDLE HOVER");
});
dial.onTurn(e => {
	console.log("Dial: TURN");
});
dial.afterTurn(e => {
	console.log("Dial at " + dial.degree + '\u00B0');
})