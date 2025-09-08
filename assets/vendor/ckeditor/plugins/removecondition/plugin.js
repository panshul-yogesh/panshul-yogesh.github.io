CKEDITOR.plugins.add('removecondition', {
    icons: 'removecondition',

    init: function(editor) {
        // Add toolbar button and command
        editor.ui.addButton('RemoveCondition', {
            label: 'Remove Conditions',
            command: 'removeCondition',
            toolbar: 'insert,6'
        });

        editor.addCommand('removeCondition', {
            exec: function(editor) {
                try {
                    // Check if there's a selection
                    const selection = editor.getSelection();
                    if (!selection || selection.getType() === CKEDITOR.SELECTION_NONE) {
                        alert('Please select some text first.');
                        return false;
                    }

                    const ranges = selection.getRanges();
                    let conditionsFound = false;

                    editor.fire('saveSnapshot');

                    ranges.forEach(range => {
                        // Get all elements within the range
                        range.enlarge(CKEDITOR.ENLARGE_ELEMENT);
                        const walker = new CKEDITOR.dom.walker(range);
                        let node;

                        while (node = walker.next()) {
                            if (node.type === CKEDITOR.NODE_ELEMENT) {
                                // Check for condition attributes
                                if (node.hasAttribute('data-condition-name') || 
                                    node.hasAttribute('data-condition-value')) {
                                    removeConditionFromElement(node);
                                    conditionsFound = true;
                                }
                            }
                        }
                    });

                    editor.fire('saveSnapshot');

                    if (!conditionsFound) {
                        alert('No conditions found in the selected text.');
                    }

                } catch (error) {
                    console.error('Error removing conditions:', error);
                    alert('An error occurred while removing conditions.');
                }
            }
        });
    }
});

function removeConditionFromElement(element) {
    if (!element || !element.removeAttribute) return;
    element.removeAttribute('data-condition-name');
    element.removeAttribute('data-condition-value');
}