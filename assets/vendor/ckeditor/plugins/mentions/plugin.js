'use strict';

(function () {
    CKEDITOR.plugins.add('mentions', {
        requires: 'autocomplete,textmatch,ajax',
        instances: [],
        init: function (editor) {
            var self = this;

            editor.on('instanceReady', function () {
                CKEDITOR.tools.array.forEach(editor.config.mentions || [], function (config) {
                    self.instances.push(new Mentions(editor, config));
                });
            });
        },
        isSupportedEnvironment: function (editor) {
            return editor.plugins.autocomplete.isSupportedEnvironment(editor);
        }
    });

    var MARKER = '@',
        MIN_CHARS = 2;
    var allUsers = [];
    function Mentions(editor, config) {
        var self = this;
        this.marker = config.hasOwnProperty('marker') ? config.marker : MARKER;
        this.minChars = config.minChars !== null && config.minChars !== undefined ? config.minChars : MIN_CHARS;
        this.pattern = config.pattern || createPattern(this.marker, this.minChars);
        this.cache = config.cache !== undefined ? config.cache : true;
        this.caseSensitive = config.caseSensitive;
        this.throttle = config.throttle !== undefined ? config.throttle : 200;

        var loggedInUser = config.loggedInUser;
        const baseUrl = window.location.origin === 'http://localhost:4200' ? 'https://test.docs.microfocus.com' : window.location.origin;
        var apiUrl = `${baseUrl}/docops-portal/api/v1/User/getalluserlist`;

        CKEDITOR.ajax.load(apiUrl, function (response) {
            var data = JSON.parse(response);
            self.processUserData(data);
            self.initializeAutocomplete(editor, config, loggedInUser);
        });

        editor.on('key', function (evt) {
            var selection = editor.getSelection();
            var element = selection.getStartElement();

            if (element && element.hasClass('mention')) {
                var key = evt.data.keyCode;
                if (key === 13 || key === 32) {
                    var range = editor.createRange();
                    range.moveToPosition(element, CKEDITOR.POSITION_AFTER_END);
                    range.select();
                    evt.cancel();
                }
            }
        });
    }

    Mentions.prototype = {
        destroy: function () {
            this._autocomplete.destroy();
        },

        processUserData: function (data) {
            let userlists = data.GitSync.data;
            let index = 0;
            let uniqueEmails = new Set();
        
            userlists.forEach((element) => {
                if (!uniqueEmails.has(element.user_email) && element.user_email.indexOf('opentext.com') > -1) {
                    const result = {
                        id: index++,
                        name: element.user_real_name,
                        firstName: element.user_real_name,
                        lastName: element.user_email,
                        useremail: element.user_email,
                        color: 'blue'
                    };
                    allUsers.push(result);
                    uniqueEmails.add(element.user_email);
                }
            });
        },

        initializeAutocomplete: function (editor, config, loggedInUser) {
            this._autocomplete = new CKEDITOR.plugins.autocomplete(editor, {
                textTestCallback: getTextTestCallback(this.marker, this.minChars, this.pattern),
                dataCallback: getDataCallback(allUsers, this),
                itemTemplate: config.itemTemplate || '<li data-id="{id}"><strong>{name}</strong> ({firstName} {lastName})</li>',
                outputTemplate: config.outputTemplate || function (item) {
                    var color = item.color || 'default';
                    if (item.isError) {
                        alert('User "' + item.name + '" not found');
                        return '<span class="mention mention-error" data-mention="' + item.name + '">' + item.name + '</span>';
                    }
                    return `<span contenteditable="false" class="mention mention-${color}" data-mention="@${item.name}" data-mention-name="@${item.name}" data-mention-email="@${item.lastName}" data-user-name="${loggedInUser.name}" data-user-email="${loggedInUser.email}">${item.name}</span>&nbsp;`;
                },
                throttle: this.throttle,
                itemsLimit: config.itemsLimit
            });
        }
    };

    function createPattern(marker, minChars) {
        var pattern = '\\' + marker + '[_a-zA-Z0-9À-ž]';
        if (minChars) {
            pattern += '{' + minChars + ',}';
        } else {
            pattern += '*';
        }
        pattern += '$';
        return new RegExp(pattern);
    }

    function getTextTestCallback(marker, minChars, pattern) {
        return function (range) {
            if (!range.collapsed) {
                return null;
            }
            return CKEDITOR.plugins.textMatch.match(range, matchCallback);
        };

        function matchCallback(text, offset) {
            var match = text.slice(0, offset).match(pattern);
            if (!match) {
                return null;
            }
            var prevChar = text[match.index - 1];
            if (prevChar !== undefined && !prevChar.match(/\s+/)) {
                return null;
            }
            return {
                start: match.index,
                end: offset
            };
        }
    }

    function getDataCallback(feed, mentions) {
        return function (matchInfo, callback) {
            var query = matchInfo.query.substring(mentions.marker.length);
            var data = feed.filter(function (item) {
                var itemName = mentions.caseSensitive ? item.name : item.name.toLowerCase();
                var queryText = mentions.caseSensitive ? query : query.toLowerCase();
                return itemName.indexOf(queryText) === 0;
            });
    
            // Remove duplicates based on email
            data = data.filter((item, index, self) =>
                index === self.findIndex((t) => t.useremail === item.useremail)
            );
    
            if (data.length === 0) {
                data.push({
                    name: query,
                    color: 'error',
                    isError: true
                });
            }
    
            callback(data.map(function (item) {
                return CKEDITOR.tools.object.merge({}, item, {
                    name: mentions.marker + item.name,
                    color: item.color || 'default',
                    isError: item.isError || false
                });
            }));
        }
    }

    CKEDITOR.plugins.mentions = Mentions;
})();