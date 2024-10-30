$(() => {
	let userId = null;

	// Forms
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

	// Login button
	$("#login-btn").on("click", (event) => {
		event.preventDefault();
		const username = $("#username").val();
		const password = $("#password").val();
		$.ajax({
			url: "http://localhost:3000/login",
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify({ username, password }),
			success: (response) => {
				userId = response.userId;
				$("#auth-forms").hide();
				$("#notes-section").show();
				loadNotes();
			},
			error: (response) => {
				const errorMessage =
					response.responseJSON?.error || "Login failed! Please try again.";
				alert(errorMessage);
			},
		});
	});

	// Register button
$("#register-btn").on("click", (event) => {
    event.preventDefault();
    const username = $("#username").val();
    const password = $("#password").val();
    $.ajax({
        url: "http://localhost:3000/register", 
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ username, password }),
        success: (response) => {
            alert(response.message); 
        },
        error: (response) => {
            const errorMessage =
                response.responseJSON?.error || "Registration failed! Please try again.";
            alert(errorMessage);
        },
    });
});

	// Create Note
	$("#create-note").on("click", (event) => {
		event.preventDefault();
		const content = $("#note-content").val().trim();
		if (!content) {
			alert("Note content cannot be empty!");
			return;
		}
		$.ajax({
			url: "http://localhost:3000/notes",
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify({ userId, content }),
			success: () => {
				alert("Note created!");
				$("#note-content").val("");
				loadNotes();
			},
			error: (response) => {
				const errorMessage =
					response.responseJSON?.error || "Failed to create note!";
				alert(errorMessage);
			},
		});
	});

	// Load Notes for User
	function loadNotes() {
		$.ajax({
			url: "http://localhost:3000/notes",
			method: "GET",
			data: { userId },
			success: (notes) => {
				$("#notes-list").empty();
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
				const errorMessage =
					response.responseJSON?.error || "Failed to load notes!";
				alert(errorMessage);
			},
		});
	}

	$(document).on("click", ".edit-note", function () {
		const noteId = $(this).parent().data("id");
		const newContent = prompt("Enter new content:");
		if (newContent === null) return;
		$.ajax({
			url: `http://localhost:3000/notes/${noteId}`,
			method: "PUT",
			contentType: "application/json",
			data: JSON.stringify({ content: newContent }),
			success: () => {
				alert("Note updated!");
				loadNotes();
			},
			error: (response) => {
				const errorMessage =
					response.responseJSON?.error || "Failed to update note!";
				alert(errorMessage);
			},
		});
	});

	// Delete Note
	$(document).on("click", ".delete-note", function () {
		const noteId = $(this).parent().data("id");
		if (confirm("Are you sure you want to delete this note?")) {
			$.ajax({
				url: `http://localhost:3000/notes/${noteId}`,
				method: "DELETE",
				success: () => {
					alert("Note deleted!");
					loadNotes();
				},
				error: (response) => {
					const errorMessage =
						response.responseJSON?.error || "Failed to delete note!";
					alert(errorMessage);
				},
			});
		}
	});

	// Logout
	$("#logout-btn").on("click", () => {
		userId = null;
		$("#notes-section").hide();
		$("#auth-forms").show();
	});
});
