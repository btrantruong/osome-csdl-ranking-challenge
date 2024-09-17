"""Celery app definition

It is important to keep the Celery app in a separate module from the tasks
so that it can be imported without the possibly heavyweight task dependencies.

NOTE: When specifying the app location in the `celery` command, you should
      STILL target the `tasks` module (which imports the app from here). If you
      specify this module instead, runtime imports may not work properly.
"""

import os

from celery import Celery

# XXX use config file as fallback for these two
BROKER = f"{os.getenv('CELERY_BROKER', 'redis://localhost:6380')}/0"
BACKEND = f"{os.getenv('CELERY_BACKEND', 'redis://localhost:6380')}/0"

app = Celery("scorer_worker", backend=BACKEND, broker=BROKER)
app.autodiscover_tasks(["dante.app.scorer_worker.tasks"], force=True)
app.conf.task_default_queue = "scorer"
app.conf.broker_connection_retry_on_startup = True
