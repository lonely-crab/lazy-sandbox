"""Pytest fixtures: in-memory SQLite shared with the FastAPI app."""

import os

# Ensure tests use an isolated in-memory DB before any app modules import settings/engine.
os.environ["DATABASE_URL"] = "sqlite:///:memory:/"

import pytest
from app.database import Base, engine
from app.main import app
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
