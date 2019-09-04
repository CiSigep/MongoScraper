$(() => {
    $("#scrape").on("click", function() {
        $.ajax({
            url: "/api/article/scrape",
            method: "GET"
        });
    });

    $("#clearScraped").on("click", function() {
        $.ajax({
            url: "/api/article/scrape",
            method: "DELETE"
        });
    })
});