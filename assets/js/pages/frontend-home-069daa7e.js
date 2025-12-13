"use strict";

const purchaseHistoryView = (purchase) => {
    const image = Topupgim.safeImage(purchase.product_tile_image);
    const url = `${location.origin}/purchase/order-status/${purchase.order_id}`;
    return `
        <div class="list-group d-flex flex-column gap-3 me-3">
            <a class="horizon-scroll-item list-group-item list-group-item-action d-flex align-items-center p-3 border" data-id="${purchase.order_id}" href="${url}" title="Top up ${purchase.product_title}" style="border-radius: 12px; min-width: 280px;">
                <img class="block block-fx-shadow block-bordered p-0 my-0 ms-0 lazy me-3" src="${image}" style="width: 64px; height: 64px; border-radius: 12px;" />
                <div class="d-flex flex-column justify-content-center gap-1">
                    <span class="text-dark text-nowrap">${purchase.denomination_name}</span>
                    <span class="fs-sm text-muted">${purchase.date_text}</span>
                </div>
            </a>
        </div>
    `;
};

class frontendHome {
    static async init() {
        const isSigned = $('meta[name="consumer-is-signed"]').attr("content") === "true";
        if (isSigned) {
            setTimeout(() => {
                fetch(`${location.origin}/purchase/api-recents`)
                    .then((response) => response.json())
                    .then((data) => {
                        const purchaseList = data.data;
                        if (Array.isArray(purchaseList) && purchaseList.length) {
                            let purchaseView = "";
                            purchaseList.forEach((purchase) => {
                                purchaseView = `
                                    ${purchaseView}
                                    ${purchaseHistoryView(purchase)}
                                `;
                            });
                            $("#history-list").html(purchaseView);
                            $("#history-container").removeClass("d-none");
                            window.applyScrollControl ? window.applyScrollControl() : null;
                        } else {
                            $("#history-container").addClass("d-none");
                        }
                    })
                    .catch((_error) => {
                        $("#history-container").addClass("d-none");
                    });
            }, 100);
        } else {
            setTimeout(() => {
                const localHistoriesRaw = localStorage.getItem("purchase-histories") || "[]";
                const localHistories = JSON.parse(localHistoriesRaw);
                if (Array.isArray(localHistories) && localHistories.length) {
                    let purchaseView = "";
                    localHistories.forEach((purchase) => {
                        purchaseView = `
                        ${purchaseView}
                        ${purchaseHistoryView(purchase)}
                    `;
                    });
                    $("#history-list").html(purchaseView);
                    $("#history-container").removeClass("d-none");
                    window.applyScrollControl ? window.applyScrollControl() : null;
                } else {
                    $("#history-container").addClass("d-none");
                }
            }, 100);
        }

        $("#history-more").on("click", () => {
            if (isSigned) {
                location.href = location.origin + "/member/purchases";
                return;
            }
            const localHistoriesRaw = localStorage.getItem("purchase-histories") || "[]";
            const localHistories = JSON.parse(localHistoriesRaw);
            const whatsAppNo = Array.isArray(localHistories) ? localHistories[0]?.whatsapp_no || "" : "";
            location.href = location.origin + "/purchase/recents?query=" + whatsAppNo;
        });
    }
}

Topupgim.onLoad(frontendHome.init());
