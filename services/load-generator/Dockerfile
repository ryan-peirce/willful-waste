# Load Generator Dockerfile

FROM python:3.11-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S appuser && adduser -u 1001 -S appuser -G appuser

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY generator.py .

# Make script executable
RUN chmod +x generator.py

# Change ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Run the load generator
CMD ["python", "generator.py"]
