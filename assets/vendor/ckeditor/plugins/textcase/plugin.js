CKEDITOR.plugins.add('textcase', {
    requires: 'dialog',
    icons: 'textcase',

    init: function (editor) {
        var lang = editor.lang.textcase || {
            title: 'Text Case Converter',
            tooltip: 'Convert selected text case',
            selectText: 'Please select text to convert case',
            noSelection: 'No text selected',
            preview: 'Preview',
            apply: 'Apply',
            cancel: 'Cancel',
            originalText: 'Original Text',
            convertedText: 'Converted Text',
            caseOptions: {
                'sentence': 'Sentence case',
                'title': 'Title Case',
                'upper': 'UPPER CASE',
                'lower': 'lower case',
                'capitalize': 'Capitalize Each Word',
                'toggle': 'tOGGLE cASE'
            },
            tooltips: {
                'sentence': 'Capitalizes the first word and proper nouns',
                'title': 'Capitalizes major words, leaves minor words lowercase unless at start/end',
                'upper': 'Converts all letters to uppercase',
                'lower': 'Converts all letters to lowercase',
                'capitalize': 'Capitalizes every word, even minor ones',
                'toggle': 'Switches the casing of each letter'
            }
        };

        // Text case conversion functions
        var textCaseConverters = {
            sentence: function (text) {
                return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
            },

            title: function (text) {
                var minorWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet'];

                return text.toLowerCase().split(' ').map(function (word, index, array) {
                    // Always capitalize first and last word
                    if (index === 0 || index === array.length - 1) {
                        return word.charAt(0).toUpperCase() + word.slice(1);
                    }

                    // Don't capitalize minor words unless they're first or last
                    if (minorWords.indexOf(word.toLowerCase()) !== -1) {
                        return word.toLowerCase();
                    }

                    return word.charAt(0).toUpperCase() + word.slice(1);
                }).join(' ');
            },

            upper: function (text) {
                return text.toUpperCase();
            },

            lower: function (text) {
                return text.toLowerCase();
            },

            capitalize: function (text) {
                return text.split(' ').map(function (word) {
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }).join(' ');
            },

            toggle: function (text) {
                return text.split('').map(function (char) {
                    return char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
                }).join('');
            }
        };

        // Command to open the text case dialog
        editor.addCommand('textcase', {
            exec: function (editor) {
                var selection = editor.getSelection();
                var selectedText = selection && selection.getSelectedText();

                if (!selectedText || selectedText.trim().length === 0) {
                    alert(lang.selectText);
                    return;
                }

                editor.openDialog('textcase');
            },
            modes: { wysiwyg: 1 },
            canUndo: true
        });

        // Add the button to the toolbar
        editor.ui.addButton('TextCase', {
            label: lang.tooltip,
            command: 'textcase',
            toolbar: 'styles,10',
            icon: this.path + 'icons/textcase.png'
        });

        // Register the dialog
        CKEDITOR.dialog.add('textcase', function (editor) {
            return {
                title: lang.title,
                minWidth: 500,
                minHeight: 400,
                resizable: CKEDITOR.DIALOG_RESIZE_NONE,

                contents: [{
                    id: 'general',
                    label: 'General',
                    elements: [{
                        type: 'html',
                        html: '<div class="textcase-dialog-container">' +
                            '<div class="textcase-header">' +
                            '<h3>' + lang.title + '</h3>' +
                            '<p>Select a case conversion option below:</p>' +
                            '</div>' +
                            '<div class="textcase-options" id="textcase-options"></div>' +
                            '<div class="textcase-preview-container">' +
                            '<div class="textcase-preview-section">' +
                            '<label>' + lang.originalText + ':</label>' +
                            '<div class="textcase-preview-box original" id="original-text"></div>' +
                            '</div>' +
                            '<div class="textcase-preview-section">' +
                            '<label>' + lang.convertedText + ':</label>' +
                            '<div class="textcase-preview-box converted" id="converted-text"></div>' +
                            '</div>' +
                            '</div>' +
                            '</div>'
                    }]
                }],

                onShow: function() {
                    var dialog = this;
                    var selection = editor.getSelection();
                    var selectedText = selection && selection.getSelectedText();

                    // Store original selection for later use
                    dialog.originalSelection = selection;
                    dialog.originalText = selectedText;
                    dialog.selectedCase = null;

                    // Update original text preview
                    var originalTextEl = dialog.getElement().getDocument().getById('original-text');
                    if (originalTextEl) {
                        originalTextEl.setHtml(CKEDITOR.tools.htmlEncode(selectedText));
                    }

                    // Clear converted text preview
                    var convertedTextEl = dialog.getElement().getDocument().getById('converted-text');
                    if (convertedTextEl) {
                        convertedTextEl.setHtml('');
                    }

                    // Reset case option selection
                    var optionsContainer = dialog.getElement().getDocument().getById('textcase-options');
                    if (optionsContainer) {
                        var options = optionsContainer.find('.textcase-option');
                        for (var k = 0; k < options.count(); k++) {
                            options.getItem(k).removeClass('selected');
                        }
                    }
                },

                onLoad: function () {
                    var dialog = this;

                    // Add custom CSS
                    var head = dialog.getElement().getDocument().getHead();
                    var style = dialog.getElement().getDocument().createElement('style');
                    style.setAttribute('type', 'text/css');
                    style.setHtml(
                        '.textcase-dialog-container {' +
                        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
                        'padding: 12px;' +
                        'background: #ffffff;' +
                        'max-width: 100%;' +
                        'box-sizing: border-box;' +
                        '}' +

                        '.textcase-header {' +
                        'text-align: center;' +
                        'margin-bottom: 15px;' +
                        'border-bottom: 1px solid #f0f0f0;' +
                        'padding-bottom: 10px;' +
                        'max-width: 100%;' +
                        '}' +

                        '.textcase-header h3 {' +
                        'margin: 0 0 4px 0;' +
                        'color: #1a73e8;' +
                        'font-size: 16px;' +
                        'font-weight: 500;' +
                        'line-height: 1.4;' +
                        'padding: 0 10px;' +
                        'word-wrap: break-word;' +
                        '}' +

                        '.textcase-header p {' +
                        'margin: 0;' +
                        'color: #5f6368;' +
                        'font-size: 12px;' +
                        'line-height: 1.4;' +
                        'padding: 0 10px;' +
                        'word-wrap: break-word;' +
                        '}' +

                        '.textcase-options {' +
                        'display: grid;' +
                        'grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));' +
                        'gap: 12px;' +
                        'margin-bottom: 15px;' +
                        'max-width: 100%;' +
                        'box-sizing: border-box;' +
                        '}' +

                        '@media (max-width: 480px) {' +
                        '.textcase-options {' +
                        'grid-template-columns: 1fr;' +
                        '}' +
                        '}' +

                        '.textcase-option {' +
                        'border: 1px solid #e8eaed;' +
                        'border-radius: 6px;' +
                        'padding: 12px;' +
                        'cursor: pointer;' +
                        'transition: all 0.2s ease;' +
                        'background: #ffffff;' +
                        'position: relative;' +
                        'text-align: left;' +
                        'display: flex;' +
                        'flex-direction: column;' +
                        'gap: 6px;' +
                        'width: 100%;' +
                        'box-sizing: border-box;' +
                        'min-width: 0;' +
                        'overflow: hidden;' +
                        '}' +

                        '.textcase-option > * {' +
                        'max-width: 100%;' +
                        'box-sizing: border-box;' +
                        'overflow-wrap: break-word;' +
                        'word-wrap: break-word;' +
                        'word-break: break-word;' +
                        'hyphens: auto;' +
                        '}' +

                        '.textcase-option:hover {' +
                        'border-color: #1a73e8;' +
                        'background: #f8f9ff;' +
                        'transform: translateY(-1px);' +
                        'box-shadow: 0 2px 6px rgba(26, 115, 232, 0.15);' +
                        '}' +

                        '.textcase-option.selected {' +
                        'border-color: #1a73e8;' +
                        'background: #e8f0fe;' +
                        'box-shadow: 0 1px 4px rgba(26, 115, 232, 0.2);' +
                        '}' +

                        '.textcase-option.selected::after {' +
                        'content: "✓";' +
                        'position: absolute;' +
                        'top: 8px;' +
                        'right: 8px;' +
                        'color: #1a73e8;' +
                        'font-weight: bold;' +
                        'font-size: 14px;' +
                        '}' +

                        '.textcase-option-title {' +
                        'font-weight: 600;' +
                        'color: #202124;' +
                        'font-size: 13px;' +
                        'line-height: 1.4;' +
                        'padding-right: 24px;' +
                        'margin: 0;' +
                        '}' +

                        '.textcase-option-description {' +
                        'font-size: 11px;' +
                        'color: #5f6368;' +
                        'line-height: 1.4;' +
                        'margin: 0;' +
                        'padding: 0;' +
                        'display: block;' +
                        'width: auto;' +
                        'min-width: 0;' +
                        'flex-shrink: 1;' +
                        '}' +

                        '.textcase-option-example {' +
                        'font-size: 11px;' +
                        'color: #1a73e8;' +
                        'font-style: italic;' +
                        'font-weight: 500;' +
                        'line-height: 1.4;' +
                        'padding-top: 4px;' +
                        'margin: 2px 0 0 0;' +
                        'border-top: 1px solid #e8eaed;' +
                        '}' +

                        '.textcase-preview-container {' +
                        'border-top: 1px solid #f0f0f0;' +
                        'padding-top: 12px;' +
                        'max-width: 100%;' +
                        '}' +

                        '.textcase-preview-section {' +
                        'margin-bottom: 10px;' +
                        'max-width: 100%;' +
                        '}' +

                        '.textcase-preview-section label {' +
                        'display: block;' +
                        'margin-bottom: 4px;' +
                        'font-weight: 600;' +
                        'color: #202124;' +
                        'font-size: 12px;' +
                        'line-height: 1.4;' +
                        'word-wrap: break-word;' +
                        '}' +

                        '.textcase-preview-box {' +
                        'border: 1px solid #dadce0;' +
                        'border-radius: 4px;' +
                        'padding: 8px;' +
                        'background: #f8f9fa;' +
                        'font-family: "Courier New", monospace;' +
                        'font-size: 12px;' +
                        'line-height: 1.4;' +
                        'min-height: 32px;' +
                        'max-height: 80px;' +
                        'overflow-y: auto;' +
                        'overflow-x: hidden;' +
                        'word-wrap: break-word;' +
                        'word-break: break-word;' +
                        'white-space: pre-wrap;' +
                        '-webkit-overflow-scrolling: touch;' +
                        'scrollbar-width: thin;' +
                        'scrollbar-color: #9aa0a6 transparent;' +
                        '}' +

                        '.textcase-preview-box::-webkit-scrollbar {' +
                        'width: 6px;' +
                        'height: 6px;' +
                        '}' +

                        '.textcase-preview-box::-webkit-scrollbar-track {' +
                        'background: transparent;' +
                        '}' +

                        '.textcase-preview-box::-webkit-scrollbar-thumb {' +
                        'background-color: #9aa0a6;' +
                        'border-radius: 3px;' +
                        '}' +

                        '.textcase-preview-box.original {' +
                        'background: #fff3e0;' +
                        'border-color: #ffcc02;' +
                        '}' +

                        '.textcase-preview-box.converted {' +
                        'background: #e8f5e8;' +
                        'border-color: #34a853;' +
                        'font-weight: 500;' +
                        '}' +

                        '.textcase-preview-box:empty::before {' +
                        'content: "Preview will appear here...";' +
                        'color: #9aa0a6;' +
                        'font-style: italic;' +
                        'font-size: 11px;' +
                        '}' +

                        '@media (max-width: 320px) {' +
                        '.textcase-dialog-container {' +
                        'padding: 8px;' +
                        '}' +
                        '.textcase-option {' +
                        'padding: 10px;' +
                        '}' +
                        '.textcase-preview-box {' +
                        'max-height: 60px;' +
                        '}' +
                        '}'
                    );
                    head.append(style);

                    // Create case options
                    var optionsContainer = dialog.getElement().getDocument().getById('textcase-options');
                    if (optionsContainer) {
                        var optionTypes = [
                            { 
                                key: 'sentence', 
                                example: 'This is sentence case.',
                                tooltip: 'Sentence case: Capitalizes the first letter of the first word and keeps the rest in lowercase. Example: "This is sentence case."'
                            },
                            { 
                                key: 'title', 
                                example: 'This Is Title Case',
                                tooltip: 'Title Case: Capitalizes the first letter of each major word, leaving minor words lowercase unless at start/end. Example: "This Is Title Case"'
                            },
                            { 
                                key: 'upper', 
                                example: 'THIS IS UPPER CASE',
                                tooltip: 'UPPER CASE: Converts all letters to uppercase. Example: "THIS IS UPPER CASE"'
                            },
                            { 
                                key: 'lower', 
                                example: 'this is lower case',
                                tooltip: 'lower case: Converts all letters to lowercase. Example: "this is lower case"'
                            },
                            { 
                                key: 'capitalize', 
                                example: 'This Is Capitalize Each Word',
                                tooltip: 'Capitalize Each Word: Capitalizes the first letter of every word. Example: "This Is Capitalize Each Word"'
                            },
                            { 
                                key: 'toggle', 
                                example: 'tHIS iS tOGGLE cASE',
                                tooltip: 'tOGGLE cASE: Inverts the case of each letter. Example: "tHIS iS tOGGLE cASE"'
                            }
                        ];

                        var html = '';
                        for (var i = 0; i < optionTypes.length; i++) {
                            var option = optionTypes[i];
                            html += '<div class="textcase-option" data-case="' + option.key + '">' +
                                '<div class="textcase-option-title">' + lang.caseOptions[option.key] + '</div>' +
                                '<div class="textcase-option-description">' + lang.tooltips[option.key] + '</div>' +
                                '<div class="textcase-option-example">' + option.example + '</div>' +
                                '</div>';
                        }
                        optionsContainer.setHtml(html);

                        // Add click handlers
                        var options = optionsContainer.find('.textcase-option');
                        for (var j = 0; j < options.count(); j++) {
                            options.getItem(j).on('click', function () {
                                var caseType = this.getAttribute('data-case');

                                // Remove previous selection
                                var allOptions = optionsContainer.find('.textcase-option');
                                for (var k = 0; k < allOptions.count(); k++) {
                                    allOptions.getItem(k).removeClass('selected');
                                }

                                // Add selection to current
                                this.addClass('selected');
                                dialog.selectedCase = caseType;

                                // Update preview
                                var convertedText = textCaseConverters[caseType](dialog.originalText);
                                var convertedTextEl = dialog.getElement().getDocument().getById('converted-text');
                                if (convertedTextEl) {
                                    convertedTextEl.setHtml(CKEDITOR.tools.htmlEncode(convertedText));
                                }
                            });
                        }
                    }
                },

                onOk: function () {
                    if (!this.selectedCase) {
                        alert('Please select a case conversion option.');
                        return false;
                    }

                    var convertedText = textCaseConverters[this.selectedCase](this.originalText);

                    // Apply the conversion to the editor
                    var selection = editor.getSelection();
                    if (selection) {
                        var ranges = selection.getRanges();
                        if (ranges.length > 0) {
                            editor.fire('saveSnapshot');
                            
                            var range = ranges[0];
                            range.deleteContents();
                            range.insertNode(editor.document.createText(convertedText));

                            // Update selection
                            range.collapse();
                            selection.selectRanges([range]);
                            
                            editor.fire('saveSnapshot');
                        }
                    }

                    // Close the dialog
                    this.hide();
                    return true;
                },

                buttons: [
                    {
                        type: 'button',
                        id: 'ok',
                        label: lang.apply,
                        'class': 'cke_dialog_ui_button_ok',
                        onClick: function (evt) {
                            var dialog = this.getDialog();
                            if (dialog.fire('ok', { hide: true }).hide !== false) {
                                dialog.hide();
                            }
                        }
                    },
                    {
                        type: 'button',
                        id: 'cancel',
                        label: lang.cancel,
                        'class': 'cke_dialog_ui_button_cancel',
                        onClick: function (evt) {
                            this.getDialog().hide();
                        }
                    }
                ]
            };
        });

        // Add keyboard shortcut
        editor.setKeystroke(CKEDITOR.CTRL + CKEDITOR.ALT + 67 /*C*/, 'textcase');
    }
});
