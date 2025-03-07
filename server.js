const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

// ใช้งาน Middleware
app.use(cors({ origin: "*" })); // อนุญาตให้ทุกโดเมนเข้าถึง API
app.use(express.json());

const TASKS_FILE = "tasks.json";
const STUDY_FILE = "study_time.json";

// 📌 โหลด Task จากไฟล์ JSON
function loadTasks() {
    if (!fs.existsSync(TASKS_FILE)) return [];
    const data = fs.readFileSync(TASKS_FILE);
    return JSON.parse(data);
}

// 📌 บันทึก Task ลงไฟล์ JSON
function saveTasks(data) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));
}

// 📌 API: ดึง Task ทั้งหมด
app.get("/tasks", (req, res) => {
    res.json(loadTasks());
});

// 📌 API: เพิ่ม Task ใหม่ (เปลี่ยนจาก title เป็น subject)
app.post("/tasks", (req, res) => {
    const { subject, color = "#5A91E6", completed = false } = req.body; // ✅ กำหนดค่าเริ่มต้นของสี
    if (!subject) {
        return res.status(400).json({ error: "Missing task subject" });
    }

    const tasks = loadTasks();
    const newTask = { id: Date.now(), subject, color, completed };
    tasks.push(newTask);
    saveTasks(tasks);

    res.json({ message: "✅ Task added successfully", task: newTask });
});

// 📌 API: แก้ไข Task (เปลี่ยนสถานะ)
app.put("/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    const tasks = loadTasks();
    
    const taskIndex = tasks.findIndex(task => task.id == id);
    if (taskIndex === -1) {
        return res.status(404).json({ error: "Task not found" });
    }

    tasks[taskIndex].completed = completed;
    saveTasks(tasks);
    
    res.json({ message: "✅ Task updated successfully", task: tasks[taskIndex] });
});

// 📌 API: ลบ Task
app.delete("/tasks/:id", (req, res) => {
    const { id } = req.params;
    let tasks = loadTasks();

    const newTasks = tasks.filter(task => task.id != id);
    if (tasks.length === newTasks.length) {
        return res.status(404).json({ error: "Task not found" });
    }

    saveTasks(newTasks);
    res.json({ message: "🗑 Task deleted successfully" });
});

/* ======================== STUDY TIME TRACKER (Pomodoro Timer) ======================== */

// 📌 โหลด Study Time จากไฟล์ JSON
function loadStudyTime() {
    if (!fs.existsSync(STUDY_FILE)) return [];
    const data = fs.readFileSync(STUDY_FILE);
    return JSON.parse(data);
}

// 📌 บันทึก Study Time ลงไฟล์ JSON
function saveStudyTime(data) {
    fs.writeFileSync(STUDY_FILE, JSON.stringify(data, null, 2));
}

// 📌 API: ดึงข้อมูลเวลาที่จับทั้งหมด
app.get("/study-time", (req, res) => {
    res.json(loadStudyTime());
});

// 📌 API: เพิ่ม Study Time ใหม่
app.post("/study-time", (req, res) => {
    const { subject, timeSpent } = req.body;
    if (!subject || !timeSpent) {
        return res.status(400).json({ error: "Missing subject or timeSpent" });
    }

    const studyData = loadStudyTime();
    studyData.push({ subject, timeSpent, date: new Date().toISOString() });
    saveStudyTime(studyData);

    res.json({ message: "✅ Study time saved successfully" });
});

// 📌 Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});