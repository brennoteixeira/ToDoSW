from flask import Flask, render_template, request, jsonify
import json
import os
import uuid

app = Flask(__name__)
DATA_FILE = "tasks.json"

def load_tasks():
    if not os.path.exists(DATA_FILE):
        return []

    with open(DATA_FILE, "r") as f:
        tasks = json.load(f)

    updated = False

    for task in tasks:
        if "id" not in task:
            task["id"] = str(uuid.uuid4())
            updated = True
        if "done" not in task:
            task["done"] = False
        if "pinned" not in task:
            task["pinned"] = False

    if updated:
        save_tasks(tasks)

    return tasks

def save_tasks(tasks):
    with open(DATA_FILE, "w") as f:
        json.dump(tasks, f)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/tasks", methods=["GET"])
def get_tasks():
    return jsonify(load_tasks())

@app.route("/tasks", methods=["POST"])
def add_task():
    data = request.json
    tasks = load_tasks()

    tasks.append({
        "id": str(uuid.uuid4()),
        "text": data["text"],
        "done": False,
        "pinned": False
    })

    save_tasks(tasks)
    return jsonify(success=True)

@app.route("/tasks/<task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.json
    tasks = load_tasks()

    for task in tasks:
        if task["id"] == task_id:
            task.update(data)
            break

    save_tasks(tasks)
    return jsonify(success=True)

@app.route("/tasks/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    tasks = load_tasks()
    tasks = [t for t in tasks if t["id"] != task_id]
    save_tasks(tasks)
    return jsonify(success=True)

if __name__ == "__main__":
    app.run(debug=True)

    @app.route("/tasks/reset", methods=["POST"])
    def reset_tasks():
      save_tasks([])
      return jsonify(success=True)