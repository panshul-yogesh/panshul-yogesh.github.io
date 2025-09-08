// Register the plugin with CKEditor
CKEDITOR.plugins.add('applycondition', {
    // Register icons
    icons: 'applycondition',

    // Plugin initialization
    init: function (editor) {
        // Register the dialog
        CKEDITOR.dialog.add('applyConditionDialog', function (editor) {
            return {
                title: 'Apply Condition',
                minWidth: 400,
                minHeight: 200,
                contents: [{
                    id: 'tab1',
                    label: 'Settings',
                    elements: [{
                        type: 'select',
                        id: 'conditionName',
                        label: 'Condition Name',
                        items: [],
                        setup: function (widget) {
                            // Will be populated when dialog opens
                        },
                        onChange: function () {
                            var dialog = this.getDialog();
                            var selectedName = this.getValue();
                            var conditions = dialog.conditions;
                            var condition = conditions.find(c => c.name === selectedName);

                            // Update checkboxes container
                            var checkboxesContainer = dialog.getContentElement('tab1', 'conditionValues');
                            var values = condition ? condition.value.split(',').map(v => v.trim()) : [];

                            // Clear existing checkboxes
                            var containerElement = checkboxesContainer.getElement();
                            containerElement.setHtml(`
                                <div style="margin-top: 10px;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Select Values:</label>
                                    <div class="checkbox-container" style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; border-radius: 4px;">
                                    </div>
                                </div>
                            `);

                            var checkboxContainer = containerElement.findOne('.checkbox-container');

                            // Create checkboxes for each value
                            values.forEach(value => {
                                var checkboxHtml = `
                                    <div class="condition-checkbox" style="margin: 8px 0; display: flex; align-items: center;">
                                        <input type="checkbox" 
                                               id="condition_${value}" 
                                               value="${value}" 
                                               style="margin-right: 8px; cursor: pointer;">
                                        <label for="condition_${value}" 
                                               style="cursor: pointer; user-select: none;">
                                            ${value}
                                        </label>
                                    </div>`;
                                checkboxContainer.appendHtml(checkboxHtml);
                            });

                            // If no values, show a message
                            if (values.length === 0) {
                                checkboxContainer.setHtml('<p style="color: #666; margin: 0;">No values available for this condition</p>');
                            }
                        }
                    },
                    {
                        type: 'html',
                        id: 'conditionValues',
                        html: '<div class="condition-values-wrapper"></div>',
                        style: 'margin-top: 10px;'
                    },
                    {
                        type: 'html',
                        html: '<div id="conditionLoader" style="text-align: center; padding: 20px;">Loading... <span class="spinner"></span></div>'
                    }]
                }],
                onShow: function () {
                    var dialog = this;
                    var editor = dialog.getParentEditor();
                    var selection = editor.getSelection();
                    var nameSelect = dialog.getContentElement('tab1', 'conditionName');
                    var valueContainer = dialog.getContentElement('tab1', 'conditionValues');

                    dialog.disableButton('ok');
                    var ranges = selection.getRanges();
                    var startElementimg = getNearestElement(ranges[0].startContainer);

                    if (!startElementimg) {
                        showMessage(dialog, 'error', 'Please select the section to apply condition');
                        dialog.hide();
                        return;
                    }

                    var pathParts = window.location.pathname.split('/');
                    var productId = pathParts[3];
                    var version = pathParts[4];

                    if (!productId || !version) {
                        showMessage(dialog, 'error', 'Unable to determine product and version from URL');
                        dialog.hide();
                        return;
                    }

                    dialog.setState(CKEDITOR.DIALOG_STATE_BUSY);
                    nameSelect.clear();
                    valueContainer.getElement().setHtml('');
                    nameSelect.add('Loading...', '');

                    showMessage(dialog, 'loading', 'Loading conditions...');

                    // Store existing conditions if any
                    if (startElementimg) {
                        var existingName = startElementimg.getAttribute('data-condition-name');
                        var existingValues = startElementimg.getAttribute('data-condition-value');
                        dialog.existingValues = existingValues ? existingValues.split(',').map(v => v.trim()) : [];
                    }

                    const baseUrl = window.location.origin === 'http://localhost:4200' ?
                        'https://staging.docs.microfocus.com' : window.location.origin;

                    // Chain of API calls
                    fetch(`${baseUrl}/docops-portal/api/v1/AZProductAdmin/getprodversiondetails`)
                        .then(response => {
                            if (!response.ok) throw new Error('Failed to fetch product details');
                            return response.json();
                        })
                        .then(data => {
                            showMessage(dialog, 'info', 'Fetching product conditions...');
                            const product = data.AZProductAdmin.productInfo.products.find(p => p.prod_id === productId);
                            if (!product) throw new Error('Product not found');

                            const versionData = product.versions.find(v => v.version === version);
                            if (!versionData) throw new Error('Version not found');

                            return fetch(`${baseUrl}/docops-portal/api/v1/Snippet/getconditions/${productId}/${versionData.version_id}`);
                        })
                        .then(response => {
                            if (!response.ok) throw new Error('Failed to fetch conditions');
                            return response.json();
                        })
                        .then(data => {
                            dialog.conditions = data.GitSync.data;
                            nameSelect.clear();

                            if (!data.GitSync.data || data.GitSync.data.length === 0) {
                                nameSelect.add('No conditions available', '');
                                dialog.disableButton('ok');
                                showMessage(dialog, 'warning', 'No conditions available for this product/version');
                                return;
                            }

                            data.GitSync.data.forEach(condition => {
                                nameSelect.add(condition.name, condition.name);
                            });

                            if (dialog.existingValues && startElementimg.getAttribute('data-condition-name')) {
                                nameSelect.setValue(startElementimg.getAttribute('data-condition-name'));
                            }

                            nameSelect.onChange();

                            setTimeout(() => {
                                if (dialog.existingValues) {
                                    dialog.existingValues.forEach(value => {
                                        var checkbox = dialog.getContentElement('tab1', 'conditionValues')
                                            .getElement().findOne(`input[value="${value}"]`);
                                        if (checkbox) {
                                            checkbox.$.checked = true;
                                        }
                                    });
                                }
                            }, 100);

                            dialog.enableButton('ok');
                            dialog.setState(CKEDITOR.DIALOG_STATE_IDLE);
                            showMessage(dialog, 'success', 'Conditions loaded successfully');
                        })
                        .catch(error => {
                            console.error('Error in condition dialog:', error);
                            nameSelect.clear();
                            valueContainer.getElement().setHtml('');
                            nameSelect.add('Error loading conditions', '');
                            dialog.setState(CKEDITOR.DIALOG_STATE_IDLE);
                            dialog.disableButton('ok');
                            showMessage(dialog, 'error', 'Error loading conditions: ' + error.message);
                        });
                },

                onOk: async function () {
                    try {
                        var dialog = this;
                        var editor = dialog.getParentEditor();
                        var conditionName = dialog.getValueOf('tab1', 'conditionName');

                        // Get selected values from checkboxes
                        var checkboxes = dialog.getContentElement('tab1', 'conditionValues')
                            .getElement().find('input[type="checkbox"]').$;
                        var selectedValues = Array.from(checkboxes)
                            .filter(cb => cb.checked)
                            .map(cb => cb.value);

                        if (!conditionName || selectedValues.length === 0) {
                            showMessage(dialog, 'warning', 'Please select condition name and at least one value');
                            return false;
                        }

                        showMessage(dialog, 'loading', 'Applying conditions...');

                        var conditionValue = selectedValues.join(',');
                        var selection = editor.getSelection();
                        var ranges = selection.getRanges();

                        if (ranges.length > 0) {
                            var range = ranges[0];
                            var startElement = getNearestElement(ranges[0].startContainer);
                            var endElement = getNearestElement(ranges[ranges.length - 1].endContainer);
                            await applyConditionAttributes(range, startElement, endElement, conditionName, conditionValue);
                            editor.fire('saveSnapshot');
                            showMessage(dialog, 'success', 'Conditions applied successfully');
                        }

                        dialog.hide();
                    } catch (error) {
                        showMessage(dialog, 'error', 'Unable to apply condition. Please try again.');
                    }
                }
            };
        });

        // Add the command
        editor.addCommand('applyCondition', new CKEDITOR.dialogCommand('applyConditionDialog'));

        // Add the toolbar button
        editor.ui.addButton('ApplyCondition', {
            label: 'Apply Condition',
            command: 'applyCondition',
            toolbar: 'insert,2'
        });

        function applyConditionAttributes(range, startElement, endElement, conditionName, conditionValue) {
            var elements = [];
            var walker = new CKEDITOR.dom.walker(range);
            var node = range.startContainer;

            // Get the topmost selected element
            while (node && node.type !== CKEDITOR.NODE_ELEMENT) {
                node = node.getParent();
            }

            do {
                if (node.type === CKEDITOR.NODE_ELEMENT) {
                    let shouldAdd = true;
                    for (let i = 0; i < elements.length; i++) {
                        if (elements[i].contains(node)) {
                            shouldAdd = false;
                            break;
                        }
                    }

                    if (shouldAdd) {
                        elements = elements.filter(elem => !node.contains(elem));
                        elements.push(node);
                    }
                }
                node = walker.next();
            } while (node && !node.equals(endElement));

            if (endElement && endElement.type === CKEDITOR.NODE_ELEMENT) {
                let shouldAddEnd = true;
                for (let elem of elements) {
                    if (elem.contains(endElement) || endElement.contains(elem)) {
                        shouldAddEnd = false;
                        break;
                    }
                }
                if (shouldAddEnd && !elements.includes(endElement)) {
                    elements.push(endElement);
                }
            }

            let hasImg = elements.some(element =>
                element.getName() === 'img' ||
                element.findOne('img')
            );

            if (hasImg) {
                elements.forEach(element => {
                    if (element.getName() === 'img') {
                        addConditionAttributes(element, conditionName, conditionValue);

                        let parentFigure = element.getAscendant('figure');
                        if (parentFigure) {
                            addConditionAttributes(parentFigure, conditionName, conditionValue);
                            let figcaption = parentFigure.findOne('figcaption');
                            if (figcaption) {
                                addConditionAttributes(figcaption, conditionName, conditionValue);
                            }
                        }
                    }

                    else if (element.getName() === 'figure') {
                        addConditionAttributes(element, conditionName, conditionValue);

                        let img = element.findOne('img');
                        let figcaption = element.findOne('figcaption');

                        if (img) {
                            addConditionAttributes(img, conditionName, conditionValue);
                        }
                        if (figcaption) {
                            addConditionAttributes(figcaption, conditionName, conditionValue);
                        }
                    }
                    else if (element.type === CKEDITOR.NODE_ELEMENT) {
                        addConditionAttributes(element, conditionName, conditionValue);
                    }
                });
            } else {
                //remove duplicates ckeditor selection can be wrong
                elements = elements.filter((element, index, self) =>
                    index === self.findIndex((t) => t.getName() === element.getName())
                );

                elements.forEach(element => {
                    if (element.type === CKEDITOR.NODE_ELEMENT) {
                        addConditionAttributes(element, conditionName, conditionValue);
                    }
                });
            }
        }

        function getNearestElement(node) {
            try {
                while (node && node.type !== CKEDITOR.NODE_ELEMENT) {
                    node = node.getParent();
                }
                return node;
            } catch (error) {
                console.error("Error in getNearestElement:", error);
                alert("Unable to apply condition. Kindly retry.");
                return null;
            }
        }

        function checkIfPartOfSnippet(element) {
            try {
                let returnElement = element;
                while (element) {
                    if (element.getName() == 'snippet') {
                        return element.getParent();
                    }
                    element = element.getParent();
                }
                return returnElement;
            } catch (error) {
                console.error("Error in getNearestElement:", error);
                alert("Unable to apply condition. Kindly retry.");
                return null;
            }
        }

        function addConditionAttributes(element, conditionName, conditionValue) {
            // Check if element has snippet attributes or variable attributes

            element = checkIfPartOfSnippet(element);
            const hasSnippetAttributes =
                element.hasAttribute('data-productid') &&
                element.hasAttribute('data-version');

            const hasConditionAttributes = element.hasAttribute('data-condition-name') &&
                element.hasAttribute('data-condition-value');

            if (hasSnippetAttributes || hasConditionAttributes) {
                //to the element check if it has any  parent with same data-condition-name and same data-condition-value
                let parent = element.getParent();
                let duplicate = false;
                while (parent && parent.hasAttribute('data-condition-name') && parent.hasAttribute('data-condition-value')) {
                    if (parent.getAttribute('data-condition-name') === conditionName && parent.getAttribute('data-condition-value') === conditionValue) {
                        duplicate = true;
                        break;
                    }
                    parent = parent.getParent();
                }

                if (duplicate) {
                    return;
                }

                // to that element add a div with data-condition-name and data-condition-value

                var wrapper = new CKEDITOR.dom.element('div');
                wrapper.setAttribute('data-condition-name', conditionName);
                wrapper.setAttribute('data-condition-value', conditionValue);
                element.insertBeforeMe(wrapper);
                wrapper.append(element);
            } else {
                // Apply attributes directly if no special handling needed
                element.setAttribute('data-condition-name', conditionName);
                element.setAttribute('data-condition-value', conditionValue);
            }
        }

        function showMessage(dialog, type, message) {
            var loaderElement = dialog.getElement().findOne('#conditionLoader');
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