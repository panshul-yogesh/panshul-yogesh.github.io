'use strict';

CKEDITOR.dialog.add('image2', function (editor) {
	var regexGetSizeOrEmpty = /(^\s*(\d+)(px)?\s*$)|^$/i,

		lockButtonId = CKEDITOR.tools.getNextId(),
		resetButtonId = CKEDITOR.tools.getNextId(),

		lang = editor.lang.image2,
		commonLang = editor.lang.common,

		lockResetStyle = 'margin-top:18px;width:40px;height:20px;',
		lockResetHtml = new CKEDITOR.template(
			'<div>' +
			'<a href="javascript:void(0)" tabindex="-1" title="' + lang.lockRatio + '" class="cke_btn_locked" id="{lockButtonId}" role="checkbox">' +
			'<span class="cke_icon"></span>' +
			'<span class="cke_label">' + lang.lockRatio + '</span>' +
			'</a>' +
			'</div>').output({
				lockButtonId: lockButtonId,
				resetButtonId: resetButtonId
			}),

		helpers = CKEDITOR.plugins.image2,

		config = editor.config,

		hasFileBrowser = !!(config.filebrowserImageBrowseUrl || config.filebrowserBrowseUrl),

		features = editor.widgets.registered.image.features,

		getNatural = helpers.getNatural,

		doc, widget, image, srcurl = '',

		preLoader,

		domWidth, domHeight,

		preLoadedWidth, preLoadedHeight, srcChanged,

		lockRatio, userDefinedLock,

		lockButton, resetButton, widthField, heightField,

		natural;

	function validateDimension() {
		var match = this.getValue().match(regexGetSizeOrEmpty),
			isValid = !!(match && parseInt(match[1], 10) !== 0);

		if (!isValid)
			alert(commonLang.invalidLength.replace('%1', commonLang[this.id]).replace('%2', 'px')); // jshint ignore:line

		return isValid;
	}

	function createPreLoader() {
		var image = doc.createElement('img'),
			listeners = [];

		function addListener(event, callback) {
			listeners.push(image.once(event, function (evt) {
				removeListeners();
				callback(evt);
			}));
		}

		function removeListeners() {
			var l;

			while ((l = listeners.pop()))
				l.removeListener();
		}

		return function (src, callback, scope) {
			addListener('load', function () {
				var dimensions = getNatural(image);

				callback.call(scope, image, dimensions.width, dimensions.height);
			});

			addListener('error', function () {
				callback(null);
			});

			addListener('abort', function () {
				callback(null);
			});

			var queryStringSeparator = src.indexOf('?') !== -1 ? '&' : '?';
			image.setAttribute('src',
				(config.baseHref || '') + src + queryStringSeparator + Math.random().toString(16).substring(2));
		};
	}

	function onChangeSrc() {
		srcurl = '';
		var value = this.getValue(),
			lockRatioValue = editor.config.image2_defaultLockRatio,
			isLockRatioSet = lockRatioValue !== undefined;
		toggleDimensions(false);

		if (value !== widget.data.src) {
			srcurl = value;
			var dialog = this.getDialog();
			updatePreview.call(dialog);

			preLoader(value, function (image, width, height) {
				toggleDimensions(true);

				if (!image)
					return toggleLockRatio((isLockRatioSet ? lockRatioValue : false));

				widthField.setValue(editor.config.image2_prefillDimensions === false ? 0 : width);
				heightField.setValue(editor.config.image2_prefillDimensions === false ? 0 : height);

				preLoadedWidth = domWidth = width;
				preLoadedHeight = domHeight = height;

				toggleLockRatio((isLockRatioSet ? lockRatioValue : helpers.checkHasNaturalRatio(image)));
			});

			srcChanged = true;
		}
		else if (srcChanged) {
			toggleDimensions(true);
			widthField.setValue(domWidth);
			heightField.setValue(domHeight);
			srcChanged = false;
		}
		else {
			toggleDimensions(true);
		}
	}

	function onChangeDimension() {
		if (!lockRatio)
			return;

		var value = this.getValue();

		if (!value)
			return;

		if (!value.match(regexGetSizeOrEmpty))
			toggleLockRatio(false);

		if (value === '0')
			return;

		var isWidth = this.id == 'width',
			width = domWidth || preLoadedWidth,
			height = domHeight || preLoadedHeight;

		if (isWidth)
			value = Math.round(height * (value / width));
		else
			value = Math.round(width * (value / height));

		if (!isNaN(value))
			(isWidth ? heightField : widthField).setValue(value);
	}

	function onLoadLockReset() {
		var dialog = this.getDialog();

		function setupMouseClasses(el) {
			el.on('mouseover', function () {
				this.addClass('cke_btn_over');
			}, el);

			el.on('mouseout', function () {
				this.removeClass('cke_btn_over');
			}, el);
		}

		lockButton = doc.getById(lockButtonId);

		if (lockButton) {
			dialog.addFocusable(lockButton, 4 + hasFileBrowser);

			lockButton.on('click', function (evt) {
				toggleLockRatio();
				evt.data && evt.data.preventDefault();
			}, this.getDialog());

			setupMouseClasses(lockButton);
		}
	}

	function toggleLockRatio(enable) {
		if (!lockButton)
			return;

		if (typeof enable == 'boolean') {
			if (userDefinedLock)
				return;

			lockRatio = enable;
		}
		else {
			var width = widthField.getValue(),
				height;

			userDefinedLock = true;
			lockRatio = !lockRatio;

			if (lockRatio && width) {
				height = domHeight / domWidth * width;

				if (!isNaN(height))
					heightField.setValue(Math.round(height));
			}
		}

		lockButton[lockRatio ? 'removeClass' : 'addClass']('cke_btn_unlocked');
		lockButton.setAttribute('aria-checked', lockRatio);

		if (CKEDITOR.env.hc) {
			var icon = lockButton.getChild(0);
			icon.setHtml(lockRatio ? CKEDITOR.env.ie ? '\u25A0' : '\u25A3' : CKEDITOR.env.ie ? '\u25A1' : '\u25A2');
		}
	}

	function toggleDimensions(enable) {
		var method = enable ? 'enable' : 'disable';

		widthField[method]();
		heightField[method]();
	}

	var srcBoxChildren = [
		{
			id: 'src',
			type: 'text',
			label: commonLang.url,
			onKeyup: onChangeSrc,
			onChange: onChangeSrc,
			setup: function (widget) {
				srcurl = this.getValue();
				this.setValue(widget.data.src);
			},
			commit: function (widget) {
				widget.setData('src', this.getValue());
			},
			validate: CKEDITOR.dialog.validate.notEmpty(lang.urlMissing),
			inputStyle: 'width: 100%;'
		}
	];

	function updatePreview() {
		var previewImage = this.getContentElement('info', 'previewImage');
		widget = this.getModel();
		var src = srcurl;
		if (src) {
			previewImage.getElement().setHtml('<img src="' + CKEDITOR.tools.htmlEncode(src) + '" alt="Preview" style="max-width: 100%; max-height: 300px;">');
		} else {
			src = widget.data.src;
			if (src) {
				previewImage.getElement().setHtml('<img src="' + CKEDITOR.tools.htmlEncode(src) + '" alt="Preview" style="max-width: 100%; max-height: 300px;">');
			} else {
				previewImage.getElement().setHtml('');
			}
		}
	}

	function isOnlyLineBreak(element) {
		var content = element.getHtml().replace(/\s/g, '');
		return content === '<br>' || content === '<br/>';
	}

	function replaceEmptyParagraphWithDiv(editor) {
		var selection = editor.getSelection();
		var startElement = selection.getStartElement();

		if (startElement && startElement.getName() === 'p' &&
			(startElement.getHtml().trim() === '' || isOnlyLineBreak(startElement))) {
			var range = selection.getRanges()[0];
			var newDiv = new CKEDITOR.dom.element('div');

			newDiv.replace(startElement);

			range.moveToElementEditStart(newDiv);
			selection.selectRanges([range]);
		}
	}

	return {
		title: lang.title,
		minWidth: 500,
		minHeight: 500,
		onLoad: function () {
			doc = this._.element.getDocument();
			preLoader = createPreLoader();
		},
		onShow: function () {

			var titleElement = this.getElement().findOne('.cke_dialog_title');

			if (!titleElement.hasAttribute('data-modified')) {
				var wrapper = CKEDITOR.dom.element.createFromHtml('<div style="display: flex; align-items: center;"></div>');
				var titleText = CKEDITOR.dom.element.createFromHtml('<span>' + titleElement.getHtml() + '</span>');

				var helpIcon = CKEDITOR.dom.element.createFromHtml(
					'<a href="https://staging.docs.microfocus.com/doc/portal/101/imagemanagement#Insert_an_existing_image" target="_blank" style="display: flex; align-items: center; margin-left: 10px;" aria-label="Help: Insert an existing image">' +
					'<svg style="height:14px !important;width:14px !important" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#000000" alt="Insert an existing image">' +
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


			widget = this.getModel();
			image = widget.parts.image;

			srcChanged = userDefinedLock = lockRatio = false;

			natural = getNatural(image);

			preLoadedWidth = domWidth = natural.width;
			preLoadedHeight = domHeight = natural.height;

			updatePreview.call(this);
		},
		onOk: function () {
			replaceEmptyParagraphWithDiv(editor);
		},
		contents: [
			{
				id: 'info',
				label: lang.infoTab,
				elements: [
					{
						type: 'html',
						html: '<p style="margin-bottom: 10px;">Images are now managed in Dashboards -&gt; Manage Images</p>'
					},
					{
						type: 'vbox',
						padding: 0,
						children: [
							{
								type: 'hbox',
								widths: ['100%'],
								className: 'cke_dialog_image_url',
								children: srcBoxChildren
							}
						]
					},
					{
						id: 'alt',
						type: 'text',
						label: lang.alt,
						setup: function (widget) {
							this.setValue(widget.data.alt);
						},
						commit: function (widget) {
							widget.setData('alt', this.getValue());
						},
						validate: editor.config.image2_altRequired === true ? CKEDITOR.dialog.validate.notEmpty(lang.altMissing) : null,
						inputStyle: 'width: 100%;'
					},
					{
						type: 'hbox',
						widths: ['25%', '25%', '50%'],
						requiredContent: features.dimension.requiredContent,
						children: [
							{
								type: 'text',
								width: '45px',
								id: 'width',
								label: commonLang.width,
								validate: validateDimension,
								onKeyUp: onChangeDimension,
								onLoad: function () {
									widthField = this;
								},
								setup: function (widget) {
									this.setValue(widget.data.width);
								},
								commit: function (widget) {
									widget.setData('width', this.getValue());
								},
								inputStyle: 'width: 100%;'
							},
							{
								type: 'text',
								id: 'height',
								width: '45px',
								label: commonLang.height,
								validate: validateDimension,
								onKeyUp: onChangeDimension,
								onLoad: function () {
									heightField = this;
								},
								setup: function (widget) {
									this.setValue(widget.data.height);
								},
								commit: function (widget) {
									widget.setData('height', this.getValue());
								},
								inputStyle: 'width: 100%;'
							},
							{
								type: 'hbox',
								widths: ['50%', '50%'],
								children: [
									{
										id: 'lock',
										type: 'html',
										style: 'margin-top:13px;width:80px;height:20px;',
										onLoad: onLoadLockReset,
										setup: function (widget) {
											toggleLockRatio(widget.data.lock);
										},
										commit: function (widget) {
											widget.setData('lock', lockRatio);
										},
										html: lockResetHtml
									},
									{
										type: 'button',
										id: 'resetSize',
										label: lang.resetSize,
										style: 'margin-top:13px;width:80px;',
										onClick: function () {
											if (srcChanged) {
												widthField.setValue(preLoadedWidth);
												heightField.setValue(preLoadedHeight);
											} else {
												widthField.setValue(domWidth);
												heightField.setValue(domHeight);
											}
										}
									}
								]
							}
						]
					},
					{
						type: 'hbox',
						id: 'alignment',
						requiredContent: features.align.requiredContent,
						children: [
							{
								id: 'align',
								type: 'select',
								label: commonLang.align,
								items: [
									[commonLang.alignNone, 'none'],
									[commonLang.left, 'left'],
									[commonLang.center, 'center'],
									[commonLang.right, 'right']
								],
								setup: function (widget) {
									this.setValue(widget.data.align);
								},
								commit: function (widget) {
									widget.setData('align', this.getValue());
								}
							}
						]
					},
					{
						type: 'html',
						id: 'previewImage',
						html: '<div style="text-align: center; height: 300px; overflow: auto;"></div>'
					},
					{
						id: 'hasCaption',
						type: 'checkbox',
						label: lang.captioned,
						requiredContent: features.caption.requiredContent,
						setup: function (widget) {
							this.setValue(widget.data.hasCaption);
						},
						commit: function (widget) {
							widget.setData('hasCaption', this.getValue());
						}
					}
				]
			},
			{
				id: 'Upload',
				hidden: true,
				filebrowser: 'uploadButton',
				label: lang.uploadTab,
				elements: [
					{
						type: 'file',
						id: 'upload',
						label: lang.btnUpload,
						style: 'height:40px'
					},
					{
						type: 'fileButton',
						id: 'uploadButton',
						filebrowser: 'info:src',
						label: lang.btnUpload,
						'for': ['Upload', 'upload']
					}
				]
			}
		],
		buttons: [
			CKEDITOR.dialog.okButton,
			{
				type: 'button',
				id: 'previewBtn',
				label: 'Preview',
				onClick: function () {
					var dialog = this.getDialog();
					updatePreview.call(dialog);
				}
			},
			CKEDITOR.dialog.cancelButton
		]
	};
});