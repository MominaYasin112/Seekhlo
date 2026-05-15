"""Execute user code in Docker sandbox, with subprocess fallback."""

import subprocess
import tempfile
from pathlib import Path

DOCKER_IMAGE = "seekhlo-code-runner"
TIMEOUT_SEC = 5


def docker_available() -> bool:
    try:
        r = subprocess.run(
            ["docker", "info"],
            capture_output=True,
            timeout=5,
        )
        return r.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def run_python(code: str, stdin: str = "") -> tuple[str | None, str | None]:
    """Run code in Docker if available, else local subprocess."""
    if docker_available():
        return _run_docker(code, stdin)
    return _run_subprocess(code, stdin)


def _run_docker(code: str, stdin: str) -> tuple[str | None, str | None]:
    with tempfile.TemporaryDirectory() as tmp:
        script = Path(tmp) / "solution.py"
        script.write_text(code, encoding="utf-8")
        try:
            proc = subprocess.run(
                [
                    "docker", "run", "--rm", "-i",
                    "--network", "none",
                    "--memory", "128m",
                    "--cpus", "0.5",
                    "-v", f"{tmp}:/code:ro",
                    DOCKER_IMAGE,
                ],
                input=stdin,
                capture_output=True,
                text=True,
                timeout=TIMEOUT_SEC,
            )
            if proc.returncode != 0:
                return None, (proc.stderr or "Runtime error").strip()
            return proc.stdout.strip(), None
        except subprocess.TimeoutExpired:
            return None, "Execution timed out (5s limit)"
        except subprocess.CalledProcessError as e:
            return None, str(e)


def _run_subprocess(code: str, stdin: str) -> tuple[str | None, str | None]:
    with tempfile.TemporaryDirectory() as tmp:
        script = Path(tmp) / "solution.py"
        script.write_text(code, encoding="utf-8")
        try:
            proc = subprocess.run(
                ["python", str(script)],
                input=stdin,
                capture_output=True,
                text=True,
                timeout=TIMEOUT_SEC,
                cwd=tmp,
            )
            if proc.returncode != 0:
                return None, (proc.stderr or "Runtime error").strip()
            return proc.stdout.strip(), None
        except subprocess.TimeoutExpired:
            return None, "Execution timed out (5s limit)"
        except FileNotFoundError:
            return None, "Python not found. Install Python or Docker."
