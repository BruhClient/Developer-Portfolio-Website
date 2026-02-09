import React from "react";

const Techs = ({ techs }: { techs: string[] }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <div>
        <div>
          Technologies{" "}
          <span className="bg-secondary py-1 px-2 rounded-xl text-sm text-secondary-foreground">
            {techs.length}
          </span>
        </div>

        <div className="flex gap-3 flex-wrap pt-2">
          {techs.map((name, index) => (
            <div key={index} className="bg-card py-1 px-3 text-sm rounded-lg ">
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Techs;
