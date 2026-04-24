"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type ListPaginationProps = {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export default function ListPagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
}: ListPaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col justify-between gap-4 border-t border-[#d8dee6] bg-[#f7f4ef] px-5 py-4 sm:flex-row sm:items-center">
      <p className="text-[11px] font-bold text-[#64748b]/70 uppercase tracking-widest">
        Showing {start}-{end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-[#d8dee6] bg-white text-[#263238] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#f59e0b] transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-20 text-center text-[11px] font-black text-[#263238] uppercase tracking-widest">
          {page} / {pageCount}
        </span>
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-[#d8dee6] bg-white text-[#263238] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#f59e0b] transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
