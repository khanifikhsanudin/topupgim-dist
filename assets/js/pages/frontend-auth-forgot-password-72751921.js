"use strict";

class frontendAuthForgotPassword {
    static initValidation() {
        Topupgim.helpers("jq-validation");
        $(".js-validation-auth-forgot-password").validate({
            rules: {
                memberWhatsAppNo: {
                    required: true,
                    minlength: 8,
                    digits: true
                }
            },
            submitHandler: function (form) {
                $("#main-block").addClass("block-mode-loading");
                form.submit();
            }
        });
    }

    static async init() {
        this.initValidation();
        Topupgim.helpers("input-text-phone");
        Topupgim.helpers("fresh-page");
    }
}

Topupgim.onLoad(frontendAuthForgotPassword.init());
