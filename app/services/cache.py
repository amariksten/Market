from __future__ import annotations

from cachetools import TTLCache
from threading import RLock
from typing import Any, Hashable


class SimpleTTLCache:
    """Small thread-safe TTL cache for normalized API responses."""

    def __init__(self, maxsize: int = 512, ttl: int = 60) -> None:
        self._cache: TTLCache[Hashable, Any] = TTLCache(maxsize=maxsize, ttl=ttl)
        self._lock = RLock()

    def get(self, key: Hashable) -> Any | None:
        with self._lock:
            return self._cache.get(key)

    def set(self, key: Hashable, value: Any) -> Any:
        with self._lock:
            self._cache[key] = value
            return value

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()
