if (typeof App !== "object") { 
    App = {};
}

var openServiceTab = function(params){
    var params=params||{};
    var hash = window.location.hash;
    if(params.defaultHash){
            hash = params.defaultHash;
    }
    $(".bl-services-info a[href='"+hash+"']").click();
    if(params.scrollBody==undefined || params.scrollBody==true){
        $('html, body').animate({scrollTop: 460 }, 1000);                 
    }
};

App.Feature = {
	checkValidJson : function(text){
        if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
            return true;
        } else {
            return false;
        }
    },
	slugify : function(str) {
		return str.toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
	},
	gotoService: function(pageHash){
		if(location.href.indexOf("/dich-vu") > -1){
			location.hash = "#"+pageHash;
            openServiceTab();
		}
		else {
			location.href = "/dich-vu#" + pageHash;
		}
		// return false;
	},
	loadScripts: function(scripts, callback, version){
		var count = 0;
		for (var i = 0; i < scripts.length; i++) {
			var name = scripts[i];
			if(version) {
				name += "?v="+version;
			}
			var s,r,t;
		  s = document.createElement('script');
		  s.type = 'text/javascript';
		  s.src = name;
		  s.onload = s.onreadystatechange = function() {
		    if ( (!this.readyState || this.readyState == 'complete') )
		    {
		      count++;
		      if(count == scripts.length) {
		      	callback();
		      }
		    }
		  };
		  t = document.getElementsByTagName('script')[0];
		  t.parentNode.insertBefore(s, t);
		}
	},
    setCookie : function(cname, cvalue, exdays) {
	    var d = new Date();
        exdays = typeof exdays == 'undefined' ? 10000 : exdays;
	    d.setTime(d.getTime() + (exdays*24*60*60*1000));
	    var expires = "expires="+d.toUTCString();
	    document.cookie = cname + "=" + cvalue + "; " + expires+ "; path = /";
	},
	getCookie : function(cname) {
	    var name = cname + "=";
	    var ca = document.cookie.split(';');
	    for(var i=0; i<ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0)==' ') c = c.substring(1);
	        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
	    }
	    return "";
	},
    Get: function(url, callback, showLoad) {
		$.ajax({
	        type: "GET",
	        url: url,
	        contentType: "application/json;charset=utf-8",
            beforeSend: function () {
	        	if(showLoad) {
                    App.UI.showLoadding(showLoad);
                }
            },
	        success: function(response) {
	            callback(response);
                if(showLoad)
                    App.UI.hideLoadding();
	        },
	        error: function(xhr, ajaxOptions, thrownError) {
	        	if(showLoad)
                    App.UI.hideLoadding();
                App.UI.Error("Đã có lỗi xảy ra");
	        }
	    });
	},
    Post: function(url, data, callback, showLoad, dataType) {
		$.ajax({
	        type: "POST",
	        url: url,
	        dataType: dataType ? dataType: 'json',
	        contentType: "application/json;charset=utf-8",
	        data: JSON.stringify(data),
            async: true,
            beforeSend: function () {
	        	if(showLoad) {
                    App.UI.showLoadding(showLoad);
                }
            },
	        success: function(response) {
	            callback(response);
	            if(showLoad)
                    App.UI.hideLoadding();
	        },
	        error: function(xhr, ajaxOptions, thrownError) {
                console.log(xhr);
                if(showLoad)
                    App.UI.hideLoadding();
	            App.UI.Error("Đã có lỗi xảy ra");
	        }
	    });
	},
    Delete: function(url, callback, showLoad) {
		$.ajax({
	        type: "DELETE",
	        url: url,
	        contentType: "application/json;charset=utf-8",
            beforeSend: function () {
	        	if(showLoad) {
                    App.UI.showLoadding(showLoad);
                }
            },
	        success: function(response) {
	            callback(response);
                if(showLoad)
                    App.UI.hideLoadding();
	        },
	        error: function(xhr, ajaxOptions, thrownError) {
	        	if(showLoad)
                    App.UI.hideLoadding();
                App.UI.Error("Đã có lỗi xảy ra");
	        }
	    });
	},
	CountNumberChar: function(str) {
		return (str.match(/\d/g) || []).length;
	},
	GetValueFromString: function(str) {
		return (str.match(/[\d\.,]/g) || []).join("");
	},
	ExtractNumber: function(str) {
		return (str.match(/\d/g) || []).join("");
	},
	AddIframe: function(successUrl) {
    /* Tiến hành add iframe đăng ký thành công */
	    $("<div id='showIframeSEONgon' style='display:none;'></div>").prependTo($('body'));
	    var iframe = document.createElement('iframe');
	    iframe.width = "100%";
	    iframe.height = "1px";
	    iframe.frameborder = "0";
	    iframe.style.border = '0';
	    iframe.src = successUrl;
	    $("#showIframeSEONgon").html(iframe);
	},
	renderLinkListing: function(listing){
        var type = parseInt(listing.listingTypeId) != 1 ? "thue" : "mua";
        var propertyTypeName = this.strToUrl(listing.propertyTypeName);
        var districtName = this.strToUrl(listing.districtName);
        var slug = this.strToUrl(listing.title);
		return "/"+type+"/"+slug+"-id"+listing.rlistingId;
	},
    renderLinkListingApartment: function(listing){
        var slug = this.strToUrl(listing.title);
        return "/du-an/"+slug+"-id"+listing.listingId;
	},
	strToUrl: function(title){
        var slug;
        slug = title.toLowerCase();
        slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
        slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
        slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
        slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
        slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
        slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
        slug = slug.replace(/đ/gi, 'd');
        slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
        slug = slug.replace(/ /gi, "-");
		slug = slug.replace(/\-\-\-\-\-/gi, '-');
		slug = slug.replace(/\-\-\-\-/gi, '-');
		slug = slug.replace(/\-\-\-/gi, '-');
		slug = slug.replace(/\-\-/gi, '-');
		slug = '@' + slug + '@';
		slug = slug.replace(/\@\-|\-\@|\@/gi, '');
		return slug;
	},
    uploadImage: function (input, e, callback="",url) {
        files = e.target.files[0];
        var data = new FormData();
        var obj;
        data.append('file', files);
        if(typeof files !== "undefined") {
            $.ajax({
                url: url ? url : '/api/upload',
                type: 'POST',
                data: data,
                cache: false,
                dataType: 'json',
                processData: false, 
                contentType: false,
                // Image loading
                beforeSend: function () {
                    var img_load = new Image();
                    img_load.src = '/assets/images/loading.svg?v=03.06.2019';
                    $($(input).data('target')).parent().append($(img_load).addClass("image-loadding"));
                    $($(input).data('target')).parent().css({'position': 'relativie'});
                },
                success: function (result, textStatus, jqXHR) {
                    if (typeof result === 'object') {
                        obj = result;
                    } else {
                        obj = JSON.parse(result);
                    }
                    if (obj.result) {
                        src_img = obj.data.link;
                        $($(input).data('target')).attr('src', src_img);
                        $($(input).data('target')).parent().first().find('.image-loadding').first().remove();
                        if ($.isFunction(callback)) {
                            callback(obj.data);
                        }
                    } else {
                        alert(obj.message);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert(textStatus);
                }
            });
        }
	},
	setCookie2: function(key, value, expireDays = 0) {
		if (typeof document !== 'undefined') {
			if (expireDays) {
				const currentDate = new Date();
				currentDate.setTime(
					currentDate.getTime() + expireDays * 24 * 60 * 60 * 1000
				);
				const expires = 'expires=' + currentDate.toUTCString();
				document.cookie = key + '=' + value + ';' + expires + ';path=/';
			} else {
				document.cookie = key + '=' + value + ';path=/';
			}
		}
	},
	getCookie2: function(key) {
		if (typeof document !== 'undefined') {
			const name = key + '=';
			const decodedCookie = decodeURIComponent(document.cookie);
			const ca = decodedCookie.split(';');
			for (let i = 0; i < ca.length; i++) {
				let c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) == 0) {
					return c.substring(name.length, c.length);
				}
			}
		}
		return '';
	},
	containCookie2: function(key) {
		return this.getCookie2(key) ? true : false;
	},
	clearCookie2: function(key) {
		this.setCookie2(key, '', -1);
	},
	clearAllCookie2: function() {
		if (typeof document !== 'undefined') {
			document.cookie = '';
		}
	}
};
