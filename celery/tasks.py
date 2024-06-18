from celery import Celery

app = Celery(
    "tasks", backend="redis://localhost:6379/0", broker="redis://localhost:6379/0"
)


@app.task
def add(x, y):
    print(x + y)
    return x + y
