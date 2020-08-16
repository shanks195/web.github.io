if (typeof jQuery === 'undefined') {
	throw new Error('BootstrapValidator requires jQuery');
}
(function ($) {
	var version = $.fn.jquery.split(' ')[0].split('.');
	if (
		(+version[0] < 2 && +version[1] < 9) ||
		(+version[0] === 1 && +version[1] === 9 && +version[2] < 1)
	) {
		throw new Error(
			'BootstrapValidator requires jQuery version 1.9.1 or higher'
		);
	}
})(window.jQuery);
(function ($) {
	var BootstrapValidator = function (form, options) {
		this.$form = $(form);
		this.options = $.extend(
			{},
			$.fn.bootstrapValidator.DEFAULT_OPTIONS,
			options
		);
		this.$invalidFields = $([]);
		this.$submitButton = null;
		this.$hiddenButton = null;
		this.STATUS_NOT_VALIDATED = 'NOT_VALIDATED';
		this.STATUS_VALIDATING = 'VALIDATING';
		this.STATUS_INVALID = 'INVALID';
		this.STATUS_VALID = 'VALID';
		var ieVersion = (function () {
			var v = 3,
				div = document.createElement('div'),
				a = div.all || [];
			while (
				((div.innerHTML =
					'<!--[if gt IE ' + ++v + ']><br><![endif]-->'),
				a[0])
			) {}
			return v > 4 ? v : !v;
		})();
		var el = document.createElement('div');
		this._changeEvent =
			ieVersion === 9 || !('oninput' in el) ? 'keyup' : 'input';
		this._submitIfValid = null;
		this._cacheFields = {};
		this._init();
	};
	BootstrapValidator.prototype = {
		constructor: BootstrapValidator,
		_init: function () {
			var that = this,
				options = {
					autoFocus: this.$form.attr('data-bv-autofocus'),
					container: this.$form.attr('data-bv-container'),
					events: {
						formInit: this.$form.attr('data-bv-events-form-init'),
						formError: this.$form.attr('data-bv-events-form-error'),
						formSuccess: this.$form.attr(
							'data-bv-events-form-success'
						),
						fieldAdded: this.$form.attr(
							'data-bv-events-field-added'
						),
						fieldRemoved: this.$form.attr(
							'data-bv-events-field-removed'
						),
						fieldInit: this.$form.attr('data-bv-events-field-init'),
						fieldError: this.$form.attr(
							'data-bv-events-field-error'
						),
						fieldSuccess: this.$form.attr(
							'data-bv-events-field-success'
						),
						fieldStatus: this.$form.attr(
							'data-bv-events-field-status'
						),
						validatorError: this.$form.attr(
							'data-bv-events-validator-error'
						),
						validatorSuccess: this.$form.attr(
							'data-bv-events-validator-success'
						),
					},
					excluded: this.$form.attr('data-bv-excluded'),
					feedbackIcons: {
						valid: this.$form.attr('data-bv-feedbackicons-valid'),
						invalid: this.$form.attr(
							'data-bv-feedbackicons-invalid'
						),
						validating: this.$form.attr(
							'data-bv-feedbackicons-validating'
						),
					},
					group: this.$form.attr('data-bv-group'),
					live: this.$form.attr('data-bv-live'),
					message: this.$form.attr('data-bv-message'),
					onError: this.$form.attr('data-bv-onerror'),
					onSuccess: this.$form.attr('data-bv-onsuccess'),
					submitButtons: this.$form.attr('data-bv-submitbuttons'),
					threshold: this.$form.attr('data-bv-threshold'),
					trigger: this.$form.attr('data-bv-trigger'),
					verbose: this.$form.attr('data-bv-verbose'),
					fields: {},
				};
			this.$form
				.attr('novalidate', 'novalidate')
				.addClass(this.options.elementClass)
				.on('submit.bv', function (e) {
					e.preventDefault();
					that.validate();
				})
				.on('click.bv', this.options.submitButtons, function () {
					that.$submitButton = $(this);
					that._submitIfValid = true;
				})
				.find('[name], [data-bv-field]')
				.each(function () {
					var $field = $(this),
						field =
							$field.attr('name') || $field.attr('data-bv-field'),
						opts = that._parseOptions($field);
					if (opts) {
						$field.attr('data-bv-field', field);
						options.fields[field] = $.extend(
							{},
							opts,
							options.fields[field]
						);
					}
				});
			this.options = $.extend(true, this.options, options);
			this.$hiddenButton = $('<button/>')
				.attr('type', 'submit')
				.prependTo(this.$form)
				.addClass('bv-hidden-submit')
				.css({ display: 'none', width: 0, height: 0 });
			this.$form.on('click.bv', '[type="submit"]', function (e) {
				if (!e.isDefaultPrevented()) {
					var $target = $(e.target),
						$button = $target.is('[type="submit"]')
							? $target.eq(0)
							: $target.parent('[type="submit"]').eq(0);
					if (
						that.options.submitButtons &&
						!$button.is(that.options.submitButtons) &&
						!$button.is(that.$hiddenButton)
					) {
						that.$form.off('submit.bv').submit();
					}
				}
			});
			for (var field in this.options.fields) {
				this._initField(field);
			}
			this.$form.trigger($.Event(this.options.events.formInit), {
				bv: this,
				options: this.options,
			});
			if (this.options.onSuccess) {
				this.$form.on(this.options.events.formSuccess, function (e) {
					$.fn.bootstrapValidator.helpers.call(
						that.options.onSuccess,
						[e]
					);
				});
			}
			if (this.options.onError) {
				this.$form.on(this.options.events.formError, function (e) {
					$.fn.bootstrapValidator.helpers.call(that.options.onError, [
						e,
					]);
				});
			}
		},
		_parseOptions: function ($field) {
			var field = $field.attr('name') || $field.attr('data-bv-field'),
				validators = {},
				validator,
				v,
				attrName,
				enabled,
				optionName,
				optionAttrName,
				optionValue,
				html5AttrName,
				html5AttrMap;
			for (v in $.fn.bootstrapValidator.validators) {
				validator = $.fn.bootstrapValidator.validators[v];
				(attrName = 'data-bv-' + v.toLowerCase()),
					(enabled = $field.attr(attrName) + '');
				html5AttrMap =
					'function' === typeof validator.enableByHtml5
						? validator.enableByHtml5($field)
						: null;
				if (
					(html5AttrMap && enabled !== 'false') ||
					(html5AttrMap !== true &&
						('' === enabled ||
							'true' === enabled ||
							attrName === enabled.toLowerCase()))
				) {
					validator.html5Attributes = $.extend(
						{},
						{
							message: 'message',
							onerror: 'onError',
							onsuccess: 'onSuccess',
						},
						validator.html5Attributes
					);
					validators[v] = $.extend(
						{},
						html5AttrMap === true ? {} : html5AttrMap,
						validators[v]
					);
					for (html5AttrName in validator.html5Attributes) {
						optionName = validator.html5Attributes[html5AttrName];
						(optionAttrName =
							'data-bv-' + v.toLowerCase() + '-' + html5AttrName),
							(optionValue = $field.attr(optionAttrName));
						if (optionValue) {
							if (
								'true' === optionValue ||
								optionAttrName === optionValue.toLowerCase()
							) {
								optionValue = true;
							} else if ('false' === optionValue) {
								optionValue = false;
							}
							validators[v][optionName] = optionValue;
						}
					}
				}
			}
			var opts = {
					autoFocus: $field.attr('data-bv-autofocus'),
					container: $field.attr('data-bv-container'),
					excluded: $field.attr('data-bv-excluded'),
					feedbackIcons: $field.attr('data-bv-feedbackicons'),
					group: $field.attr('data-bv-group'),
					message: $field.attr('data-bv-message'),
					onError: $field.attr('data-bv-onerror'),
					onStatus: $field.attr('data-bv-onstatus'),
					onSuccess: $field.attr('data-bv-onsuccess'),
					selector: $field.attr('data-bv-selector'),
					threshold: $field.attr('data-bv-threshold'),
					trigger: $field.attr('data-bv-trigger'),
					verbose: $field.attr('data-bv-verbose'),
					validators: validators,
				},
				emptyOptions = $.isEmptyObject(opts),
				emptyValidators = $.isEmptyObject(validators);
			if (
				!emptyValidators ||
				(!emptyOptions &&
					this.options.fields &&
					this.options.fields[field])
			) {
				opts.validators = validators;
				return opts;
			} else {
				return null;
			}
		},
		_initField: function (field) {
			var fields = $([]);
			switch (typeof field) {
				case 'object':
					fields = field;
					field = field.attr('data-bv-field');
					break;
				case 'string':
					fields = this.getFieldElements(field);
					fields.attr('data-bv-field', field);
					break;
				default:
					break;
			}
			if (fields.length === 0) {
				return;
			}
			if (
				this.options.fields[field] === null ||
				this.options.fields[field].validators === null
			) {
				return;
			}
			var validatorName;
			for (validatorName in this.options.fields[field].validators) {
				if (!$.fn.bootstrapValidator.validators[validatorName]) {
					delete this.options.fields[field].validators[validatorName];
				}
			}
			if (this.options.fields[field].enabled === null) {
				this.options.fields[field].enabled = true;
			}
			var that = this,
				total = fields.length,
				type = fields.attr('type'),
				updateAll =
					total === 1 || 'radio' === type || 'checkbox' === type,
				event =
					'radio' === type ||
					'checkbox' === type ||
					'file' === type ||
					'SELECT' === fields.eq(0).get(0).tagName
						? 'change'
						: this._changeEvent,
				trigger = (
					this.options.fields[field].trigger ||
					this.options.trigger ||
					event
				).split(' '),
				events = $.map(trigger, function (item) {
					return item + '.update.bv';
				}).join(' ');
			for (var i = 0; i < total; i++) {
				var $field = fields.eq(i),
					group =
						this.options.fields[field].group || this.options.group,
					$parent = $field.parents(group),
					container =
						'function' ===
						typeof (
							this.options.fields[field].container ||
							this.options.container
						)
							? (
									this.options.fields[field].container ||
									this.options.container
							  ).call(this, $field, this)
							: this.options.fields[field].container ||
							  this.options.container,
					$message =
						container &&
						container !== 'tooltip' &&
						container !== 'popover'
							? $(container)
							: this._getMessageContainer($field, group);
				if (
					container &&
					container !== 'tooltip' &&
					container !== 'popover'
				) {
					$message.addClass('has-error');
				}
				$message
					.find(
						'.help-block[data-bv-validator][data-bv-for="' +
							field +
							'"]'
					)
					.remove();
				$parent.find('i[data-bv-icon-for="' + field + '"]').remove();
				$field.off(events).on(events, function () {
					that.updateStatus($(this), that.STATUS_NOT_VALIDATED);
				});
				$field.data('bv.messages', $message);
				for (validatorName in this.options.fields[field].validators) {
					$field.data(
						'bv.result.' + validatorName,
						this.STATUS_NOT_VALIDATED
					);
					if (!updateAll || i === total - 1) {
						$('<small/>')
							.css('display', 'none')
							.addClass('help-block')
							.attr('data-bv-validator', validatorName)
							.attr('data-bv-for', field)
							.attr('data-bv-result', this.STATUS_NOT_VALIDATED)
							.html(this._getMessage(field, validatorName))
							.appendTo($message);
					}
					if (
						'function' ===
						typeof $.fn.bootstrapValidator.validators[validatorName]
							.init
					) {
						$.fn.bootstrapValidator.validators[validatorName].init(
							this,
							$field,
							this.options.fields[field].validators[validatorName]
						);
					}
				}
				if (
					this.options.fields[field].feedbackIcons !== false &&
					this.options.fields[field].feedbackIcons !== 'false' &&
					this.options.feedbackIcons &&
					this.options.feedbackIcons.validating &&
					this.options.feedbackIcons.invalid &&
					this.options.feedbackIcons.valid &&
					(!updateAll || i === total - 1)
				) {
					$parent.addClass('has-feedback');
					var $icon = $('<i/>')
						.css('display', 'none')
						.addClass('form-control-feedback')
						.attr('data-bv-icon-for', field)
						.insertAfter($field);
					if ('checkbox' === type || 'radio' === type) {
						var $fieldParent = $field.parent();
						if ($fieldParent.hasClass(type)) {
							$icon.insertAfter($fieldParent);
						} else if ($fieldParent.parent().hasClass(type)) {
							$icon.insertAfter($fieldParent.parent());
						}
					}
					if ($parent.find('label').length === 0) {
						$icon.addClass('bv-no-label');
					}
					if ($parent.find('.input-group').length !== 0) {
						$icon
							.addClass('bv-icon-input-group')
							.insertAfter($parent.find('.input-group').eq(0));
					}
					if (!updateAll) {
						$field.data('bv.icon', $icon);
					} else if (i === total - 1) {
						fields.data('bv.icon', $icon);
					}
					if (container) {
						$field
							.off('focus.container.bv')
							.on('focus.container.bv', function () {
								switch (container) {
									case 'tooltip':
										$(this).data('bv.icon').tooltip('show');
										break;
									case 'popover':
										$(this).data('bv.icon').popover('show');
										break;
									default:
										break;
								}
							})
							.off('blur.container.bv')
							.on('blur.container.bv', function () {
								switch (container) {
									case 'tooltip':
										$(this).data('bv.icon').tooltip('hide');
										break;
									case 'popover':
										$(this).data('bv.icon').popover('hide');
										break;
									default:
										break;
								}
							});
					}
				}
			}
			fields
				.on(this.options.events.fieldSuccess, function (e, data) {
					var onSuccess = that.getOptions(
						data.field,
						null,
						'onSuccess'
					);
					if (onSuccess) {
						$.fn.bootstrapValidator.helpers.call(onSuccess, [
							e,
							data,
						]);
					}
				})
				.on(this.options.events.fieldError, function (e, data) {
					var onError = that.getOptions(data.field, null, 'onError');
					if (onError) {
						$.fn.bootstrapValidator.helpers.call(onError, [
							e,
							data,
						]);
					}
				})
				.on(this.options.events.fieldStatus, function (e, data) {
					var onStatus = that.getOptions(
						data.field,
						null,
						'onStatus'
					);
					if (onStatus) {
						$.fn.bootstrapValidator.helpers.call(onStatus, [
							e,
							data,
						]);
					}
				})
				.on(this.options.events.validatorError, function (e, data) {
					var onError = that.getOptions(
						data.field,
						data.validator,
						'onError'
					);
					if (onError) {
						$.fn.bootstrapValidator.helpers.call(onError, [
							e,
							data,
						]);
					}
				})
				.on(this.options.events.validatorSuccess, function (e, data) {
					var onSuccess = that.getOptions(
						data.field,
						data.validator,
						'onSuccess'
					);
					if (onSuccess) {
						$.fn.bootstrapValidator.helpers.call(onSuccess, [
							e,
							data,
						]);
					}
				});
			events = $.map(trigger, function (item) {
				return item + '.live.bv';
			}).join(' ');
			switch (this.options.live) {
				case 'submitted':
					break;
				case 'disabled':
					fields.off(events);
					break;
				case 'enabled':
				default:
					fields.off(events).on(events, function () {
						if (that._exceedThreshold($(this))) {
							that.validateField($(this));
						}
					});
					break;
			}
			fields.trigger($.Event(this.options.events.fieldInit), {
				bv: this,
				field: field,
				element: fields,
			});
		},
		_getMessage: function (field, validatorName) {
			if (
				!this.options.fields[field] ||
				!$.fn.bootstrapValidator.validators[validatorName] ||
				!this.options.fields[field].validators ||
				!this.options.fields[field].validators[validatorName]
			) {
				return '';
			}
			var options = this.options.fields[field].validators[validatorName];
			switch (true) {
				case !!options.message:
					return options.message;
				case !!this.options.fields[field].message:
					return this.options.fields[field].message;
				case !!$.fn.bootstrapValidator.i18n[validatorName]:
					return $.fn.bootstrapValidator.i18n[validatorName][
						'default'
					];
				default:
					return this.options.message;
			}
		},
		_getMessageContainer: function ($field, group) {
			var $parent = $field.parent();
			if ($parent.is(group)) {
				return $parent;
			}
			var cssClasses = $parent.attr('class');
			if (!cssClasses) {
				return this._getMessageContainer($parent, group);
			}
			cssClasses = cssClasses.split(' ');
			var n = cssClasses.length;
			for (var i = 0; i < n; i++) {
				if (
					/^col-(xs|sm|md|lg)-\d+$/.test(cssClasses[i]) ||
					/^col-(xs|sm|md|lg)-offset-\d+$/.test(cssClasses[i])
				) {
					return $parent;
				}
			}
			return this._getMessageContainer($parent, group);
		},
		_submit: function () {
			var isValid = this.isValid(),
				eventType = isValid
					? this.options.events.formSuccess
					: this.options.events.formError,
				e = $.Event(eventType);
			this.$form.trigger(e);
			if (this.$submitButton) {
				isValid ? this._onSuccess(e) : this._onError(e);
			}
		},
		_isExcluded: function ($field) {
			var excludedAttr = $field.attr('data-bv-excluded'),
				field = $field.attr('data-bv-field') || $field.attr('name');
			switch (true) {
				case !!field &&
					this.options.fields &&
					this.options.fields[field] &&
					(this.options.fields[field].excluded === 'true' ||
						this.options.fields[field].excluded === true):
				case excludedAttr === 'true':
				case excludedAttr === '':
					return true;
				case !!field &&
					this.options.fields &&
					this.options.fields[field] &&
					(this.options.fields[field].excluded === 'false' ||
						this.options.fields[field].excluded === false):
				case excludedAttr === 'false':
					return false;
				default:
					if (this.options.excluded) {
						if ('string' === typeof this.options.excluded) {
							this.options.excluded = $.map(
								this.options.excluded.split(','),
								function (item) {
									return $.trim(item);
								}
							);
						}
						var length = this.options.excluded.length;
						for (var i = 0; i < length; i++) {
							if (
								('string' === typeof this.options.excluded[i] &&
									$field.is(this.options.excluded[i])) ||
								('function' ===
									typeof this.options.excluded[i] &&
									this.options.excluded[i].call(
										this,
										$field,
										this
									) === true)
							) {
								return true;
							}
						}
					}
					return false;
			}
		},
		_exceedThreshold: function ($field) {
			var field = $field.attr('data-bv-field'),
				threshold =
					this.options.fields[field].threshold ||
					this.options.threshold;
			if (!threshold) {
				return true;
			}
			var cannotType =
				$.inArray($field.attr('type'), [
					'button',
					'checkbox',
					'file',
					'hidden',
					'image',
					'radio',
					'reset',
					'submit',
				]) !== -1;
			return cannotType || $field.val().length >= threshold;
		},
		_onError: function (e) {
			if (e.isDefaultPrevented()) {
				return;
			}
			if ('submitted' === this.options.live) {
				this.options.live = 'enabled';
				var that = this;
				for (var field in this.options.fields) {
					(function (f) {
						var fields = that.getFieldElements(f);
						if (fields.length) {
							var type = $(fields[0]).attr('type'),
								event =
									'radio' === type ||
									'checkbox' === type ||
									'file' === type ||
									'SELECT' === $(fields[0]).get(0).tagName
										? 'change'
										: that._changeEvent,
								trigger =
									that.options.fields[field].trigger ||
									that.options.trigger ||
									event,
								events = $.map(trigger.split(' '), function (
									item
								) {
									return item + '.live.bv';
								}).join(' ');
							fields.off(events).on(events, function () {
								if (that._exceedThreshold($(this))) {
									that.validateField($(this));
								}
							});
						}
					})(field);
				}
			}
			for (var i = 0; i < this.$invalidFields.length; i++) {
				var $field = this.$invalidFields.eq(i),
					autoFocus = this._isOptionEnabled(
						$field.attr('data-bv-field'),
						'autoFocus'
					);
				if (autoFocus) {
					var $tabPane = $field.parents('.tab-pane'),
						tabId;
					if ($tabPane && (tabId = $tabPane.attr('id'))) {
						$('a[href="#' + tabId + '"][data-toggle="tab"]').tab(
							'show'
						);
					}
					$field.focus();
					break;
				}
			}
		},
		_onSuccess: function (e) {
			if (e.isDefaultPrevented()) {
				return;
			}
			this.disableSubmitButtons(true).defaultSubmit();
		},
		_onFieldValidated: function ($field, validatorName) {
			var field = $field.attr('data-bv-field'),
				validators = this.options.fields[field].validators,
				counter = {},
				numValidators = 0,
				data = {
					bv: this,
					field: field,
					element: $field,
					validator: validatorName,
					result: $field.data('bv.response.' + validatorName),
				};
			if (validatorName) {
				switch ($field.data('bv.result.' + validatorName)) {
					case this.STATUS_INVALID:
						$field.trigger(
							$.Event(this.options.events.validatorError),
							data
						);
						break;
					case this.STATUS_VALID:
						$field.trigger(
							$.Event(this.options.events.validatorSuccess),
							data
						);
						break;
					default:
						break;
				}
			}
			counter[this.STATUS_NOT_VALIDATED] = 0;
			counter[this.STATUS_VALIDATING] = 0;
			counter[this.STATUS_INVALID] = 0;
			counter[this.STATUS_VALID] = 0;
			for (var v in validators) {
				if (validators[v].enabled === false) {
					continue;
				}
				numValidators++;
				var result = $field.data('bv.result.' + v);
				if (result) {
					counter[result]++;
				}
			}
			if (counter[this.STATUS_VALID] === numValidators) {
				this.$invalidFields = this.$invalidFields.not($field);
				$field.trigger($.Event(this.options.events.fieldSuccess), data);
			} else if (
				(counter[this.STATUS_NOT_VALIDATED] === 0 ||
					!this._isOptionEnabled(field, 'verbose')) &&
				counter[this.STATUS_VALIDATING] === 0 &&
				counter[this.STATUS_INVALID] > 0
			) {
				this.$invalidFields = this.$invalidFields.add($field);
				$field.trigger($.Event(this.options.events.fieldError), data);
			}
		},
		_isOptionEnabled: function (field, option) {
			if (
				this.options.fields[field] &&
				(this.options.fields[field][option] === 'true' ||
					this.options.fields[field][option] === true)
			) {
				return true;
			}
			if (
				this.options.fields[field] &&
				(this.options.fields[field][option] === 'false' ||
					this.options.fields[field][option] === false)
			) {
				return false;
			}
			return (
				this.options[option] === 'true' || this.options[option] === true
			);
		},
		getFieldElements: function (field) {
			if (!this._cacheFields[field]) {
				this._cacheFields[field] =
					this.options.fields[field] &&
					this.options.fields[field].selector
						? $(this.options.fields[field].selector)
						: this.$form.find('[name="' + field + '"]');
			}
			return this._cacheFields[field];
		},
		getOptions: function (field, validator, option) {
			if (!field) {
				return option ? this.options[option] : this.options;
			}
			if ('object' === typeof field) {
				field = field.attr('data-bv-field');
			}
			if (!this.options.fields[field]) {
				return null;
			}
			var options = this.options.fields[field];
			if (!validator) {
				return option ? options[option] : options;
			}
			if (!options.validators || !options.validators[validator]) {
				return null;
			}
			return option
				? options.validators[validator][option]
				: options.validators[validator];
		},
		disableSubmitButtons: function (disabled) {
			if (!disabled) {
				this.$form
					.find(this.options.submitButtons)
					.removeAttr('disabled');
			} else if (this.options.live !== 'disabled') {
				this.$form
					.find(this.options.submitButtons)
					.attr('disabled', 'disabled');
			}
			return this;
		},
		validate: function () {
			if (!this.options.fields) {
				return this;
			}
			this.disableSubmitButtons(true);
			this._submitIfValid = false;
			for (var field in this.options.fields) {
				this.validateField(field);
			}
			this._submit();
			this._submitIfValid = true;
			return this;
		},
		validateField: function (field) {
			var fields = $([]);
			switch (typeof field) {
				case 'object':
					fields = field;
					field = field.attr('data-bv-field');
					break;
				case 'string':
					fields = this.getFieldElements(field);
					break;
				default:
					break;
			}
			if (
				fields.length === 0 ||
				!this.options.fields[field] ||
				this.options.fields[field].enabled === false
			) {
				return this;
			}
			var that = this,
				type = fields.attr('type'),
				total =
					'radio' === type || 'checkbox' === type ? 1 : fields.length,
				updateAll = 'radio' === type || 'checkbox' === type,
				validators = this.options.fields[field].validators,
				verbose = this._isOptionEnabled(field, 'verbose'),
				validatorName,
				validateResult;
			for (var i = 0; i < total; i++) {
				var $field = fields.eq(i);
				if (this._isExcluded($field)) {
					continue;
				}
				var stop = false;
				for (validatorName in validators) {
					if ($field.data('bv.dfs.' + validatorName)) {
						$field.data('bv.dfs.' + validatorName).reject();
					}
					if (stop) {
						break;
					}
					var result = $field.data('bv.result.' + validatorName);
					if (
						result === this.STATUS_VALID ||
						result === this.STATUS_INVALID
					) {
						this._onFieldValidated($field, validatorName);
						continue;
					} else if (validators[validatorName].enabled === false) {
						this.updateStatus(
							updateAll ? field : $field,
							this.STATUS_VALID,
							validatorName
						);
						continue;
					}
					$field.data(
						'bv.result.' + validatorName,
						this.STATUS_VALIDATING
					);
					validateResult = $.fn.bootstrapValidator.validators[
						validatorName
					].validate(this, $field, validators[validatorName]);
					if (
						'object' === typeof validateResult &&
						validateResult.resolve
					) {
						this.updateStatus(
							updateAll ? field : $field,
							this.STATUS_VALIDATING,
							validatorName
						);
						$field.data('bv.dfs.' + validatorName, validateResult);
						validateResult.done(function ($f, v, response) {
							$f.removeData('bv.dfs.' + v).data(
								'bv.response.' + v,
								response
							);
							if (response.message) {
								that.updateMessage($f, v, response.message);
							}
							that.updateStatus(
								updateAll ? $f.attr('data-bv-field') : $f,
								response.valid
									? that.STATUS_VALID
									: that.STATUS_INVALID,
								v
							);
							if (
								response.valid &&
								that._submitIfValid === true
							) {
								that._submit();
							} else if (!response.valid && !verbose) {
								stop = true;
							}
						});
					} else if (
						'object' === typeof validateResult &&
						validateResult.valid !== undefined &&
						validateResult.message !== undefined
					) {
						$field.data(
							'bv.response.' + validatorName,
							validateResult
						);
						this.updateMessage(
							updateAll ? field : $field,
							validatorName,
							validateResult.message
						);
						this.updateStatus(
							updateAll ? field : $field,
							validateResult.valid
								? this.STATUS_VALID
								: this.STATUS_INVALID,
							validatorName
						);
						if (!validateResult.valid && !verbose) {
							break;
						}
					} else if ('boolean' === typeof validateResult) {
						$field.data(
							'bv.response.' + validatorName,
							validateResult
						);
						this.updateStatus(
							updateAll ? field : $field,
							validateResult
								? this.STATUS_VALID
								: this.STATUS_INVALID,
							validatorName
						);
						if (!validateResult && !verbose) {
							break;
						}
					}
				}
			}
			return this;
		},
		updateMessage: function (field, validator, message) {
			var $fields = $([]);
			switch (typeof field) {
				case 'object':
					$fields = field;
					field = field.attr('data-bv-field');
					break;
				case 'string':
					$fields = this.getFieldElements(field);
					break;
				default:
					break;
			}
			$fields.each(function () {
				$(this)
					.data('bv.messages')
					.find(
						'.help-block[data-bv-validator="' +
							validator +
							'"][data-bv-for="' +
							field +
							'"]'
					)
					.html(message);
			});
		},
		updateStatus: function (field, status, validatorName) {
			var fields = $([]);
			switch (typeof field) {
				case 'object':
					fields = field;
					field = field.attr('data-bv-field');
					break;
				case 'string':
					fields = this.getFieldElements(field);
					break;
				default:
					break;
			}
			if (status === this.STATUS_NOT_VALIDATED) {
				this._submitIfValid = false;
			}
			var that = this,
				type = fields.attr('type'),
				group = this.options.fields[field].group || this.options.group,
				total =
					'radio' === type || 'checkbox' === type ? 1 : fields.length;
			for (var i = 0; i < total; i++) {
				var $field = fields.eq(i);
				if (this._isExcluded($field)) {
					continue;
				}
				var $parent = $field.parents(group),
					$message = $field.data('bv.messages'),
					$allErrors = $message.find(
						'.help-block[data-bv-validator][data-bv-for="' +
							field +
							'"]'
					),
					$errors = validatorName
						? $allErrors.filter(
								'[data-bv-validator="' + validatorName + '"]'
						  )
						: $allErrors,
					$icon = $field.data('bv.icon'),
					container =
						'function' ===
						typeof (
							this.options.fields[field].container ||
							this.options.container
						)
							? (
									this.options.fields[field].container ||
									this.options.container
							  ).call(this, $field, this)
							: this.options.fields[field].container ||
							  this.options.container,
					isValidField = null;
				if (validatorName) {
					$field.data('bv.result.' + validatorName, status);
				} else {
					for (var v in this.options.fields[field].validators) {
						$field.data('bv.result.' + v, status);
					}
				}
				$errors.attr('data-bv-result', status);
				var $tabPane = $field.parents('.tab-pane'),
					tabId,
					$tab;
				if ($tabPane && (tabId = $tabPane.attr('id'))) {
					$tab = $(
						'a[href="#' + tabId + '"][data-toggle="tab"]'
					).parent();
				}
				switch (status) {
					case this.STATUS_VALIDATING:
						isValidField = null;
						this.disableSubmitButtons(true);
						$parent
							.removeClass('has-success')
							.removeClass('has-error');
						if ($icon) {
							$icon
								.removeClass(this.options.feedbackIcons.valid)
								.removeClass(this.options.feedbackIcons.invalid)
								.addClass(this.options.feedbackIcons.validating)
								.show();
						}
						if ($tab) {
							$tab.removeClass('bv-tab-success').removeClass(
								'bv-tab-error'
							);
						}
						break;
					case this.STATUS_INVALID:
						isValidField = false;
						this.disableSubmitButtons(true);
						$parent
							.removeClass('has-success')
							.addClass('has-error');
						if ($icon) {
							$icon
								.removeClass(this.options.feedbackIcons.valid)
								.removeClass(
									this.options.feedbackIcons.validating
								)
								.addClass(this.options.feedbackIcons.invalid)
								.show();
						}
						if ($tab) {
							$tab.removeClass('bv-tab-success').addClass(
								'bv-tab-error'
							);
						}
						break;
					case this.STATUS_VALID:
						isValidField =
							$allErrors.filter(
								'[data-bv-result="' +
									this.STATUS_NOT_VALIDATED +
									'"]'
							).length === 0
								? $allErrors.filter(
										'[data-bv-result="' +
											this.STATUS_VALID +
											'"]'
								  ).length === $allErrors.length
								: null;
						if (isValidField !== null) {
							this.disableSubmitButtons(
								this.$submitButton
									? !this.isValid()
									: !isValidField
							);
							if ($icon) {
								$icon
									.removeClass(
										this.options.feedbackIcons.invalid
									)
									.removeClass(
										this.options.feedbackIcons.validating
									)
									.removeClass(
										this.options.feedbackIcons.valid
									)
									.addClass(
										isValidField
											? this.options.feedbackIcons.valid
											: this.options.feedbackIcons.invalid
									)
									.show();
							}
						}
						$parent
							.removeClass('has-error has-success')
							.addClass(
								this.isValidContainer($parent)
									? 'has-success'
									: 'has-error'
							);
						if ($tab) {
							$tab.removeClass('bv-tab-success')
								.removeClass('bv-tab-error')
								.addClass(
									this.isValidContainer($tabPane)
										? 'bv-tab-success'
										: 'bv-tab-error'
								);
						}
						break;
					case this.STATUS_NOT_VALIDATED:
					/* falls through */
					default:
						isValidField = null;
						this.disableSubmitButtons(false);
						$parent
							.removeClass('has-success')
							.removeClass('has-error');
						if ($icon) {
							$icon
								.removeClass(this.options.feedbackIcons.valid)
								.removeClass(this.options.feedbackIcons.invalid)
								.removeClass(
									this.options.feedbackIcons.validating
								)
								.hide();
						}
						if ($tab) {
							$tab.removeClass('bv-tab-success').removeClass(
								'bv-tab-error'
							);
						}
						break;
				}
				switch (true) {
					case $icon && 'tooltip' === container:
						isValidField === false
							? $icon
									.css('cursor', 'pointer')
									.tooltip('destroy')
									.tooltip({
										container: 'body',
										html: true,
										placement: 'auto top',
										title: $allErrors
											.filter(
												'[data-bv-result="' +
													that.STATUS_INVALID +
													'"]'
											)
											.eq(0)
											.html(),
									})
							: $icon.css('cursor', '').tooltip('destroy');
						break;
					case $icon && 'popover' === container:
						isValidField === false
							? $icon
									.css('cursor', 'pointer')
									.popover('destroy')
									.popover({
										container: 'body',
										content: $allErrors
											.filter(
												'[data-bv-result="' +
													that.STATUS_INVALID +
													'"]'
											)
											.eq(0)
											.html(),
										html: true,
										placement: 'auto top',
										trigger: 'hover click',
									})
							: $icon.css('cursor', '').popover('destroy');
						break;
					default:
						status === this.STATUS_INVALID
							? $errors.show()
							: $errors.hide();
						break;
				}
				$field.trigger($.Event(this.options.events.fieldStatus), {
					bv: this,
					field: field,
					element: $field,
					status: status,
				});
				this._onFieldValidated($field, validatorName);
			}
			return this;
		},
		isValid: function () {
			for (var field in this.options.fields) {
				if (!this.isValidField(field)) {
					return false;
				}
			}
			return true;
		},
		isValidField: function (field) {
			var fields = $([]);
			switch (typeof field) {
				case 'object':
					fields = field;
					field = field.attr('data-bv-field');
					break;
				case 'string':
					fields = this.getFieldElements(field);
					break;
				default:
					break;
			}
			if (
				fields.length === 0 ||
				!this.options.fields[field] ||
				this.options.fields[field].enabled === false
			) {
				return true;
			}
			var type = fields.attr('type'),
				total =
					'radio' === type || 'checkbox' === type ? 1 : fields.length,
				$field,
				validatorName,
				status;
			for (var i = 0; i < total; i++) {
				$field = fields.eq(i);
				if (this._isExcluded($field)) {
					continue;
				}
				for (validatorName in this.options.fields[field].validators) {
					if (
						this.options.fields[field].validators[validatorName]
							.enabled === false
					) {
						continue;
					}
					status = $field.data('bv.result.' + validatorName);
					if (status !== this.STATUS_VALID) {
						return false;
					}
				}
			}
			return true;
		},
		isValidContainer: function (container) {
			var that = this,
				map = {},
				$container =
					'string' === typeof container ? $(container) : container;
			if ($container.length === 0) {
				return true;
			}
			$container.find('[data-bv-field]').each(function () {
				var $field = $(this),
					field = $field.attr('data-bv-field');
				if (!that._isExcluded($field) && !map[field]) {
					map[field] = $field;
				}
			});
			for (var field in map) {
				var $f = map[field];
				if (
					$f
						.data('bv.messages')
						.find(
							'.help-block[data-bv-validator][data-bv-for="' +
								field +
								'"]'
						)
						.filter(
							'[data-bv-result="' + this.STATUS_INVALID + '"]'
						).length > 0
				) {
					return false;
				}
			}
			return true;
		},
		defaultSubmit: function () {
			if (this.$submitButton) {
				$('<input/>')
					.attr('type', 'hidden')
					.attr('data-bv-submit-hidden', '')
					.attr('name', this.$submitButton.attr('name'))
					.val(this.$submitButton.val())
					.appendTo(this.$form);
			}
			this.$form.off('submit.bv').submit();
		},
		getInvalidFields: function () {
			return this.$invalidFields;
		},
		getSubmitButton: function () {
			return this.$submitButton;
		},
		getMessages: function (field, validator) {
			var that = this,
				messages = [],
				$fields = $([]);
			switch (true) {
				case field && 'object' === typeof field:
					$fields = field;
					break;
				case field && 'string' === typeof field:
					var f = this.getFieldElements(field);
					if (f.length > 0) {
						var type = f.attr('type');
						$fields =
							'radio' === type || 'checkbox' === type
								? f.eq(0)
								: f;
					}
					break;
				default:
					$fields = this.$invalidFields;
					break;
			}
			var filter = validator
				? '[data-bv-validator="' + validator + '"]'
				: '';
			$fields.each(function () {
				messages = messages.concat(
					$(this)
						.data('bv.messages')
						.find(
							'.help-block[data-bv-for="' +
								$(this).attr('data-bv-field') +
								'"][data-bv-result="' +
								that.STATUS_INVALID +
								'"]' +
								filter
						)
						.map(function () {
							var v = $(this).attr('data-bv-validator'),
								f = $(this).attr('data-bv-for');
							return that.options.fields[f].validators[v]
								.enabled === false
								? ''
								: $(this).html();
						})
						.get()
				);
			});
			return messages;
		},
		updateOption: function (field, validator, option, value) {
			if ('object' === typeof field) {
				field = field.attr('data-bv-field');
			}
			if (
				this.options.fields[field] &&
				this.options.fields[field].validators[validator]
			) {
				this.options.fields[field].validators[validator][
					option
				] = value;
				this.updateStatus(field, this.STATUS_NOT_VALIDATED, validator);
			}
			return this;
		},
		addField: function (field, options) {
			var fields = $([]);
			switch (typeof field) {
				case 'object':
					fields = field;
					field = field.attr('data-bv-field') || field.attr('name');
					break;
				case 'string':
					delete this._cacheFields[field];
					fields = this.getFieldElements(field);
					break;
				default:
					break;
			}
			fields.attr('data-bv-field', field);
			var type = fields.attr('type'),
				total =
					'radio' === type || 'checkbox' === type ? 1 : fields.length;
			for (var i = 0; i < total; i++) {
				var $field = fields.eq(i);
				var opts = this._parseOptions($field);
				opts = opts === null ? options : $.extend(true, options, opts);
				this.options.fields[field] = $.extend(
					true,
					this.options.fields[field],
					opts
				);
				this._cacheFields[field] = this._cacheFields[field]
					? this._cacheFields[field].add($field)
					: $field;
				this._initField(
					'checkbox' === type || 'radio' === type ? field : $field
				);
			}
			this.disableSubmitButtons(false);
			this.$form.trigger($.Event(this.options.events.fieldAdded), {
				field: field,
				element: fields,
				options: this.options.fields[field],
			});
			return this;
		},
		removeField: function (field) {
			var fields = $([]);
			switch (typeof field) {
				case 'object':
					fields = field;
					field = field.attr('data-bv-field') || field.attr('name');
					fields.attr('data-bv-field', field);
					break;
				case 'string':
					fields = this.getFieldElements(field);
					break;
				default:
					break;
			}
			if (fields.length === 0) {
				return this;
			}
			var type = fields.attr('type'),
				total =
					'radio' === type || 'checkbox' === type ? 1 : fields.length;
			for (var i = 0; i < total; i++) {
				var $field = fields.eq(i);
				this.$invalidFields = this.$invalidFields.not($field);
				this._cacheFields[field] = this._cacheFields[field].not($field);
			}
			if (
				!this._cacheFields[field] ||
				this._cacheFields[field].length === 0
			) {
				delete this.options.fields[field];
			}
			if ('checkbox' === type || 'radio' === type) {
				this._initField(field);
			}
			this.disableSubmitButtons(false);
			this.$form.trigger($.Event(this.options.events.fieldRemoved), {
				field: field,
				element: fields,
			});
			return this;
		},
		resetField: function (field, resetValue) {
			var $fields = $([]);
			switch (typeof field) {
				case 'object':
					$fields = field;
					field = field.attr('data-bv-field');
					break;
				case 'string':
					$fields = this.getFieldElements(field);
					break;
				default:
					break;
			}
			var total = $fields.length;
			if (this.options.fields[field]) {
				for (var i = 0; i < total; i++) {
					for (var validator in this.options.fields[field]
						.validators) {
						$fields.eq(i).removeData('bv.dfs.' + validator);
					}
				}
			}
			this.updateStatus(field, this.STATUS_NOT_VALIDATED);
			if (resetValue) {
				var type = $fields.attr('type');
				'radio' === type || 'checkbox' === type
					? $fields.removeAttr('checked').removeAttr('selected')
					: $fields.val('');
			}
			return this;
		},
		resetForm: function (resetValue) {
			for (var field in this.options.fields) {
				this.resetField(field, resetValue);
			}
			this.$invalidFields = $([]);
			this.$submitButton = null;
			this.disableSubmitButtons(false);
			return this;
		},
		revalidateField: function (field) {
			this.updateStatus(field, this.STATUS_NOT_VALIDATED).validateField(
				field
			);
			return this;
		},
		enableFieldValidators: function (field, enabled, validatorName) {
			var validators = this.options.fields[field].validators;
			if (
				validatorName &&
				validators &&
				validators[validatorName] &&
				validators[validatorName].enabled !== enabled
			) {
				this.options.fields[field].validators[
					validatorName
				].enabled = enabled;
				this.updateStatus(
					field,
					this.STATUS_NOT_VALIDATED,
					validatorName
				);
			} else if (
				!validatorName &&
				this.options.fields[field].enabled !== enabled
			) {
				this.options.fields[field].enabled = enabled;
				for (var v in validators) {
					this.enableFieldValidators(field, enabled, v);
				}
			}
			return this;
		},
		getDynamicOption: function (field, option) {
			var $field =
					'string' === typeof field
						? this.getFieldElements(field)
						: field,
				value = $field.val();
			if ('function' === typeof option) {
				return $.fn.bootstrapValidator.helpers.call(option, [
					value,
					this,
					$field,
				]);
			} else if ('string' === typeof option) {
				var $f = this.getFieldElements(option);
				if ($f.length) {
					return $f.val();
				} else {
					return (
						$.fn.bootstrapValidator.helpers.call(option, [
							value,
							this,
							$field,
						]) || option
					);
				}
			}
			return null;
		},
		destroy: function () {
			var field, fields, $field, validator, $icon, group;
			for (field in this.options.fields) {
				fields = this.getFieldElements(field);
				group = this.options.fields[field].group || this.options.group;
				for (var i = 0; i < fields.length; i++) {
					$field = fields.eq(i);
					$field
						.data('bv.messages')
						.find(
							'.help-block[data-bv-validator][data-bv-for="' +
								field +
								'"]'
						)
						.remove()
						.end()
						.end()
						.removeData('bv.messages')
						.parents(group)
						.removeClass('has-feedback has-error has-success')
						.end()
						.off('.bv')
						.removeAttr('data-bv-field');
					$icon = $field.data('bv.icon');
					if ($icon) {
						var container =
							'function' ===
							typeof (
								this.options.fields[field].container ||
								this.options.container
							)
								? (
										this.options.fields[field].container ||
										this.options.container
								  ).call(this, $field, this)
								: this.options.fields[field].container ||
								  this.options.container;
						switch (container) {
							case 'tooltip':
								$icon.tooltip('destroy').remove();
								break;
							case 'popover':
								$icon.popover('destroy').remove();
								break;
							default:
								$icon.remove();
								break;
						}
					}
					$field.removeData('bv.icon');
					for (validator in this.options.fields[field].validators) {
						if ($field.data('bv.dfs.' + validator)) {
							$field.data('bv.dfs.' + validator).reject();
						}
						$field
							.removeData('bv.result.' + validator)
							.removeData('bv.response.' + validator)
							.removeData('bv.dfs.' + validator);
						if (
							'function' ===
							typeof $.fn.bootstrapValidator.validators[validator]
								.destroy
						) {
							$.fn.bootstrapValidator.validators[
								validator
							].destroy(
								this,
								$field,
								this.options.fields[field].validators[validator]
							);
						}
					}
				}
			}
			this.disableSubmitButtons(false);
			this.$hiddenButton.remove();
			this.$form
				.removeClass(this.options.elementClass)
				.off('.bv')
				.removeData('bootstrapValidator')
				.find('[data-bv-submit-hidden]')
				.remove()
				.end()
				.find('[type="submit"]')
				.off('click.bv');
		},
	};
	$.fn.bootstrapValidator = function (option) {
		var params = arguments;
		return this.each(function () {
			var $this = $(this),
				data = $this.data('bootstrapValidator'),
				options = 'object' === typeof option && option;
			if (!data) {
				data = new BootstrapValidator(this, options);
				$this.data('bootstrapValidator', data);
			}
			if ('string' === typeof option) {
				data[option].apply(data, Array.prototype.slice.call(params, 1));
			}
		});
	};
	$.fn.bootstrapValidator.DEFAULT_OPTIONS = {
		autoFocus: true,
		container: null,
		elementClass: 'bv-form',
		events: {
			formInit: 'init.form.bv',
			formError: 'error.form.bv',
			formSuccess: 'success.form.bv',
			fieldAdded: 'added.field.bv',
			fieldRemoved: 'removed.field.bv',
			fieldInit: 'init.field.bv',
			fieldError: 'error.field.bv',
			fieldSuccess: 'success.field.bv',
			fieldStatus: 'status.field.bv',
			validatorError: 'error.validator.bv',
			validatorSuccess: 'success.validator.bv',
		},
		excluded: [':disabled', ':hidden', ':not(:visible)'],
		feedbackIcons: {
			valid: null,
			invalid: null,
			validating: null,
		},
		fields: null,
		group: '.form-group',
		live: 'enabled',
		message: 'This value is not valid',
		submitButtons: '[type="submit"]',
		threshold: null,
		verbose: true,
	};
	$.fn.bootstrapValidator.validators = {};
	$.fn.bootstrapValidator.i18n = {};
	$.fn.bootstrapValidator.Constructor = BootstrapValidator;
	$.fn.bootstrapValidator.helpers = {
		call: function (functionName, args) {
			if ('function' === typeof functionName) {
				return functionName.apply(this, args);
			} else if ('string' === typeof functionName) {
				if ('()' === functionName.substring(functionName.length - 2)) {
					functionName = functionName.substring(
						0,
						functionName.length - 2
					);
				}
				var ns = functionName.split('.'),
					func = ns.pop(),
					context = window;
				for (var i = 0; i < ns.length; i++) {
					context = context[ns[i]];
				}
				return typeof context[func] === 'undefined'
					? null
					: context[func].apply(this, args);
			}
		},
		format: function (message, parameters) {
			if (!$.isArray(parameters)) {
				parameters = [parameters];
			}
			for (var i in parameters) {
				message = message.replace('%s', parameters[i]);
			}
			return message;
		},
		date: function (year, month, day, notInFuture) {
			if (isNaN(year) || isNaN(month) || isNaN(day)) {
				return false;
			}
			if (day.length > 2 || month.length > 2 || year.length > 4) {
				return false;
			}
			day = parseInt(day, 10);
			month = parseInt(month, 10);
			year = parseInt(year, 10);
			if (year < 1000 || year > 9999 || month <= 0 || month > 12) {
				return false;
			}
			var numDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
				numDays[1] = 29;
			}
			if (day <= 0 || day > numDays[month - 1]) {
				return false;
			}
			if (notInFuture === true) {
				var currentDate = new Date(),
					currentYear = currentDate.getFullYear(),
					currentMonth = currentDate.getMonth(),
					currentDay = currentDate.getDate();
				return (
					year < currentYear ||
					(year === currentYear && month - 1 < currentMonth) ||
					(year === currentYear &&
						month - 1 === currentMonth &&
						day < currentDay)
				);
			}
			return true;
		},
		luhn: function (value) {
			var length = value.length,
				mul = 0,
				prodArr = [
					[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
					[0, 2, 4, 6, 8, 1, 3, 5, 7, 9],
				],
				sum = 0;
			while (length--) {
				sum += prodArr[mul][parseInt(value.charAt(length), 10)];
				mul ^= 1;
			}
			return sum % 10 === 0 && sum > 0;
		},
		mod11And10: function (value) {
			var check = 5,
				length = value.length;
			for (var i = 0; i < length; i++) {
				check =
					((((check || 10) * 2) % 11) +
						parseInt(value.charAt(i), 10)) %
					10;
			}
			return check === 1;
		},
		mod37And36: function (value, alphabet) {
			alphabet = alphabet || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			var modulus = alphabet.length,
				length = value.length,
				check = Math.floor(modulus / 2);
			for (var i = 0; i < length; i++) {
				check =
					((((check || modulus) * 2) % (modulus + 1)) +
						alphabet.indexOf(value.charAt(i))) %
					modulus;
			}
			return check === 1;
		},
	};
})(window.jQuery);
(function ($) {
	$.fn.bootstrapValidator.i18n.emailAddress = $.extend(
		$.fn.bootstrapValidator.i18n.emailAddress || {},
		{
			default: 'Vui lòng nhập giá trị',
		}
	);
	$.fn.bootstrapValidator.validators.emailAddress = {
		html5Attributes: {
			message: 'message',
			multiple: 'multiple',
			separator: 'separator',
		},
		enableByHtml5: function ($field) {
			return 'email' === $field.attr('type');
		},
		validate: function (validator, $field, options) {
			var value = $field.val();
			if (value === '') {
				return true;
			}
			var emailRegExp = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
				allowMultiple =
					options.multiple === true || options.multiple === 'true';
			if (allowMultiple) {
				var separator = options.separator || /[,;]/,
					addresses = this._splitEmailAddresses(value, separator);
				for (var i = 0; i < addresses.length; i++) {
					if (!emailRegExp.test(addresses[i])) {
						return false;
					}
				}
				return true;
			} else {
				return emailRegExp.test(value);
			}
		},
		_splitEmailAddresses: function (emailAddresses, separator) {
			var quotedFragments = emailAddresses.split(/"/),
				quotedFragmentCount = quotedFragments.length,
				emailAddressArray = [],
				nextEmailAddress = '';
			for (var i = 0; i < quotedFragmentCount; i++) {
				if (i % 2 === 0) {
					var splitEmailAddressFragments = quotedFragments[i].split(
							separator
						),
						splitEmailAddressFragmentCount =
							splitEmailAddressFragments.length;
					if (splitEmailAddressFragmentCount === 1) {
						nextEmailAddress += splitEmailAddressFragments[0];
					} else {
						emailAddressArray.push(
							nextEmailAddress + splitEmailAddressFragments[0]
						);
						for (
							var j = 1;
							j < splitEmailAddressFragmentCount - 1;
							j++
						) {
							emailAddressArray.push(
								splitEmailAddressFragments[j]
							);
						}
						nextEmailAddress =
							splitEmailAddressFragments[
								splitEmailAddressFragmentCount - 1
							];
					}
				} else {
					nextEmailAddress += '"' + quotedFragments[i];
					if (i < quotedFragmentCount - 1) {
						nextEmailAddress += '"';
					}
				}
			}
			emailAddressArray.push(nextEmailAddress);
			return emailAddressArray;
		},
	};
})(window.jQuery);
(function ($) {
	$.fn.bootstrapValidator.i18n.identical = $.extend(
		$.fn.bootstrapValidator.i18n.identical || {},
		{
			default: 'Please enter the same value',
		}
	);
	$.fn.bootstrapValidator.validators.identical = {
		html5Attributes: {
			message: 'message',
			field: 'field',
		},
		validate: function (validator, $field, options) {
			var value = $field.val();
			if (value === '') {
				return true;
			}
			var compareWith = validator.getFieldElements(options.field);
			if (compareWith === null || compareWith.length === 0) {
				return true;
			}
			if (value === compareWith.val()) {
				validator.updateStatus(
					options.field,
					validator.STATUS_VALID,
					'identical'
				);
				return true;
			} else {
				return false;
			}
		},
	};
})(window.jQuery);
(function ($) {
	$.fn.bootstrapValidator.i18n.notEmpty = $.extend(
		$.fn.bootstrapValidator.i18n.notEmpty || {},
		{
			default: 'Vui lòng nhập giá trị',
		}
	);
	$.fn.bootstrapValidator.validators.notEmpty = {
		enableByHtml5: function ($field) {
			var required = $field.attr('required') + '';
			return 'required' === required || 'true' === required;
		},
		validate: function (validator, $field, options) {
			var type = $field.attr('type');
			if ('radio' === type || 'checkbox' === type) {
				return (
					validator
						.getFieldElements($field.attr('data-bv-field'))
						.filter(':checked').length > 0
				);
			}
			if (
				'number' === type &&
				$field.get(0).validity &&
				$field.get(0).validity.badInput === true
			) {
				return true;
			}
			return $.trim($field.val()) !== '';
		},
	};
})(window.jQuery);
(function ($) {
	$.fn.bootstrapValidator.i18n.numeric = $.extend(
		$.fn.bootstrapValidator.i18n.numeric || {},
		{
			default: 'Please enter a valid float number',
		}
	);
	$.fn.bootstrapValidator.validators.numeric = {
		html5Attributes: {
			message: 'message',
			separator: 'separator',
		},
		enableByHtml5: function ($field) {
			return (
				'number' === $field.attr('type') &&
				$field.attr('step') !== undefined &&
				$field.attr('step') % 1 !== 0
			);
		},
		validate: function (validator, $field, options) {
			if (
				this.enableByHtml5($field) &&
				$field.get(0).validity &&
				$field.get(0).validity.badInput === true
			) {
				return false;
			}
			var value = $field.val();
			if (value === '') {
				return true;
			}
			var separator = options.separator || '.';
			if (separator !== '.') {
				value = value.replace(separator, '.');
			}
			return !isNaN(parseFloat(value)) && isFinite(value);
		},
	};
})(window.jQuery);
(function ($) {
	$.fn.bootstrapValidator.i18n.stringLength = $.extend(
		$.fn.bootstrapValidator.i18n.stringLength || {},
		{
			default: 'Please enter a value with valid length',
			less: 'Please enter less than %s characters',
			more: 'Please enter more than %s characters',
			between: 'Please enter value between %s and %s characters long',
		}
	);
	$.fn.bootstrapValidator.validators.stringLength = {
		html5Attributes: {
			message: 'message',
			min: 'min',
			max: 'max',
			trim: 'trim',
			utf8bytes: 'utf8Bytes',
		},
		enableByHtml5: function ($field) {
			var options = {},
				maxLength = $field.attr('maxlength'),
				minLength = $field.attr('minlength');
			if (maxLength) {
				options.max = parseInt(maxLength, 10);
			}
			if (minLength) {
				options.min = parseInt(minLength, 10);
			}
			return $.isEmptyObject(options) ? false : options;
		},
		validate: function (validator, $field, options) {
			var value = $field.val();
			if (options.trim === true || options.trim === 'true') {
				value = $.trim(value);
			}
			if (value === '') {
				return true;
			}
			var min = $.isNumeric(options.min)
					? options.min
					: validator.getDynamicOption($field, options.min),
				max = $.isNumeric(options.max)
					? options.max
					: validator.getDynamicOption($field, options.max),
				utf8Length = function (str) {
					var s = str.length;
					for (var i = str.length - 1; i >= 0; i--) {
						var code = str.charCodeAt(i);
						if (code > 0x7f && code <= 0x7ff) {
							s++;
						} else if (code > 0x7ff && code <= 0xffff) {
							s += 2;
						}
						if (code >= 0xdc00 && code <= 0xdfff) {
							i--;
						}
					}
					return s;
				},
				length = options.utf8Bytes ? utf8Length(value) : value.length,
				isValid = true,
				message =
					options.message ||
					$.fn.bootstrapValidator.i18n.stringLength['default'];
			if (
				(min && length < parseInt(min, 10)) ||
				(max && length > parseInt(max, 10))
			) {
				isValid = false;
			}
			switch (true) {
				case !!min && !!max:
					message = $.fn.bootstrapValidator.helpers.format(
						options.message ||
							$.fn.bootstrapValidator.i18n.stringLength.between,
						[parseInt(min, 10), parseInt(max, 10)]
					);
					break;
				case !!min:
					message = $.fn.bootstrapValidator.helpers.format(
						options.message ||
							$.fn.bootstrapValidator.i18n.stringLength.more,
						parseInt(min, 10)
					);
					break;
				case !!max:
					message = $.fn.bootstrapValidator.helpers.format(
						options.message ||
							$.fn.bootstrapValidator.i18n.stringLength.less,
						parseInt(max, 10)
					);
					break;
				default:
					break;
			}
			return { valid: isValid, message: message };
		},
	};
})(window.jQuery);
