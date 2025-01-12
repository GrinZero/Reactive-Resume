import { AnimatePresence, motion } from "framer-motion";

import { useBrain } from "@/client/services/resume";

import { BaseCard } from "./_components/base-card";
import { CreateBrainCard } from "./_components/create-card";
import { ImportResumeCard } from "./_components/import-card";
import { ResumeCard } from "./_components/resume-card";

export const GridView = () => {
  const { brain, loading } = useBrain();

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {!brain && (
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
          <CreateBrainCard />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
      >
        <ImportResumeCard />
      </motion.div>

      {loading &&
        Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="duration-300 animate-in fade-in"
            style={{ animationFillMode: "backwards", animationDelay: `${i * 300}ms` }}
          >
            <BaseCard />
          </div>
        ))}

      {brain && (
        <AnimatePresence>
          <motion.div
            key={brain.id}
            layout
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0, transition: { delay: (0 + 2) * 0.1 } }}
            exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.5 } }}
          >
            <ResumeCard resume={brain} />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
