CKEDITOR.plugins.add('admonitionclipboard', {
    init: function (editor) {
        // Create clipboard storage
        if (!editor.admonitionClipboard) {
            editor.admonitionClipboard = '';
        }

        // Handle click on admonition for copy
        editor.on('contentDom', function () {
            const editable = editor.editable();
            editable.attachListener(editable, 'click', function (evt) {
                const target = evt.data.getTarget();
                // Check if clicked element or its parent is an admonition
                const admonitionElement = target.hasClass('admonition') ? target : target.getAscendant('div.admonition');

                if (admonitionElement) {
                    // Check if click was in the top-right corner (copy button area)
                    const rect = admonitionElement.$.getBoundingClientRect();
                    const x = evt.data.$.clientX - rect.left;
                    const y = evt.data.$.clientY - rect.top;

                    if (x >= rect.width - 80 && y <= 40) { // Copy button area
                        // Get the complete HTML with all attributes
                        const html = admonitionElement.getOuterHtml();

                        // Create a temporary div in the editor to hold our content
                        const tempContainer = new CKEDITOR.dom.element('div', editor.document);
                        tempContainer.setHtml(html);
                        editor.insertElement(tempContainer);

                        // Create and select range
                        const range = editor.createRange();
                        range.selectNodeContents(tempContainer);
                        const selection = editor.getSelection();
                        selection.selectRanges([range]);

                        // Copy to clipboard
                        editor.document.$.execCommand('copy');

                        // Remove the temporary element and restore selection
                        const bookmark = selection.createBookmarks();
                        tempContainer.remove();
                        selection.selectBookmarks(bookmark);

                        // Visual feedback
                        admonitionElement.addClass('copying');
                        setTimeout(() => {
                            admonitionElement.removeClass('copying');
                        }, 2000);
                    }
                }
            });
        });

        // Add clipboard paste handler to check for admonition HTML in system clipboard
        editor.on('paste', function (evt) {
            const clipboardData = evt.data.dataValue;

            // Check if clipboard contains admonition HTML
            if (typeof clipboardData === 'string' && clipboardData.includes('class="admonition')) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = clipboardData;

                // Verify it's a valid admonition
                const admonition = tempDiv.querySelector('.admonition');
                if (admonition) {
                    // Store in editor's clipboard with timestamp
                    editor.admonitionClipboard = admonition.outerHTML;
                    editor.admonitionClipboardTimestamp = Date.now();
                }
            }
        });
    }
}); 