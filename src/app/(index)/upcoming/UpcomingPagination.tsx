import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface UpcomingPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function UpcomingPagination({
  currentPage,
  totalPages,
  onPageChange,
}: UpcomingPaginationProps) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(currentPage - 1)}
            className={
              currentPage === 1
                ? 'pointer-events-none opacity-50'
                : 'cursor-pointer'
            }
          />
        </PaginationItem>

        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let page: number
          if (totalPages <= 5) {
            page = i + 1
          } else if (currentPage <= 3) {
            page = i + 1
          } else if (currentPage >= totalPages - 2) {
            page = totalPages - 4 + i
          } else {
            page = currentPage - 2 + i
          }

          return (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                className='cursor-pointer'
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        {totalPages > 5 && currentPage < totalPages - 2 && (
          <PaginationItem>
            <span className='px-4 py-2'>...</span>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(currentPage + 1)}
            className={
              currentPage === totalPages
                ? 'pointer-events-none opacity-50'
                : 'cursor-pointer'
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
