"use strict";

class frontendAuthPINReset {
    static initValidation() {
        Topupgim.helpers("jq-validation");
        $(".js-validation-auth-pin-reset").validate({
            ignore: "",
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
        $("#accountNewPIN")?.pincodeInput({ inputs: 6, hidedigits: false });
        $("#accountConfirmPIN")?.pincodeInput({ inputs: 6, hidedigits: true });
    }
}

Topupgim.onLoad(frontendAuthPINReset.init());
