"use strict";

class frontendProduct {
    static renderReviews(data) {
        let reviewScopeHtml = "";
        if (Array.isArray(data) && data.length) {
            data.forEach((value) => {
                const score = parseInt(value.score);
                const memberProfileImage = Topupgim.safeAvatar(value.member_profile_image);
                let rateStarHtml = "";
                let reviewTextHtml = "";
                for (let i = 0; i < score; i++) {
                    rateStarHtml = `
                        ${rateStarHtml}
                        <i class="fa fa-fw fa-star text-warning"></i>
                    `;
                }
                if (value.text) {
                    reviewTextHtml = `
                        <div class="d-flex mt-2">
                            <div class="px-3 py-1 border-bottom bg-body-light" style="border-radius: 22px;">
                                <p class="fs-normal mb-0">${value.text}</p>
                            </div>
                        </div>
                    `;
                }
                reviewScopeHtml = `
                    ${reviewScopeHtml}
                    <div class="d-flex flex-column mb-3">
                        <div class="d-flex">
                            <img class="img-avatar border" style="width: 35px; height: 35px" src="${memberProfileImage}">
                            <div class="d-flex flex-column ms-3">
                                <span class="fs-sm fw-semibold m-0">${value.member_name}</span>
                                <div class="d-flex align-items-center">
                                    <div class="fs-xs align-self-center me-1">
                                        ${rateStarHtml}
                                    </div>
                                    <p class="text-muted mb-0 fs-xs"> &bull; ${value.time_ago}</p>
                                </div>
                                <span class="fs-sm"><span class="text-muted">Item: </span>${value.denomination_name}</span>
                                ${reviewTextHtml}
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        $("#review-scope-list").html(reviewScopeHtml);
    }

    static loadReviews(page = 1) {
        const productCode = $('meta[name="product-code"]').attr("content");
        const filter = $('input[name="reviewFilter"]:checked').val();
        if (window.reviewAmount > 0) {
            $("#review-scope-frame-list").css("visibility", "hidden");
            $("#review-scope-list-loading").removeClass("d-none");
        } else {
            $("#review-scope").addClass("d-none");
            $("#review-scope-empty").addClass("d-none");
            $("#review-scope-loading").removeClass("d-none");
        }
        window.isReviewLoading = true;
        fetch(`${location.origin}/review/api-review-list?product_code=${productCode}&page=${page}&filter=${filter}`)
            .then((res) => res.json())
            .then((response) => {
                const amount = parseInt(response.paging?.amount ?? 0);
                const nextPage = parseInt(response.paging?.next_page) || null;
                const prevPage = parseInt(response.paging?.prev_page) || null;
                window.reviewAmount = amount;
                window.reviewNextPage = nextPage;
                window.reviewPrevPage = prevPage;
                if (amount > 0) {
                    const scoreAverage = parseFloat(response.scores?.score_average).toFixed(1);
                    const averageOne = (parseFloat(response.scores?.score_one) / amount) * 100;
                    const averageTwo = (parseFloat(response.scores?.score_two) / amount) * 100;
                    const averageThree = (parseFloat(response.scores?.score_three) / amount) * 100;
                    const averageFour = (parseFloat(response.scores?.score_four) / amount) * 100;
                    const averageFive = (parseFloat(response.scores?.score_five) / amount) * 100;
                    $("#review-score-average").text(scoreAverage);
                    $("#review-score-total").text(`(${amount}) Ulasan`);
                    $("#review-score-five").text(response.scores?.score_five_text);
                    $("#review-score-four").text(response.scores?.score_four_text);
                    $("#review-score-three").text(response.scores?.score_three_text);
                    $("#review-score-two").text(response.scores?.score_two_text);
                    $("#review-score-one").text(response.scores?.score_one_text);
                    $("#review-score-progress-five").css("width", `${averageFive}%`);
                    $("#review-score-progress-four").css("width", `${averageFour}%`);
                    $("#review-score-progress-three").css("width", `${averageThree}%`);
                    $("#review-score-progress-two").css("width", `${averageTwo}%`);
                    $("#review-score-progress-one").css("width", `${averageOne}%`);
                    const el = $("#review-score-star");
                    el.empty();
                    el.raty({
                        score: scoreAverage,
                        number: el.data("number") || 5,
                        cancel: el.data("cancel") || false,
                        target: el.data("target") || false,
                        targetScore: el.data("target-score") || false,
                        precision: el.data("precision") || false,
                        cancelOff: el.data("cancel-off") || "fa fa-fw fa-times-circle text-danger",
                        cancelOn: el.data("cancel-on") || "fa fa-fw fa-times-circle",
                        starHalf: el.data("star-half") || "fa fa-fw fa-star-half-alt text-warning",
                        starOff: el.data("star-off") || "far fa-fw fa-star text-muted",
                        starOn: el.data("star-on") || "fa fa-fw fa-star text-warning",
                        starType: "i",
                        hints: ["Sangat Buruk", "Buruk", "Cukup", "Baik", "Sangat Baik"],
                        readOnly: el.data("readonly") || false,
                        space: true,
                        click: function (score, _evt) {
                            $("#rateScore").val(score);
                        }
                    });
                    this.renderReviews(response.data);
                    $("#review-nav-next").removeClass("d-none");
                    $("#review-nav-prev").removeClass("d-none");
                    $("#review-nav-next").prop("disabled", nextPage ? false : true);
                    $("#review-nav-prev").prop("disabled", prevPage ? false : true);
                    $("#review-scope").removeClass("d-none");
                } else {
                    $("#review-nav-next").addClass("d-none");
                    $("#review-nav-prev").addClass("d-none");
                    $("#review-scope-empty").removeClass("d-none");
                }
            })
            .catch((_error) => {
                $("#review-scope-empty").removeClass("d-none");
            })
            .finally(() => {
                if (window.reviewAmount > 0) {
                    $("#review-scope-frame-list").css("visibility", "visible");
                    $("#review-scope-list-loading").addClass("d-none");
                }
                $("#review-scope-loading").addClass("d-none");
                window.isReviewLoading = false;
            });
    }

    static initValidation() {
        Topupgim.helpers("jq-validation");
        $(".js-validation-product-start-transaction").validate({
            rules: {
                productDenomination: {
                    required: true
                },
                productPaymentMethod: {
                    required: true
                },
                memberWhatsAppNo: {
                    required: true,
                    minlength: 8,
                    digits: true
                }
            },
            submitHandler: function (_form) {
                return false;
            }
        });
    }

    static responsive(isReviewShown, isRankingShown) {
        const viewportWith = document.documentElement.clientWidth || window.innerWidth;
        if (viewportWith <= 768) {
            if ($("#parent-content-review-mobile").find("#content-review").length === 0) {
                $("#content-review").prependTo($("#parent-content-review-mobile"));
            }
            if ($("#parent-content-ranking-mobile").find("#content-ranking").length === 0) {
                $("#content-ranking").prependTo($("#parent-content-ranking-mobile"));
            }
            if (isReviewShown) {
                $("#parent-content-review-mobile").removeClass("d-none");
            }
            if (isRankingShown) {
                $("#parent-content-ranking-mobile").removeClass("d-none");
            }
        } else {
            if ($("#parent-content-review").find("#content-review").length === 0) {
                $("#content-review").prependTo($("#parent-content-review"));
            }
            if ($("#parent-content-ranking").find("#content-ranking").length === 0) {
                $("#content-ranking").prependTo($("#parent-content-ranking"));
            }
            if (isReviewShown) {
                $("#parent-content-review").removeClass("d-none");
            }
            if (isRankingShown) {
                $("#parent-content-ranking").removeClass("d-none");
            }
        }
    }

    static async init() {
        this.initValidation();
        Topupgim.helpers("input-text-phone");
        Topupgim.helpers("input-text-phone", { selector: "#resellerPIN", maxLength: 6 });

        const isReviewShown = $("#parent-content-review-mobile").data("shown") ? true : false;
        const isRankingShown = $("#parent-content-ranking-mobile").data("shown") ? true : false;
        this.responsive(isReviewShown, isRankingShown);
        if (isReviewShown) {
            this.loadReviews();
        }

        window.addEventListener("pageshow", function (_event) {
            $(".product-block").removeClass("block-mode-loading");
            Topupgim.loader("hide");
            const navigation = String(window.performance.getEntriesByType("navigation")?.[0]?.type);
            if (window.isRefreshedOnBackForward !== "yes" && navigation === "back_forward") {
                window.isRefreshedOnBackForward = "yes";
                return location.reload(true);
            }
        });
        window.addEventListener("beforeunload", function (e) {
            window.isLeavingPage = "yes";
        });

        $('input[type=radio][name="reviewFilter"]').on("change", () => {
            this.loadReviews();
        });

        $("#review-nav-next").on("click", () => {
            if (!window.isReviewLoading) this.loadReviews(window.reviewNextPage);
        });

        $("#review-nav-prev").on("click", () => {
            if (!window.isReviewLoading) this.loadReviews(window.reviewPrevPage);
        });

        //refresh column adjust
        const observer = new MutationObserver((mutationList, _observer) => {
            mutationList.forEach(function (mutation) {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    frontendProduct.responsive(isReviewShown, isRankingShown);
                }
            });
        });
        observer.observe(document.querySelector("#page-container"), { attributes: true });
        const section = Topupgim.getQueryParam("section");
        if (section) {
            Topupgim.smoothScrollTo(`#${section}`);
        }

        //rich text pop-up
        if ($("#modal-product-rich-text").length) {
            const productCode = $('meta[name="product-code"]').attr("content");
            const delayed = $("#modal-product-rich-text").data("delayed-time");
            const updatedAt = $("#modal-product-rich-text").data("updated-at") || "";
            const lastUpdatedAt = localStorage.getItem(`${productCode}_rich_text__updated_at`) || "";
            if (`${lastUpdatedAt}` !== `${updatedAt}`) {
                setTimeout(() => {
                    $("#modal-product-rich-text").modal("show");
                }, parseInt(delayed) || 1000);
            }
            $("#rich-text-acknowledge").on("click", () => {
                localStorage.setItem(`${productCode}_rich_text__updated_at`, updatedAt);
            });
        }
    }
}

Topupgim.onLoad(frontendProduct.init());
