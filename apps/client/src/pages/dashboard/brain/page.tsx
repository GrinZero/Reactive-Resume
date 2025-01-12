import { t } from "@lingui/macro";
import { ScrollArea } from "@reactive-resume/ui";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

import { GridView } from "./_layouts/grid";

export const BrainPage = () => {
  return (
    <>
      <Helmet>
        <title>
          {t`Brain`} - {t`Reactive Resume`}
        </title>
      </Helmet>

      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold tracking-tight"
        >
          {t`Brain`}
        </motion.h1>
      </div>

      <ScrollArea className="h-[calc(100vh-140px)] space-y-4 lg:h-[calc(100vh-88px)]">
        <GridView />
      </ScrollArea>
    </>
  );
};
