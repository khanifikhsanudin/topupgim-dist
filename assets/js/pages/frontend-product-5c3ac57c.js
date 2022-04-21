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
                    reviewTextHtml = `<p class="fs-normal mb-0 mt-2">${value.text}</p>`;
                }
                reviewScopeHtml = `
                    ${reviewScopeHtml}
                    <div class="d-flex flex-column mb-3">
                        <div class="d-flex">
                            <img class="img-avatar border" style="width: 35px; height: 35px" src="${memberProfileImage}">
                            <div class="d-flex flex-column ms-3">
                                <span class="fs-sm fw-semibold m-0">${value.member_name}</span>
                                <div class="d-flex align-items-center">
                                    <div class="fs-xs align-self-center me-2">
                                        ${rateStarHtml}
                                    </div>
                                    <span class="text-muted fs-xs">(${value.denomination_name})</span>
                                    <span class="text-muted fs-xs ms-1">${value.time_ago}</span>
                                </div>
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
        $("#review-scope").addClass("d-none");
        $("#review-scope-empty").addClass("d-none");
        $("#review-scope-loading").removeClass("d-none");
        fetch(`${location.origin}/review/api-review-list?product_code=${productCode}&page=${page}`)
            .then((res) => res.json())
            .then((response) => {
                const amount = parseInt(response.paging?.amount ?? 0);
                const nextPage = parseInt(response.paging?.next_page) || null;
                const prevPage = parseInt(response.paging?.prev_page) || null;
                if (amount > 0) {
                    const scoreAverage = parseFloat(response.scores?.score_average).toFixed(1);
                    const averageOne = (parseFloat(response.scores?.score_one) / amount) * 100;
                    const averageTwo = (parseFloat(response.scores?.score_two) / amount) * 100;
                    const averageThree = (parseFloat(response.scores?.score_three) / amount) * 100;
                    const averageFour = (parseFloat(response.scores?.score_four) / amount) * 100;
                    const averageFive = (parseFloat(response.scores?.score_five) / amount) * 100;
                    $("#review-score-average").text(scoreAverage);
                    $("#review-score-total").text(`(${amount}) Ulasan`);
                    $("#review-score-five").text(response.scores?.score_five);
                    $("#review-score-four").text(response.scores?.score_four);
                    $("#review-score-three").text(response.scores?.score_three);
                    $("#review-score-two").text(response.scores?.score_two);
                    $("#review-score-one").text(response.scores?.score_one);
                    $("#review-score-progress-five").css("width", `${averageFive}%`);
                    $("#review-score-progress-four").css("width", `${averageFour}%`);
                    $("#review-score-progress-three").css("width", `${averageThree}%`);
                    $("#review-score-progress-two").css("width", `${averageTwo}%`);
                    $("#review-score-progress-one").css("width", `${averageOne}%`);
                    const el = $("#review-score-star");
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
                    if (nextPage) {
                        $("#review-nav-next").prop("disabled", false);
                        $("#review-nav-next").on("click", () => {
                            this.loadReviews(nextPage);
                        });
                    } else {
                        $("#review-nav-next").prop("disabled", true);
                    }
                    if (prevPage) {
                        $("#review-nav-prev").prop("disabled", false);
                        $("#review-nav-prev").on("click", () => {
                            this.loadReviews(prevPage);
                        });
                    } else {
                        $("#review-nav-prev").prop("disabled", true);
                    }
                    $("#review-scope").removeClass("d-none");
                } else {
                    $("#review-scope-empty").removeClass("d-none");
                }
            })
            .catch((_error) => {
                $("#review-scope-empty").removeClass("d-none");
            })
            .finally(() => {
                $("#review-scope-loading").addClass("d-none");
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

    static async init() {
        this.initValidation();
        this.loadReviews();
        Topupgim.helpers("input-text-phone");
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
    }
}

Topupgim.onLoad(frontendProduct.init());
