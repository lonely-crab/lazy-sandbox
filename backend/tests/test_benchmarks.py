from fastapi.testclient import TestClient


def test_get_benchmarks_empty(client: TestClient) -> None:
    response = client.get("/benchmarks")
    assert response.status_code == 200
    assert response.json() == []


def test_post_benchmark_valid(client: TestClient) -> None:
    payload = {"template_engine": "jinja2", "render_time_ms": 12.4, "payload": '{"n": 1}'}
    response = client.post("/benchmarks", json=payload)
    assert response.status_code == 201
    body = response.json()
    assert body["template_engine"] == "jinja2"
    assert body["render_time_ms"] == 12.4
    assert body["payload"] == '{"n": 1}'
    assert "id" in body
    assert "created_at" in body


def test_post_benchmark_without_payload(client: TestClient) -> None:
    response = client.post(
        "/benchmarks",
        json={"template_engine": "mako", "render_time_ms": 0.0},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["template_engine"] == "mako"
    assert body["render_time_ms"] == 0.0
    assert body["payload"] is None


def test_post_benchmark_negative_time_returns_422(client: TestClient) -> None:
    response = client.post(
        "/benchmarks",
        json={"template_engine": "jinja2", "render_time_ms": -1.0},
    )
    assert response.status_code == 422


def test_post_benchmark_empty_engine_returns_422(client: TestClient) -> None:
    response = client.post(
        "/benchmarks",
        json={"template_engine": "", "render_time_ms": 1.0},
    )
    assert response.status_code == 422


def test_list_benchmarks_sorted_newest_first(client: TestClient) -> None:
    for name in ("first", "second", "third"):
        r = client.post(
            "/benchmarks",
            json={"template_engine": name, "render_time_ms": 1.0},
        )
        assert r.status_code == 201

    response = client.get("/benchmarks")
    assert response.status_code == 200
    engines = [row["template_engine"] for row in response.json()]
    assert engines == ["third", "second", "first"]


def test_filter_by_engine(client: TestClient) -> None:
    client.post("/benchmarks", json={"template_engine": "jinja2", "render_time_ms": 1.0})
    client.post("/benchmarks", json={"template_engine": "mako", "render_time_ms": 2.0})

    response = client.get("/benchmarks", params={"engine": "jinja2"})
    assert response.status_code == 200
    rows = response.json()
    assert len(rows) == 1
    assert rows[0]["template_engine"] == "jinja2"


def test_pagination_limit_offset(client: TestClient) -> None:
    for i in range(3):
        client.post(
            "/benchmarks",
            json={"template_engine": "jinja2", "render_time_ms": float(i)},
        )

    response = client.get("/benchmarks", params={"limit": 2, "offset": 1})
    assert response.status_code == 200
    rows = response.json()
    assert len(rows) == 2
    # Newest first: ids order 3, 2, 1 -> offset 1 -> rows 2 and 1
    assert rows[0]["render_time_ms"] == 1.0
    assert rows[1]["render_time_ms"] == 0.0
