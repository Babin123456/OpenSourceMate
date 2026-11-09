# Backend Static Type Checking with Mypy and CI Integration

## Overview
This document specifies the static typing architecture and strictness strategy implemented for OpenSourceMate's backend Python codebase (Issue #173).

## Goals
- Add explicit type annotations across GitHub integration, issue search, skill analysis, and matching services.
- Enforce automated type-checking in local development and continuous integration (`.github/workflows/ci.yml`).
- Adopt a gradual strictness policy that prevents runtime regressions and syntax ambiguities while accommodating untyped external packages.

## Annotated Modules
The following core modules have been fully annotated and verified with mypy:
1. `backend/app/services/github_service.py`:
   - Outgoing GitHub HTTP client requests, retry loops, timeouts, link headers, and repository detail parsers.
2. `backend/app/services/skill_service.py`:
   - Skill aggregation counters, ecosystem grouping maps, noise filtering, and proficiency calculations.
3. `backend/app/services/matching_service.py`:
   - TF-IDF document frequency algorithms, tokenizers, keyword scoring, and metadata annotations.
4. `backend/app/services/issue_service.py`:
   - Search parameters, query builder arrays, and issue item serializers.
5. `backend/app/api/routes/matching.py`:
   - Typed dictionaries for recommendation deduplication.
6. `backend/app/main.py` & `backend/app/middleware/rate_limit.py`:
   - Clean types for Starlette middleware and FastAPI app options.

## Configuration: `backend/mypy.ini`
The configuration specifies:
- Target Python version: `3.12`.
- Plugins: `pydantic.mypy` for strong schema and settings validation.
- Warnings:
  - `warn_unused_configs = True`: Flags outdated configuration entries.
  - `warn_redundant_casts = True`: Prevents unnecessary `cast()` expressions.
  - `warn_unused_ignores = True`: Keeps ignore directives clean as typing matures.
  - `check_untyped_defs = True`: Analyzes function bodies even if not all parameters have type annotations.
  - `ignore_missing_imports = True`: Gracefully ignores third-party packages lacking PEP 561 stubs (such as `sentence-transformers`).

## CI Integration
In `.github/workflows/ci.yml`:
```yaml
- name: Type check with mypy
  run: mypy app --config-file mypy.ini
```
All pull requests touching `backend/` must pass clean `mypy` evaluation prior to merging.

## Local Execution
To run the type checker locally from the repository root:
```bash
cd backend
mypy app --config-file mypy.ini
```
Or within the virtual environment:
```bash
backend/.venv/Scripts/python -m mypy app --config-file mypy.ini
```

## Unit Test Coverage
Dedicated test contracts verify runtime conformance to type signatures:
- `backend/tests/test_type_hints_contracts.py`
- `backend/tests/test_matching_and_skill_typing.py`
- `backend/tests/test_github_service_typing.py`
- `backend/tests/test_config_and_utils_typing.py`

## Developer Workflow and Pre-Commit Integration
Developers are encouraged to run `mypy` before pushing branch commits:
```bash
# Verify type consistency
cd backend
mypy app --config-file mypy.ini

# Run tests
pytest
```
Type violations will fail CI checks automatically on GitHub Actions, preventing regressions from merging into the `main` branch.

### Best Practices for New Backend Contributions
1. **Always specify function parameter and return types**:
   ```python
   def compute_score(value: float, multiplier: int = 1) -> float:
       return value * multiplier
   ```
2. **Use typing primitives from standard library**:
   Prefer `list[str]`, `dict[str, Any]`, and `tuple[int, ...]` (Python 3.9+ built-ins) over `typing.List` or `typing.Dict`.
3. **Use Union syntax `|`**:
   Prefer `str | None` over `Optional[str]`.
4. **Avoid loose `Any`**:
   Only use `Any` when dealing with unconstrained JSON payloads or external dynamic third-party response schemas.
5. **Keep Pydantic serializers strongly typed**:
   Ensure all request and response schemas in `backend/app/schemas` use typed fields with optional defaults.



