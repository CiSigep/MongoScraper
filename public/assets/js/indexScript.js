$(() => {
    $("#scrape").on("click", function () {
        $.ajax({
            url: "/api/article/scrape",
            method: "GET"
        }).done(data => {
            let articleContainer = $("#articleContainer");
            articleContainer.empty();
            data.forEach((ele, idx) => {
                let cardDiv = $("<div>").addClass("card mb-2").attr("id", "article-" + idx);

                let header = $("<div>").addClass("card-header");
                header.append($("<a>").attr("href", ele.url).attr("id", "title-" + idx).text(ele.title));

                let body = $("<div>").addClass("card-body").append($("<div>").attr("id", "summary-" + idx).text(ele.summary));
                let btnDiv = $("<div>").addClass("text-right").append($("<button>").addClass("saveBtn btn btn-success").attr("data-which", idx).text("Save").attr("data-id", ele._id));
                body.append(btnDiv);
                cardDiv.append(header, body);

                articleContainer.append(cardDiv);
            });
        });
    });

    $("#clearScraped").on("click", function () {
        $.ajax({
            url: "/api/article/scrape",
            method: "DELETE"
        }).done(data => {
            let cardDiv = $("<div>").addClass("card").append($("<div>").addClass("card-body").text("It seems there is nothing here, scrape some articles."));

            $("#articleContainer").empty();
            $("#articleContainer").append(cardDiv);
        });
    });

    $(document).on("click", ".saveBtn", function () {
        let which = $(this).attr("data-which");

        let articleData = {
            title: $("#title-" + which).text(),
            url: $("#title-" + which).attr("href"),
            summary: $("#summary-" + which).text(),
            scrapeId: $(this).attr("data-id")
        }

        $.ajax({
            url: "/api/article",
            method: "POST",
            data: articleData
        }).done(data => {
            $("#article-" + which).remove();

            if ($("#articleContainer").children().length === 0) {
                let cardDiv = $("<div>").addClass("card").append($("<div>").addClass("card-body").text("It seems there is nothing here, scrape some articles."));

                $("#articleContainer").append(cardDiv);
            }
        });
    });

});