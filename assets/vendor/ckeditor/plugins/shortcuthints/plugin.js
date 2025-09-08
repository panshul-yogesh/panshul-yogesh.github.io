CKEDITOR.plugins.add('shortcuthints', {
    icons: 'shortcuthints',
    init: function (editor) {
        // Hardcoded list of shortcuts
        var shortcuts = [
            { label: 'Bold', keystroke: 'Ctrl+B' },
            { label: 'Italic', keystroke: 'Ctrl+I' },
            { label: 'Underline', keystroke: 'Ctrl+U' },
            { label: 'Strike', keystroke: 'Ctrl+Alt+S' },
            { label: 'Link', keystroke: 'Ctrl+K' },
            { label: 'Undo', keystroke: 'Ctrl+Z' },
            { label: 'Redo', keystroke: 'Ctrl+Y' },
            { label: 'Find', keystroke: 'Ctrl+F' },
            { label: 'Image', keystroke: 'Ctrl+Alt+K' },
            { label: 'Bulleted List', keystroke: 'Ctrl+Alt+L' },
            { label: 'Numbered List', keystroke: 'Ctrl+Alt+N' },
            { label: 'Table', keystroke: 'Ctrl+Alt+T' },
            { label: 'Remove Format', keystroke: 'Ctrl+Alt+R' },
            { label: 'Cut', keystroke: 'Ctrl+X' },
            { label: 'Copy', keystroke: 'Ctrl+C' },
            { label: 'Paste', keystroke: 'Ctrl+V' },
            { label: 'Subscript', keystroke: 'Ctrl+Alt+,' },
            { label: 'Superscript', keystroke: 'Ctrl+Alt+.' },
            { label: 'Unlink', keystroke: 'Ctrl+Alt+U' },
            { label: 'Select All', keystroke: 'Ctrl+A' },
            { label: 'Source', keystroke: 'Ctrl+Alt+Q' },
            { label: 'Computer code', keystroke: 'Ctrl+Alt+X' },
            { label: 'Admonition', keystroke: 'Ctrl+Alt+Y' },
            // { label: 'Add section for reuse', keystroke: 'Ctrl+Alt+Z' },
            // { label: 'Reuse section', keystroke: 'Ctrl+Alt+F' },
            { label: 'Toggle dynamic view', keystroke: 'Ctrl+Alt+G' }
        ];
        
        editor.addCommand('showShortcutHints', {
            exec: function(editor) {
                var shortcutsHtml = shortcuts.map(function(shortcut) {
                    return '<p><strong>' + shortcut.label + ':</strong> ' + shortcut.keystroke + '</p>';
                }).join('');

                // Create a dialog to display the shortcuts
                var dialogHtml = '<div style="padding: 10px; max-height: 400px; overflow-y: auto;">' + shortcutsHtml + '</div>';
                var dialogDefinition = {
                    title: 'Keyboard Shortcuts',
                    minWidth: 400,
                    minHeight: 200,
                    contents: [
                        {
                            id: 'tab1',
                            label: '',
                            elements: [
                                {
                                    type: 'html',
                                    html: dialogHtml
                                }
                            ]
                        }
                    ],
                    buttons: [CKEDITOR.dialog.okButton]
                };

                CKEDITOR.dialog.add('shortcutHintsDialog', function() {
                    return dialogDefinition;
                });

                editor.openDialog('shortcutHintsDialog');
            }
        });

        editor.ui.addButton('ShortcutHints', {
            label: 'Show Keyboard Shortcuts',
            command: 'showShortcutHints',
            toolbar: 'tools'
        });
    }
});
