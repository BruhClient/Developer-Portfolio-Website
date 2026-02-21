import React from "react";

const SectionTitle = ({ title }: { title: string }) => {
  return <div className="text-lg text-primary">{`< ${title} /> `}</div>;
};

export default SectionTitle;
