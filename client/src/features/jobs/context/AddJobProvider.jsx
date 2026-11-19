import { useCallback, useMemo, useState } from "react";
import AddJobDialog from "../components/addjob/AddJobDialog";
import AddJobContext from "./AddJobContext";

export default function AddJobProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialStage, setInitialStage] = useState("wishlist");
  const [jobsVersion, setJobsVersion] = useState(0);

  // openAddJob({ stage }) presets the Stage field. Called with nothing (or with a click
  // event, which has no `stage`), it falls back to Wishlist.
  const openAddJob = useCallback((options) => {
    setInitialStage(options?.stage ?? "wishlist");
    setIsOpen(true);
  }, []);
  const closeAddJob = useCallback(() => setIsOpen(false), []);
  const notifyJobAdded = useCallback(() => setJobsVersion((v) => v + 1), []);

  const value = useMemo(
    () => ({ isOpen, openAddJob, closeAddJob, jobsVersion }),
    [isOpen, openAddJob, closeAddJob, jobsVersion],
  );

  return (
    <AddJobContext.Provider value={value}>
      {children}
      {/* Mounted only while open, so the form starts fresh every time. */}
      {isOpen && (
        <AddJobDialog onClose={closeAddJob} onCreated={notifyJobAdded} initialStage={initialStage} />
      )}
    </AddJobContext.Provider>
  );
}