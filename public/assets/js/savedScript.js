$(() => {
    $("#clearSaved").on("click", function() {
        $.ajax({
            url: "/api/article/saved",
            method: "DELETE"
        }).done(data => {
            let cardDiv = $("<div>").addClass("card").append($("<div>").addClass("card-body").text("It seems there is nothing here, save some articles."));

            $("#articleContainer").empty();
            $("#articleContainer").append(cardDiv);
        });
    });
});