const Collaborators = ({ names }: { names: string[] }) => {
  if (names.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">
        Collaborators ({names.length})
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {names.map((name, index) => (
          <span
            key={index}
            className="text-xs px-2 py-0.5 border border-border text-foreground rounded"
          >
            [{name}]
          </span>
        ))}
      </div>
    </div>
  );
};

export default Collaborators;
