import React from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { Typography } from "@mui/material";

const ViewCounter = ({count , isPlus}) => {
  const { ref, inView } = useInView({
    threshold: 0.5, // Trigger when 50% of the component is visible
  });

  return (
    <Typography
      variant="h2"
      sx={{
        fontWeight: "bold",
        color: "#DA1B1B",
      }}
      ref={ref} // Attach the ref to the component
    >{isPlus ? "+" : "" }
      <CountUp
        start={0} // Starting value
        end={inView ? count : 0} // Animate to 100 when in view
        duration={2} // Duration of the animation in seconds
        delay={0} // Delay before starting the animation
      >
        {({ countUpRef }) => <span ref={countUpRef} />}
      </CountUp>
    </Typography>
  );
};

export default ViewCounter;
