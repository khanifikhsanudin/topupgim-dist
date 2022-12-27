"use strict";

class frontendAuthPINReset {
    static initValidation() {
        Topupgim.helpers("jq-validation");
        $(".js-validation-auth-pin-reset").validate({
            rules: {
                signature: {
                    required: true,
                    minlength: 6
                },
                accountNewPIN: {
                    required: true,
                    minlength: 6,
                    maxlength: 6
                },
                accountConfirmPIN: {
                    required: true,
                    minlength: 6,
                    maxlength: 6,
                    equalTo: "#accountNewPIN"
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
        Topupgim.helpers("fresh-page");
        Topupgim.helpers("input-text-phone", { selector: "#accountNewPIN", maxLength: 6 });
        Topupgim.helpers("input-text-phone", { selector: "#accountConfirmPIN", maxLength: 6 });
    }
}

Topupgim.onLoad(frontendAuthPINReset.init());
