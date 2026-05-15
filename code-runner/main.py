"""Seekh Lo Code Runner — Docker-sandboxed execution for coding challenges."""

import textwrap

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from runner import docker_available, run_python

app = FastAPI(title="Seekh Lo Code Runner", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TestCase(BaseModel):
    input: str = ""
    expected: str


class RunRequest(BaseModel):
    code: str
    language: str = "python"
    test_cases: list[TestCase]
    challenge_id: str = ""


class TestResult(BaseModel):
    passed: bool
    input: str
    expected: str
    actual: str | None = None
    error: str | None = None


class RunResponse(BaseModel):
    results: list[TestResult]
    all_passed: bool
    sandbox: str  # "docker" or "subprocess"


def wrap_factorial_challenge(user_code: str) -> str:
    return textwrap.dedent(f"""
{user_code}

if __name__ == "__main__":
    import sys
    n = int(sys.stdin.read().strip() or "0")
    print(factorial(n))
""")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "code-runner",
        "docker": docker_available(),
    }


@app.post("/run", response_model=RunResponse)
def run_tests(body: RunRequest):
    sandbox = "docker" if docker_available() else "subprocess"
    results: list[TestResult] = []

    for tc in body.test_cases:
        wrapped = wrap_factorial_challenge(body.code) if "factorial" in body.code else body.code
        actual, error = run_python(wrapped, tc.input)
        passed = error is None and actual == tc.expected.strip()
        results.append(
            TestResult(
                passed=passed,
                input=tc.input,
                expected=tc.expected,
                actual=actual,
                error=error,
            )
        )

    return RunResponse(
        results=results,
        all_passed=all(r.passed for r in results),
        sandbox=sandbox,
    )


class DraftRequest(BaseModel):
    challenge_id: str
    code: str
    user_id: str = ""


@app.post("/draft")
def save_draft(body: DraftRequest):
    return {"saved": True, "challenge_id": body.challenge_id}
