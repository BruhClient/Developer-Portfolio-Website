const CheckText = ({ text }: { text: string }) => {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-primary shrink-0">+</span>
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
};

export default CheckText;
