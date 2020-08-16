$(document).ready(function () {

    function remove_hash_from_url() {
        var uri = window.location.toString();
        if (uri.indexOf("#") > 0) {
            var clean_uri = uri.substring(0, uri.indexOf("#"));
            window.history.replaceState({}, document.title, clean_uri);
        }
    }
    App.UI.addRules();
    App.UI.inputAllowNumber("input[name='phone']");
    var formLogin = null;
    var formLoginQuickly = null;
    var formRegister = $("#form-register");
    var modalLogin = $("#popup-login");
    var modalRegister = $("#popup-signup");
    var currenHash = null;
    if(window.location.hash) {
        currenHash = window.location.hash;
        if(currenHash.search('#login')>=0){
            $("#popup-login").modal('show');
            remove_hash_from_url();
        }
        if(currenHash=='#course-not-finish'){
            App.UI.Error('Bạn chưa hoàn thành xong khóa học, Bạn chỉ gửi BĐS sau khi hoàn thành xong khóa học đã đăng ký');
            remove_hash_from_url();
        }
        if(currenHash=='#not-agent'){
            App.UI.Error(messages.dangtinmoigioi_notagent);
            remove_hash_from_url();
        }
        if(currenHash=='#stop-cooperation'){
            App.UI.Error(messages.dangtinmoigioi_stop_cooperation);
            remove_hash_from_url();
        }
        if(currenHash=='#not-active'){
            App.UI.Confirm('Tài khoản của bạn chưa chưa được kích hoạt, Hãy kích hoạt tài khoản để gửi BĐS',function () {
                location.href='/xac-nhan-tai-khoan';
            });    
            remove_hash_from_url();
        }
    }
    // $(".span-eyes").mouseup(function () {
    //     $(this).prev().attr('type','password');
    // }).mousedown(function(e){
    //     $(this).prev().attr('type','text');
	// });
	
	modalLogin.click(function() {
		$('body').removeClass('showModal');
	});

    function facebook_login(data) {
        if(OneSignal.initialized){
            OneSignal.getUserId(function(id)
            {
                if(id){
                    doLoginFb(data, id);
                }else{
                    doLoginFb(data, null);                    
                }
            });
        }else{
            doLoginFb(data, null);                
        }
    };
    
    var doLoginFb = function(data, device_token){
        var data_login = {
            "deviceToken": device_token,
            "osName": "BROWSER",
            "deviceName": null,
            "versionName": "11.1.4",
            "type": "facebook",
            "facebookUid": data.id,
            "appId": '535618670209689',
            "formIdMailChimp": 1686
        };
        //console.log(data_login);
        App.Feature.Post('/api/login', data_login, function (response) {
            if (response.result && response.code==200) {
                location.href = '/';
            } else {
                App.UI.Confirm(response.message + "! Bạn có muốn tiếp tục đăng ký tài khoản", function () {
                    $("#popup-login").modal("hide");
                    $("#popup-signup").modal("show");
                });
            }
        }, true);
    };
    
    function login_normal(formLogin){
        var checkResult = App.UI.checkValidRules(formLogin,{
            acount: {
                validators: {
                    isAcount: {
                        message: messages.dangnhap_phoneemail_wrongformat
                    }
                }
            }, password: {
                validators: {
                    notEmpty: {
                        message: messages.dangnhap_matkhau_empty
                    }
                }
            }
        });
        
        if (checkResult) {
            if(OneSignal.initialized){
                OneSignal.getUserId(function(id)
                {
                    if(id){
                        doLogin(formLogin, checkResult, id);
                    }else{
                        doLogin(formLogin, checkResult, null);                    
                    }
                });
            }else{
                doLogin(formLogin, checkResult, null);                
            }
        }
    }
    
    var doLogin = function(formLogin, checkResult, device_token){
        let dataSend = {
            "deviceToken": device_token,
            "name": "Portal Site",
            "wantToBeAgent": true,
            "type": "normal",
            "phone": App.UI.isValidPhone(checkResult.acount.trim()) ? checkResult.acount.trim() : null,
            "email": App.UI.isValidEmail(checkResult.acount.trim()) ? checkResult.acount.trim() : null,
            "osName": "BROWSER",
            "deviceName": "iphone 4",
            "versionName": "11.4.1",
            "password": checkResult.password,
            "remenber_pass": typeof checkResult.remenber_pass != 'undefined' ? 1 : 0,
            "formIdMailChimp": 1686
        };
        //console.log(dataSend);
        App.Feature.Post('/api/login', dataSend, function (response) {
            /* Hook callback for login */
            if(formLogin.data('redirect')=='callBack'){
                if(typeof formLogin.data('callBack')=='function')
                    formLogin.data('callBack').apply({
                        code:response.code,
                        currentHash:currenHash,
                        formLogin:formLogin
                    });
            }
            if (response.code == 402) {
                $('#popup-login').modal('hide');
                if(window.location.pathname == '/dang-tin'){
                    $('#popup-info-quickly').modal('hide');
                }
                App.UI.Confirm(messages.dangnhap_phoneemail_inactive, function () {
                    location.href = '/xac-nhan-tai-khoan';
                });
            } else if (response.code == 200) {
                /* Check data redirect of popup-login reload or home or  orther redirect */
                if(formLogin.data('redirect')=='callBack'){
                    if(typeof formLogin.data('callBack')=='function')
                        formLogin.data('callBack').call();
                    else
                        console.log('Callback not function');
                } else if(currenHash && currenHash.search("#login=/")!=-1)
                    location.href= currenHash.split("=").length!=0 ? currenHash.split("=")[1] : "/";
                else if(formLogin.data('redirect')=='reload' || !formLogin.data('redirect'))
                    location.reload();
                else if(formLogin.data('redirect')=='home')
                    location.href='/';
                else
                    location.href=formLogin.data('redirect');
            } else {
                if(formLogin.selector == '#form-normal-post-quickly'){
                    App.UI.ShowFormMessage('#popup-info-quickly', response.message, App.UI.notiTypeError);
                } else {
                    App.UI.ShowFormMessage('#popup-login', response.message, App.UI.notiTypeError);
                }
            }
        },true);
    };

    function facebook_register(data) {
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem("info_user_facebook", JSON.stringify(data));
            location.href = "/xac-nhan-tai-khoan-facebook";
        } else {
            console.log("Trình duyệt của bạn không hỗ trợ, Vui lòng nâng cấp trình duyệt để sử dụng dịch vụ");
        }
    }

    function facebook_get_user(connnect, action) {
        if (connnect.status === 'connected') {
            FB.api('/me', {fields: 'id,name,first_name,last_name,picture,verified,email'}, function (response) {
                if (response && action && action == 'login') {
                    facebook_login(response);
                } else if (response && action && action == 'register') {
                    response.type_user = connnect.type_user;
                    facebook_register(response);
                } else {
                    console.log('Không có hành động');
                }
                return false;
            });
        } else {
            console.log("Connect facebook không thành công");
        }
    }

    $(document).on("click", "#login-facebook, .btn-login-fb", function(){
        FB.login(function (response) {
            facebook_get_user(response, 'login');
        }, {scope: 'email'});
    });

    $(document).on("click", "#login-normal", function(){
        if(formLogin==null){
            formLogin = $("#form-login");
        }
        login_normal(formLogin);
    });

    $("#form-login input[name='acount'], #form-login input[name='password']").keypress(function(e) {
        if (e.which == 13) {
            e.preventDefault();
            login_normal(formLogin);
        }
    });

    $(document).on('click', '#login-normal-post-quickly', function(){
        if(formLoginQuickly==null){
            formLoginQuickly = $("#form-normal-post-quickly");
        }
        login_normal(formLoginQuickly);
    });

    $(document).on('click', '#register-facebook', function(){
        var type_user = $("#popup-signup input[name='procedureTypeId']:checked").val();
        FB.login(function (response) {
            response.type_user = type_user;
            facebook_get_user(response, 'register');
        }, {scope: 'email'});
    });
    var clickSubmit = false;
    $("#register-normal").parents("form").submit(function(e){
        e.preventDefault();
        if(!clickSubmit){
            $("#register-normal").click();
        }
        clickSubmit =false;
    });
    
    $(document).on('click', '#register-normal', function(){
        clickSubmit = true;
        formRegister.removeData("bootstrapValidator");
        var checkResult = App.UI.checkValidRules($('#form-register'), {
            fullname: {
                validators: {
                    notEmpty: {
                        message: messages.dangky_name_empty
                    }
                }
            }, phone: {
                validators: {
                    notEmpty: {
                        message: messages.dangky_phone_empty
                    },
                    stringLength: {
                        message: messages.dangky_phone_wrongformat, min: 10, max: 10
                    }
                }
            }, email: {
                validators: {
                    emailAddress:{
                        message: messages.dangky_email_wrongformat
                    }
                }
            }, password: {
                validators: {
                    notEmpty: {
                        message: messages.dangky_matkhau_empty
                    },
                    stringLength: {
                        message: messages.dangky_matkhau_wrongformat,
                        min: 6,
                        max: 20
                    }
                }
            }
        });
        if (checkResult) {
            if(OneSignal.initialized){
                OneSignal.getUserId(function(id)
                {
                    if(id){
                        doRegister(checkResult, id);
                    }else{
                        doRegister(checkResult, null);                    
                    }
                });
            } else {
                doRegister(checkResult, null);                
            }
        } else {
            return false;
        }
    });
    
    var doRegister = function(checkResult, device_token){
        var type_user = $("#popup-signup input[name='procedureTypeId']:checked").val();
        var dataSend = {
            "deviceToken": device_token,
            "name": checkResult.fullname,
            "wantToBeAgent": !!parseInt(type_user),
            "type": "normal",
            "phone": checkResult.phone,
            "email": checkResult.email,
            "osName": "BROWSER",
            "deviceName": null,
            "versionName": "11.4.1",
            "password": checkResult.password,
            "formIdMailChimp": 1685
        };
        //console.log(dataSend);
        App.Feature.Post('/api/register', dataSend, function (response) {
            formRegister.modal("hide");
            if (response.result && response.code) {
                location.href = '/xac-nhan-tai-khoan';
            } else if (response.code == 402) {
                $('#popup-signup').modal('hide');
                App.UI.Confirm(messages.dangnhap_phoneemail_inactive, function () {
                    location.href = '/xac-nhan-tai-khoan';
                });
            } else if(response.code == 201){
                /* Tài khoản đã tồn tại */
                App.UI.Confirm(messages.dangkyfacebook_facebook_actived, function () {
                    $("#popup-signup").modal("hide");
                    $("#popup-login").modal("show"); 
                });
            } else {
                App.UI.ShowFormMessage('#popup-signup', response.message, App.UI.notiTypeError);
            }
        },true);
    };
    
    var checkValidForm = function(form) {
        form.removeData('bootstrapValidator');
        form.bootstrapValidator( {
            message:"Giá trị chưa đúng", excluded:[":hidden"], feedbackIcons: {
                valid: "glyphicon glyphicon-ok", invalid: "glyphicon glyphicon-remove", validating: "glyphicon glyphicon-refresh"
            }, 
            fields: {
                user_pass_old: {
                    validators: {
                        notEmpty: {
                            message: 'Vui lòng nhập mật khẩu cũ của bạn'
                        },
                        stringLength: {
                            message: "Mật khẩu từ 6 đến 20 ký tự", min: 6, max: 20
                        }
                    }
                },
                user_pass: {
                    validators: {
                        notEmpty: {
                            message: 'Vui lòng nhập mật khẩu mới'
                        },
                        stringLength: {
                            message: "Mật khẩu từ 6 đến 20 ký tự", min: 6, max: 20
                        }
                    }
                },
                user_repass: {
                    validators: {
                        notEmpty: {
                            message: 'Vui lòng nhập xác nhận mật khẩu'
                        },
                        stringLength: {
                            message: "Mật khẩu từ 6 đến 20 ký tự", min: 6, max: 20
                        },
                        identical: {
                            field: 'user_pass',
                            message: 'Mật khẩu không trùng khớp'
                        }
                    }
                }
            }
        });
        var bootstrapValidator = form.data('bootstrapValidator');
        bootstrapValidator.validate();
        return bootstrapValidator.isValid();
    };
    
    $(document).on('click', '#save-user-change-pass', function(){
        var curForm = $(this).closest("#form-user-change-pass");
        if(!checkValidForm(curForm)) {
            return false;
        }
        var oldPassword = $('#user_pass_old').val();
        var newPassword = $('#user_pass').val();
        var dataSend = {};
        dataSend.oldPassword = oldPassword;
        dataSend.newPassword = newPassword;
        console.log(dataSend);
        //
        App.Feature.Post("/api/user-change-password", dataSend, function (response) {
            if (response.result) {
                $('#popup-user-change-pass').modal('hide');
                App.UI.Info('Thay đổi mật khẩu mới thành công');
                $('#modal-info').on('hide.bs.modal',function () {
                    $('.modal-backdrop.fade').hide();
                });
            } else {
                App.UI.ShowFormMessage('#popup-user-change-pass', response.message, App.UI.notiTypeError);
            }
        });
    });
    
    $(document).on('click', '#sign-out', function(){
        if(OneSignal.initialized){
            OneSignal.getUserId(function(id)
            {
                if(id){
                    doSignout(id);
                }else{
                    doSignout(null);
                }
            });
        } else {
            doSignout(null);
        }
    });
});

var doSignout = function(device_token){
    var dataPost = {};
    dataPost.deviceToken = device_token;
    dataPost.osName = 'BROWSER';
    console.log(dataPost);
    App.Feature.Post('/api/logout', dataPost, function (response) {
        console.log(response);
        if(response.result){
            console.log('Thành công');
            location.href = '/dang-xuat';
        } else {
            location.href = '/dang-xuat';
        }
    });
};

// user change pass
var userChangePass = function(){
    $('#popup-user-change-pass').modal();
};