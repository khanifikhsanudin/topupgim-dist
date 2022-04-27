"use strict";

class frontendPurchaseOrderStatus {
    static initIO() {
        const purchaseStatus = $('meta[name="purchase-status"]').attr("content");
        if (!["completed", "canceled", "payment_expired"].includes(purchaseStatus)) {
            const socket = io();
            const orderId = $('meta[name="order-id"]').attr("content");
            const invoiceId = $('meta[name="invoice-id"]').attr("content");
            const paymentMethod = $('meta[name="payment-method"]').attr("content");
            socket.on(`event-purchase-update-${orderId}`, (status) => {
                if (status !== purchaseStatus) {
                    window.location.reload(true);
                }
            });
            if (paymentMethod === "VIRTUAL_ACCOUNT") {
                socket.on(`event-va-update-${invoiceId}`, (status) => {
                    if (status === "ACTIVE") {
                        Topupgim.helpers("jq-notify", { type: "success", message: "Virtual Account Aktif" });
                    } else if (status === "PENDING") {
                        Topupgim.helpers("jq-notify", { type: "warning", message: "Virtual Account Pending" });
                    } else if (status === "INACTIVE") {
                        Topupgim.helpers("jq-notify", { type: "danger", message: "Virtual Account Tidak Aktif" });
                    }
                });
            }
        }
    }

    static initValidation() {
        Topupgim.helpers("jq-validation");
        $(".js-validation-add-review").validate({
            rules: {
                reviewScore: {
                    required: true
                },
                reviewText: {
                    required: false,
                    maxlength: 254
                }
            },
            submitHandler: function (form) {
                $("#reviewSend").text("Mengirim").prop("disabled", true);
                form.submit();
            }
        });
    }

    static initRating() {
        $(".js-rating").each((index, element) => {
            let el = $(element);
            el.raty({
                score: el.data("score") || 0,
                number: el.data("number") || 5,
                cancel: el.data("cancel") || false,
                target: el.data("target") || false,
                targetScore: el.data("target-score") || false,
                precision: el.data("precision") || false,
                cancelOff: el.data("cancel-off") || "fa fa-fw fa-times-circle text-danger",
                cancelOn: el.data("cancel-on") || "fa fa-fw fa-times-circle",
                starHalf: el.data("star-half") || "fa fa-fw fa-star-half text-warning fs-sm",
                starOff: el.data("star-off") || "fa fa-fw fa-star text-muted fs-sm",
                starOn: el.data("star-on") || "fa fa-fw fa-star text-warning fs-sm",
                starType: "i",
                hints: ["Sangat Buruk", "Buruk", "Cukup", "Baik", "Sangat Baik"],
                readOnly: el.data("readonly") || false,
                space: true,
                click: function (score, _evt) {
                    $("#rateScore").val(score);
                }
            });
        });
    }

    static initTimer() {
        const purchaseStatus = $('meta[name="purchase-status"]')?.attr("content");
        const expiredMilliseconds = $('meta[name="expired-milliseconds"]')?.attr("content");
        const expiredTimeMilis = parseInt(expiredMilliseconds || 0);
        if (purchaseStatus === "ordered" && typeof expiredTimeMilis === "number") {
            var x = setInterval(function () {
                var now = new Date().getTime();
                var distance = expiredTimeMilis - now;
                var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                var countDownText = "";
                if (seconds > 0) {
                    countDownText = `${seconds}d`;
                }
                if (minutes > 0) {
                    countDownText = `${minutes}m ${seconds}d`;
                }
                if (hours > 0) {
                    countDownText = `${hours}j ${minutes}m ${seconds}d`;
                }
                if (days > 0) {
                    countDownText = `${days}h ${hours}j ${minutes}m ${seconds}d`;
                }
                if (countDownText && distance > 0) {
                    $("#timer-expired-payment")?.text(countDownText);
                } else {
                    clearInterval(x);
                    $("#timer-expired-payment")?.text("Kedaluwarsa");
                }
            }, 1000);
        }
    }

    static async init() {
        this.initIO();
        this.initValidation();
        this.initRating();
        this.initTimer();
        Topupgim.helpers("fresh-page");

        $("#purchaseCheck")?.on("click", () => {
            const orderId = $("#purchaseOrderId").val();
            if (orderId) {
                location.replace(`${location.origin}/purchase/order-status/${orderId}`);
            }
        });

        $("#purchaseRefresh")?.on("click", () => {
            window.location.reload(true);
        });

        $(".btn-copy").on("click", () => {
            const textCopy = $(".btn-copy").attr("data-copy");
            if (!navigator.clipboard) {
                var input = document.createElement("textarea");
                input.value = textCopy;
                document.body.appendChild(input);
                input.select();
                document.execCommand("Copy");
                input.remove();
                Topupgim.helpers("jq-notify", { type: "info", message: "Disalin!" });
            } else {
                navigator.clipboard
                    .writeText(textCopy)
                    .then(function () {
                        Topupgim.helpers("jq-notify", { type: "info", message: "Disalin!" });
                    })
                    .catch(function () {});
            }
        });
    }
}

Topupgim.onLoad(frontendPurchaseOrderStatus.init());
