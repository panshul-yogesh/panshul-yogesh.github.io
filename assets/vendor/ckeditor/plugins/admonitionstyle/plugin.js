CKEDITOR.plugins.add('admonitionstyle', {
  icons: "admonitionstyle",
  init: function (editor) {
    editor.addCommand('admonitionStyle', {
      exec: function (editor) {
        // Open a dialog box
        editor.openDialog('customstylesDialog');
      },
    });

    editor.ui.addButton('AdmonitionStyles', {
      label: 'Admonition',
      command: 'admonitionStyle',
      toolbar: 'insert,8',
      icon: 'admonitionstyle',
    });

    CKEDITOR.dialog.add('customstylesDialog', function (editor) {
      return {
        title: 'Select Admonition',
        minWidth: 400,
        minHeight: 50,
        fontSize: 24,
        contents: [
          {
            id: 'content',
            elements: [
              {
                type: 'html',
                html: '<div style="display: flex; flex-direction: column; margin-bottom: 10px;">' +
                  '<label for="admonitionNote"><input type="radio" id="admonitionNote" name="admonitionStyle" value="admonition-note" checked> Note</label>' +
                  '<label for="admonitionImportant"><input type="radio" id="admonitionImportant" name="admonitionStyle" value="admonition-important"> Important</label>' +
                  '<label for="admonitionCaution"><input type="radio" id="admonitionCaution" name="admonitionStyle" value="admonition-caution"> Caution</label>' +
                  '<label for="admonitionTip"><input type="radio" id="admonitionTip" name="admonitionStyle" value="admonition-tip"> Tip</label>' +
                  '<label for="admonitionDeprecated"><input type="radio" id="admonitionDeprecated" name="admonitionStyle" value="admonition-deprecated"> Deprecated</label>' +
                  '<label for="admonitionRecommendation"><input type="radio" id="admonitionRecommendation" name="admonitionStyle" value="admonition-recommendation"> Recommendation</label>' +
                  '<label for="admonitionInternal"><input type="radio" id="admonitionInternal" name="admonitionStyle" value="admonition-internal"> Internal</label>' +
                  '<label for="admonitionExample"><input type="radio" id="admonitionExample" name="admonitionStyle" value="admonition-example"> Example</label>' +
                  '<label for="admonitionnolabel"><input type="radio" id="admonitionnolabel" name="admonitionStyle" value="admonition-nolabel"> No label</label>' +
                  '</div>',
              },
            ],
          },
        ],

        onShow: function () {

          var titleElement = this.getElement().findOne('.cke_dialog_title');

          if (!titleElement.hasAttribute('data-modified')) {
            var wrapper = CKEDITOR.dom.element.createFromHtml('<div style="display: flex; align-items: center;"></div>');
            var titleText = CKEDITOR.dom.element.createFromHtml('<span>' + titleElement.getHtml() + '</span>');

            var helpIcon = CKEDITOR.dom.element.createFromHtml(
              '<a href="https://staging.docs.microfocus.com/doc/portal/101/editoractions#Insert_admonition" target="_blank" style="display: flex; align-items: center; margin-left: 10px;" aria-label="Help: Insert admonition">' +
              '<svg style="height:14px !important;width:14px !important" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#000000" alt="Insert admonition">' +
              '<path d="M480-240q20 0 34-14t14-34q0-20-14-34t-34-14q-20 0-34 14t-14 34q0 20 14 34t34 14Zm-36-153h73q0-37 6.5-52.5T555-485q35-34 48.5-58t13.5-53q0-55-37.5-89.5T484-720q-51 0-88.5 27T343-620l65 27q9-28 28.5-43.5T482-652q28 0 46 16t18 42q0 23-15.5 41T496-518q-35 32-43.5 52.5T444-393Zm36 297q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480q0-80 30-149.5t82.5-122Q261-804 331-834t149-30q80 0 149.5 30t122 82.5Q804-699 834-629.5T864-480q0 79-30 149t-82.5 122.5Q699-156 629.5-126T480-96Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"/>' +
              '</svg>' +
              '</a>'
            );

            titleElement.setHtml('');
            wrapper.append(titleText);
            wrapper.append(helpIcon);
            titleElement.append(wrapper);
            titleElement.setAttribute('data-modified', 'true');
          }

          // Reset the radio button to "Admonition Note" on dialog open
          var admonitionNoteRadio = document.getElementById('admonitionNote');
          if (admonitionNoteRadio) {
            admonitionNoteRadio.checked = true;
          }
        },

        onOk: function () {
          // Get the selected radio button value
          var selectedStyle = getSelectedRadioValue('admonitionStyle');

          // Get the selected text and element
          var selection = editor.getSelection();
          var selectedElement = selection.getStartElement();

          // Check if selection is inside an admonition
          var isInsideAdmonition = false;
          var parent = selectedElement;
          while (parent) {
            if (parent.hasClass) {
              var classes = parent.getAttribute('class');
              if (classes && classes.toLowerCase().indexOf('admonition') !== -1) {
                isInsideAdmonition = true;
                break;
              }
            }
            parent = parent.getParent();
          }

          // If already inside an admonition, show alert and return
          if (isInsideAdmonition) {
            alert('Cannot insert admonition inside another admonition.');
            return;
          }

          var selectedText = selection.getSelectedText();
          var iconClass = '';
          var contentClass = '';
          var contentText = selectedText ? selectedText : 'Enter admonition content here...';
          var heading = '';

          switch (selectedStyle) {
            case "admonition-note":
              iconClass = "admonition-note-icon"
              contentClass = "admonition-note-content";
              heading = 'Note';
              break;
            case "admonition-important":
              iconClass = "admonition-important-icon"
              contentClass = "admonition-important-content";
              heading = 'Important';
              break;
            case "admonition-caution":
              iconClass = "admonition-caution-icon"
              contentClass = "admonition-caution-content";
              heading = 'Caution';
              break;
            case "admonition-tip":
              iconClass = "admonition-tip-icon"
              contentClass = "admonition-tip-content";
              heading = 'Tip';
              break;
            case "admonition-deprecated":
              iconClass = "admonition-deprecated-icon"
              contentClass = "admonition-deprecated-content";
              heading = 'Deprecated';
              break;
            case "admonition-recommendation":
              iconClass = "admonition-recommendation-icon"
              contentClass = "admonition-recommendation-content";
              heading = 'Recommendation';
              break;
            case "admonition-internal":
              iconClass = "admonition-internal-icon"
              contentClass = "admonition-internal-content";
              heading = 'Internal';
              break;
            case "admonition-example":
              iconClass = "admonition-example-icon"
              contentClass = "admonition-example-content";
              heading = 'Example';
              break;
            case "admonition-nolabel":
              iconClass = "admonition-nolabel-icon"
              contentClass = "admonition-nolabel-content";
              heading = '';
              break;
            default:
              break;
          }

          // Apply your custom styles here
          //     var html =
          //       `<div class="admonition">
          //     <div class="admonition-content ${contentClass}">
          //         ${contentText}
          //     </div>
          // </div>`;

          var html =
            `<div data-admonition-type="${heading}" data-admonition-icon="${iconClass}" class="admonition ${contentClass}">
          <div>
            ${contentText}
          </div>
        </div>`;

          // Insert the styled content back into the editor
          editor.insertHtml(html);
        },
      };
    });

    function getSelectedRadioValue(name) {
      var radios = document.getElementsByName(name);
      for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
          return radios[i].value;
        }
      }
      // Return null or handle the case when no radio button is selected
      return null;
    }
  },
});
