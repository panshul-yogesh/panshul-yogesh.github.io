CKEDITOR.plugins.add('namedproperties', {
    init: function (editor) {
        // if (editor.contextMenu) {
        //     editor.addMenuGroup('namedPropertiesGroup');
        //     editor.addMenuItem('namedPropertiesItem', {
        //         label: 'Insert version variable',
        //         command: 'insertNamedProperty',
        //         group: 'namedPropertiesGroup'
        //     });

        //     editor.contextMenu.addListener(function (element) {
        //         return { namedPropertiesItem: CKEDITOR.TRISTATE_OFF };
        //     });
        // }

        editor.addCommand('insertNamedProperty', {
            exec: function (editor) {
                editor.openDialog('namedPropertiesDialog');
            }
        });

        CKEDITOR.dialog.add('namedPropertiesDialog', function (editor) {
            return {
                title: 'Insert version variable',
                minWidth: 200,
                minHeight: 75,
                contents: [
                    {
                        id: 'tab1',
                        label: 'Select version variable',
                        elements: [

                            {
                                type: 'select',
                                id: 'propertyName',
                                label: 'Version variable',
                                items: [['', '']],
                                style: 'width: 100%;',
                                validate: CKEDITOR.dialog.validate.notEmpty("Property field cannot be empty.")
                            }, {
                                type: 'html',
                                html: '<div id="namedPropertyLoader" style="text-align: center; padding: 20px;">Loading version variables... <span class="spinner"></span></div>'
                            },
                        ]
                    }
                ],
                onShow: function () {
                    var dialog = this;
                    fetchNamedProperties(editor, dialog);
                },
                onOk: function () {
                    var dialog = this;
                    var selectedName = dialog.getValueOf('tab1', 'propertyName');
                    insertNamedProperty(editor, selectedName);
                }
            };
        });
    }
});

function fetchNamedProperties(editor, dialog) {
    var currentUrl = window.location.pathname;
    var prodId = currentUrl.split('/')[3];
    var mwversion = currentUrl.split('/')[4];

    const baseUrl = window.location.origin === 'http://localhost:4200' ? 'https://test.docs.microfocus.com' : window.location.origin;
    fetch(`${baseUrl}/docops-portal/api/v1/AZProductAdmin/getprodversiondetails`)
        .then(response => response.json())
        .then(data => {
            while (data.AZProductAdmin.productInfo.products.length === 0) {
                console.log('waiting for data');
            }
            var versionId = findVersionId(data, prodId, mwversion);
            if (versionId) {
                return fetch(`${baseUrl}/docops-portal/api/v1/GitSync/getnamedvalue/${versionId}`);
            } else {
                throw new Error('Unable to find matching version');
            }
        })
        .then(response => response.json())
        .then(data => {
            updateNamedPropertiesDialog(dialog, data.GitSync.namedvalues);
        })
        .catch(error => {
            console.error('Error:', error);
            showError(dialog, error.message);
        });
}

function findVersionId(data, prodId, mwversion) {
    var products = data.AZProductAdmin.productInfo.products;
    for (var i = 0; i < products.length; i++) {
        var versions = products[i].versions;
        for (var j = 0; j < versions.length; j++) {
            if (versions[j].prod_id === prodId && versions[j].mwversion === mwversion) {
                return versions[j].version_id;
            }
        }
    }
    return null;
}

function updateNamedPropertiesDialog(dialog, namedValues) {
    var select = dialog.getContentElement('tab1', 'propertyName');
    select.clear();
    namedValues.forEach(nv => select.add(nv.name, nv.value + ' - ' + nv.name));

    select.getElement().show();
    select.getElement().getParent().setStyle('display', 'block');

    var loaderElement = dialog.getElement().findOne('#namedPropertyLoader');
    if (loaderElement) {
        loaderElement.setStyle('display', 'none');
    }
}

function showError(dialog, message) {
    var loaderElement = dialog.getElement().findOne('#namedPropertyLoader');
    if (loaderElement) {
        loaderElement.setHtml('<div style="color: red;">' + message + '</div>');
    }
}

function insertNamedProperty(editor, selectedName) {
    if (selectedName) {
        var element = editor.document.createElement('span');
        element.setAttribute('class', 'data-nv');
        element.setAttribute('data-nv', selectedName.split(' - ')[1]);
        element.setAttribute('data-nv-value', selectedName.split(' - ')[0]);
        element.setAttribute('data-replace-parent', 'false');
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