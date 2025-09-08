CKEDITOR.plugins.add('addvariables', {
    icons: 'addvariables',  // Make sure to add an icon file named 'addvariables.png' in the icons folder
    init: function (editor) {
        // Add styles to the page head if not already added
        const styleId = 'add-variables-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
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

        // Add toolbar button
        editor.ui.addButton('AddVariables', {
            label: 'Insert Variable',
            command: 'openVariableSelector',
            toolbar: 'insert,0'
        });

        // Add the command that will open our dialog
        editor.addCommand('openVariableSelector', {
            exec: function (editor) {
                editor.openDialog('variableSelectorDialog');
            }
        });

        // Define the dialog
        CKEDITOR.dialog.add('variableSelectorDialog', function (editor) {
            return {
                title: 'Insert Variable',
                minWidth: 400,
                minHeight: 200,
                contents: [{
                    id: 'tab1',
                    elements: [
                        {
                            type: 'html',
                            html: `
                                <div style="padding: 10px 0;">
                                    <div class="custom-searchable-dropdown" id="propertyDropdown">
                                        <label class="custom-searchable-label">Select Variable</label>
                                        <div class="dropdown-container">
                                            <input type="text" class="custom-searchable-input" placeholder="Search and select variable...">
                                            <div class="custom-searchable-options"></div>
                                        </div>
                                    </div>
                                    <div id="namedPropertyLoader"></div>
                                </div>
                            `
                        }
                    ]
                }],
                onShow: function () {
                    const dialog = this;
                    dialog.selectedProperty = null;

                    // Clear property dropdown if exists
                    if (dialog.propertyDropdown) {
                        dialog.propertyDropdown.clear();
                    }

                    showMessage(dialog, 'info', 'Loading variables...');
                    loadCurrentProductVariables(dialog);
                },
                onOk: function () {
                    const dialog = this;
                    if (dialog.selectedProperty) {
                        insertNamedProperty(editor, dialog.selectedProperty);
                    } else {
                        alert('Please select a variable');
                        return false;
                    }
                }
            };
        });
    }
});

function initializeCustomDropdown(dialog, dropdownId, options, onSelect) {
    const container = dialog.getElement().findOne(`#${dropdownId}`);
    container.setStyle('display', 'block'); // Show the container when initializing
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

function loadCurrentProductVariables(dialog) {
    const baseUrl = window.location.origin === 'http://localhost:4200' ? 'https://staging.docs.microfocus.com' : window.location.origin;
    let currentUrl = window.location.pathname;
    let splitUrl = currentUrl.split('/');
    let currentproductid = '';
    let currentversion = '';
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

    showMessage(dialog, 'loading', 'Loading variables...');

    // First get product info to store for later use
    fetch(`${baseUrl}/docops-portal/api/v1/AZProductAdmin/getprodversiondetails`)
        .then(response => response.json())
        .then(data => {
            const products = data.AZProductAdmin.productInfo.products;
            const currentProduct = products.find(p => p.prod_id === currentproductid);

            if (!currentProduct) {
                showMessage(dialog, 'error', 'Current product not found.');
                return;
            }

            dialog.currentProduct = currentProduct;
            dialog.currentVersion = currentversion;
            const currentVersionInfo = currentProduct.versions.find(v => v.mwversion === currentversion);

            if (!currentVersionInfo) {
                showMessage(dialog, 'error', 'Current version not found.');
                return;
            }

            // Now fetch the named properties for this version
            return fetch(`${baseUrl}/docops-portal/api/v1/GitSync/getnamedvalue/${currentVersionInfo.version_id}`);
        })
        .then(response => response.json())
        .then(data => {
            if (data.GitSync.namedvalues && data.GitSync.namedvalues.length > 0) {
                updateNamedPropertiesDialog(dialog, data.GitSync.namedvalues);
            } else {
                showMessage(dialog, 'warning', 'No variables found for product:' + dialog.currentProduct.prod_id + ',version:' + currentversion);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage(dialog, 'error', 'Failed to load variables. Please try again.');
        });
}

function updateNamedPropertiesDialog(dialog, namedValues) {
    if (namedValues && namedValues.length > 0) {
        const options = namedValues.map(nv => ({
            text: nv.name,
            value: `${nv.value} - ${nv.name}`
        }));

        // Initialize property dropdown if not already initialized
        if (!dialog.propertyDropdown) {
            dialog.propertyDropdown = initializeCustomDropdown(
                dialog,
                'propertyDropdown',
                options,
                (value) => {
                    dialog.selectedProperty = value;
                }
            );
        } else {
            // Update existing dropdown options
            dialog.propertyDropdown = initializeCustomDropdown(
                dialog,
                'propertyDropdown',
                options,
                (value) => {
                    dialog.selectedProperty = value;
                }
            );
        }

        dialog.getElement().findOne('#propertyDropdown').setStyle('display', 'block');
        showMessage(dialog, 'success', 'Variables loaded successfully for product:' + dialog.currentProduct.prod_id + ',version:' + dialog.currentVersion);
    } else {
        dialog.getElement().findOne('#propertyDropdown').setStyle('display', 'none');
        showMessage(dialog, 'warning', 'No variables found for product:' + dialog.currentProduct.prod_id + ',version:' + dialog.currentVersion);
    }
}

function showMessage(dialog, type, message) {
    var loaderElement = dialog.getElement().findOne('#namedPropertyLoader');
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

function insertNamedProperty(editor, selectedName) {
    if (selectedName) {
        var dialog = editor._.storedDialogs.variableSelectorDialog;
        let currentproductid = dialog.currentProduct ? dialog.currentProduct.prod_id : '';
        let currentversion = dialog.currentVersion || '';

        if (!currentproductid || !currentversion) {
            showMessage(dialog, 'error', 'Could not determine current product and version.');
            return;
        }

        var element = editor.document.createElement('span');
        element.setAttribute('class', 'data-nv');
        element.setAttribute('data-nv', selectedName.split(' - ')[1]);
        element.setAttribute('data-nv-value', selectedName.split(' - ')[0]);
        element.setAttribute('data-replace-parent', 'false');
        element.setAttribute('data-productid', currentproductid);
        element.setAttribute('data-version', currentversion);
        element.setText(selectedName.split(' - ')[0]);

        //add a space before the span element
        editor.insertHtml('&nbsp;');
        editor.insertElement(element);
        //add a space after the span element
        editor.insertHtml('&nbsp;');

        // Move cursor to AFTER the span element
        var range = editor.createRange();
        range.moveToPosition(element.getNext(), CKEDITOR.POSITION_AFTER_START);
        editor.getSelection().selectRanges([range]);
    } else {
        alert('Please select a property from the dropdown.');
    }
}