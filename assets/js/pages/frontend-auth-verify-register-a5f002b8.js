"use strict";

function doVerifyRegister() {
    const csrfToken = $('meta[name="csrf-token"]').attr("content");
    const signature = $("#signature").val();
    var newForm = $("<form>", {
        method: "POST",
        action: "do-verify-register",
        target: "_top",
        novalidate: "novalidate"
    });
    newForm.append(
        $("<input>", {
            name: "_csrf",
            value: csrfToken,
            type: "hidden"
        })
    );
    newForm.append(
        $("<input>", {
            name: "signature",
            value: signature,
            type: "hidden"
        })
    );
    $(document.body).append(newForm);
    newForm.trigger("submit").remove();
}

class frontendAuthVerifyRegister {
    static initValidation() {
        Topupgim.helpers("jq-validation");
        $(".js-validation-auth-verify-otp").validate({
            rules: {
                verifyOtpCode: {
                    required: true,
                    minlength: 4,
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

        $("#verifyConfirm").on("click", () => {
            doVerifyRegister();
        });

        const seeds = $("#actionSeeds").val() || "";
        if (seeds) {
            const socket = io();
            //the server only delivers this event to sockets that subscribed to it (no more broadcast)
            socket.on("connect", () => socket.emit("subscribe", `event-regr-${seeds}`));
            socket.on(`event-regr-${seeds}`, (redirectLink) => {
                $("#actionBtn").on("click", () => {
                    location.href = redirectLink;
                });
                $("#actionContainer").removeClass("d-none");
            });
        }
    }
}

Topupgim.onLoad(frontendAuthVerifyRegister.init());
