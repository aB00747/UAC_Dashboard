import { useState } from 'react';

export function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  function next() {
    if (page < totalPages) setPage((p) => p + 1);
  }

  function prev() {
    if (page > 1) setPage((p) => p - 1);
  }

  function reset() {
    setPage(1);
  }

  return { page, totalPages, setPage, setTotalPages, next, prev, reset };
}
