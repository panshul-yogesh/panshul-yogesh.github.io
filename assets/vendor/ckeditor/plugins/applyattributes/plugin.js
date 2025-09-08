CKEDITOR.plugins.add('applyattributes', {
    icons: 'applyattributes',
    init: function (editor) {
        // Plugin state management
        const PluginState = {
            // Map of data-type to HTML tag mappings
            tagMappings: {
                'productname': 'span',
                'literal': 'code',
                'filename': 'code',
                'envar': 'code',
                'systemitem': 'code',
                'hostname': 'code',
                'option': 'code',
                'varname': 'code',
                'replaceable': 'em',
                'emphasis': 'em',
                'quote': 'em',
                'windowitem': 'strong',
                'guimenu': 'strong',
                'menuchoice': 'strong',
                'glossterm': 'strong',
                'citetitle': 'strong',
                'required': 'strong',
                'msgtext': 'strong'
            },
            attributeValues: {
                'data-type': [
                    'remark', 'productname', 'literal', 'filename', 'envar', 'systemitem',
                    'hostname', 'option', 'varname', 'replaceable', 'emphasis',
                    'quote', 'windowitem', 'guimenu', 'menuchoice', 'citetitle',
                    'glossterm', 'required', 'msgtext'
                ].sort(),
                // 'data-role': [
                //     'button', 'header', 'navigation', 'complementary', 'banner',
                //     'search', 'contentinfo', 'main', 'article', 'definition'
                // ].sort(),
                // 'data-format': [
                //     'text', 'number', 'date', 'currency', 'percentage',
                //     'email', 'phone', 'url', 'code', 'markdown'
                // ].sort()
            },
            currentAttributes: {},
            selectedElement: null,
            currentAttributeType: 'data-type',
            dialogInitialized: false,

            // Methods to manage state
            initialize(element) {
                this.selectedElement = element;
                this.currentAttributes = {};
                if (element) {
                    // Only initialize attributes that are part of our plugin
                    Object.keys(this.attributeValues).forEach(attr => {
                        if (element.getAttribute(attr)) {
                            const values = element.getAttribute(attr).split(',').filter(Boolean);
                            if (values.length > 0) {
                                this.currentAttributes[attr] = values;
                            }
                        }
                    });
                }
            },

            reset() {
                this.currentAttributes = {};
                this.selectedElement = null;
                this.currentAttributeType = 'data-type';
                this.dialogInitialized = false;
            },

            addValue(attributeName, value) {
                if (!this.isPluginAttribute(attributeName)) return;
                if (!this.currentAttributes[attributeName]) {
                    this.currentAttributes[attributeName] = [];
                }
                if (!this.currentAttributes[attributeName].includes(value)) {
                    this.currentAttributes[attributeName].push(value);
                    this.currentAttributes[attributeName].sort();
                }
            },

            removeValue(attributeName, value) {
                if (!this.isPluginAttribute(attributeName)) return;
                if (this.currentAttributes[attributeName]) {
                    this.currentAttributes[attributeName] = this.currentAttributes[attributeName].filter(v => v !== value);
                    if (this.currentAttributes[attributeName].length === 0) {
                        delete this.currentAttributes[attributeName];
                    }
                }
            },

            removeAttribute(attributeName) {
                if (!this.isPluginAttribute(attributeName)) return;
                delete this.currentAttributes[attributeName];
            },

            getAttributeValues(attributeName) {
                return this.currentAttributes[attributeName] || [];
            },

            hasAnyAttributes() {
                return Object.keys(this.currentAttributes).length > 0;
            },

            // Helper method to validate if an attribute is managed by this plugin
            isPluginAttribute(attributeName) {
                return Object.keys(this.attributeValues).includes(attributeName);
            },

            // Method to apply attributes to an element
            applyAttributesToElement(element, selection) {
                if (!element) return;

                const dataType = this.currentAttributes['data-type'] ? this.currentAttributes['data-type'][0] : null;
                let requiredTag = 'span'; // Default tag is span
                
                // If we have a data-type and it has a specific tag mapping, use that instead
                if (dataType && this.tagMappings[dataType]) {
                    requiredTag = this.tagMappings[dataType];
                }

                let targetElement = element;
                const elementTag = element.getName();

                // Only create a new element if:
                // 1. Current element is not already the required tag OR
                // 2. Current element has a different data-type
                const needsNewElement = elementTag !== requiredTag || 
                    (element.getAttribute('data-type') !== dataType && element.getParent().getName() !== requiredTag);

                if (needsNewElement) {
                    // Create new element with required tag
                    const newElement = editor.document.createElement(requiredTag);
                    
                    // Move the contents to the new element
                    newElement.setHtml(element.getHtml());
                    
                    // Apply attributes to the new element
                    Object.entries(this.currentAttributes).forEach(([attr, values]) => {
                        if (values && values.length > 0) {
                            newElement.setAttribute(attr, values.join(','));
                        }
                    });
                    
                    // Replace the old element with the new one
                    if (element.$.parentNode) {
                        element.$.parentNode.replaceChild(newElement.$, element.$);
                        targetElement = newElement;
                    }
                } else {
                    // Just update attributes on existing element
                    Object.entries(this.currentAttributes).forEach(([attr, values]) => {
                        if (values && values.length > 0) {
                            targetElement.setAttribute(attr, values.join(','));
                        } else {
                            targetElement.removeAttribute(attr);
                        }
                    });
                }

                return targetElement;
            }
        };

        // UI Component Factory
        const UIComponents = {
            createButton(text, onClick, className = '') {
                return `<button class="custom-button ${className}" 
                    style="padding: 6px 12px; border: 1px solid #dadce0; border-radius: 4px; 
                    background: white; cursor: pointer; font-family: 'Google Sans', sans-serif;
                    margin: 4px; transition: all 0.2s; font-size: 13px;"
                    onmouseover="this.style.backgroundColor='#f8f9fa'; this.style.borderColor='#1a73e8';"
                    onmouseout="this.style.backgroundColor='white'; this.style.borderColor='#dadce0';"
                    onclick="${onClick}">${text}</button>`;
            },

            createChip(text, onRemove) {
                return `<span class="attribute-chip" 
                    style="display: inline-flex; align-items: center; background: #e8f0fe; 
                    color: #1967d2; padding: 4px 12px; border-radius: 16px; margin: 4px; 
                    font-size: 13px; font-family: 'Google Sans', sans-serif; border: 1px solid #1967d2;">
                    ${text}
                    <span style="margin-left: 6px; cursor: pointer; color: #1967d2; font-weight: bold;" 
                        onclick="${onRemove}">×</span>
                    </span>`;
            },

            createAttributeSection(attr, values) {
                return `<div class="attribute-section" style="margin-bottom: 12px; padding: 12px; border: 1px solid #e8eaed; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="color: #202124; font-weight: 500;">${attr}</span>
                        <span style="color: #d93025; cursor: pointer;" 
                            onclick="window.removeEntireAttribute('${attr}')">[Remove]</span>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                        ${values.map(value => UIComponents.createChip(value, `window.removeAttributeValue('${attr}', '${value}')`)).join('')}
                    </div>
                </div>`;
            },

            createClearAllButton() {
                const button = document.createElement('button');
                button.textContent = 'Clear All Attributes';
                button.className = 'custom-button clear-all-btn';
                button.style.cssText = `
                    padding: 6px 12px;
                    border: 1px solid #d93025;
                    border-radius: 4px;
                    background: white;
                    color: #d93025;
                    cursor: pointer;
                    font-family: 'Google Sans', sans-serif;
                    margin: 12px;
                    transition: all 0.2s;
                    float: right;
                `;
                button.onmouseover = function () {
                    this.style.backgroundColor = '#fce8e6';
                };
                button.onmouseout = function () {
                    this.style.backgroundColor = 'white';
                };
                return button;
            }
        };

        // Add the toolbar button
        editor.ui.addButton('ApplyAttributes', {
            label: 'Manage Data Attributes',
            command: 'openApplyAttributesDialog',
            toolbar: 'insert'
        });

        // Command to check selection before opening dialog
        editor.addCommand('openApplyAttributesDialog', {
            exec: function (editor) {
                const selection = editor.getSelection();
                const text = selection && selection.getSelectedText();

                if (!selection || !text) {
                    alert('Please select some text before managing attributes.');
                    return false;
                }

                editor.openDialog('applyAttributesDialog');
            }
        });

        // Add the dialog
        CKEDITOR.dialog.add('applyAttributesDialog', function (editor) {
            return {
                title: 'Manage Data Attributes',
                minWidth: 500,
                minHeight: 400,
                contents: [{
                    id: 'tab1',
                    label: 'Data Attributes',
                    elements: [{
                        type: 'html',
                        html: `
                            <div id="attributesDialogContent" style="font-family: 'Google Sans', sans-serif;">
                                <!-- Selected Text Preview -->
                                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                                    <div style="font-weight: 500; color: #202124; margin-bottom: 8px;">Selected Text</div>
                                    <div id="selectedTextPreview" style="color: #5f6368; font-size: 14px; word-break: break-word;"></div>
                                </div>

                                <!-- Current Attributes -->
                                <div style="background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #dadce0; margin-bottom: 16px;">
                                    <div style="font-weight: 500; color: #202124; margin-bottom: 12px;">Current Attributes</div>
                                    <div id="currentAttributesDisplay" style="min-height: 40px;"></div>
                                </div>

                                <!-- Attribute Selector -->
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; font-weight: 500; color: #202124; margin-bottom: 8px;">
                                        Select Attribute Type
                                    </label>
                                    <select id="attributeTypeSelector" style="width: 100%; padding: 8px; border: 1px solid #dadce0; 
                                        border-radius: 4px; font-family: inherit; color: #202124;">
                                        ${Object.keys(PluginState.attributeValues).map(attr =>
                            `<option value="${attr}">${attr}</option>`
                        ).join('')}
                                    </select>
                                </div>

                                <!-- Value Management -->
                                <div style="margin-bottom: 16px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                        <div style="font-weight: 500; color: #202124;">Values</div>
                                        <div style="color: #5f6368; font-size: 13px;" id="valueCount"></div>
                                    </div>
                                    <div style="position: relative; margin-bottom: 12px;">
                                        <input type="text" id="valueSearchInput" 
                                            placeholder="Search values..." 
                                            style="width: 100%; padding: 8px 32px 8px 8px; border: 1px solid #dadce0; 
                                            border-radius: 4px; font-family: inherit;">
                                        <span style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); 
                                            color: #5f6368; cursor: pointer;" onclick="document.getElementById('valueSearchInput').value=''; 
                                            document.getElementById('valueSearchInput').dispatchEvent(new Event('input'));">×</span>
                                    </div>
                                    <div id="selectedValuesDisplay" style="margin-bottom: 12px; min-height: 40px; display: flex; flex-wrap: wrap; gap: 4px;display:none;"></div>
                                    <div id="availableValuesDisplay" 
                                        style="max-height: 200px; overflow-y: auto; border: 1px solid #dadce0; 
                                        border-radius: 4px; padding: 8px;">
                                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px;"></div>
                                    </div>
                                </div>
                            </div>`
                    }]
                }],
                onShow: function () {
                    const dialog = this;
                    const selection = editor.getSelection();
                    const element = selection.getStartElement();
                    const selectedText = selection.getSelectedText();

                    // Initialize state
                    PluginState.initialize(element);

                    // Remove any existing Clear All buttons first
                    const existingButtons = document.querySelectorAll('.clear-all-btn');
                    existingButtons.forEach(btn => btn.remove());

                    // Setup UI elements
                    const previewElement = document.getElementById('selectedTextPreview');
                    const attributeSelector = document.getElementById('attributeTypeSelector');
                    const searchInput = document.getElementById('valueSearchInput');
                    const valueCountDisplay = document.getElementById('valueCount');
                    const dialogContent = document.getElementById('attributesDialogContent');

                    // Show selected text
                    if (previewElement) {
                        previewElement.textContent = selectedText.length > 100 ?
                            selectedText.substring(0, 100) + '...' :
                            selectedText;
                    }

                    // Add Clear All button
                    if (dialogContent) {
                        const clearAllButton = UIComponents.createClearAllButton();
                        clearAllButton.onclick = function () {
                            if (confirm('Are you sure you want to remove all attributes?')) {
                                Object.keys(PluginState.attributeValues).forEach(attr => {
                                    PluginState.removeAttribute(attr);
                                });
                                updateSelectedValues();
                                updateAvailableValues();
                                updateCurrentAttributesDisplay();
                            }
                        };
                        dialogContent.appendChild(clearAllButton);
                    }

                    // Function to update current attributes display
                    function updateCurrentAttributesDisplay() {
                        const display = document.getElementById('currentAttributesDisplay');
                        if (!display) return;

                        if (PluginState.hasAnyAttributes()) {
                            display.innerHTML = Object.entries(PluginState.currentAttributes)
                                .map(([attr, values]) => UIComponents.createAttributeSection(attr, values))
                                .join('');
                        } else {
                            display.innerHTML = '<div style="color: #5f6368; font-style: italic;">No attributes applied</div>';
                        }
                    }

                    // Function to update available values display
                    function updateAvailableValues() {
                        const attributeName = attributeSelector.value;
                        const searchTerm = searchInput.value.toLowerCase();
                        const currentValues = PluginState.getAttributeValues(attributeName);
                        const availableValues = PluginState.attributeValues[attributeName]
                            .filter(value =>
                                !currentValues.includes(value) &&
                                value.toLowerCase().includes(searchTerm)
                            );

                        const display = document.getElementById('availableValuesDisplay').firstElementChild;
                        display.innerHTML = availableValues.map(value =>
                            UIComponents.createButton(value, `window.addAttributeValue('${value}')`)
                        ).join('');

                        // Update value count
                        valueCountDisplay.textContent = `${currentValues.length} selected / ${PluginState.attributeValues[attributeName].length} total`;
                    }

                    // Function to update selected values display
                    function updateSelectedValues() {
                        const attributeName = attributeSelector.value;
                        const currentValues = PluginState.getAttributeValues(attributeName);
                        const display = document.getElementById('selectedValuesDisplay');

                        if (currentValues.length) {
                            display.innerHTML = currentValues.map(value =>
                                UIComponents.createChip(value, `window.removeAttributeValue('${attributeName}', '${value}')`)
                            ).join('');
                        } else {
                            display.innerHTML = '<div style="color: #5f6368; font-style: italic;">No values selected</div>';
                        }
                    }

                    // Global functions for event handling
                    window.addAttributeValue = function (value) {
                        PluginState.addValue(attributeSelector.value, value);
                        updateSelectedValues();
                        updateAvailableValues();
                        updateCurrentAttributesDisplay();
                    };

                    window.removeAttributeValue = function (attributeName, value) {
                        PluginState.removeValue(attributeName, value);
                        if (attributeName === attributeSelector.value) {
                            updateSelectedValues();
                            updateAvailableValues();
                        }
                        updateCurrentAttributesDisplay();
                    };

                    window.removeEntireAttribute = function (attributeName) {
                        if (!PluginState.isPluginAttribute(attributeName)) return;
                        PluginState.removeAttribute(attributeName);
                        if (attributeName === attributeSelector.value) {
                            updateSelectedValues();
                            updateAvailableValues();
                        }
                        updateCurrentAttributesDisplay();
                    };

                    // Event listeners
                    attributeSelector.addEventListener('change', function () {
                        PluginState.currentAttributeType = this.value;
                        updateSelectedValues();
                        updateAvailableValues();
                    });

                    searchInput.addEventListener('input', updateAvailableValues);

                    // Initial render
                    updateCurrentAttributesDisplay();
                    updateSelectedValues();
                    updateAvailableValues();
                },
                onLoad: function () {
                    // Reset any previous state when dialog is loaded
                    PluginState.reset();
                },
                onHide: function () {
                    // Clean up when dialog is hidden
                    const existingButtons = document.querySelectorAll('.clear-all-btn');
                    existingButtons.forEach(btn => btn.remove());
                },
                onOk: function () {
                    const selection = editor.getSelection();
                    if (!selection) return false;

                    const ranges = selection.getRanges();
                    if (!ranges.length) return false;

                    editor.fire('saveSnapshot');

                    try {
                        ranges.forEach(range => {
                            if (range.collapsed) return;

                            // Get the selected text and its container
                            const container = range.startContainer;
                            let selectedElement;

                            // Handle text selection
                            if (container.type === CKEDITOR.NODE_TEXT) {
                                // Create a new element for text selection
                                const fragment = range.extractContents();
                                selectedElement = editor.document.createElement('span');
                                selectedElement.append(fragment);
                                range.insertNode(selectedElement);
                            } else {
                                // For element selection, get the closest element
                                selectedElement = container.type === CKEDITOR.NODE_ELEMENT ? 
                                    container : container.getParent();
                                
                                // If selection is partial, create a new wrapper
                                if (range.startOffset !== 0 || range.endOffset !== selectedElement.getLength()) {
                                    const fragment = range.extractContents();
                                    selectedElement = editor.document.createElement('span');
                                    selectedElement.append(fragment);
                                    range.insertNode(selectedElement);
                                }
                            }
                            
                            // Apply attributes to the selected element
                            const updatedElement = PluginState.applyAttributesToElement(selectedElement, selection);
                            
                            // If we have children, apply attributes to them as well
                            if (updatedElement) {
                                const children = updatedElement.getElementsByTag('*');
                                for (let i = 0; i < children.count(); i++) {
                                    const child = children.getItem(i);
                                    PluginState.applyAttributesToElement(child, selection);
                                }
                            }
                        });

                        editor.fire('saveSnapshot');
                    } catch (error) {
                        console.error('Error applying attributes:', error);
                        alert('An error occurred while applying attributes. Please try again.');
                        return false;
                    } finally {
                        // Reset plugin state
                        PluginState.reset();
                    }
                },
                onCancel: function () {
                    // Reset plugin state
                    PluginState.reset();
                }
            };
        });
    }
});    