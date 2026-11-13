import { useCallback, useMemo, useState } from "react";
import AddJobDialog from "../components/addjob/AddJobDialog";
import AddJobContext from "./AddJobContext";

export default function AddJobProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const openAddJob = useCallback(() => setIsOpen(true), []);
  const closeAddJob = useCallback(() => setIsOpen(false), []);
  const value = useMemo(
    () => ({ isOpen, openAddJob, closeAddJob }),
    [isOpen, openAddJob, closeAddJob],
  );

  return (
    <AddJobContext.Provider value={value}>
      {children}
      {/* Mounted only while open, so the form starts fresh every time. */}
      {isOpen && <AddJobDialog onClose={closeAddJob} />}
    </AddJobContext.Provider>
  );
}