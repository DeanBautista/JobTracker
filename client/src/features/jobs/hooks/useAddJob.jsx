import { useContext } from "react";
import AddJobContext from "../context/AddJobContext";

export default function useAddJob() {
  const context = useContext(AddJobContext);
  if (!context) throw new Error("useAddJob must be used inside <AddJobProvider>");
  return context;
}