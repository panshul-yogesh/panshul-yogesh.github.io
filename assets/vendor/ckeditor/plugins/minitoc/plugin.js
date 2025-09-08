CKEDITOR.plugins.add('minitoc', {
    icons: 'minitoc',
    init: function(editor) {
        editor.addCommand('insertMiniToc', {
            exec: function(editor) {
                try {
                    // Create the mini TOC span element
                    var miniTocSpan = '<span class="minitoc" data-minitoc="true">Mini Table of Contents</span>';
                    
                // Get current selection
                var selection = editor.getSelection();
                var range = selection.getRanges()[0];
                
                // Insert at current position, ensuring it's on a new line
                var currentPath = editor.elementPath();
                var blockElement = currentPath.block || currentPath.blockLimit;
                
                // Check if we're at the end of a block
                var isAtEndOfBlock = false;
                
                if (range.startContainer.type === CKEDITOR.NODE_TEXT) {
                    // For text nodes, check if cursor is at the end of text
                    isAtEndOfBlock = range.startOffset === range.startContainer.getText().length;
                } else {
                    // For element nodes
                    isAtEndOfBlock = range.startOffset === range.startContainer.getChildCount();
                }
                
                // Insert with appropriate line break
                if (isAtEndOfBlock && blockElement) {
                    editor.insertHtml('<br>' + miniTocSpan);
                } else {
                    editor.insertHtml('<br>' + miniTocSpan);
                }
                } catch (error) {
                    console.error('Error inserting mini TOC:', error);
                    alert('Error inserting mini TOC');
                }
            }
        });
        
        // Add the button to the toolbar
        editor.ui.addButton('MiniToc', {
            label: 'Insert mini TOC',
            command: 'insertMiniToc',
            toolbar: 'insert,7'
        });
    }
}); 