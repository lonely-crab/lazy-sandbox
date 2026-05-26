from datetime import datetime

from sqlalchemy import Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database import Base


class Benchmark(Base):
    """Stored template rendering benchmark row."""

    __tablename__ = "benchmarks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    template_engine: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    render_time_ms: Mapped[float] = mapped_column(Float, nullable=False)
    payload: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        nullable=False,
        index=True,
    )
