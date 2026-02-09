type MasonryProps = {
  children: React.ReactNode;
};

export default function Masonry({ children }: MasonryProps) {
  return (
    <div
      className="
        columns-1
        md:columns-2
        gap-4
      "
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div key={i} className="mb-4 break-inside-avoid">
              {child}
            </div>
          ))
        : children}
    </div>
  );
}
