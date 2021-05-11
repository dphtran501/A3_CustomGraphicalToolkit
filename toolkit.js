let MyToolkit = (function() {

    let draw = SVG().addTo('body').size('1000px','1000px');

    let Button = function(){

        let buttonWidthDefault = 100;
        let buttonHeightDefault = 50;
        let buttonLeftPadding = 10;
        let buttonRightPadding = 10;
        let buttonZ = 8;   // "z" height of button to make it pop out of canvas
        let gradient = draw.gradient('radial', add => {
            add.stop(0, '#999999');
            add.stop(1, '#666666');
        });
        let gradientDark = draw.gradient('radial', add => {
            add.stop(0, '#777777');
            add.stop(1, '#444444');
        });

        const buttonState = {
            "IDLE_UP": 1,
            "IDLE_HOVER": 2,
            "PRESSED_DOWN": 3,
            "EXECUTE": 4
        }
        var currentState = buttonState.IDLE_UP;

        // Construct button
        let button = draw.group();

        let rectTopGroup = button.group();
        let rectTop = rectTopGroup.rect(buttonWidthDefault, buttonHeightDefault)
            .fill(gradient)
            .radius(10);
        let buttonText = rectTopGroup.text("Button");
        buttonText.font({
            size: 16,
            weight: 400,
            family: "sans-serif",
            fill: 'white'
        });
        centerButtonText(0, 0); // rect starts at 0,0

        let rectSide = button.rect(buttonWidthDefault, buttonHeightDefault)
            .fill('#111111')
            .radius(10)
            .dy(buttonZ);
        rectSide.insertBefore(rectTop);

        // Mask entire button so event handlers triggered on entire button rather than parts of button
        let buttonMask = button.rect(buttonWidthDefault, buttonHeightDefault + buttonZ)
            .radius(10)
            .opacity(0);
        buttonMask.front();

        // Button event handling
        let idleUpEventHandler = null;
        let idleHoverEventHandler = null;
        let pressedDownEventHandler = null;
        let executeEventHandler = null;
        let clickEventHandler = null;

        button.mouseover((event) => {
            if (currentState != buttonState.IDLE_HOVER) {
                currentState = buttonState.IDLE_HOVER;
                rectTop.fill({ color: gradientDark});
                button.css('cursor', 'pointer');
                if(idleHoverEventHandler != null) {
                    idleHoverEventHandler(event);
                }
            }          
        });
        button.mouseout((event) => {
            if (currentState == buttonState.PRESSED_DOWN) {
                button.fire('mouseup');
            }
            if (currentState != buttonState.IDLE_UP) {
                currentState = buttonState.IDLE_UP;
                rectTop.fill({ color: gradient});
                if(idleUpEventHandler != null) {
                    idleUpEventHandler(event);
                }
            }
        });
        button.mousedown((event) => {
            if (currentState != buttonState.PRESSED_DOWN) {
                currentState = buttonState.PRESSED_DOWN;
                rectSide.css('visibility', 'hidden');
                rectTopGroup.dy(buttonZ);
                if (pressedDownEventHandler != null) {
                    pressedDownEventHandler(event);
                }
            }
        });
        button.mouseup(() => {
            if (currentState == buttonState.PRESSED_DOWN) {
                rectSide.css('visibility', 'visible');
                rectTopGroup.dy(buttonZ * -1);
            }
        });
        button.click(event => {
            if(clickEventHandler != null) {
                clickEventHandler(event);
                currentState == buttonState.EXECUTE;
                if (executeEventHandler != null) {
                    executeEventHandler(event);
                }
                button.fire('mouseover');
            }
        });

        function centerButtonText(xRect, yRect) {

            // x,y of text relative to x,y of rect when centering
            let xShift = (rectTop.width() - buttonText.length()) / 2;
            let yShift = (rectTop.height() - buttonText.font('size')) / 2;

            buttonText.move(xRect + xShift, yRect + yShift);
        }

        return {
            move: function(x, y) {
                button.move(x, y);
            },

            onIdleUp: function(eventHandler) {
                idleUpEventHandler = eventHandler;
            },

            onIdleHover: function(eventHandler) {
                idleHoverEventHandler = eventHandler;
            },

            onPressedDown: function(eventHandler) {
                pressedDownEventHandler = eventHandler;
            },

            onExecute: function(eventHandler) {
                executeEventHandler = eventHandler;
            },

            onClick: function(eventHandler) {
                clickEventHandler = eventHandler;
            },

            setText: function(text) {
                buttonText.clear();
                buttonText.text(text);

                if (buttonText.length() > (buttonWidthDefault - buttonLeftPadding - buttonRightPadding)) {
                    rectTop.width(buttonText.length() + buttonLeftPadding + buttonRightPadding);
                    rectSide.width(buttonText.length() + buttonLeftPadding + buttonRightPadding);
                    buttonMask.width(buttonText.length() + buttonLeftPadding + buttonRightPadding);
                } else {
                    rectTop.width(buttonWidthDefault);
                    rectSide.width(buttonWidthDefault);
                    buttonMask.width(buttonWidthDefault);
                }

                centerButtonText(rectTop.x(), rectTop.y());
            }
        }
    }
    
    return {Button}

}());

export{MyToolkit}