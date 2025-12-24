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

        const seeds = $("#actionSeeds").val() || "";
        const socket = io();
        socket.on(`event-passr-${seeds}`, (redirectLink) => {
            if (redirectLink) {
                $("#actionBtn").on("click", () => {
                    location.href = redirectLink;
                });
                $("#actionContainer").removeClass("d-none");
            }
        });
    }
}

Topupgim.onLoad(frontendAuthForgotPassword.init());
