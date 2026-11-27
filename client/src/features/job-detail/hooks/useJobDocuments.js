import { useCallback, useEffect, useRef, useState } from "react";
import useToast from "@/hooks/useToast";
import { api, getApiError } from "@/lib/api";

const FILE_TIMEOUT = 60_000; // uploads and downloads need longer than the 10s default

// With responseType "blob", error bodies arrive as a Blob too. Turn them back into JSON.
async function readBlobError(err) {
  if (err.response?.data instanceof Blob) {
    try {
      err.response.data = JSON.parse(await err.response.data.text());
    } catch {
      // not JSON: getApiError falls back to its generic message
    }
  }
  return getApiError(err);
}

// Loads a job's files and owns upload / attach / update / remove / delete / open.
// Each change returns true on success.
export default function useJobDocuments(jobId, onCountChange) {
  const { show } = useToast();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [data, setData] = useState({ documents: [], library: [] });
  const [attempt, setAttempt] = useState(0);
  const countRef = useRef(onCountChange);

  useEffect(() => {
    countRef.current = onCountChange;
  });

  // Keeps the tab badge in step with the list.
  const commit = useCallback((next) => {
    setData({ documents: next.documents, library: next.library });
    countRef.current?.("documents", next.documents.length);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    api
      .get(`/jobs/${jobId}/documents`)
      .then(({ data }) => {
        if (cancelled) return;
        commit(data);
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [jobId, attempt, commit]);

  const run = async (request, message) => {
    try {
      const { data } = await request();
      commit(data);
      show(message, { duration: 3000 });
      return true;
    } catch (err) {
      const { status: code, message: reason } = getApiError(err);
      show(reason);
      // The list is out of date (another tab changed it), so refresh it quietly.
      if (code === 404 || code === 409) {
        api.get(`/jobs/${jobId}/documents`).then(({ data }) => commit(data)).catch(() => {});
      }
      return false;
    }
  };

  const upload = ({ file, type, label, usedAs, replace, replaceFileId }) => {
    const body = new FormData();
    body.append("type", type);
    body.append("label", label);
    body.append("usedAs", usedAs);
    body.append("replace", String(replace));
    if (replaceFileId) body.append("replaceFileId", replaceFileId);
    body.append("file", file);
    return run(
      () =>
        api.post(`/jobs/${jobId}/documents`, body, {
          // Overrides the JSON default. Axios lets the browser add the boundary.
          headers: { "Content-Type": "multipart/form-data" },
          timeout: FILE_TIMEOUT,
        }),
      "File uploaded.",
    );
  };

  const attach = (payload) => run(() => api.post(`/jobs/${jobId}/documents/attach`, payload), "File attached.");

  const update = (fileId, details) =>
    run(() => api.patch(`/jobs/${jobId}/documents/${fileId}`, details), "File details saved.");

  const remove = (fileId) => run(() => api.delete(`/jobs/${jobId}/documents/${fileId}`), "File removed from this job.");

  const deleteFile = (fileId) =>
    run(() => api.delete(`/jobs/${jobId}/documents/library/${fileId}`), "Removed from your library.");

  const fetchBlob = (fileId) =>
    api.get(`/jobs/${jobId}/documents/${fileId}/file`, { responseType: "blob", timeout: FILE_TIMEOUT });

  const download = async (file) => {
    try {
      const { data: blob } = await fetchBlob(file.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      show((await readBlobError(err)).message);
    }
  };

  const preview = async (file) => {
    // Opened during the click, otherwise the browser blocks it as a pop-up.
    const tab = window.open("", "_blank");
    if (!tab) return show("Your browser blocked the preview. Allow pop-ups or use Download.");
    tab.opener = null;
    tab.document.title = "Loading preview…";
    try {
      const { data: blob } = await fetchBlob(file.id);
      const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      tab.location.href = url;
      // The URL is kept for 10 minutes so the preview tab has time to use it.
      setTimeout(() => URL.revokeObjectURL(url), 600_000);
    } catch (err) {
      tab.close();
      show((await readBlobError(err)).message);
    }
  };

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { status, ...data, retry, upload, attach, update, remove, deleteFile, download, preview };
}