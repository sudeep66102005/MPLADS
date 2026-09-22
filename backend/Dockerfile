FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && useradd --create-home appuser
COPY . .
RUN mkdir -p /app/data/uploads && chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
CMD ["python", "-m", "app.startup"]
