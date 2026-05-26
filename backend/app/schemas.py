from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BenchmarkCreate(BaseModel):
    """Payload for creating a benchmark record."""

    template_engine: str = Field(
        ...,
        min_length=1,
        max_length=64,
        examples=["jinja2"],
        description="Name of the templating engine",
    )
    render_time_ms: float = Field(
        ...,
        ge=0,
        examples=[12.4],
        description="Measured render time in milliseconds",
    )
    payload: str | None = Field(
        default=None,
        max_length=10_000,
        examples=['{"items": [1, 2, 3]}'],
        description="Optional input payload used for rendering (JSON string or text)",
    )


class BenchmarkRead(BenchmarkCreate):
    """Benchmark row returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., examples=[1])
    created_at: datetime = Field(..., examples=["2025-05-04T12:00:00"])
