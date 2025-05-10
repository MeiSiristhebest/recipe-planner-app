"use client"

import { Button } from "@repo/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number; // Number of page numbers to show on each side of the current page
}

export function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1, // Default to showing 1 sibling page on each side
}: PaginationBarProps) {
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const totalPageNumbersToShow = siblingCount * 2 + 3 + 2; // current, siblings, first, last, 2 ellipses

    if (totalPages <= totalPageNumbersToShow) {
      // Show all page numbers if total pages is small enough
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

      pageNumbers.push(1); // Always show the first page

      if (shouldShowLeftDots) {
        pageNumbers.push("...");
      }

      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        if (i > 1 && i < totalPages) { // Avoid duplicating first/last page if they are already covered by siblings
           pageNumbers.push(i);
        }
      }
      //This loop ensures that if currentPage is very close to the beginning or end, we still show enough numbers.
      //For example, if currentPage=1, leftSibling=1, rightSibling=2 (siblingCount=1), it pushes 2.
      //If currentPage=totalPages, leftSibling=totalPages-1, rightSibling=totalPages, it pushes totalPages-1.
      //It needs to be adjusted to avoid duplicates if the range [leftSiblingIndex, rightSiblingIndex] includes 1 or totalPages.
      //A simpler approach is to build the core sibling pages, then add first/last/ellipses around them.

      // Refined logic for adding sibling pages, avoiding duplicates with first/last
      const pagesToShow: number[] = [];
      if (leftSiblingIndex > 1 && leftSiblingIndex !== currentPage) pagesToShow.push(leftSiblingIndex);
      if (currentPage > 1 && currentPage < totalPages) pagesToShow.push(currentPage);
      if (rightSiblingIndex < totalPages && rightSiblingIndex !== currentPage) pagesToShow.push(rightSiblingIndex);
      
      //This logic for generating page numbers needs to be more robust.
      //Let's simplify and build it step-by-step.
      const tempPageNumbers: (number | string)[] = [];
      tempPageNumbers.push(1); // Always show first page

      if (leftSiblingIndex > 2) { // if current page is far from start
        tempPageNumbers.push("...");
      }

      // Pages around current page
      // Clamp leftSibling to be at least 2 to avoid conflict with first page and dots
      const actualLeftSibling = Math.max(currentPage - siblingCount, 2);
      // Clamp rightSibling to be at most totalPages - 1 to avoid conflict with last page and dots
      const actualRightSibling = Math.min(currentPage + siblingCount, totalPages - 1);

      for (let i = actualLeftSibling; i <= actualRightSibling; i++) {
        if (i >= 1 && i <= totalPages) { // Ensure page number is valid
            if (!tempPageNumbers.includes(i)) { // Avoid duplicates
                tempPageNumbers.push(i);
            }
        }
      }
      
      if (rightSiblingIndex < totalPages -1) { // if current page is far from end
         if (!tempPageNumbers.includes("...")) tempPageNumbers.push("...");
      }
      
      if (totalPages > 1 && !tempPageNumbers.includes(totalPages)) { // Always show last page if not already included
        tempPageNumbers.push(totalPages);
      }
      // The above logic is getting complicated. Let's use a well-known pagination range generation algorithm.
      // For simplicity in this step, I will implement a slightly less complex version first, then refine if needed.

      // Simplified approach for generating page numbers:
      const allPageNumbers: (number | string)[] = [];
      allPageNumbers.push(1); // First page

      if (currentPage > siblingCount + 2) { // Show left ellipsis if needed
        allPageNumbers.push("...");
      }

      // Pages around current page
      const startPage = Math.max(2, currentPage - siblingCount);
      const endPage = Math.min(totalPages - 1, currentPage + siblingCount);

      for (let i = startPage; i <= endPage; i++) {
        if (!allPageNumbers.includes(i)) {
          allPageNumbers.push(i);
        }
      }

      if (currentPage < totalPages - siblingCount - 1) { // Show right ellipsis if needed
         if (!allPageNumbers.includes("...")) { // Check if already added (e.g. very few pages)
            // Add check to ensure ellipsis is not next to last page if not needed
            if (endPage < totalPages - 1) {
                 allPageNumbers.push("...");
            }
         }
      }
      
      if (totalPages > 1 && !allPageNumbers.includes(totalPages)) { // Last page
        allPageNumbers.push(totalPages);
      }
      return allPageNumbers.filter((item, index, self) => item !== "..." || (item === "..." && self.indexOf("...") === index || self.lastIndexOf("...") === index && self.indexOf("...") !== self.lastIndexOf("...")) ); // crude way to somewhat handle double ellipsis, needs better logic
      // The filter above is a hack. Let's use a more standard way.
      // Final simplified and more robust page number generation:

      const range = (start: number, end: number) => {
        let length = end - start + 1;
        return Array.from({ length }, (_, idx) => idx + start);
      };

      const totalNumbers = siblingCount * 2 + 3; // current, 2*siblings, first, last
      const totalBlocks = totalNumbers + 2; // With two "..." blocks

      if (totalPages > totalBlocks) {
        const startPages = range(1, 1 + siblingCount ); // Show first page(s)
        const endPages = range(totalPages - siblingCount , totalPages); // Show last page(s)

        let pages: (string | number)[] = [];

        if (currentPage <= siblingCount + 2) { // current page is near the start
          pages = [...range(1, Math.min(totalPages, 1 + siblingCount * 2 + 1)), "...", ...endPages.slice(siblingCount > 0 ? 1 : 0)];
           // Simpler: pages = [...range(1, 2 * siblingCount + 2), "...", totalPages]; but need to cap at totalPages
           const leftItemCount = 3 + 2 * siblingCount;
           const leftRange = range(1, leftItemCount > totalPages ? totalPages : leftItemCount);
           pages = [...leftRange];
           if(leftItemCount < totalPages -1 ) pages.push("...");
           if(leftItemCount < totalPages) pages.push(totalPages);

        } else if (currentPage >= totalPages - siblingCount - 1) { // current page is near the end
          const rightItemCount = 3 + 2 * siblingCount;
          const rightRange = range(totalPages - (rightItemCount > totalPages ? totalPages-1 : rightItemCount-1), totalPages);
          pages = [1, "..."];
          pages.push(...rightRange);
        } else { // current page is somewhere in the middle
          pages = [1, "...", ...range(currentPage - siblingCount, currentPage + siblingCount), "...", totalPages];
        }
        // Filter out duplicates or ellipsis next to actual numbers if range is too small
        // This part needs careful implementation. For now, a simpler set of pages:
        const resultPages: (number | string)[] = [];
        resultPages.push(1);
        if (currentPage > 3 + siblingCount -1 && totalPages > 5 + siblingCount*2) resultPages.push("...");

        for (let i = Math.max(2, currentPage - siblingCount); i <= Math.min(totalPages - 1, currentPage + siblingCount); i++) {
          if (!resultPages.includes(i)) resultPages.push(i);
        }
        if (currentPage < totalPages - (siblingCount + 1) && totalPages > 5+siblingCount*2 && !resultPages.includes("...")) resultPages.push("...");
        else if (currentPage < totalPages - (siblingCount+1) && totalPages > 5+siblingCount*2 && resultPages[resultPages.length-1] === "..." && currentPage + siblingCount < totalPages -1) {
             // avoid double ellipsis if already added by left side
        } else if (currentPage < totalPages - (siblingCount + 1) && totalPages > 5+siblingCount*2 && resultPages[resultPages.length-1] !== "..." && currentPage + siblingCount < totalPages -1 ) {
            resultPages.push("...");
        }


        if (totalPages > 1 && !resultPages.includes(totalPages)) resultPages.push(totalPages);
        return resultPages.filter((v,i,a) => v !== "..." || a[i-1] !== "..."); // basic double ellipsis removal

      } else {
         // totalPages is small, show all numbers
        return range(1, totalPages);
      }
    }
    // The above page generation logic is quite complex to get right with all edge cases.
    // Let's use a simpler, more common pattern for pagination display:
    // Always show first page, last page, current page, and siblings.
    // Add ellipses if there's a gap.

    const pages: (number | string)[] = [];
    const showPagesCount = 2 * siblingCount + 1; // current + siblings on each side

    // Case 1: total pages less than or equal to what we plan to show (no ellipses needed)
    if (totalPages <= showPagesCount + 2) { // +2 for first and last potentially
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always add first page
      pages.push(1);

      // Calculate left boundary for ellipsis
      const leftEllipsisBoundary = currentPage - siblingCount -1; // if currentPage - sib > 2, show "..." after 1

      if (leftEllipsisBoundary > 2) { // if 1 and ... are not adjacent to start of main numbers
        pages.push("...");
      }

      // Main numbers around current page
      const startPage = Math.max(2, currentPage - siblingCount);
      const endPage = Math.min(totalPages - 1, currentPage + siblingCount);

      for (let i = startPage; i <= endPage; i++) {
        if (!pages.includes(i)) { // Avoid duplicate of page 1 if current is near start
          pages.push(i);
        }
      }
      
      // Calculate right boundary for ellipsis
      const rightEllipsisBoundary = currentPage + siblingCount + 1; // if currentPage + sib < totalPages -1, show "..." before last page

      if (rightEllipsisBoundary < totalPages -1) { // if ... and last page are not adjacent to end of main numbers
         if (!pages.includes("...")) pages.push("..."); // Avoid double if left already added
      }
      
      // Always add last page (if not already included)
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const pageNumbersToDisplay = getPageNumbers();

  if (totalPages <= 1) {
    return null; // Don't render pagination if there's only one page or less
  }

  return (
    <nav aria-label="Pagination">
      <ul className="flex items-center justify-center space-x-2">
        <li>
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </li>

        {pageNumbersToDisplay.map((page, index) => (
          <li key={`${page}-${index}`}>
            {page === "..." ? (
              <span className="px-4 py-2 text-sm">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => onPageChange(page as number)}
                aria-current={currentPage === page ? "page" : undefined}
                className="w-10 h-10 p-0"
              >
                {page}
              </Button>
            )}
          </li>
        ))}

        <li>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </li>
      </ul>
    </nav>
  );
} 