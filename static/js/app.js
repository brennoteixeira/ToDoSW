document.addEventListener("DOMContentLoaded", () => {

    const taskList = document.getElementById("taskList");
    const input = document.getElementById("taskInput");
    const statusBar = document.getElementById("status");

    async function loadTasks() {
        const res = await fetch("/tasks");
        let tasks = await res.json();

        // status conta tudo
        const total = tasks.length;
        const completed = tasks.filter(t => t.done).length;

        // MOSTRAR APENAS ATIVAS
        tasks = tasks.filter(t => !t.done);

        // ordenação: fixadas primeiro
        tasks.sort((a, b) => b.pinned - a.pinned);

        taskList.innerHTML = "";

        tasks.forEach(task => {
            const li = document.createElement("li");
            if (task.pinned) li.classList.add("pinned");

            const text = document.createElement("span");
            text.textContent = task.text;

            const actions = document.createElement("div");
            actions.className = "actions";

            // ✅ CONCLUIR → SOME DA LISTA
            const doneBtn = document.createElement("button");
            doneBtn.textContent = "✓";
            doneBtn.title = "Concluir missão";
            doneBtn.onclick = async () => {
                await updateTask(task.id, { done: true });
            };

            actions.appendChild(doneBtn);

            // 📌 FIXAR / DESFIXAR
            const pinBtn = document.createElement("button");
            pinBtn.textContent = task.pinned ? "↓" : "↑";
            pinBtn.title = task.pinned ? "Desfixar missão" : "Fixar missão";
            pinBtn.onclick = async () => {
                await updateTask(task.id, { pinned: !task.pinned });
            };

            actions.appendChild(pinBtn);

            // ❌ EXCLUIR
            const delBtn = document.createElement("button");
            delBtn.textContent = "×";
            delBtn.title = "Excluir missão";
            delBtn.onclick = async () => {
                await deleteTask(task.id);
            };

            actions.appendChild(delBtn);

            li.append(text, actions);
            taskList.appendChild(li);
        });

        statusBar.textContent =
            `${tasks.length} ativas • ${completed} concluídas • ${total} total`;
    }

    async function addTask() {
        const text = input.value.trim();
        if (!text) return;

        await fetch("/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        input.value = "";
        loadTasks();
    }

    async function updateTask(id, data) {
        await fetch(`/tasks/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        loadTasks();
    }

    async function deleteTask(id) {
        await fetch(`/tasks/${id}`, { method: "DELETE" });
        loadTasks();
    }

    function resetTasks() {
    if (!confirm("Tem certeza que deseja resetar TODAS as missões?")) return;

    tasks = [];
    localStorage.removeItem("tasks");
    renderTasks();
    updateStatus("Todas as missões foram resetadas.");
}

    // expor para o HTML
    window.addTask = addTask;
    window.resetTasks = resetTasks;

    loadTasks();
});

const input = document.getElementById("taskInput");

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        addTask();
    }
});