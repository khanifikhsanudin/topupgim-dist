"use strict";

let selectedProductCode = null;

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

function refreshSelectedProduct() {
    const code = selectedProductCode;
    let product = getProductDetailByCode(code);
    if (code && typeof product === "object") {
        $("#selectedProductTileImage").attr("src", Topupgim.safeImage(product["tile_image"]));
        $("#selectedProductTitle").text(product["title"]);
        $("#selectedProductType").text(Topupgim.getProductTypeById(product["type"]));
        Topupgim.gone("#selectedProductEmpty");
        Topupgim.visible("#selectedProductBody");
        $("#listProduct")?.find("a")?.removeClass("active");
        $(`#itemSelectorProduct${code}`)?.addClass("active");
        return code;
    } else {
        Topupgim.hidden("#selectedProductBody");
        Topupgim.visible("#selectedProductEmpty");
        $("#listProduct")?.find("a")?.removeClass("active");
        return null;
    }
}

function confirmSelectedProduct(code) {
    if (code !== selectedProductCode) {
        selectedProductCode = code;
        refreshSelectedProduct();
        loadPricingData();
    }
    $("#modal-product-filter")?.modal("hide");
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
            order: [[1, "asc"]],
            pageLength: 10,
            columns: [
                {
                    render: function (data, type, row, meta) {
                        return meta.row + 1 + meta.settings._iDisplayStart;
                    }
                },
                {
                    data: "denomination_name",
                    render: function (data, type, row, meta) {
                        const productTileImage = Topupgim.safeImage(row.product_tile_image);
                        let html = `
                            <div style="min-width:200px;">
                                <img class="img-sm img-round-pop me-3 float-start" src="${productTileImage}">
                                <p class="fs-sm mb-0 text-truncate">${row.product_title}</p>
                                <p class="fs-sm text-primary mb-0 text-truncate">${row.denomination_name}</p>
                            </div>
                        `;
                        return html;
                    }
                },
                {
                    data: "price_idr",
                    render: function (data, type, row, meta) {
                        const price = Topupgim.numberToIDR(row.price_idr);
                        const crossedOut = Topupgim.numberToIDR(row.price_idr_crossed_out);
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
                },
                {
                    data: "price_idr_reseller",
                    render: function (data, type, row, meta) {
                        const margin = parseInt(row.price_idr) - parseInt(row.price_idr_reseller);
                        const priceMargin = Topupgim.numberToIDR(margin);
                        const priceReseller = Topupgim.numberToIDR(row.price_idr_reseller);
                        let html = "";
                        if (margin > 0) {
                            html = `
                            <div style="min-width:120px;">
                                <p class="fs-sm fw-semibold mb-0">${priceReseller}</p>
                                <p class="text-success fs-sm mb-0 ">-${priceMargin}</p>
                            </div>
                        `;
                        } else {
                            html = `
                            <div style="min-width:120px;">
                                <p class="fs-sm fw-semibold mb-0">${priceReseller}</p>
                            </div>
                        `;
                        }

                        return html;
                    }
                },
                {
                    render: function (data, type, row, meta) {
                        let actions = `
                            <div class="btn-group">
                                <button onclick="window.location.href='${location.origin}/product/${row.product_alias_name}/${row.product_code}'" type="button" class="btn btn-sm btn-alt-secondary" data-bs-toggle="tooltip" title="Beli Sekarang">
                                    <i class="far fa-cart-plus"></i>
                                </button>
                            </div>
                        `;
                        return actions;
                    }
                }
            ],
            columnDefs: [
                {
                    targets: [0, 4],
                    orderable: false,
                    searchable: false
                },
                {
                    targets: [-1],
                    className: "dt-center"
                }
            ]
        });

        $("#modal-product-filter").on("shown.bs.modal", function (_event) {
            const code = refreshSelectedProduct();
            const position = $(`#itemSelectorProduct${code}`)?.offset()?.top ?? 0;
            if (position > $("#containerProduct").innerHeight()) {
                $("#containerProduct").animate({ scrollTop: position - 150 }, 0);
            }
            $("#containerProduct").css("visibility", "visible");
        });

        $("#selectedProduct").on("click", () => {
            if (!$("#modal-product-filter").is(":visible")) {
                $("#modal-product-filter").modal("show");
            }
        });

        $("#selectedEmptyProduct").on("click", () => {
            confirmSelectedProduct(null);
        });
    }
}

Topupgim.onLoad(resellerPricingList.init());
