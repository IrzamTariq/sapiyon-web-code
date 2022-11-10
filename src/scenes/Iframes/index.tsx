import Appshell from "Appshell";
import React from "react";

const Iframes = () => {
  return (
    <Appshell activeLink={["", ""]}>
      <iframe
        src="https://sapiyon.com/kullanim-kilavuzu/"
        title="Sapiyon"
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </Appshell>
  );
};

export default Iframes;
