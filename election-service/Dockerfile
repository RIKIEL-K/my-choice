FROM python:3.11-slim

WORKDIR /app

RUN apt-get update --yes \
    && apt-get install -y curl g++ \
    && rm -rf /var/lib/apt/lists/*

RUN curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/root/.local/bin" sh
ENV PATH="/root/.local/bin:$PATH"

COPY pyproject.toml .s
COPY . .

RUN uv python install 3.11.11 \
    && uv venv --python 3.11.11 \
    && uv pip install . \
    && uv pip install --group dev

EXPOSE 8001

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
