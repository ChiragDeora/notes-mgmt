import express from "express";
import pkg from "pg";
import bodyParser from "body-parser";
import cors from "cors";



const app = express();
app.use(bodyParser.json());
app.use(cors());
const { Pool } = pkg;

const pool = new Pool({
    user: "postgres",                 
    host: "localhost",            
    database: "notes",            
    password: "cHiragd123",           
    port: 5433,                   
});


// Register User
app.post("/register", async (req, res) => {
	try {
		const { username, password } = req.body;
		await executeQuery(
			"INSERT INTO users (username, password) VALUES ($1, $2)",
			[username, password],
		);
		res.json({ message: "USER REGISTERED!" });
	} catch (error) {
		res.status(500).json({ error: "Registration failed!" });
	}
});

// Login User
app.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body;
		console.log("Received login request for username:", username);

		
		console.log("Connecting to the database...");
		const result = await pool.query(
			"SELECT * FROM users WHERE username = $1 AND password = $2",
			[username, password],
		);

		console.log("Query result:", result);

		// Check if user exists
		const user = result.rows[0];
		if (user) {
			console.log("User found, login successful");
			res.json({ message: "Login successful", userId: user.id });
		} else {
			console.log("User not found or invalid credentials");
			res.status(401).json({ error: "Invalid Credentials!" });
		}
	} catch (error) {
		console.error("Error in /login route:", error);
		res
			.status(500)
			.json({ error: "Login failed! Please check server logs for details." });
	}
});

// Create Note
app.post("/notes", async (req, res) => {
	const { userId, content } = req.body;
	if (!userId || !content) {
		return res.status(400).json({ error: "User ID and content are required" });
	}
	try {
		await executeQuery("INSERT INTO notes (user_id, content) VALUES ($1, $2)", [
			userId,
			content,
		]);
		res.json({ message: "NOTE CREATED!" });
	} catch (error) {
		res.status(500).json({ error: "Failed to create note!" });
	}
});

// Get Notes
app.get("/notes", async (req, res) => {
	const { userId } = req.query;
	try {
		const result = await executeQuery(
			"SELECT * FROM notes WHERE user_id = $1",
			[userId],
		);
		res.json(result.rows);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve notes!" });
	}
});

// Update Note
app.put("/notes/:noteId", async (req, res) => {
	const { noteId } = req.params;
	const { content } = req.body;
	try {
		await executeQuery("UPDATE notes SET content = $1 WHERE id = $2", [
			content,
			noteId,
		]);
		res.json({ message: "Note Updated!" });
	} catch (error) {
		res.status(500).json({ error: "Failed to update note!" });
	}
});

// Delete Note
app.delete("/notes/:noteId", async (req, res) => {
	const { noteId } = req.params;
	try {
		await executeQuery("DELETE FROM notes WHERE id = $1", [noteId]);
		res.json({ message: "Note Deleted!" });
	} catch (error) {
		res.status(500).json({ error: "Failed to delete note!" });
	}
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
