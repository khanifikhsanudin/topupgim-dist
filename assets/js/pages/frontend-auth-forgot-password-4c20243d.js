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
            //the server only delivers this event to sockets that subscribed to it (no more broadcast)
            socket.on("connect", () => socket.emit("subscribe", `event-passr-${seeds}`));
            socket.on(`event-passr-${seeds}`, (redirectLink) => {
                $("#actionBtn").on("click", () => {
                    location.href = redirectLink;
                });
                $("#actionContainer").removeClass("d-none");
            });
        }
    }
}

Topupgim.onLoad(frontendAuthForgotPassword.init());
