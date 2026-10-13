FROM python:3.11-slim
WORKDIR /app
COPY translation/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir torch==2.8.0 --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt
COPY translation/service.py ./service.py
ENV AI_HOST=0.0.0.0 HF_HOME=/models
EXPOSE 3002
CMD ["python", "service.py"]
