from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Benchmark
from app.schemas import BenchmarkCreate


def create_benchmark(db: Session, data: BenchmarkCreate) -> Benchmark:
    row = Benchmark(
        template_engine=data.template_engine,
        render_time_ms=data.render_time_ms,
        payload=data.payload,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def list_benchmarks(
    db: Session,
    *,
    engine: str | None,
    limit: int,
    offset: int,
) -> list[Benchmark]:
    stmt = select(Benchmark).order_by(Benchmark.created_at.desc(), Benchmark.id.desc())
    if engine is not None:
        stmt = stmt.where(Benchmark.template_engine == engine)
    stmt = stmt.offset(offset).limit(limit)
    return list(db.scalars(stmt).all())
