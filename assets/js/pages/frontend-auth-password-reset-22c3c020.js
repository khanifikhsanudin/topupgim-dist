"use strict";

class frontendAuthPasswordReset {
    static initValidation() {
        Topupgim.helpers("jq-validation");
        $(".js-validation-auth-password-reset").validate({
            rules: {
                signature: {
                    required: true,
                    minlength: 6
                },
                memberPassword: {
                    required: true,
                    minlength: 6
                },
                memberPasswordConfirm: {
                    required: true,
                    minlength: 6,
                    equalTo: "#memberPassword"
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

Topupgim.onLoad(frontendAuthPasswordReset.init());
