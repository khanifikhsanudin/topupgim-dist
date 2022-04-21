"use strict";

class frontendAuthRegister {
    static initValidation() {
        Topupgim.helpers("jq-validation");
        $(".js-validation-auth-register").validate({
            rules: {
                memberName: {
                    required: true,
                    isFullName: true,
                    minlength: 2,
                    maxlength: 30
                },
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

Topupgim.onLoad(frontendAuthRegister.init());
