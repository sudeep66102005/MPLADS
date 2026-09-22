"""Single-worker free-host startup: migrations then explicit demo/bootstrap initialization."""
import os
from alembic import command
from alembic.config import Config
from app.core.config import settings

def initialize():
    command.upgrade(Config('alembic.ini'), 'head')
    if settings.DEMO_MODE:
        from app.seed import seed
        seed()
    elif os.environ.get('BOOTSTRAP_ADMIN_PASSWORD'):
        from app.bootstrap import main
        main()

if __name__ == '__main__':
    initialize()
    os.execvp('uvicorn', ['uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', os.environ.get('PORT','8000')])
