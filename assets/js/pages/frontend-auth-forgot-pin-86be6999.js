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
                form.submit();
            }
        });
    }

    static async init() {
        this.initValidation();
        Topupgim.helpers("input-text-phone");

        const seeds = $("#actionSeeds").val() || "";
        if (seeds) {
            const socket = io();
            socket.on(`event-pinr-${seeds}`, (redirectLink) => {
                $("#actionBtn").on("click", () => {
                    location.href = redirectLink;
                });
                $("#actionContainer").removeClass("d-none");
            });
        }
    }
}

Topupgim.onLoad(frontendAuthForgotPIN.init());
