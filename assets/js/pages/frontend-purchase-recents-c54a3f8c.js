"use strict";

const purchaseHistoryView = (purchaseList) => {
    let purchaseView = "";
    purchaseList = Array.isArray(purchaseList) ? purchaseList : [];
    purchaseList.forEach((item) => {
        const orderId = item.order_id;
        const priceText = Topupgim.numberToIDRSlim(item.price_idr);
        purchaseView = `
            ${purchaseView}
            <div class="container-action list-group-item-action rounded d-flex justify-content-between w-100 border-top border-3 py-3 px-2 mb-3" role="button" data-order-id="${orderId}">
                <div class="d-flex align-items-center">
                    <img class="img-sq img-round-pop me-3" src="${Topupgim.safeImage(item.product_tile_image)}">
                    <div class="d-flex flex-column">
                        <p class="fw-semibold text-truncate mb-0">${item.product_title} - ${item.denomination_name}</p>
                        <span class="fs-sm mb-0">${item.order_id}</span>
                        <span class="fs-sm fw-semibold text-currency mb-0">${priceText}</span>
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <button type="button" class="purchase-status btn btn-sm btn-outline-secondary px-3 d-md-block d-none" data-order-id="${orderId}"s>
                        Detail
                    </button>
                </div>
            </div>
        `;
    });
    if (purchaseList.length >= 5) {
        purchaseView = `
            ${purchaseView}
            <div class="d-flex justify-content-center w-100">
                <u class="text-primary"><a href="${location.origin}/member/purchases" class="fw-semibold text-primary">Lihat selengkapnya <i class="fa fa-right ms-1"></i> </a></u>
            </div>
        `;
    }
    return purchaseView;
};

class frontendPurchaseRecents {
    static async init() {
        $(document)
            .on("click", ".container-action", function () {
                const orderId = $(this).data("order-id");
                const statusLink = `${location.origin}/purchase/order-status/${orderId}`;
                location.href = statusLink;
            })
            .on("click", ".purchase-status", function (e) {
                if (e.target !== e.currentTarget) return;
                e.stopPropagation();
                const orderId = $(this).data("order-id");
                const statusLink = `${location.origin}/purchase/order-status/${orderId}`;
                location.href = statusLink;
            });

        $("#userBack").on("click", () => {
            $("#main-form").removeClass("block-mode-loading");
            $("#userResultContainer").addClass("d-none");
            $("#userInputContainer").removeClass("d-none");
        });

        $("#userSubmit").on("click", (e) => {
            if (e.target !== e.currentTarget) return;
            e.stopPropagation();
            let userPhoneNumber = $("#userPhoneNumber").val();
            $("#main-form").addClass("block-mode-loading");
            setTimeout(() => {
                fetch(`${location.origin}/purchase/api-recents?userPhoneNumber=${userPhoneNumber}`)
                    .then((response) => response.json())
                    .then((data) => {
                        const purchaseList = data.data;
                        if (data.message === "USER_NOT_ALLOWED") {
                            Topupgim.helpers("jq-notify", {
                                type: "warning",
                                message: "Nomor ini sudah terdaftar! anda perlu masuk ke akun ini dahulu"
                            });
                            $("#userResultContainer").addClass("d-none");
                            $("#userInputContainer").removeClass("d-none");
                            return;
                        }
                        $("#userResult").empty();
                        if (Array.isArray(purchaseList) && purchaseList.length) {
                            $("#userEmptyResult").addClass("d-none");
                            $("#userResult").html(purchaseHistoryView(purchaseList)).removeClass("d-none");
                        } else {
                            $("#userResult").addClass("d-none");
                            $("#userEmptyResult").removeClass("d-none");
                        }
                        $("#userInputContainer").addClass("d-none");
                        $("#userResultContainer").removeClass("d-none");
                    })
                    .catch((_error) => {
                        $("#userResult").empty().addClass("d-none");
                        $("#userEmptyResult").removeClass("d-none");
                        $("#userInputContainer").addClass("d-none");
                        $("#userResultContainer").removeClass("d-none");
                    })
                    .finally(() => {
                        $("#main-form").removeClass("block-mode-loading");
                    });
            }, 500);
        });
    }
}

Topupgim.onLoad(frontendPurchaseRecents.init());
