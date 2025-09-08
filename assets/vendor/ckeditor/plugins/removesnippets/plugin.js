CKEDITOR.plugins.add('removesnippets', {
    icons: 'removesnippets',
    init: function (editor) {
        // Add the button
        editor.addCommand('removeSnippets', {
            exec: function (editor) {
                // Get selection
                var selection = editor.getSelection();
                var element = selection.getStartElement();

                // Find the closest snippet element
                var snippet = element.getAscendant('snippet', true);

                if (snippet) {
                    // Store cursor position
                    var range = editor.createRange();
                    range.moveToPosition(snippet, CKEDITOR.POSITION_BEFORE_START);

                    // Remove the snippet
                    snippet.remove();

                    // Restore cursor at the position where the snippet was
                    editor.getSelection().selectRanges([range]);
                } else {
                    // If no snippet found, show a message
                    alert('Please place cursor inside a snippet to remove it');
                }
            }
        });

        editor.ui.addButton('RemoveSnippets', {
            label: 'Remove Snippet',
            command: 'removeSnippets',
            toolbar: 'insert,5'
        });
    }
});