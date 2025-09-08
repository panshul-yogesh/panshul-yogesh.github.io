CKEDITOR.plugins.add('codewrapper', {
    icons: 'codewrapper',
    init: function (editor) {
        editor.addCommand('wrapCode', {
            exec: function (editor) {
                var selection = editor.getSelection();
                var selectedText = selection.getSelectedText();
                if (selectedText.length == 0) {
                    alert("Please select a text to apply code styles.");
                    return;
                } else {
                    // Wrap the selected text with <code> tags
                    editor.insertHtml('<code>' + HtmlEncode(selectedText) + '</code>');
                }

            }
        });

        editor.ui.addButton('Codewrapper', {
            label: 'Computer code',
            command: 'wrapCode',
            toolbar: 'styles',
            icon: 'codewrapper'
        });
    }
});
function HtmlEncode(s) {
    var el = document.createElement("div");
    el.innerText = el.textContent = s;
    s = el.innerHTML;
    return s;
    // &;\'><"'
}
