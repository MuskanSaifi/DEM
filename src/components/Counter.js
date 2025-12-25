import { useEffect, useState } from 'react';

const SmoothCounter = ({ end, duration }) => {
  const [count, setCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = timestamp - startTimestamp;
      const progressRatio = Math.min(progress / (duration * 1000), 1);
      const current = Math.floor(progressRatio * end);
      setCount(current);
      if (progress < duration * 1000) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end); // make sure it ends exactly at `end`
      }
    };

    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count.toLocaleString('en-IN')}</span>;
};

export default SmoothCounter;
