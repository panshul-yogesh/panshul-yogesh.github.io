CKEDITOR.plugins.add('variablemanager', {
    icons: 'variablemanager',
    init: function(editor) {
        // Add toolbar button
        editor.ui.addButton('VariableManager', {
            label: 'Remove Variable',
            command: 'removeVariableFromSelection',
            toolbar: 'insert,4',
            icon: this.path + 'icons/variablemanager.png'
        });

        editor.addCommand('removeVariableFromSelection', {
            exec: function(editor) {
                var selection = editor.getSelection();
                var element = selection.getStartElement();
                
                if (isVariableElement(element)) {
                    // Direct click on variable
                    removeVariableFormatting(editor, element);
                } else {
                    alert('Please select a variable to remove.');
                }
            }
        });
    }
});

function isVariableElement(element) {
    if (!element) return false;
    // Check for any of the variable classes
    return element.hasClass('data-gnv') || 
           element.hasClass('data-pnv') || 
           element.hasClass('data-nv') ||
           element.hasAttribute('data-gnv') ||
           element.hasAttribute('data-pnv') ||
           element.hasAttribute('data-nv') ||
           element.hasAttribute('data-gnv-value') ||
           element.hasAttribute('data-pnv-value') ||
           element.hasAttribute('data-nv-value');
}

function removeVariableFormatting(editor, element) {
    // Create an undo snapshot before making changes
    editor.fire('saveSnapshot');
    
    // Get the text content
    var textContent = element.getText();
    
    // Remove extra spaces before and after the element
    var next = element.getNext();
    var prev = element.getPrevious();
    
    if (next && next.type === CKEDITOR.NODE_TEXT && next.getText() === ' ') {
        next.remove();
    }
    if (prev && prev.type === CKEDITOR.NODE_TEXT && prev.getText() === ' ') {
        prev.remove();
    }
    
    // Replace the element with its text content
    element.setText(textContent);
    element.removeAttribute('class');
    element.removeAttribute('data-gnv');
    element.removeAttribute('data-gnv-value');
    element.removeAttribute('data-pnv');
    element.removeAttribute('data-pnv-value');
    element.removeAttribute('data-nv');
    element.removeAttribute('data-nv-value');
    element.removeAttribute('data-replace-parent');
    element.removeAttribute('data-productid');
    element.removeAttribute('data-version');
    
    // Create another snapshot for undo/redo functionality
    editor.fire('saveSnapshot');
    
    // Notify the editor of content change
    editor.fire('change');
}