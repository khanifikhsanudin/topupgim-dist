"use strict";

let selectedProductCode = null;
let isSpecialState = false;

function loadPricingData() {
    $("#main-form").removeClass("animated fadeIn");
    let ajaxUrl = `${window.location.origin}/member/reseller/api-pricing-list`;
    if (selectedProductCode) {
        ajaxUrl = `${ajaxUrl}?product_code=${selectedProductCode}`;
    }
    $("#main-table").DataTable().ajax.url(ajaxUrl).load();
}

function getProductDetailByCode(code) {
    let product = null;
    let mappedProductsJson = $("#hiddenMappedProducts").val();
    if (mappedProductsJson) {
        let mappedProducts = JSON.parse(mappedProductsJson);
        if (Array.isArray(mappedProducts)) {
            product = mappedProducts.filter((value) => {
                return value?.code === code;
            })?.[0];
        }
    }
    return product;
}

function refreshSelectedProduct(isSpecial = false) {
    const code = selectedProductCode;
    let product = getProductDetailByCode(code);
    Topupgim.hidden("#selectedProductBody");
    Topupgim.visible("#selectedProductEmpty");
    $("#listProduct")?.find("a")?.removeClass("active");
    Topupgim.hidden("#selectedSpecialBody");
    Topupgim.visible("#selectedSpecialEmpty");
    $("#listSpecial")?.find("a")?.removeClass("active");
    if (code && typeof product === "object") {
        if (isSpecial) {
            $("#selectedSpecialTileImage").attr("src", Topupgim.safeImage(product["tile_image"]));
            $("#selectedSpecialTitle").text(product["title"]);
            $("#selectedSpecialType").text(Topupgim.getProductTypeById(product["type"]));
            Topupgim.gone("#selectedSpecialEmpty");
            Topupgim.visible("#selectedSpecialBody");
            $("#listSpecial")?.find("a")?.removeClass("active");
            $(`#itemSelectorSpecial${code}`)?.addClass("active");
            return code;
        } else {
            $("#selectedProductTileImage").attr("src", Topupgim.safeImage(product["tile_image"]));
            $("#selectedProductTitle").text(product["title"]);
            $("#selectedProductType").text(Topupgim.getProductTypeById(product["type"]));
            Topupgim.gone("#selectedProductEmpty");
            Topupgim.visible("#selectedProductBody");
            $("#listProduct")?.find("a")?.removeClass("active");
            $(`#itemSelectorProduct${code}`)?.addClass("active");
            return code;
        }
    }
    return null;
}

function confirmSelectedProduct(code) {
    isSpecialState = false;
    selectedProductCode = code;
    refreshSelectedProduct();
    loadPricingData();
    $("#modal-product-filter")?.modal("hide");
    $("#modal-special-filter")?.modal("hide");
}

function confirmSelectedSpecial(code) {
    isSpecialState = true;
    selectedProductCode = code;
    refreshSelectedProduct(true);
    loadPricingData();
    $("#modal-product-filter")?.modal("hide");
    $("#modal-special-filter")?.modal("hide");
}

class resellerPricingList {
    static init() {
        selectedProductCode = $("#hiddenDefaultProductCode").val();
        refreshSelectedProduct();
        let ajaxUrl = `${window.location.origin}/member/reseller/api-pricing-list`;
        if (selectedProductCode) {
            ajaxUrl = `${ajaxUrl}?product_code=${selectedProductCode}`;
        }

        Topupgim.helpers("js-datatables-init");
        Topupgim.helpers("bs-tooltip");
        Topupgim.helpers("js-datatables", {
            processing: true,
            serverSide: true,
            ajax: ajaxUrl,
            order: [[3, "asc"]],
            lengthMenu: [
                [10, 25, 50],
                [10, 25, 50]
            ],
            pageLength: 50,
            columns: [
                {
                    render: function (data, type, row, meta) {
                        return meta.row + 1 + meta.settings._iDisplayStart;
                    }
                },
                {
                    render: function (data, type, row, meta) {
                        const productTileImage = Topupgim.safeImage(row.product_tile_image);
                        let html = `
                            <div style="min-width:200px;">
                                <img class="img-sm img-round-pop me-3 float-start" src="${productTileImage}">
                                <p class="fs-sm mb-0 text-truncate">${row.product_title}</p>
                                <p class="fs-sm fw-semibold mb-0 text-truncate">${row.denomination_name}</p>
                            </div>
                        `;
                        return html;
                    }
                },
                {
                    render: function (data, type, row, meta) {
                        let html = `
                            <div style="min-width:200px;">
                                <p class="fs-sm mb-0 text-truncate">${row.denomination_sku_id}</p>
                            </div>
                        `;
                        return html;
                    }
                },
                {
                    data: "price_idr",
                    render: function (data, type, row, meta) {
                        const price = Topupgim.numberToIDRSlim(row.price_idr);
                        const crossedOut = Topupgim.numberToIDRSlim(row.price_idr_crossed_out);
                        let html = "";
                        if (row.price_idr_crossed_out) {
                            html = `
                                <div style="min-width:120px;">
                                    <p class="fs-sm fw-semibold mb-0">${price}</p>
                                    <p class="text-muted fs-sm mb-0 "><del>${crossedOut}<del/></p>
                                </div>
                            `;
                        } else {
                            html = `
                                <div style="min-width:120px;">
                                    <p class="fs-sm fw-semibold mb-0">${price}</p>
                                </div>
                            `;
                        }
                        return html;
                    }
                }
            ],
            columnDefs: [
                {
                    targets: [0, 2],
                    orderable: false,
                    searchable: false
                }
            ]
        });

        $("#modal-product-filter").on("shown.bs.modal", function (_event) {
            if (!isSpecialState) {
                const code = refreshSelectedProduct();
                const position = $(`#itemSelectorProduct${code}`)?.offset()?.top ?? 0;
                if (position > $("#containerProduct").innerHeight()) {
                    $("#containerProduct").animate({ scrollTop: position - 150 }, 0);
                }
                $("#containerProduct").css("visibility", "visible");
            }
        });

        $("#modal-special-filter").on("shown.bs.modal", function (_event) {
            if (isSpecialState) {
                const code = refreshSelectedProduct(true);
                const position = $(`#itemSelectorSpecial${code}`)?.offset()?.top ?? 0;
                if (position > $("#containerSpecial").innerHeight()) {
                    $("#containerSpecial").animate({ scrollTop: position - 150 }, 0);
                }
                $("#containerSpecial").css("visibility", "visible");
            }
        });

        $("#selectedProduct").on("click", () => {
            if (!$("#modal-product-filter").is(":visible")) {
                $("#modal-product-filter").modal("show");
            }
        });

        $("#selectedEmptyProduct").on("click", () => {
            confirmSelectedProduct(null);
        });

        $("#selectedSpecial").on("click", () => {
            if (!$("#modal-special-filter").is(":visible")) {
                $("#modal-special-filter").modal("show");
            }
        });

        $("#selectedEmptySpecial").on("click", () => {
            confirmSelectedSpecial(null);
        });
    }
}

Topupgim.onLoad(resellerPricingList.init());
