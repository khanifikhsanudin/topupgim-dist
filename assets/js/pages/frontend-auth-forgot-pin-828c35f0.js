"use strict";

class frontendAuthForgotPIN {
    static initValidation() {
        Topupgim.helpers("jq-validation");
        $(".js-validation-auth-forgot-pin").validate({
            rules: {
                memberPassword: {
                    required: true,
                    minlength: 6
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

Topupgim.onLoad(frontendAuthForgotPIN.init());
