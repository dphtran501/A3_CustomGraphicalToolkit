let MyToolkit = (function() {

    let defaultFontSize = 16;
    let defaultFontWeight = 400;
    let defaultFontFamily = 'sans-serif'

    let draw = SVG().addTo('body').size('1000px','1000px');

    let Button = function(){

        let buttonWidthDefault = 100;
        let buttonHeightDefault = 50;
        let buttonLeftPadding = 10;
        let buttonRightPadding = 10;
        let buttonZ = 8;   // "z" height of button to make it pop out of canvas
        let buttonCornerRadius = 10;
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
        let currentState = buttonState.IDLE_UP;

        // Construct button
        let button = draw.group();

        let rectTopGroup = button.group();
        let rectTop = rectTopGroup.rect(buttonWidthDefault, buttonHeightDefault)
            .fill(gradient)
            .radius(buttonCornerRadius);
        let buttonText = rectTopGroup.text("Button");
        buttonText.font({
            size: defaultFontSize,
            weight: defaultFontWeight,
            family: defaultFontFamily,
            fill: 'white'
        });
        centerButtonText(0, 0); // rect starts at 0,0

        let rectSide = button.rect(buttonWidthDefault, buttonHeightDefault)
            .fill('#111111')
            .radius(buttonCornerRadius)
            .dy(buttonZ);
        rectSide.insertBefore(rectTop);

        // Mask entire button so event handlers triggered on entire button rather than parts of button
        let buttonMask = button.rect(buttonWidthDefault, buttonHeightDefault + buttonZ)
            .radius(buttonCornerRadius)
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

    let CheckBox = function() {

        let checkboxLength = 20;
        let checkboxCornerRadius = 4;
        let textIndent = 40;

        const checkboxState = {
            "IDLE": 1,
            "IDLE_HOVER": 2,
            "PRESSED_DOWN": 3,
            "EXECUTE": 4
        }
        var currentState = checkboxState.IDLE;
        
        let isChecked = false;

        // Construct checkbox
        let checkbox = draw.group();

        let boxGroup = checkbox.group();
        let box = boxGroup.rect(checkboxLength, checkboxLength)
            .stroke({color: '#444444', width: 2})
            .fill({color: '#C5E8B7', opacity: 0})
            .radius(checkboxCornerRadius);

        let checkmark = boxGroup.polyline('0,8 4,12 12,0')
            .fill('none')
            .stroke({
                color: '#2EB62C',
                width: 4
            })
            .center(box.cx(), box.cy());
        showCheckmark(isChecked);   // Default should be unchecked

        let checkboxText = checkbox.text("Item")
            .font({
                size: defaultFontSize,
                weight: defaultFontWeight,
                family: defaultFontFamily,
            })
        checkboxText.move(textIndent, (checkboxLength - checkboxText.font('size')) / 2);    // Vertically center with checkbox

        // Mask entire checkbox (excluding text) so event handlers triggered on entire box rather than parts of box
        let boxMask = boxGroup.rect(checkboxLength, checkboxLength)
            .radius(checkboxCornerRadius)
            .opacity(0);
        boxMask.front();

        // Checkbox event handling
        let idleEventHandler = null;
        let idleHoverEventHandler = null;
        let pressedDownEventHandler = null;
        let executeEventHandler = null;
        let checkEventHandler = null;
        let uncheckEventHandler = null;

        boxMask.mouseover((event) => {
            if (currentState != checkboxState.IDLE_HOVER) {
                currentState = checkboxState.IDLE_HOVER;
                box.stroke({width: 4});
                boxGroup.css('cursor', 'pointer');
                if(idleHoverEventHandler != null) {
                    idleHoverEventHandler(event);
                }
            }          
        });
        boxMask.mouseout((event) => {
            if (currentState == checkboxState.PRESSED_DOWN) {
                boxMask.fire('mouseup');
            }
            if (currentState != checkboxState.IDLE) {
                currentState = checkboxState.IDLE;
                box.stroke({width: 2});
                if(idleEventHandler != null) {
                    idleEventHandler(event);
                }
            }
        });
        boxMask.mousedown((event) => {
            if (currentState != checkboxState.PRESSED_DOWN) {
                currentState = checkboxState.PRESSED_DOWN;
                box.fill({color: '#C5E8B7', opacity: 0.5})
                if (pressedDownEventHandler != null) {
                    pressedDownEventHandler(event);
                }
            }
        });
        boxMask.mouseup(() => {
            if (currentState == checkboxState.PRESSED_DOWN) {
                box.fill({color: '#C5E8B7', opacity: 0});
            }
        });
        boxMask.click(event => {
            isChecked = !isChecked;
            showCheckmark(isChecked);
            if (isChecked && checkEventHandler != null) {
                checkEventHandler(event);
            } else if (!isChecked && uncheckEventHandler != null) {
                uncheckEventHandler(event);
            }
            currentState == checkboxState.EXECUTE;
            if (executeEventHandler != null) {
                executeEventHandler(event);
            }
            boxMask.fire('mouseover');
        });

        function showCheckmark(isChecked) {
            if (isChecked) {
                checkmark.opacity(1);
            } else {
                checkmark.opacity(0);
            }
        }

        return {
            move: function(x, y) {
                checkbox.move(x, y);
            },

            onIdle: function(eventHandler) {
                idleEventHandler = eventHandler;
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

            onCheck: function(eventHandler) {
                checkEventHandler = eventHandler;
            },

            onUncheck: function(eventHandler) {
                uncheckEventHandler = eventHandler;
            },

            setText: function(text) {
                checkboxText.clear();
                checkboxText.text(text);
            }
        }
    }
    
    return {Button, CheckBox}

}());

export{MyToolkit}