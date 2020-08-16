if (typeof App !== "object") { 
    App = {};
}

App.UI = {
    notiTypeError:"error",
    notiTypeSuccess: "success",
    isMobile: function(){
        if($("body.page-mobile").length > 0 || $("body.page-ipad").length >0)
            return true;
        return false;
    },
	showAllSpecialSearch : function(){
		$(".ul-listing > li:hidden").fadeIn();
		$(".ul-listing > li.more").remove();
	},
	inputAllowNumber: function(input, allowSeparator){
        allowSeparator = (typeof allowSeparator !== 'undefined' ? allowSeparator : true);
        if($.isArray(input)) {
            $.each(input,function(index,element) {
                $(element).on('input', function () {
                    var text = $(this).val().match(/[\d]/g);
                    if(allowSeparator)
                    	var text = $(this).val().match(/[\d\.]/g);
                    text = !!text ? text.join("") : "";
                    $(this).val(text);
                });
            });
        }else{
            $(input).on('input', function () {
                var text = $(this).val().match(/[\d]/g);
                if(allowSeparator)
                    var text = $(this).val().match(/[\d\.]/g);
                text = !!text ? text.join("") : "";
                $(this).val(text);
            });
		}
	},
	isValidEmail : function(email) {
	  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	  return re.test(email);
	},
    isValidPhone(phone) {
        var filter = /^[0-9]+$/;
        var validPhone = true;
        if (!filter.test(phone)) {
            validPhone = false;
        } else if (phone.length > 15) {
            validPhone = false;
        }
        return validPhone;
    },
    validatePhone(txtPhone) {
        var filter = /^((\+[1-9]{1,4}[ \-]*)|(\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?$/;
        if((filter.test(txtPhone) && txtPhone.length == 10)) {
            return true;
        } else {
            return false;
        }
    },
    objectifyForm: function (form) {
        var formArray = form.serializeArray();
        var returnArray = {};
        for (var i = 0; i < formArray.length; i++){
            var name  = formArray[i]['name'].replace("-", "_");
            if(name.indexOf("[]")!== -1) {
                name = name.replace("[]", "");
                if (typeof returnArray[name] == "undefined") {
                    returnArray[name] = [formArray[i]['value']];
                } else {
                    var array = [];
                    if(Array.isArray(returnArray[name])){
                        returnArray[name].push(formArray[i]['value']);
                        array = returnArray[name];
                    }else{
                        array.push(returnArray[name]);
                        array.push(formArray[i]['value']);
                    }
                    returnArray[name] = array;
                }
            }else{
                returnArray[name] = formArray[i]['value'];
            }

        }
        return returnArray;
    },
    checkValidForm:function(form) {
        var bootstrapValidator = form.data('bootstrapValidator');
        bootstrapValidator.validate();
        return bootstrapValidator.isValid();
    },
    checkValidRules:function (form,rules) {
        if(!form || !rules){
            return;
        }
        form.bootstrapValidator({
            message: "Giá trị chưa đúng",
            feedbackIcons: {
                valid: false,
                invalid: "glyphicon glyphicon-remove",
                validating: "glyphicon glyphicon-refresh"
            },
            fields: rules
        });
        return App.UI.checkValidForm(form) ? App.UI.objectifyForm(form):false;
    },
    addRules:function () {
        $.fn.bootstrapValidator.validators.isEmail = {
            validate: function (validator, $field, options) {
                return App.UI.isValidEmail($field.val()) ? true : false;
            }
        };
        $.fn.bootstrapValidator.validators.isPhone = {
            validate: function (validator, $field, options) {
                return App.UI.validatePhone($field.val());
            }
        };
        $.fn.bootstrapValidator.validators.isAcount = {
            validate: function (validator, $field, options) {
                return (App.UI.validatePhone($field.val().trim()) || App.UI.isValidEmail($field.val().trim()));
            }
        };
        $.fn.bootstrapValidator.validators.samePassword = {
            validate: function (validator, $re_pass, options) {
                var password = validator.$form.find("input").eq(3);
                var re_password = validator.$form.find("input").eq(4);
                if (password.val().length!=0 && re_password.val().length!=0 && password && re_password && password.val() === re_password.val()) {
                    return true;
                }
                return false;
            }
        };  
    },
    removeCheckSuccess: function (form, eleName) {
        $(form).on('success.field.bv', function (e, data) {
            $.each(eleName, function (idex, ele) {
                if (data.field == ele && data.element.val()=="") {
                    data.element.next().removeClass('glyphicon glyphicon-ok');
                    data.element.next().parents('.has-feedback').removeClass('has-success');
                }
            });
        });
    },
	checkAlpha: function (input) {
		if($.isArray(input)){
            $.each(input,function(idex,element){
                $(element).on('input',function(){
                    var text=$(this).val();
                    $(this).val(text.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ''));
                });
            });
		}else{
            $(input).on('input',function(){
                var text=$(this).val();
                $(this).val(text.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ''));
            });
		}
    },
	Error: function(message, completed) {
		$("#modal-error .modal-body > p").text(message);
		$('#modal-error').unbind('hidden.bs.modal').off('hidden.bs.modal').css({'zIndex':parseInt($(".modal.in").css("z-index")) ? parseInt($(".modal.in").css("z-index")) +1:1050});
		if(typeof completed == "function") {
			$('#modal-error').on('hidden.bs.modal', completed);
		}
        setTimeout(function(){ $('#modal-error').modal({
            keyboard: false
        }); },200);
	},
    ShowFormMessage: function(container, message, type='error'){
        var html = '';
        html+= '<div class="modal-header flash-message">';
            html+= '<p class="modal-title '+type+'">'+message+'</p>';
        html+= '</div>';
        $(container).find('.modal-content').prepend(html);
        setTimeout(function(){
            $(container).find(".flash-message").remove();
        }, 5000);
    },
	Info: function(message, completed) {
		$("#modal-info .modal-body > p").text(message);
		$('#modal-info').unbind('hidden.bs.modal').off('hidden.bs.modal').css({'zIndex':parseInt($(".modal.in").css("z-index")) ? parseInt($(".modal.in").css("z-index")) +1:1050});
		if(typeof completed == "function") {
			$('#modal-info').on('hidden.bs.modal', completed);
		}
        setTimeout(function(){ $('#modal-info').modal({
            keyboard: false
        }); },200);
		
	},
	Done: function(message, completed) {
		$("#modal-done .modal-body > p").text(message);
		$('#modal-done').off('hidden.bs.modal').css({'zIndex':parseInt($(".modal.in").css("z-index")) ? parseInt($(".modal.in").css("z-index")) +1:1050});
		if(typeof completed == "function") {
			$('#modal-done').on('hidden.bs.modal', completed);
		}
        setTimeout(function(){ $('#modal-done').modal({
            keyboard: false
        }); },200);
	},
	Confirm: function(message, done, cancel) {
		$("#modal-confirm .modal-body > p").text(message);

		$('#modal-confirm').off('hidden.bs.modal').css({'zIndex':parseInt($(".modal.in").css("z-index")) ? parseInt($(".modal.in").css("z-index")) +1:1050});
        console.log(parseInt($(".modal.in").css("z-index"))+1);
		$('#modal-confirm .btn-save').off('click');

		if(typeof done == "function") {
			$("#modal-confirm .btn-save").click(function(){
				done();
                $('#modal-confirm').modal('hide');
			});
		}
        setTimeout(function(){ $('#modal-confirm').modal({
            keyboard: false
        }); },200);
	},
	CustomModal: function(target, message, completed) {
        $("#" + target + " .modal-body > p").text(message);
        $("#" + target).off('hidden.bs.modal');
        if(typeof completed == "function") {
            $("#" + target).on('hidden.bs.modal', completed);
        }
        setTimeout(function(){ $("#" + target).modal({
            backdrop: 'static',
            keyboard: false
        }); },200);
    },
    ImageModal: function(src, completed) {
        $("#image-done-src").attr('src',src);
        $("#image-done").off('hidden.bs.modal');
        if(!!completed) {
            $("#image-done").on('hidden.bs.modal', completed);
        }
        setTimeout(function(){
            $("#image-done").modal({
                backdrop: 'static',
                keyboard: true
            });
            $("#image-done").on('hidden.bs.modal');
        },200);
    },
    showLoadding: function(option_loading) {
	    var defaults = {
	        text:'Đang tải...',
            background:'#ffffff',
            opacity:0.5
        };
        var settings = $.extend({}, defaults, option_loading);
        $("#loadding-ajax .text").text(settings.text);
        $("#loadding-ajax").show();
    },
    hideLoadding: function() {
        $("#loadding-ajax").hide();
    }
};