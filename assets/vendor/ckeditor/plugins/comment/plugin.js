CKEDITOR.plugins.add('comment', {
    icons: 'comment',
    init: function (editor) {
        editor.addCommand('insertComment', {
            exec: function (editor) {
                const selection = editor.getSelection();
                //check user has made a text selection
                if(!selection.getSelectedText().length > 0){
                    alert('Please select a text to add a comment');
                    return;
                }
                if (selection) {
                    const id = 'comment_' + Math.random().toString(36).substring(2, 15);
                    // Get the selected text/content
                    const selectedContent = selection.getSelectedText();
                    const range = selection.getRanges()[0];

                    // Create comment element with the selected content
                    let comment = editor.document.createElement('comment');
                    comment.setAttribute('name', id);
                    comment.setText(selectedContent);

                    // Replace the selection with the comment element
                    range.deleteContents();
                    range.insertNode(comment);

                    // Fire event for Angular component
                    editor.fire('commentAdded', {
                        id: id,
                        element: comment
                    });
                }
            }
        });

        editor.ui.addButton('Comment', {
            label: 'Add Comment',
            command: 'insertComment',
            toolbar: 'insert,3'
        });

        // Add click handler for comments
        editor.on('contentDom', function () {
            editor.editable().on('click', function (event) {
                const target = event.data.getTarget();
                if (target.is('comment')) {
                    editor.fire('commentClicked', {
                        id: target.getAttribute('name'),
                        element: target
                    });
                }
            });
        });

        // Add double-click handler for comments
        editor.on('contentDom', function () {
            editor.editable().on('dblclick', function (event) {
                const target = event.data.getTarget();
                if (target.is('comment')) {
                    editor.fire('commentDoubleClicked', {
                        id: target.getAttribute('name'),
                        element: target
                    });
                }
            });

            // Add mutation observer to track comment deletions
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.removedNodes.forEach(function(node) {
                        if (node.nodeName === 'COMMENT') {
                            editor.fire('commentDeleted', {
                                id: node.getAttribute('name')
                            });
                        }
                    });
                });
            });

            observer.observe(editor.editable().$, {
                childList: true,
                subtree: true
            });
        });
    }
});