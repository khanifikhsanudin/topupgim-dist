"use strict";

class managerPurchaseList {
    static initValidation() {
        Topupgim.helpers("jq-validation");
        $(".js-validation-member-edit").validate({
            rules: {
                memberName: {
                    required: true,
                    isFullName: true,
                    minlength: 2,
                    maxlength: 30
                }
            },
            submitHandler: function (form) {
                form.submit();
            }
        });
    }

    static init() {
        this.initValidation();
        Topupgim.helpers("js-datatables-init");
        Topupgim.helpers("bs-tooltip");
        Topupgim.helpers("js-datatables", {
            processing: true,
            serverSide: true,
            ajax: "member/api-purchase-list",
            order: [[1, "desc"]],
            createdRow: function (row, data, dataIndex) {
                $("td:eq(0)", row).css("width", "10px");
            },
            columns: [
                {
                    render: function (data, type, row, meta) {
                        return meta.row + 1 + meta.settings._iDisplayStart;
                    }
                },
                {
                    data: "created_at",
                    render: function (data, type, row, meta) {
                        return `<span class="fs-sm">${row.date_human}</span><br/><span class="text-muted fs-sm">${row.time_human}</span>`;
                    }
                },
                {
                    data: "product_title",
                    render: function (data, type, row, meta) {
                        const tileImage = Topupgim.safeImage(row.product_tile_image);
                        const priceText = Topupgim.numberToIDR(row.price_idr);
                        let html = `
                            <div class="d-flex align-items-center">
                                <img class="img-sq-sm fit-cover img-round-pop me-2" src="${tileImage}">
                                <div class="d-flex flex-column ms-1" style="max-width:150px;">
                                    <p class="fs-sm mb-0 text-truncate">${row.denomination_name}</p>
                                    <p class="fs-sm fw-semibold text-primary mb-0">${priceText}</p>
                                </div>
                            </div>
                        `;
                        return html;
                    }
                },
                {
                    data: "payment_method_channel_name",
                    render: function (data, type, row, meta) {
                        const channelImage = Topupgim.safeImage(row.payment_method_channel_image);
                        return `
                        <div class="d-flex">
                            <div class="bg-white rounded px-2">
                                <img class="img-sq-sm fit-contain" src="${channelImage}">
                            </div>
                        </div>
                        `;
                    }
                },
                {
                    data: "order_id",
                    render: function (data, type, row, meta) {
                        let html = `
                            <div>
                                <p class="fs-sm mb-0 text-truncate">${row.order_id}</p>
                                <span class="badge rounded-pill bg-${row.text_status_color}">${row.text_status}</span>
                            </div>
                        `;
                        return html;
                    }
                },
                {
                    render: function (data, type, row, meta) {
                        let actions = `
                            <div class="btn-group">
                                <button onclick="location.href='${location.origin}/purchase/order-status/${row.order_id}'" type="button" class="btn btn-sm btn-alt-secondary js-bs-tooltip-enabled" data-bs-toggle="tooltip" title="Lihat rincian">
                                    <i class="fa fa-eye"></i>
                                </button>
                            </div>
                        `;
                        return actions;
                    }
                }
            ],
            columnDefs: [
                {
                    targets: [0, 2, 3, 4, 5],
                    orderable: false,
                    searchable: false
                },
                {
                    targets: [-1],
                    className: "dt-center"
                }
            ]
        });

        const hash = document.location.hash;
        if (hash) {
            setTimeout(() => {
                var tab = new bootstrap.Tab(`${hash}-tab`);
                tab.show();
            }, 400);
        }
        $('button[data-bs-toggle="tab"]').on("shown.bs.tab", function (event) {
            $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
            if (history.pushState) {
                history.pushState(null, null, event.target.dataset.bsTarget);
            } else {
                location.hash = event.target.dataset.bsTarget;
            }
        });
        $(window).on("hashchange", function (event) {
            const hash = document.location.hash;
            if (hash) {
                Topupgim.layout("sidebar_close");
                var tab = new bootstrap.Tab(`${hash}-tab`);
                tab.show();
            }
        });

        $("#filterProductCode").on("change", () => {
            $("#filterProductCode").trigger("blur");
            $("#main-form").removeClass("animated fadeIn");
            let ajaxUrl = "member/api-purchase-list";
            const productCode = $("#filterProductCode").find(":selected").val();
            const purchaseStatus = $("#filterPurchaseStatus").find(":selected").val();
            if (productCode) {
                ajaxUrl = `${ajaxUrl}?product_code=${productCode}`;
            }
            if (purchaseStatus) {
                ajaxUrl = `${ajaxUrl}${productCode ? "&" : "?"}status=${purchaseStatus}`;
            }
            $("#main-table").DataTable().ajax.url(ajaxUrl).load();
        });

        $("#filterPurchaseStatus").on("change", () => {
            $("#filterPurchaseStatus").trigger("blur");
            $("#main-form").removeClass("animated fadeIn");
            let ajaxUrl = "member/api-purchase-list";
            const productCode = $("#filterProductCode").find(":selected").val();
            const purchaseStatus = $("#filterPurchaseStatus").find(":selected").val();
            if (productCode) {
                ajaxUrl = `${ajaxUrl}?product_code=${productCode}`;
            }
            if (purchaseStatus) {
                ajaxUrl = `${ajaxUrl}${productCode ? "&" : "?"}status=${purchaseStatus}`;
            }
            $("#main-table").DataTable().ajax.url(ajaxUrl).load();
        });
    }
}

Topupgim.onLoad(managerPurchaseList.init());
