const Loading = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background gap-5">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border border-border" />
        <div className="absolute inset-0 rounded-full border border-transparent border-t-primary animate-spin" />
      </div>
      <span className="text-[0.65rem] tracking-[0.4em] text-muted-foreground uppercase">
        Travis
      </span>
    </div>
  );
};

export default Loading;
