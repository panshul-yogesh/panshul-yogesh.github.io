CKEDITOR.plugins.add('insertsnippets', {
    icons: 'insertsnippets',
    init: function (editor) {
        // Add styles to the page head
        const styleId = 'insert-snippets-styles';
        let products = [];
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .custom-select-container {
                    position: relative;
                    width: 100%;
                    margin-bottom: 10px;
                }
                .custom-select-input {
                    width: 100%;
                    padding: 6px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                .custom-select-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 1000;
                    display: none;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .custom-select-option {
                    padding: 8px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .custom-select-option:hover {
                    background-color: #f0f0f0;
                }
                .scope-selector {
                    margin-bottom: 15px;
                }
                .scope-selector label {
                    margin-right: 15px;
                    cursor: pointer;
                }
                .scope-selector input[type="radio"] {
                    margin-right: 5px;
                }
                #md5Input {
                    width: 100%;
                    padding: 6px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                .error-message {
                    color: #d32f2f;
                    font-size: 12px;
                    margin-top: 5px;
                    display: none;
                }
                .loading-indicator {
                    text-align: center;
                    padding: 10px;
                    color: #666;
                    font-style: italic;
                }
                .selected-option {
                    background-color: #e3f2fd !important;
                }
                .searchable-select-container {
                    position: relative;
                    width: 100%;
                    margin-bottom: 10px;
                }
                .searchable-select-input {
                    width: 100%;
                    padding: 6px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    margin-bottom: 5px;
                }
                .filtered-option {
                    display: none;
                }
                .custom-searchable-dropdown {
                    position: relative;
                    width: 100%;
                    margin-bottom: 25px;
                    display: block;
                }
                .custom-searchable-label {
                    display: block;
                    margin-bottom: 10px;
                    font-weight: bold;
                    color: #333;
                    font-size: 14px;
                }
                .custom-searchable-input {
                    width: 80%;
                    padding: 10px 32px 10px 12px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    cursor: pointer;
                    background: #fff url('data:image/svg+xml;utf8,<svg fill="gray" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>') no-repeat right 8px center;
                    font-size: 13px;
                    line-height: 1.4;
                }
                .custom-searchable-input:focus {
                    outline: none;
                    border-color: #66afe9;
                    box-shadow: 0 0 5px rgba(102,175,233,.5);
                }
                .custom-searchable-options {
                    width: 80%;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    max-height: 250px;
                    overflow-y: auto;
                    background: white;
                    border: 1px solid #ccc;
                    border-radius: 0 0 4px 4px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    z-index: 1000;
                    display: none;
                }
                .custom-searchable-option {
                    padding: 8px 12px;
                    cursor: pointer;
                }
                .custom-searchable-option:hover {
                    background-color: #f5f5f5;
                }
                .custom-searchable-option.selected {
                    background-color: #e3f2fd;
                }
            `;
            document.head.appendChild(style);
        }

        // Add the button
        editor.addCommand('insertsnippetsDialog', new CKEDITOR.dialogCommand('insertsnippetsDialog'));

        editor.ui.addButton('InsertSnippets', {
            label: 'Insert Snippet',
            command: 'insertsnippetsDialog',
            toolbar: 'insert,1'
        });

        let snippetsList = [];
        let isLoading = false;

        // Dialog definition
        CKEDITOR.dialog.add('insertsnippetsDialog', function (editor) {
            return {
                title: 'Insert Snippet',
                minWidth: 400,
                minHeight: 200,
                contents: [{
                    id: 'tab1',
                    elements: [
                        {
                            type: 'html',
                            html: `
                                <div style="padding: 10px 0;">
                                    <div class="custom-searchable-dropdown" id="snippetDropdown">
                                        <label class="custom-searchable-label">Select Snippet</label>
                                        <div class="dropdown-container">
                                            <input type="text" class="custom-searchable-input" placeholder="Search and select snippet...">
                                            <div class="custom-searchable-options"></div>
                                        </div>
                                    </div>
                                    <div id="snippetLoader"></div>
                                </div>
                            `
                        }
                    ]
                }],
                onShow: function () {
                    const dialog = this;

                    // Reset stored values
                    dialog.selectedSnippet = null;
                    dialog.snippets = null;

                    // Clear snippet dropdown if exists
                    if (dialog.snippetDropdown) {
                        dialog.snippetDropdown.clear();
                    }

                    showMessage(dialog, 'info', 'Loading snippets...');
                    loadCurrentSnippets(dialog);
                },
                onOk: async function () {
                    const dialog = this;
                    const editor = dialog.getParentEditor();
                    const selectedSnippet = dialog.selectedSnippet;

                    if (!selectedSnippet) {
                        alert('Please select a snippet');
                        return false;
                    }

                    let isNewLine = checkIfAtNewLine(editor);
                    // Create the span element with the snippet
                    var element = editor.document.createElement('snippet');
                    if (isNewLine) {
                        element.setAttribute('data-display', 'block');
                    } else {
                        element.setAttribute('data-display', 'inline');
                    }
                    element.setAttribute('content', selectedSnippet.snap_file);
                    element.setAttribute('data-productid', selectedSnippet.prod_id);
                    element.setAttribute('data-version', selectedSnippet.version);
                    element.setAttribute('data-description', selectedSnippet.description);
                    element.setAttribute('data-content', selectedSnippet.snap_file);
                    element.setAttribute('data-replace-parent', 'false');

                    let htmlContent = await fetchSnippetContent(selectedSnippet.snap_file, selectedSnippet.prod_id, element);
                    if (!isNewLine) {
                        htmlContent = extractInlineElements(htmlContent);
                    }
                    element.setHtml(htmlContent);

                    // If we're inside a <p> and inserting a block snippet, replace the paragraph
                    // with the snippet followed by a new paragraph for cursor positioning
                    if (isNewLine && editor.getSelection().getStartElement().getAscendant('p', true)) {
                        let pElement = editor.getSelection().getStartElement().getAscendant('p', true);
                        element.insertBefore(pElement);

                        // Create a new paragraph for cursor positioning after the snippet
                        var newParagraph = editor.document.createElement('p');
                        newParagraph.append(editor.document.createElement('br'));
                        newParagraph.insertAfter(element);

                        // Move cursor to the new paragraph
                        var range = editor.createRange();
                        range.moveToPosition(newParagraph, CKEDITOR.POSITION_AFTER_START);
                        editor.getSelection().selectRanges([range]);
                    } else {
                        editor.insertElement(element);

                        // If inline snippet, just move cursor after it
                        var range = editor.createRange();
                        range.moveToPosition(element, CKEDITOR.POSITION_AFTER_END);
                        editor.getSelection().selectRanges([range]);
                    }
                    return true;
                }
            };
        });

        function extractInlineElements(html) {
            // Create a temporary div to parse the HTML
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            var inlineTags = [
                //Text Formatting:
                'b', 'strong', 'i', 'em', 'u', 's', 'small', 'big', 'mark', 'sub', 'sup', 'ins', 'del', 'p',
                //Links & References:
                'a', 'abbr', 'cite', 'dfn',
                //Code & Programming:
                'code', 'kbd', 'samp', 'var', 'time',
                //Styling & Structure:
                'span', 'br', 'wbr',
                //Forms & Inputs:
                'label', 'input', 'select', 'option', 'optgroup', 'textarea', 'button',
                //Media & Images:
                'img', 'picture', 'map', 'area', 'object', 'param', 'embed', 'iframe',
                //Lists & Tables:
                'li', 'dt', 'dd',
                //Tables:
                'td', 'th', 'caption', 'colgroup', 'col',
                //Forms:
                'legend', 'summary'
            ];

            // Function to extract only inline elements recursively
            function extractInline(node) {
                let result = '';

                node.childNodes.forEach((child) => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        // Preserve text content
                        result += child.textContent;
                    } else if (child.nodeType === Node.ELEMENT_NODE) {
                        let tagName = child.tagName.toLowerCase();

                        if (inlineTags.includes(tagName)) {
                            // Preserve the inline element
                            result += child.outerHTML;
                        } else {
                            // If it's a block element, extract inline elements from within
                            result += extractInline(child);
                        }
                    }
                });

                return result;
            }

            return extractInline(tempDiv);
        }

        async function fetchSnippetContent(snap_file, prod_id, bodyElement) {
            const baseUrl = window.location.origin === 'http://localhost:4200' ?
                'https://staging.docs.microfocus.com' : window.location.origin;

            return new Promise((resolve, reject) => {
                fetch(`${baseUrl}/docops-portal/api/v1/Snippet/getsnippet/${prod_id}?filename=${snap_file}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log("Snippet response:", data);
                        if (data.GitSync && data.GitSync.responseCode === 200 && data.GitSync.data) {
                            // Display the snippet content
                            if (data.GitSync.data.snipetparsecontent) {
                                resolve(data.GitSync.data.snipetparsecontent);
                            } else {
                                resolve('<div style="color: #d32f2f; padding: 16px;">No content available for this snippet.</div>');
                            }
                        } else {
                            resolve(`<div style="color: #d32f2f; padding: 16px;">
                            Error fetching snippet content: ${data.GitSync?.message || 'Unknown error'}
                        </div>`);
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching snippet content:', error);
                        resolve(`<div style="color: #d32f2f; padding: 16px;">
                        Failed to load snippet content. Please try again later.
                    </div>`);
                    });
            });
        }

        function checkIfAtNewLine(editor) {
            // Get the current selection
            var selection = editor.getSelection();
            if (!selection) return false;

            var ranges = selection.getRanges();
            if (!ranges || !ranges.length) return false;

            var range = ranges[0];
            if (!range) return false;

            // Get the start element of the selection
            var startElement = selection.getStartElement();

            // Case 1: Selection is collapsed at the beginning of a block element
            if (range.collapsed) {
                // Check if we're at the start of a block element
                var startNode = range.startContainer;
                var startOffset = range.startOffset;

                // If the container is an element node (like a paragraph)
                if (startNode.type === CKEDITOR.NODE_ELEMENT) {
                    // If we're at position 0 in this element
                    if (startOffset === 0) {
                        // Check if this element is empty or contains only whitespace/BR
                        var blockContent = startNode.getHtml();
                        if (!blockContent || blockContent === '' ||
                            blockContent === '&nbsp;' ||
                            blockContent === '<br>' ||
                            blockContent === '<br />' ||
                            /^(\s|<br>|<br \/>|&nbsp;)*$/.test(blockContent)) {
                            return true;
                        }
                    }
                }

                // If the container is a text node
                if (startNode.type === CKEDITOR.NODE_TEXT) {
                    // If we're at position 0 in this text node and it's the first child of its parent
                    if (startOffset === 0) {
                        var parent = startNode.getParent();
                        if (parent && parent.getFirst && startNode.equals(parent.getFirst())) {
                            // And if this text node only contains whitespace before cursor
                            var textContent = startNode.getText().slice(0, startOffset);
                            if (!textContent || /^\s*$/.test(textContent)) {
                                return true;
                            }
                        }
                    }
                }

                // Case 2: Check if we're in a block element that only contains the cursor
                if (startElement) {
                    var block = startElement.getAscendant({ p: 1, div: 1, li: 1, td: 1, th: 1 }, true);
                    if (block) {
                        var blockText = block.getText().trim();
                        var blockHtml = block.getHtml();

                        if (blockText === '' ||
                            /^(\s|<br>|<br \/>|&nbsp;)*$/.test(blockHtml)) {
                            return true;
                        }
                    }
                }

                // Case 3: If we're directly after a block level element
                if (startNode.type === CKEDITOR.NODE_ELEMENT) {
                    var prevSibling = startNode.getPrevious();
                    if (prevSibling && prevSibling.type === CKEDITOR.NODE_ELEMENT &&
                        (prevSibling.is('br') || prevSibling.is('hr'))) {
                        return true;
                    }
                }

                // Case 4: If we're at the beginning of the document
                if (startOffset === 0 && !startNode.getPrevious()) {
                    var parent = startNode.getParent();
                    while (parent && !parent.equals(editor.editable())) {
                        if (parent.getPrevious()) {
                            break;
                        }
                        parent = parent.getParent();
                    }
                    if (parent && parent.equals(editor.editable())) {
                        return true;
                    }
                }

                // Case 5: We're inside a new paragraph after pressing Enter
                if (startElement && startElement.getName() === 'p' &&
                    startElement.getHtml() === '<br>' &&
                    !startElement.getPrevious()) {
                    return true;
                }

                // Case 6: Check if we're at the beginning of a list item
                if (startElement && startElement.getAscendant('li', true)) {
                    var li = startElement.getAscendant('li', true);
                    var firstChild = li.getFirst();

                    // If the first child is our start element or we're at the beginning of the LI
                    if ((firstChild && firstChild.equals(startElement)) || range.startOffset === 0) {
                        // Check if the LI is empty or has only whitespace/BR
                        var liContent = li.getHtml().trim();
                        if (!liContent || liContent === '' ||
                            liContent === '&nbsp;' ||
                            liContent === '<br>' ||
                            liContent === '<br />' ||
                            /^(\s|<br>|<br \/>|&nbsp;)*$/.test(liContent)) {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        function initializeCustomDropdown(dialog, dropdownId, options, onSelect) {
            const container = dialog.getElement().findOne(`#${dropdownId}`);
            const input = container.findOne('.custom-searchable-input');
            const optionsContainer = container.findOne('.custom-searchable-options');
            let selectedValue = '';

            // Clear any existing event listeners
            input.removeAllListeners();
            optionsContainer.removeAllListeners();

            // Populate options
            function updateOptions(filterText = '') {
                optionsContainer.setHtml('');
                const filteredOptions = options.filter(opt =>
                    opt.text.toLowerCase().includes(filterText.toLowerCase()));

                filteredOptions.forEach(opt => {
                    const div = new CKEDITOR.dom.element('div');
                    div.addClass('custom-searchable-option');
                    if (opt.value === selectedValue) {
                        div.addClass('selected');
                    }
                    div.setText(opt.text);
                    div.setAttribute('data-value', opt.value);
                    optionsContainer.append(div);
                });
            }

            // Initial population
            updateOptions();

            // Event listeners
            input.on('click', function () {
                optionsContainer.setStyle('display', 'block');
            });

            input.on('input', function () {
                updateOptions(this.getValue());
                optionsContainer.setStyle('display', 'block');
            });

            optionsContainer.on('click', function (evt) {
                const target = evt.data.getTarget();
                if (target.hasClass('custom-searchable-option')) {
                    const value = target.getAttribute('data-value');
                    const text = target.getText();
                    input.setValue(text);
                    selectedValue = value;
                    optionsContainer.setStyle('display', 'none');
                    if (onSelect) {
                        onSelect(value);
                    }
                }
            });

            // Close dropdown when clicking outside
            dialog.getElement().on('click', function (evt) {
                if (!evt.data.getTarget().getAscendant(function (el) {
                    return el.$ === container.$;
                }, true)) {
                    optionsContainer.setStyle('display', 'none');
                }
            });

            return {
                getValue: () => selectedValue,
                setValue: (value, text) => {
                    selectedValue = value;
                    input.setValue(text);
                },
                clear: () => {
                    selectedValue = '';
                    input.setValue('');
                    updateOptions();
                }
            };
        }

        function loadCurrentSnippets(dialog) {
            const baseUrl = window.location.origin === 'http://localhost:4200' ? 'https://staging.docs.microfocus.com' : window.location.origin;
            let currentUrl = window.location.pathname;
            let currentproductid = '';
            let currentversion = '';
            let splitUrl = currentUrl.split('/');
            if (currentUrl.includes('/releasenotes/edit/doc/')) {
                //remove empty strings from the array
                splitUrl = splitUrl.filter(item => item !== '');
                currentproductid = splitUrl[3];
                currentversion = splitUrl[4];
            } else if (currentUrl.includes('/edit/doc/')) {
                //remove empty strings from the array
                splitUrl = splitUrl.filter(item => item !== '');
                currentproductid = splitUrl[2];
                currentversion = splitUrl[3];
            } else if (currentUrl.includes('/snippet-edit/')) {
                currentproductid = localStorage.getItem('snippet_edit_product_id');
                currentversion = localStorage.getItem('snippet_edit_version');
            }

            if (!currentproductid || !currentversion) {
                showMessage(dialog, 'error', 'Could not determine current product and version.');
                return;
            }

            showMessage(dialog, 'loading', 'Loading snippets...');

            try {
                const params = {
                    is_global: 'n',
                    prod_id: currentproductid,
                    version: currentversion
                };

                fetch(`${baseUrl}/docops-portal/api/v1/Snippet/getallsnippets`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'params=' + JSON.stringify(params)
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data?.GitSync?.data) {
                            updateSnippetsDropdown(dialog, data.GitSync.data, currentproductid, currentversion);
                        } else {
                            showMessage(dialog, 'warning', 'No snippets found for product:' + currentproductid + ',version:' + currentversion);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showMessage(dialog, 'error', 'Failed to load snippets. Please try again.');
                    });
            } catch (error) {
                console.error('Error:', error);
                showMessage(dialog, 'error', 'Failed to load snippets. Please try again.');
            }
        }

        function updateSnippetsDropdown(dialog, snippets, productId, version) {
            if (snippets && snippets.length > 0) {
                const options = snippets.map(snippet => ({
                    text: snippet.description,
                    value: JSON.stringify(snippet)
                }));

                // Initialize snippet dropdown if not already initialized
                if (!dialog.snippetDropdown) {
                    dialog.snippetDropdown = initializeCustomDropdown(
                        dialog,
                        'snippetDropdown',
                        options,
                        (value) => {
                            dialog.selectedSnippet = JSON.parse(value);
                        }
                    );
                } else {
                    // Update existing dropdown options
                    dialog.snippetDropdown = initializeCustomDropdown(
                        dialog,
                        'snippetDropdown',
                        options,
                        (value) => {
                            dialog.selectedSnippet = JSON.parse(value);
                        }
                    );
                }

                dialog.snippets = snippets;
                dialog.selectedSnippet = snippets[0];
                dialog.getElement().findOne('#snippetDropdown').setStyle('display', 'block');
                showMessage(dialog, 'success', 'Snippets loaded successfully for product:' + productId + ',version:' + version);
            } else {
                dialog.getElement().findOne('#snippetDropdown').setStyle('display', 'none');
                showMessage(dialog, 'warning', 'No snippets found for product:' + productId + ',version:' + version);
            }
        }

        function showMessage(dialog, type, message) {
            var loaderElement = dialog.getElement().findOne('#snippetLoader');
            if (loaderElement) {
                var styles = {
                    info: 'background: #e8f4ff; color: #0066cc; padding: 10px; border-radius: 4px; margin: 10px 0;',
                    error: 'background: #ffe8e8; color: #cc0000; padding: 10px; border-radius: 4px; margin: 10px 0;',
                    warning: 'background: #fff3e0; color: #cc6600; padding: 10px; border-radius: 4px; margin: 10px 0;',
                    success: 'background: #e8ffe8; color: #006600; padding: 10px; border-radius: 4px; margin: 10px 0;',
                    loading: 'background: #f5f5f5; color: #333333; padding: 10px; border-radius: 4px; margin: 10px 0;'
                };

                var icon = {
                    info: 'ℹ️',
                    error: '❌',
                    warning: '⚠️',
                    success: '✅',
                    loading: '⌛'
                };

                var html = `<div style="${styles[type]}">
                    ${icon[type]} ${message}
                    ${type === 'loading' ? '<span class="spinner"></span>' : ''}
                </div>`;

                loaderElement.setHtml(html);
                loaderElement.setStyle('display', 'block');
            }
        }
    }
});