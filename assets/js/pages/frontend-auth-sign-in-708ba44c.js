"use strict";

class frontendAuthSignIn {
    static initValidation() {
        Topupgim.helpers("jq-validation");
        $(".js-validation-auth-sign-in").validate({
            rules: {
                memberWhatsAppNo: {
                    required: true,
                    minlength: 8,
                    digits: true
                },
                memberPassword: {
                    required: true,
                    minlength: 6
                }
            },
            submitHandler: function (form) {
                $("#main-block").addClass("block-mode-loading");
                localStorage.setItem("topupgimIsSignedConsumer", "true");
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

Topupgim.onLoad(frontendAuthSignIn.init());
