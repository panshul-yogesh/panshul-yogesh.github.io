CKEDITOR.plugins.add('selectedcontext', {
    icons: 'selectedcontext',
    init: function (editor) {

        editor.addCommand('insertSelectedContext', {
            exec: function (editor) {
                const selection = editor.getSelection();
                //check user has made a text selection
                if (!selection.getSelectedText().length > 0) {
                    alert('Please select a text to add a context');
                    return;
                }
                if (selection) {
                    const id = 'context_' + Math.random().toString(36).substring(2, 15);

                    // First, remove any existing context tags from the entire editor content
                    const editorBody = editor.document.getBody();
                    const contextElements = editorBody.find('context');
                    for (let i = 0; i < contextElements.count(); i++) {
                        const contextElement = contextElements.getItem(i);
                        const textContent = contextElement.getText();
                        contextElement.insertBeforeMe(new CKEDITOR.dom.text(textContent));
                        contextElement.remove();
                    }

                    // Now handle the new context tag creation
                    const range = selection.getRanges()[0];
                    const selectedContent = selection.getSelectedText();

                    // Create new context element
                    let context = editor.document.createElement('context');
                    context.setAttribute('id', id);
                    context.setText(selectedContent);

                    // Replace selection with new context
                    range.deleteContents();
                    range.insertNode(context);

                    // Fire event for Angular component
                    editor.fire('contextAdded', {
                        id: id,
                        selectedContent: selectedContent
                    });
                }
            }
        });

        editor.ui.addButton('SelectedContext', {
            label: 'Add Selected Context',
            command: 'insertSelectedContext',
            toolbar: 'insert,3'
        });
    }
});