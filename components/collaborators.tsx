import React from "react";

const Collaborators = ({ names }: { names: string[] }) => {
  return (
    <div>
      <div>
        Collaborators{" "}
        <span className="bg-accent py-1 px-2 rounded-xl text-sm text-accent-foreground">
          {names.length}
        </span>
      </div>

      <div className="flex gap-3 flex-wrap pt-2">
        {names.map((name, index) => (
          <div key={index} className="bg-card py-1 px-3 text-sm rounded-lg ">
            {name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collaborators;
