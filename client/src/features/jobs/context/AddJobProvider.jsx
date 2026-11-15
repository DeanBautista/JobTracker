import { useCallback, useMemo, useState } from "react";
import AddJobDialog from "../components/addjob/AddJobDialog";
import AddJobContext from "./AddJobContext";

export default function AddJobProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const openAddJob = useCallback(() => setIsOpen(true), []);
  const closeAddJob = useCallback(() => setIsOpen(false), []);
  const [jobsVersion, setJobsVersion] = useState(0);
  const notifyJobAdded = useCallback(() => setJobsVersion((v) => v + 1), []);
  const value = useMemo(
    () => ({ isOpen, openAddJob, closeAddJob, jobsVersion }),
    [isOpen, openAddJob, closeAddJob, jobsVersion],
  );

  return (
    <AddJobContext.Provider value={value}>
      {children}
      {/* Mounted only while open, so the form starts fresh every time. */}
      {isOpen && <AddJobDialog onClose={closeAddJob} onCreated={notifyJobAdded} />}
    </AddJobContext.Provider>
  );
}