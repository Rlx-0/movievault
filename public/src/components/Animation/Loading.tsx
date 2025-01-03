import { Variants, motion } from "framer-motion";

interface LoadingProps {
  size?: "small" | "default";
}

const Loading = ({ size = "default" }: LoadingProps) => {
  return (
    <div
      className={`grid place-content-center bg-transparent px-4 ${
        size === "default" ? "py-24" : "py-0"
      } w-full h-full`}
    >
      <Barloader size={size} />
    </div>
  );
};

const variants = {
  initial: {
    scaleY: 0.5,
    opacity: 0,
  },
  animate: {
    scaleY: 1,
    opacity: 1,
    transition: {
      repeat: Infinity,
      repeatType: "mirror",
      duration: 1,
      ease: "circIn",
    },
  },
} as Variants;

const Barloader = ({ size = "default" }: LoadingProps) => {
  const barHeight = size === "default" ? "h-12" : "h-4";
  const barWidth = size === "default" ? "w-2" : "w-1";

  return (
    <motion.div
      transition={{
        staggerChildren: 0.25,
      }}
      initial="initial"
      animate="animate"
      className="flex gap-1"
    >
      <motion.div
        variants={variants}
        className={`${barHeight} ${barWidth} bg-white`}
      />
      <motion.div
        variants={variants}
        className={`${barHeight} ${barWidth} bg-white`}
      />
      <motion.div
        variants={variants}
        className={`${barHeight} ${barWidth} bg-white`}
      />
      <motion.div
        variants={variants}
        className={`${barHeight} ${barWidth} bg-white`}
      />
      <motion.div
        variants={variants}
        className={`${barHeight} ${barWidth} bg-white`}
      />
    </motion.div>
  );
};

export default Loading;
