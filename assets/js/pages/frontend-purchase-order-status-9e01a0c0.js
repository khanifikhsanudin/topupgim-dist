"use strict";

let toast = Swal.mixin({
    buttonsStyling: false,
    customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-danger m-1",
        input: "form-control"
    },
    cancelButtonText: "Nevermind"
});

function showDialogCancelOrder(orderId, signatureEnc) {
    const csrfToken = $('meta[name="csrf-token"]').attr("content");
    toast
        .fire({
            title: "Apakah Anda yakin?",
            text: "Pesanan akan dibatalkan!",
            icon: "warning",
            showCancelButton: true,
            customClass: {
                confirmButton: "btn btn-danger m-1",
                cancelButton: "btn btn-secondary m-1"
            },
            confirmButtonText: "Ya, batalkan!",
            html: false,
            preConfirm: (e) => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 50);
                });
            }
        })
        .then((result) => {
            if (result.value) {
                var newForm = $("<form>", {
                    method: "POST",
                    action: `${location.origin}/purchase/do-cancel-order`,
                    target: "_top",
                    enctype: "multipart/form-data",
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
                        name: "purchaseOrderId",
                        value: orderId,
                        type: "hidden"
                    })
                );
                newForm.append(
                    $("<input>", {
                        name: "purchaseSignatureEnc",
                        value: signatureEnc,
                        type: "hidden"
                    })
                );
                $(document.body).append(newForm);
                newForm.trigger("submit").remove();
            }
        });
}

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

    static initGAds() {
        const orderId = $('meta[name="order-id"]').attr("content");
        const purchaseStatus = $('meta[name="purchase-status"]').attr("content");
        const priceIdrAmount = $('meta[name="price-idr-amount"]').attr("content");

        if (orderId && purchaseStatus === "ordered") {
            gtag("event", "conversion", {
                send_to: "AW-10897083214/ysnICJq4uNcDEM6Wkcwo",
                value: parseInt(priceIdrAmount),
                currency: "IDR",
                transaction_id: orderId
            });
        } else if (orderId && purchaseStatus === "completed") {
            gtag("event", "conversion", {
                send_to: "AW-10897083214/eVdXCJe4uNcDEM6Wkcwo",
                value: parseInt(priceIdrAmount),
                currency: "IDR",
                transaction_id: orderId
            });
        }
    }

    static async init() {
        this.initGAds();
        this.initIO();
        this.initValidation();
        this.initRating();
        this.initTimer();
        Topupgim.helpers("fresh-page");

        $("#purchaseCheck")?.on("click", () => {
            const purchaseOrderId = $("#purchaseOrderId").val();
            if (purchaseOrderId) {
                location.replace(`${location.origin}/purchase/order-status/${purchaseOrderId}`);
            }
        });

        $("#purchaseRefresh")?.on("click", () => {
            window.location.reload(true);
        });

        $("#cancelOrder").on("click", function (e) {
            if (e.target !== e.currentTarget) return;
            e.stopPropagation();
            const orderId = $('meta[name="order-id"]').attr("content");
            const signatureEnc = $('meta[name="sign-enc"]').attr("content");
            showDialogCancelOrder(orderId, signatureEnc);
        });

        $.each($(".btn-copy"), function (_index, item) {
            $(item).on("click", () => {
                const textCopy = $(item).attr("data-copy");
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
        });

        if ($("#captureTransferImage").length) {
            $("#captureTranferButton").on("click", () => {
                const orderId = $('meta[name="order-id"]').attr("content");
                const fileUpload = $("#captureTransferImage").prop("files")[0];
                if (fileUpload && orderId) {
                    $("#captureTranferButtonText").text("Sedang Mengunggah...");
                    $("#captureTranferButton").prop("disabled", true);
                    setTimeout(() => {
                        const formData = new FormData();
                        formData.append("_csrf", $('meta[name="csrf-token"]').attr("content"));
                        formData.append("order_id", orderId);
                        formData.append("image", fileUpload);
                        fetch(`${location.origin}/purchase/do-capture-transfer`, {
                            method: "POST",
                            body: formData
                        })
                            .then((response) => response.json())
                            .then((response) => {
                                if (response.success) {
                                    $("#captureTranferButtonText").text("Sudah diunggah");
                                    $("#captureTranferButton").prop("disabled", true);
                                    var drEvent = $("#captureTransferImage").dropify({
                                        defaultFile: Topupgim.safeImage(response.data),
                                        showRemove: false,
                                        height: 180
                                    });
                                    drEvent = drEvent.data("dropify");
                                    drEvent.resetPreview();
                                    drEvent.clearElement();
                                    drEvent.settings.defaultFile = Topupgim.safeImage(response.data);
                                    drEvent.settings.showRemove = false;
                                    drEvent.settings.height = 180;
                                    drEvent.destroy();
                                    drEvent.init();
                                    Topupgim.helpers("jq-notify", {
                                        type: "info",
                                        message: "Berhasil mengunggah file!"
                                    });
                                } else {
                                    $("#captureTranferButtonText").text("Unggah File");
                                    $("#captureTranferButton").prop("disabled", false);
                                    Topupgim.helpers("jq-notify", {
                                        type: "danger",
                                        message: response.message
                                    });
                                }
                            })
                            .catch((_error) => {
                                $("#captureTranferButtonText").text("Unggah File");
                                $("#captureTranferButton").prop("disabled", false);
                                Topupgim.helpers("jq-notify", {
                                    type: "danger",
                                    message: "Gagal mengunggah file!"
                                });
                            });
                    }, 800);
                } else {
                    Topupgim.helpers("jq-notify", {
                        type: "danger",
                        message: "Mohon pilih file dahulu sebelum mengunggah!"
                    });
                }
            });
        }

        const paymentMethod = $('meta[name="payment-method"]').attr("content");
        if (paymentMethod === "BANK_TRANSFER" && $("#modal-tf-info").length) {
            setTimeout(() => {
                $("#modal-tf-info").modal("show");
            }, 250);
        }
    }
}

Topupgim.onLoad(frontendPurchaseOrderStatus.init());
