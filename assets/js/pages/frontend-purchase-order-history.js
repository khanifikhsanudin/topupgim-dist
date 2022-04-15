"use strict";

let toast = Swal.mixin({
    buttonsStyling: false,
    customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-danger m-1",
        input: "form-control"
    },
    cancelButtonText: "Batal"
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
                    action: "do-cancel-order",
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

const loadingView = `
    <div class="text-center text-primary my-7" role="status">
        <i class="fa fa-3x fa-circle-notch fa-spin"></i>
    </div>
`;

const emptyHistoryView = `
    <div class="text-center mt-4 mb-5 py-5">
        <h4 class="mb-2">Belum ada transaksi</h4>
        <p>Yuk, mulai top up dan penuhi berbagai kebutuhan<br />gamingmu di Topupgim</p>
        <a class="btn btn-primary px-6" href="${location.origin}">
            Mulai Top Up
        </a>
    </div>
`;

const purchaseHistoryView = (purchaseList) => {
    if (Array.isArray(purchaseList) && purchaseList.length) {
        let purchaseView = "";
        purchaseList.forEach((item) => {
            const orderId = item.order_id;
            const signatureEnc = item.signature_enc;
            purchaseView = `
                ${purchaseView}
                <div class="container-action list-group-item-action rounded d-flex justify-content-between w-100 border-top border-3 py-3 px-2 mb-3" role="button" data-order-id="${orderId}">
                    <div class="d-flex align-items-center">
                        <img class="img-sq img-round-pop me-3" src="${Topupgim.safeImage(item.product_tile_image)}">
                        <div class="d-flex flex-column">
                            <p class="fs-sm-sm text-truncate mb-0">${item.product_title}</p>
                            <p class="fw-semibold text-primary mb-0">${item.text_price_idr}</p>
                        </div>
                    </div>
                    <div class="d-flex align-items-center">
                        <button type="button" class="purchase-status btn btn-sm btn-secondary px-3" data-order-id="${orderId}" data-signature-enc="${signatureEnc}">
                            <i class="fa fa-times me-1"></i>
                            Batalkan
                        </button>
                    </div>
                </div>
            `;
        });
        return `
            <h4>Menunggu Pembayaran</h4>
            ${purchaseView}
        `;
    } else {
        return emptyHistoryView;
    }
};

class frontendPurchaseOrderHistory {
    static async init() {
        $(document)
            .on("click", ".container-action", function (e) {
                if (e.target !== e.currentTarget) return;
                const orderId = $(this).data("order-id");
                const statusLink = `${location.origin}/purchase/order-status/${orderId}`;
                location.href = statusLink;
            })
            .on("click", ".purchase-status", function (e) {
                if (e.target !== e.currentTarget) return;
                e.stopPropagation();
                const orderId = $(this).data("order-id");
                const signatureEnc = $(this).data("signature-enc");
                showDialogCancelOrder(orderId, signatureEnc);
            });
        setTimeout(() => {
            fetch(`${location.origin}/purchase/api-list-order-history`)
                .then((response) => response.json())
                .then((data) => {
                    const purchaseList = data.data;
                    if (Array.isArray(purchaseList) && purchaseList.length) {
                        $("#main-content").html(purchaseHistoryView(purchaseList));
                    } else {
                        $("#main-content").html(emptyHistoryView);
                    }
                })
                .catch((_error) => {
                    $("#main-content").html(emptyHistoryView);
                });
        }, 500);
    }
}

Topupgim.onLoad(frontendPurchaseOrderHistory.init());
