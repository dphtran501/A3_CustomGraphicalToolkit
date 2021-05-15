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
                currentState = buttonState.EXECUTE;
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
            currentState = checkboxState.EXECUTE;
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

    let RadioButton = function(numberOfButtons) {
        if (numberOfButtons < 2) {
            throw new Error('Must have at least 2 radio buttons!');
        }
        
        let buttonDiameter = 20;
        let textIndent = 40;
        let radioButtonMargin = 10;

        let gradient = draw.gradient('radial', add => {
            add.stop(0, '#ffffff');
            add.stop(1, '#666666');
        });

        const radioButtonState = {
            "IDLE": 1,
            "IDLE_HOVER": 2,
            "PRESSED_DOWN": 3,
            "EXECUTE": 4
        }

        // Radio button event handling
        let idleEventHandler = null;
        let idleHoverEventHandler = null;
        let pressedDownEventHandler = null;
        let executeEventHandler = null;
        let selectEventHandler = null;
        let deselectEventHandler = null;

        let idxSelectedButton = -1; // Index of selected radio button; -1 = none selected

        // Construct radio buttons
        let radioButtons = draw.group();
        
        let yShift = 0; // Increments for each button to produce spacing between radioButtons
        for (let i = 0; i < numberOfButtons; i++) {
            let radioButton = radioButtons.group();
            let buttonGroup = radioButton.group();
            let button = buttonGroup.circle(buttonDiameter) // index 0 of buttonGroup
                .stroke({color: '#444444', width: 2})
                .fill({color: '#C5E8B7', opacity: 0});

            let buttonFilled = buttonGroup.circle(buttonDiameter)   // index 1 of buttonGroup
                .fill(gradient)
                .center(button.cx(), button.cy())
                .opacity(0);

            let radioButtonText = radioButton.text("Item")
                .font({
                    size: defaultFontSize,
                    weight: defaultFontWeight,
                    family: defaultFontFamily,
                })
            radioButtonText.move(textIndent, (buttonDiameter - radioButtonText.font('size')) / 2);    // Vertically center with button

            // Mask entire radiobutton (excluding text) so event handlers triggered on entire button rather than parts of button
            let radioButtonMask = buttonGroup.circle(buttonDiameter)    // index 2 of buttonGroup
                .opacity(0);
            radioButtonMask.front();

            // Default states
            radioButton.data({
                currentState: radioButtonState.IDLE,
                isSelected: false
            });

            radioButtonMask.mouseover((event) => {
                if (radioButton.data('currentState') != radioButtonState.IDLE_HOVER) {
                    radioButton.data('currentState', radioButtonState.IDLE_HOVER)
                    button.stroke({width: 4});
                    buttonGroup.css('cursor', 'pointer');
                    if(idleHoverEventHandler != null) {
                        idleHoverEventHandler(event);
                    }
                }
            });
            radioButtonMask.mouseout((event) => {
                if (radioButton.data('currentState') == radioButtonState.PRESSED_DOWN) {
                    radioButtonMask.fire('mouseup');
                }
                if (radioButton.data('currentState') != radioButtonState.IDLE) {
                    radioButton.data('currentState', radioButtonState.IDLE)
                    button.stroke({width: 2});
                    if(idleEventHandler != null) {
                        idleEventHandler(event);
                    }
                }
            });
            radioButtonMask.mousedown((event) => {
                if (radioButton.data('currentState') != radioButtonState.PRESSED_DOWN) {
                    radioButton.data('currentState', radioButtonState.PRESSED_DOWN)
                    button.fill({color: '#C5E8B7', opacity: 0.5});
                    if (pressedDownEventHandler != null) {
                        pressedDownEventHandler(event);
                    }
                }
            });
            radioButtonMask.mouseup(() => {
                if (radioButton.data('currentState') == radioButtonState.PRESSED_DOWN) {
                    button.fill({color: '#C5E8B7', opacity: 0});
                }
            });
            radioButtonMask.click(event => {
                selectButton(radioButton);
                radioButton.data('currentState', radioButtonState.EXECUTE);
                if (executeEventHandler != null) {
                    executeEventHandler(event);
                }
                radioButtonMask.fire('mouseover');
            });
            radioButton.on('select', event => {
                if (selectEventHandler != null) {
                    selectEventHandler(event, event.detail.index);
                }
            })
            radioButton.on('deselect', event => {
                if (deselectEventHandler != null) {
                    deselectEventHandler(event, event.detail.index);
                }
            })

            radioButton.y(yShift);
            yShift += buttonDiameter + radioButtonMargin;
        }

        function selectButton(radioButton) {
            let buttonGroup = radioButton.get(0);
            let buttonFilled = buttonGroup.get(1);

            let updatedIsSelected = !(radioButton.data('isSelected'));
            radioButton.data('isSelected', updatedIsSelected);
            if (updatedIsSelected) {
                buttonFilled.opacity(1);
                // De-select previous selected radio button
                if (idxSelectedButton >= 0) {
                    let previousSelectedButton = radioButtons.get(idxSelectedButton);
                    previousSelectedButton.data('isSelected', false);
                    let previousSelectedButtonFilled = previousSelectedButton.get(0).get(1);
                    previousSelectedButtonFilled.opacity(0);
                }

                idxSelectedButton = radioButtons.index(radioButton);
                radioButton.fire('select', {index: radioButtons.index(radioButton)});
            } else {
                buttonFilled.opacity(0);
                idxSelectedButton = -1;
                radioButton.fire('deselect', {index: radioButtons.index(radioButton)});
            }
        }

        return {
            move: function(x, y) {
                radioButtons.move(x, y);
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

            onSelect: function(eventHandler) {
                selectEventHandler = eventHandler;
            },

            onDeselect: function(eventHandler) {
                deselectEventHandler = eventHandler;
            },

            setText: function(index, text) {
                if (index < 0 || index >= numberOfButtons) {
                    throw new RangeError("Index must be between 0 and " + (numberOfButtons - 1));
                }

                let radioButton = radioButtons.get(index);
                let radioButtonText = radioButton.get(1);
                radioButtonText.clear();
                radioButtonText.text(text);
            }
        }
    }

    let TextBox = function() {
        let textboxWidth = 200;
        let textboxHeight = 30;
        let textboxCornerRadius = 4;
        let textPadding = 10;

        const textboxState = {
            "IDLE": 1,
            "IDLE_HOVER": 2,
            "FOCUS": 3,
            "PRINT": 4
        }
        var currentState = textboxState.IDLE;

        // Construct textbox
        let textbox = draw.group();

        let box = textbox.rect(textboxWidth, textboxHeight)
            .stroke({color: '#444444', width: 2})
            .fill('none')
            .radius(textboxCornerRadius);

        let textboxText = textbox.text("")
            .font({
                size: defaultFontSize,
                weight: defaultFontWeight,
                family: defaultFontFamily,
            })
        textboxText.move(textPadding, (textboxHeight - defaultFontSize / 2));   // Vertically center with textbox

        let caret = textbox.rect(2, defaultFontSize)
            .opacity(0);
        caret.animate().opacity(1).loop(1000, true, 0);
        caret.timeline().stop();
        caret.move(textPadding, (textboxHeight - defaultFontSize) / 2); // Vertically center with textbox

        // Mask entire textbox so event handlers triggered on entire box rather than parts of box
        let boxMask = textbox.rect(textboxWidth, textboxHeight)
            .radius(textboxCornerRadius)
            .opacity(0);
        boxMask.front();

        // Checkbox event handling
        let idleEventHandler = null;
        let idleHoverEventHandler = null;
        let focusEventHandler = null;
        let printEventHandler = null;
        let textChangeEventHandler = null;

        boxMask.mouseover((event) => {
            if (currentState != textboxState.IDLE_HOVER && currentState != textboxState.FOCUS) {
                currentState = textboxState.IDLE_HOVER;
                box.stroke({width: 4});
                textbox.css('cursor', 'pointer');
                if(idleHoverEventHandler != null) {
                    idleHoverEventHandler(event);
                }
            }
        });
        boxMask.mouseout((event) => {
            // if (currentState == checkboxState.PRESSED_DOWN) {
            //     boxMask.fire('mouseup');
            // }
            if (currentState != textboxState.IDLE && currentState != textboxState.FOCUS) {
                currentState = textboxState.IDLE;
                box.stroke({width: 2});
                if(idleEventHandler != null) {
                    idleEventHandler(event);
                }
            }
        });
        boxMask.click(event => {
            if (currentState != textboxState.FOCUS) {
                currentState = textboxState.FOCUS;
                box.stroke({width: 4});
                textbox.css('cursor', 'text')
                caret.timeline().play();
                SVG.on(window, 'keyup', onTextboxKeyUp);
                SVG.on(window, 'keypress', onTextboxKeyPress);
                SVG.on(window, 'keydown', onTextboxKeyDown);
                if (focusEventHandler != null) {
                    focusEventHandler(event);
                }
            }
        });

        SVG.on(window, 'click', event => {
            if (currentState == textboxState.FOCUS && event.target != boxMask.node) {
                box.stroke({width: 2});
                caret.timeline().stop();
                currentState = textboxState.IDLE;
                SVG.off(window, 'keyup', onTextboxKeyUp);
                SVG.off(window, 'keypress', onTextboxKeyPress);
                SVG.off(window, 'keydown', onTextboxKeyDown);
                if (idleEventHandler != null) {
                    idleEventHandler(event);
                }
            }
        })

        function onTextboxKeyDown(event) {
            if (currentState == textboxState.FOCUS || currentState == textboxState.PRINT) {
                currentState = textboxState.PRINT;
                caret.timeline().stop();
                if (printEventHandler != null) {
                    printEventHandler(event);
                }
                if (event.key == "Backspace") {
                    let text = textboxText.text();
                    let subtext = text.substring(0, text.length - 1);
                    textboxText.plain(subtext);
                    if (textChangeEventHandler != null) {
                        textChangeEventHandler(event);
                    }
                }
            }
        }

        function onTextboxKeyPress(event) {
            if (event.key != "Enter") {
                textboxText.plain(textboxText.text() + event.key);
                if (textChangeEventHandler != null) {
                    textChangeEventHandler(event);
                }
            }
        }

        function onTextboxKeyUp(event) {
            if (currentState == textboxState.PRINT) {
                currentState = textboxState.FOCUS;
                // Use textbox.x() + textPadding instead of textboxText.x() since textboxText.x() = 0 when there's no text (e.g. delete all text)
                caret.x(textbox.x() + textPadding + textboxText.length());
                caret.timeline().play();
                if (focusEventHandler != null) {
                    focusEventHandler(event);
                }
            }
        }

        return {
            move: function(x, y) {
                textbox.move(x, y);
            },

            onIdle: function(eventHandler) {
                idleEventHandler = eventHandler;
            },

            onIdleHover: function(eventHandler) {
                idleHoverEventHandler = eventHandler;
            },

            onFocus: function(eventHandler) {
                focusEventHandler = eventHandler;
            },

            onPrint: function(eventHandler) {
                printEventHandler = eventHandler;
            },

            onTextChange: function(eventHandler) {
                textChangeEventHandler = eventHandler;
            },

            getText: function() {
                return textboxText.text();
            }
        }
    }
    
    return {Button, CheckBox, RadioButton, TextBox}

}());

export{MyToolkit}