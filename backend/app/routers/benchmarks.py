from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.crud import create_benchmark, list_benchmarks
from app.database import get_db
from app.schemas import BenchmarkCreate, BenchmarkRead

router = APIRouter(tags=["benchmarks"])


@router.post(
    "/benchmarks",
    response_model=BenchmarkRead,
    status_code=status.HTTP_201_CREATED,
    summary="Store benchmark result",
)
def post_benchmark(body: BenchmarkCreate, db: Session = Depends(get_db)) -> BenchmarkRead:
    row = create_benchmark(db, body)
    return BenchmarkRead.model_validate(row)


@router.get(
    "/benchmarks",
    response_model=list[BenchmarkRead],
    summary="List benchmark history",
)
def get_benchmarks(
    db: Session = Depends(get_db),
    engine: str | None = Query(
        default=None,
        description="Filter by template_engine",
        examples=["jinja2"],
    ),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> list[BenchmarkRead]:
    rows = list_benchmarks(db, engine=engine, limit=limit, offset=offset)
    return [BenchmarkRead.model_validate(r) for r in rows]
