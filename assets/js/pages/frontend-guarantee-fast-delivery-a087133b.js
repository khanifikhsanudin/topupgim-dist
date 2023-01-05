"use strict";

class fastDeliverySubmission {
    static initValidation() {
        Topupgim.helpers("jq-validation");
        $(".js-validation-guarantee-fast-delivery").validate({
            rules: {
                submissionMethodType: {
                    required: true
                },
                submissionMethodCode: {
                    required: true
                },
                submissionAccountNumber: {
                    required: true,
                    minlength: 5
                }
            },
            submitHandler: function (form) {
                $("#main-form").addClass("block-mode-loading");
                form.submit();
            }
        });
    }

    static async init() {
        this.initValidation();
        $("#submissionMethodType").on("change", () => {
            const methodType = $("#submissionMethodType").val();
            if (methodType === "BANK") {
                const bankListJson = $("#json-list-bank").text();
                const bankList = JSON.parse(bankListJson || []);
                $("#submissionMethodCode").empty();
                if (Array.isArray(bankList) && bankList.length) {
                    bankList.forEach((item) => {
                        $("#submissionMethodCode").append(
                            $("<option>", {
                                value: item.code,
                                text: item.name
                            })
                        );
                    });
                }
            } else if (methodType === "EWALLET") {
                const eWalletListJson = $("#json-list-ewallet").text();
                const eWalletList = JSON.parse(eWalletListJson || []);
                $("#submissionMethodCode").empty();
                if (Array.isArray(eWalletList) && eWalletList.length) {
                    eWalletList.forEach((item) => {
                        $("#submissionMethodCode").append(
                            $("<option>", {
                                value: item.code,
                                text: item.name
                            })
                        );
                    });
                }
            }
        });
        if ($(`#submissionMethodType option[value='BANK']`).length) {
            $("#submissionMethodType").val("BANK").trigger("change");
        }
    }
}

Topupgim.onLoad(fastDeliverySubmission.init());
