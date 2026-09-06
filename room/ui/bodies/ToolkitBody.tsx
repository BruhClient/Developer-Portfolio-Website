export function ToolkitBody({ rows }: { rows: string[][] }) {
  return (
    <div className="space-y-4">
      {rows.map((row, index) => (
        <ul key={index} className="flex flex-wrap gap-1.5">
          {row.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-amber-200/20 px-2.5 py-1 text-xs text-amber-100/80"
            >
              {tech}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
