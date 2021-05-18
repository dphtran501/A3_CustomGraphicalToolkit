let MyToolkit = (function() {

    let defaultFontSize = 16;
    let defaultFontWeight = 400;
    let defaultFontFamily = 'sans-serif'

    let draw = SVG().addTo('body').size('1000px','1000px');
    let body = draw.parent();

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
        let currentState = checkboxState.IDLE;
        
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
                    radioButton.fire('deselect', {index: radioButtons.index(previousSelectedButton)});
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
        let currentState = textboxState.IDLE;

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

        // Textbox event handling
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

    let ScrollBar = function() {
        let scrollbarWidth = 16;
        let scrollbarHeight = 200;
        let thumbHeight = 67;
        let thumbCornerRadious = 1;

        let gradient = draw.gradient('radial', add => {
            add.stop(0, '#999999');
            add.stop(1, '#666666');
        });
        let gradientDark = draw.gradient('radial', add => {
            add.stop(0, '#777777');
            add.stop(1, '#444444');
        });

        const scrollbarState = {
            "IDLE": 1,
            "IDLE_HOVER": 2,
            "DRAG_READY": 3,
            "DRAG": 4
        }
        let currentState = scrollbarState.IDLE;

        // Construct progress bar
        let scrollbar = draw.group();

        let bar = scrollbar.rect(scrollbarWidth, scrollbarHeight)
            .stroke({color: '#444444', width: 1})
            .fill('none');

        let thumb = scrollbar.rect(scrollbarWidth, thumbHeight)
            .fill(gradient)
            .radius(thumbCornerRadious);

        // Progress bar event handling
        let idleEventHandler = null;
        let idleHoverEventHandler = null;
        let dragReadyEventHandler = null;
        let dragEventHandler = null;
        let moveEventHandler = null;

        thumb.mouseover(event => {
            if (currentState != scrollbarState.IDLE_HOVER && (currentState != scrollbarState.DRAG_READY || event.detail.fromMouseUp)) {
                currentState = scrollbarState.IDLE_HOVER;
                thumb.fill(gradientDark);
                scrollbar.css('cursor', 'grab');
                if(idleHoverEventHandler != null) {
                    idleHoverEventHandler(event);
                }
            }
        });
        thumb.mouseout(event => {
            if (currentState != scrollbarState.IDLE && (currentState != scrollbarState.DRAG_READY || event.detail.fromMouseUp)) {
                SVG.off(window, 'mouseup', onMouseUpOutsideThumb);  // if mouseout fired from onMouseUpOutsideThumb
                currentState = scrollbarState.IDLE;
                thumb.fill(gradient);
                if(idleEventHandler != null) {
                    idleEventHandler(event);
                }
            }
        });
        thumb.mousedown(event => {
            if (currentState != scrollbarState.DRAG_READY) {
                currentState = scrollbarState.DRAG_READY;
                scrollbar.css('cursor', 'grabbing');
                body.css('cursor', 'grabbing');
                SVG.on(window, 'mouseup', onMouseUpOutsideThumb);
                SVG.on(window, 'mousemove', onMouseMove);
                if (dragReadyEventHandler != null) {
                    dragReadyEventHandler(event);
                }
            }
        });
        thumb.mouseup(event => {
            if (currentState == scrollbarState.DRAG_READY) {
                SVG.off(window, 'mouseup', onMouseUpOutsideThumb);
                SVG.off(window, 'mousemove', onMouseMove);
                body.css('cursor', 'default');
                thumb.fire('mouseover', {fromMouseUp: true});
            }
        });

        function onMouseUpOutsideThumb(event) {
            if (currentState == scrollbarState.DRAG_READY && event.target != thumb.node) {
                SVG.off(window, 'mousemove', onMouseMove);
                body.css('cursor', 'default');
                thumb.fire('mouseout', {fromMouseUp: true});
            }
        }

        function onMouseMove(event) {
            if (currentState == scrollbarState.DRAG_READY) {
                currentState = scrollbarState.DRAG;
                if (dragEventHandler != null) {
                    dragEventHandler(event);
                }
                // Move thumb
                if (event.movementY < 0 && thumb.y() != bar.y() && thumb.y() + event.movementY < bar.y()) {
                    thumb.y(bar.y());
                } else if (event.movementY > 0 && thumb.y() + thumbHeight != bar.y() + scrollbarHeight 
                    && thumb.y() + thumbHeight + event.movementY > bar.y() + scrollbarHeight) {
                        thumb.y(bar.y() + scrollbarHeight - thumbHeight);
                } else {
                    thumb.dy(event.movementY);
                }
                if (moveEventHandler != null) {
                    moveEventHandler(event, event.movementY < 0 ? "UP" : "DOWN");
                }

                currentState = scrollbarState.DRAG_READY;
                if (dragReadyEventHandler != null) {
                    dragReadyEventHandler(event);
                }
            }
        }

        return {
            move: function(x, y) {
                scrollbar.move(x, y);
            },

            setHeight: function(newHeight) {
                if (newHeight < thumbHeight) {
                    throw new Error("Scrollbar must be longer than thumb!")
                }
                scrollbarHeight = newHeight;
                let newBar = scrollbar.rect(scrollbarWidth, scrollbarHeight)
                    .stroke({color: '#444444', width: 1})
                    .fill('none');
                bar.replace(newBar);
                newBar.move(bar.x(), bar.y());
                bar = newBar;
            },

            getThumbPosition: function() {
                return {
                    'x': thumb.x(),
                    'y': thumb.y()
                };
            },

            onMove: function(eventHandler) {
                moveEventHandler = eventHandler
            },

            onIdle: function(eventHandler) {
                idleEventHandler = eventHandler;
            },

            onIdleHover: function(eventHandler) {
                idleHoverEventHandler = eventHandler;
            },

            onDragReady: function(eventHandler) {
                dragReadyEventHandler = eventHandler;
            },

            onDrag: function(eventHandler) {
                dragEventHandler = eventHandler;
            },
        }
    }

    let ProgressBar = function() {
        let progressBarWidth = 200;
        let progressBarHeight = 16;
        let progressWidth = 0;
        let progressCornerRadious = 1;

        let gradient = draw.gradient('linear', add => {
            add.stop(0, '#666666');
            add.stop(1, '#999999');
        });

        const progressBarState = {
            "IDLE": 1,
            "IDLE_HOVER": 2,
            "PROGRESS": 3,
            "PROGRESS_COMPLETE": 4
        }
        let currentState = progressBarState.IDLE;

        // Construct progress bar
        let progressBar = draw.group();

        let bar = progressBar.rect(progressBarWidth, progressBarHeight)
            .stroke({color: '#444444', width: 1})
            .fill('none');

        let progress = progressBar.rect(progressWidth, progressBarHeight)
            .fill(gradient)
            .radius(progressCornerRadious);

        // Mask entire progress bar so event handlers triggered on entire bar rather than parts of bar
        let barMask = progressBar.rect(progressBarWidth, progressBarHeight)
            .opacity(0);
        barMask.front();

        // Progress bar event handling
        let idleEventHandler = null;
        let idleHoverEventHandler = null;
        let progressEventHandler = null;
        let progressCompleteEventHandler = null;
        let afterProgressEventHandler = null;

        function setBarMaskEventHandlers(mask) {
            mask.mouseover(event => {
                if (currentState != progressBarState.IDLE_HOVER) {
                    currentState = progressBarState.IDLE_HOVER;
                    if (progressWidth != progressBarWidth) {
                        progressBar.css('cursor', 'progress');
                    } else {
                        progressBar.css('cursor', 'default');
                    }
                    if(idleHoverEventHandler != null) {
                        idleHoverEventHandler(event);
                    }
                }
            });
            mask.mouseout(event => {
                if (currentState != progressBarState.IDLE) {
                    currentState = progressBarState.IDLE;
                    if(idleEventHandler != null) {
                        idleEventHandler(event);
                    }
                }
            });
        }
        setBarMaskEventHandlers(barMask);

        progressBar.on('increment', event => {
            if (currentState != progressBarState.PROGRESS) {
                let previousState = currentState;
                currentState = progressBarState.PROGRESS;
                if (progressEventHandler != null) {
                    progressEventHandler(event);
                }

                // Increment progress bar
                if (event.detail.progressPercent != undefined) {
                    let progressPercent = event.detail.progressPercent / 100;
                    progressWidth = progressBarWidth * progressPercent;
                    let newProgress = progressBar.rect(progressWidth, progressBarHeight)
                        .fill(gradient)
                        .radius(progressCornerRadious);
                    progress.replace(newProgress);
                    newProgress.move(progress.x(), progress.y());
                    progress = newProgress;
                }

                if (afterProgressEventHandler != null) {
                    afterProgressEventHandler(event);
                }

                if (event.detail.progressPercent == 100) {
                    progressBar.fire('barFilled', {nextState: previousState});
                }

                if (previousState == progressBarState.IDLE) {
                    barMask.fire('mouseout');
                } else if (previousState == progressBarState.IDLE_HOVER) {
                    barMask.fire('mouseover');
                }
            }
        });
        progressBar.on('barFilled', event => {
            if (currentState == progressBarState.PROGRESS) {
                currentState = progressBarState.PROGRESS_COMPLETE;
                progressBar.css('cursor', 'default');
                if (progressCompleteEventHandler != null) {
                    progressCompleteEventHandler(event);
                }
            }
        });

        return {
            move: function(x, y) {
                progressBar.move(x, y);
            },

            setWidth: function(newWidth) {
                progressBarWidth = newWidth;
                let newBar = progressBar.rect(progressBarWidth, progressBarHeight)
                    .stroke({color: '#444444', width: 1})
                    .fill('none');
                bar.replace(newBar);
                newBar.move(bar.x(), bar.y());
                bar = newBar;

                let newBarMask = progressBar.rect(progressBarWidth, progressBarHeight)
                    .opacity(0);
                setBarMaskEventHandlers(newBarMask);
                barMask.replace(newBarMask);
                newBarMask.move(barMask.x(), barMask.y());
                barMask = newBarMask;
            },

            getProgress: function() {
                return progressWidth / progressBarWidth * 100;
            },

            progress: function(percent) {
                if (percent < 0 || percent > 100) {
                    throw new RangeError("Percent must be between 0 and 100.");
                }
                progressBar.fire('increment', {progressPercent: percent})
            },

            onIdle: function(eventHandler) {
                idleEventHandler = eventHandler;
            },

            onIdleHover: function(eventHandler) {
                idleHoverEventHandler = eventHandler;
            },

            onProgress: function(eventHandler) {
                progressEventHandler = eventHandler;
            },

            afterProgress: function(eventHandler) {
                afterProgressEventHandler = eventHandler;
            },

            onProgressComplete: function(eventHandler) {
                progressCompleteEventHandler = eventHandler;
            },
        }
    }

    let Dial = function() {
        let dialRadius = 25;
        let degree = 0;         // 0 = dial mark at top, 90 = dial mark at right, 180 = dial mark at bottom, etc.
        let degreeStep = 15;    // clockwise turn

        let gradient = draw.gradient('radial', add => {
            add.stop(0, '#999999');
            add.stop(1, '#666666');
        });
        let gradientDark = draw.gradient('radial', add => {
            add.stop(0, '#777777');
            add.stop(1, '#444444');
        });

        const dialState = {
            "IDLE": 1,
            "IDLE_HOVER": 2,
            "TURN": 3
        }
        let currentState = dialState.IDLE;

        // Construct progress bar
        let dial = draw.group();
        let dialKnob = dial.circle()
            .radius(dialRadius)
            .stroke({color: '#444444', width: 2})
            .fill(gradient);

        let dialMark = dial.line()
            .plot(dialKnob.cx(), dialKnob.cy() - (dialRadius / 2), dialKnob.cx(), dialKnob.cy() - dialRadius)
            .stroke({color: '#FFFFFF', width: 4});

        let dialMask = dial.circle()
            .radius(dialRadius)
            .opacity(0);
        dialMask.front();

        // Dial event handling
        let idleEventHandler = null;
        let idleHoverEventHandler = null;
        let turnEventHandler = null;
        let afterTurnEventHandler = null;

        dialMask.mouseover(event => {
            if (currentState != dialState.IDLE_HOVER) {
                currentState = dialState.IDLE_HOVER;
                dialKnob.fill(gradientDark)
                window.addEventListener('wheel', cancelScrolling, { passive: false });
                if (idleHoverEventHandler != null) {
                    idleHoverEventHandler(event);
                }
            }
        });

        dialMask.mouseout(event => {
            if (currentState != dialState.IDLE) {
                currentState = dialState.IDLE;
                dialKnob.fill(gradient)
                window.removeEventListener('wheel', cancelScrolling);
                if (idleEventHandler != null) {
                    idleEventHandler(event);
                }
            }
        })

        dialMask.on('wheel', event => {
            if (currentState != dialState.TURN) {
                currentState = dialState.TURN;
                if (turnEventHandler != null) {
                    turnEventHandler(event);
                }
                if (event.deltaY > 0) {
                    // wheel down is clockwise turn; don't turn if degree = 360
                    if (degree + degreeStep <= 360) {
                        dial.rotate(degreeStep);
                        degree += degreeStep;
                    } else if (degree < 360) {
                        dial.rotate(360 - degree);
                        degree = 360;
                    }
                } else {
                    // wheel up is counter-clockwise turn; don't turn if degree = 0
                    if (degree - degreeStep >= 0) {
                        dial.rotate(-degreeStep);
                        degree -= degreeStep;
                    } else if (degree > 0) {
                        dial.rotate(-degree);
                        degree = 0;
                    }
                }

                setDialMarkColor();

                if (afterTurnEventHandler != null) {
                    afterTurnEventHandler(event);
                }

                dialMask.fire('mouseover');
            }
        })

        // Prevent window scrolling when using mouse wheel
        function cancelScrolling(event) {
            event.preventDefault();
        }

        // Distinguish dial at 0 degrees from dial at 360 degrees
        function setDialMarkColor() {
            if (degree == 360) {
                dialMark.stroke({color: '#000000', width: 4});
            } else {
                dialMark.stroke({color: '#FFFFFF', width: 4});
            }
        }

        return {
            move: function(x, y) {
                dial.move(x, y);
            },

            getDegree: function() {
                return degree;
            },

            setDegree: function(newDegree) {
                if (newDegree < 0 || newDegree > 360) {
                    throw new RangeError("Degree must be between 0 and 360 degrees.");
                }

                dial.rotate(newDegree - degree);
                degree = newDegree;
                setDialMarkColor();
            },

            setDegreeStep: function(step) {
                if (step < 0 || step > 360) {
                    throw new RangeError("Step must be between 0 and 360 degrees.");
                }

                degreeStep = step;
            },

            onIdle: function(eventHandler) {
                idleEventHandler = eventHandler;
            },

            onIdleHover: function(eventHandler) {
                idleHoverEventHandler = eventHandler;
            },

            onTurn: function(eventHandler) {
                turnEventHandler = eventHandler;
            },

            afterTurn: function(eventHandler) {
                afterTurnEventHandler = eventHandler;
            }
        }
    }
    
    return {Button, CheckBox, RadioButton, TextBox, ScrollBar, ProgressBar, Dial}

}());

export{MyToolkit}