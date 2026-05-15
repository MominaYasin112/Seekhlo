# Sandboxed Python runner image (no network, minimal attack surface)
FROM python:3.11-slim
WORKDIR /code
RUN useradd -m -u 1000 runner && chown -R runner:runner /code
USER runner
ENTRYPOINT ["python", "/code/solution.py"]
