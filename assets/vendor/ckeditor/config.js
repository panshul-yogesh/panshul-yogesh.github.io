/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function (config) {
	config.versionCheck = false;
	config.entities = false;
	config.entities_latin = false;
	config.entities_greek = false;
	config.entities_processNumerical = false;
	config.disableObjectResizing = false;
	config.disableNativeTableHandles = false;
	config.disableNativeSpellChecker = false;

	// Modern skin and responsive design
	config.skin = 'moono-lisa';
	config.toolbar = [
		{ name: 'view', items: ['Source', 'ShowBlocks'] },
		{ name: 'styles', items: ['Styles', 'CreateDiv', 'Bold', 'Italic', 'Strike', 'CopyFormatting', 'TextCase', 'RemoveFormat'] },
		{ name: 'paragraph', items: ['NumberedList', 'BulletedList', 'Indent', 'Outdent', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
		{ name: 'insert', items: ['CodeSnippet', 'Image', 'Table', 'SpecialChar', 'AdmonitionStyles', 'MiniToc'] },
		{ name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
		{ name: 'reuse', items: ['AddVariables', 'InsertSnippets', 'ApplyCondition', 'VariableManager', 'RemoveSnippets', 'RemoveCondition'] },
		{ name: 'utility', items: ['Find', 'Replace', 'SelectAll', 'Comment', 'ApplyAttributes'] },
		{ name: 'clipboard', items: ['Cut', 'Undo', 'Redo'] },
	];

	config.codeSnippet_languages = {
		abap: 'abap',
		actionscript: 'actionscript',
		apacheconf: 'apacheconf',
		applescript: 'applescript',
		aspnet: 'aspnet',
		bash: 'bash',
		basic: 'basic',
		c: 'c',
		coffeescript: 'coffeescript',
		cpp: 'cpp',
		csharp: 'csharp',
		css: 'css',
		d: 'd',
		dart: 'dart',
		diff: 'diff',
		docker: 'docker',
		erlang: 'erlang',
		fortran: 'fortran',
		fsharp: 'fsharp',
		git: 'git',
		go: 'go',
		groovy: 'groovy',
		haskell: 'haskell',
		markup: 'markup',
		http: 'http',
		ini: 'ini',
		java: 'java',
		javascript: 'javascript',
		json: 'json',
		lua: 'lua',
		makefile: 'makefile',
		markdown: 'markdown',
		matlab: 'matlab',
		nginx: 'nginx',
		objectivec: 'objectivec',
		pascal: 'pascal',
		perl: 'perl',
		php: 'php',
		prolog: 'prolog',
		python: 'python',
		puppet: 'puppet',
		r: 'r',
		ruby: 'ruby',
		rust: 'rust',
		sas: 'sas',
		scala: 'scala',
		scheme: 'scheme',
		sql: 'sql',
		swift: 'swift',
		twig: 'twig',
		typescript: 'typescript',
		vim: 'vim',
		yaml: 'yaml'
	};
	config.codeSnippet_theme = 'vs';
	config.removePlugins = 'image,imagebrowser,simage,maximize,wsc,scayt,elementspath,resize,colorbutton,videodetector,imageupload,imageresize,imageresizerowandcolumn,reusetransclusion,applytransclusion,mathjax,flash,save,newpage,exportpdf,preview,print,templates,' +
		'pastefromgdocs,pastefromword,forms,pagebreak,smiley,font,language,about,' +
		'colorbutton,colordialog,image,pastefromlibreoffice,horizontalrule,shortcuthints';

	config.removeButtons = 'Underline,Subscript,Superscript,Format,Paste,PasteText,PasteFromWord';
	config.extraPlugins = 'liststyle,find,textselection,panelbutton,admonitionstyle,codesnippet,image2,dynamiccss,namedproperties,addvariables,insertsnippets,applycondition,variablemanager,removecondition,removesnippets,minitoc,comment,applyattributes,showblocks,blockquote,codewrapper,codemirror,admonitionclipboard,specialchar,textcase';
	config.format_tags = 'p;h1;h2;h3;h4;h5;h6;pre;address;div';
	// Simplify the dialog windows.
	config.removeDialogTabs = 'image:advanced;link:advanced';
	config.height = '35vh';
	config.basicEntities = true;
	config.entities = true; //Enables to add html entities
	config.htmlEncodeOutput = true;
	config.entities_additional = '';
	config.scayt_autoStartup = true;
	config.forceSimpleAmpersand = true;
	config.allowedContent = true; //Custom tags
	config.extraAllowedContent = 'section noinclude includeonly onlyinclude nowiki snippet[*](*){*} snippet > *';
	config.enterMode = CKEDITOR.ENTER_DIV;
	config.shiftEnterMode = CKEDITOR.ENTER_BR;
	config.autoParagraph = false;
	config.scayt_autoStartup = false;
	config.ignoreEmptyParagraph = true;
	config.fillEmptyBlocks = false;
	config.disableNativeSpellChecker = true;
	config.image2_disableResizer = false;
	config.image_previewText = ' '; // Removes the sample text in the preview area
	config.image2_defaultLockRatio = true;
	config.image2_altRequired = true;
	config.removeFormatAttributes = 'class,style,lang,width,height,align,hspace,valign,data-gnv,data-gnv-value,data-pnv,data-pnv-value,data-nv,data-nv-value,data-productid,data-version,data-description,data-content,data-replace-parent,content';
	config.stylesSet = [
		/* Block Styles */
		{ name: 'Div', element: 'div' },
		{ name: 'Span', element: 'span' },
		{ name: 'Paragraph', element: 'p' },
		// { name: 'Heading 1', element: 'h1' },
		{ name: 'Display Title', element: 'h1', attributes: { 'class': 'displaytitle' } },
		{ name: 'Heading 2', element: 'h2' },
		{ name: 'Heading 3', element: 'h3' },
		{ name: 'Heading 4', element: 'h4' },
		{ name: 'Heading 5', element: 'h5' },
		{ name: 'Heading 6', element: 'h6' },
		{ name: 'Preformatted Text', element: 'pre' },

		/* Widget Styles */
		{ name: 'Computer Code', element: 'code' },
		// { name: 'Marker', element: 'span', attributes: { 'class': 'marker' } },
		// { name: 'Big', element: 'big' },
		// { name: 'Small', element: 'small' },
		// { name: 'Keyboard Phrase', element: 'kbd' },
		// { name: 'Sample Text', element: 'samp' },
		// { name: 'Language: RTL', element: 'span', attributes: { 'dir': 'rtl' } },
		// { name: 'Language: LTR', element: 'span', attributes: { 'dir': 'ltr' } },

		/* Text Alignment */
		// {
		// 	name: 'Centered Text',
		// 	element: 'p',
		// 	attributes: { 'class': 'text-center' }
		// },
		// {
		// 	name: 'Right-aligned Text',
		// 	element: 'p',
		// 	attributes: { 'class': 'text-right' }
		// },

		/* Document Structure */
		// { name: 'Article', element: 'article' },
		// { name: 'Section', element: 'section' },
		// { name: 'Aside', element: 'aside' },
		// { name: 'Header', element: 'header' },
		// { name: 'Footer', element: 'footer' },

		/* Text Decoration */
		// { name: 'Typewriter', element: 'tt' },
		// { name: 'Strike Through', element: 's' }	,
		// { name: 'Underline', element: 'u' }
	];

	// Add keyboard shortcuts
	config.keystrokes = [
		[CKEDITOR.CTRL + 66 /*B*/, 'bold'],
		[CKEDITOR.CTRL + 73 /*I*/, 'italic'],
		[CKEDITOR.CTRL + 85 /*U*/, 'underline'],
		[CKEDITOR.CTRL + CKEDITOR.ALT + 83 /*S*/, 'strike'],
		[CKEDITOR.CTRL + 75 /*K*/, 'link'],
		[CKEDITOR.CTRL + 90 /*Z*/, 'undo'],
		[CKEDITOR.CTRL + 89 /*Y*/, 'redo'],
		[CKEDITOR.CTRL + 70 /*F*/, 'find'],
		[CKEDITOR.CTRL + CKEDITOR.ALT + 75 /*K*/, 'image'],
		[CKEDITOR.CTRL + CKEDITOR.ALT + 76 /*L*/, 'bulletedlist'],
		[CKEDITOR.CTRL + CKEDITOR.ALT + 78 /*N*/, 'numberedlist'],
		[CKEDITOR.CTRL + CKEDITOR.ALT + 84 /*T*/, 'table'],
		[CKEDITOR.CTRL + CKEDITOR.ALT + 82 /*R*/, 'removeFormat'],
		[CKEDITOR.CTRL + CKEDITOR.ALT + 188 /*,*/, 'subscript'],
		[CKEDITOR.CTRL + CKEDITOR.ALT + 190 /*.*/, 'superscript'],
		[CKEDITOR.CTRL + CKEDITOR.ALT + 85 /*U*/, 'unlink'],
		[CKEDITOR.CTRL + CKEDITOR.ALT + 81 /*Q*/, 'source'],
		[CKEDITOR.CTRL + CKEDITOR.ALT + 88 /*X*/, 'codewrapper'],
		[CKEDITOR.CTRL + CKEDITOR.ALT + 89 /*Y*/, 'admonitionStyle'],
		[CKEDITOR.CTRL + CKEDITOR.ALT + 71 /*G*/, 'toggleDynamicCSS'],
		[CKEDITOR.CTRL + CKEDITOR.ALT + 77 /*M*/, 'insertMiniToc'],
		[CKEDITOR.CTRL + CKEDITOR.ALT + 67 /*C*/, 'textcase']
	];

	CKEDITOR.on('instanceReady', function (ev) {
		var editor = ev.editor;

		var lastEnterTime = 0;
		// Add handler for double Enter to break out of containers
		editor.on('key', function (evt) {
			if (evt.data.keyCode === 13) { // Enter key
				var currentTime = new Date().getTime();
				var timeDiff = currentTime - lastEnterTime;

				// Check if this is a double Enter (within 500ms)
				if (timeDiff < 500) {
					var selection = editor.getSelection();
					var startElement = selection.getStartElement();

					// Handle breaking out of different containers
					var container = startElement.getAscendant(function (element) {
						// Add any container types you want to handle
						return element.is('li') || element.is('p') || element.is('div');
					}, true);

					if (container) {
						var parentElement = container.getParent();

						// Special handling for list items
						if (container.is('li')) {
							parentElement = parentElement.getParent(); // Get parent of the UL/OL
						}

						evt.cancel(); // Prevent default enter behavior

						// Create a new paragraph after the parent container
						var newElement = editor.document.createElement('p');
						newElement.append(editor.document.createElement('br'));
						newElement.insertAfter(parentElement);

						// Move cursor to the new element
						var range = editor.createRange();
						range.moveToPosition(newElement, CKEDITOR.POSITION_AFTER_START);
						editor.getSelection().selectRanges([range]);

						// Clear the last enter time to prevent triple-enter issues
						lastEnterTime = 0;
					}
				} else {
					lastEnterTime = currentTime;
				}
			}
		});

		// Add handler for Enter key to handle admonition divs
		editor.on('key', function (evt) {
			if (evt.data.keyCode === 13 && !evt.data.shiftKey) { // Enter key without Shift
				var selection = editor.getSelection();
				var startElement = selection.getStartElement();

				// Check if cursor is inside an admonition
				var admonitionParent = startElement.getAscendant(function (element) {
					return element.hasClass && element.hasClass('admonition');
				}, true);

				if (admonitionParent) {
					// Check if we're inside a list item
					var listItemParent = startElement.getAscendant('li', true);

					if (listItemParent) {
						// If we're in an empty list item
						if (!listItemParent.getFirst().getText().trim()) {
							evt.cancel();

							// Get the parent list
							var listParent = listItemParent.getParent();

							// If this is the only empty item in the list
							if (listParent.getChildCount() === 1) {
								// Remove the list and create a new paragraph inside admonition
								listParent.remove();
								var newParagraph = editor.document.createElement('p');
								newParagraph.append(editor.document.createElement('br'));
								newParagraph.appendTo(admonitionParent);

								// Move cursor to the new paragraph
								var range = editor.createRange();
								range.moveToPosition(newParagraph, CKEDITOR.POSITION_AFTER_START);
								editor.getSelection().selectRanges([range]);
							}
							// Otherwise let the default list behavior handle it
						}
						// If list item has content, let default behavior handle it
						return;
					}

					// If not in a list, handle as before
					evt.cancel();
					var newParagraph = editor.document.createElement('p');
					newParagraph.append(editor.document.createElement('br'));
					newParagraph.insertAfter(admonitionParent);

					var range = editor.createRange();
					range.moveToPosition(newParagraph, CKEDITOR.POSITION_AFTER_START);
					editor.getSelection().selectRanges([range]);
				}
			}
		});

		editor.on('key', function (event) {
			var kc = event.data.keyCode,
				csa = ~(CKEDITOR.CTRL | CKEDITOR.SHIFT | CKEDITOR.ALT),
				element;
			if (kc == 13 && (kc & csa) == 13) { //enter
				setTimeout(function () {
					element = editor.getSelection().getStartElement();
					while (element.$.attributes.length > 0) {
						let attributeName = element.$.attributes[0].name;
						if (attributeName) {
							element.removeAttribute(attributeName);
						}
					}

				}, 400);
			}
		});

		// Add special handling for Enter key near snippet elements
		editor.on('key', function (evt) {
			// Check if Enter key was pressed
			if (evt.data.keyCode === 13) {
				var selection = editor.getSelection();
				var startElement = selection.getStartElement();

				// Check if cursor is right after a snippet
				var previousElement = startElement.getPrevious ? startElement.getPrevious() : null;
				if (previousElement && previousElement.getName() === 'snippet') {
					// Create a new paragraph to ensure proper spacing
					evt.cancel(); // Prevent default enter behavior
					var newParagraph = editor.document.createElement('p');
					newParagraph.append(editor.document.createElement('br'));
					newParagraph.insertAfter(previousElement);

					// Move cursor to the new paragraph
					var range = editor.createRange();
					range.moveToPosition(newParagraph, CKEDITOR.POSITION_AFTER_START);
					editor.getSelection().selectRanges([range]);
				}

				// Check if cursor is inside a snippet (should not be editable)
				var snippetParent = startElement.getAscendant('snippet', true);
				if (snippetParent) {
					evt.cancel(); // Prevent editing inside snippet
					// Move cursor after the snippet
					var range = editor.createRange();
					range.moveToPosition(snippetParent, CKEDITOR.POSITION_AFTER_END);
					editor.getSelection().selectRanges([range]);
				}
			} else {
				var selection = editor.getSelection();
				var startElement = selection.getStartElement();

				//check all parent

				while (startElement.getParent()) {
					startElement = startElement.getParent();
					if (startElement.getName() === 'snippet') {
						evt.cancel(); // Prevent editing inside snippet
						// Move cursor after the snippet
						var range = editor.createRange();
						range.moveToPosition(startElement, CKEDITOR.POSITION_AFTER_END);
						editor.getSelection().selectRanges([range]);
					}
				}
			}
		});
	});

	// Add a filter to protect snippet contents from editing
	CKEDITOR.on('instanceReady', function (ev) {
		var editor = ev.editor;

		// Add double-click event listener after editor content DOM is ready
		editor.on('contentDom', function () {
			editor.editable().on('dblclick', function (evt) {
				var selection = editor.getSelection();
				var startElement = selection.getStartElement();

				// Check the clicked element and its parents for snippet
				var element = startElement;
				while (element) {
					if (element.getName && element.getName() === 'snippet') {
						//send attributes of the snippet
						editor.fire('snippetDoubleClicked', {
							attributes: element.getAttributes()
						});
						break;
					}
					element = element.getParent();
				}
			});
		});

		// Add a filter to make snippets' inner content read-only
		editor.filter.addTransformations([
			[
				{
					element: 'snippet',
					right: function (element) {
						// Make the snippet itself selectable but not its content
						element.attributes['data-cke-snippet-protected'] = 'true';
					}
				}
			]
		]);

		// Make snippet act as a block element where appropriate
		editor.filter.addElementCallback(function (element) {
			if (element.name === 'snippet' &&
				element.hasClass('sectiononly-lst-block')) {
				return CKEDITOR.FILTER_SKIP_TREE; // Skip content filtering inside the snippet
			}
		});
	});

	CKEDITOR.on('instanceReady', function (ev) {
		const editor = ev.editor;

		// Wait for the toolbar to be fully rendered
		setTimeout(function () {
			const editorContainer = editor.container.$;
			const toolbarElement = editorContainer.querySelector('.cke_top');

			if (toolbarElement) {
				const groupLabels = {
					'view': 'View',
					'styles': 'Styles',
					'paragraph': 'Paragraph',
					'insert': 'Insert',
					'links': 'Links',
					'reuse': 'Reuse',
					'utility': 'Utility',
					'clipboard': 'Clipboard'
				};

				const toolGroups = toolbarElement.querySelectorAll('.cke_toolgroup');

				toolGroups.forEach((groupElement, index) => {
					const toolbarRow = groupElement.closest('.cke_toolbar');
					if (!toolbarRow) return;

					let groupName = toolbarRow.getAttribute('aria-label') || '';
					groupName = groupName.toLowerCase().split(' ')[0];

					// Get the first button in the group to determine its name
					const firstButton = groupElement.querySelector('.cke_button');
					if (firstButton) {
						const buttonClass = firstButton.className;
						const buttonMatch = buttonClass.match(/cke_button__([a-z]+)/);

						if (buttonMatch) {
							const buttonName = buttonMatch[1];
							// Map button to its group based on toolbar config
							if (['source', 'showblocks'].includes(buttonName)) {
								groupName = 'view';
							} else if (['styles', 'creatediv', 'bold', 'italic', 'strike', 'copyformatting', 'textcase', 'removeformat'].includes(buttonName)) {
								groupName = 'styles';
							} else if (['numberedlist', 'bulletedlist', 'indent', 'outdent', 'justifyleft', 'justifycenter', 'justifyright', 'justifyblock', 'bidiltr', 'bidirtl'].includes(buttonName)) {
								groupName = 'paragraph';
							} else if (['codesnippet', 'image', 'table', 'specialchar', 'admonitionstyles', 'minitoc'].includes(buttonName)) {
								groupName = 'insert';
							} else if (['link', 'unlink', 'anchor'].includes(buttonName)) {
								groupName = 'links';
							} else if (['addvariables', 'insertsnippets', 'applycondition', 'variablemanager', 'removesnippets', 'removecondition'].includes(buttonName)) {
								groupName = 'reuse';
							} else if (['find', 'replace', 'selectall', 'comment', 'applyattributes'].includes(buttonName)) {
								groupName = 'utility';
							} else if (['cut', 'paste', 'undo', 'redo'].includes(buttonName)) {
								groupName = 'clipboard';
							}
						}
					}

					const labelText = groupLabels[groupName] || `Group ${index + 1}`;

					// Create wrapper and label for each group
					if (!groupElement.querySelector('.cke_toolgroup_wrapper')) {
						const groupWrapper = document.createElement('div');
						groupWrapper.className = 'cke_toolgroup_wrapper';

						const buttonsWrapper = document.createElement('div');
						buttonsWrapper.className = 'cke_toolgroup_buttons';

						const label = document.createElement('div');
						label.className = 'cke_toolbar_group_label';
						label.textContent = labelText;

						// Move all existing buttons/combos into the wrapper
						const existingElements = Array.from(groupElement.children);
						existingElements.forEach(element => {
							if (element.classList.contains('cke_button') || element.classList.contains('cke_combo')) {
								buttonsWrapper.appendChild(element);
							}
						});

						// Add wrapper and label to the group
						groupWrapper.appendChild(buttonsWrapper);
						groupWrapper.appendChild(label);
						groupElement.appendChild(groupWrapper);
					}
				});

				const style = document.createElement('style');
				style.textContent = `
					/* Main toolbar container */
					.cke_top {
						display: flex !important;
						width: 100% !important;
						padding: 0 !important;
						min-height: 72px !important;
						background: #ffffff !important;
						border-bottom: 1px solid #e5e7eb !important;
						box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
					}

					.cke_toolbox {
						display: flex !important;
						width: 100% !important;
						gap: 1px !important;
						padding: 0 !important;
						// overflow-x: auto !important;
						scrollbar-width: thin !important;
					}

					/* Hide scrollbar but keep functionality */
					.cke_toolbox::-webkit-scrollbar {
						height: 4px !important;
					}

					.cke_toolbox::-webkit-scrollbar-track {
						background: #f3f4f6 !important;
					}

					.cke_toolbox::-webkit-scrollbar-thumb {
						background: #d1d5db !important;
						border-radius: 2px !important;
					}

					/* Tool group container */
					.cke_toolgroup {
						display: flex !important;
						flex-direction: column !important;
						padding: 0px !important;
						margin: 0 2px !important;
						min-width: fit-content !important;
						background: transparent !important;
						border: none !important;
						box-shadow: none !important;
					}

					.cke_toolgroup_wrapper {
						display: flex !important;
						flex-direction: column !important;
						align-items: center !important;
						gap: 4px !important;
					}

					/* Buttons wrapper */
					.cke_toolgroup_buttons {
						display: flex !important;
						flex-wrap: wrap !important;
						gap: 3px !important;
						justify-content: center !important;
						align-items: center !important;
						padding: 2px !important;
					}
					.cke_toolbar:after {
						content: "";
						display: block;
						border-right: 1px solid #d1d5db !important;
						height: 70% !important;
						margin: 10px 0px !important;
					}

					/* Button styling */
					.cke_button {
						display: flex !important;
						align-items: center !important;
						padding: 0px 2px !important;
						border-radius: 4px !important;
						background: transparent !important;
						border: 1px solid transparent !important;
						cursor: pointer !important;
						transition: all 0.2s ease !important;
						min-width: 24px !important;
						height: 24px !important;
					}

					.cke_button:hover {
						background: #f3f4f6 !important;
						border-color: #e5e7eb !important;
					}

					/* Group labels */
					.cke_toolbar_group_label {
						font-size: 11px !important;
						color: #6b7280 !important;
						font-weight: 500 !important;
						text-transform: none !important;
						text-align: center !important;
						white-space: nowrap !important;
						padding: 2px 4px !important;
						width: 100% !important;
					}

					.cke_button_on,
					.cke_button:active {
						background: #f3f4f6 !important;
						border-color: #d1d5db !important;
						box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05) !important;
					}

					/* Icon styling */
					.cke_button_icon {
						width: 16px !important;
						height: 16px !important;
						opacity: 0.75 !important;
						transition: opacity 0.2s ease !important;
					}

					.cke_button:hover .cke_button_icon {
						opacity: 1 !important;
					}

					/* Combo box styling */
					.cke_combo {
						height: 24px !important;
						margin: 1px !important;
					}

					.cke_combo:after {
						display: none !important;
					}

					.cke_toolgroup a.cke_button:last-child:after {
						display: none !important;
					}

					.cke_combo_button {
						border-radius: 4px !important;
						background: transparent !important;
						border: 1px solid #e5e7eb !important;
						padding: 2px 6px !important;
						height: 24px !important;
						transition: all 0.2s ease !important;
					}

					.cke_combo_button:hover {
						background: #f3f4f6 !important;
						border-color: #d1d5db !important;
					}

					/* Responsive adjustments */
					@media screen and (max-width: 1200px) {
						.cke_toolgroup {
							padding: 3px !important;
						}

						.cke_button {
							padding: 3px 6px !important;
						}

						.cke_toolbar_group_label {
							font-size: 10px !important;
						}
					}

					@media screen and (max-width: 992px) {
						.cke_top {
							min-height: 64px !important;
						}

						.cke_toolgroup {
							padding: 2px !important;
						}

						.cke_button {
							padding: 2px 4px !important;
						}
					}

					/* Touch device optimizations */
					@media (hover: none) {
						.cke_button {
							padding: 6px 10px !important;
						}

						.cke_toolgroup {
							padding: 4px !important;
						}
					}
				`;
				document.head.appendChild(style);
			}
		}, 150);
	});


	// Add data filter to convert width/height attributes to styles
	CKEDITOR.on('instanceReady', function (ev) {
		var editor = ev.editor;

		editor.on('paste', function (evt) {
			setTimeout(function () {
				convertImageAttributesToStyles(editor);
			}, 100);
		});

		editor.on('dialogHide', function (evt) {
			if (evt.data.getName() === 'image2') {
				setTimeout(function () {
					convertImageAttributesToStyles(editor);
				}, 100);
			}
		});
	});

	// Helper function to convert attributes to styles in the editor content
	function convertImageAttributesToStyles(editor) {
		var images = editor.document.find('img');

		for (var i = 0; i < images.count(); i++) {
			var img = images.getItem(i);
			var modified = false;
			var currentStyle = img.getStyle('') || img.getAttribute('style') || '';

			// Handle width attribute
			var width = img.getAttribute('width');
			if (width) {
				// Remove existing width from style
				currentStyle = currentStyle.replace(/width\s*:\s*[^;]+;?/gi, '');

				// Add width to style
				if (currentStyle && !currentStyle.endsWith(';') && currentStyle !== '') {
					currentStyle += ';';
				}
				currentStyle += 'width:' + width + 'px;';

				img.removeAttribute('width');
				modified = true;
			}

			// Handle height attribute
			var height = img.getAttribute('height');
			if (height) {
				// Remove existing height from style
				currentStyle = currentStyle.replace(/height\s*:\s*[^;]+;?/gi, '');

				// Add height to style
				if (currentStyle && !currentStyle.endsWith(';') && currentStyle !== '') {
					currentStyle += ';';
				}
				currentStyle += 'height:' + height + 'px;';

				img.removeAttribute('height');
				modified = true;
			}

			// Apply the modified style
			if (modified) {
				// Clean up the style string
				currentStyle = currentStyle.replace(/;+/g, ';').replace(/^;|;$/g, '');
				if (currentStyle) {
					img.setAttribute('style', currentStyle);
				}
			}
		}
	}
};
