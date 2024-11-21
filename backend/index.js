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

// Centralized function to execute queries
const executeQuery = async (query, params) => {
    console.log("Executing query:", query, "with params:", params); // Debugging log
    const client = await pool.connect();
    try {
        const result = await client.query(query, params);
        console.log("Query result:", result); // Debugging log
        return result;
    } catch (error) {
        console.error("Database query error:", error); // Debugging log
        throw error;
    } finally {
        client.release();
    }
};

// Register User
app.post("/register", async (req, res) => {
    console.log("POST /register request received with body:", req.body); // Debugging log
    try {
        const { username, password } = req.body;
        await executeQuery(
            "INSERT INTO users (username, password) VALUES ($1, $2)",
            [username, password],
        );
        res.json({ message: "User registered!" });
    } catch (error) {
        console.error("Registration error:", error); // Debugging log
        res.status(500).json({ error: "Registration failed!" });
    }
});

// Login User
app.post("/login", async (req, res) => {
    console.log("POST /login request received with body:", req.body); // Debugging log
    try {
        const { username, password } = req.body;
        console.log("Received login request for username:", username); // Debugging log
        
        const result = await executeQuery(
            "SELECT * FROM users WHERE username = $1 AND password = $2",
            [username, password],
        );

        // Check if user exists
        const user = result.rows[0];
        if (user) {
            console.log("User found, login successful"); // Debugging log
            res.json({ message: "Login successful", userId: user.id });
        } else {
            console.log("User not found or invalid credentials"); // Debugging log
            res.status(401).json({ error: "Invalid credentials!" });
        }
    } catch (error) {
        console.error("Error in /login route:", error); // Debugging log
        res.status(500).json({ error: "Login failed! Please check server logs for details." });
    }
});

// Create Note
app.post("/notes", async (req, res) => {
    console.log("POST /notes request received with body:", req.body); // Debugging log
    const { userId, content } = req.body;
    if (!userId || !content) {
        console.log("Missing userId or content"); // Debugging log
        return res.status(400).json({ error: "User ID and content are required" });
    }
    try {
        await executeQuery("INSERT INTO notes (user_id, content) VALUES ($1, $2)", [
            userId,
            content,
        ]);
        res.json({ message: "Note created!" });
    } catch (error) {
        console.error("Error creating note:", error); // Debugging log
        res.status(500).json({ error: "Failed to create note!" });
    }
});

// Get Notes
app.get("/notes", async (req, res) => {
    console.log("GET /notes request received with query params:", req.query); // Debugging log
    const { userId } = req.query;
    if (!userId) {
        console.log("Missing userId in query"); // Debugging log
        return res.status(400).json({ error: "User ID is required" });
    }
    try {
        const result = await executeQuery(
            "SELECT * FROM notes WHERE user_id = $1",
            [userId],
        );
        console.log("Retrieved notes:", result.rows); // Debugging log
        res.json(result.rows);
    } catch (error) {
        console.error("Error retrieving notes:", error); // Debugging log
        res.status(500).json({ error: "Failed to retrieve notes!" });
    }
});

// Update Note
app.put("/notes/:noteId", async (req, res) => {
    console.log(`PUT /notes/${req.params.noteId} request received with body:`, req.body); // Debugging log
    const { noteId } = req.params;
    const { content } = req.body;
    if (!content) {
        console.log("Missing content in request body"); // Debugging log
        return res.status(400).json({ error: "Content is required" });
    }
    try {
        await executeQuery("UPDATE notes SET content = $1 WHERE id = $2", [
            content,
            noteId,
        ]);
        res.json({ message: "Note updated!" });
    } catch (error) {
        console.error("Error updating note:", error); // Debugging log
        res.status(500).json({ error: "Failed to update note!" });
    }
});

// Delete Note
app.delete("/notes/:noteId", async (req, res) => {
    console.log(`DELETE /notes/${req.params.noteId} request received`); // Debugging log
    const { noteId } = req.params;
    try {
        await executeQuery("DELETE FROM notes WHERE id = $1", [noteId]);
        res.json({ message: "Note deleted!" });
    } catch (error) {
        console.error("Error deleting note:", error); // Debugging log
        res.status(500).json({ error: "Failed to delete note!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});