CKEDITOR.plugins.add('dynamiccss', {
    icons: 'dynamiccss',
    init: function (editor) {
        let styleElement = null;
        let cssLoaded = false;

        editor.addCommand('toggleDynamicCSS', {
            exec: function (editor) {
                try {
                    const editorFrame = editor.container.$.querySelector('.cke_wysiwyg_frame');
                    const editorDocument = editorFrame.contentDocument;

                    if (styleElement) {
                        styleElement.remove();
                        styleElement = null;
                        cssLoaded = false;
                    } else {
                        styleElement = editorDocument.createElement('style');
                        editorDocument.head.appendChild(styleElement);

                        fetch('./assets/vendor/ckeditor/plugins/dynamiccss/dynamic.css')
                            .then(response => response.text())
                            .then(css => {
                                if (styleElement) {
                                    styleElement.textContent = css;
                                    cssLoaded = true;
                                }
                            })
                            .catch(error => console.error('Error loading CSS:', error));
                    }
                } catch (error) {
                    console.error('Error in toggleDynamicCSS:', error);
                }
            }
        });

        editor.ui.addButton('DynamicCSS', {
            label: 'Toggle Dynamic View',
            command: 'toggleDynamicCSS',
            toolbar: 'insert,9'
        });

        // Add context menu item
        if (editor.contextMenu) {
            try {
                editor.addMenuGroup('htmlTagGroup');
                editor.addMenuItem('addHtmlTag', {
                    label: 'Add tag',
                    command: 'addHtmlTagCmd',
                    group: 'htmlTagGroup'
                });

                editor.contextMenu.addListener(function (element) {
                    return cssLoaded ? { addHtmlTag: CKEDITOR.TRISTATE_OFF } : null;
                });
            } catch (error) {
                console.error('Error setting up context menu:', error);
            }
        }

        editor.addCommand('addHtmlTagCmd', {
            exec: function (editor) {
                try {
                    editor.openDialog('addHtmlTagDialog');
                } catch (error) {
                    console.error('Error executing addHtmlTagCmd:', error);
                }
            }
        });

        CKEDITOR.dialog.add('addHtmlTagDialog', function (editor) {
            return {
                title: 'Select HTML Tag',
                minWidth: 300,
                minHeight: 100,
                contents: [{
                    id: 'tab1',
                    label: 'Select Tag',
                    elements: [
                        {
                            type: 'html',
                            id: 'description',
                            html: '<div>These are the valid tags that can be nested inside a  <b id="parentTagHolder"></b> element.</div>'
                        },
                        {
                            type: 'select',
                            id: 'tagSelect',
                            label: 'Choose a tag:',
                            items: [], // This will be populated when the dialog opens
                            commit: function (data) {
                                data.tag = this.getValue();
                            }
                        }]
                }],
                onShow: function () {
                    try {
                        var dialog = this;
                        var parentTag = editor.getSelection().getStartElement().getName();

                        var descriptionElement = this.getContentElement('tab1', 'description').getElement();
                        var parentTagHolder = descriptionElement.findOne('#parentTagHolder');
                        if (parentTagHolder) {
                            parentTagHolder.setText(getTagDisplayName(parentTag));
                        }

                        var validTags = getValidChildTags(parentTag);
                        var select = dialog.getContentElement('tab1', 'tagSelect');
                        select.clear();
                        validTags.forEach(function (tag) {
                            select.add(tag[1], tag[0]);
                        });
                        if (validTags.length === 0) {
                            select.add('Division', 'div');
                        }
                    } catch (error) {
                        console.error('Error in dialog onShow:', error);
                        alert("error occured whild showing html tags dialog");
                    }
                },

                onOk: function () {
                    try {
                        var dialog = this;
                        var data = {};
                        this.commitContent(data);
                        if (!data.tag) {
                            alert('No tag selected');
                            return;
                        }

                        var selection = editor.getSelection();
                        var element = selection.getStartElement();

                        var appropriateParent = findAppropriateParent(element, data.tag);

                        if (appropriateParent) {
                            createAndInsertElement(editor, data.tag, appropriateParent);
                        } else {
                            createAndInsertElement(editor, data.tag);
                        }

                    } catch (error) {
                        console.error('Error in dialog onOk:', error);
                        alert("Unable to insert html tag");
                    }
                }
            };
        });

        function getValidChildTags(parentTag) {
            try {
                const allTags = [
                    // Document metadata
                    ['head', 'Head'], ['title', 'Title'], ['base', 'Base'], ['link', 'Link'], ['meta', 'Meta'], ['style', 'Style'],

                    // Content sectioning
                    ['body', 'Body'], ['article', 'Article'], ['section', 'Section'], ['nav', 'Navigation'], ['aside', 'Aside'],
                    ['h1', 'Heading 1'], ['h2', 'Heading 2'], ['h3', 'Heading 3'], ['h4', 'Heading 4'], ['h5', 'Heading 5'], ['h6', 'Heading 6'],
                    ['header', 'Header'], ['footer', 'Footer'], ['address', 'Address'],

                    // Text content
                    ['p', 'Paragraph'], ['hr', 'Horizontal Rule'], ['pre', 'Preformatted'], ['blockquote', 'Blockquote'],
                    ['ol', 'Ordered List'], ['ul', 'Unordered List'], ['li', 'List Item'], ['dl', 'Description List'],
                    ['dt', 'Description Term'], ['dd', 'Description Details'], ['figure', 'Figure'], ['figcaption', 'Figure Caption'],
                    ['main', 'Main'], ['div', 'Division'],

                    // Inline text semantics
                    ['a', 'Anchor'], ['em', 'Emphasis'], ['strong', 'Strong'], ['small', 'Small'], ['s', 'Strikethrough'],
                    ['cite', 'Citation'], ['q', 'Quote'], ['dfn', 'Definition'], ['abbr', 'Abbreviation'], ['ruby', 'Ruby Annotation'],
                    ['rt', 'Ruby Text'], ['rp', 'Ruby Parenthesis'], ['data', 'Data'], ['time', 'Time'], ['code', 'Code'],
                    ['var', 'Variable'], ['samp', 'Sample Output'], ['kbd', 'Keyboard Input'], ['sub', 'Subscript'], ['sup', 'Superscript'],
                    ['i', 'Italic'], ['b', 'Bold'], ['u', 'Underline'], ['mark', 'Mark'], ['bdi', 'Bidirectional Isolate'],
                    ['bdo', 'Bidirectional Override'], ['span', 'Span'], ['br', 'Line Break'], ['wbr', 'Word Break Opportunity'],

                    // Image and multimedia
                    ['img', 'Image'], ['audio', 'Audio'], ['video', 'Video'], ['source', 'Source'], ['track', 'Track'],
                    ['map', 'Image Map'], ['area', 'Area'],

                    // Embedded content
                    ['iframe', 'Inline Frame'], ['embed', 'Embed'], ['object', 'Object'], ['param', 'Parameter'], ['picture', 'Picture'],

                    // Scripting
                    ['script', 'Script'], ['noscript', 'No Script'], ['canvas', 'Canvas'],

                    // Demarcating edits
                    ['del', 'Deleted Text'], ['ins', 'Inserted Text'],

                    // Table content
                    ['table', 'Table'], ['caption', 'Table Caption'], ['colgroup', 'Column Group'], ['col', 'Table Column'],
                    ['tbody', 'Table Body'], ['thead', 'Table Head'], ['tfoot', 'Table Foot'], ['tr', 'Table Row'],
                    ['td', 'Table Data Cell'], ['th', 'Table Header Cell'],

                ];

                const flowContent = ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'dl', 'pre', 'blockquote', 'figure', 'hr', 'table', 'address'];
                const inlineContent = ['a', 'em', 'strong', 'small', 's', 'cite', 'q', 'dfn', 'abbr', 'ruby', 'data', 'time', 'code', 'var', 'samp', 'kbd', 'sub', 'sup', 'i', 'b', 'u', 'mark', 'bdi', 'bdo', 'span', 'br', 'wbr', 'img', 'audio', 'video', 'canvas', 'script', 'iframe', 'embed', 'object'];

                let validTags;
                switch (parentTag.toLowerCase()) {
                    case 'html':
                        validTags = allTags.filter(tag => ['head', 'body'].includes(tag[0]));
                        break;
                    case 'head':
                        validTags = allTags.filter(tag => ['title', 'base', 'link', 'meta', 'style', 'script', 'noscript'].includes(tag[0]));
                        break;
                    case 'body':
                        validTags = allTags.filter(tag => !['html', 'head', 'title', 'base', 'link', 'meta', 'style'].includes(tag[0]));
                        break;
                    case 'ul':
                    case 'ol':
                        validTags = allTags.filter(tag => tag[0] === 'li');
                        break;
                    case 'li':
                        validTags = allTags.filter(tag =>
                            flowContent.includes(tag[0]) ||
                            inlineContent.includes(tag[0]) ||
                            ['ul', 'ol'].includes(tag[0])
                        );
                        break;
                    case 'dl':
                        validTags = allTags.filter(tag => ['dt', 'dd'].includes(tag[0]));
                        break;
                    case 'table':
                        validTags = allTags.filter(tag => ['caption', 'colgroup', 'thead', 'tbody', 'tfoot', 'tr'].includes(tag[0]));
                        break;
                    case 'colgroup':
                        validTags = allTags.filter(tag => tag[0] === 'col');
                        break;
                    case 'thead':
                    case 'tbody':
                    case 'tfoot':
                        validTags = allTags.filter(tag => tag[0] === 'tr');
                        break;
                    case 'tr':
                        validTags = allTags.filter(tag => ['th', 'td'].includes(tag[0]));
                        break;

                    case 'audio':
                    case 'video':
                        validTags = allTags.filter(tag => ['source', 'track'].includes(tag[0]));
                        break;
                    case 'ruby':
                        validTags = allTags.filter(tag => ['rt', 'rp'].includes(tag[0]));
                        break;
                    case 'p':
                    case 'h1':
                    case 'h2':
                    case 'h3':
                    case 'h4':
                    case 'h5':
                    case 'h6':
                    case 'th':
                    case 'td':
                    case 'caption':
                    case 'figcaption':
                    case 'address':
                    case 'dt':
                    case 'dd':
                        validTags = allTags.filter(tag => inlineContent.includes(tag[0]));
                        break;


                    case 'article':
                    case 'section':
                    case 'nav':
                    case 'aside':
                    case 'header':
                    case 'footer':
                    case 'main':
                    case 'div':
                        validTags = allTags.filter(tag => flowContent.includes(tag[0]) || inlineContent.includes(tag[0]));
                        break;

                    case 'figure':
                        validTags = allTags.filter(tag => ['figcaption'].concat(flowContent, inlineContent).includes(tag[0]));
                        break;

                    case 'pre':
                        validTags = allTags.filter(tag => inlineContent.includes(tag[0]));
                        break;

                    case 'blockquote':
                        validTags = allTags.filter(tag => flowContent.includes(tag[0]) || inlineContent.includes(tag[0]));
                        break;

                    case 'a':
                        validTags = allTags.filter(tag => !['a'].includes(tag[0]) && inlineContent.includes(tag[0]));
                        break;

                    case 'em':
                    case 'strong':
                    case 'small':
                    case 's':
                    case 'cite':
                    case 'q':
                    case 'dfn':
                    case 'abbr':
                    case 'time':
                    case 'code':
                    case 'var':
                    case 'samp':
                    case 'kbd':
                    case 'sub':
                    case 'sup':
                    case 'i':
                    case 'b':
                    case 'u':
                    case 'mark':
                    case 'bdi':
                    case 'bdo':
                    case 'span':
                        validTags = allTags.filter(tag => inlineContent.includes(tag[0]));
                        break;

                    case 'data':
                        validTags = allTags.filter(tag => inlineContent.includes(tag[0]));
                        break;

                    case 'picture':
                        validTags = allTags.filter(tag => ['source', 'img'].includes(tag[0]));
                        break;

                    case 'iframe':
                    case 'embed':
                    case 'object':
                        validTags = allTags.filter(tag => ['param'].concat(flowContent).includes(tag[0]));
                        break;

                    case 'map':
                        validTags = allTags.filter(tag => ['area'].concat(flowContent).includes(tag[0]));
                        break;


                    case 'canvas':
                        validTags = allTags.filter(tag => inlineContent.includes(tag[0]));
                        break;

                    case 'noscript':
                        validTags = allTags.filter(tag => !['script'].includes(tag[0]));
                        break;

                    default:
                        validTags = allTags;
                }

                return validTags;

            } catch (error) {
                console.error('Error in getValidChildTags:', error);
                return [];
            }
        }

        function createAndInsertElement(editor, tag, parent) {
            // Check for the specific case of ul/ol inside li
            if (parent && parent.getName() === 'li' && (tag === 'ul' || tag === 'ol')) {
                var newList = editor.document.createElement(tag);
                var newItem = editor.document.createElement('li');
                newList.append(newItem);
                parent.append(newList);
                editor.getSelection().selectElement(newItem);
                return newList;
            }

            var element = editor.document.createElement(tag);

            switch (tag) {
                case 'ul':
                case 'ol':
                    var li = editor.document.createElement('li');
                    element.append(li);
                    break;
                case 'table':
                    var tbody = editor.document.createElement('tbody');
                    var row = editor.document.createElement('tr');
                    var cell = editor.document.createElement('td');
                    row.append(cell);
                    tbody.append(row);
                    element.append(tbody);
                    break;
                case 'tr':
                    element.append(editor.document.createElement('td'));
                    break;
                case 'thead':
                case 'tfoot':
                    var row = editor.document.createElement('tr');
                    row.append(editor.document.createElement('th'));
                    element.append(row);
                    break;
                case 'caption':
                    element.appendText('Caption');
                    break;
            }

            if (parent) {
                parent.append(element);
            } else {
                editor.insertElement(element);
            }

            // Move cursor inside the new element
            var range = editor.createRange();
            var elementToFocus = element;

            switch (tag) {
                case 'img':
                    element.focus();
                    return element;
                case 'table':
                    elementToFocus = element.findOne('td') || element;
                    break;
                case 'ul':
                case 'ol':
                    elementToFocus = element.findOne('li') || element;
                    break;
                case 'tr':
                    elementToFocus = element.findOne('td') || element;
                    break;
                case 'thead':
                case 'tfoot':
                    elementToFocus = element.findOne('th') || element;
                    break;
            }

            range.moveToElementEditablePosition(elementToFocus, true);
            editor.getSelection().selectRanges([range]);

            return element;
        }

        function findAppropriateParent(element, tag) {
            var parent = element;
            while (parent && !parent.isBlockBoundary()) {
                var validChildTags = getValidChildTags(parent.getName());
                if (validChildTags.some(childTag => childTag[0] === tag)) {
                    return parent;
                }
                parent = parent.getParent();
            }
            return null;
        }

        function getTagDisplayName(tagName) {
            const allTags = [
                // Document metadata
                ['head', 'Head'], ['title', 'Title'], ['base', 'Base'], ['link', 'Link'], ['meta', 'Meta'], ['style', 'Style'],

                // Content sectioning
                ['body', 'Body'], ['article', 'Article'], ['section', 'Section'], ['nav', 'Navigation'], ['aside', 'Aside'],
                ['h1', 'Heading 1'], ['h2', 'Heading 2'], ['h3', 'Heading 3'], ['h4', 'Heading 4'], ['h5', 'Heading 5'], ['h6', 'Heading 6'],
                ['header', 'Header'], ['footer', 'Footer'], ['address', 'Address'],

                // Text content
                ['p', 'Paragraph'], ['hr', 'Horizontal Rule'], ['pre', 'Preformatted'], ['blockquote', 'Blockquote'],
                ['ol', 'Ordered List'], ['ul', 'Unordered List'], ['li', 'List Item'], ['dl', 'Description List'],
                ['dt', 'Description Term'], ['dd', 'Description Details'], ['figure', 'Figure'], ['figcaption', 'Figure Caption'],
                ['main', 'Main'], ['div', 'Division'],

                // Inline text semantics
                ['a', 'Anchor'], ['em', 'Emphasis'], ['strong', 'Strong'], ['small', 'Small'], ['s', 'Strikethrough'],
                ['cite', 'Citation'], ['q', 'Quote'], ['dfn', 'Definition'], ['abbr', 'Abbreviation'], ['ruby', 'Ruby Annotation'],
                ['rt', 'Ruby Text'], ['rp', 'Ruby Parenthesis'], ['data', 'Data'], ['time', 'Time'], ['code', 'Code'],
                ['var', 'Variable'], ['samp', 'Sample Output'], ['kbd', 'Keyboard Input'], ['sub', 'Subscript'], ['sup', 'Superscript'],
                ['i', 'Italic'], ['b', 'Bold'], ['u', 'Underline'], ['mark', 'Mark'], ['bdi', 'Bidirectional Isolate'],
                ['bdo', 'Bidirectional Override'], ['span', 'Span'], ['br', 'Line Break'], ['wbr', 'Word Break Opportunity'],

                // Image and multimedia
                ['img', 'Image'], ['audio', 'Audio'], ['video', 'Video'], ['source', 'Source'], ['track', 'Track'],
                ['map', 'Image Map'], ['area', 'Area'],

                // Embedded content
                ['iframe', 'Inline Frame'], ['embed', 'Embed'], ['object', 'Object'], ['param', 'Parameter'], ['picture', 'Picture'],

                // Scripting
                ['script', 'Script'], ['noscript', 'No Script'], ['canvas', 'Canvas'],

                // Demarcating edits
                ['del', 'Deleted Text'], ['ins', 'Inserted Text'],

                // Table content
                ['table', 'Table'], ['caption', 'Table Caption'], ['colgroup', 'Column Group'], ['col', 'Table Column'],
                ['tbody', 'Table Body'], ['thead', 'Table Head'], ['tfoot', 'Table Foot'], ['tr', 'Table Row'],
                ['td', 'Table Data Cell'], ['th', 'Table Header Cell'],
            ];

            const tag = allTags.find(t => t[0].toLowerCase() === tagName.toLowerCase());
            return tag ? tag[1] : tagName; // If not found, return the original tag name
        }
    }
});
