$(document).ready(function () {
    let userId = null;

    // Append HTML structure for the app
    $("body").append(`
        <div id="auth-forms">
            <input type="text" id="username" placeholder="Username" required>
            <input type="password" id="password" placeholder="Password" required>
            <button id="register-btn">Register</button>
            <button id="login-btn">Login</button>
        </div>
        <div id="notes-section" style="display:none;">
            <textarea id="note-content" placeholder="Write your note here..."></textarea>
            <button id="create-note">Create Note</button>
            <div id="notes-list"></div>
            <button id="logout-btn">Logout</button>
        </div>
    `);

    // Register user
    $("#register-btn").on("click", (event) => {
        event.preventDefault();
        const username = $("#username").val();
        const password = $("#password").val();

        if (!username || !password) {
            alert("Please provide both username and password!");
            return;
        }

        console.log("Sending registration request with username:", username);

        $.ajax({
            url: "http://localhost:3000/register",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ username, password }),
            success: (response) => {
                console.log("Registration successful:", response);
                alert(response.message);
                $("#username").val('');
                $("#password").val('');
            },
            error: (response) => {
                console.error("Registration error:", response);
                const errorMessage = response.responseJSON?.error || "Registration failed! Please try again.";
                alert(errorMessage);
            },
        });
    });

    // Login user
    $("#login-btn").on("click", (event) => {
        event.preventDefault();
        const username = $("#username").val();
        const password = $("#password").val();

        if (!username || !password) {
            alert("Please provide both username and password!");
            return;
        }

        console.log("Sending login request with username:", username);

        $.ajax({
            url: "http://localhost:3000/login",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ username, password }),
            success: (response) => {
                console.log("Login successful:", response);
                userId = response.userId;
                $("#auth-forms").hide();
                $("#notes-section").show();
                loadNotes();  // Load notes after login
            },
            error: (response) => {
                console.error("Login error:", response);
                const errorMessage = response.responseJSON?.error || "Login failed! Please try again.";
                alert(errorMessage);
            },
        });
    });

    // Create a new note
    $("#create-note").on("click", (event) => {
        event.preventDefault();
        const content = $("#note-content").val().trim();

        if (!content) {
            alert("Note content cannot be empty!");
            return;
        }

        if (!userId) {
            alert("User is not logged in.");
            return;
        }

        console.log("Sending create note request with userId:", userId, "and content:", content);

        $.ajax({
            url: "http://localhost:3000/notes",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ userId, content }),
            success: (response) => {
                console.log("Note created successfully:", response);
                alert("Note created!");
                $("#note-content").val("");  // Clear input
                loadNotes();  // Reload notes after creation
            },
            error: (response) => {
                console.error("Create note error:", response);
                const errorMessage = response.responseJSON?.error || "Failed to create note!";
                alert(errorMessage);
            },
        });
    });

    // Load notes for the logged-in user
    function loadNotes() {
        if (!userId) {
            console.warn("User is not logged in, cannot load notes.");
            alert("User is not logged in.");
            return;
        }

        console.log("Loading notes for userId:", userId);

        $.ajax({
            url: "http://localhost:3000/notes",
            method: "GET",
            data: { userId },
            success: (notes) => {
                console.log("Notes loaded successfully:", notes);
                $("#notes-list").empty(); // Clear previous notes
                notes.forEach((note) => {
                    $("#notes-list").append(`
                        <div data-id="${note.id}">
                            <p>${note.content}</p>
                            <button class="edit-note">Edit</button>
                            <button class="delete-note">Delete</button>
                        </div>
                    `);
                });
            },
            error: (response) => {
                console.error("Error loading notes:", response);
                const errorMessage = response.responseJSON?.error || "Failed to load notes!";
                alert(errorMessage);
            },
        });
    }

    // Edit note
    $(document).on("click", ".edit-note", function () {
        const noteId = $(this).parent().data("id");
        const newContent = prompt("Enter new content:");
        if (newContent === null) return;

        console.log("Sending edit note request for noteId:", noteId, "with new content:", newContent);

        $.ajax({
            url: `http://localhost:3000/notes/${noteId}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify({ content: newContent }),
            success: (response) => {
                console.log("Note updated successfully:", response);
                alert("Note updated!");
                loadNotes();  // Reload notes after editing
            },
            error: (response) => {
                console.error("Edit note error:", response);
                const errorMessage = response.responseJSON?.error || "Failed to update note!";
                alert(errorMessage);
            },
        });
    });

    // Delete note
    $(document).on("click", ".delete-note", function () {
        const noteId = $(this).parent().data("id");
        if (confirm("Are you sure you want to delete this note?")) {
            console.log("Sending delete note request for noteId:", noteId);

            $.ajax({
                url: `http://localhost:3000/notes/${noteId}`,
                method: "DELETE",
                success: (response) => {
                    console.log("Note deleted successfully:", response);
                    alert("Note deleted!");
                    loadNotes();  // Reload notes after deletion
                },
                error: (response) => {
                    console.error("Delete note error:", response);
                    const errorMessage = response.responseJSON?.error || "Failed to delete note!";
                    alert(errorMessage);
                },
            });
        }
    });

    // Logout
    $("#logout-btn").on("click", () => {
        console.log("Logging out user...");
        userId = null;
        $("#notes-section").hide();
        $("#auth-forms").show();
    });
});