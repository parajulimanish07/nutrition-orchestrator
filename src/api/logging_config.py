import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Configure standard logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("nutrition_api")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for structured request/response latency logging."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.perf_counter()
        method = request.method
        path = request.url.path
        client_ip = request.client.host if request.client else "unknown"

        try:
            response = await call_next(request)
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.info(
                f"{client_ip} - \"{method} {path}\" {response.status_code} "
                f"completed in {duration_ms:.2f}ms"
            )
            response.headers["X-Process-Time-Ms"] = f"{duration_ms:.2f}"
            return response
        except Exception as exc:
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.error(
                f"{client_ip} - \"{method} {path}\" ERROR after {duration_ms:.2f}ms: {exc}"
            )
            raise exc
