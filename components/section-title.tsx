import React from "react";

const SectionTitle = ({ title }: { title: string }) => {
  return (
    <div className="text-lg text-primary" id={title}>{`< ${title} /> `}</div>
  );
};

export default SectionTitle;
