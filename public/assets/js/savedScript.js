$(() => {
    // Clears out the saved articles
    $("#clearSaved").on("click", function () {
        $.ajax({
            url: "/api/article/saved",
            method: "DELETE"
        }).done(data => {
            let cardDiv = $("<div>").addClass("card").append($("<div>").addClass("card-body").text("It seems there is nothing here, save some articles."));

            $("#articleContainer").empty();
            $("#articleContainer").append(cardDiv);
        });
    });

    // Deletes a saved article
    $(".deleteBtn").on("click", function () {
        $.ajax({
            url: "/api/article/saved/" + $(this).attr("data-id"),
            method: "DELETE"
        }).done(data => {
            $("#article-" + $(this).attr("data-which")).remove();

            if ($("#articleContainer").children().length === 0) {
                let cardDiv = $("<div>").addClass("card").append($("<div>").addClass("card-body").text("It seems there is nothing here, save some articles."));

                $("#articleContainer").append(cardDiv);
            }
        });
    });

    // Gets the notes for an article
    $(".noteBtn").on("click", function () {
        $.ajax({
            url: "/api/article/" + $(this).attr("data-id"),
            method: "GET"
        }).done(data => {
            $("#notesId").text(data._id);
            $("#addedNotes").empty();

            $("#noteSave").attr("data-id", data._id);

            data.notes.forEach((ele, idx) => {
                let noteDiv = $("<div>").addClass("d-flex justify-content-between").append($("<div>").text(ele.body));
                noteDiv.append($("<div>").append($("<button>").addClass("btn btn-danger px-1 py-0 noteDelete").html("&times;").attr("data-id", ele._id)));
                $("#addedNotes").append(noteDiv);
            });

            $(".modal").modal("show");
        });
    });

    // Saves a note for the article
    $("#noteSave").on("click", function () {
        let text = $("#noteInput").val();
        
        $.ajax({
            url: "/api/article/" + $(this).attr("data-id"),
            method: "POST",
            data: {
                body: text
            }
        }).done(data => {
            $("#noteInput").val("");
            let noteDiv = $("<div>").addClass("d-flex justify-content-between").append($("<div>").text(data.body));
            noteDiv.append($("<div>").append($("<button>").addClass("btn btn-danger px-1 py-0 noteDelete").html("&times;").attr("data-id", data._id)));
            $("#addedNotes").append(noteDiv);
        });
    });

    // Deletes a note for the article
    $(document).on("click", ".noteDelete", function () {
        let button = $(this);
        $.ajax({
            url: "/api/note/" + button.attr("data-id"),
            method: "DELETE"
        }).done(data => {
            button.parent().parent().remove();
        });
    });
});