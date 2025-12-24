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
                $("#main-block").addClass("block-mode-loading");
                form.submit();
            }
        });
    }

    static async init() {
        this.initValidation();
        Topupgim.helpers("input-text-phone");
        Topupgim.helpers("fresh-page");
        $("#verifyConfirm").on("click", () => {
            doVerifyRegister();
        });

        const seeds = $("#actionSeeds").val() || "";
        const socket = io();
        socket.on(`event-regr-${seeds}`, (redirectLink) => {
            if (redirectLink) {
                $("#actionBtn").on("click", () => {
                    location.href = redirectLink;
                });
                $("#actionContainer").removeClass("d-none");
            }
        });
    }
}

Topupgim.onLoad(frontendAuthVerifyRegister.init());
