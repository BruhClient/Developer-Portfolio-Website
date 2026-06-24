const Techs = ({ techs }: { techs: string[] }) => {
  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">
        Technologies ({techs.length})
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {techs.map((name, index) => (
          <span
            key={index}
            className="text-xs px-2 py-0.5 border border-primary/30 text-primary rounded"
          >
            [{name}]
          </span>
        ))}
      </div>
    </div>
  );
};

export default Techs;
